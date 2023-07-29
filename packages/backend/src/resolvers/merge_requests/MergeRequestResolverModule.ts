import BaseResolverModule from "../BaseResolverModule";
import { main } from "@floro/graphql-schemas";
import { inject, injectable } from "inversify";
import LoggedInUserGuard from "../hooks/guards/LoggedInUserGuard";
import { runWithHooks } from "../hooks/ResolverHook";
import RequestCache from "../../request/RequestCache";
import ContextFactory from "@floro/database/src/contexts/ContextFactory";
import MergeRequestService from "../../services/merge_requests/MergeRequestService";
import RootRepositoryLoader from "../hooks/loaders/Root/RepositoryID/RepositoryLoader";
import RepoAccessGuard from "../hooks/guards/RepoAccessGuard";
import MergeRequestLoader from "../hooks/loaders/MergeRequest/MergeRequestLoader";
import MergeRequestAccessGuard from "../hooks/guards/MergeRequestAccessGuard";
import MergeRequestCommentLoader from "../hooks/loaders/MergeRequest/MergeRequestCommentLoader";
import MergeRequestCommentAccessGuard from "../hooks/guards/MergeRequestCommentAccessGuard";
import MergeRequestCommentReplyLoader from "../hooks/loaders/MergeRequest/MergeRequestCommentReplyLoader";
import MergeRequestCommentReplyAccessGuard from "../hooks/guards/MergeRequestCommentAccessReplyGuard";
import RepositoryCommitsLoader from "../hooks/loaders/Repository/RepositoryCommitsLoader";
import { MergeRequest as DBMergeRequest } from "@floro/database/src/entities/MergeRequest";
import {
  CommitInfo,
  MergeRequest,
  PluginVersion,
} from "@floro/graphql-schemas/build/generated/main-graphql";
import RepositoryDatasourceFactoryService from "../../services/repositories/RepoDatasourceFactoryService";
import RepositoryBranchesLoader from "../hooks/loaders/Repository/RepositoryBranchesLoader";
import OpenMergeRequestsLoader from "../hooks/loaders/MergeRequest/OpenMergeRequestsLoader";
import ClosedMergeRequestsLoader from "../hooks/loaders/MergeRequest/ClosedMergeRequestsLoader";
import { Commit } from "@floro/database/src/entities/Commit";
import RepositoryService from "../../services/repositories/RepositoryService";
import MergeRequestEventService from "../../services/merge_requests/MergeRequestEventService";
import MergeRequestPermissionsLoader from "../hooks/loaders/MergeRequest/MergeRequestPermissionsLoader";
import RepoSettingsService from "../../services/repositories/RepoSettingsService";
import ReviewerRequestsContext from "@floro/database/src/contexts/merge_requests/ReviewerRequestsContext";
import {
  ApplicationKVState,
  EMPTY_COMMIT_STATE,
  canAutoMergeCommitStates,
  getDivergenceOrigin,
  getMergeOriginSha,
} from "floro/dist/src/repo";
import RepoDataService from "../../services/repositories/RepoDataService";
import { withFilter } from "graphql-subscriptions";
import { SubscriptionSubscribeFn } from "@floro/graphql-schemas/build/generated/admin-graphql";
import OrganizationMembersContext from "@floro/database/src/contexts/organizations/OrganizationMembersContext";
import OrganizationMemberRolesContext from "@floro/database/src/contexts/organizations/OrganizationMemberRolesContext";
import RepositoryEnabledRoleSettingsContext from "@floro/database/src/contexts/repositories/RepositoryEnabledRoleSettingsContext";
import RepositoryEnabledUserSettingsContext from "@floro/database/src/contexts/repositories/RepositoryEnabledUserSettingsContext";
import ReviewerStatusesContext from "@floro/database/src/contexts/merge_requests/ReviewStatusesContext";
import MergeRequestCommentsContext from "@floro/database/src/contexts/merge_requests/MergeRequestCommentsContext";
import MergeRequestCommentsLoader from "../hooks/loaders/MergeRequest/MergeRequestCommentsLoader";

const PAGINATION_LIMIT = 10;

@injectable()
export default class MergeRequestResolverModule extends BaseResolverModule {
  public resolvers: Array<keyof this & keyof main.ResolversTypes> = [
    "Query",
    "Mutation",
    "Subscription",
    "MergeRequest",
  ];
  protected contextFactory!: ContextFactory;
  protected requestCache!: RequestCache;
  protected mergeRequestService!: MergeRequestService;
  protected mergeRequestEventService!: MergeRequestEventService;
  protected repoDataService!: RepoDataService;
  protected repositoryDatasourceFactoryService!: RepositoryDatasourceFactoryService;

  //loaders
  protected rootRepositoryLoader!: RootRepositoryLoader;
  protected mergeRequestLoader!: MergeRequestLoader;
  protected mergeRequestCommentLoader!: MergeRequestCommentLoader;
  protected mergeRequestCommentReplyLoader!: MergeRequestCommentReplyLoader;

  protected repositoryCommitsLoader!: RepositoryCommitsLoader;
  protected repositoryBranchesLoader!: RepositoryBranchesLoader;
  protected repoSettingsService!: RepoSettingsService;

  // guards
  protected loggedInUserGuard!: LoggedInUserGuard;
  protected repoAccessGuard!: RepoAccessGuard;
  protected mergeRequestCommentAccessGuard!: MergeRequestCommentAccessGuard;
  protected mergeRequestAccessGuard!: MergeRequestAccessGuard;
  protected mergeRequestCommentReplyAccessGuard!: MergeRequestCommentReplyAccessGuard;
  protected openMergeRequestsLoader!: OpenMergeRequestsLoader;
  protected closedMergeRequestsLoader!: ClosedMergeRequestsLoader;
  protected mergeRequestPermissionsLoader!: MergeRequestPermissionsLoader;
  protected mergeRequestCommentsLoader!: MergeRequestCommentsLoader;

