import { User } from "@floro/database/src/entities/User";
import { inject, injectable } from "inversify";
import { GuardResolverHook, runWithHooks } from "../ResolverHook";
import {
  UnAuthenticatedError,
} from "@floro/graphql-schemas/src/generated/main-graphql";
import RequestCache from "../../../request/RequestCache";
import ContextFactory from "@floro/database/src/contexts/ContextFactory";
import LoggedInUserGuard from "./LoggedInUserGuard";
import ApiKeyLoader from "../loaders/ApiKey/ApiKeyLoader";

@injectable()
export default class UserApiKeyGuard extends GuardResolverHook<
  unknown,
  { apiKeyId: string; },
  { currentUser: User | null; cacheKey: string },
  unknown | UnAuthenticatedError
> {
  protected contextFactory!: ContextFactory;
  protected requestCache!: RequestCache;
  protected loggedInUserGuard!: LoggedInUserGuard;
  protected apiKeyLoader!: ApiKeyLoader;

  constructor(
    @inject(RequestCache) requestCache: RequestCache,
    @inject(ContextFactory) contextFactory: ContextFactory,
    @inject(LoggedInUserGuard) loggedInUserGuard: LoggedInUserGuard,
    @inject(ApiKeyLoader) apiKeyLoader: ApiKeyLoader
  ) {
    super();
    this.requestCache = requestCache;
    this.contextFactory = contextFactory;
    this.loggedInUserGuard = loggedInUserGuard;
    this.apiKeyLoader = apiKeyLoader;
  }

  public run = runWithHooks(
    () => [
      this.loggedInUserGuard,
      this.apiKeyLoader,
    ],
    async (_, args: { apiKeyId: string; }, context) => {
      if (!context.currentUser?.id) {
        return {
          __typename: "UnAuthenticatedError",
          type: "UNAUTHENTICATED_ERROR",
          message: "Unauthenticated request",
        };
      }
      const apiKey = this.requestCache.getApiKey(
        context.cacheKey,
        args.apiKeyId
      );
      if (!apiKey) {
        return {
          __typename: "UnAuthenticatedError",
          type: "UNAUTHENTICATED_ERROR",
          message: "Unauthenticated request",
        };
      }
      if (apiKey.keyType != "user_key" || apiKey.userId != context.currentUser?.id) {
        return {
          __typename: "UnAuthenticatedError",
          type: "UNAUTHENTICATED_ERROR",
          message: "Unauthenticated request",
        };
      }
      return null;
    }
  );
}

