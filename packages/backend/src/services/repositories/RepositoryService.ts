import { injectable, inject } from "inversify";

import DatabaseConnection from "@floro/database/src/connection/DatabaseConnection";
import ContextFactory from "@floro/database/src/contexts/ContextFactory";
import RepoHelper from "@floro/database/src/contexts/utils/RepoHelper";
import { User } from "@floro/database/src/entities/User";
import RepositoriesContext from "@floro/database/src/contexts/repositories/RepositoriesContext";
import CommitsContext from "@floro/database/src/contexts/repositories/CommitsContext";
import BranchesContext from "@floro/database/src/contexts/repositories/BranchesContext";
import BinariesContext from "@floro/database/src/contexts/repositories/BinariesContext";
import { REPO_REGEX } from "@floro/common-web/src/utils/validators";
import { Organization } from "@floro/database/src/entities/Organization";
import { Repository } from "@floro/database/src/entities/Repository";
import RepoAccessor from "@floro/storage/src/accessors/RepoAccessor";
import BranchService from "./BranchService";
import { Commit } from "@floro/database/src/entities/Commit";
import { Binary } from "@floro/database/src/entities/Binary";
import RepoRBACService from "./RepoRBACService";
import ProtectedBranchRulesContext from "@floro/database/src/contexts/repositories/ProtectedBranchRulesContext";
import { ProtectedBranchRule } from "@floro/database/src/entities/ProtectedBranchRule";
import { SourceCommitNode, SourceGraph } from "floro/dist/src/sourcegraph";
import {
  Branch as FloroBranch,
  CloneFile,
  CommitExchange,
  RemoteSettings,
  BranchesMetaState,
  getBranchIdFromName,
  BRANCH_NAME_REGEX,
} from "floro/dist/src/repo";
import OrganizationsContext from "@floro/database/src/contexts/organizations/OrganizationsContext";
import MainConfig from "@floro/config/src/MainConfig";
import StorageAuthenticator from "@floro/storage/src/StorageAuthenticator";
import UsersContext from "@floro/database/src/contexts/users/UsersContext";

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
export default class RepositoryService {
  private databaseConnection!: DatabaseConnection;
  private contextFactory!: ContextFactory;
  private repoAccessor!: RepoAccessor;
  private branchService!: BranchService;
  private repoRBAC!: RepoRBACService;
  private mainConfig!: MainConfig;
  private storageAuthenticator!: StorageAuthenticator;

  constructor(
    @inject(DatabaseConnection) databaseConnection: DatabaseConnection,
    @inject(ContextFactory) contextFactory: ContextFactory,
    @inject(RepoAccessor) repoAccessor: RepoAccessor,
    @inject(BranchService) branchService: BranchService,
    @inject(RepoRBACService) repoRBAC: RepoRBACService,
    @inject(MainConfig) mainConfig: MainConfig,
    @inject(StorageAuthenticator) storageAuthenticator: StorageAuthenticator
  ) {
    this.databaseConnection = databaseConnection;
    this.contextFactory = contextFactory;
    this.repoAccessor = repoAccessor;
    this.branchService = branchService;
    this.repoRBAC = repoRBAC;
    this.mainConfig = mainConfig;
    this.storageAuthenticator = storageAuthenticator;
  }

