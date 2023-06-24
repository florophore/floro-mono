import BaseResolverModule from "../BaseResolverModule";
import { main } from "@floro/graphql-schemas";
import { inject, injectable } from "inversify";
import LoggedInUserGuard from "../hooks/guards/LoggedInUserGuard";
import { runWithHooks } from "../hooks/ResolverHook";
import RequestCache from "../../request/RequestCache";
import ContextFactory from "@floro/database/src/contexts/ContextFactory";
import MergeRequestService from "../../services/merge_requests/MergeRequestService";
import RepositoryLoader from "../hooks/loaders/Repository/RepositoryLoader";
import RepoAccessGuard from "../hooks/guards/RepoAccessGuard";
import MergeRequestLoader from "../hooks/loaders/MergeRequest/MergeRequestLoader";
import MergeRequestAccessGuard from "../hooks/guards/MergeRequestAccessGuard";
import MergeRequestCommentLoader from "../hooks/loaders/MergeRequest/MergeRequestCommentLoader";
import MergeRequestCommentAccessGuard from "../hooks/guards/MergeRequestCommentAccessGuard";
import MergeRequestCommentReplyLoader from "../hooks/loaders/MergeRequest/MergeRequestCommentReplyLoader";
import MergeRequestCommentReplyAccessGuard from "../hooks/guards/MergeRequestCommentAccessReplyGuard";
import RepositoryCommitsLoader from "../hooks/loaders/Repository/RepositoryCommitsLoader";
import { MergeRequest as DBMergeRequest } from "@floro/database/src/entities/MergeRequest";
import { MergeRequest } from "@floro/graphql-schemas/build/generated/main-graphql";
import RepositoryDatasourceFactoryService from "../../services/repositories/RepoDatasourceFactoryService";
import RepositoryBranchesLoader from "../hooks/loaders/Repository/RepositoryBranchesLoader";

@injectable()
export default class MergeRequestResolverModule extends BaseResolverModule {
  public resolvers: Array<keyof this & keyof main.ResolversTypes> = [
    "Query",
    "Mutation",
    "MergeRequest",
  ];
  protected contextFactory!: ContextFactory;
  protected requestCache!: RequestCache;
  protected mergeRequestService!: MergeRequestService;
  protected repositoryDatasourceFactoryService!: RepositoryDatasourceFactoryService;

  //loaders
  protected repositoryLoader!: RepositoryLoader;
  protected mergeRequestLoader!: MergeRequestLoader;
  protected mergeRequestCommentLoader!: MergeRequestCommentLoader;
  protected mergeRequestCommentReplyLoader!: MergeRequestCommentReplyLoader;

  protected repositoryCommitsLoader!: RepositoryCommitsLoader;
  protected repositoryBranchesLoader!: RepositoryBranchesLoader;

  // guards
  protected loggedInUserGuard!: LoggedInUserGuard;
  protected repoAccessGuard!: RepoAccessGuard;
  protected mergeRequestCommentAccessGuard!: MergeRequestCommentAccessGuard;
  protected mergeRequestAccessGuard!: MergeRequestAccessGuard;
  protected mergeRequestCommentReplyAccessGuard!: MergeRequestCommentReplyAccessGuard;

  constructor(
    @inject(ContextFactory) contextFactory: ContextFactory,
    @inject(RequestCache) requestCache: RequestCache,
    @inject(RepositoryDatasourceFactoryService)
    repositoryDatasourceFactoryService: RepositoryDatasourceFactoryService,
    @inject(MergeRequestService) mergeRequestService: MergeRequestService,
    @inject(LoggedInUserGuard) loggedInUserGuard: LoggedInUserGuard,
    @inject(RepositoryLoader) repositoryLoader: RepositoryLoader,
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
    mergeRequestCommentReplyLoader: MergeRequestCommentReplyLoader
  ) {
    super();
    this.requestCache = requestCache;
    this.contextFactory = contextFactory;
    this.mergeRequestService = mergeRequestService;
    this.repositoryDatasourceFactoryService =
      repositoryDatasourceFactoryService;

    // guards
    this.loggedInUserGuard = loggedInUserGuard;
    this.repoAccessGuard = repoAccessGuard;
    this.mergeRequestAccessGuard = mergeRequestAccessGuard;
    this.mergeRequestCommentAccessGuard = mergeRequestCommentAccessGuard;
    this.mergeRequestCommentReplyAccessGuard =
      mergeRequestCommentReplyAccessGuard;

    // loaders
    this.repositoryLoader = repositoryLoader;
    this.mergeRequestCommentLoader = mergeRequestCommentLoader;
    this.mergeRequestCommentReplyLoader = mergeRequestCommentReplyLoader;
    this.mergeRequestLoader = mergeRequestLoader;

    this.repositoryCommitsLoader = repositoryCommitsLoader;
    this.repositoryBranchesLoader = repositoryBranchesLoader;
  }

  public MergeRequest: main.MergeRequestResolvers = {
    branchState: runWithHooks(
      () => [this.repositoryLoader, this.repositoryBranchesLoader, this.repositoryCommitsLoader],
      async (mergeRequest: MergeRequest, _, { cacheKey }) => {
        const dbMergeRequest = mergeRequest as DBMergeRequest;
        if (!dbMergeRequest?.repositoryId) {
          return null;
        }
        const repository = this.requestCache.getRepo(cacheKey, dbMergeRequest?.repositoryId);
        console.log("BRO", repository)
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
        )
        console.log("B", branch)
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
      return null;
    }),
    pendingCommits: runWithHooks(
      () => [this.repositoryBranchesLoader, this.repositoryCommitsLoader],
      async (mergeRequest: MergeRequest, _, { cacheKey }) => {
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

        const cachedBranches = this.requestCache.getRepoBranches(
          cacheKey,
          dbMergeRequest.repositoryId
        );
        if (!cachedBranches) {
          return [];
        }
        const branch = cachedBranches?.find(b => b.id == dbMergeRequest.branchId);
        if (!branch?.lastCommit) {
          return [];
        }
        const pendingCommits =
          this.repositoryDatasourceFactoryService.getCommitsInRange(
            cachedCommits,
            branch?.lastCommit,
            dbMergeRequest.divergenceSha
          );
        return pendingCommits;
      }
    ),
  };

  public Query: main.QueryResolvers = {};

  // need repo loader
  // need repo permission tester
  public Mutation: main.MutationResolvers = {
    createMergeRequest: runWithHooks(
      () => [
        this.loggedInUserGuard,
        this.repoAccessGuard,
        this.repositoryLoader,
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
        this.repositoryLoader,
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
        this.repositoryLoader,
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
        this.repositoryLoader,
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
        this.requestCache.deleteMergeRequest(cacheKey, mergeRequest);
        if (result.action == "UPDATE_MERGE_REQUEST_REVIEWERS_SUCCESS") {
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
        this.repositoryLoader,
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
        this.repositoryLoader,
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
        this.repositoryLoader,
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
          args.pluginName ?? undefined
        );
        this.requestCache.deleteMergeRequest(cacheKey, mergeRequest);
        if (result.action == "COMMENT_CREATED") {
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
        this.repositoryLoader,
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
          args.mergeRequestId
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
      }
    ),
    deleteMergeRequestComment: runWithHooks(
      () => [
        this.loggedInUserGuard,
        this.repoAccessGuard,
        this.repositoryLoader,
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
          args.mergeRequestId
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
        this.repositoryLoader,
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
          args.mergeRequestId
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
        this.repositoryLoader,
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
          args.mergeRequestId
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
        this.repositoryLoader,
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
          args.mergeRequestId
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
}