  constructor(
    @inject(ContextFactory) contextFactory: ContextFactory,
    @inject(RequestCache) requestCache: RequestCache,
    @inject(RepositoryDatasourceFactoryService)
    repositoryDatasourceFactoryService: RepositoryDatasourceFactoryService,
    @inject(MergeRequestService) mergeRequestService: MergeRequestService,
    @inject(MergeRequestEventService)
    mergeRequestEventService: MergeRequestEventService,
    @inject(LoggedInUserGuard) loggedInUserGuard: LoggedInUserGuard,
    @inject(RootRepositoryLoader) rootRepositoryLoader: RootRepositoryLoader,
    @inject(RepoAccessGuard) repoAccessGuard: RepoAccessGuard,
    @inject(RepositoryBranchesLoader)
    repositoryBranchesLoader: RepositoryBranchesLoader,
    @inject(RepositoryCommitsLoader)
    repositoryCommitsLoader: RepositoryCommitsLoader,
    @inject(MergeRequestLoader) mergeRequestLoader: MergeRequestLoader,
    @inject(MergeRequestAccessGuard)
    mergeRequestAccessGuard: MergeRequestAccessGuard,
    @inject(MergeRequestCommentReplyAccessGuard)
    mergeRequestCommentReplyAccessGuard: MergeRequestCommentReplyAccessGuard,
    @inject(MergeRequestCommentLoader)
    mergeRequestCommentLoader: MergeRequestCommentLoader,
    @inject(MergeRequestCommentAccessGuard)
    mergeRequestCommentAccessGuard: MergeRequestCommentAccessGuard,
    @inject(MergeRequestCommentReplyLoader)
    mergeRequestCommentReplyLoader: MergeRequestCommentReplyLoader,
    @inject(OpenMergeRequestsLoader)
    openMergeRequestsLoader: OpenMergeRequestsLoader,
    @inject(ClosedMergeRequestsLoader)
    closedMergeRequestsLoader: ClosedMergeRequestsLoader,
    @inject(MergeRequestPermissionsLoader)
    mergeRequestPermissionsLoader: MergeRequestPermissionsLoader,
    @inject(RepoDataService)
    repoDataService: RepoDataService,
    @inject(RepoSettingsService) repoSettingsService: RepoSettingsService,
    @inject(MergeRequestCommentsLoader) mergeRequestCommentsLoader: MergeRequestCommentsLoader,
  ) {
    super();
    this.requestCache = requestCache;
    this.contextFactory = contextFactory;
    this.mergeRequestService = mergeRequestService;
    this.mergeRequestEventService = mergeRequestEventService;
    this.repoDataService = repoDataService;
    this.repositoryDatasourceFactoryService =
      repositoryDatasourceFactoryService;
    this.repoSettingsService = repoSettingsService;

    // guards
    this.loggedInUserGuard = loggedInUserGuard;
    this.repoAccessGuard = repoAccessGuard;
    this.mergeRequestAccessGuard = mergeRequestAccessGuard;
    this.mergeRequestCommentAccessGuard = mergeRequestCommentAccessGuard;
    this.mergeRequestCommentReplyAccessGuard =
      mergeRequestCommentReplyAccessGuard;

    // loaders
    this.rootRepositoryLoader = rootRepositoryLoader;
    this.mergeRequestCommentLoader = mergeRequestCommentLoader;
    this.mergeRequestCommentReplyLoader = mergeRequestCommentReplyLoader;
    this.mergeRequestLoader = mergeRequestLoader;
    this.mergeRequestPermissionsLoader = mergeRequestPermissionsLoader;
    this.mergeRequestCommentsLoader = mergeRequestCommentsLoader;

    this.openMergeRequestsLoader = openMergeRequestsLoader;
    this.closedMergeRequestsLoader = closedMergeRequestsLoader;

    this.repositoryCommitsLoader = repositoryCommitsLoader;
    this.repositoryBranchesLoader = repositoryBranchesLoader;
  }

  public Query: main.QueryResolvers = {
    searchUsersForReview: runWithHooks(
      () => [
        this.loggedInUserGuard,
        this.repoAccessGuard,
        this.rootRepositoryLoader,
        this.mergeRequestLoader,
      ],
      async (
        _,
        args: main.QuerySearchUsersForReviewArgs,
        { cacheKey, currentUser }
      ) => {
        const repository = this.requestCache.getRepo(
          cacheKey,
          args.repositoryId
        );

        const mergeRequest = this.requestCache.getMergeRequest(
          cacheKey,
          args.mergeRequestId
        );
        if (
          !currentUser ||
          !repository ||
          !mergeRequest ||
          repository.id != mergeRequest.repositoryId
        ) {
          return {
            __typename: "SearchUsersForReviewError",
            message: "Unknown Error",
            type: "UNKNOWN_ERROR",
          };
        }
        const users =
          await this.repoSettingsService.searchUsersThatCanApproveMergeRequest(
            repository,
            mergeRequest,
            (args.excludedUserIds as Array<string>) ?? ([] as Array<string>),
            args.query ?? ""
          );
        return {
          __typename: "SearchUsersForReviewSuccess",
          users,
        };
      }
    ),
  };

