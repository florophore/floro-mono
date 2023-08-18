
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
import WebhookKeyLoader from "../loaders/ApiKey/WebhookKeyLoader";

@injectable()
export default class UserWebhookKeyGuard extends GuardResolverHook<
  unknown,
  { webhookKeyId: string; },
  { currentUser: User | null; cacheKey: string },
  unknown | UnAuthenticatedError
> {
  protected contextFactory!: ContextFactory;
  protected requestCache!: RequestCache;
  protected loggedInUserGuard!: LoggedInUserGuard;
  protected webhookKeyLoader!: WebhookKeyLoader;

  constructor(
    @inject(RequestCache) requestCache: RequestCache,
    @inject(ContextFactory) contextFactory: ContextFactory,
    @inject(LoggedInUserGuard) loggedInUserGuard: LoggedInUserGuard,
    @inject(WebhookKeyLoader) webhookKeyLoader: WebhookKeyLoader,
  ) {
    super();
    this.requestCache = requestCache;
    this.contextFactory = contextFactory;
    this.loggedInUserGuard = loggedInUserGuard;
    this.webhookKeyLoader = webhookKeyLoader;
  }

  public run = runWithHooks(
    () => [
      this.loggedInUserGuard,
      this.webhookKeyLoader,
    ],
    async (_, args: { webhookKeyId: string; }, context) => {
      if (!context.currentUser?.id) {
        return {
          __typename: "UnAuthenticatedError",
          type: "UNAUTHENTICATED_ERROR",
          message: "Unauthenticated request",
        };
      }
      const webhookKey = this.requestCache.getWebhookKey(
        context.cacheKey,
        args.webhookKeyId
      );
      if (!webhookKey) {
        return {
          __typename: "UnAuthenticatedError",
          type: "UNAUTHENTICATED_ERROR",
          message: "Unauthenticated request",
        };
      }
      if (webhookKey.keyType != "user_key" || webhookKey.userId != context.currentUser?.id) {
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

