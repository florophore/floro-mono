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
import { withFilter } from "graphql-subscriptions";
import { SubscriptionSubscribeFn } from "@floro/graphql-schemas/build/generated/main-graphql";
import RepositoriesContext from "@floro/database/src/contexts/repositories/RepositoriesContext";
import OrganizationMembersContext from "@floro/database/src/contexts/organizations/OrganizationMembersContext";
import PluginSearchService from "../../services/plugins/PluginSearchService";
import OrganizationsContext from "@floro/database/src/contexts/organizations/OrganizationsContext";
import PluginsContext from "@floro/database/src/contexts/plugins/PluginsContext";
import PluginsVersionsContext from "@floro/database/src/contexts/plugins/PluginVersionsContext";
import RootRepositoryLoader from "../hooks/loaders/Root/RepositoryID/RepositoryLoader";
import { User } from "@floro/database/src/entities/User";
import RepoDataService from "../../services/repositories/RepoDataService";

@injectable()
export default class PluginResolverModule extends BaseResolverModule {
  public resolvers: Array<keyof this & keyof main.ResolversTypes> = [
    "Query",
    "Mutation",
    "Plugin",
    "Subscription",
  ];
  protected repositoryService!: RepositoryService;
  protected config!: MainConfig;
  protected contextFactory!: ContextFactory;
  protected requestCache!: RequestCache;
  protected repoDataService!: RepoDataService;

  protected loggedInUserGuard!: LoggedInUserGuard;
  protected pluginRegistryService!: PluginRegistryService;
  protected rootOrganizationMemberPermissionsLoader!: RootOrganizationMemberPermissionsLoader;
  protected pluginSearchService!: PluginSearchService;
  protected repositoryLoader!: RootRepositoryLoader;

  constructor(
    @inject(ContextFactory) contextFactory: ContextFactory,
    @inject(MainConfig) config: MainConfig,
    @inject(RequestCache) requestCache: RequestCache,
    @inject(PluginRegistryService) pluginRegistryService: PluginRegistryService,
    @inject(RepoDataService) repoDataService: RepoDataService,
    @inject(LoggedInUserGuard) loggedInUserGuard: LoggedInUserGuard,
    @inject(PluginSearchService) pluginSearchService: PluginSearchService,
    @inject(RootOrganizationMemberPermissionsLoader)
    rootOrganizationMemberPermissionsLoader: RootOrganizationMemberPermissionsLoader,
    @inject(RootRepositoryLoader) repositoryLoader: RootRepositoryLoader
  ) {
    super();
    this.contextFactory = contextFactory;
    this.config = config;
    this.requestCache = requestCache;
    this.repoDataService = repoDataService;

    this.pluginRegistryService = pluginRegistryService;
    this.pluginSearchService = pluginSearchService;

    this.loggedInUserGuard = loggedInUserGuard;
    this.rootOrganizationMemberPermissionsLoader =
      rootOrganizationMemberPermissionsLoader;
      this.repositoryLoader = repositoryLoader;
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
    getPlugin: runWithHooks(
      () => [this.loggedInUserGuard],
      async (
        _,
        { pluginName }: main.QueryGetPluginArgs,
        { currentUser, cacheKey }
      ) => {
        try {
          const pluginsContext = await this.contextFactory.createContext(
            PluginsContext
          );
          const plugin = await pluginsContext.getByName(
            (pluginName ?? "").toLowerCase()
          );
          if (!plugin) {
            return null;
          }

          if (plugin.isPrivate && plugin?.ownerType == "user_plugin") {
            if (currentUser?.id != plugin?.userId) {
              return {
                __typename: "UnAuthenticatedError",
                type: "UNAUTHENTICATED_ERROR",
                message: "Unauthenticated request",
              };
            }
          }
          if (plugin?.ownerType == "org_plugin") {
            const organizationContext = await this.contextFactory.createContext(
              OrganizationsContext
            );
            const organization = await organizationContext.getById(
              plugin.organizationId
            );
            if (!organization) {
              return null;
            }
            const organizationMembersContext =
              await this.contextFactory.createContext(
                OrganizationMembersContext
              );
            const membership =
              await organizationMembersContext.getByOrgIdAndUserId(
                plugin.organizationId,
                currentUser?.id ?? ""
              );
            if (membership) {
              this.requestCache.setOrganizationMembership(
                cacheKey,
                organization,
                currentUser,
                membership
              );
            }
            if (plugin.isPrivate && membership?.membershipState != "active") {
              return {
                __typename: "UnAuthenticatedError",
                type: "UNAUTHENTICATED_ERROR",
                message: "Unauthenticated request",
              };
            }
          }
          return {
            __typename: "FetchPluginResult",
            plugin,
          };
        } catch (e) {
          return null;
        }
      }
    ),
    fetchSuggestedPlugins: runWithHooks(
      () => [this.loggedInUserGuard],
      async () => {
        const pluginsContext = await this.contextFactory.createContext(
          PluginsContext
        );
        const suggestedPlugins = await Promise.all([
          pluginsContext.getByName("palette"),
          pluginsContext.getByName("theme"),
          pluginsContext.getByName("icons"),
        ]);

        const plugins =  suggestedPlugins?.filter(v => v != null);
        return {
          __typename: "FetchSuggestedPluginsResult",
          plugins
        }
      }
    ),
    searchPluginsForRepository: async (_, { query, repositoryId }, context) => {
      try {
        if (!repositoryId || !context?.currentUser?.id) {
          return {
            __typename: "PluginSearchResult",
            plugins: [],
          };
        }
        const repositoriesContext = await this.contextFactory.createContext(
          RepositoriesContext
        );
        const repository = await repositoriesContext.getById(repositoryId);
        if (!repository) {
          return {
            __typename: "PluginSearchResult",
            plugins: [],
          };
        }
        const remoteSettings =
          await this.repoDataService.fetchRepoSettingsForUser(
            repositoryId,
            context.currentUser
          );
        if (!remoteSettings?.canReadRepo) {
          return {
            __typename: "PluginSearchResult",
            plugins: [],
          };
        }
        const plugins = await this.pluginSearchService.searchPluginsForRepo(
          query ?? "",
          repository,
          context?.currentUser
        );

        return {
          __typename: "PluginSearchResult",
          plugins,
        };
      } catch (e) {
        return {
          __typename: "PluginSearchResult",
          plugins: [],
        };
      }
    },
  };

