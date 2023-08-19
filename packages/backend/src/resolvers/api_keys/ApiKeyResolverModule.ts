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
import ApiKeyService from "../../services/api_keys/ApiKeyService";
import ApiKeyLoader from "../hooks/loaders/ApiKey/ApiKeyLoader";
import OrgApiKeyGuard from "../hooks/guards/OrgApiKeyGuard";
import UserApiKeyGuard from "../hooks/guards/UserApiKeyGuard";
import DNSHelper from "../../utils/DNSHelper";

@injectable()
export default class ApiKeyResolverModule extends BaseResolverModule {
  public resolvers: Array<keyof this & keyof main.ResolversTypes> = [
    "Mutation",
    "WebhookKey",
  ];
  protected mainConfig!: MainConfig;
  protected photoUploadService!: PhotoUploadService;
  protected contextFactory!: ContextFactory;
  protected requestCache!: RequestCache;
  protected apiKeyService!: ApiKeyService;

  protected apiKeyLoader!: ApiKeyLoader;
  protected orgApiKeyGuard!: OrgApiKeyGuard;
  protected userApiKeyGuard!: UserApiKeyGuard;

  protected loggedInUserGuard!: LoggedInUserGuard;

  protected rootOrganizationMemberPermissionsLoader!: RootOrganizationMemberPermissionsLoader;

  constructor(
    @inject(ContextFactory) contextFactory: ContextFactory,
    @inject(RequestCache) requestCache: RequestCache,
    @inject(LoggedInUserGuard) loggedInUserGuard: LoggedInUserGuard,
    @inject(ApiKeyService) apiKeyService: ApiKeyService,
    rootOrganizationMemberPermissionsLoader: RootOrganizationMemberPermissionsLoader,
    @inject(ApiKeyLoader) apiKeyLoader: ApiKeyLoader,
    @inject(OrgApiKeyGuard) orgApiKeyGuard: OrgApiKeyGuard,
    @inject(UserApiKeyGuard) userApiKeyGuard: UserApiKeyGuard
  ) {
    super();
    this.contextFactory = contextFactory;
    this.requestCache = requestCache;

    this.loggedInUserGuard = loggedInUserGuard;
    this.apiKeyService = apiKeyService;
    this.rootOrganizationMemberPermissionsLoader =
      rootOrganizationMemberPermissionsLoader;

    this.apiKeyLoader = apiKeyLoader;
    this.orgApiKeyGuard = orgApiKeyGuard;
    this.userApiKeyGuard = userApiKeyGuard;
  }

  public WebhookKey: main.WebhookKeyResolvers = {
    txtRecord: (webhookKey) => {
      if (webhookKey.isVerified) {
        return null;
      }
      if (!webhookKey.id) {
      }
      return DNSHelper.getVerificationKey(
        webhookKey as { id: string; dnsVerificationCode: string }
      );
    },
    dnsVerificationCode: (webhookKey) => {
      if (webhookKey.isVerified) {
        return null;
      }
      return webhookKey.dnsVerificationCode ?? null;
    },
  };

