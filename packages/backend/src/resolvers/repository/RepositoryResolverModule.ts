import BaseResolverModule from "../BaseResolverModule";
import { main } from "@floro/graphql-schemas/build";
import { inject, injectable } from "inversify";
import ContextFactory from "@floro/database/src/contexts/ContextFactory";
import RequestCache from "../../request/RequestCache";
import LoggedInUserGuard from "../hooks/guards/LoggedInUserGuard";
import { runWithHooks } from "../hooks/ResolverHook";
import RootOrganizationMemberPermissionsLoader from "../hooks/loaders/Root/OrganizationID/RootOrganizationMemberPermissionsLoader";
import RepositoryService from "../../services/repositories/RepositoryService";
import OrganizationMembersContext from "@floro/database/src/contexts/organizations/OrganizationMembersContext";
import RepositoryRemoteSettingsLoader from "../hooks/loaders/Repository/RepositoryRemoteSettingsLoader";
import RepositoryBranchesLoader from "../hooks/loaders/Repository/RepositoryBranchesLoader";
import { Repository } from "@floro/database/src/entities/Repository";
import RepositoryCommitsLoader from "../hooks/loaders/Repository/RepositoryCommitsLoader";
import RepositoryCommitHistoryLoader from "../hooks/loaders/Repository/RepositoryCommitHistoryLoader";
import RepositoryLoader from "../hooks/loaders/Repository/RepositoryLoader";
import { Commit } from "@floro/database/src/entities/Commit";
import RepositoryRevertRangesLoader from "../hooks/loaders/Repository/RepositoryRevertRangesLoader";
import CommitStateDatasourceLoader from "../hooks/loaders/Repository/CommitStateDatasourceLoader";
import { getCanAutofixReversionIfNotWIP, getCanRevert, getMergeRebaseCommitList } from "floro/dist/src/repoapi";
import CommitStatePluginVersionsLoader from "../hooks/loaders/Repository/CommitStatePluginVersionsLoader";
import CommitStateBinaryRefsLoader from "../hooks/loaders/Repository/CommitStateBinaryRefsLoader";
import CommitInfoRepositoryLoader from "../hooks/loaders/Repository/CommitInfoRepoLoader";
import MergeRequestsContext from "@floro/database/src/contexts/merge_requests/MergeRequestsContext";
import { withFilter } from "graphql-subscriptions";
import { CommitInfo, SubscriptionSubscribeFn } from "@floro/graphql-schemas/build/generated/main-graphql";
import BranchService from "../../services/repositories/BranchService";
import IgnoredBranchNotificationsContext from "@floro/database/src/contexts/merge_requests/IgnoredBranchNotificationsContext";
import MergeRequestService from "../../services/merge_requests/MergeRequestService";
import { EMPTY_COMMIT_STATE, canAutoMergeCommitStates, getCommitState, getDivergenceOrigin, getMergeCommitStates, getMergeOriginSha } from "floro/dist/src/repo";
import { User as FloroUser } from "floro/dist/src/filestructure";
import { CommitData } from "floro/dist/src/sequenceoperations";

const PAGINATION_LIMIT = 10;

@injectable()
export default class RepositoryResolverModule extends BaseResolverModule {
  public resolvers: Array<keyof this & keyof main.ResolversTypes> = [
    "Mutation",
    "Query",
    "Subscription",
    "Repository",
    "BranchState",
    "CommitState",
    "CommitInfo",
  ];
  protected repositoryService!: RepositoryService;
  protected branchService!: BranchService;
  protected mergeRequestService!: MergeRequestService;
  protected contextFactory!: ContextFactory;
  protected requestCache!: RequestCache;

  protected loggedInUserGuard!: LoggedInUserGuard;

  protected rootOrganizationMemberPermissionsLoader!: RootOrganizationMemberPermissionsLoader;
  protected repositoryRemoteSettingsLoader!: RepositoryRemoteSettingsLoader;
  protected repositoryBranchesLoader!: RepositoryBranchesLoader;
  protected repositoryCommitsLoader!: RepositoryCommitsLoader;
  protected repositoryCommitHistoryLoader!: RepositoryCommitHistoryLoader;
  protected repositoryRevertRangesLoader!: RepositoryRevertRangesLoader;
  protected repositoryLoader!: RepositoryLoader;
  protected commitStateDatasourceLoader!: CommitStateDatasourceLoader;
  protected commitStatePluginVersionsLoader!: CommitStatePluginVersionsLoader;
  protected commitStateBinaryRefsLoader!: CommitStateBinaryRefsLoader;
  protected commitInfoRepositoryLoader!: CommitInfoRepositoryLoader;