  public Plugin: main.PluginResolvers = {
    versions: runWithHooks(
      () => [
        this.repositoryLoader
      ],
      async (plugin, { repositoryId}: main.PluginVersionsArgs, { cacheKey, currentUser }: any) => {
        const dbPlugin = plugin as DBPlugin;
        const repository = repositoryId
          ? this.requestCache.getRepo(cacheKey, repositoryId)
          : undefined;
        const membership = currentUser?.id ? this.requestCache.getOrganizationMembership(
          cacheKey,
          dbPlugin.id,
          currentUser?.id
        ) : null;
        // public user plugin
        if (
          !dbPlugin?.isPrivate &&
          dbPlugin.ownerType == "user_plugin"
        ) {
          // in this case, show all versions
          return this.sortBySemver(dbPlugin?.versions ?? [])?.filter(p => {
            if (p.state != "released") {
              if (currentUser?.id == dbPlugin.userId) {
                if (!repository) {
                  return true;
                }
                return repository?.repoType == "user_repo" && repository?.userId == dbPlugin?.userId;
              }
            }
            return true;
          });
        }
        if (
          dbPlugin.ownerType == "org_plugin" &&
          membership &&
          membership.membershipState == "active"
        ) {
          if (dbPlugin.isPrivate && dbPlugin.organizationId != repository?.organizationId) {
            return [];
          }
          return this.sortBySemver(dbPlugin?.versions ?? [])?.filter(p => {
            if (p.state != "released") {
              if (!repository) {
                return true;
              }
              if (repository && repository?.repoType == "org_repo") {
                return repository?.organizationId == dbPlugin?.organizationId;
              }
              return false;
            }
            return true;
          });
        }
        if (dbPlugin?.isPrivate) {
          if (dbPlugin.ownerType == "org_plugin") {
            return [];
          }
          if (repository?.userId == dbPlugin.userId) {
            if (dbPlugin.ownerType != "user_plugin") {
              return []
            }

            return this.sortBySemver(
              dbPlugin?.versions?.filter?.((v) => {
                if (currentUser?.id == dbPlugin.userId) {
                  if (!repository) {
                    return true;
                  }
                  return repository?.repoType == "user_repo" && repository?.userId == dbPlugin.userId;
                }
                return v.state == "released";
              }) ?? []
            );
          }
        }
        return null;
      }
    ),
    lastReleasedPublicVersion: (plugin) => {
      const dbPlugin = plugin as DBPlugin;
      return dbPlugin?.lastReleasedPublicPluginVersion ?? null;
    },
    lastReleasedPrivateVersion: runWithHooks(
      () => [],
      async (plugin, _, { cacheKey, currentUser }) => {
        const dbPlugin = plugin as DBPlugin;
        const membership = this.requestCache.getOrganizationMembership(
          cacheKey,
          dbPlugin.organizationId,
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
            return lastVersion.darkIcon;
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
          currentUser?.id
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
          this.pubsub?.publish?.(
            `PLUGIN_UPDATED:user:${result?.plugin?.userId}`,
            {
              userPluginUpdated: result.plugin,
            }
          );
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
          currentUser.id
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
          this.pubsub?.publish?.(
            `PLUGIN_UPDATED:org:${result?.plugin?.organizationId}`,
            {
              userPluginUpdated: result.plugin,
            }
          );
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

  public Subscription: main.SubscriptionResolvers = {
    userPluginAdded: {
      subscribe: withFilter(
        (_, { userId }) => {
          if (userId) {
            return this.pubsub.asyncIterator(`PLUGIN_ADDED:user:${userId}`);
          }
          return this.pubsub.asyncIterator([]);
        },
        runWithHooks(
          () => [],
          async (payload, _, context) => {
            if (payload?.userPluginAdded?.isPrivate) {
              return (
                context?.currentUser?.id &&
                payload?.userPluginAdded?.userId == context?.currentUser?.id
              );
            }
            return true;
          }
        )
      ) as unknown as SubscriptionSubscribeFn<any, any, any, any>,
    },
    organizationPluginAdded: {
      subscribe: withFilter(
        (_, { organizationId }) => {
          if (organizationId) {
            return this.pubsub.asyncIterator(
              `PLUGIN_ADDED:org:${organizationId}`
            );
          }
          return this.pubsub.asyncIterator([]);
        },
        runWithHooks(
          () => [this.rootOrganizationMemberPermissionsLoader],
          async (payload, { organizationId }, { cacheKey, currentUser }) => {
            if (!payload?.organizationPluginAdded?.isPrivate) {
              return true;
            }
            if (!currentUser) {
              return false;
            }
            const organization = this.requestCache.getOrganization(
              cacheKey,
              organizationId
            );
            if (!organization) {
              return false;
            }
            const membership = this.requestCache.getOrganizationMembership(
              cacheKey,
              organizationId,
              currentUser.id
            );
            if (!membership) {
              return false;
            }
            return membership.membershipState == "active";
          }
        )
      ) as unknown as SubscriptionSubscribeFn<any, any, any, any>,
    },
    userPluginUpdated: {
      subscribe: withFilter(
        (_, { userId }) => {
          if (userId) {
            return this.pubsub.asyncIterator(`PLUGIN_UPDATED:user:${userId}`);
          }
          return this.pubsub.asyncIterator([]);
        },
        runWithHooks(
          () => [],
          async (payload, _, context) => {
            if (payload?.userPluginUpdated?.isPrivate) {
              return (
                context?.currentUser?.id &&
                payload?.userPluginUpdated?.userId == context?.currentUser?.id
              );
            }
            return true;
          }
        )
      ) as unknown as SubscriptionSubscribeFn<any, any, any, any>,
    },
    organizationPluginUpdated: {
      subscribe: withFilter(
        (_, { organizationId }) => {
          if (organizationId) {
            return this.pubsub.asyncIterator(
              `PLUGIN_UPDATED:org:${organizationId}`
            );
          }
          return this.pubsub.asyncIterator([]);
        },
        runWithHooks(
          () => [this.rootOrganizationMemberPermissionsLoader],
          async (payload, { organizationId }, { cacheKey, currentUser }) => {
            if (!payload?.organizationPluginUpdated?.isPrivate) {
              return true;
            }
            if (!currentUser) {
              return false;
            }
            const organization = this.requestCache.getOrganization(
              cacheKey,
              organizationId
            );
            if (!organization) {
              return false;
            }
            const membership = this.requestCache.getOrganizationMembership(
              cacheKey,
              organizationId,
              currentUser.id
            );
            if (!membership) {
              return false;
            }
            return membership.membershipState == "active";
          }
        )
      ) as unknown as SubscriptionSubscribeFn<any, any, any, any>,
    },
  };
}
