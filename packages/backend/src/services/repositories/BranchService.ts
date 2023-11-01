import { injectable, inject, multiInject } from "inversify";

import DatabaseConnection from "@floro/database/src/connection/DatabaseConnection";
import ContextFactory from "@floro/database/src/contexts/ContextFactory";
import { User } from "@floro/database/src/entities/User";
import RepositoriesContext from "@floro/database/src/contexts/repositories/RepositoriesContext";
import CommitsContext from "@floro/database/src/contexts/repositories/CommitsContext";
import BranchesContext from "@floro/database/src/contexts/repositories/BranchesContext";
import { Repository } from "@floro/database/src/entities/Repository";
import { QueryRunner } from "typeorm";
import ProtectedBranchRulesContext from "@floro/database/src/contexts/repositories/ProtectedBranchRulesContext";
import ProtectedBranchRulesEnabledUserSettingsContext from "@floro/database/src/contexts/repositories/ProtectedBranchRulesEnabledUserSettingsContext";
import ProtectedBranchRulesEnabledRoleSettingsContext from "@floro/database/src/contexts/repositories/ProtectedBranchRulesEnabledRoleSettingsContext";
import IgnoredBranchNotificationsContext from "@floro/database/src/contexts/merge_requests/IgnoredBranchNotificationsContext";
import OrganizationRolesContext from "@floro/database/src/contexts/organizations/OrganizationRolesContext";
import {
  Branch as FloroBranch,
  BRANCH_NAME_REGEX,
  getBranchIdFromName,
  RemoteSettings,
  getDivergenceOrigin,
  getMergeOriginSha,
  EMPTY_COMMIT_STATE,
  ApplicationKVState,
  canAutoMergeCommitStates,
} from "floro/dist/src/repo";
import RepoRBACService from "./RepoRBACService";
import UsersContext from "@floro/database/src/contexts/users/UsersContext";
import OrganizationsContext from "@floro/database/src/contexts/organizations/OrganizationsContext";
import BranchPushHandler from "../events/BranchPushEventHandler";
import MergeRequestsContext from "@floro/database/src/contexts/merge_requests/MergeRequestsContext";
import RepoDataService from "./RepoDataService";
import { Commit } from "@floro/database/src/entities/Commit";
import RepositoryDatasourceFactoryService from "./RepoDatasourceFactoryService";
import { Branch } from "@floro/database/src/entities/Branch";

export const LICENSE_CODE_LIST = new Set([
  "apache_2",
  "gnu_general_public_3",
  "mit",
  "bsd2_simplified",
  "bsd3_new_or_revised",
  "boost",
  "creative_commons_zero_1_0",
  "eclipse_2",
  "gnu_affero_3",
  "gnu_general_2",
  "gnu_lesser_2_1",
  "mozilla_2",
  "unlicense",
]);

export interface CreateRepositoryReponse {
  action:
    | "REPO_CREATED"
    | "REPO_NAME_TAKEN_ERROR"
    | "INVALID_PARAMS_ERROR"
    | "LOG_ERROR";
  repository?: Repository;
  error?: {
    type: string;
    message: string;
    meta?: unknown;
  };
}

@injectable()
export default class BranchService {
  private databaseConnection!: DatabaseConnection;
  private contextFactory!: ContextFactory;
  private branchPushHandlers!: BranchPushHandler[];
  private repoDataService!: RepoDataService;
  private repoRBACService!: RepoRBACService;
  private repositoryDatasourceFactoryService!: RepositoryDatasourceFactoryService;

  constructor(
    @inject(DatabaseConnection) databaseConnection: DatabaseConnection,
    @inject(ContextFactory) contextFactory: ContextFactory,
    @inject(RepoDataService) repoDataService: RepoDataService,
    @inject(RepoRBACService) repoRBACService: RepoRBACService,
    @inject(RepositoryDatasourceFactoryService)
    repositoryDatasourceFactoryService: RepositoryDatasourceFactoryService,
    @multiInject("BranchPushHandler") branchPushHandlers: BranchPushHandler[]
  ) {
    this.databaseConnection = databaseConnection;
    this.contextFactory = contextFactory;
    this.branchPushHandlers = branchPushHandlers;
    this.repoDataService = repoDataService;
    this.repoRBACService = repoRBACService;
    this.repositoryDatasourceFactoryService =
      repositoryDatasourceFactoryService;
  }

