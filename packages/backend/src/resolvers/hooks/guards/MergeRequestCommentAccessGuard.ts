import { User } from "@floro/database/src/entities/User";
import { inject, injectable } from "inversify";
import { GuardResolverHook, runWithHooks } from "../ResolverHook";
import {
  UnAuthenticatedError,
  RepoAccessError,
} from "@floro/graphql-schemas/src/generated/main-graphql";
import RequestCache from "../../../request/RequestCache";
import ContextFactory from "@floro/database/src/contexts/ContextFactory";
import LoggedInUserGuard from "./LoggedInUserGuard";
import RepositoryLoader from "../loaders/Repository/RepositoryLoader";
import MergeRequestLoader from "../loaders/MergeRequest/MergeRequestLoader";
import { MergeRequestAccessError } from "@floro/graphql-schemas/build/generated/main-graphql";
import RepoAccessGuard from "./RepoAccessGuard";
import MergeRequestCommentLoader from "../loaders/MergeRequest/MergeRequestCommentLoader";
import MergeRequestAccessGuard from "./MergeRequestAccessGuard";

@injectable()
export default class MergeRequestCommentAccessGuard extends GuardResolverHook<
  unknown,
  { mergeRequestId: string; mergeRequestCommentId: string; repositoryId: string },
  { currentUser: User | null; cacheKey: string },
  unknown | UnAuthenticatedError | RepoAccessError | MergeRequestAccessError
> {
  protected contextFactory!: ContextFactory;
  protected requestCache!: RequestCache;
  protected loggedInUserGuard!: LoggedInUserGuard;
  protected repositoryLoader!: RepositoryLoader;
  protected mergeRequestLoader!: MergeRequestLoader;
  protected mergeRequestCommentLoader!: MergeRequestCommentLoader;
  protected mergeRequestAccessGuard!: MergeRequestAccessGuard;
  protected repoAccessGuard!: RepoAccessGuard;

  constructor(
    @inject(RequestCache) requestCache: RequestCache,
    @inject(ContextFactory) contextFactory: ContextFactory,
    @inject(LoggedInUserGuard) loggedInUserGuard: LoggedInUserGuard,
    @inject(RepositoryLoader) repositoryLoader: RepositoryLoader,
    @inject(RepoAccessGuard) repoAccessGuard: RepoAccessGuard,
    @inject(MergeRequestLoader) mergeRequestLoader: MergeRequestLoader,
    @inject(MergeRequestAccessGuard) mergeRequestAccessGuard: MergeRequestAccessGuard,
    @inject(MergeRequestCommentLoader) mergeRequestCommentLoader: MergeRequestCommentLoader,
  ) {
    super();
    this.requestCache = requestCache;
    this.contextFactory = contextFactory;
    this.loggedInUserGuard = loggedInUserGuard;
    this.repositoryLoader = repositoryLoader;
    this.repoAccessGuard = repoAccessGuard;
    this.mergeRequestLoader = mergeRequestLoader;
    this.mergeRequestAccessGuard = mergeRequestAccessGuard;
    this.mergeRequestCommentLoader = mergeRequestCommentLoader;
  }

  public run = runWithHooks(
    () => [
      this.loggedInUserGuard,
      this.repositoryLoader,
      this.repoAccessGuard,
      this.mergeRequestLoader,
      this.mergeRequestCommentLoader,
      this.mergeRequestAccessGuard,
    ],
    async (
      _,
      {
        mergeRequestId,
        mergeRequestCommentId,
      }: {
        mergeRequestId: string;
        mergeRequestCommentId: string;
        repositoryId: string;
      },
      context: { currentUser: User | null; cacheKey: string }
    ) => {
      if (!context.currentUser) {
        return {
          __typename: "UnAuthenticatedError",
          type: "UNAUTHENTICATED_ERROR",
          message: "Unauthenticated request",
        };
      }
      const mergeRequestComment = this.requestCache.getMergeRequestComment(
        context.cacheKey,
        mergeRequestCommentId
      );
      if (!mergeRequestComment) {
        return {
          __typename: "MergeRequestCommentAccessError",
          type: "MERGE_REQUEST_COMMENT_ACCESS_ERROR",
          message: "Merge request comment access error",
        };
      }

      if (mergeRequestComment?.mergeRequestId != mergeRequestId) {
        return {
          __typename: "MergeRequestCommentAccessError",
          type: "MERGE_REQUEST_COMMENT_ACCESS_ERROR",
          message: "Merge request comment access error",
        };
      }

      return null;
    }
  );
}