  constructor(
    @inject(ContextFactory) contextFactory: ContextFactory,
    @inject(RequestCache) requestCache: RequestCache,
    @inject(RepositoryService) repositoryService: RepositoryService,
    @inject(LoggedInUserGuard) loggedInUserGuard: LoggedInUserGuard,
    @inject(RootOrganizationMemberPermissionsLoader)
    rootOrganizationMemberPermissionsLoader: RootOrganizationMemberPermissionsLoader,
    @inject(RepositoryRemoteSettingsLoader)
    repositoryRemoteSettingsLoader: RepositoryRemoteSettingsLoader,
    @inject(RepositoryBranchesLoader)
    repositoryBranchesLoader: RepositoryBranchesLoader,
    @inject(RepositoryCommitsLoader)
    repositoryCommitsLoader: RepositoryCommitsLoader,
    @inject(RepositoryCommitHistoryLoader)
    repositoryCommitHistoryLoader: RepositoryCommitHistoryLoader,
    @inject(RepositoryRevertRangesLoader)
    repositoryRevertRangesLoader: RepositoryRevertRangesLoader,
    @inject(RepositoryLoader)
    repositoryLoader: RepositoryLoader,
    @inject(CommitStateDatasourceLoader)
    commitStateDatasourceLoader: CommitStateDatasourceLoader,
    @inject(CommitStatePluginVersionsLoader)
    commitStatePluginVersionsLoader: CommitStatePluginVersionsLoader,
    @inject(CommitStateBinaryRefsLoader)
    commitStateBinaryRefsLoader: CommitStateBinaryRefsLoader,
    @inject(CommitInfoRepositoryLoader)
    commitInfoRepositoryLoader: CommitInfoRepositoryLoader,
    @inject(BranchService) branchService: BranchService,
    @inject(MergeRequestService) mergeRequestService: MergeRequestService,
  ) {
    super();
    this.contextFactory = contextFactory;
    this.requestCache = requestCache;

    this.repositoryService = repositoryService;
    this.branchService = branchService;
    this.mergeRequestService = mergeRequestService;

    this.loggedInUserGuard = loggedInUserGuard;

    this.rootOrganizationMemberPermissionsLoader =
      rootOrganizationMemberPermissionsLoader;

    this.repositoryRemoteSettingsLoader = repositoryRemoteSettingsLoader;
    this.repositoryBranchesLoader = repositoryBranchesLoader;
    this.repositoryCommitsLoader = repositoryCommitsLoader;
    this.repositoryCommitHistoryLoader = repositoryCommitHistoryLoader;
    this.repositoryRevertRangesLoader = repositoryRevertRangesLoader;
    this.repositoryLoader = repositoryLoader;
    this.commitStateDatasourceLoader = commitStateDatasourceLoader;
    this.commitStatePluginVersionsLoader = commitStatePluginVersionsLoader;
    this.commitStateBinaryRefsLoader = commitStateBinaryRefsLoader;
    this.commitInfoRepositoryLoader = commitInfoRepositoryLoader;
  }

