
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
import RootOrganizationMemberPermissionsLoader from "../loaders/Root/OrganizationID/RootOrganizationMemberPermissionsLoader";
import WebhookKeyLoader from "../loaders/ApiKey/WebhookKeyLoader";

@injectable()
export default class OrgWebhookKeyGuard extends GuardResolverHook<
  unknown,
  { webhookKeyId: string; organizationId: string },
  { currentUser: User | null; cacheKey: string },
  unknown | UnAuthenticatedError
> {
  protected contextFactory!: ContextFactory;
  protected requestCache!: RequestCache;
  protected loggedInUserGuard!: LoggedInUserGuard;
  protected webhookKeyLoader!: WebhookKeyLoader;
  protected rootOrganizationMemberPermissionsLoader!: RootOrganizationMemberPermissionsLoader;

  constructor(
    @inject(RequestCache) requestCache: RequestCache,
    @inject(ContextFactory) contextFactory: ContextFactory,
    @inject(LoggedInUserGuard) loggedInUserGuard: LoggedInUserGuard,
    @inject(RootOrganizationMemberPermissionsLoader)
    rootOrganizationMemberPermissionsLoader: RootOrganizationMemberPermissionsLoader,
    @inject(WebhookKeyLoader) webhookKeyLoader: WebhookKeyLoader
  ) {
    super();
    this.requestCache = requestCache;
    this.contextFactory = contextFactory;
    this.loggedInUserGuard = loggedInUserGuard;
    this.rootOrganizationMemberPermissionsLoader =
      rootOrganizationMemberPermissionsLoader;
    this.webhookKeyLoader = webhookKeyLoader;
  }

  public run = runWithHooks(
    () => [
      this.loggedInUserGuard,
      this.webhookKeyLoader,
      this.rootOrganizationMemberPermissionsLoader,
    ],
    async (_, args: { webhookKeyId: string; organizationId: string }, context) => {
      if (!context.currentUser?.id) {
        return {
          __typename: "UnAuthenticatedError",
          type: "UNAUTHENTICATED_ERROR",
          message: "Unauthenticated request",
        };
      }

      const organizationMembership =
        this.requestCache.getOrganizationMembership(
          context.cacheKey,
          context.organizationId as string,
          context.currentUser.id
        );
      if (organizationMembership?.membershipState != "active") {
        return {
          __typename: "UnAuthenticatedError",
          type: "UNAUTHENTICATED_ERROR",
          message: "Unauthenticated request",
        };
      }
      const permissions = this.requestCache.getMembershipPermissions(
        context.cacheKey,
        organizationMembership.id
      );
      if (!permissions?.canModifyOrganizationDeveloperSettings) {
        return {
          __typename: "UnAuthenticatedError",
          type: "UNAUTHENTICATED_ERROR",
          message: "Unauthenticated request",
        };
      }
      const webhookKey =  this.requestCache.getWebhookKey(
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
      if (webhookKey.keyType != "org_key" || webhookKey.organizationId != args.organizationId) {
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
