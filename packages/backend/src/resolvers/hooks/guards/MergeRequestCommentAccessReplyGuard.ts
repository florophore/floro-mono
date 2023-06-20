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
import MergeRequestCommentReplyLoader from "../loaders/MergeRequest/MergeRequestCommentReplyLoader";
import MergeRequestCommentAccessGuard from "./MergeRequestCommentAccessGuard";

@injectable()
export default class MergeRequestCommentReplyAccessGuard extends GuardResolverHook<
  unknown,
  { mergeRequestId: string; mergeRequestCommentId: string; mergeRequestCommentReplyId: string; repositoryId: string },
  { currentUser: User | null; cacheKey: string },
  unknown | UnAuthenticatedError | RepoAccessError | MergeRequestAccessError
> {
  protected contextFactory!: ContextFactory;
  protected requestCache!: RequestCache;
  protected loggedInUserGuard!: LoggedInUserGuard;
  protected repositoryLoader!: RepositoryLoader;
  protected mergeRequestLoader!: MergeRequestLoader;
  protected mergeRequestCommentLoader!: MergeRequestCommentLoader;
  protected mergeRequestCommentReplyLoader!: MergeRequestCommentReplyLoader;
  protected mergeRequestCommentAccessGuard!: MergeRequestCommentAccessGuard;
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
    @inject(MergeRequestCommentAccessGuard) mergeRequestCommentAccessGuard: MergeRequestCommentAccessGuard,
    @inject(MergeRequestCommentReplyLoader) mergeRequestCommentReplyLoader: MergeRequestCommentReplyLoader
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
    this.mergeRequestCommentReplyLoader = mergeRequestCommentReplyLoader;
    this.mergeRequestCommentAccessGuard = mergeRequestCommentAccessGuard;
  }

  public run = runWithHooks(
    () => [
      this.loggedInUserGuard,
      this.repositoryLoader,
      this.repoAccessGuard,
      this.mergeRequestLoader,
      this.mergeRequestCommentLoader,
      this.mergeRequestAccessGuard,
      this.mergeRequestCommentAccessGuard,
      this.mergeRequestCommentReplyLoader
    ],
    async (
      _,
      {
        mergeRequestCommentId,
        mergeRequestCommentReplyId,
      }: {
        mergeRequestId: string;
        mergeRequestCommentId: string;
        mergeRequestCommentReplyId: string;
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
      const mergeRequestCommentReply = this.requestCache.getMergeRequestCommentReply(
        context.cacheKey,
        mergeRequestCommentReplyId
      );
      if (!mergeRequestCommentReply) {
        return {
          __typename: "MergeRequestCommentReplyAccessError",
          type: "MERGE_REQUEST_COMMENT_REPLY_ACCESS_ERROR",
          message: "Merge request comment reply access error",
        };
      }

      if (mergeRequestCommentReply?.mergeRequestCommentId != mergeRequestCommentId) {
        return {
          __typename: "MergeRequestCommentReplyAccessError",
          type: "MERGE_REQUEST_COMMENT_REPLY_ACCESS_ERROR",
          message: "Merge request comment reply access error",
        };
      }

      return null;
    }
  );
}