  public Repository: main.RepositoryResolvers = {
    branchState: runWithHooks(
      () => [this.repositoryBranchesLoader],
      async (
        repository: main.Repository,
        { branchId }: main.RepositoryBranchStateArgs,
        { cacheKey, currentUser }
      ) => {
        if (!repository.id) {
          return null;
        }
        const dbRepo: Repository = repository as Repository;
        const cachedBranches = this.requestCache.getRepoBranches(
          cacheKey,
          repository.id
        );
        if (!cachedBranches) {
          return null;
        }
        const branch =
          cachedBranches.find((b) => b.id == branchId) ??
          cachedBranches?.find((b) => b.id == dbRepo.defaultBranchId);
        if (!branch) {
          return null;
        }
        if (repository) {
          this.requestCache.setRepo(cacheKey, dbRepo);
        }
        return {
          branchId: branch.id,
          updatedAt: branch.updatedAt,
          baseBranchId: branch?.baseBranchId,
          defaultBranchId: dbRepo.defaultBranchId,
          name: branch.name,
          branchHead: branch.lastCommit ?? null,
          repositoryId: repository.id,
        };
      }
    ),
    repoBranches: runWithHooks(
      () => [this.repositoryBranchesLoader],
      async (
        repository: main.Repository,
        _: main.RepositoryBranchStateArgs,
        { cacheKey, currentUser }
      ) => {
        if (!repository.id) {
          return [];
        }
        const cachedBranches = this.requestCache.getRepoBranches(
          cacheKey,
          repository.id
        );
        return cachedBranches ?? [];
      }
    ),
    openUserBranchesWithoutMergeRequests: runWithHooks(
      () => [
        this.repositoryBranchesLoader,
        this.repositoryRemoteSettingsLoader,
      ],
      async (
        repository: main.Repository,
        {
          filterIgnored,
        }: main.RepositoryOpenUserBranchesWithoutMergeRequestsArgs,
        { currentUser, cacheKey }
      ) => {
        if (!currentUser) {
          return [];
        }
        if (!repository.id) {
          return [];
        }
        const cachedBranches = this.requestCache.getRepoBranches(
          cacheKey,
          repository.id
        );
        if (!cachedBranches) {
          return [];
        }

        const cachedRemoteSettings = this.requestCache.getRepoRemoteSettings(
          cacheKey,
          repository.id
        );

        const cachedOpenUserBranches = this.requestCache.getOpenUserBranches(
          cacheKey,
          repository.id
        );
        if (cachedOpenUserBranches) {
          return cachedOpenUserBranches;
        }
        const openUserBranches = await this.branchService.getOpenBranchesByUser(
          repository as Repository,
          currentUser,
          cachedBranches,
          cachedRemoteSettings,
          filterIgnored ?? true
        );
        if (openUserBranches) {
          this.requestCache.setOpenUserBranches(
            cacheKey,
            repository.id,
            openUserBranches
          );
        }

        return openUserBranches;
      }
    ),
    openUserBranchesWithoutMergeRequestsCount: runWithHooks(
      () => [
        this.repositoryBranchesLoader,
        this.repositoryRemoteSettingsLoader,
      ],
      async (repository: main.Repository, _, { currentUser, cacheKey }) => {
        if (!currentUser) {
          return 0;
        }
        if (!repository.id) {
          return 0;
        }
        const cachedBranches = this.requestCache.getRepoBranches(
          cacheKey,
          repository.id
        );
        if (!cachedBranches) {
          return 0;
        }

        const cachedRemoteSettings = this.requestCache.getRepoRemoteSettings(
          cacheKey,
          repository.id
        );

        const openUserBranches = await this.branchService.getOpenBranchesByUser(
          repository as Repository,
          currentUser,
          cachedBranches,
          cachedRemoteSettings,
          false
        );

        return openUserBranches?.length ?? 0;
      }
    ),
    mergeRequest: runWithHooks(
      () => [],
      async (repository: main.Repository, { id }) => {
        if (!repository) {
          return null;
        }
        const mergeRequestsContext = await this.contextFactory.createContext(
          MergeRequestsContext
        );
        const mergeRequest = await mergeRequestsContext.getById(id ?? "");
        if (mergeRequest?.repositoryId == repository.id) {
          return mergeRequest;
        }
        return null;
      }
    ),
  };

  public CommitInfo: main.CommitInfoResolvers = {
    kvLink: runWithHooks(
      () => [this.commitInfoRepositoryLoader],
      async (commitInfo: main.CommitInfo, _, { cacheKey }) => {
        if (!commitInfo.repositoryId) {
          return null;
        }
        const cachedRepo = this.requestCache.getRepo(
          cacheKey,
          commitInfo.repositoryId
        );
        if (!cachedRepo) {
          return null;
        }

        return this.repositoryService.getKVLinkForCommit(
          cachedRepo,
          commitInfo as Commit
        );
      }
    ),
    stateLink: runWithHooks(
      () => [this.commitInfoRepositoryLoader],
      async (commitInfo: main.CommitInfo, _, { cacheKey }) => {
        if (!commitInfo.repositoryId) {
          return null;
        }
        const cachedRepo = this.requestCache.getRepo(
          cacheKey,
          commitInfo.repositoryId
        );
        if (!cachedRepo) {
          return null;
        }

        return this.repositoryService.getStateLinkForCommit(
          cachedRepo,
          commitInfo as Commit
        );
      }
    ),
  };

