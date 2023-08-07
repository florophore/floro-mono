
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
import RepoRBACService, { RepoPermissions } from "./RepoRBACService";
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
  Branch,
  branchIdIsCyclic,
} from "floro/dist/src/repo";
import OrganizationsContext from "@floro/database/src/contexts/organizations/OrganizationsContext";
import MainConfig from "@floro/config/src/MainConfig";
import StorageAuthenticator from "@floro/storage/src/StorageAuthenticator";
import UsersContext from "@floro/database/src/contexts/users/UsersContext";
import RepositoryDatasourceFactoryService from "./RepoDatasourceFactoryService";
import BinaryCommitUtilizationsContext from "@floro/database/src/contexts/repositories/BinaryCommitUtilizationsContext";
import BinaryAccessor from "@floro/storage/src/accessors/BinaryAccessor";
import { QueryRunner } from "typeorm";
import PluginsVersionsContext from "@floro/database/src/contexts/plugins/PluginVersionsContext";
import OrganizationMemberRolesContext from "@floro/database/src/contexts/organizations/OrganizationMemberRolesContext";
import OrganizationMembersContext from "@floro/database/src/contexts/organizations/OrganizationMembersContext";
import OrganizationRolesContext from "@floro/database/src/contexts/organizations/OrganizationRolesContext";
import { RepoEnabledRoleSetting } from "@floro/database/src/entities/RepoEnabledRoleSetting";
import RepositoryEnabledRoleSettingsContext from "@floro/database/src/contexts/repositories/RepositoryEnabledRoleSettingsContext";
import RepositoryEnabledUserSettingsContext from "@floro/database/src/contexts/repositories/RepositoryEnabledUserSettingsContext";
import MergeRequestsContext from "@floro/database/src/contexts/merge_requests/MergeRequestsContext";

interface BranchRuleUserPermission {
  branchId: string;
  branchName: string;
  directPushingDisabled: boolean;
  requiresApprovalToMerge: boolean;
  requireReapprovalOnPushToMerge: boolean;
  automaticallyDeletesMergedFeatureBranches: boolean;
  canCreateMergeRequests: boolean;
  canMergeWithApproval: boolean;
  canApproveMergeRequests: boolean;
  canRevert: boolean;
  canAutofix: boolean;
}

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

export interface CreateRepositoryResponse {
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
export default class RepoDataService {
  private databaseConnection!: DatabaseConnection;
  private contextFactory!: ContextFactory;
  private repoAccessor!: RepoAccessor;
  private repoRBAC!: RepoRBACService;
  private storageAuthenticator!: StorageAuthenticator;
  private repositoryDatasourceFactoryService!: RepositoryDatasourceFactoryService;
  private binaryAccessor!: BinaryAccessor;
  private mainConfig!: MainConfig;

  constructor(
    @inject(DatabaseConnection) databaseConnection: DatabaseConnection,
    @inject(ContextFactory) contextFactory: ContextFactory,
    @inject(RepoAccessor) repoAccessor: RepoAccessor,
    @inject(RepoRBACService) repoRBAC: RepoRBACService,
    @inject(MainConfig) mainConfig: MainConfig,
    @inject(RepositoryDatasourceFactoryService)
    repositoryDatasourceFactoryService: RepositoryDatasourceFactoryService,
    @inject(StorageAuthenticator) storageAuthenticator: StorageAuthenticator,
    @inject(BinaryAccessor) binaryAccessor: BinaryAccessor,
  ) {
    this.databaseConnection = databaseConnection;
    this.contextFactory = contextFactory;
    this.repoAccessor = repoAccessor;
    this.repoRBAC = repoRBAC;
    this.repositoryDatasourceFactoryService = repositoryDatasourceFactoryService;
    this.binaryAccessor = binaryAccessor;
    this.storageAuthenticator = storageAuthenticator;
    this.mainConfig = mainConfig;
  }

