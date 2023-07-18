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
import RootRepositoryLoader from "../loaders/Root/RepositoryID/RepositoryLoader";
import MergeRequestLoader from "../loaders/MergeRequest/MergeRequestLoader";
import { MergeRequestAccessError } from "@floro/graphql-schemas/build/generated/main-graphql";
import RepoAccessGuard from "./RepoAccessGuard";

@injectable()
export default class MergeRequestAccessGuard extends GuardResolverHook<
  unknown,
  { mergeRequestId: string; repositoryId: string },
  { currentUser: User | null; cacheKey: string },
  unknown | UnAuthenticatedError | RepoAccessError | MergeRequestAccessError
> {
  protected contextFactory!: ContextFactory;
  protected requestCache!: RequestCache;
  protected loggedInUserGuard!: LoggedInUserGuard;
  protected repositoryLoader!: RootRepositoryLoader;
  protected mergeRequestLoader!: MergeRequestLoader;
  protected repoAccessGuard!: RepoAccessGuard;

  constructor(
    @inject(RequestCache) requestCache: RequestCache,
    @inject(ContextFactory) contextFactory: ContextFactory,
    @inject(LoggedInUserGuard) loggedInUserGuard: LoggedInUserGuard,
    @inject(RootRepositoryLoader) repositoryLoader: RootRepositoryLoader,
    @inject(RepoAccessGuard) repoAccessGuard: RepoAccessGuard,
    @inject(MergeRequestLoader) mergeRequestLoader: MergeRequestLoader
  ) {
    super();
    this.requestCache = requestCache;
    this.contextFactory = contextFactory;
    this.loggedInUserGuard = loggedInUserGuard;
    this.repositoryLoader = repositoryLoader;
    this.repoAccessGuard = repoAccessGuard;
    this.mergeRequestLoader = mergeRequestLoader;
  }

  public run = runWithHooks(
    () => [
      this.loggedInUserGuard,
      this.repositoryLoader,
      this.repoAccessGuard,
      this.mergeRequestLoader,
    ],
    async (
      _,
      {
        mergeRequestId,
        repositoryId,
      }: { mergeRequestId: string; repositoryId: string },
      context: { currentUser: User | null; cacheKey: string }
    ) => {
      if (!context.currentUser) {
        return {
          __typename: "UnAuthenticatedError",
          type: "UNAUTHENTICATED_ERROR",
          message: "Unauthenticated request",
        };
      }
      const mergeRequest = this.requestCache.getMergeRequest(
        context.cacheKey,
        mergeRequestId
      );
      if (!mergeRequest) {
        return {
          __typename: "MergeRequestAccessError",
          type: "MERGE_REQUEST_ACCESS_ERROR",
          message: "Merge request access error",
        };
      }

      if (mergeRequest?.repositoryId != repositoryId) {
        return {
          __typename: "MergeRequestAccessError",
          type: "MERGE_REQUEST_ACCESS_ERROR",
          message: "Merge request access error",
        };
      }

      return null;
    }
  );
}