  public Mutation: main.MutationResolvers = {
    createUserApiKey: runWithHooks(
      () => [this.loggedInUserGuard],
      async (_, args: main.MutationCreateUserApiKeyArgs, { currentUser }) => {
        const result = await this.apiKeyService.createUserApiKey(
          args.keyName,
          currentUser
        );
        if (result.action == "CREATE_API_KEY_SUCCEEDED") {
          return {
            __typename: "UserApiKeySuccess",
            user: currentUser,
            apiKey: result.apiKey,
          };
        }
        if (result.action == "LOG_ERROR") {
          console.error(
            result.error?.type,
            result?.error?.message,
            result?.error?.meta
          );
          return {
            __typename: "UserApiKeyError",
            message: "Unknown Error",
            type: "UNKNOWN_ERROR",
          };
        }
        return {
          __typename: "UserApiKeyError",
          message: result.error?.message ?? "Unknown Error",
          type: result.error?.type ?? "UNKNOWN_ERROR",
        };
      }
    ),
    createOrganizationApiKey: runWithHooks(
      () => [
        this.loggedInUserGuard,
        this.rootOrganizationMemberPermissionsLoader,
      ],
      async (
        _,
        args: main.MutationCreateOrganizationApiKeyArgs,
        { currentUser, cacheKey }
      ) => {
        const organization = this.requestCache.getOrganization(
          cacheKey,
          args.organizationId
        );
        if (!organization) {
          return {
            __typename: "OrganizationApiKeyError",
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
            __typename: "OrganizationApiKeyError",
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
            __typename: "OrganizationApiKeyError",
            message: "Forbidden Action",
            type: "FORBIDDEN_ACTION_ERROR",
          };
        }
        const result = await this.apiKeyService.createOrgApiKey(
          args.keyName,
          currentUser,
          organization
        );
        if (result.action == "CREATE_API_KEY_SUCCEEDED") {
          return {
            __typename: "OrganizationApiKeySuccess",
            organization,
            apiKey: result.apiKey,
          };
        }
        if (result.action == "LOG_ERROR") {
          console.error(
            result.error?.type,
            result?.error?.message,
            result?.error?.meta
          );
          return {
            __typename: "OrganizationApiKeyError",
            message: "Unknown Error",
            type: "UNKNOWN_ERROR",
          };
        }
        return {
          __typename: "OrganizationApiKeyError",
          message: result.error?.message ?? "Unknown Error",
          type: result.error?.type ?? "UNKNOWN_ERROR",
        };
      }
    ),
    regenerateUserApiKey: runWithHooks(
      () => [this.loggedInUserGuard, this.apiKeyLoader, this.userApiKeyGuard],
      async (
        _,
        args: main.MutationRegenerateUserApiKeyArgs,
        { cacheKey, currentUser }
      ) => {
        const apiKey = this.requestCache.getApiKey(cacheKey, args.apiKeyId);
        const updatedApiKey = await this.apiKeyService.regenerateApiKey(apiKey);
        return {
          __typename: "UserApiKeySuccess",
          user: currentUser,
          apiKey: updatedApiKey,
        };
      }
    ),
    regenerateOrganizationApiKey: runWithHooks(
      () => [this.loggedInUserGuard, this.apiKeyLoader, this.orgApiKeyGuard],
      async (
        _,
        args: main.MutationRegenerateOrganizationApiKeyArgs,
        { cacheKey }
      ) => {
        const organization = this.requestCache.getOrganization(
          cacheKey,
          args.organizationId
        );
        const apiKey = this.requestCache.getApiKey(cacheKey, args.apiKeyId);
        const updatedApiKey = await this.apiKeyService.regenerateApiKey(apiKey);
        return {
          __typename: "OrganizationApiKeySuccess",
          organization,
          apiKey: updatedApiKey,
        };
      }
    ),
    updateUserApiKeyEnabled: runWithHooks(
      () => [this.loggedInUserGuard, this.apiKeyLoader, this.userApiKeyGuard],
      async (
        _,
        args: main.MutationUpdateUserApiKeyEnabledArgs,
        { cacheKey, currentUser }
      ) => {
        const apiKey = this.requestCache.getApiKey(cacheKey, args.apiKeyId);
        const updatedApiKey = await this.apiKeyService.updateApiKeyIsEnabled(
          apiKey,
          args.isEnabled
        );
        return {
          __typename: "UserApiKeySuccess",
          user: currentUser,
          apiKey: updatedApiKey,
        };
      }
    ),
    updateOrganizationApiKeyEnabled: runWithHooks(
      () => [this.loggedInUserGuard, this.apiKeyLoader, this.orgApiKeyGuard],
      async (
        _,
        args: main.MutationUpdateOrganizationApiKeyEnabledArgs,
        { cacheKey }
      ) => {
        const organization = this.requestCache.getOrganization(
          cacheKey,
          args.organizationId
        );
        const apiKey = this.requestCache.getApiKey(cacheKey, args.apiKeyId);
        const updatedApiKey = await this.apiKeyService.updateApiKeyIsEnabled(
          apiKey,
          args.isEnabled
        );
        return {
          __typename: "OrganizationApiKeySuccess",
          organization,
          apiKey: updatedApiKey,
        };
      }
    ),
    deleteUserApiKey: runWithHooks(
      () => [this.loggedInUserGuard, this.apiKeyLoader, this.userApiKeyGuard],
      async (
        _,
        args: main.MutationDeleteUserApiKeyArgs,
        { cacheKey, currentUser }
      ) => {
        const apiKey = this.requestCache.getApiKey(cacheKey, args.apiKeyId);
        const updatedApiKey = await this.apiKeyService.deleteApiKey(apiKey);
        return {
          __typename: "UserApiKeySuccess",
          user: currentUser,
          apiKey: updatedApiKey,
        };
      }
    ),
    deleteOrganizationApiKey: runWithHooks(
      () => [this.loggedInUserGuard, this.apiKeyLoader, this.orgApiKeyGuard],
      async (
        _,
        args: main.MutationDeleteOrganizationApiKeyArgs,
        { cacheKey }
      ) => {
        const organization = this.requestCache.getOrganization(
          cacheKey,
          args.organizationId
        );
        const apiKey = this.requestCache.getApiKey(cacheKey, args.apiKeyId);
        const updatedApiKey = await this.apiKeyService.deleteApiKey(apiKey);
        return {
          __typename: "OrganizationApiKeySuccess",
          organization,
          apiKey: updatedApiKey,
        };
      }
    ),
  };
}