  public MergeRequest: main.MergeRequestResolvers = {
    branchState: runWithHooks(
      () => [
        this.rootRepositoryLoader,
        this.repositoryBranchesLoader,
        this.repositoryCommitsLoader,
      ],
      async (mergeRequest: MergeRequest, _, { cacheKey }) => {
        const dbMergeRequest = mergeRequest as DBMergeRequest;
        if (!dbMergeRequest?.repositoryId) {
          return null;
        }
        const repository = this.requestCache.getRepo(
          cacheKey,
          dbMergeRequest?.repositoryId
        );
        if (!repository) {
          return null;
        }
        const cachedBranches = this.requestCache.getRepoBranches(
          cacheKey,
          dbMergeRequest.repositoryId
        );
        if (!cachedBranches) {
          return null;
        }
        const branch = cachedBranches.find(
          (b) => b.id == dbMergeRequest.branchId
        );
        if (!branch) {
          return null;
        }
        return {
          branchId: branch.id,
          updatedAt: branch.updatedAt,
          baseBranchId: branch?.baseBranchId,
          defaultBranchId: repository.defaultBranchId,
          name: branch.name,
          branchHead: branch.lastCommit ?? null,
          repositoryId: repository.id,
        };
      }
    ),

    mergeRequestPermissions: runWithHooks(
      () => [this.mergeRequestPermissionsLoader],
      async (mergeRequest: MergeRequest, _, { cacheKey }) => {
        if (!mergeRequest?.id) {
          return null;
        }
        const permission = this.requestCache.getMergeRequestPermissions(
          cacheKey,
          mergeRequest?.id
        );
        return permission ?? null;
      }
    ),
    timelineEvents: runWithHooks(
      () => [],
      async (mergeRequest: MergeRequest, _, { cacheKey }) => {
        //const timelineEvents = this.mergeRequest
        if (!mergeRequest?.id) {
          return [];
        }
        return await this.mergeRequestEventService.fetchTimelineForMergeRequest(
          mergeRequest.id
        );
      }
    ),
    reviewerRequests: runWithHooks(
      () => [],
      async (mergeRequest: MergeRequest, _, { cacheKey }) => {
        //const timelineEvents = this.mergeRequest
        if (!mergeRequest?.id) {
          return [];
        }

        const reviewerRequestsContext = await this.contextFactory.createContext(
          ReviewerRequestsContext
        );
        const openReviewerRequests =
          await reviewerRequestsContext.getReviewerRequestsByMergeRequestId(
            mergeRequest.id
          );
        return openReviewerRequests;
      }
    ),

    reviewStatuses: runWithHooks(
      () => [],
      async (mergeRequest: MergeRequest, _, { cacheKey }) => {
        if (!mergeRequest?.id) {
          return [];
        }
        const reviewerStatusesContext = await this.contextFactory.createContext(
          ReviewerStatusesContext
        );
        return await reviewerStatusesContext.getMergeRequestReviewStatuses(
          mergeRequest.id
        );
      }
    ),
    comments: runWithHooks(
      () => [this.mergeRequestCommentsLoader],
      async (mergeRequest: MergeRequest, _, { cacheKey }) => {
        if (!mergeRequest?.id) {
          return [];
        }
        const comments = this.requestCache.getMergeRequestComments(cacheKey, mergeRequest.id);
        if (!comments) {
          return [];
        }
        return comments;
      }
    ),
    commentPluginVersions: runWithHooks(
      () => [this.mergeRequestCommentsLoader],
      async (mergeRequest: MergeRequest, _, { cacheKey }) => {
        if (!mergeRequest?.id) {
          return [];
        }
        const comments = this.requestCache.getMergeRequestComments(cacheKey, mergeRequest.id);
        if (!comments) {
          return [];
        }
        const pluginVersions = comments?.filter(v => !!v.pluginVersion)?.map(v => v.pluginVersion);
        const uniquePluginVersions: Array<PluginVersion> = [];
        const seen = new Set<string>([]);
        for (const pluginVersion of pluginVersions) {
          if (!seen.has(pluginVersion.id)) {
            seen.add(pluginVersion.id);
            uniquePluginVersions.push(pluginVersion);
          }
        }
        return uniquePluginVersions;
      }
    ),
    commits: runWithHooks(
      () => [this.repositoryBranchesLoader, this.repositoryCommitsLoader],
      async (
        mergeRequest: MergeRequest,
        { idx }: main.MergeRequestCommitsArgs,
        { cacheKey }
      ) => {
        const dbMergeRequest = mergeRequest as DBMergeRequest;
        if (!dbMergeRequest?.repositoryId) {
          return [];
        }
        const cachedCommits = this.requestCache.getRepoCommits(
          cacheKey,
          dbMergeRequest.repositoryId
        );
        if (!cachedCommits) {
          return [];
        }

        const commitMap: { [key: string]: Commit } = {};
        for (let i = 0; i < cachedCommits.length; ++i) {
          const commit = cachedCommits[i];
          commitMap[commit.sha as string] = commit;
        }

        const cachedBranches = this.requestCache.getRepoBranches(
          cacheKey,
          dbMergeRequest.repositoryId
        );
        if (!cachedBranches) {
          return [];
        }
        const branch = cachedBranches?.find(
          (b) => b.id == dbMergeRequest.branchId
        );
        if (!branch?.lastCommit) {
          return [];
        }

        const history = this.repoDataService.getCommitHistory(
          cachedCommits,
          branch?.lastCommit
        );
        const ranges = this.repoDataService.getRevertRanges(history);

        const allPendingCommits = this.repositoryDatasourceFactoryService
          .getCommitsInRange(
            cachedCommits,
            branch?.lastCommit,
            dbMergeRequest.divergenceSha ?? undefined
          )
          ?.map((c: Commit) => commitMap[c.sha as string]);

        let pendingCommits: Array<CommitInfo>;
        if (idx === undefined || idx === null) {
          pendingCommits = allPendingCommits
            ?.slice(0, PAGINATION_LIMIT)
            .map((commit) => {
              return {
                ...commit,
                isReverted: this.repoDataService.isReverted(ranges, commit.idx),
              };
            });
        } else {
          const startIdx = idx;
          pendingCommits = allPendingCommits
            .slice(startIdx, startIdx + PAGINATION_LIMIT)
            .map((commit) => {
              return {
                ...commit,
                isReverted: this.repoDataService.isReverted(ranges, commit.idx),
              };
            });
        }
        return pendingCommits;
      }
    ),
    commitsCount: runWithHooks(
      () => [this.repositoryBranchesLoader, this.repositoryCommitsLoader],
      async (
        mergeRequest: MergeRequest,
        { idx }: main.MergeRequestCommitsArgs,
        { cacheKey }
      ) => {
        const dbMergeRequest = mergeRequest as DBMergeRequest;
        if (!dbMergeRequest?.repositoryId) {
          return 0;
        }
        const cachedCommits = this.requestCache.getRepoCommits(
          cacheKey,
          dbMergeRequest.repositoryId
        );
        if (!cachedCommits) {
          return 0;
        }

        const commitMap: { [key: string]: Commit } = {};
        for (let i = 0; i < cachedCommits.length; ++i) {
          const commit = cachedCommits[i];
          commitMap[commit.sha as string] = commit;
        }

        const cachedBranches = this.requestCache.getRepoBranches(
          cacheKey,
          dbMergeRequest.repositoryId
        );
        if (!cachedBranches) {
          return 0;
        }
        const branch = cachedBranches?.find(
          (b) => b.id == dbMergeRequest.branchId
        );
        if (!branch?.lastCommit) {
          return 0;
        }
        const allPendingCommits =
          this.repositoryDatasourceFactoryService.getCommitsInRange(
            cachedCommits,
            branch?.lastCommit,
            dbMergeRequest.divergenceSha
          );
        return allPendingCommits.length;
      }
    ),
    divergenceState: runWithHooks(
      () => [this.rootRepositoryLoader, this.repositoryBranchesLoader, this.repositoryCommitsLoader],
      async (
        mergeRequest: MergeRequest,
        _,
        { cacheKey }
      ) => {
        const dbMergeRequest = mergeRequest as DBMergeRequest;

        if (!dbMergeRequest?.repositoryId) {
          return null;
        }

        const repository = this.requestCache.getRepo(
          cacheKey,
          dbMergeRequest?.repositoryId
        );
        if (!repository) {
          return null;
        }

        const cachedCommits = this.requestCache.getRepoCommits(
          cacheKey,
          dbMergeRequest.repositoryId
        );
        if (!cachedCommits) {
          return null;
        }

        const commitMap: { [key: string]: Commit } = {};
        for (let i = 0; i < cachedCommits.length; ++i) {
          const commit = cachedCommits[i];
          commitMap[commit.sha as string] = commit;
        }

        const cachedBranches = this.requestCache.getRepoBranches(
          cacheKey,
          dbMergeRequest.repositoryId
        );
        if (!cachedBranches) {
          return null;
        }
        const branch = cachedBranches?.find(
          (b) => b.id == dbMergeRequest.branchId
        );
        if (!branch?.lastCommit) {
          return null;
        }

        const history = this.repoDataService.getCommitHistory(
          cachedCommits,
          branch?.lastCommit
        );
        const ranges = this.repoDataService.getRevertRanges(history);
        const divergeCommit = commitMap[dbMergeRequest.divergenceSha ?? ''];
        if (!divergeCommit) {
          return null;
        }
        const divergenceState = divergeCommit
          ? {
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
              repositoryId: dbMergeRequest.repositoryId,
              branchId: branch.id,
              branchHead: branch?.lastCommit,
              isReverted: this.repoDataService.isReverted(
                ranges,
                divergeCommit.idx
              ),
              isValid: divergeCommit.isValid ?? true,
              kvLink: this.repoDataService.getKVLinkForCommit(
                repository,
                divergeCommit
              ),
              stateLink: this.repoDataService.getStateLinkForCommit(
                repository,
                divergeCommit
              ),
              lastUpdatedAt: divergeCommit?.updatedAt?.toISOString(),
            }
          : null;
        return divergenceState;
      }
    ),
  };