  // only ever calll this during repo creation
  public async initMainBranch(
    queryRunner: QueryRunner,
    repository: Repository,
    currentUser: User
  ) {
    const branchesContext = await this.contextFactory.createContext(
      BranchesContext,
      queryRunner
    );
    const protectedBranchRulesContext = await this.contextFactory.createContext(
      ProtectedBranchRulesContext,
      queryRunner
    );
    const mainBranch = await branchesContext.create({
      name: "Main",
      branchId: "main",
      createdById: currentUser.id,
      createdByUsername: currentUser.username,
      createdAt: new Date().toISOString(),
      organizationId: repository?.organizationId,
      repositoryId: repository?.id,
    });
    const branchRule = await protectedBranchRulesContext.create({
      branchId: mainBranch.branchId,
      branchName: mainBranch.name,
      disableDirectPushing: !(repository.isPrivate && repository.repoType == "user_repo"),
      requireApprovalToMerge: !(repository.isPrivate && repository.repoType == "user_repo"),
      automaticallyDeleteMergedFeatureBranches: true,
      anyoneCanCreateMergeRequests: true,
      anyoneWithApprovalCanMerge: true,
      requireReapprovalOnPushToMerge: true,
      anyoneCanApproveMergeRequests: true,
      anyoneCanRevert: true,
      anyoneCanAutofix: true,
      repositoryId: repository?.id,
    });

    const settingNames = [
      "anyoneCanApproveMergeRequests",
      "anyoneCanRevert",
      "anyoneCanAutofix",
    ];

    if (repository.isPrivate) {
      if (repository.repoType == "user_repo") {
        for (const settingName of settingNames) {
          const protectedBranchRulesEnabledUserSettingsContext =
            await this.contextFactory.createContext(
              ProtectedBranchRulesEnabledUserSettingsContext,
              queryRunner
            );
          await protectedBranchRulesEnabledUserSettingsContext.create({
            settingName,
            protectedBranchRuleId: branchRule.id,
            userId: currentUser.id,
          });
        }
      }

      if (repository.repoType == "org_repo") {
        const organizationRolesContext =
          await this.contextFactory.createContext(
            OrganizationRolesContext,
            queryRunner
          );
        const adminRole =
          await organizationRolesContext.getRoleForOrgByPresetName(
            repository.organizationId,
            "admin"
          );
        const technicalAdminRole =
          await organizationRolesContext.getRoleForOrgByPresetName(
            repository.organizationId,
            "admin"
          );
        const protectedBranchRulesEnabledRoleSettingsContext =
          await this.contextFactory.createContext(
            ProtectedBranchRulesEnabledRoleSettingsContext,
            queryRunner
          );
        for (const settingName of settingNames) {
          await protectedBranchRulesEnabledRoleSettingsContext.create({
            settingName,
            protectedBranchRuleId: branchRule.id,
            roleId: adminRole.id,
          });
        }

        if (technicalAdminRole) {
          for (const settingName of settingNames) {
            await protectedBranchRulesEnabledRoleSettingsContext.create({
              settingName,
              protectedBranchRuleId: branchRule.id,
              roleId: technicalAdminRole.id,
            });
          }
        }
      }
    }
  }

