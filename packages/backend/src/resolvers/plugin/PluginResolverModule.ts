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
import { Plugin as DBPlugin } from "@floro/database/src/entities/Plugin";
import { PluginVersion as DBPluginVersion } from "@floro/database/src/entities/PluginVersion";
import semver from "semver";
import MainConfig from "@floro/config/src/MainConfig";

@injectable()
export default class PluginResolverModule extends BaseResolverModule {
  public resolvers: Array<keyof this & keyof main.ResolversTypes> = [
    "Query",
    "Mutation",
    "Plugin",
  ];
  protected repositoryService!: RepositoryService;
  protected config!: MainConfig;
  protected contextFactory!: ContextFactory;
  protected requestCache!: RequestCache;

  protected loggedInUserGuard!: LoggedInUserGuard;
  protected pluginRegistryService!: PluginRegistryService;
  protected rootOrganizationMemberPermissionsLoader!: RootOrganizationMemberPermissionsLoader;

  constructor(
    @inject(ContextFactory) contextFactory: ContextFactory,
    @inject(MainConfig) config: MainConfig,
    @inject(RequestCache) requestCache: RequestCache,
    @inject(PluginRegistryService) pluginRegistryService: PluginRegistryService,
    @inject(LoggedInUserGuard) loggedInUserGuard: LoggedInUserGuard,
    @inject(RootOrganizationMemberPermissionsLoader)
    rootOrganizationMemberPermissionsLoader: RootOrganizationMemberPermissionsLoader
  ) {
    super();
    this.contextFactory = contextFactory;
    this.config = config;
    this.requestCache = requestCache;
    this.pluginRegistryService = pluginRegistryService;

    this.loggedInUserGuard = loggedInUserGuard;
    this.rootOrganizationMemberPermissionsLoader =
      rootOrganizationMemberPermissionsLoader;
  }