  public CommitState: main.CommitStateResolvers = {
    binaryRefs: runWithHooks(
      () => [this.commitStateBinaryRefsLoader],
      async (commitState: main.CommitState, _, { cacheKey }) => {
        if (!commitState?.repositoryId || !commitState?.sha) {
          return [];
        }
        const cachedBinaryRefs = this.requestCache.getCommitStateBinaryRefs(
          cacheKey,
          commitState?.repositoryId,
          commitState?.sha
        );
        if (!cachedBinaryRefs) {
          return [];
        }
        return cachedBinaryRefs;
      }
    ),
    pluginVersions: runWithHooks(
      () => [this.commitStatePluginVersionsLoader],
      async (commitState: main.CommitState, _, { cacheKey }) => {
        if (!commitState?.repositoryId || !commitState?.sha) {
          return null;
        }
        const cachedPluginVersions =
          this.requestCache.getCommitStatePluginVersions(
            cacheKey,
            commitState?.repositoryId,
            commitState?.sha
          );
        if (cachedPluginVersions) {
          return cachedPluginVersions;
        }
        return [];
      }
    ),
    canAutoFix: runWithHooks(
      () => [
        this.repositoryRemoteSettingsLoader,
        this.commitStateDatasourceLoader,
      ],
      async (commitState: main.CommitState, _, { cacheKey, currentUser }) => {
        if (!commitState?.repositoryId || !currentUser) {
          return null;
        }
        const cachedRemoteSettings = this.requestCache.getRepoRemoteSettings(
          cacheKey,
          commitState?.repositoryId
        );
        const userBranchRule = cachedRemoteSettings.branchRules?.find(
          (rule) => rule.branchId == commitState.branchId
        );
        if (!userBranchRule?.canAutofix) {
          return false;
        }
        if (!commitState.sha) {
          return false;
        }
        if (!commitState.canRevert) {
          return false;
        }

        const cachedDataSource = this.requestCache.getCommitStateDatasource(
          cacheKey,
          commitState.repositoryId as string,
          commitState.sha
        );
        if (!cachedDataSource) {
          return false;
        }
        return await getCanAutofixReversionIfNotWIP(
          cachedDataSource,
          commitState.repositoryId,
          commitState.sha
        );
      }
    ),
    canRevert: runWithHooks(
      () => [
        this.repositoryRemoteSettingsLoader,
        this.commitStateDatasourceLoader,
      ],
      async (commitState: main.CommitState, _, { cacheKey, currentUser }) => {
        if (!commitState?.repositoryId || !currentUser) {
          return null;
        }
        const cachedRemoteSettings = this.requestCache.getRepoRemoteSettings(
          cacheKey,
          commitState?.repositoryId
        );
        const userBranchRule = cachedRemoteSettings.branchRules?.find(
          (rule) => rule.branchId == commitState.branchId
        );
        if (!userBranchRule?.canRevert) {
          return false;
        }
        if (!commitState.sha) {
          return false;
        }
        if (!commitState.canRevert) {
          return false;
        }

        const cachedDataSource = this.requestCache.getCommitStateDatasource(
          cacheKey,
          commitState.repositoryId as string,
          commitState.sha
        );
        if (!cachedDataSource) {
          return false;
        }
        return await getCanRevert(
          cachedDataSource,
          commitState.repositoryId,
          commitState.sha
        );
      }
    ),
  };