  public async pushBranch(branch: FloroBranch, repoId: string, user: User) {
    const queryRunner = await this.databaseConnection.makeQueryRunner();
    try {
      await queryRunner.startTransaction();
      const repositoriesContext = await this.contextFactory.createContext(
        RepositoriesContext,
        queryRunner
      );
      const repo = await repositoriesContext.getById(repoId);
      if (!repo) {
        await queryRunner.rollbackTransaction();
        return {
          action: "REPO_NOT_FOUND_ERROR",
          error: {
            type: "REPO_NOT_FOUND_ERROR",
            message: "Repo Not Found",
          },
        };
      }
      const canPush = await this.repoRBACService.userHasPermissionToPush(
        repo,
        user,
        branch.id,
        queryRunner
      );
      if (!canPush) {
        await queryRunner.rollbackTransaction();
        return {
          action: "INVALID_PERMISSIONS_ERROR",
          error: {
            type: "INVALID_PERMISSIONS_ERROR",
            message: "Invalid permissions",
          },
        };
      }
      const pushedBranch = await this.updateBranch(
        repo,
        branch,
        user,
        queryRunner
      );
      if (!pushedBranch) {
        await queryRunner.rollbackTransaction();
        return {
          action: "CANT_PUSH_ERROR",
          error: {
            type: "CANT_PUSH_ERROR",
            message: "Cannot push branch",
          },
        };
      }
      if (repo?.isPrivate) {
        if (repo.repoType == "org_repo") {
          const organizationsContext = await this.contextFactory.createContext(
            OrganizationsContext,
            queryRunner
          );
          const organization = await organizationsContext.getById(
            repo.organizationId
          );
          const diskSpaceLimitBytes = parseInt(
            organization?.diskSpaceLimitBytes as unknown as string
          );
          const utilizedDiskSpaceBytes = parseInt(
            organization?.utilizedDiskSpaceBytes as unknown as string
          );

          if (utilizedDiskSpaceBytes > diskSpaceLimitBytes) {
            await organizationsContext.updateOrganizationById(
              organization?.id as string,
              {
                billingStatus: "delinquent",
              }
            );
          }
        } else {
          const usersContext = await this.contextFactory.createContext(
            UsersContext,
            queryRunner
          );
          if (user) {
            const diskSpaceLimitBytes = parseInt(
              user?.diskSpaceLimitBytes as unknown as string
            );
            const utilizedDiskSpaceBytes = parseInt(
              user?.utilizedDiskSpaceBytes as unknown as string
            );
            if (utilizedDiskSpaceBytes > diskSpaceLimitBytes) {
              // MAYBE ADD ONE DAY DO SOMETHING HERE
            }
            await usersContext.updateUser(user, {
              diskSpaceLimitBytes,
              utilizedDiskSpaceBytes,
            });
          }
        }
      }

      const updatedRepo = await repositoriesContext.updateRepo(repo, {
        lastRepoUpdateAt: new Date().toISOString(),
      });

      const ignoredBranchNotificationsContext =
        await this.contextFactory.createContext(
          IgnoredBranchNotificationsContext,
          queryRunner
        );
      const hasIgnoredBranch =
        await ignoredBranchNotificationsContext.hasIgnoredBranchNotification(
          repo.id,
          user.id,
          branch.id
        );
      if (hasIgnoredBranch) {
        const ignoredBranchNotification =
          await ignoredBranchNotificationsContext.getIgnoredBranch(
            repo.id,
            user.id,
            branch.id
          );
        if (ignoredBranchNotification) {
          await ignoredBranchNotificationsContext.updateIgnoredBranchNotification(
            ignoredBranchNotification,
            {
              isDeleted: true,
            }
          );
        }
      }
      await queryRunner.commitTransaction();
      for (const handler of this.branchPushHandlers) {
        await handler.onBranchChanged(updatedRepo, user, pushedBranch);
      }
      return {
        action: "BRANCH_PUSHED",
        repository: updatedRepo,
        branch: pushedBranch,
      };
    } catch (e: any) {
      if (!queryRunner.isReleased) {
        await queryRunner.rollbackTransaction();
      }
      return {
        action: "LOG_ERROR",
        error: {
          type: "UNKNOWN_PUSH_BRANCH_ERROR",
          message: e?.message,
          meta: e,
        },
      };
    } finally {
      if (!queryRunner.isReleased) {
        await queryRunner.release();
      }
    }
  }