  public async getRepository(id: string) {
    const repositoriesContext = await this.contextFactory.createContext(
      RepositoriesContext
    );
    return await repositoriesContext.getById(id);
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
    repoPermissions: RepoPermissions,
    user: User | null | undefined,
    queryRunner?: QueryRunner
  ): Promise<BranchRuleUserPermission> {
    const canCreateMergeRequests =
      await this.repoRBAC.calculateUserProtectedBranchRuleSettingPermission(
        protectedBranchRule,
        repository,
        user,
        repoPermissions,
        "anyoneCanCreateMergeRequests",
        queryRunner
      );
    const canMergeWithApproval =
      await this.repoRBAC.calculateUserProtectedBranchRuleSettingPermission(
        protectedBranchRule,
        repository,
        user,
        repoPermissions,
        "anyoneWithApprovalCanMerge",
        queryRunner
      );

    const canApproveMergeRequests =
      await this.repoRBAC.calculateUserProtectedBranchRuleSettingPermission(
        protectedBranchRule,
        repository,
        user,
        repoPermissions,
        "anyoneCanApproveMergeRequests",
        queryRunner
      );

    const canRevert =
      await this.repoRBAC.calculateUserProtectedBranchRuleSettingPermission(
        protectedBranchRule,
        repository,
        user,
        repoPermissions,
        "anyoneCanRevert",
        queryRunner
      );

    const canAutofix =
      await this.repoRBAC.calculateUserProtectedBranchRuleSettingPermission(
        protectedBranchRule,
        repository,
        user,
        repoPermissions,
        "anyoneCanAutofix",
        queryRunner
      );

    return {
      branchId: protectedBranchRule.branchId as string,
      branchName: protectedBranchRule.branchName as string,
      directPushingDisabled: protectedBranchRule.disableDirectPushing ?? false,
      requiresApprovalToMerge:
        protectedBranchRule.requireApprovalToMerge ?? false,
      requireReapprovalOnPushToMerge:
        protectedBranchRule.requireReapprovalOnPushToMerge ?? false,
      automaticallyDeletesMergedFeatureBranches:
        protectedBranchRule.automaticallyDeleteMergedFeatureBranches ?? false,
      canCreateMergeRequests: canCreateMergeRequests ?? false,
      canMergeWithApproval: canMergeWithApproval ?? false,
      canApproveMergeRequests: canApproveMergeRequests ?? false,
      canRevert: canRevert ?? false,
      canAutofix: canAutofix ?? false,
    };
  }

  public async fetchRepoSettingsForUser(
    repoId: string,
    user?: User | null | undefined,
    queryRunner?: QueryRunner
  ): Promise<RemoteSettings | null> {
    const repository = await this.fetchRepoById(repoId);
    if (!repository) {
      return null;
    }

    const organizationMembersContext = await this.contextFactory.createContext(
      OrganizationMembersContext,
      queryRunner
    );
    const organizationMemberRolesContext =
      await this.contextFactory.createContext(OrganizationMemberRolesContext);
    const membership =
      repository.repoType == "org_repo" && user
        ? await organizationMembersContext.getByOrgIdAndUserId(
            repository.organizationId,
            user?.id
          )
        : null;
    const roles =
      membership?.membershipState == "active"
        ? await organizationMemberRolesContext.getRolesByMemberId(
            membership?.id
          )
        : [];
    const isAdmin =
      repository.repoType == "org_repo" &&
      !!roles.find((r) => r.presetCode == "admin");

    let accountInGoodStanding = await this.getAccountStandingOkay(repository);
    // check if user isAdmin
    const canReadRepo =
      isAdmin ||
      (!repository.isPrivate && repository.repoType != "org_repo") ||
      (await this.repoRBAC.calculateUserRepositorySettingPermission(
        repository,
        user,
        "anyoneCanRead",
        queryRunner
      ));
    const canPushBranches =
      isAdmin ||
      (await this.repoRBAC.calculateUserRepositorySettingPermission(
        repository,
        user,
        "anyoneCanPushBranches",
        queryRunner
      ));

    const canChangeSettings =
      isAdmin ||
      (await this.repoRBAC.calculateUserRepositorySettingPermission(
        repository,
        user,
        "anyoneCanChangeSettings",
        queryRunner
      ));

    const protectedBranchRulesContext = await this.contextFactory.createContext(
      ProtectedBranchRulesContext,
      queryRunner
    );
    const protectedBranchRules =
      await protectedBranchRulesContext.getProtectedBranchesForRepo(repoId);

    const repoPermissions: RepoPermissions = {
      canReadRepo,
      canPushBranches,
      canChangeSettings,
    };

    const branchRules = await Promise.all(
      protectedBranchRules.map((branchRule) =>
        this.fetchProtectedBranchSettingsForUser(
          repository,
          branchRule,
          repoPermissions,
          user,
          queryRunner
        )
      )
    );

    return {
      defaultBranchId: repository?.defaultBranchId,
      canReadRepo,
      canPushBranches,
      canChangeSettings,
      branchRules,
      accountInGoodStanding,
    };
  }