  public BranchState: main.BranchStateResolvers = {
    proposedMergeRequest: runWithHooks(
      () => [
        this.repositoryRemoteSettingsLoader,
        this.repositoryCommitsLoader
      ],
      async (
        branchState: main.BranchState,
        { idx }: main.BranchStateProposedMergeRequestArgs,
        { cacheKey, currentUser }
      ) => {
        if (!branchState.repositoryId) {
          return null;
        }
        if (!currentUser?.id) {
          return null;
        }
        const repository = await this.repositoryService.getRepository(
          branchState.repositoryId
        );
        if (!repository) {
          return null;
        }
        const cachedBranches = this.requestCache.getRepoBranches(
          cacheKey,
          repository.id
        );
        const cachedCommits = this.requestCache.getRepoCommits(
          cacheKey,
          branchState.repositoryId
        );

        const commitMap: {[key: string]: Commit} = {};
        for (let i = 0; i < cachedCommits.length; ++i) {
          const commit = cachedCommits[i];
          commitMap[commit.sha as string] = commit;
        }

        const cachedRemoteSettings = this.requestCache.getRepoRemoteSettings(
          cacheKey,
          branchState.repositoryId
        );

        const branch = cachedBranches?.find(b => b.id == branchState.branchId);
        if (!branch?.lastCommit) {
          return null;
        }
        const baseBranch = cachedBranches?.find(b => b.id == branchState.baseBranchId);
        const baseBranchRule = cachedRemoteSettings?.branchRules?.find(b => b.branchId == baseBranch?.id);
        const canCreateMergeRequest = baseBranchRule?.canCreateMergeRequests ?? true;

        const datasource = await this.mergeRequestService.getMergeRequestDataSource(
          repository,
          branch,
          baseBranch
        );
        const divergenceOrigin = await getDivergenceOrigin(
          datasource,
          repository.id,
          branch?.lastCommit ?? undefined,
          baseBranch?.lastCommit ?? undefined
        );
        const divergenceSha: string = getMergeOriginSha(divergenceOrigin) as string;
        const isMerged = !!divergenceSha && divergenceOrigin.trueOrigin === branch?.lastCommit;
        const rebaseList = await getMergeRebaseCommitList(
          datasource,
          repository.id,
          branch?.lastCommit ?? null,
          currentUser as FloroUser,
          false
        );

        const history = this.repositoryService.getCommitHistory(
          cachedCommits,
          branch?.lastCommit
        );
        const ranges = this.repositoryService.getRevertRanges(history);
        const allPendingCommits = (
          rebaseList.length == 0
            ? this.repositoryService.getCommitHistoryBetween(
                cachedCommits,
                branch?.lastCommit,
                divergenceOrigin.fromOrigin ?? undefined
              )
            : rebaseList
        )?.map((c: CommitData | Commit) => commitMap[c.sha as string]);

        let pendingCommits: Array<CommitInfo>;
        if (idx === undefined || idx === null) {
          pendingCommits = allPendingCommits
            ?.slice(0, PAGINATION_LIMIT)
            .map((commit) => {
              return {
                ...commit,
                isReverted: this.repositoryService.isReverted(
                  ranges,
                  commit.idx
                ),
              };
            });
        } else {
          const startIdx = allPendingCommits.length - 1 - idx;
          pendingCommits = allPendingCommits
            .slice(startIdx, startIdx + PAGINATION_LIMIT)
            .map((commit) => {
              return {
                ...commit,
                isReverted: this.repositoryService.isReverted(
                  ranges,
                  commit.idx
                ),
              };
            });
        }

        const fromCommitState = await getCommitState(datasource, repository.id, branch?.lastCommit ?? null);
        const intoCommitState = await getCommitState(datasource, repository.id, baseBranch?.lastCommit ?? null);
        const originCommitState = await getCommitState(datasource, repository.id, divergenceSha);
        const isConflictFree = await canAutoMergeCommitStates(
          datasource,
          fromCommitState ?? EMPTY_COMMIT_STATE,
          intoCommitState ?? EMPTY_COMMIT_STATE,
          originCommitState ?? EMPTY_COMMIT_STATE
        );

        const canMerge = isConflictFree && !isMerged;
        const divergeCommit = divergenceOrigin ? commitMap[divergenceSha] : null;
        const mergeRequest = this.mergeRequestService.getExistingMergeRequestByBranch(repository.id, branch.id);
        const suggestedTitle = branch?.name ?? "";
        const suggestedDescription = allPendingCommits[allPendingCommits.length - 1]?.message ?? "";

        const divergenceState = divergeCommit ? {
          sha: divergeCommit.sha,
          originalSha: divergeCommit.originalSha,
          message: divergeCommit.message,
          username: divergeCommit.username,
          userId: divergeCommit.userId,
          authorUsername: divergeCommit.authorUsername,
          authorUserId: divergeCommit.authorUserId,
          authorUser: divergeCommit.authorUser,
          user: divergeCommit.user,
          idx: divergeCommit.idx,
          updatedAt: divergeCommit.updatedAt,
          repositoryId: branchState.repositoryId,
          branchId: branchState.branchId,
          branchHead: branchState.branchHead,
          isReverted: this.repositoryService.isReverted(
            ranges,
            divergeCommit.idx
          ),
          isValid: divergeCommit.isValid ?? true,
          kvLink: this.repositoryService.getKVLinkForCommit(repository, divergeCommit),
          stateLink: this.repositoryService.getStateLinkForCommit(repository, divergeCommit),
          lastUpdatedAt: divergeCommit?.updatedAt?.toISOString(),
        } : null;
        return {
          suggestedTitle,
          suggestedDescription,
          mergeRequest,
          baseBranch,
          isConflictFree,
          isMerged,
          canMerge,
          canCreateMergeRequest,
          pendingCommits,
          divergenceState,
          pendingCommitsCount: allPendingCommits.length
        };
      }
    ),
    commitState: runWithHooks(
      () => [this.repositoryCommitsLoader, this.repositoryRevertRangesLoader],
      async (
        branchState: main.BranchState,
        { sha }: main.BranchStateCommitStateArgs,
        { cacheKey }
      ) => {
        if (!branchState.repositoryId) {
          return null;
        }
        const cachedCommits = this.requestCache.getRepoCommits(
          cacheKey,
          branchState.repositoryId
        );
        const branchHeadCommit = cachedCommits.find(
          (c) => c.sha == branchState?.branchHead
        );
        const branchHistory = this.repositoryService.getCommitHistory(
          cachedCommits,
          branchState?.branchHead ?? ""
        );
        const commit =
          branchHistory.find((c) => c.sha == sha) ?? branchHeadCommit;
        if (!commit) {
          return null;
        }
        const repository = await this.repositoryService.getRepository(
          branchState.repositoryId
        );
        if (!repository) {
          return null;
        }
        const kvLink = this.repositoryService.getKVLinkForCommit(
          repository,
          commit
        );
        const stateLink = this.repositoryService.getStateLinkForCommit(
          repository,
          commit
        );

        const revertRanges = this.requestCache.getRepoRevertRanges(
          cacheKey,
          branchState?.repositoryId as string,
          branchState?.branchHead as string
        );

        return {
          sha: commit.sha,
          originalSha: commit.originalSha,
          message: commit.message,
          username: commit.username,
          userId: commit.userId,
          authorUsername: commit.authorUsername,
          authorUserId: commit.authorUserId,
          authorUser: commit.authorUser,
          user: commit.user,
          idx: commit.idx,
          updatedAt: commit.updatedAt,
          repositoryId: branchState.repositoryId,
          branchId: branchState.branchId,
          branchHead: branchState.branchHead,
          isReverted: this.repositoryService.isReverted(
            revertRanges,
            commit?.idx
          ),
          isValid: commit.isValid ?? true,
          kvLink,
          stateLink,
          lastUpdatedAt: commit?.updatedAt?.toISOString(),
        };
      }
    ),
    commitsSize: runWithHooks(
      () => [this.repositoryCommitHistoryLoader],
      async (branchState: main.BranchState, _, { cacheKey }) => {
        const commitHistory = this.requestCache.getRepoCommitHistory(
          cacheKey,
          branchState?.repositoryId as string,
          branchState?.branchHead as string
        );
        if (commitHistory) {
          return commitHistory?.length;
        }
        return 0;
      }
    ),
    commits: runWithHooks(
      () => [
        this.repositoryCommitHistoryLoader,
        this.repositoryRevertRangesLoader,
      ],
      async (
        branchState: main.BranchState,
        { idx, searchQuery }: main.BranchStateCommitsArgs,
        { cacheKey }
      ) => {
        if ((searchQuery ?? "")?.trim()?.length > 0) {
          return [];
        }
        const commitHistory = this.requestCache.getRepoCommitHistory(
          cacheKey,
          branchState?.repositoryId as string,
          branchState?.branchHead as string
        );

        const revertRanges = this.requestCache.getRepoRevertRanges(
          cacheKey,
          branchState?.repositoryId as string,
          branchState?.branchHead as string
        );
        if (commitHistory) {
          if (idx === undefined || idx === null) {
            return commitHistory?.slice(0, PAGINATION_LIMIT).map((commit) => {
              return {
                ...commit,
                isReverted: this.repositoryService.isReverted(
                  revertRanges,
                  commit.idx
                ),
              };
            });
          }
          if (idx >= commitHistory.length) {
            return [];
          }
          const startIdx = commitHistory.length - 1 - idx;
          return commitHistory
            .slice(startIdx, startIdx + PAGINATION_LIMIT)
            .map((commit) => {
              return {
                ...commit,
                isReverted: this.repositoryService.isReverted(
                  revertRanges,
                  commit.idx
                ),
              };
            });
        }
        return [];
      }
    ),

    commitSearch: runWithHooks(
      () => [
        this.repositoryCommitHistoryLoader,
        this.repositoryRevertRangesLoader,
      ],
      async (
        branchState: main.BranchState,
        { searchQuery }: main.BranchStateCommitSearchArgs,
        { cacheKey }
      ) => {
        const commitHistory = this.requestCache.getRepoCommitHistory(
          cacheKey,
          branchState?.repositoryId as string,
          branchState?.branchHead as string
        );
        const revertRanges = this.requestCache.getRepoRevertRanges(
          cacheKey,
          branchState?.repositoryId as string,
          branchState?.branchHead as string
        );
        if (commitHistory) {
          if ((searchQuery ?? "")?.trim() == "") {
            return [];
          }
          const results = commitHistory?.filter((commit) => {
            if ((searchQuery?.length ?? 0) > 2) {
              if (commit?.sha?.startsWith(searchQuery?.toLowerCase() ?? "")) {
                return true;
              }
            }
            if (searchQuery?.startsWith("@")) {
              if (
                ("@" + commit?.username?.toLowerCase())?.indexOf(
                  searchQuery?.toLowerCase() ?? ""
                ) != -1 ||
                ("@" + commit?.authorUsername?.toLowerCase())?.indexOf(
                  searchQuery?.toLowerCase() ?? ""
                ) != -1
              ) {
                return true;
              }
            }
            if (
              (searchQuery?.length ?? 0) > 2 &&
              commit?.message
                ?.toLowerCase()
                ?.indexOf(searchQuery?.toLowerCase() ?? "") != -1
            ) {
              return true;
            }
            return false;
          });
          return results?.slice(0, PAGINATION_LIMIT).map((commit) => {
            return {
              ...commit,
              isReverted: this.repositoryService.isReverted(
                revertRanges,
                commit.idx
              ),
            };
          });
        }
        return [];
      }
    ),
  };