  // need repo loader
  // need repo permission tester
  public Mutation: main.MutationResolvers = {
    createMergeRequest: runWithHooks(
      () => [
        this.loggedInUserGuard,
        this.repoAccessGuard,
        this.rootRepositoryLoader,
      ],
      async (
        _,
        args: main.MutationCreateMergeRequestArgs,
        { currentUser, cacheKey }
      ) => {
        const repository = this.requestCache.getRepo(
          cacheKey,
          args.repositoryId
        );

        const result = await this.mergeRequestService.createMergeRequest(
          repository,
          args.branchId,
          currentUser,
          args.title,
          args.description
        );
        if (result.action == "MERGE_REQUEST_CREATED") {
          return {
            __typename: "CreateMergeRequestSuccess",
            repository: repository,
            mergeRequest: result.mergeRequest,
          };
        }
        if (result.action == "LOG_ERROR") {
          console.error(
            result.error?.type,
            result?.error?.message,
            result?.error?.meta
          );
          return {
            __typename: "CreateMergeRequestError",
            message: "Unknown Error",
            type: "UNKNOWN_ERROR",
          };
        }
        return {
          __typename: "CreateMergeRequestError",
          message: result.error?.message ?? "Unknown Error",
          type: result.error?.type ?? "UNKNOWN_ERROR",
        };
      }
    ),
    updateMergeRequestInfo: runWithHooks(
      () => [
        this.loggedInUserGuard,
        this.repoAccessGuard,
        this.rootRepositoryLoader,
        this.mergeRequestLoader,
        this.mergeRequestAccessGuard,
      ],
      async (
        _,
        args: main.MutationUpdateMergeRequestInfoArgs,
        { currentUser, cacheKey }
      ) => {
        const repository = this.requestCache.getRepo(
          cacheKey,
          args.repositoryId
        );

        const mergeRequest = this.requestCache.getMergeRequest(
          cacheKey,
          args.mergeRequestId
        );

        const result = await this.mergeRequestService.updateMergeRequestInfo(
          mergeRequest,
          repository,
          currentUser,
          args.title,
          args.description
        );
        this.requestCache.deleteMergeRequest(cacheKey, mergeRequest);
        if (result.action == "MERGE_REQUEST_UPDATED") {
          this.pubsub?.publish?.(`MERGE_REQUEST_UPDATED:${mergeRequest.id}`, {
            mergeRequestUpdated: result.mergeRequest
          });
          return {
            __typename: "UpdateMergeRequestInfoSuccess",
            repository: repository,
            mergeRequest: result.mergeRequest,
          };
        }
        if (result.action == "LOG_ERROR") {
          console.error(
            result.error?.type,
            result?.error?.message,
            result?.error?.meta
          );
          return {
            __typename: "UpdateMergeRequestInfoError",
            message: "Unknown Error",
            type: "UNKNOWN_ERROR",
          };
        }
        return {
          __typename: "UpdateMergeRequestInfoError",
          message: result.error?.message ?? "Unknown Error",
          type: result.error?.type ?? "UNKNOWN_ERROR",
        };
      }
    ),

    closeMergeRequest: runWithHooks(
      () => [
        this.loggedInUserGuard,
        this.repoAccessGuard,
        this.rootRepositoryLoader,
        this.mergeRequestLoader,
        this.mergeRequestAccessGuard,
      ],
      async (
        _,
        args: main.MutationCloseMergeRequestArgs,
        { currentUser, cacheKey }
      ) => {
        const repository = this.requestCache.getRepo(
          cacheKey,
          args.repositoryId
        );

        const mergeRequest = this.requestCache.getMergeRequest(
          cacheKey,
          args.mergeRequestId
        );

        const result = await this.mergeRequestService.closeMergeRequest(
          mergeRequest,
          repository,
          currentUser
        );
        this.requestCache.deleteMergeRequest(cacheKey, mergeRequest);
        if (result.action == "MERGE_REQUEST_CLOSED") {
          this.pubsub?.publish?.(`MERGE_REQUEST_UPDATED:${mergeRequest.id}`, {
            mergeRequestUpdated: result.mergeRequest
          });
          return {
            __typename: "CloseMergeRequestSuccess",
            repository: repository,
            mergeRequest: result.mergeRequest,
          };
        }
        if (result.action == "LOG_ERROR") {
          console.error(
            result.error?.type,
            result?.error?.message,
            result?.error?.meta
          );
          return {
            __typename: "CloseMergeRequestError",
            message: "Unknown Error",
            type: "UNKNOWN_ERROR",
          };
        }
        return {
          __typename: "CloseMergeRequestError",
          message: result.error?.message ?? "Unknown Error",
          type: result.error?.type ?? "UNKNOWN_ERROR",
        };
      }
    ),
    updateMergeRequestReviewers: runWithHooks(
      () => [
        this.loggedInUserGuard,
        this.repoAccessGuard,
        this.rootRepositoryLoader,
        this.mergeRequestLoader,
        this.mergeRequestAccessGuard,
      ],
      async (
        _,
        args: main.MutationUpdateMergeRequestReviewersArgs,
        { currentUser, cacheKey }
      ) => {
        const repository = this.requestCache.getRepo(
          cacheKey,
          args.repositoryId
        );

        const mergeRequest = this.requestCache.getMergeRequest(
          cacheKey,
          args.mergeRequestId
        );

        const result =
          await this.mergeRequestService.updateMergeRequestReviewers(
            mergeRequest,
            repository,
            currentUser,
            (args.reviewerIds?.filter?.((v) => typeof v == "string") ??
              []) as Array<string>
          );
        console.log("RES", result);
        this.requestCache.deleteMergeRequest(cacheKey, mergeRequest);
        if (result.action == "UPDATE_MERGE_REQUEST_REVIEWERS_SUCCESS") {
          this.pubsub?.publish?.(`MERGE_REQUEST_UPDATED:${mergeRequest.id}`, {
            mergeRequestUpdated: result.mergeRequest
          });
          return {
            __typename: "UpdateMergeRequestReviewersSuccess",
            repository: repository,
            mergeRequest: result.mergeRequest,
          };
        }
        if (result.action == "LOG_ERROR") {
          console.error(
            result.error?.type,
            result?.error?.message,
            result?.error?.meta
          );
          return {
            __typename: "UpdateMergeRequestReviewersError",
            message: "Unknown Error",
            type: "UNKNOWN_ERROR",
          };
        }
        return {
          __typename: "UpdateMergeRequestReviewersError",
          message: result.error?.message ?? "Unknown Error",
          type: result.error?.type ?? "UNKNOWN_ERROR",
        };
      }
    ),
    updateMergeRequestStatus: runWithHooks(
      () => [
        this.loggedInUserGuard,
        this.repoAccessGuard,
        this.rootRepositoryLoader,
        this.mergeRequestLoader,
        this.mergeRequestAccessGuard,
      ],
      async (
        _,
        args: main.MutationUpdateMergeRequestStatusArgs,
        { currentUser, cacheKey }
      ) => {
        const repository = this.requestCache.getRepo(
          cacheKey,
          args.repositoryId
        );

        const mergeRequest = this.requestCache.getMergeRequest(
          cacheKey,
          args.mergeRequestId
        );

        const result =
          await this.mergeRequestService.updateMergeRequestReviewStatus(
            mergeRequest,
            repository,
            currentUser,
            (args.approvalStatus ?? "") as
              | "approved"
              | "requested_changes"
              | "blocked"
          );
        this.requestCache.deleteMergeRequest(cacheKey, mergeRequest);
        if (result.action == "REVIEW_STATUS_UPDATED") {
          this.pubsub?.publish?.(`MERGE_REQUEST_UPDATED:${mergeRequest.id}`, {
            mergeRequestUpdated: result.mergeRequest
          });
          return {
            __typename: "UpdateMergeRequestReviewStatusSuccess",
            repository: repository,
            mergeRequest: result.mergeRequest,
          };
        }
        if (result.action == "LOG_ERROR") {
          console.error(
            result.error?.type,
            result?.error?.message,
            result?.error?.meta
          );
          return {
            __typename: "UpdateMergeRequestReviewStatusError",
            message: "Unknown Error",
            type: "UNKNOWN_ERROR",
          };
        }
        return {
          __typename: "UpdateMergeRequestReviewStatusError",
          message: result.error?.message ?? "Unknown Error",
          type: result.error?.type ?? "UNKNOWN_ERROR",
        };
      }
    ),
    deleteMergeRequestStatus: runWithHooks(
      () => [
        this.loggedInUserGuard,
        this.repoAccessGuard,
        this.rootRepositoryLoader,
        this.mergeRequestLoader,
        this.mergeRequestAccessGuard,
      ],
      async (
        _,
        args: main.MutationDeleteMergeRequestStatusArgs,
        { currentUser, cacheKey }
      ) => {
        const repository = this.requestCache.getRepo(
          cacheKey,
          args.repositoryId
        );

        const mergeRequest = this.requestCache.getMergeRequest(
          cacheKey,
          args.mergeRequestId
        );

        const result =
          await this.mergeRequestService.deleteMergeRequestReviewStatus(
            mergeRequest,
            repository,
            currentUser
          );
        this.requestCache.deleteMergeRequest(cacheKey, mergeRequest);
        if (result.action == "REVIEW_STATUS_DELETED") {
          this.pubsub?.publish?.(`MERGE_REQUEST_UPDATED:${mergeRequest.id}`, {
            mergeRequestUpdated: result.mergeRequest
          });
          return {
            __typename: "DeleteMergeRequestReviewStatusSuccess",
            repository: repository,
            mergeRequest: result.mergeRequest,
          };
        }
        if (result.action == "LOG_ERROR") {
          console.error(
            result.error?.type,
            result?.error?.message,
            result?.error?.meta
          );
          return {
            __typename: "DeleteMergeRequestReviewStatusError",
            message: "Unknown Error",
            type: "UNKNOWN_ERROR",
          };
        }
        return {
          __typename: "DeleteMergeRequestReviewStatusError",
          message: result.error?.message ?? "Unknown Error",
          type: result.error?.type ?? "UNKNOWN_ERROR",
        };
      }
    ),
    createMergeRequestComment: runWithHooks(
      () => [
        this.loggedInUserGuard,
        this.repoAccessGuard,
        this.rootRepositoryLoader,
        this.mergeRequestLoader,
        this.mergeRequestAccessGuard,
      ],
      async (
        _,
        args: main.MutationCreateMergeRequestCommentArgs,
        { currentUser, cacheKey }
      ) => {
        const repository = this.requestCache.getRepo(
          cacheKey,
          args.repositoryId
        );

        const mergeRequest = this.requestCache.getMergeRequest(
          cacheKey,
          args.mergeRequestId
        );
        // verifify comment in commits range

        const result = await this.mergeRequestService.createMergeRequestComment(
          mergeRequest,
          repository,
          currentUser,
          args.text,
          args.pluginName ?? undefined,
          args.pluginVersionId ?? undefined
        );
        this.requestCache.deleteMergeRequest(cacheKey, mergeRequest);
        if (result.action == "COMMENT_CREATED") {
          this.pubsub?.publish?.(`MERGE_REQUEST_UPDATED:${mergeRequest.id}`, {
            mergeRequestUpdated: result.mergeRequest
          });
          return {
            __typename: "CreateMergeRequestCommentSuccess",
            repository: repository,
            mergeRequest: result.mergeRequest,
          };
        }
        if (result.action == "LOG_ERROR") {
          console.error(
            result.error?.type,
            result?.error?.message,
            result?.error?.meta
          );
          return {
            __typename: "CreateMergeRequestCommentError",
            message: "Unknown Error",
            type: "UNKNOWN_ERROR",
          };
        }
        return {
          __typename: "CreateMergeRequestCommentError",
          message: result.error?.message ?? "Unknown Error",
          type: result.error?.type ?? "UNKNOWN_ERROR",
        };
      }
    ),
    updateMergeRequestComment: runWithHooks(
      () => [
        this.loggedInUserGuard,
        this.repoAccessGuard,
        this.rootRepositoryLoader,
        this.mergeRequestLoader,
        this.mergeRequestAccessGuard,
        this.mergeRequestCommentLoader,
        this.mergeRequestAccessGuard,
      ],
      async (
        _,
        args: main.MutationUpdateMergeRequestCommentArgs,
        { currentUser, cacheKey }
      ) => {
        const repository = this.requestCache.getRepo(
          cacheKey,
          args.repositoryId
        );

        const mergeRequest = this.requestCache.getMergeRequest(
          cacheKey,
          args.mergeRequestId
        );

        const mergeRequestComment = this.requestCache.getMergeRequestComment(
          cacheKey,
          args.mergeRequestCommentId
        );

        const result = await this.mergeRequestService.updateMergeRequestComment(
          mergeRequestComment,
          mergeRequest,
          repository,
          currentUser,
          args.text
        );
        this.requestCache.deleteMergeRequest(cacheKey, mergeRequest);
        this.requestCache.deleteMergeRequestComment(
          cacheKey,
          mergeRequestComment
        );
        if (result.action == "COMMENT_UPDATED") {
          this.pubsub?.publish?.(`MERGE_REQUEST_UPDATED:${mergeRequest.id}`, {
            mergeRequestUpdated: result.mergeRequest
          });
          return {
            __typename: "UpdateMergeRequestCommentSuccess",
            repository: repository,
            mergeRequest: result.mergeRequest,
          };
        }
        if (result.action == "LOG_ERROR") {
          console.error(
            result.error?.type,
            result?.error?.message,
            result?.error?.meta
          );
          return {
            __typename: "UpdateMergeRequestCommentError",
            message: "Unknown Error",
            type: "UNKNOWN_ERROR",
          };
        }
        return {
          __typename: "UpdateMergeRequestCommentError",
          message: result.error?.message ?? "Unknown Error",
          type: result.error?.type ?? "UNKNOWN_ERROR",
        };
    }),
    deleteMergeRequestComment: runWithHooks(
      () => [
        this.loggedInUserGuard,
        this.repoAccessGuard,
        this.rootRepositoryLoader,
        this.mergeRequestLoader,
        this.mergeRequestAccessGuard,
        this.mergeRequestCommentLoader,
        this.mergeRequestAccessGuard,
      ],
      async (
        _,
        args: main.MutationDeleteMergeRequestCommentArgs,
        { currentUser, cacheKey }
      ) => {
        const repository = this.requestCache.getRepo(
          cacheKey,
          args.repositoryId
        );

        const mergeRequest = this.requestCache.getMergeRequest(
          cacheKey,
          args.mergeRequestId
        );

        const mergeRequestComment = this.requestCache.getMergeRequestComment(
          cacheKey,
          args.mergeRequestCommentId
        );

        const result = await this.mergeRequestService.deleteMergeRequestComment(
          mergeRequestComment,
          mergeRequest,
          repository,
          currentUser
        );
        this.requestCache.deleteMergeRequest(cacheKey, mergeRequest);
        this.requestCache.deleteMergeRequestComment(
          cacheKey,
          mergeRequestComment
        );
        if (result.action == "COMMENT_DELETED") {
          this.pubsub?.publish?.(`MERGE_REQUEST_UPDATED:${mergeRequest.id}`, {
            mergeRequestUpdated: result.mergeRequest
          });
          return {
            __typename: "DeleteMergeRequestCommentSuccess",
            repository: repository,
            mergeRequest: result.mergeRequest,
          };
        }
        if (result.action == "LOG_ERROR") {
          console.error(
            result.error?.type,
            result?.error?.message,
            result?.error?.meta
          );
          return {
            __typename: "DeleteMergeRequestCommentError",
            message: "Unknown Error",
            type: "UNKNOWN_ERROR",
          };
        }
        return {
          __typename: "DeleteMergeRequestCommentError",
          message: result.error?.message ?? "Unknown Error",
          type: result.error?.type ?? "UNKNOWN_ERROR",
        };
      }
    ),
    createMergeRequestCommentReply: runWithHooks(
      () => [
        this.loggedInUserGuard,
        this.repoAccessGuard,
        this.rootRepositoryLoader,
        this.mergeRequestLoader,
        this.mergeRequestAccessGuard,
        this.mergeRequestCommentLoader,
        this.mergeRequestAccessGuard,
      ],
      async (
        _,
        args: main.MutationCreateMergeRequestCommentReplyArgs,
        { currentUser, cacheKey }
      ) => {
        const repository = this.requestCache.getRepo(
          cacheKey,
          args.repositoryId
        );

        const mergeRequest = this.requestCache.getMergeRequest(
          cacheKey,
          args.mergeRequestId
        );

        const mergeRequestComment = this.requestCache.getMergeRequestComment(
          cacheKey,
          args.mergeRequestCommentId
        );

        const result =
          await this.mergeRequestService.createMergeRequestCommentReply(
            mergeRequestComment,
            mergeRequest,
            repository,
            currentUser,
            args.text
          );
        this.requestCache.deleteMergeRequest(cacheKey, mergeRequest);
        this.requestCache.deleteMergeRequestComment(
          cacheKey,
          mergeRequestComment
        );
        if (result.action == "COMMENT_REPLY_CREATED") {
          this.pubsub?.publish?.(`MERGE_REQUEST_UPDATED:${mergeRequest.id}`, {
            mergeRequestUpdated: result.mergeRequest
          });
          return {
            __typename: "CreateMergeRequestCommentReplySuccess",
            repository: repository,
            mergeRequest: result.mergeRequest,
          };
        }
        if (result.action == "LOG_ERROR") {
          console.error(
            result.error?.type,
            result?.error?.message,
            result?.error?.meta
          );
          return {
            __typename: "CreateMergeRequestCommentReplyError",
            message: "Unknown Error",
            type: "UNKNOWN_ERROR",
          };
        }
        return {
          __typename: "CreateMergeRequestCommentReplyError",
          message: result.error?.message ?? "Unknown Error",
          type: result.error?.type ?? "UNKNOWN_ERROR",
        };
      }
    ),
    updateMergeRequestCommentReply: runWithHooks(
      () => [
        this.loggedInUserGuard,
        this.repoAccessGuard,
        this.rootRepositoryLoader,
        this.mergeRequestLoader,
        this.mergeRequestAccessGuard,
        this.mergeRequestCommentLoader,
        this.mergeRequestAccessGuard,
        this.mergeRequestCommentReplyLoader,
        this.mergeRequestCommentReplyAccessGuard,
      ],
      async (
        _,
        args: main.MutationUpdateMergeRequestCommentReplyArgs,
        { currentUser, cacheKey }
      ) => {
        const repository = this.requestCache.getRepo(
          cacheKey,
          args.repositoryId
        );

        const mergeRequest = this.requestCache.getMergeRequest(
          cacheKey,
          args.mergeRequestId
        );

        const mergeRequestComment = this.requestCache.getMergeRequestComment(
          cacheKey,
          args.mergeRequestCommentId
        );

        const mergeRequestCommentReply =
          this.requestCache.getMergeRequestCommentReply(
            cacheKey,
            args.mergeRequestCommentReplyId
          );

        const result =
          await this.mergeRequestService.updateMergeRequestCommentReply(
            mergeRequestCommentReply,
            mergeRequestComment,
            mergeRequest,
            repository,
            currentUser,
            args.text
          );
        this.requestCache.deleteMergeRequest(cacheKey, mergeRequest);
        this.requestCache.deleteMergeRequestComment(
          cacheKey,
          mergeRequestComment
        );
        this.requestCache.deleteMergeRequestCommentReply(
          cacheKey,
          mergeRequestCommentReply
        );
        if (result.action == "COMMENT_REPLY_UPDATED") {
          this.pubsub?.publish?.(`MERGE_REQUEST_UPDATED:${mergeRequest.id}`, {
            mergeRequestUpdated: result.mergeRequest
          });
          return {
            __typename: "UpdateMergeRequestCommentReplySuccess",
            repository: repository,
            mergeRequest: result.mergeRequest,
          };
        }
        if (result.action == "LOG_ERROR") {
          console.error(
            result.error?.type,
            result?.error?.message,
            result?.error?.meta
          );
          return {
            __typename: "UpdateMergeRequestCommentReplyError",
            message: "Unknown Error",
            type: "UNKNOWN_ERROR",
          };
        }
        return {
          __typename: "UpdateMergeRequestCommentReplyError",
          message: result.error?.message ?? "Unknown Error",
          type: result.error?.type ?? "UNKNOWN_ERROR",
        };
      }
    ),

    deleteMergeRequestCommentReply: runWithHooks(
      () => [
        this.loggedInUserGuard,
        this.repoAccessGuard,
        this.rootRepositoryLoader,
        this.mergeRequestLoader,
        this.mergeRequestAccessGuard,
        this.mergeRequestCommentLoader,
        this.mergeRequestAccessGuard,
        this.mergeRequestCommentReplyLoader,
        this.mergeRequestCommentReplyAccessGuard,
      ],
      async (
        _,
        args: main.MutationDeleteMergeRequestCommentReplyArgs,
        { currentUser, cacheKey }
      ) => {
        const repository = this.requestCache.getRepo(
          cacheKey,
          args.repositoryId
        );

        const mergeRequest = this.requestCache.getMergeRequest(
          cacheKey,
          args.mergeRequestId
        );

        const mergeRequestComment = this.requestCache.getMergeRequestComment(
          cacheKey,
          args.mergeRequestCommentId
        );

        const mergeRequestCommentReply =
          this.requestCache.getMergeRequestCommentReply(
            cacheKey,
            args.mergeRequestCommentReplyId
          );

        const result =
          await this.mergeRequestService.deleteMergeRequestCommentReply(
            mergeRequestCommentReply,
            mergeRequestComment,
            mergeRequest,
            repository,
            currentUser
          );
        this.requestCache.deleteMergeRequest(cacheKey, mergeRequest);
        this.requestCache.deleteMergeRequestComment(
          cacheKey,
          mergeRequestComment
        );
        this.requestCache.deleteMergeRequestCommentReply(
          cacheKey,
          mergeRequestCommentReply
        );
        if (result.action == "COMMENT_REPLY_DELETED") {
          this.pubsub?.publish?.(`MERGE_REQUEST_UPDATED:${mergeRequest.id}`, {
            mergeRequestUpdated: result.mergeRequest
          });
          return {
            __typename: "DeleteMergeRequestCommentReplySuccess",
            repository: repository,
            mergeRequest: result.mergeRequest,
          };
        }
        if (result.action == "LOG_ERROR") {
          console.error(
            result.error?.type,
            result?.error?.message,
            result?.error?.meta
          );
          return {
            __typename: "DeleteMergeRequestCommentReplyError",
            message: "Unknown Error",
            type: "UNKNOWN_ERROR",
          };
        }
        return {
          __typename: "DeleteMergeRequestCommentReplyError",
          message: result.error?.message ?? "Unknown Error",
          type: result.error?.type ?? "UNKNOWN_ERROR",
        };
      }
    ),
  };

