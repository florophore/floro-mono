import BaseResolverModule from "../BaseResolverModule";
import { main } from "@floro/graphql-schemas";
import { inject, injectable } from "inversify";
import ContextFactory from "@floro/database/src/contexts/ContextFactory";
import RequestCache from "../../request/RequestCache";
import LoggedInUserGuard from "../hooks/guards/LoggedInUserGuard";
import { runWithHooks } from "../hooks/ResolverHook";
import RepositoryService from "../../services/repositories/RepositoryService";
import PluginRegistryService from "../../services/plugins/PluginRegistryService";
import RootOrganizationMemberPermissionsLoader from "../hooks/loaders/Root/OrganizationID/RootOrganizationMemberPermissionsLoader";

@injectable()
export default class PluginResolverModule extends BaseResolverModule {
  public resolvers: Array<keyof this & keyof main.ResolversTypes> = [
    "Query",
    "Mutation",
  ];
  protected repositoryService!: RepositoryService;
  protected contextFactory!: ContextFactory;
  protected requestCache!: RequestCache;

  protected loggedInUserGuard!: LoggedInUserGuard;
  protected pluginRegistryService!: PluginRegistryService;
  protected rootOrganizationMemberPermissionsLoader!: RootOrganizationMemberPermissionsLoader;

  constructor(
    @inject(ContextFactory) contextFactory: ContextFactory,
    @inject(RequestCache) requestCache: RequestCache,
    @inject(PluginRegistryService) pluginRegistryService: PluginRegistryService,
    @inject(LoggedInUserGuard) loggedInUserGuard: LoggedInUserGuard,
    @inject(RootOrganizationMemberPermissionsLoader)
    rootOrganizationMemberPermissionsLoader: RootOrganizationMemberPermissionsLoader
  ) {
    super();
    this.contextFactory = contextFactory;
    this.requestCache = requestCache;
    this.pluginRegistryService = pluginRegistryService;

    this.loggedInUserGuard = loggedInUserGuard;
    this.rootOrganizationMemberPermissionsLoader =
      rootOrganizationMemberPermissionsLoader;
  }

  public Query: main.QueryResolvers = {
    checkPluginNameIsTaken: async (_, { pluginName }) => {
      const exists = await this.pluginRegistryService.checkPluginNameIsTaken(
        pluginName ?? ""
      );
      return {
        exists,
        pluginName: (pluginName ?? "").toLowerCase().trim(),
      };
    },
  };