  public async getBranches(
    repoId: string,
    queryRunner?: QueryRunner
  ): Promise<Array<FloroBranch & { updatedAt: string; dbId: string, isMerged: boolean, isConflictFree: boolean }>> {
    const branchesContext = !!queryRunner
      ? await this.contextFactory.createContext(BranchesContext, queryRunner)
      : await this.contextFactory.createContext(BranchesContext);
    const branches = await branchesContext.getAllByRepoId(repoId);
    return branches?.map((b) => {
      return {
        id: b.branchId as string,
        name: b.name as string,
        lastCommit: b.lastCommit as string,
        createdBy: b.createdById as string,
        createdByUsername: b.createdByUsername as string,
        createdAt: b.createdAt as string,
        baseBranchId: b?.baseBranchId as string,
        updatedAt: b.updatedAt.toISOString(),
        dbId: b.id,
        isConflictFree: b.isConflictFree,
        isMerged: b.isMerged
      };
    });
  }

  public async getCommits(repoId: string): Promise<Array<Commit>> {
    const commitsContext = await this.contextFactory.createContext(
      CommitsContext
    );
    const commits = await commitsContext.getAllByRepoId(repoId);
    return commits ?? [];
  }

  public getCommitHistory(commits: Array<Commit>, sha: string) {
    return this.repositoryDatasourceFactoryService.getCommitHistory(
      commits,
      sha
    );
  }

  public getCommitHistoryBetween(
    commits: Array<Commit>,
    topSha: string | undefined,
    bottomSha: string | undefined
  ) {
    const history = this.repositoryDatasourceFactoryService.getCommitHistory(
      commits,
      topSha
    );
    const out: Array<Commit> = [];
    let current = history[0];
    let index = 0;
    while (current && current?.sha != bottomSha) {
      out.push(current);
      current = history[++index];
      //if (current && current.sha == bottomSha) {
      //  out.push(current);
      //}
    }
    return out;
  }

  public getRevertRanges(commitHistory: Array<Commit>) {
    const out: Array<{ fromIdx: number; toIdx: number }> = [];
    const commitMap = {};
    for (const commit of commitHistory) {
      if (commit.sha) {
        commitMap[commit.sha] = commit;
      }
    }
    for (const commit of commitHistory) {
      if (commit?.revertFromSha && commit?.revertToSha) {
        const commitFrom = commitMap[commit?.revertFromSha];
        const commitTo = commitMap[commit?.revertToSha];
        out.push({
          fromIdx: commitFrom.idx,
          toIdx: commitTo.idx,
        });
      }
    }
    return out;
  }

  public isReverted(
    ranges: Array<{ fromIdx: number; toIdx: number }>,
    idx: number
  ): boolean {
    for (const { fromIdx, toIdx } of ranges) {
      if (idx >= fromIdx && idx <= toIdx) {
        return true;
      }
    }
    return false;
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

  public async testPluginsAreValid(
    repository: Repository,
    pluginList: Array<{ name: string; version: string }>
  ): Promise<
    Array<{
      name: string;
      version: string;
      status: "ok" | "unreleased" | "invalid";
    }>
  > {
    const out: Array<{
      name: string;
      version: string;
      status: "ok" | "unreleased" | "invalid";
    }> = [];
    const pluginVersionContext = await this.contextFactory.createContext(
      PluginsVersionsContext
    );
    const seen = new Set<string>();
    for (const { name, version } of pluginList) {
      const key = `${name}:${version}`;
      if (seen.has(key)) {
        continue;
      }
      seen.add(key);
      if (version.startsWith("dev")) {
        out.push({
          name,
          version,
          status: "invalid",
        });
        continue;
      }
      const pluginVersion = await pluginVersionContext.getByNameAndVersion(
        name,
        version
      );
      if (!pluginVersion) {
        out.push({
          name,
          version,
          status: "invalid",
        });
        continue;
      }
      if (pluginVersion.isPrivate && !repository.isPrivate) {
        out.push({
          name,
          version,
          status: "invalid",
        });
        continue;
      }
      if (pluginVersion.isPrivate && pluginVersion.ownerType == "org_plugin") {
        if (
          repository.repoType != "org_repo" ||
          pluginVersion.organizationId != repository.organizationId
        ) {
          out.push({
            name,
            version,
            status: "invalid",
          });
          continue;
        }
      }

      if (pluginVersion.isPrivate && pluginVersion.ownerType == "user_plugin") {
        if (
          repository.repoType != "user_repo" ||
          pluginVersion.userId != repository.userId
        ) {
          out.push({
            name,
            version,
            status: "invalid",
          });
          continue;
        }
      }
      if (pluginVersion.state != "released") {
        out.push({
          name,
          version,
          status: "unreleased",
        });
        continue;
      }

      out.push({
        name,
        version,
        status: "ok",
      });
    }
    return out;
  }

  public async fetchPullInfo(
    repoId: string,
    user: User,
    branchLeaves: Array<string>,
    branch?: FloroBranch,
    plugins: Array<{ name: string; version: string }> = []
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
        kvLink: this.getKVLinkForBranch(repository, branch),
        stateLink: this.getKVLinkForBranch(repository, branch),
      };
    });