  public Subscription: main.SubscriptionResolvers = {
    mergeRequestUpdated: {
      subscribe: withFilter(
        (_, { mergeRequestId}) => {
          if (mergeRequestId) {
            return this.pubsub.asyncIterator(
              `MERGE_REQUEST_UPDATED:${mergeRequestId}`
            );
          }
          return this.pubsub.asyncIterator([]);
        },
        runWithHooks(
          () => [],
          async (
            payload: { mergeRequestUpdated: DBMergeRequest },
            args: { mergeRequestId: string },
            context
          ) => {
            const currentUser = context.currentUser;
            if (payload?.mergeRequestUpdated?.id != args.mergeRequestId) {
              return false;
            }
            const repository = await this.repoDataService.fetchRepoById(
              payload?.mergeRequestUpdated?.repositoryId
            );
            if (!repository) {
              return false;
            }
            if (!repository.isPrivate) {
              return true;
            }
            if (repository?.repoType == "user_repo") {
              return currentUser && currentUser?.id == repository?.userId;
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
                repository.organizationId as string,
                currentUser.id
              );
            if (membership?.membershipState != "active") {
              return false;
            }
            if (repository.anyoneCanRead) {
              return true;
            }

            const organizationMemberRolesContext =
              await this.contextFactory.createContext(
                OrganizationMemberRolesContext
              );
            const memberRoles =
              await organizationMemberRolesContext.getRolesByMember(membership);
            const isAdmin = !!memberRoles?.find((r) => r.presetCode == "admin");
            if (isAdmin) {
              return true;
            }
            const roleIds = memberRoles?.map((r) => r.id);
            const repositoryEnabledRoleSettingsContext =
              await this.contextFactory.createContext(
                RepositoryEnabledRoleSettingsContext
              );

            const repositoryEnabledUserSettingsContext =
              await this.contextFactory.createContext(
                RepositoryEnabledUserSettingsContext
              );
            const hasUserPermission =
              await repositoryEnabledUserSettingsContext.hasRepoUserId(
                repository.id,
                currentUser.id,
                "anyoneCanRead"
              );
            if (!hasUserPermission) {
              const hasRoles =
                await repositoryEnabledRoleSettingsContext.hasRepoRoleIds(
                  repository.id,
                  roleIds,
                  "anyoneCanRead"
                );
              if (!hasRoles) {
                return false;
              }
            }
            return true;
          }
        )
      ) as unknown as SubscriptionSubscribeFn<any, any, any, any>,
    },
  };
}