  public async createUserRepository(
    user: User,
    name: string,
    isPrivate: boolean,
    licenseCode?: string | null
  ): Promise<CreateRepositoryReponse> {
    if (!REPO_REGEX.test(name)) {
      return {
        action: "INVALID_PARAMS_ERROR",
        error: {
          type: "INVALID_PARAMS_ERROR",
          message: "Missing license code",
        },
      };
    }
    const hashKey = RepoHelper.getRepoHashUUID(user.username, name);
    if (!hashKey) {
      return {
        action: "INVALID_PARAMS_ERROR",
        error: {
          type: "INVALID_PARAMS_ERROR",
          message: "Invalid hash key",
        },
      };
    }
    const queryRunner = await this.databaseConnection.makeQueryRunner();
    try {
      await queryRunner.startTransaction();
      const repositoriesContext = await this.contextFactory.createContext(
        RepositoriesContext,
        queryRunner
      );
      const userRepos = await repositoriesContext.getUserRepos(user.id);
      const userReposNames = new Set(
        userRepos?.map((repo) => repo?.name.toLowerCase().trim())
      );
      if (userReposNames.has(name?.toLowerCase().trim())) {
        await queryRunner.rollbackTransaction();
        return {
          action: "REPO_NAME_TAKEN_ERROR",
          error: {
            type: "REPO_NAME_TAKEN_ERROR",
            message: "Repo name already in use",
          },
        };
      }

      if (!isPrivate && (!licenseCode || !LICENSE_CODE_LIST.has(licenseCode))) {
        await queryRunner.rollbackTransaction();
        return {
          action: "INVALID_PARAMS_ERROR",
          error: {
            type: "INVALID_PARAMS_ERROR",
            message: "Missing license code",
          },
        };
      }

      if (isPrivate) {
        const repository = await repositoriesContext.createRepo({
          userId: user.id,
          createdByUserId: user.id,
          hashKey,
          isPrivate,
          name: name.trim(),
          repoType: "user_repo",
        });
        const loadedRepository = await repositoriesContext.getById(
          repository.id
        );
        if (!loadedRepository) {
          await queryRunner.rollbackTransaction();
          return {
            action: "LOG_ERROR",
            error: {
              type: "REPO_NOT_CREATED",
              message: "Repository not created",
            },
          };
        }
        await this.repoAccessor.initInitialRepoFoldersAndFiles(repository);
        await queryRunner.commitTransaction();
        return {
          action: "REPO_CREATED",
          repository: loadedRepository,
        };
      } else {
        const repository = await repositoriesContext.createRepo({
          userId: user.id,
          createdByUserId: user.id,
          hashKey,
          isPrivate,
          name: name.trim(),
          licenseCode: licenseCode as string,
          repoType: "user_repo",
        });
        const loadedRepository = await repositoriesContext.getById(
          repository.id
        );
        if (!loadedRepository) {
          await queryRunner.rollbackTransaction();
          return {
            action: "LOG_ERROR",
            error: {
              type: "REPO_NOT_CREATED",
              message: "Repository not created",
            },
          };
        }
        await this.repoAccessor.initInitialRepoFoldersAndFiles(repository);
        // add branch
        await this.branchService.initMainBranch(queryRunner, repository, user);
        // add branch rule
        await queryRunner.commitTransaction();
        return {
          action: "REPO_CREATED",
          repository: loadedRepository,
        };
      }
    } catch (e: any) {
      if (!queryRunner.isReleased) {
        await queryRunner.rollbackTransaction();
      }
      return {
        action: "LOG_ERROR",
        error: {
          type: "UNKNOWN_CREATE_REPOSITORY_ERROR",
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
  public async createOrganizationRepository(
    organization: Organization,
    currentUser: User,
    name: string,
    isPrivate: boolean,
    licenseCode?: string | null
  ): Promise<CreateRepositoryReponse> {
    if (!REPO_REGEX.test(name)) {
      return {
        action: "INVALID_PARAMS_ERROR",
        error: {
          type: "INVALID_PARAMS_ERROR",
          message: "Missing license code",
        },
      };
    }
    const hashKey = RepoHelper.getRepoHashUUID(organization.handle, name);
    if (!hashKey) {
      return {
        action: "INVALID_PARAMS_ERROR",
        error: {
          type: "INVALID_PARAMS_ERROR",
          message: "Invalid hash key",
        },
      };
    }
    const queryRunner = await this.databaseConnection.makeQueryRunner();
    try {
      await queryRunner.startTransaction();
      const repositoriesContext = await this.contextFactory.createContext(
        RepositoriesContext,
        queryRunner
      );
      const orgRepos = await repositoriesContext.getOrgRepos(organization.id);
      const orgReposNames = new Set(
        orgRepos?.map((repo) => repo?.name.toLowerCase().trim())
      );
      if (orgReposNames.has(name?.toLowerCase().trim())) {
        await queryRunner.rollbackTransaction();
        return {
          action: "REPO_NAME_TAKEN_ERROR",
          error: {
            type: "REPO_NAME_TAKEN_ERROR",
            message: "Repo name already in use",
          },
        };
      }

      if (!isPrivate && (!licenseCode || !LICENSE_CODE_LIST.has(licenseCode))) {
        await queryRunner.rollbackTransaction();
        return {
          action: "INVALID_PARAMS_ERROR",
          error: {
            type: "INVALID_PARAMS_ERROR",
            message: "Missing license code",
          },
        };
      }
      if (isPrivate) {
        const repository = await repositoriesContext.createRepo({
          organizationId: organization.id,
          createdByUserId: currentUser.id,
          hashKey,
          isPrivate,
          name: name.trim(),
          repoType: "org_repo",
        });
        const loadedRepository = await repositoriesContext.getById(
          repository.id
        );
        if (!loadedRepository) {
          await queryRunner.rollbackTransaction();
          return {
            action: "LOG_ERROR",
            error: {
              type: "REPO_NOT_CREATED",
              message: "Repository not created",
            },
          };
        }
        await this.repoAccessor.initInitialRepoFoldersAndFiles(repository);
        await queryRunner.commitTransaction();
        return {
          action: "REPO_CREATED",
          repository: loadedRepository,
        };
      } else {
        const repository = await repositoriesContext.createRepo({
          organizationId: organization.id,
          createdByUserId: currentUser.id,
          hashKey,
          isPrivate,
          name: name.trim(),
          licenseCode: licenseCode as string,
          repoType: "org_repo",
        });
        const loadedRepository = await repositoriesContext.getById(
          repository.id
        );
        if (!loadedRepository) {
          await queryRunner.rollbackTransaction();
          return {
            action: "LOG_ERROR",
            error: {
              type: "REPO_NOT_CREATED",
              message: "Repository not created",
            },
          };
        }
        await this.repoAccessor.initInitialRepoFoldersAndFiles(repository);
        await this.branchService.initMainBranch(
          queryRunner,
          repository,
          currentUser
        );
        await queryRunner.commitTransaction();
        return {
          action: "REPO_CREATED",
          repository: loadedRepository,
        };
      }
    } catch (e: any) {
      if (!queryRunner.isReleased) {
        await queryRunner.rollbackTransaction();
      }
      return {
        action: "LOG_ERROR",
        error: {
          type: "UNKNOWN_CREATE_REPOSITORY_ERROR",
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

  public async fetchRepoByName(ownerName?: string, repoName?: string) {
    const hashKey = RepoHelper.getRepoHashUUID(ownerName, repoName);
    if (!hashKey) {
      return null;
    }
    const repositoriesContext = await this.contextFactory.createContext(
      RepositoriesContext
    );
    return await repositoriesContext.getByHashKey(hashKey);
  }

  public async fetchRepoById(id?: string) {
    if (!id) {
      return null;
    }
    try {
      const repositoriesContext = await this.contextFactory.createContext(
        RepositoriesContext
      );
      return await repositoriesContext.getById(id);
    } catch (e) {
      return null;
    }
  }

  public async fetchProtectedBranchSettingsForUser(
    repository: Repository,
    protectedBranchRule: ProtectedBranchRule,
    user: User
  ) {
    const canCreateMergeRequests =
      await this.repoRBAC.calculateUserProtectedBranchRuleSettingPermission(
        protectedBranchRule,
        repository,
        user,
        "anyoneCanCreateMergeRequests"
      );
    const canMergeWithApproval =
      await this.repoRBAC.calculateUserProtectedBranchRuleSettingPermission(
        protectedBranchRule,
        repository,
        user,
        "anyoneWithApprovalCanMerge"
      );

    const canMergeMergeRequests =
      await this.repoRBAC.calculateUserProtectedBranchRuleSettingPermission(
        protectedBranchRule,
        repository,
        user,
        "anyoneCanMergeMergeRequests"
      );

    const canApproveMergeRequests =
      await this.repoRBAC.calculateUserProtectedBranchRuleSettingPermission(
        protectedBranchRule,
        repository,
        user,
        "anyoneCanApproveMergeRequests"
      );

    const canRevert =
      await this.repoRBAC.calculateUserProtectedBranchRuleSettingPermission(
        protectedBranchRule,
        repository,
        user,
        "anyoneCanRevert"
      );

    const canAutofix =
      await this.repoRBAC.calculateUserProtectedBranchRuleSettingPermission(
        protectedBranchRule,
        repository,
        user,
        "anyoneCanAutofix"
      );

    return {
      branchId: protectedBranchRule.branchId as string,
      branchName: protectedBranchRule.branchName as string,
      directPushingDisabled: protectedBranchRule.disableDirectPushing ?? false,
      requiresApprovalToMerge:
        protectedBranchRule.requireApprovalToMerge ?? false,
      automaticallyDeletesMergedFeatureBranches:
        protectedBranchRule.automaticallyDeleteMergedFeatureBranches ?? false,
      canCreateMergeRequests: canCreateMergeRequests ?? false,
      canMergeWithApproval: canMergeWithApproval ?? false,
      canMergeMergeRequests: canMergeMergeRequests ?? false,
      canApproveMergeRequests: canApproveMergeRequests ?? false,
      canRevert: canRevert ?? false,
      canAutofix: canAutofix ?? false,
    };
  }

  public async fetchRepoSettingsForUser(
    repoId: string,
    user: User
  ): Promise<RemoteSettings | null> {
    const repository = await this.fetchRepoById(repoId);
    if (!repository) {
      return null;
    }
    let accountInGoodStanding = await this.getAccountStandingOkay(repository);
    const canPushBranches =
      await this.repoRBAC.calculateUserRepositorySettingPermission(
        repository,
        user,
        "anyoneCanPushBranches"
      );

    const canDeleteBranches =
      await this.repoRBAC.calculateUserRepositorySettingPermission(
        repository,
        user,
        "anyoneCanDeleteBranches"
      );

    const canChangeSettings =
      await this.repoRBAC.calculateUserRepositorySettingPermission(
        repository,
        user,
        "anyoneCanChangeSettings"
      );

    const protectedBranchRulesContext = await this.contextFactory.createContext(
      ProtectedBranchRulesContext
    );
    const protectedBranchRules =
      await protectedBranchRulesContext.getProtectedBranchesForRepo(repoId);

    const branchRules = await Promise.all(
      protectedBranchRules.map((branchRule) =>
        this.fetchProtectedBranchSettingsForUser(repository, branchRule, user)
      )
    );

    return {
      defaultBranchId: repository?.defaultBranchId,
      canPushBranches,
      canDeleteBranches,
      canChangeSettings,
      branchRules,
      accountInGoodStanding,
    };
  }

  public async fetchCloneInfo(
    repoId: string,
    user: User
  ): Promise<{
    settings: RemoteSettings;
    commits: CommitExchange[];
    branches: FloroBranch[];
  } | null> {
    const commitsContext = await this.contextFactory.createContext(
      CommitsContext
    );
    const commits = await commitsContext.getAllByRepoId(repoId);
    const branchesContext = await this.contextFactory.createContext(
      BranchesContext
    );
    const branches = await branchesContext.getAllByRepoId(repoId);

    const repository = await this.fetchRepoById(repoId);
    if (!repository) {
      return null;
    }
    const settings = await this.fetchRepoSettingsForUser(repoId, user);
    if (!settings) {
      return null;
    }

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

    const branchesMetaState = this.getBranchesMetaState(
      branchExchange,
      settings
    );
    const sourceGraph = new SourceGraph(
      commits as SourceCommitNode[],
      branchesMetaState
    );
    const remoteBranchLeaves = new Set(
      branchesMetaState.allBranches.map((bms) => bms.lastRemoteCommit)
    );
    const pointers = sourceGraph.getPointers();
    const branchShas = new Set<string>();
    for (let remoteSha of remoteBranchLeaves) {
      if (remoteSha && !branchShas.has(remoteSha)) {
        let current: SourceCommitNode | null = pointers[remoteSha];
        while (
          current?.sha &&
          current?.idx >= 0 &&
          !branchShas.has(current.sha)
        ) {
          branchShas.add(current?.sha);
          current = current?.parent ? pointers[current.parent] : null;
        }
      }
    }

    const commitExchange: Array<CommitExchange> = commits
      ?.map((c) => {
        return {
          sha: c.sha as string,
          idx: c.idx as number,
          parent: c.parent,
        } as CommitExchange;
      })
      ?.filter((c) => branchShas.has(c.sha));
    return {
      settings,
      commits: commitExchange,
      branches: branchExchange,
    };
  }

  public async fetchPullInfo(
    repoId: string,
    user: User,
    branchLeaves: Array<string>
  ) {
    const repositoriesContext = await this.contextFactory.createContext(
      RepositoriesContext
    );
    const repository = await repositoriesContext.getById(repoId);
    if (repository == null) {
      return null;
    }
    const commitsContext = await this.contextFactory.createContext(
      CommitsContext
    );
    const commits = await commitsContext.getAllByRepoId(repoId);
    const branchesContext = await this.contextFactory.createContext(
      BranchesContext
    );
    const branches = await branchesContext.getAllByRepoId(repoId);
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

    const settings = await this.fetchRepoSettingsForUser(repoId, user);
    if (settings == null) {
      return null;
    }

    const uniqueBranchLeaves = Array.from(new Set(branchLeaves ?? []));
    const branchesMetaState = this.getBranchesMetaState(
      branchExchange,
      settings
    );
    const sourceGraph = new SourceGraph(
      commits as SourceCommitNode[],
      branchesMetaState
    );
    const clientShasInGraph = new Set(
      uniqueBranchLeaves.filter((sha) => {
        return !!sourceGraph?.getPointers?.()?.[sha];
      })
    );

    const remoteBranchLeaves = new Set(
      branchesMetaState.allBranches.map((bms) => bms.lastRemoteCommit)
    );

    const branchShas = new Set<string>();
    const pointers = sourceGraph.getPointers();
    for (let remoteSha of remoteBranchLeaves) {
      if (remoteSha && !clientShasInGraph.has(remoteSha)) {
        let current: SourceCommitNode | null = pointers[remoteSha];
        while (
          current?.sha &&
          current?.idx >= 0 &&
          !clientShasInGraph.has(current.sha) &&
          !branchShas.has(current.sha)
        ) {
          branchShas.add(current.sha as string);
          current = current?.parent ? pointers[current.parent] : null;
        }
      }
    }

    const commitExchange: Array<CommitExchange> = commits
      ?.map((c) => {
        return {
          sha: c.sha as string,
          idx: c.idx as number,
          parent: c.parent,
        } as CommitExchange;
      })
      ?.filter((c) => branchShas.has(c.sha));

    const branchHeadLinks = branchExchange.map((branch) => {
      return {
        id: branch.id,
        lastCommit: branch.lastCommit,
        kvLink: this.getKVLink(repository, branch),
        stateLink: this.getStateLink(repository, branch),
      };
    });

    return {
      settings,
      commits: commitExchange,
      branches: branchExchange,
      branchHeadLinks,
    };
  }

  public getBranchesMetaState(
    branches: FloroBranch[],
    settings: RemoteSettings
  ): BranchesMetaState {
    const branchMetaState: BranchesMetaState = {
      allBranches: [],
      userBranches: [],
    };

    const requiredBranchIds = new Set([
      settings.defaultBranchId,
      ...settings.branchRules?.map((b) => b.branchId),
    ]);

    branchMetaState.allBranches = branches.map((branchData) => {
      return {
        branchId: branchData.id,
        lastLocalCommit: branchData.lastCommit,
        lastRemoteCommit: branchData.lastCommit,
      };
    });

    branchMetaState.userBranches = branchMetaState.allBranches.filter((b) => {
      return requiredBranchIds.has(b.branchId);
    });
    return branchMetaState;
  }

  public async getCommit(repoId: string, sha: string): Promise<Commit | null> {
    const commitsContext = await this.contextFactory.createContext(
      CommitsContext
    );
    const commit = await commitsContext.getCommitBySha(repoId, sha);
    return commit;
  }

  public async getBinary(
    repoId: string,
    fileName: string
  ): Promise<Binary | null> {
    const binariesContext = await this.contextFactory.createContext(
      BinariesContext
    );
    const binary = await binariesContext.getRepoBinaryByFilename(
      repoId,
      fileName
    );
    return binary;
  }

  public async getAccountStandingOkay(repository: Repository) {
    if (repository.repoType == "org_repo") {
      const organizationsContext = await this.contextFactory.createContext(
        OrganizationsContext
      );
      const organization = await organizationsContext.getById(
        repository.organizationId
      );
      if (organization?.billingStatus == "delinquent") {
        return false;
      }
    }
    // MAYBE ADD ONE DAY, for now don't worry about utilization by users
    //else {
    //  const usersContext = await this.contextFactory.createContext(
    //    UsersContext
    //  );
    //  const user = await usersContext.getById(repository.userId);
    //  const diskSpaceLimitBytes = parseInt(
    //    user?.diskSpaceLimitBytes as unknown as string
    //  );
    //  const utilizedDiskSpaceBytes = parseInt(
    //    user?.utilizedDiskSpaceBytes as unknown as string
    //  );
    //  if (utilizedDiskSpaceBytes > diskSpaceLimitBytes) {
    //    return false;
    //  }
    //}
    return true;
  }

  public async pushBranch(
    repository: Repository,
    floroBranch: FloroBranch,
    user: User
  ) {
    const queryRunner = await this.databaseConnection.makeQueryRunner();
    try {
      if (!BRANCH_NAME_REGEX.test(floroBranch?.name ?? "")) {
        await queryRunner.rollbackTransaction();
        return null;
      }
      await queryRunner.startTransaction();
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
          await queryRunner.rollbackTransaction();
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
          await queryRunner.rollbackTransaction();
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
      await queryRunner.commitTransaction();
      return createdBranch;
    } catch (e: any) {
      if (!queryRunner.isReleased) {
        await queryRunner.rollbackTransaction();
      }
      return null;
    } finally {
      if (!queryRunner.isReleased) {
        await queryRunner.release();
      }
    }
  }

  public getKVLink(repository: Repository, branch: FloroBranch) {
    if (!branch?.lastCommit) {
      return null;
    }
    const privateCdnUrl = this.mainConfig.privateRoot();
    //const expiration = new Date().getTime() + (3600*1000);
    const urlPath = this.repoAccessor.getRelativeCommitKVPath(
      repository,
      branch?.lastCommit
    );
    const url = privateCdnUrl + urlPath;
    return this.storageAuthenticator.signURL(url, urlPath, 3600);
  }

  public getStateLink(repository: Repository, branch: FloroBranch) {
    if (!branch?.lastCommit) {
      return null;
    }
    const privateCdnUrl = this.mainConfig.privateRoot();
    //const expiration = new Date().getTime() + (3600*1000);
    const urlPath = this.repoAccessor.getRelativeCommitStatePath(
      repository,
      branch?.lastCommit
    );
    const url = privateCdnUrl + urlPath;
    return this.storageAuthenticator.signURL(url, urlPath, 3600);
  }
}