    const hasRemoteBranchCycle = this.testBranchIsCyclic(
      branchExchange,
      branch
    );
    const pluginStatuses = await this.testPluginsAreValid(repository, plugins);
    const mergeRequestConetxt = await this.contextFactory.createContext(MergeRequestsContext);
    const hasOpenMergeRequest = !!branch?.id && await mergeRequestConetxt.repoHasOpenRequestOnBranch(repoId, branch?.id as string);

    return {
      settings,
      commits: commitExchange,
      branches: branchExchange,
      branchHeadLinks,
      hasRemoteBranchCycle,
      hasOpenMergeRequest,
      pluginStatuses,
    };
  }

  public testBranchIsCyclic(
    branches: Array<FloroBranch>,
    branch: FloroBranch | undefined
  ) {
    if (!branch?.id || !branch?.baseBranchId) {
      return false;
    }
    const testBranches = [
      ...branches.filter((b) => b.baseBranchId != branch.id),
      branch,
    ];
    return branchIdIsCyclic(branch.id, testBranches);
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
    } else {
      const usersContext = await this.contextFactory.createContext(
        UsersContext
      );
      const user = await usersContext.getById(repository.userId);
      const diskSpaceLimitBytes = parseInt(
        user?.diskSpaceLimitBytes as unknown as string
      );
      const utilizedDiskSpaceBytes = parseInt(
        user?.utilizedDiskSpaceBytes as unknown as string
      );
      if (utilizedDiskSpaceBytes > diskSpaceLimitBytes) {
        return false;
      }
    }
    return true;
  }

  public getKVLinkForBranch(repository: Repository, branch: FloroBranch) {
    if (!branch?.lastCommit) {
      return null;
    }
    const privateCdnUrl = this.mainConfig.privateRoot();
    //const expiration = new Date().getTime() + (3600*1000);
    const urlPath =
      "/" +
      this.repoAccessor.getRelativeCommitKVPath(repository, branch?.lastCommit);
    const url = privateCdnUrl + urlPath;
    return this.storageAuthenticator.signURL(url, urlPath, 3600);
  }

  public getStateLinkForBranch(repository: Repository, branch: FloroBranch) {
    if (!branch?.lastCommit) {
      return null;
    }
    const privateCdnUrl = this.mainConfig.privateRoot();
    //const expiration = new Date().getTime() + (3600*1000);
    const urlPath =
      "/" +
      this.repoAccessor.getRelativeCommitStatePath(
        repository,
        branch?.lastCommit
      );
    const url = privateCdnUrl + urlPath;
    return this.storageAuthenticator.signURL(url, urlPath, 3600);
  }

  public getKVLinkForCommit(repository: Repository, commit: Commit) {
    if (!commit?.sha) {
      return null;
    }
    const privateCdnUrl = this.mainConfig.privateRoot();
    //const expiration = new Date().getTime() + (3600*1000);
    const urlPath =
      "/" + this.repoAccessor.getRelativeCommitKVPath(repository, commit?.sha);
    const url = privateCdnUrl + urlPath;
    return this.storageAuthenticator.signURL(url, urlPath, 3600);
  }

  public getStateLinkForCommit(repository: Repository, commit: Commit) {
    if (!commit?.sha) {
      return null;
    }
    const privateCdnUrl = this.mainConfig.privateRoot();
    //const expiration = new Date().getTime() + (3600*1000);
    const urlPath =
      "/" +
      this.repoAccessor.getRelativeCommitStatePath(repository, commit?.sha);
    const url = privateCdnUrl + urlPath;
    return this.storageAuthenticator.signURL(url, urlPath, 3600);
  }

  public async getBinaryLinksForCommit(
    repoId: string,
    sha: string
  ): Promise<Array<{ fileName: string; url: string }>> {
    if (!sha) {
      return [];
    }
    const binaryCommitUtilizationsContext =
      await this.contextFactory.createContext(BinaryCommitUtilizationsContext);
    const binaryUtilizations =
      await binaryCommitUtilizationsContext.getAllByRepoAndSha(repoId, sha);
    const out: Array<{ fileName: string; url: string }> = [];
    const privateCdnUrl = this.mainConfig.privateRoot();
    for (const { binaryFileName } of binaryUtilizations) {
      const urlPath =
        "/" + this.binaryAccessor.getRelativeBinaryPath(binaryFileName);
      const url = privateCdnUrl + urlPath;
      const signedUrl = this.storageAuthenticator.signURL(url, urlPath, 3600);
      out.push({
        url: signedUrl,
        fileName: binaryFileName,
      });
    }
    return out;
  }
}