  private async updateBranch(
    repository: Repository,
    floroBranch: FloroBranch,
    user: User,
    queryRunner: QueryRunner
  ) {
    try {
      if (
        !BRANCH_NAME_REGEX.test(floroBranch?.name ?? "") &&
        (floroBranch?.name ?? "")?.toLowerCase()?.toLowerCase() !=
          "undefined" &&
        (floroBranch?.id ?? "")?.toLowerCase()?.toLowerCase() != "undefined"
      ) {
        return null;
      }
      const branchesContext = await this.contextFactory.createContext(
        BranchesContext,
        queryRunner
      );
      const commitsContext = await this.contextFactory.createContext(
        CommitsContext,
        queryRunner
      );

      if (floroBranch?.lastCommit) {
        const lastCommit = await commitsContext?.getCommitBySha(
          repository.id,
          floroBranch?.lastCommit
        );
        if (!lastCommit) {
          return null;
        }
      }
      const branches = await branchesContext.getAllByRepoId(repository.id);
      const branchExchange = branches?.map((b) => {
        return {
          id: b.branchId as string,
          name: b.name as string,
          lastCommit: b.lastCommit as string,
          createdBy: b.createdById as string,
          createdByUsername: b.createdByUsername as string,
          createdAt: b.createdAt as string,
          baseBranchId: b?.baseBranchId as string,
        } as FloroBranch;
      });
      const isCyclic = this.repoDataService.testBranchIsCyclic(
        branchExchange,
        floroBranch
      );
      if (isCyclic) {
        return null;
      }

      const remoteBranch = branches?.find((b) => b.branchId == floroBranch?.id);

      const mergeRequestConetxt = await this.contextFactory.createContext(
        MergeRequestsContext,
        queryRunner
      );
      const hasOpenMergeRequest =
        !!remoteBranch?.id &&
        (await mergeRequestConetxt.repoHasOpenRequestOnBranch(
          repository.id,
          remoteBranch?.id
        ));
      if (
        hasOpenMergeRequest &&
        floroBranch?.baseBranchId != remoteBranch?.branchId
      ) {
        return null;
      }
      let baseBranch: Branch|undefined;
      if (floroBranch?.baseBranchId) {
        baseBranch = branches?.find(
          (b) => b.branchId == floroBranch?.baseBranchId
        );
        if (!baseBranch) {
          return null;
        }
      }
      let floroBaseBranch = branchExchange.find(b => b.id == floroBranch?.baseBranchId)

      const commits = await commitsContext.getAllByRepoId(repository.id);
      const { isMerged, isConflictFree } = await this.getConflictState(repository, floroBranch, floroBaseBranch, commits, queryRunner);
      // check commit exists
      if (remoteBranch) {
        const updatedBranch = await branchesContext.updateBranch(remoteBranch, {
          baseBranchId: floroBranch?.baseBranchId ?? undefined,
          lastCommit: floroBranch?.lastCommit ?? undefined,
          isMerged,
          isConflictFree
        });
        return updatedBranch;
      }
      const branchId = getBranchIdFromName(floroBranch?.name);
      const createdBranch = await branchesContext.create({
        branchId: branchId,
        name: floroBranch.name,
        baseBranchId: floroBranch?.baseBranchId ?? undefined,
        lastCommit: floroBranch?.lastCommit ?? undefined,
        createdById: user.id,
        createdByUsername: user.username,
        createdAt: floroBranch.createdAt,
        organizationId: repository?.organizationId,
        repositoryId: repository?.id,
        isMerged,
        isConflictFree
      });
      return createdBranch;
    } catch (e: any) {
      return null;
    }
  }

  public async getOpenBranchesByUser(
    repository: Repository,
    user: User,
    branches: Array<FloroBranch>,
    remoteSettings: RemoteSettings,
    filterIgnored: boolean
  ): Promise<Array<FloroBranch>> {
    const ignoredBranchNotificationsContext =
      await this.contextFactory.createContext(
        IgnoredBranchNotificationsContext
      );
    const mergeRequestsContext = await this.contextFactory.createContext(
      MergeRequestsContext
    );
    const branchesContext = await this.contextFactory.createContext(
      BranchesContext
    );
    const userBranches = branches?.filter((branch) => {
      return branch.createdBy == user.id;
    });

    const openUserBranches: Array<FloroBranch> = [];
    for (const branch of userBranches) {
      if (branch.id == repository.defaultBranchId || !branch?.baseBranchId) {
        continue;
      }
      if (!branch?.lastCommit) {
        continue;
      }
      const baseBranchRule = remoteSettings.branchRules.find(
        (b) => b.branchId == branch.baseBranchId
      );
      if (baseBranchRule && !baseBranchRule?.canCreateMergeRequests) {
        continue;
      }
      if (filterIgnored) {
        const hasIgnoredBranch =
          await ignoredBranchNotificationsContext.hasIgnoredBranchNotification(
            repository.id,
            user.id,
            branch.id
          );
        if (hasIgnoredBranch) {
          continue;
        }
      }
      const branchHasOpenRequest =
        await mergeRequestsContext.repoHasOpenRequestOnBranch(
          repository.id,
          branch.id
        );
      if (branchHasOpenRequest) {
        continue;
      }
      const remoteBranch = await branchesContext.getByRepoAndBranchId(repository.id, branch.id);
      if (remoteBranch?.isMerged) {
        continue;
      }
      openUserBranches.push(branch);
    }
    return openUserBranches.sort((a, b) => {
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });
  }