  public Mutation: main.MutationResolvers = {
    createUserPlugin: runWithHooks(
      () => [this.loggedInUserGuard],
      async (
        _root,
        { isPrivate, name }: main.MutationCreateUserPluginArgs,
        { currentUser, cacheKey }
      ) => {
        if (!currentUser) {
          return {
            __typename: "CreateUserPluginError",
            message: "Forbidden Action",
            type: "FORBIDDEN_ACTION_ERROR",
          };
        }
        const result = await this.pluginRegistryService.registerPlugin(
          name,
          isPrivate,
          "user_plugin",
          currentUser
        );
        if (result.action == "PLUGIN_CREATED") {
          return {
            __typename: "CreateUserPluginSuccess",
            plugin: result.plugin,
            user: currentUser,
          };
        }
        if (result.action == "LOG_ERROR") {
          console.error(
            result.error?.type,
            result?.error?.message,
            result?.error?.meta
          );
          return {
            __typename: "CreateUserPluginError",
            message: "Unknown Error",
            type: "UNKNOWN_ERROR",
          };
        }
        return {
          __typename: "CreateUserPluginError",
          message: result.error?.message ?? "Unknown Error",
          type: result.error?.type ?? "UNKNOWN_ERROR",
        };
      }
    ),

    createOrgPlugin: runWithHooks(
      () => [
        this.loggedInUserGuard,
        this.rootOrganizationMemberPermissionsLoader,
      ],
      async (
        _root,
        { name, isPrivate, organizationId }: main.MutationCreateOrgPluginArgs,
        { currentUser, cacheKey }
      ) => {
        if (!currentUser) {
          return {
            __typename: "CreateOrganizationPluginError",
            message: "Forbidden Action",
            type: "FORBIDDEN_ACTION_ERROR",
          };
        }
        const organization = this.requestCache.getOrganization(
          cacheKey,
          organizationId
        );
        if (!organization) {
          return {
            __typename: "CreateOrganizationPluginError",
            message: "Forbidden Action",
            type: "FORBIDDEN_ACTION_ERROR",
          };
        }
        const membership = this.requestCache.getOrganizationMembership(
          cacheKey,
          organizationId,
          currentUser
        );
        if (!membership) {
          return {
            __typename: "CreateOrganizationPluginError",
            message: "Forbidden Action",
            type: "FORBIDDEN_ACTION_ERROR",
          };
        }

        const permissions = this.requestCache.getMembershipPermissions(
          cacheKey,
          membership.id
        );
        if (!permissions.canRegisterPlugins) {
          return {
            __typename: "CreateOrganizationPluginError",
            message: "Forbidden Action",
            type: "FORBIDDEN_ACTION_ERROR",
          };
        }

        const result = await this.pluginRegistryService.registerPlugin(
          name,
          isPrivate,
          "org_plugin",
          currentUser,
          organization
        );
        if (result.action == "PLUGIN_CREATED") {
          return {
            __typename: "CreateOrganizationPluginSuccess",
            plugin: result.plugin,
            organization,
          };
        }
        if (result.action == "LOG_ERROR") {
          console.error(
            result.error?.type,
            result?.error?.message,
            result?.error?.meta
          );
          return {
            __typename: "CreateOrganizationPluginError",
            message: "Unknown Error",
            type: "UNKNOWN_ERROR",
          };
        }
        return {
          __typename: "CreateOrganizationPluginError",
          message: result.error?.message ?? "Unknown Error",
          type: result.error?.type ?? "UNKNOWN_ERROR",
        };
      }
    ),
    releaseUserPlugin: runWithHooks(
      () => [this.loggedInUserGuard],
      async (
        _root,
        { pluginVersionId }: main.MutationReleaseUserPluginArgs,
        { currentUser }
      ) => {
        if (!currentUser) {
          return {
            __typename: "ReleaseUserPluginError",
            message: "Forbidden Action",
            type: "FORBIDDEN_ACTION_ERROR",
          };
        }
        const result = await this.pluginRegistryService.releasePlugin(
          pluginVersionId,
          currentUser
        );
        if (result.action == "PLUGIN_VERSION_RELEASED") {
          return {
            __typename: "ReleaseUserPluginSuccess",
            plugin: result.plugin,
            pluginVersion: result.pluginVersion,
          };
        }
        if (result.action == "LOG_ERROR") {
          console.error(
            result.error?.type,
            result?.error?.message,
            result?.error?.meta
          );
          return {
            __typename: "ReleaseUserPluginError",
            message: "Unknown Error",
            type: "UNKNOWN_ERROR",
          };
        }
        return {
          __typename: "ReleaseUserPluginError",
          message: result.error?.message ?? "Unknown Error",
          type: result.error?.type ?? "UNKNOWN_ERROR",
        };
      }
    ),
    releaseOrgPlugin: runWithHooks(
      () => [
        this.loggedInUserGuard,
        this.rootOrganizationMemberPermissionsLoader,
      ],
      async (
        _root,
        { pluginVersionId, organizationId }: main.MutationReleaseOrgPluginArgs,
        { currentUser, cacheKey }
      ) => {
        if (!currentUser) {
          return {
            __typename: "ReleaseOrgPluginError",
            message: "Forbidden Action",
            type: "FORBIDDEN_ACTION_ERROR",
          };
        }
        const organization = this.requestCache.getOrganization(
          cacheKey,
          organizationId
        );
        if (!organization) {
          return {
            __typename: "ReleaseOrgPluginError",
            message: "Forbidden Action",
            type: "FORBIDDEN_ACTION_ERROR",
          };
        }
        const membership = this.requestCache.getOrganizationMembership(
          cacheKey,
          organizationId,
          currentUser
        );
        if (!membership) {
          return {
            __typename: "ReleaseOrgPluginError",
            message: "Forbidden Action",
            type: "FORBIDDEN_ACTION_ERROR",
          };
        }

        const permissions = this.requestCache.getMembershipPermissions(
          cacheKey,
          membership.id
        );
        if (!permissions.canReleasePlugins) {
          return {
            __typename: "ReleaseOrgPluginError",
            message: "Forbidden Action",
            type: "FORBIDDEN_ACTION_ERROR",
          };
        }
        const result = await this.pluginRegistryService.releasePlugin(
          pluginVersionId,
          currentUser,
          organization
        );
        if (result.action == "PLUGIN_VERSION_RELEASED") {
          return {
            __typename: "ReleaseOrgPluginSuccess",
            plugin: result.plugin,
            pluginVersion: result.pluginVersion,
            organization,
          };
        }
        if (result.action == "LOG_ERROR") {
          console.error(
            result.error?.type,
            result?.error?.message,
            result?.error?.meta
          );
          return {
            __typename: "ReleaseOrgPluginError",
            message: "Unknown Error",
            type: "UNKNOWN_ERROR",
          };
        }
        return {
          __typename: "ReleaseOrgPluginError",
          message: result.error?.message ?? "Unknown Error",
          type: result.error?.type ?? "UNKNOWN_ERROR",
        };
      }
    ),
  };
}