  public Query: main.QueryResolvers = {
    fetchRepositoryById: runWithHooks(
      () => [],
      async (
        _,
        { id }: main.QueryFetchRepositoryByIdArgs,
        { cacheKey, currentUser }
      ) => {
        const repository = await this.repositoryService.fetchRepoById(id);
        if (!repository?.isPrivate) {
          // cache repo
          return {
            __typename: "FetchRepositorySuccess",
            repository,
          };
        }
        if (!currentUser) {
          return {
            __typename: "FetchRepositoryError",
            type: "REPO_ERROR",
            message: "Repo error",
          };
        }
        if (
          repository?.repoType == "user_repo" &&
          currentUser?.id == repository?.userId
        ) {
          return {
            __typename: "FetchRepositorySuccess",
            repository,
          };
        }

        if (
          repository?.repoType == "user_repo" &&
          currentUser?.id != repository?.userId
        ) {
          return {
            __typename: "FetchRepositoryError",
            type: "REPO_ERROR",
            message: "Repo error",
          };
        }
        const organizationMembersContext =
          await this.contextFactory.createContext(OrganizationMembersContext);
        const member = await organizationMembersContext.getByOrgIdAndUserId(
          repository.organizationId as string,
          currentUser.id
        );
        if (member?.membershipState == "active") {
          return {
            __typename: "FetchRepositorySuccess",
            repository,
          };
        }
        return {
          __typename: "FetchRepositoryError",
          type: "REPO_ERROR",
          message: "Repo error",
        };
      }
    ),
    fetchRepositoryByName: runWithHooks(
      () => [],
      async (
        _,
        { repoName, ownerHandle }: main.QueryFetchRepositoryByNameArgs,
        { cacheKey, currentUser }
      ) => {
        const repository = await this.repositoryService.fetchRepoByName(
          ownerHandle ?? "",
          repoName ?? ""
        );
        if (!repository?.isPrivate) {
          // cache repo
          return {
            __typename: "FetchRepositorySuccess",
            repository,
          };
        }
        if (!currentUser) {
          return {
            __typename: "FetchRepositoryError",
            type: "REPO_ERROR",
            message: "Repo error",
          };
        }
        if (
          repository?.repoType == "user_repo" &&
          currentUser?.id == repository?.userId
        ) {
          return {
            __typename: "FetchRepositorySuccess",
            repository,
          };
        }

        if (
          repository?.repoType == "user_repo" &&
          currentUser?.id != repository?.userId
        ) {
          return {
            __typename: "FetchRepositoryError",
            type: "REPO_ERROR",
            message: "Repo error",
          };
        }
        const organizationMembersContext =
          await this.contextFactory.createContext(OrganizationMembersContext);
        const member = await organizationMembersContext.getByOrgIdAndUserId(
          repository.organizationId as string,
          currentUser.id
        );
        if (member?.membershipState == "active") {
          return {
            __typename: "FetchRepositorySuccess",
            repository,
          };
        }
        return {
          __typename: "FetchRepositoryError",
          type: "REPO_ERROR",
          message: "Repo error",
        };
      }
    ),
  };