  public async canDeleteBranch(
    repository: Repository,
    floroBranch: FloroBranch,
    queryRunner?: QueryRunner
  ) {
    if (repository.defaultBranchId == floroBranch.id) {
      return false;
    }

    const mergeRequestsContext = await this.contextFactory.createContext(
      MergeRequestsContext,
      queryRunner
    );
    const branchesContext = await this.contextFactory.createContext(
      BranchesContext,
      queryRunner
    );

    const protectedBranchRulesContext = await this.contextFactory.createContext(
      ProtectedBranchRulesContext,
      queryRunner
    );
    const hasBranchRule =
      await protectedBranchRulesContext.getByRepoAndBranchId(
        repository.id,
        floroBranch.id
      );
    if (hasBranchRule) {
      return false;
    }
    const hasOpenMergeRequest =
      !!floroBranch?.id &&
      (await mergeRequestsContext.repoHasOpenRequestOnBranch(
        repository.id,
        floroBranch?.id
      ));

    if (hasOpenMergeRequest) {
      return false;
    }

    const branches = await branchesContext.getAllByRepoId(repository.id);
    for (const branch of branches) {
      if (branch.baseBranchId == floroBranch.id) {
        return false;
      }
    }
    return true;
  }

  public async deleteBranch(
    repository: Repository,
    floroBranch: FloroBranch,
    queryRunner?: QueryRunner
  ): Promise<Branch|null> {
    const branchesContext = await this.contextFactory.createContext(
      BranchesContext,
      queryRunner
    );
    const remoteBranch = await branchesContext.getByRepoAndBranchId(repository.id, floroBranch.id);
    if (!remoteBranch) {
      return null;
    }
    return await branchesContext.updateBranch(remoteBranch, {
      isDeleted: true
    });
  }

  public async getDataSourceForBaseBranch(
    repository: Repository,
    branch: FloroBranch,
    baseBranch: FloroBranch,
    commits: Commit[],
    queryRunner?: QueryRunner
  ) {
    const pluginList =
      await this.repositoryDatasourceFactoryService.getMergePluginList(
        repository,
        branch,
        commits,
        baseBranch?.lastCommit ?? undefined,
        queryRunner
      );
    return await this.repositoryDatasourceFactoryService.getDatasource(
      repository,
      baseBranch,
      commits,
      pluginList,
      queryRunner
    );
  }

  public async getConflictState(
    repository: Repository,
    floroBranch: FloroBranch,
    baseBranch: FloroBranch|undefined,
    commits: Commit[],
    queryRunner?: QueryRunner
  ): Promise<{isMerged: boolean, isConflictFree: boolean}> {
    if (!baseBranch) {
      return { isMerged: false, isConflictFree: false}
    }
    const datasource = await this.getDataSourceForBaseBranch(
      repository,
      floroBranch,
      baseBranch,
      commits,
      queryRunner
    );
    const divergenceOrigin = await getDivergenceOrigin(
      datasource,
      repository.id,
      baseBranch?.lastCommit ?? undefined,
      floroBranch?.lastCommit ?? undefined
    );
    const divergenceSha: string = getMergeOriginSha(divergenceOrigin) as string;

    const isMerged =
      divergenceOrigin?.rebaseShas?.length == 0 &&
      baseBranch?.lastCommit != null && !!floroBranch?.lastCommit &&
      (divergenceOrigin?.intoLastCommonAncestor == floroBranch?.lastCommit ||
        divergenceOrigin?.trueOrigin == baseBranch?.lastCommit);
    let isConflictFree = isMerged || divergenceSha === baseBranch?.lastCommit;
    if (!isConflictFree) {
      const divergenceState =
        (await datasource.readCommitApplicationState?.(
          repository.id,
          divergenceSha
        )) ?? (EMPTY_COMMIT_STATE as ApplicationKVState);
      const branchState =
        (await datasource.readCommitApplicationState?.(
          repository.id,
          floroBranch?.lastCommit as string
        )) ?? (EMPTY_COMMIT_STATE as ApplicationKVState);
      const baseBranchState =
        (await datasource.readCommitApplicationState?.(
          repository.id,
          baseBranch?.lastCommit as string
        )) ?? (EMPTY_COMMIT_STATE as ApplicationKVState);
      const canAutoMerge = await canAutoMergeCommitStates(
        datasource,
        baseBranchState,
        branchState,
        divergenceState
      );
      if (canAutoMerge) {
        isConflictFree = true;
      }
    }
    return { isMerged, isConflictFree };
  }
}