  private sortBySemver(pluginVersions: DBPluginVersion[]): DBPluginVersion[] {
    return pluginVersions.sort((a: DBPluginVersion, b: DBPluginVersion) => {
      if (semver.eq(a.version, b.version)) {
        return 0;
      }
      return semver.gt(a.version, b.version) ? -1 : 1;
    });
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

  public Plugin: main.PluginResolvers = {
    versions: runWithHooks(
      () => [],
      async (plugin, _, { cacheKey, currentUser }) => {
        const dbPlugin = plugin as DBPlugin;
        const membership = this.requestCache.getOrganizationMembership(
          cacheKey,
          dbPlugin.id,
          currentUser?.id
        );
        if (
          dbPlugin.ownerType == "user_plugin" &&
          currentUser?.id == dbPlugin.userId
        ) {
          return this.sortBySemver(dbPlugin?.versions ?? []);
        }
        if (
          dbPlugin.ownerType == "org_plugin" &&
          membership &&
          membership.membershipState == "active"
        ) {
          return this.sortBySemver(dbPlugin?.versions ?? []);
        }
        if (!dbPlugin?.isPrivate) {
          return this.sortBySemver(
            dbPlugin?.versions?.filter?.((v) => {
              return v.state == "released" && !v.isPrivate;
            }) ?? []
          );
        }
        return null;
      }
    ),
    lastReleasedPrivateVersion: runWithHooks(
      () => [],
      async (plugin, _, { cacheKey, currentUser }) => {
        const dbPlugin = plugin as DBPlugin;
        const membership = this.requestCache.getOrganizationMembership(
          cacheKey,
          dbPlugin.id,
          currentUser?.id
        );
        if (
          dbPlugin.ownerType == "user_plugin" &&
          currentUser?.id == dbPlugin.userId
        ) {
          return dbPlugin.lastReleasedPrivatePluginVersion ?? null;
        }
        if (
          dbPlugin.ownerType == "org_plugin" &&
          membership &&
          membership.membershipState == "active"
        ) {
          return dbPlugin.lastReleasedPrivatePluginVersion ?? null;
        }
        return null;
      }
    ),
    isPrivate: runWithHooks(
      () => [],
      async (plugin, _, { cacheKey, currentUser }) => {
        const dbPlugin = plugin as DBPlugin;
        const membership = this.requestCache.getOrganizationMembership(
          cacheKey,
          dbPlugin.id,
          currentUser?.id
        );
        if (!plugin.isPrivate) {
          return false;
        }
        if (
          dbPlugin.ownerType == "user_plugin" &&
          currentUser?.id == dbPlugin.userId
        ) {
          return plugin.isPrivate;
        }
        if (
          dbPlugin.ownerType == "org_plugin" &&
          membership &&
          membership.membershipState == "active"
        ) {
          return plugin.isPrivate;
        }
        return null;
      }
    ),
    ownerType: runWithHooks(
      () => [],
      async (plugin, _, { cacheKey, currentUser }) => {
        const dbPlugin = plugin as DBPlugin;
        const membership = this.requestCache.getOrganizationMembership(
          cacheKey,
          dbPlugin.id,
          currentUser?.id
        );
        if (!plugin.isPrivate) {
          return plugin.ownerType as string;
        }
        if (
          dbPlugin.ownerType == "user_plugin" &&
          currentUser?.id == dbPlugin.userId
        ) {
          return plugin.ownerType as string;
        }
        if (
          dbPlugin.ownerType == "org_plugin" &&
          membership &&
          membership.membershipState == "active"
        ) {
          return plugin.ownerType as string;
        }
        return null;
      }
    ),
    displayName: runWithHooks(
      () => [],
      async (plugin, _, { cacheKey, currentUser }) => {
        const dbPlugin = plugin as DBPlugin;
        const membership = this.requestCache.getOrganizationMembership(
          cacheKey,
          dbPlugin.id,
          currentUser?.id
        );
        if (
          dbPlugin.ownerType == "user_plugin" &&
          currentUser?.id == dbPlugin.userId
        ) {
          if (dbPlugin.isPrivate && dbPlugin.lastReleasedPrivatePluginVersion) {
            return dbPlugin.lastReleasedPrivatePluginVersion.displayName;
          }
          if (!dbPlugin.isPrivate && dbPlugin.lastReleasedPublicPluginVersion) {
            return dbPlugin.lastReleasedPublicPluginVersion.displayName;
          }
          const versions = this.sortBySemver(dbPlugin?.versions ?? []);
          const lastVersion = versions[0];
          if (lastVersion) {
            return lastVersion.displayName;
          }
          return dbPlugin.name;
        }
        if (
          dbPlugin.ownerType == "org_plugin" &&
          membership &&
          membership.membershipState == "active"
        ) {
          if (dbPlugin.isPrivate && dbPlugin.lastReleasedPrivatePluginVersion) {
            return dbPlugin.lastReleasedPrivatePluginVersion.displayName;
          }
          if (!dbPlugin.isPrivate && dbPlugin.lastReleasedPublicPluginVersion) {
            return dbPlugin.lastReleasedPublicPluginVersion.displayName;
          }
          const versions = this.sortBySemver(dbPlugin?.versions ?? []);
          const lastVersion = versions[0];
          if (lastVersion) {
            return lastVersion.displayName;
          }
          return dbPlugin.name;
        }
        if (!dbPlugin.isPrivate) {
          if (dbPlugin.lastReleasedPublicPluginVersion) {
            return dbPlugin.lastReleasedPublicPluginVersion.displayName;
          }
          return dbPlugin.name;
        }
        return null;
      }
    ),
    lightIcon: runWithHooks(
      () => [],
      async (plugin, _, { cacheKey, currentUser }) => {
        const dbPlugin = plugin as DBPlugin;
        const membership = this.requestCache.getOrganizationMembership(
          cacheKey,
          dbPlugin.id,
          currentUser?.id
        );
        if (
          dbPlugin.ownerType == "user_plugin" &&
          currentUser?.id == dbPlugin.userId
        ) {
          if (dbPlugin.isPrivate && dbPlugin.lastReleasedPrivatePluginVersion) {
            return dbPlugin.lastReleasedPrivatePluginVersion.lightIcon;
          }
          if (!dbPlugin.isPrivate && dbPlugin.lastReleasedPublicPluginVersion) {
            return dbPlugin.lastReleasedPublicPluginVersion.lightIcon;
          }
          const versions = this.sortBySemver(dbPlugin?.versions ?? []);
          const lastVersion = versions[0];
          if (lastVersion) {
            return lastVersion.lightIcon;
          }
          return `${this.config.assetHost()}/assets/images/icons/plugin_default.unselected.light.svg`;
        }

        if (
          dbPlugin.ownerType == "org_plugin" &&
          membership &&
          membership.membershipState == "active"
        ) {
          if (dbPlugin.isPrivate && dbPlugin.lastReleasedPrivatePluginVersion) {
            return dbPlugin.lastReleasedPrivatePluginVersion.lightIcon;
          }
          if (!dbPlugin.isPrivate && dbPlugin.lastReleasedPublicPluginVersion) {
            return dbPlugin.lastReleasedPublicPluginVersion.lightIcon;
          }
          const versions = this.sortBySemver(dbPlugin?.versions ?? []);
          const lastVersion = versions[0];
          if (lastVersion) {
            return lastVersion.lightIcon;
          }
          return `${this.config.assetHost()}/assets/images/icons/plugin_default.unselected.light.svg`;
        }
        if (!dbPlugin.isPrivate) {
          if (dbPlugin.lastReleasedPublicPluginVersion) {
            return dbPlugin.lastReleasedPublicPluginVersion.lightIcon;
          }
          return `${this.config.assetHost()}/assets/images/icons/plugin_default.unselected.light.svg`;
        }
        return null;
      }
    ),
    darkIcon: runWithHooks(
      () => [],
      async (plugin, _, { cacheKey, currentUser }) => {
        const dbPlugin = plugin as DBPlugin;
        const membership = this.requestCache.getOrganizationMembership(
          cacheKey,
          dbPlugin.id,
          currentUser?.id
        );
        if (
          dbPlugin.ownerType == "user_plugin" &&
          currentUser?.id == dbPlugin.userId
        ) {
          if (dbPlugin.isPrivate && dbPlugin.lastReleasedPrivatePluginVersion) {
            return dbPlugin.lastReleasedPrivatePluginVersion.darkIcon;
          }
          if (!dbPlugin.isPrivate && dbPlugin.lastReleasedPublicPluginVersion) {
            return dbPlugin.lastReleasedPublicPluginVersion.darkIcon;
          }
          const versions = this.sortBySemver(dbPlugin?.versions ?? []);
          const lastVersion = versions[0];
          if (lastVersion) {
            return lastVersion.lightIcon;
          }
          return `${this.config.assetHost()}/assets/images/icons/plugin_default.unselected.dark.svg`;
        }

        if (
          dbPlugin.ownerType == "org_plugin" &&
          membership &&
          membership.membershipState == "active"
        ) {
          if (dbPlugin.isPrivate && dbPlugin.lastReleasedPrivatePluginVersion) {
            return dbPlugin.lastReleasedPrivatePluginVersion.darkIcon;
          }
          if (!dbPlugin.isPrivate && dbPlugin.lastReleasedPublicPluginVersion) {
            return dbPlugin.lastReleasedPublicPluginVersion.darkIcon;
          }
          const versions = this.sortBySemver(dbPlugin?.versions ?? []);
          const lastVersion = versions[0];
          if (lastVersion) {
            return lastVersion.darkIcon;
          }
          return `${this.config.assetHost()}/assets/images/icons/plugin_default.unselected.dark.svg`;
        }
        if (!dbPlugin.isPrivate) {
          if (dbPlugin.lastReleasedPublicPluginVersion) {
            return dbPlugin.lastReleasedPublicPluginVersion.darkIcon;
          }
          return `${this.config.assetHost()}/assets/images/icons/plugin_default.unselected.dark.svg`;
        }
        return null;
      }
    ),
    selectedLightIcon: runWithHooks(
      () => [],
      async (plugin, _, { cacheKey, currentUser }) => {
        const dbPlugin = plugin as DBPlugin;
        const membership = this.requestCache.getOrganizationMembership(
          cacheKey,
          dbPlugin.id,
          currentUser?.id
        );
        if (
          dbPlugin.ownerType == "user_plugin" &&
          currentUser?.id == dbPlugin.userId
        ) {
          if (dbPlugin.isPrivate && dbPlugin.lastReleasedPrivatePluginVersion) {
            return dbPlugin.lastReleasedPrivatePluginVersion.selectedLightIcon;
          }
          if (!dbPlugin.isPrivate && dbPlugin.lastReleasedPublicPluginVersion) {
            return dbPlugin.lastReleasedPublicPluginVersion.selectedLightIcon;
          }
          const versions = this.sortBySemver(dbPlugin?.versions ?? []);
          const lastVersion = versions[0];
          if (lastVersion) {
            return lastVersion.selectedLightIcon;
          }
          return `${this.config.assetHost()}/assets/images/icons/plugin_default.selected.light.svg`;
        }

        if (
          dbPlugin.ownerType == "org_plugin" &&
          membership &&
          membership.membershipState == "active"
        ) {
          if (dbPlugin.isPrivate && dbPlugin.lastReleasedPrivatePluginVersion) {
            return dbPlugin.lastReleasedPrivatePluginVersion.selectedLightIcon;
          }
          if (!dbPlugin.isPrivate && dbPlugin.lastReleasedPublicPluginVersion) {
            return dbPlugin.lastReleasedPublicPluginVersion.selectedLightIcon;
          }
          const versions = this.sortBySemver(dbPlugin?.versions ?? []);
          const lastVersion = versions[0];
          if (lastVersion) {
            return lastVersion.selectedLightIcon;
          }
          return `${this.config.assetHost()}/assets/images/icons/plugin_default.selected.light.svg`;
        }
        if (!dbPlugin.isPrivate) {
          if (dbPlugin.lastReleasedPublicPluginVersion) {
            return dbPlugin.lastReleasedPublicPluginVersion.selectedLightIcon;
          }
          return `${this.config.assetHost()}/assets/images/icons/plugin_default.selected.light.svg`;
        }
        return null;
      }
    ),
    selectedDarkIcon: runWithHooks(
      () => [],
      async (plugin, _, { cacheKey, currentUser }) => {
        const dbPlugin = plugin as DBPlugin;
        const membership = this.requestCache.getOrganizationMembership(
          cacheKey,
          dbPlugin.id,
          currentUser?.id
        );
        if (
          dbPlugin.ownerType == "user_plugin" &&
          currentUser?.id == dbPlugin.userId
        ) {
          if (dbPlugin.isPrivate && dbPlugin.lastReleasedPrivatePluginVersion) {
            return dbPlugin.lastReleasedPrivatePluginVersion.selectedDarkIcon;
          }
          if (!dbPlugin.isPrivate && dbPlugin.lastReleasedPublicPluginVersion) {
            return dbPlugin.lastReleasedPublicPluginVersion.selectedDarkIcon;
          }
          const versions = this.sortBySemver(dbPlugin?.versions ?? []);
          const lastVersion = versions[0];
          if (lastVersion) {
            return lastVersion.selectedDarkIcon;
          }
          return `${this.config.assetHost()}/assets/images/icons/plugin_default.selected.dark.svg`;
        }

        if (
          dbPlugin.ownerType == "org_plugin" &&
          membership &&
          membership.membershipState == "active"
        ) {
          if (dbPlugin.isPrivate && dbPlugin.lastReleasedPrivatePluginVersion) {
            return dbPlugin.lastReleasedPrivatePluginVersion.selectedDarkIcon;
          }
          if (!dbPlugin.isPrivate && dbPlugin.lastReleasedPublicPluginVersion) {
            return dbPlugin.lastReleasedPublicPluginVersion.selectedDarkIcon;
          }
          const versions = this.sortBySemver(dbPlugin?.versions ?? []);
          const lastVersion = versions[0];
          if (lastVersion) {
            return lastVersion.selectedDarkIcon;
          }
          return `${this.config.assetHost()}/assets/images/icons/plugin_default.selected.dark.svg`;
        }
        if (!dbPlugin.isPrivate) {
          if (dbPlugin.lastReleasedPublicPluginVersion) {
            return dbPlugin.lastReleasedPublicPluginVersion.selectedDarkIcon;
          }
          return `${this.config.assetHost()}/assets/images/icons/plugin_default.selected.dark.svg`;
        }
        return null;
      }
    ),
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