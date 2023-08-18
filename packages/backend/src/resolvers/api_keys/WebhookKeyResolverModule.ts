import BaseResolverModule from "../BaseResolverModule";
import { main } from "@floro/graphql-schemas";
import { inject, injectable } from "inversify";
import ContextFactory from "@floro/database/src/contexts/ContextFactory";
import RequestCache from "../../request/RequestCache";
import LoggedInUserGuard from "../hooks/guards/LoggedInUserGuard";
import { runWithHooks } from "../hooks/ResolverHook";
import RootOrganizationMemberPermissionsLoader from "../hooks/loaders/Root/OrganizationID/RootOrganizationMemberPermissionsLoader";
import PhotoUploadService from "../../services/photos/PhotoUploadService";
import MainConfig from "@floro/config/src/MainConfig";
import OrgWebhookKeyGuard from "../hooks/guards/OrgWebhookKeyGuard";
import UserWebhookKeyGuard from "../hooks/guards/UserWebhookKeyGuard";
import WebhookKeyService from "../../services/api_keys/WebhookKeyService";
import WebhookKeyLoader from "../hooks/loaders/ApiKey/WebhookKeyLoader";

@injectable()
export default class WebhookKeyResolverModule extends BaseResolverModule {
  public resolvers: Array<keyof this & keyof main.ResolversTypes> = [
    "Mutation",
  ];
  protected mainConfig!: MainConfig;
  protected photoUploadService!: PhotoUploadService;
  protected contextFactory!: ContextFactory;
  protected requestCache!: RequestCache;
  protected webhookKeyService!: WebhookKeyService;

  protected loggedInUserGuard!: LoggedInUserGuard;

  protected rootOrganizationMemberPermissionsLoader!: RootOrganizationMemberPermissionsLoader;
  protected webhookKeyLoader!: WebhookKeyLoader;
  protected orgWebhookKeyGuard!: OrgWebhookKeyGuard;
  protected userWebhookKeyGuard!: UserWebhookKeyGuard;

  constructor(
    @inject(ContextFactory) contextFactory: ContextFactory,
    @inject(RequestCache) requestCache: RequestCache,
    @inject(LoggedInUserGuard) loggedInUserGuard: LoggedInUserGuard,
    rootOrganizationMemberPermissionsLoader: RootOrganizationMemberPermissionsLoader,
    @inject(WebhookKeyService) webhookKeyService: WebhookKeyService,
    @inject(WebhookKeyLoader) webhookKeyLoader: WebhookKeyLoader,
    @inject(OrgWebhookKeyGuard) orgWebhookKeyGuard: OrgWebhookKeyGuard,
    @inject(UserWebhookKeyGuard) userWebhookKeyGuard: UserWebhookKeyGuard
  ) {
    super();
    this.contextFactory = contextFactory;
    this.requestCache = requestCache;
    this.webhookKeyService = webhookKeyService;

    this.loggedInUserGuard = loggedInUserGuard;
    this.rootOrganizationMemberPermissionsLoader =
      rootOrganizationMemberPermissionsLoader;

    this.webhookKeyLoader = webhookKeyLoader;
    this.orgWebhookKeyGuard = orgWebhookKeyGuard;
    this.userWebhookKeyGuard = userWebhookKeyGuard;
  }