  public Mutation: main.MutationResolvers = {
    createUserRepository: runWithHooks(
      () => [this.loggedInUserGuard],
      async (
        _root,
        { name, isPrivate, licenseCode }: main.MutationCreateUserRepositoryArgs,
        { currentUser }
      ) => {
        if (!currentUser) {
          return {
            __typename: "CreateUserRepositoryError",
            message: "Forbidden Action",
            type: "FORBIDDEN_ACTION_ERROR",
          };
        }
        const result = await this.repositoryService.createUserRepository(
          currentUser,
          name,
          isPrivate,
          licenseCode
        );
        if (result.action == "REPO_CREATED") {
          return {
            __typename: "CreateUserRepositorySuccess",
            repository: result.repository,
            user: currentUser,
          };
        }
        if (result.action == "LOG_ERROR") {
          console.error(
            result.error?.type,
            result?.error?.message,
            result?.error?.meta
          );
          return {
            __typename: "CreateUserRepositoryError",
            message: "Unknown Error",
            type: "UNKNOWN_ERROR",
          };
        }
        return {
          __typename: "CreateUserRepositoryError",
          message: result.error?.message ?? "Unknown Error",
          type: result.error?.type ?? "UNKNOWN_ERROR",
        };
      }
    ),
    createOrgRepository: runWithHooks(
      () => [
        this.loggedInUserGuard,
        this.rootOrganizationMemberPermissionsLoader,
      ],
      async (
        _root,
        {
          organizationId,
          name,
          isPrivate,
          licenseCode,
        }: main.MutationCreateOrgRepositoryArgs,
        { currentUser, cacheKey }
      ) => {
        if (!currentUser) {
          return {
            __typename: "CreateOrganizationRepositoryError",
            message: "Forbidden Action",
            type: "FORBIDDEN_ACTION_ERROR",
          };
        }
        const organization = this.requestCache.getOrganization(
          cacheKey,
          organizationId
        );
        if (!organization) {
          return {
            __typename: "CreateOrganizationRepositoryError",
            message: "Forbidden Action",
            type: "FORBIDDEN_ACTION_ERROR",
          };
        }
        const membership = this.requestCache.getOrganizationMembership(
          cacheKey,
          organizationId,
          currentUser.id
        );
        if (!membership) {
          return {
            __typename: "CreateOrganizationRepositoryError",
            message: "Forbidden Action",
            type: "FORBIDDEN_ACTION_ERROR",
          };
        }

        const permissions = this.requestCache.getMembershipPermissions(
          cacheKey,
          membership.id
        );
        if (!permissions.canCreateRepos) {
          return {
            __typename: "CreateOrganizationRepositoryError",
            message: "Forbidden Action",
            type: "FORBIDDEN_ACTION_ERROR",
          };
        }
        const result =
          await this.repositoryService.createOrganizationRepository(
            organization,
            currentUser,
            name,
            isPrivate,
            licenseCode
          );
        if (result.action == "REPO_CREATED") {
          return {
            __typename: "CreateOrganizationRepositorySuccess",
            repository: result.repository,
            organization: organization,
          };
        }
        if (result.action == "LOG_ERROR") {
          console.error(
            result.error?.type,
            result?.error?.message,
            result?.error?.meta
          );
          return {
            __typename: "CreateOrganizationRepositoryError",
            message: "Unknown Error",
            type: "UNKNOWN_ERROR",
          };
        }
        return {
          __typename: "CreateOrganizationRepositoryError",
          message: result.error?.message ?? "Unknown Error",
          type: result.error?.type ?? "UNKNOWN_ERROR",
        };
      }
    ),
    ignoreBranch: runWithHooks(
      () => [this.loggedInUserGuard],
      async (_, { repositoryId, branchId }, { currentUser, cacheKey }) => {
        if (!repositoryId || !branchId) {
          return {
            __typename: "IgnoreBranchError",
            message: "Invalid Params",
            type: "INVALID_PARAMS_ERROR",
          };
        }
        const repository = await this.repositoryService.fetchRepoById(
          repositoryId
        );
        if (!repository) {
          return {
            __typename: "IgnoreBranchError",
            message: "Repo Not Found",
            type: "REPO_NOT_FOUND_ERROR",
          };
        }
        if (repository?.isPrivate) {
          if (repository?.repoType == "user_repo") {
            if (repository?.userId != currentUser.id) {
              return {
                __typename: "IgnoreBranchError",
                message: "Forbidden Action",
                type: "FORBIDDEN_ACTION_ERROR",
              };
            }
          }
          if (repository?.repoType == "org_repo") {
            const organizationMembersContext =
              await this.contextFactory.createContext(
                OrganizationMembersContext
              );
            const member = await organizationMembersContext.getByOrgIdAndUserId(
              repository.organizationId as string,
              currentUser.id
            );
            if (member?.membershipState != "active") {
              return {
                __typename: "IgnoreBranchError",
                message: "Forbidden Action",
                type: "FORBIDDEN_ACTION_ERROR",
              };
            }
          }
        }

        const branches =
          (await this.repositoryService.getBranches(repositoryId as string)) ??
          [];
        const remoteSettings =
          await this.repositoryService.fetchRepoSettingsForUser(
            repositoryId,
            currentUser
          );
        if (!remoteSettings) {
          return {
            __typename: "IgnoreBranchError",
            message: "Forbidden Action",
            type: "FORBIDDEN_ACTION_ERROR",
          };
        }

        const openUserBranches = await this.branchService.getOpenBranchesByUser(
          repository as Repository,
          currentUser,
          branches,
          remoteSettings,
          true
        );
        const openBranch = openUserBranches.find((b) => b.id == branchId);
        if (!openBranch) {
          return {
            __typename: "IgnoreBranchError",
            message: "Open Branch Not Found",
            type: "OPEN_BRANCH_NOT_FOUND_ERROR",
          };
        }

        const ignoredBranchNotificationsContext =
          await this.contextFactory.createContext(
            IgnoredBranchNotificationsContext
          );
        await ignoredBranchNotificationsContext.create({
          branchId,
          repositoryId,
          userId: currentUser.id,
          isDeleted: false,
        });
        return {
          __typename: "IgnoreBranchSuccess",
          repository,
        };
      }
    ),
  };

