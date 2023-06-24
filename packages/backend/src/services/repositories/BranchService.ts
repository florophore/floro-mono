import { injectable, inject, multiInject } from "inversify";

import DatabaseConnection from "@floro/database/src/connection/DatabaseConnection";
import ContextFactory from "@floro/database/src/contexts/ContextFactory";
import RepoHelper from "@floro/database/src/contexts/utils/RepoHelper";
import { User } from "@floro/database/src/entities/User";
import RepositoriesContext from "@floro/database/src/contexts/repositories/RepositoriesContext";
import CommitsContext from "@floro/database/src/contexts/repositories/CommitsContext";
import BranchesContext from "@floro/database/src/contexts/repositories/BranchesContext";
import { REPO_REGEX } from "@floro/common-web/src/utils/validators";
import { Organization } from "@floro/database/src/entities/Organization";
import { Repository } from "@floro/database/src/entities/Repository";
import RepoAccessor from "@floro/storage/src/accessors/RepoAccessor";
import {  QueryRunner } from "typeorm";
import ProtectedBranchRulesContext from "@floro/database/src/contexts/repositories/ProtectedBranchRulesContext";
import ProtectedBranchRulesEnabledUserSettingsContext from "@floro/database/src/contexts/repositories/ProtectedBranchRulesEnabledUserSettingsContext";
import ProtectedBranchRulesEnabledRoleSettingsContext from "@floro/database/src/contexts/repositories/ProtectedBranchRulesEnabledRoleSettingsContext";
import IgnoredBranchNotificationsContext from "@floro/database/src/contexts/merge_requests/IgnoredBranchNotificationsContext";
import OrganizationRolesContext from "@floro/database/src/contexts/organizations/OrganizationRolesContext";
import { OrganizationRole } from "@floro/graphql-schemas/build/generated/main-graphql";
import {
  Branch as FloroBranch,
  BRANCH_NAME_REGEX,
  getBranchIdFromName,
} from "floro/dist/src/repo";
import RepoRBACService from "./RepoRBACService";
import RepositoryService from "./RepositoryService";
import UsersContext from "@floro/database/src/contexts/users/UsersContext";
import OrganizationsContext from "@floro/database/src/contexts/organizations/OrganizationsContext";
import BranchPushHandler from "../events/BranchPushEventHandler";

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
  private repoAccessor!: RepoAccessor;
  private repoRBAC!: RepoRBACService;
  private repositoryService!: RepositoryService;
  private branchPushHandlers!: BranchPushHandler[];

  constructor(
    @inject(DatabaseConnection) databaseConnection: DatabaseConnection,
    @inject(ContextFactory) contextFactory: ContextFactory,
    @inject(RepoAccessor) repoAccessor: RepoAccessor,
    @inject(RepoRBACService) repoRBAC: RepoRBACService,
    @inject(RepositoryService) repositoryService: RepositoryService,
    @multiInject("BranchPushHandler") branchPushHandlers: BranchPushHandler[]
  ) {
    this.databaseConnection = databaseConnection;
    this.contextFactory = contextFactory;
    this.repoAccessor = repoAccessor;
    this.repoRBAC = repoRBAC;
    this.repositoryService = repositoryService;
    this.branchPushHandlers = branchPushHandlers;
  }



  // only ever calll this during repo creation
  public async initMainBranch(queryRunner: QueryRunner, repository: Repository, currentUser: User) {

    const branchesContext = await this.contextFactory.createContext(BranchesContext, queryRunner);
    const protectedBranchRulesContext = await this.contextFactory.createContext(ProtectedBranchRulesContext, queryRunner);
    const mainBranch = await branchesContext.create({
        name: "Main",
        branchId: "main",
        createdById: currentUser.id,
        createdByUsername: currentUser.username,
        createdAt: (new Date()).toISOString(),
        organizationId: repository?.organizationId,
        repositoryId: repository?.id
    });
    const branchRule = await protectedBranchRulesContext.create({
        branchId: mainBranch.branchId,
        branchName: mainBranch.name,
        disableDirectPushing: true,
        requireApprovalToMerge: true,
        automaticallyDeleteMergedFeatureBranches: true,
        anyoneCanCreateMergeRequests: true,
        anyoneWithApprovalCanMerge: true,
        anyoneCanMergeMergeRequests: repository.isPrivate && repository.repoType == "user_repo", // by default a private repo user can do anything
        anyoneCanApproveMergeRequests: repository.isPrivate, // limit in public case
        anyoneCanRevert: repository.isPrivate, // limit in public case
        anyoneCanAutofix: repository.isPrivate, // limit in public case
        repositoryId: repository?.id,
    });

    const settingNames = [
        'anyoneCanApproveMergeRequests',
        'anyoneCanRevert',
        'anyoneCanAutofix',
    ]

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
                })
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
            for (const settingName of settingNames) {
                const protectedBranchRulesEnabledRoleSettingsContext =
                await this.contextFactory.createContext(
                    ProtectedBranchRulesEnabledRoleSettingsContext,
                    queryRunner
                );
                await protectedBranchRulesEnabledRoleSettingsContext.create({
                    settingName,
                    protectedBranchRuleId: branchRule.id,
                    roleId: adminRole.id
                })
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
      const canPush = await this.repoRBAC.userHasPermissionToPush(
        repo,
        user,
        branch.id
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
                billingStatus: "delinquent"
              }
            );
          }
        }
        else {
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

      const updatedRepo = await repositoriesContext.updateRepo(repo,  {
        lastRepoUpdateAt: (new Date()).toISOString()
      });

      const ignoredBranchNotificationsContext = await this.contextFactory.createContext(IgnoredBranchNotificationsContext, queryRunner);
      const hasIgnoredBranch =
        await ignoredBranchNotificationsContext.hasIgnoredBranchNotification(
          repo.id,
          user.id,
          branch.id
        );
      if (hasIgnoredBranch) {
        const ignoredBranchNotification = await ignoredBranchNotificationsContext.getIgnoredBranch(
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

      for (const handler of this.branchPushHandlers) {
          await handler.onBranchChanged(queryRunner, updatedRepo, user, pushedBranch);
      }
      await queryRunner.commitTransaction();
      return {
        action: "BRANCH_PUSHED",
        repository: updatedRepo,
        branch: pushedBranch
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
      if (!BRANCH_NAME_REGEX.test(floroBranch?.name ?? "")) {
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
      const remoteBranch = branches?.find((b) => b.branchId == floroBranch?.id);
      if (floroBranch?.baseBranchId) {
        const baseBranch = branches?.find(
          (b) => b.branchId == floroBranch?.baseBranchId
        );
        if (!baseBranch) {
          return null;
        }
      }
      // check commit exists
      if (remoteBranch) {
        const updatedBranch = await branchesContext.updateBranch(remoteBranch, {
          baseBranchId: floroBranch?.baseBranchId ?? undefined,
          lastCommit: floroBranch?.lastCommit ?? undefined,
        });
        await queryRunner.commitTransaction();
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
      });
      return createdBranch;
    } catch (e: any) {
      return null;
    }
  }
}