  public Mutation: main.MutationResolvers = {
    createUserWebhookKey: runWithHooks(
      () => [this.loggedInUserGuard],
      async (_, args: main.MutationCreateUserWebhookKeyArgs, { currentUser}) => {
        const result = await this.webhookKeyService.createUserWebhookKey(
          {
            domain: args.domain,
            defaultPort: args.defaultPort as number,
            defaultSubdomain: args.defaultSubdomain as string,
            defaultProtocol: args.defaultProtocol  as "http"|"https"
          },
          currentUser
        );
        if (result.action == "CREATE_WEBHOOK_KEY_SUCCEEDED") {
          return {
            __typename: "UserWebhookKeySuccess",
            user: currentUser,
            webhookKey: result.webhookKey,
          };
        }
        if (result.action == "LOG_ERROR") {
          console.error(
            result.error?.type,
            result?.error?.message,
            result?.error?.meta
          );
          return {
            __typename: "UserWebhookKeyError",
            message: "Unknown Error",
            type: "UNKNOWN_ERROR",
          };
        }
        return {
          __typename: "UserWebhookKeyError",
          message: result.error?.message ?? "Unknown Error",
          type: result.error?.type ?? "UNKNOWN_ERROR",
        };
      }
    ),
    createOrganizationWebhookKey: runWithHooks(
      () => [this.loggedInUserGuard, this.rootOrganizationMemberPermissionsLoader],
      async (_, args: main.MutationCreateOrganizationWebhookKeyArgs, { cacheKey, currentUser}) => {
        const organization = this.requestCache.getOrganization(
          cacheKey,
          args.organizationId
        );
        if (!organization) {
          return {
            __typename: "OrganizationWebhookKeyError",
            message: "Forbidden Action",
            type: "FORBIDDEN_ACTION_ERROR",
          };
        }
        const currentMember = this.requestCache.getOrganizationMembership(
          cacheKey,
          args.organizationId,
          currentUser.id
        );
        if (!currentMember?.id) {
          return {
            __typename: "OrganizationWebhookKeyError",
            message: "Forbidden Action",
            type: "FORBIDDEN_ACTION_ERROR",
          };
        }
        const permissions = this.requestCache.getMembershipPermissions(
          cacheKey,
          currentMember.id
        );
        if (!permissions?.canModifyOrganizationDeveloperSettings) {
          return {
            __typename: "OrganizationWebhookKeyError",
            message: "Forbidden Action",
            type: "FORBIDDEN_ACTION_ERROR",
          };
        }

        const result = await this.webhookKeyService.createOrgniazationWebhookKey(
          {
            domain: args.domain,
            defaultPort: args.defaultPort as number,
            defaultSubdomain: args.defaultSubdomain as string,
            defaultProtocol: args.defaultProtocol  as "http"|"https"
          },
          organization,
          currentUser
        );
        if (result.action == "CREATE_WEBHOOK_KEY_SUCCEEDED") {
          return {
            __typename: "OrganizationWebhookKeySuccess",
            organization,
            webhookKey: result.webhookKey,
          };
        }
        if (result.action == "LOG_ERROR") {
          console.error(
            result.error?.type,
            result?.error?.message,
            result?.error?.meta
          );
          return {
            __typename: "OrganizationWebhookKeyError",
            message: "Unknown Error",
            type: "UNKNOWN_ERROR",
          };
        }
        return {
          __typename: "OrganizationWebhookKeyError",
          message: result.error?.message ?? "Unknown Error",
          type: result.error?.type ?? "UNKNOWN_ERROR",
        };
      }
    ),
    verifyUserWebhookKey: runWithHooks(
      () => [this.loggedInUserGuard, this.webhookKeyLoader, this.userWebhookKeyGuard],
      async (_, args: main.MutationVerifyUserWebhookKeyArgs, { cacheKey, currentUser}) => {
        const webhookKey = this.requestCache.getWebhookKey(cacheKey, args.webhookKeyId);
        const result = await this.webhookKeyService.verifyWebhook(webhookKey);
        if (result.action != "WEBHOOK_VERIFICATION_SUCCEEDED") {
          return {
            __typename: "UserWebhookKeyError",
            action: result.action,
            message: result.action,
          };
        }
        return {
          __typename: "UserWebhookKeySuccess",
          user: currentUser,
          webhookKey: result.webhookKey,
        };
      }
    ),
    verifyOrganizationWebhookKey: runWithHooks(
      () => [this.loggedInUserGuard, this.webhookKeyLoader, this.orgWebhookKeyGuard],
      async (_, args: main.MutationVerifyOrganizationWebhookKeyArgs, { cacheKey}) => {
        const organization = this.requestCache.getOrganization(
          cacheKey,
          args.organizationId
        );
        const webhookKey = this.requestCache.getWebhookKey(cacheKey, args.webhookKeyId);
        const result = await this.webhookKeyService.verifyWebhook(webhookKey);
        if (result.action != "WEBHOOK_VERIFICATION_SUCCEEDED") {
          return {
            __typename: "OrganizationWebhookKeyError",
            action: result.action,
            message: result.action,
          };
        }
        return {
          __typename: "OrganizationWebhookKeySuccess",
          organization,
          webhookKey: result.webhookKey,
        };
      }
    ),
    regenerateUserWebhookKey: runWithHooks(
      () => [this.loggedInUserGuard, this.webhookKeyLoader, this.userWebhookKeyGuard],
      async (_, args: main.MutationRegenerateUserWebhookKeyArgs, { cacheKey, currentUser}) => {
        const webhookKey = this.requestCache.getWebhookKey(cacheKey, args.webhookKeyId);
        const updatedWebhookKey = await this.webhookKeyService.regenerateWebhookKey(webhookKey);
        return {
          __typename: "UserWebhookKeySuccess",
          user: currentUser,
          webhookKey: updatedWebhookKey,
        };
      }
    ),
    regenerateOrganizationWebhookKey: runWithHooks(
      () => [this.loggedInUserGuard, this.webhookKeyLoader, this.orgWebhookKeyGuard],
      async (_, args: main.MutationRegenerateOrganizationWebhookKeyArgs, { cacheKey}) => {
        const organization = this.requestCache.getOrganization(
          cacheKey,
          args.organizationId
        );
        const webhookKey = this.requestCache.getWebhookKey(cacheKey, args.webhookKeyId);
        const updatedWebhookKey = await this.webhookKeyService.regenerateWebhookKey(webhookKey);
        return {
          __typename: "OrganizationWebhookKeySuccess",
          organization,
          webhookKey: updatedWebhookKey,
        };
      }
    ),
    updateUserWebhookKey: runWithHooks(
      () => [this.loggedInUserGuard, this.webhookKeyLoader, this.userWebhookKeyGuard],
      async (_, args: main.MutationUpdateUserWebhookKeyArgs, {cacheKey, currentUser}) => {
        const webhookKey = this.requestCache.getWebhookKey(cacheKey, args.webhookKeyId);
        const result = await this.webhookKeyService.updateWebhook(webhookKey, {
            defaultPort: args.defaultPort as number,
            defaultSubdomain: args.defaultSubdomain as string,
            defaultProtocol: args.defaultProtocol  as "http"|"https"
        });
        if (result.action != "WEBHOOK_UPDATE_SUCCEEDED") {
          return {
            __typename: "UserWebhookKeyError",
            action: result.action,
            message: result.action,
          };
        }
        return {
          __typename: "UserWebhookKeySuccess",
          user: currentUser,
          webhookKey: result.webhookKey,
        };
      }
    ),
    updateOrganizationWebhookKey: runWithHooks(
      () => [this.loggedInUserGuard, this.webhookKeyLoader, this.orgWebhookKeyGuard],
      async (_, args: main.MutationUpdateOrganizationWebhookKeyArgs, { cacheKey}) => {
      const organization = this.requestCache.getOrganization(
          cacheKey,
          args.organizationId
        );
        const webhookKey = this.requestCache.getWebhookKey(cacheKey, args.webhookKeyId);
        const result = await this.webhookKeyService.updateWebhook(webhookKey, {
            defaultPort: args.defaultPort as number,
            defaultSubdomain: args.defaultSubdomain as string,
            defaultProtocol: args.defaultProtocol  as "http"|"https"
        });
        if (result.action != "WEBHOOK_UPDATE_SUCCEEDED") {
          return {
            __typename: "OrganizationWebhookKeyError",
            action: result.action,
            message: result.action,
          };
        }
        return {
          __typename: "OrganizationWebhookKeySuccess",
          organization,
          webhookKey: result.webhookKey,
        };
      }
    ),
    updateUserWebhookKeyEnabled: runWithHooks(
      () => [this.loggedInUserGuard, this.webhookKeyLoader, this.userWebhookKeyGuard],
      async (_, args: main.MutationUpdateUserWebhookKeyEnabledArgs, { cacheKey, currentUser}) => {
        const webhookKey = this.requestCache.getWebhookKey(cacheKey, args.webhookKeyId);
        const updatedWebhookKey = await this.webhookKeyService.updateWebHookIsEnabled(webhookKey, args.isEnabled);
        return {
          __typename: "UserWebhookKeySuccess",
          user: currentUser,
          webhookKey: updatedWebhookKey,
        };
      }
    ),
    updateOrganizationWebhookKeyEnabled: runWithHooks(
      () => [this.loggedInUserGuard, this.webhookKeyLoader, this.orgWebhookKeyGuard],
      async (_, args: main.MutationUpdateOrganizationWebhookKeyEnabledArgs, { cacheKey}) => {
        const organization = this.requestCache.getOrganization(
          cacheKey,
          args.organizationId
        );
        const webhookKey = this.requestCache.getWebhookKey(cacheKey, args.webhookKeyId);
        const updatedWebhookKey = await this.webhookKeyService.updateWebHookIsEnabled(webhookKey, args.isEnabled);
        return {
          __typename: "OrganizationWebhookKeySuccess",
          organization,
          webhookKey: updatedWebhookKey,
        };
      }
    ),
    deleteUserWebhookKey: runWithHooks(
      () => [this.loggedInUserGuard, this.webhookKeyLoader, this.userWebhookKeyGuard],
      async (_, args: main.MutationDeleteUserWebhookKeyArgs, { cacheKey, currentUser}) => {
        const webhookKey = this.requestCache.getWebhookKey(cacheKey, args.webhookKeyId);
        const updatedWebhookKey = await this.webhookKeyService.deleteWebhook(webhookKey);
        return {
          __typename: "UserWebhookKeySuccess",
          user: currentUser,
          webhookKey: updatedWebhookKey,
        };
      }
    ),
    deleteOrganizationWebhookKey: runWithHooks(
      () => [this.loggedInUserGuard, this.webhookKeyLoader, this.orgWebhookKeyGuard],
      async (_, args: main.MutationDeleteOrganizationWebhookKeyArgs, { cacheKey}) => {
        const organization = this.requestCache.getOrganization(
          cacheKey,
          args.organizationId
        );
        const webhookKey = this.requestCache.getWebhookKey(cacheKey, args.webhookKeyId);
        const updatedWebhookKey = await this.webhookKeyService.deleteWebhook(webhookKey);
        return {
          __typename: "OrganizationWebhookKeySuccess",
          organization,
          webhookKey: updatedWebhookKey,
        };
      }
    ),
  };
}