  public Subscription: main.SubscriptionResolvers = {
    repositoryUpdated: {
      subscribe: withFilter(
        (_, { repositoryId }) => {
          if (repositoryId) {
            return this.pubsub.asyncIterator(
              `REPOSITORY_UPDATED:${repositoryId}`
            );
          }
          return this.pubsub.asyncIterator([]);
        },
        runWithHooks(
          () => [],
          async (
            payload: { repositoryUpdated: Repository },
            { repositoryId },
            { currentUser }
          ) => {
            if (!repositoryId) {
              return false;
            }
            if (payload?.repositoryUpdated?.id != repositoryId) {
              return false;
            }
            if (!payload.repositoryUpdated.isPrivate) {
              return true;
            }
            if (payload?.repositoryUpdated?.repoType == "user_repo") {
              return (
                currentUser &&
                currentUser?.id == payload?.repositoryUpdated?.userId
              );
            }
            if (!currentUser) {
              return false;
            }

            const organizationMembersContext =
              await this.contextFactory.createContext(
                OrganizationMembersContext
              );
            const membership =
              await organizationMembersContext.getByOrgIdAndUserId(
                payload.repositoryUpdated.organizationId as string,
                currentUser.id
              );
            return membership?.membershipState == "active";
          }
        )
      ) as unknown as SubscriptionSubscribeFn<any, any, any, any>,
    },
  };
}
