import BaseResolverModule from "../BaseResolverModule";
import { main } from "@floro/graphql-schemas/build";
import { inject, injectable } from "inversify";
import ContextFactory from "@floro/database/src/contexts/ContextFactory";
import RequestCache from "../../request/RequestCache";
import LoggedInUserGuard from "../hooks/guards/LoggedInUserGuard";
import { runWithHooks } from "../hooks/ResolverHook";
import RootOrganizationMemberPermissionsLoader from "../hooks/loaders/Root/OrganizationID/RootOrganizationMemberPermissionsLoader";
import RepositoryService from "../../services/repositories/RepositoryService";
import RepositoryBranchesLoader from "../hooks/loaders/Repository/RepositoryBranchesLoader";
import RootRepositoryLoader from "../hooks/loaders/Root/RepositoryID/RepositoryLoader";
import { OrganizationRole } from "@floro/graphql-schemas/build/generated/main-graphql";
import { User } from "@floro/database/src/entities/User";
import ProtectedBranchRulesEnabledUserSettingsContext from "@floro/database/src/contexts/repositories/ProtectedBranchRulesEnabledUserSettingsContext";
import ProtectedBranchRuleEnabledRoleSettingsContext from "@floro/database/src/contexts/repositories/ProtectedBranchRulesEnabledRoleSettingsContext";
import WriteAccessIdsLoader from "../hooks/loaders/Repository/WriteAccessIdsLoader";
import ProtectedBranchRuleLoader from "../hooks/loaders/Root/ProtectedBranchRuleID/ProtectedBranchRuleLoader";
import RepoSettingsService from "../../services/repositories/RepoSettingsService";
import RepoSettingAccessGuard from "../hooks/guards/RepoSettingAccessGuard";
import RepositoryRemoteSettingsArgsLoader from "../hooks/loaders/Repository/RepositoryRemoteSettingsArgsLoader";
import ProtectedBranchRulesContext from "@floro/database/src/contexts/repositories/ProtectedBranchRulesContext";

@injectable()
export default class RepositoryProtectedBranchesResolverModule extends BaseResolverModule {
  public resolvers: Array<keyof this & keyof main.ResolversTypes> = [
    "Mutation",
    "ProtectedBranchRule",
  ];
  protected repoSettingsService!: RepoSettingsService;
  protected contextFactory!: ContextFactory;
  protected requestCache!: RequestCache;

  protected loggedInUserGuard!: LoggedInUserGuard;

  protected rootOrganizationMemberPermissionsLoader!: RootOrganizationMemberPermissionsLoader;
  protected repositoryRemoteSettingsArgsLoader!: RepositoryRemoteSettingsArgsLoader;
  protected repositoryBranchesLoader!: RepositoryBranchesLoader;
  protected rootRepositoryLoader!: RootRepositoryLoader;
  protected writeAccessIdsLoader!: WriteAccessIdsLoader;
  protected repoSettingAccessGuard!: RepoSettingAccessGuard;

  protected protectedBranchRuleLoader!: ProtectedBranchRuleLoader;

  constructor(
    @inject(ContextFactory) contextFactory: ContextFactory,
    @inject(RequestCache) requestCache: RequestCache,
    @inject(RepoSettingsService) repoSettingsService: RepoSettingsService,
    @inject(LoggedInUserGuard) loggedInUserGuard: LoggedInUserGuard,
    @inject(RootOrganizationMemberPermissionsLoader)
    rootOrganizationMemberPermissionsLoader: RootOrganizationMemberPermissionsLoader,
    @inject(RepositoryRemoteSettingsArgsLoader)
    repositoryRemoteSettingsArgsLoader: RepositoryRemoteSettingsArgsLoader,
    @inject(RepositoryBranchesLoader)
    repositoryBranchesLoader: RepositoryBranchesLoader,
    @inject(RootRepositoryLoader)
    rootRepositoryLoader: RootRepositoryLoader,
    @inject(WriteAccessIdsLoader)
    writeAccessIdsLoader: WriteAccessIdsLoader,
    @inject(RepoSettingAccessGuard)
    repoSettingAccessGuard: RepoSettingAccessGuard,
    @inject(ProtectedBranchRuleLoader)
    protectedBranchRuleLoader: ProtectedBranchRuleLoader
  ) {
    super();
    this.contextFactory = contextFactory;
    this.requestCache = requestCache;

    this.repoSettingsService = repoSettingsService;

    this.loggedInUserGuard = loggedInUserGuard;

    this.rootOrganizationMemberPermissionsLoader =
      rootOrganizationMemberPermissionsLoader;

    this.repositoryRemoteSettingsArgsLoader = repositoryRemoteSettingsArgsLoader;
    this.repositoryBranchesLoader = repositoryBranchesLoader;
    this.rootRepositoryLoader = rootRepositoryLoader;
    this.writeAccessIdsLoader = writeAccessIdsLoader;
    this.repoSettingAccessGuard = repoSettingAccessGuard;

    this.protectedBranchRuleLoader = protectedBranchRuleLoader;
  }

  public ProtectedBranchRule: main.ProtectedBranchRuleResolvers = {
    canPushDirectlyUsers: runWithHooks(
      () => [this.writeAccessIdsLoader],
      async (
        protectedBranchRule: main.ProtectedBranchRule,
        _,
        { cacheKey }
      ) => {
        if (!protectedBranchRule?.id) {
          return null;
        }
        const protectedBranchRulesEnabledUserSettingsContext =
          await this.contextFactory.createContext(
            ProtectedBranchRulesEnabledUserSettingsContext
          );
        const enabledUsersForSetting =
          await protectedBranchRulesEnabledUserSettingsContext.getAllForBranchRuleSetting(
            protectedBranchRule.id,
            "canPushDirectly"
          );

        const cachedWriteAccessIds =
          this.requestCache.getRepoWriteAccessIds(
            cacheKey,
            protectedBranchRule?.repositoryId as string
          ) ?? new Set<string>();
        const users = enabledUsersForSetting
          ?.filter((s) => cachedWriteAccessIds.has(s.userId))
          ?.map((s) => s.user as User);
        users.sort?.((a, b) => {
          if (!a || !b) {
            return 0;
          }
          return `${a?.firstName} ${a?.lastName}`.toLowerCase() >=
            `${b?.firstName} ${b?.lastName}`.toLowerCase()
            ? 1
            : -1;
        });
        return users;
      }
    ),
    canPushDirectlyRoles: runWithHooks(
      () => [],
      async (protectedBranchRule: main.ProtectedBranchRule) => {
        if (!protectedBranchRule?.id) {
          return null;
        }
        const protectedBranchRulesEnabledRoleSettingsContext =
          await this.contextFactory.createContext(
            ProtectedBranchRuleEnabledRoleSettingsContext
          );
        const enabledRolesForSetting =
          await protectedBranchRulesEnabledRoleSettingsContext.getAllForBranchRuleSetting(
            protectedBranchRule.id,
            "canPushDirectly"
          );
        const roles = enabledRolesForSetting?.map(
          (s) => s.role as OrganizationRole
        );
        roles.sort((a, b) => {
          return (a?.name?.toLowerCase?.() ?? "") >=
            (b?.name?.toLowerCase?.() ?? "")
            ? 1
            : -1;
        });
        return roles;
      }
    ),

    canCreateMergeRequestsUsers: runWithHooks(
      () => [this.writeAccessIdsLoader],
      async (
        protectedBranchRule: main.ProtectedBranchRule,
        _,
        { cacheKey }
      ) => {
        if (!protectedBranchRule?.id) {
          return null;
        }
        const protectedBranchRulesEnabledUserSettingsContext =
          await this.contextFactory.createContext(
            ProtectedBranchRulesEnabledUserSettingsContext
          );
        const enabledUsersForSetting =
          await protectedBranchRulesEnabledUserSettingsContext.getAllForBranchRuleSetting(
            protectedBranchRule.id,
            "anyoneCanCreateMergeRequests"
          );

        const cachedWriteAccessIds =
          this.requestCache.getRepoWriteAccessIds(
            cacheKey,
            protectedBranchRule?.repositoryId as string
          ) ?? new Set<string>();
        const users = enabledUsersForSetting
          ?.filter((s) => cachedWriteAccessIds.has(s.userId))
          ?.map((s) => s.user as User);
        users.sort?.((a, b) => {
          if (!a || !b) {
            return 0;
          }
          return `${a?.firstName} ${a?.lastName}`.toLowerCase() >=
            `${b?.firstName} ${b?.lastName}`.toLowerCase()
            ? 1
            : -1;
        });
        return users;
      }
    ),
    canCreateMergeRequestsRoles: runWithHooks(
      () => [],
      async (protectedBranchRule: main.ProtectedBranchRule) => {
        if (!protectedBranchRule?.id) {
          return null;
        }
        const protectedBranchRulesEnabledRoleSettingsContext =
          await this.contextFactory.createContext(
            ProtectedBranchRuleEnabledRoleSettingsContext
          );
        const enabledRolesForSetting =
          await protectedBranchRulesEnabledRoleSettingsContext.getAllForBranchRuleSetting(
            protectedBranchRule.id,
            "anyoneCanCreateMergeRequests"
          );
        const roles = enabledRolesForSetting?.map(
          (s) => s.role as OrganizationRole
        );
        roles.sort((a, b) => {
          return (a?.name?.toLowerCase?.() ?? "") >=
            (b?.name?.toLowerCase?.() ?? "")
            ? 1
            : -1;
        });
        return roles;
      }
    ),

    withApprovalCanMergeUsers: runWithHooks(
      () => [this.writeAccessIdsLoader],
      async (
        protectedBranchRule: main.ProtectedBranchRule,
        _,
        { cacheKey }
      ) => {
        if (!protectedBranchRule?.id) {
          return null;
        }
        const protectedBranchRulesEnabledUserSettingsContext =
          await this.contextFactory.createContext(
            ProtectedBranchRulesEnabledUserSettingsContext
          );
        const enabledUsersForSetting =
          await protectedBranchRulesEnabledUserSettingsContext.getAllForBranchRuleSetting(
            protectedBranchRule.id,
            "anyoneWithApprovalCanMerge"
          );
        const cachedWriteAccessIds =
          this.requestCache.getRepoWriteAccessIds(
            cacheKey,
            protectedBranchRule?.repositoryId as string
          ) ?? new Set<string>();
        const users = enabledUsersForSetting
          ?.filter((s) => cachedWriteAccessIds.has(s.userId))
          ?.map((s) => s.user as User);
        users.sort?.((a, b) => {
          if (!a || !b) {
            return 0;
          }
          return `${a?.firstName} ${a?.lastName}`.toLowerCase() >=
            `${b?.firstName} ${b?.lastName}`.toLowerCase()
            ? 1
            : -1;
        });
        return users;
      }
    ),
    withApprovalCanMergeRoles: runWithHooks(
      () => [],
      async (protectedBranchRule: main.ProtectedBranchRule) => {
        if (!protectedBranchRule?.id) {
          return null;
        }
        const protectedBranchRulesEnabledRoleSettingsContext =
          await this.contextFactory.createContext(
            ProtectedBranchRuleEnabledRoleSettingsContext
          );
        const enabledRolesForSetting =
          await protectedBranchRulesEnabledRoleSettingsContext.getAllForBranchRuleSetting(
            protectedBranchRule.id,
            "anyoneWithApprovalCanMerge"
          );
        const roles = enabledRolesForSetting?.map(
          (s) => s.role as OrganizationRole
        );
        roles.sort((a, b) => {
          return (a?.name?.toLowerCase?.() ?? "") >=
            (b?.name?.toLowerCase?.() ?? "")
            ? 1
            : -1;
        });
        return roles;
      }
    ),

    canApproveMergeRequestsUsers: runWithHooks(
      () => [this.writeAccessIdsLoader],
      async (
        protectedBranchRule: main.ProtectedBranchRule,
        _,
        { cacheKey }
      ) => {
        if (!protectedBranchRule?.id) {
          return null;
        }
        const protectedBranchRulesEnabledUserSettingsContext =
          await this.contextFactory.createContext(
            ProtectedBranchRulesEnabledUserSettingsContext
          );
        const enabledUsersForSetting =
          await protectedBranchRulesEnabledUserSettingsContext.getAllForBranchRuleSetting(
            protectedBranchRule.id,
            "anyoneCanApproveMergeRequests"
          );

        const cachedWriteAccessIds =
          this.requestCache.getRepoWriteAccessIds(
            cacheKey,
            protectedBranchRule?.repositoryId as string
          ) ?? new Set<string>();
        const users = enabledUsersForSetting
          ?.filter((s) => cachedWriteAccessIds.has(s.userId))
          ?.map((s) => s.user as User);
        users.sort?.((a, b) => {
          if (!a || !b) {
            return 0;
          }
          return `${a?.firstName} ${a?.lastName}`.toLowerCase() >=
            `${b?.firstName} ${b?.lastName}`.toLowerCase()
            ? 1
            : -1;
        });
        return users;
      }
    ),
    canApproveMergeRequestsRoles: runWithHooks(
      () => [],
      async (protectedBranchRule: main.ProtectedBranchRule) => {
        if (!protectedBranchRule?.id) {
          return null;
        }
        const protectedBranchRulesEnabledRoleSettingsContext =
          await this.contextFactory.createContext(
            ProtectedBranchRuleEnabledRoleSettingsContext
          );
        const enabledRolesForSetting =
          await protectedBranchRulesEnabledRoleSettingsContext.getAllForBranchRuleSetting(
            protectedBranchRule.id,
            "anyoneCanApproveMergeRequests"
          );
        const roles = enabledRolesForSetting?.map(
          (s) => s.role as OrganizationRole
        );
        roles.sort((a, b) => {
          return (a?.name?.toLowerCase?.() ?? "") >=
            (b?.name?.toLowerCase?.() ?? "")
            ? 1
            : -1;
        });
        return roles;
      }
    ),

    canRevertUsers: runWithHooks(
      () => [this.writeAccessIdsLoader],
      async (
        protectedBranchRule: main.ProtectedBranchRule,
        _,
        { cacheKey }
      ) => {
        if (!protectedBranchRule?.id) {
          return null;
        }
        const protectedBranchRulesEnabledUserSettingsContext =
          await this.contextFactory.createContext(
            ProtectedBranchRulesEnabledUserSettingsContext
          );
        const enabledUsersForSetting =
          await protectedBranchRulesEnabledUserSettingsContext.getAllForBranchRuleSetting(
            protectedBranchRule.id,
            "anyoneCanRevert"
          );
        const cachedWriteAccessIds =
          this.requestCache.getRepoWriteAccessIds(
            cacheKey,
            protectedBranchRule?.repositoryId as string
          ) ?? new Set<string>();
        const users = enabledUsersForSetting
          ?.filter((s) => cachedWriteAccessIds.has(s.userId))
          ?.map((s) => s.user as User);
        users.sort?.((a, b) => {
          if (!a || !b) {
            return 0;
          }
          return `${a?.firstName} ${a?.lastName}`.toLowerCase() >=
            `${b?.firstName} ${b?.lastName}`.toLowerCase()
            ? 1
            : -1;
        });
        return users;
      }
    ),
    canRevertRoles: runWithHooks(
      () => [],
      async (protectedBranchRule: main.ProtectedBranchRule) => {
        if (!protectedBranchRule?.id) {
          return null;
        }
        const protectedBranchRulesEnabledRoleSettingsContext =
          await this.contextFactory.createContext(
            ProtectedBranchRuleEnabledRoleSettingsContext
          );
        const enabledRolesForSetting =
          await protectedBranchRulesEnabledRoleSettingsContext.getAllForBranchRuleSetting(
            protectedBranchRule.id,
            "anyoneCanRevert"
          );
        const roles = enabledRolesForSetting?.map(
          (s) => s.role as OrganizationRole
        );
        roles.sort((a, b) => {
          return (a?.name?.toLowerCase?.() ?? "") >=
            (b?.name?.toLowerCase?.() ?? "")
            ? 1
            : -1;
        });
        return roles;
      }
    ),

    canAutofixUsers: runWithHooks(
      () => [this.writeAccessIdsLoader],
      async (
        protectedBranchRule: main.ProtectedBranchRule,
        _,
        { cacheKey }
      ) => {
        if (!protectedBranchRule?.id) {
          return null;
        }
        const protectedBranchRulesEnabledUserSettingsContext =
          await this.contextFactory.createContext(
            ProtectedBranchRulesEnabledUserSettingsContext
          );
        const enabledUsersForSetting =
          await protectedBranchRulesEnabledUserSettingsContext.getAllForBranchRuleSetting(
            protectedBranchRule.id,
            "anyoneCanAutofix"
          );
        const cachedWriteAccessIds =
          this.requestCache.getRepoWriteAccessIds(
            cacheKey,
            protectedBranchRule?.repositoryId as string
          ) ?? new Set<string>();
        const users = enabledUsersForSetting
          ?.filter((s) => cachedWriteAccessIds.has(s.userId))
          ?.map((s) => s.user as User);
        users.sort?.((a, b) => {
          if (!a || !b) {
            return 0;
          }
          return `${a?.firstName} ${a?.lastName}`.toLowerCase() >=
            `${b?.firstName} ${b?.lastName}`.toLowerCase()
            ? 1
            : -1;
        });
        return users;
      }
    ),
    canAutofixRoles: runWithHooks(
      () => [],
      async (protectedBranchRule: main.ProtectedBranchRule) => {
        if (!protectedBranchRule?.id) {
          return null;
        }
        const protectedBranchRulesEnabledRoleSettingsContext =
          await this.contextFactory.createContext(
            ProtectedBranchRuleEnabledRoleSettingsContext
          );
        const enabledRolesForSetting =
          await protectedBranchRulesEnabledRoleSettingsContext.getAllForBranchRuleSetting(
            protectedBranchRule.id,
            "anyoneCanAutofix"
          );
        const roles = enabledRolesForSetting?.map(
          (s) => s.role as OrganizationRole
        );
        roles.sort((a, b) => {
          return (a?.name?.toLowerCase?.() ?? "") >=
            (b?.name?.toLowerCase?.() ?? "")
            ? 1
            : -1;
        });
        return roles;
      }
    ),
  };

  public Mutation: main.MutationResolvers = {
    createBranchRule: runWithHooks(
      () => [
        this.repositoryRemoteSettingsArgsLoader,
        this.rootRepositoryLoader,
        this.repoSettingAccessGuard,
      ],
      async (_, args: main.MutationCreateBranchRuleArgs, { cacheKey }) => {
        if (!args.branchId || !args.repositoryId) {
          return {
            __typename: "CreateBranchRuleError",
            message: "Missing Args",
            type: "MISSING_ARGS_ERROR",
          };
        }
        const cachedRepository =
          this.requestCache.getRepo(cacheKey, args.repositoryId);
        if (!cachedRepository) {
          return {
            __typename: "CreateBranchRuleError",
            message: "Unknown Error",
            type: "UNKNOWN_ERROR",
          };
        }
        const protectedBranchRule = await this.repoSettingsService.createBranchRule(cachedRepository, args.branchId);
        if (!protectedBranchRule) {
          return {
            __typename: "CreateBranchRuleError",
            message: "Unknown Error",
            type: "UNKNOWN_ERROR",
          };
        }

        this.pubsub?.publish?.(`REPOSITORY_UPDATED:${cachedRepository.id}`, {
          repositoryUpdated: cachedRepository,
        });
        return {
          __typename: "CreateBranchRuleSuccess",
          repository: cachedRepository,
          protectedBranchRule
        };
      }
    ),
    deleteBranchRule: runWithHooks(
      () => [
        this.repositoryRemoteSettingsArgsLoader,
        this.rootRepositoryLoader,
        this.repoSettingAccessGuard,
      ],
      async (_, args: main.MutationDeleteBranchRuleArgs, { cacheKey }) => {

        if (!args.protectedBranchRuleId || !args.repositoryId) {
          return {
            __typename: "DeleteBranchRuleError",
            message: "Missing Args",
            type: "MISSING_ARGS_ERROR",
          };
        }
        const protectedBranchRulesContext = await this.contextFactory.createContext(
          ProtectedBranchRulesContext,
        );
        const protectedBranchRule = await protectedBranchRulesContext.getById(args.protectedBranchRuleId);
        if (!protectedBranchRule) {
          return {
            __typename: "DeleteBranchRuleError",
            message: "Unknown Error",
            type: "UNKNOWN_ERROR",
          };
        }
        const cachedRepository =
          this.requestCache.getRepo(cacheKey, args.repositoryId);
        if (!cachedRepository) {
          return {
            __typename: "DeleteBranchRuleError",
            message: "Unknown Error",
            type: "UNKNOWN_ERROR",
          };
        }
        const didDelete = await this.repoSettingsService.deleteBranchRule(cachedRepository, args.protectedBranchRuleId);
        if (!didDelete) {
          return {
            __typename: "DeleteBranchRuleError",
            message: "Unknown Error",
            type: "UNKNOWN_ERROR",
          };
        }
        this.pubsub?.publish?.(`REPOSITORY_UPDATED:${cachedRepository.id}`, {
          repositoryUpdated: cachedRepository,
        });
        return {
          __typename: "DeleteBranchRuleSuccess",
          repository: cachedRepository,
          protectedBranchRule
        };
      }
    ),
    updateDisableDirectPushing: runWithHooks(
      () => [
        this.repositoryRemoteSettingsArgsLoader,
        this.rootRepositoryLoader,
        this.repoSettingAccessGuard,
      ],
      async (
        _,
        args: main.MutationUpdateDisableDirectPushingArgs,
        { cacheKey }
      ) => {
        if (!args.protectedBranchRuleId || !args.repositoryId) {
          return {
            __typename: "ProtectedBranchSettingChangeError",
            message: "Missing Args",
            type: "MISSING_ARGS_ERROR",
          };
        }
        const cachedRepository =
          this.requestCache.getRepo(cacheKey, args.repositoryId) ??
          new Set<string>();
        const protectedBranchRule =
          await this.repoSettingsService.updateBranchRuleDisableDirectPushing(
            cachedRepository,
            args.protectedBranchRuleId,
            args.disableDirectPushing
          );
        if (!protectedBranchRule) {
          return {
            __typename: "ProtectedBranchSettingChangeError",
            message: "Unknown Error",
            type: "UNKNOWN_ERROR",
          };
        }
        this.pubsub?.publish?.(`REPOSITORY_UPDATED:${cachedRepository.id}`, {
          repositoryUpdated: cachedRepository,
        });
        return {
          __typename: "ProtectedBranchSettingChangeSuccess",
          repository: cachedRepository,
          protectedBranchRule,
        };
      }
    ),
    updateRequireApprovalToMerge: runWithHooks(
      () => [
        this.repositoryRemoteSettingsArgsLoader,
        this.rootRepositoryLoader,
        this.repoSettingAccessGuard,
      ],
      async (
        _,
        args: main.MutationUpdateRequireApprovalToMergeArgs,
        { cacheKey }
      ) => {
        if (!args.protectedBranchRuleId || !args.repositoryId) {
          return {
            __typename: "ProtectedBranchSettingChangeError",
            message: "Misisng Args",
            type: "MISSING_ARGS_ERROR",
          };
        }
        const cachedRepository =
          this.requestCache.getRepo(cacheKey, args.repositoryId) ??
          new Set<string>();
        const protectedBranchRule =
          await this.repoSettingsService.updateBranchRuleRequireApprovalToMerge(
            cachedRepository,
            args.protectedBranchRuleId,
            args.requireApprovalToMerge
          );
        if (!protectedBranchRule) {
          return {
            __typename: "ProtectedBranchSettingChangeError",
            message: "Unknown Error",
            type: "UNKNOWN_ERROR",
          };
        }
        this.pubsub?.publish?.(`REPOSITORY_UPDATED:${cachedRepository.id}`, {
          repositoryUpdated: cachedRepository,
        });
        return {
          __typename: "ProtectedBranchSettingChangeSuccess",
          repository: cachedRepository,
          protectedBranchRule,
        };
      }
    ),
    updateRequireReapprovalOnPushToMerge: runWithHooks(
      () => [
        this.repositoryRemoteSettingsArgsLoader,
        this.rootRepositoryLoader,
        this.repoSettingAccessGuard,
      ],
      async (
        _,
        args: main.MutationUpdateRequireReapprovalOnPushToMergeArgs,
        { cacheKey }
      ) => {
        if (!args.protectedBranchRuleId || !args.repositoryId) {
          return {
            __typename: "ProtectedBranchSettingChangeError",
            message: "Misisng Args",
            type: "MISSING_ARGS_ERROR",
          };
        }
        const cachedRepository =
          this.requestCache.getRepo(cacheKey, args.repositoryId) ??
          new Set<string>();
        const protectedBranchRule =
          await this.repoSettingsService.updateBranchRuleRequireReapprovalOnPushToMerge(
            cachedRepository,
            args.protectedBranchRuleId,
            args.requireReapprovalOnPushToMerge
          );
        if (!protectedBranchRule) {
          return {
            __typename: "ProtectedBranchSettingChangeError",
            message: "Unknown Error",
            type: "UNKNOWN_ERROR",
          };
        }
        this.pubsub?.publish?.(`REPOSITORY_UPDATED:${cachedRepository.id}`, {
          repositoryUpdated: cachedRepository,
        });
        return {
          __typename: "ProtectedBranchSettingChangeSuccess",
          repository: cachedRepository,
          protectedBranchRule,
        };
      }
    ),

    updateAutomaticallyDeleteMergedFeatureBranches: runWithHooks(
      () => [
        this.repositoryRemoteSettingsArgsLoader,
        this.rootRepositoryLoader,
        this.repoSettingAccessGuard,
      ],
      async (
        _,
        args: main.MutationUpdateAutomaticallyDeleteMergedFeatureBranchesArgs,
        { cacheKey }
      ) => {
        if (!args.protectedBranchRuleId || !args.repositoryId) {
          return {
            __typename: "ProtectedBranchSettingChangeError",
            message: "Misisng Args",
            type: "MISSING_ARGS_ERROR",
          };
        }
        const cachedRepository =
          this.requestCache.getRepo(cacheKey, args.repositoryId) ??
          new Set<string>();
        const protectedBranchRule =
          await this.repoSettingsService.updateBranchRuleAutomaticallyDeleteMergedFeatureBranches(
            cachedRepository,
            args.protectedBranchRuleId,
            args.automaticallyDeleteMergedFeatureBranches
          );
        if (!protectedBranchRule) {
          return {
            __typename: "ProtectedBranchSettingChangeError",
            message: "Unknown Error",
            type: "UNKNOWN_ERROR",
          };
        }
        this.pubsub?.publish?.(`REPOSITORY_UPDATED:${cachedRepository.id}`, {
          repositoryUpdated: cachedRepository,
        });
        return {
          __typename: "ProtectedBranchSettingChangeSuccess",
          repository: cachedRepository,
          protectedBranchRule,
        };
      }
    ),
    updateAnyoneCanCreateMergeRequests: runWithHooks(
      () => [
        this.repositoryRemoteSettingsArgsLoader,
        this.rootRepositoryLoader,
        this.repoSettingAccessGuard,
      ],
      async (
        _,
        args: main.MutationUpdateAnyoneCanCreateMergeRequestsArgs,
        { cacheKey }
      ) => {
        if (!args.protectedBranchRuleId || !args.repositoryId) {
          return {
            __typename: "ProtectedBranchSettingChangeError",
            message: "Misisng Args",
            type: "MISSING_ARGS_ERROR",
          };
        }
        const cachedRepository =
          this.requestCache.getRepo(cacheKey, args.repositoryId) ??
          new Set<string>();
        const protectedBranchRule =
          await this.repoSettingsService.updateBranchRuleSettingValue(
            cachedRepository,
            args.protectedBranchRuleId,
            "anyoneCanCreateMergeRequests",
            args?.anyoneCanCreateMergeRequests
          );
        if (!protectedBranchRule) {
          return {
            __typename: "ProtectedBranchSettingChangeError",
            message: "Unknown Error",
            type: "UNKNOWN_ERROR",
          };
        }
        this.pubsub?.publish?.(`REPOSITORY_UPDATED:${cachedRepository.id}`, {
          repositoryUpdated: cachedRepository,
        });
        return {
          __typename: "ProtectedBranchSettingChangeSuccess",
          repository: cachedRepository,
          protectedBranchRule,
        };
      }
    ),

    updateCanPushDirectlyUsers: runWithHooks(
      () => [
        this.repositoryRemoteSettingsArgsLoader,
        this.rootRepositoryLoader,
        this.repoSettingAccessGuard,
      ],
      async (
        _,
        args: main.MutationUpdateCanPushDirectlyUsersArgs,
        { cacheKey }
      ) => {
        if (!args.protectedBranchRuleId || !args.repositoryId) {
          return {
            __typename: "ProtectedBranchSettingChangeError",
            message: "Misisng Args",
            type: "MISSING_ARGS_ERROR",
          };
        }
        const cachedRepository =
          this.requestCache.getRepo(cacheKey, args.repositoryId) ??
          new Set<string>();

        const protectedBranchRuleEnabledRoleSettingsContext =
          await this.contextFactory.createContext(
            ProtectedBranchRuleEnabledRoleSettingsContext
          );

        const enabledRoles =
          await protectedBranchRuleEnabledRoleSettingsContext.getAllForBranchRuleSetting(
            args.protectedBranchRuleId,
            "canPushDirectly"
          );
        const enabledRoleIds = enabledRoles.map((er) => er.roleId);

        const protectedBranchRule =
          await this.repoSettingsService.updateBranchRuleSettingAccess(
            cachedRepository,
            args.protectedBranchRuleId,
            "canPushDirectly",
            enabledRoleIds,
            (args.userIds ?? []) as Array<string>
          );
        if (!protectedBranchRule) {
          return {
            __typename: "ProtectedBranchSettingChangeError",
            message: "Unknown Error",
            type: "UNKNOWN_ERROR",
          };
        }
        this.pubsub?.publish?.(`REPOSITORY_UPDATED:${cachedRepository.id}`, {
          repositoryUpdated: cachedRepository,
        });
        return {
          __typename: "ProtectedBranchSettingChangeSuccess",
          repository: cachedRepository,
          protectedBranchRule,
        };
      }
    ),

    updateCanPushDirectlyRoles: runWithHooks(
      () => [
        this.repositoryRemoteSettingsArgsLoader,
        this.rootRepositoryLoader,
        this.repoSettingAccessGuard,
      ],
      async (
        _,
        args: main.MutationUpdateCanPushDirectlyRolesArgs,
        { cacheKey }
      ) => {
        if (!args.protectedBranchRuleId || !args.repositoryId) {
          return {
            __typename: "ProtectedBranchSettingChangeError",
            message: "Misisng Args",
            type: "MISSING_ARGS_ERROR",
          };
        }
        const cachedRepository =
          this.requestCache.getRepo(cacheKey, args.repositoryId) ??
          new Set<string>();

        const protectedBranchRulesEnabledUserSettingsContext =
          await this.contextFactory.createContext(
            ProtectedBranchRulesEnabledUserSettingsContext
          );

        const enabledUsers =
          await protectedBranchRulesEnabledUserSettingsContext.getAllForBranchRuleSetting(
            args.protectedBranchRuleId,
            "canPushDirectly"
          );
        const enabledUserIds = enabledUsers.map((er) => er.userId);

        const protectedBranchRule =
          await this.repoSettingsService.updateBranchRuleSettingAccess(
            cachedRepository,
            args.protectedBranchRuleId,
            "canPushDirectly",
            (args.roleIds ?? []) as Array<string>,
            enabledUserIds
          );
        if (!protectedBranchRule) {
          return {
            __typename: "ProtectedBranchSettingChangeError",
            message: "Unknown Error",
            type: "UNKNOWN_ERROR",
          };
        }
        this.pubsub?.publish?.(`REPOSITORY_UPDATED:${cachedRepository.id}`, {
          repositoryUpdated: cachedRepository,
        });
        return {
          __typename: "ProtectedBranchSettingChangeSuccess",
          repository: cachedRepository,
          protectedBranchRule,
        };
      }
    ),

    updateAnyoneCanCreateMergeRequestsUsers: runWithHooks(
      () => [
        this.repositoryRemoteSettingsArgsLoader,
        this.rootRepositoryLoader,
        this.repoSettingAccessGuard,
      ],
      async (
        _,
        args: main.MutationUpdateAnyoneCanCreateMergeRequestsUsersArgs,
        { cacheKey }
      ) => {
        if (!args.protectedBranchRuleId || !args.repositoryId) {
          return {
            __typename: "ProtectedBranchSettingChangeError",
            message: "Misisng Args",
            type: "MISSING_ARGS_ERROR",
          };
        }
        const cachedRepository =
          this.requestCache.getRepo(cacheKey, args.repositoryId) ??
          new Set<string>();

        const protectedBranchRuleEnabledRoleSettingsContext =
          await this.contextFactory.createContext(
            ProtectedBranchRuleEnabledRoleSettingsContext
          );

        const enabledRoles =
          await protectedBranchRuleEnabledRoleSettingsContext.getAllForBranchRuleSetting(
            args.protectedBranchRuleId,
            "anyoneCanCreateMergeRequests"
          );
        const enabledRoleIds = enabledRoles.map((er) => er.roleId);

        const protectedBranchRule =
          await this.repoSettingsService.updateBranchRuleSettingAccess(
            cachedRepository,
            args.protectedBranchRuleId,
            "anyoneCanCreateMergeRequests",
            enabledRoleIds,
            (args.userIds ?? []) as Array<string>
          );
        if (!protectedBranchRule) {
          return {
            __typename: "ProtectedBranchSettingChangeError",
            message: "Unknown Error",
            type: "UNKNOWN_ERROR",
          };
        }
        this.pubsub?.publish?.(`REPOSITORY_UPDATED:${cachedRepository.id}`, {
          repositoryUpdated: cachedRepository,
        });
        return {
          __typename: "ProtectedBranchSettingChangeSuccess",
          repository: cachedRepository,
          protectedBranchRule,
        };
      }
    ),

    updateAnyoneCanCreateMergeRequestsRoles: runWithHooks(
      () => [
        this.repositoryRemoteSettingsArgsLoader,
        this.rootRepositoryLoader,
        this.repoSettingAccessGuard,
      ],
      async (
        _,
        args: main.MutationUpdateAnyoneCanCreateMergeRequestsRolesArgs,
        { cacheKey }
      ) => {
        if (!args.protectedBranchRuleId || !args.repositoryId) {
          return {
            __typename: "ProtectedBranchSettingChangeError",
            message: "Misisng Args",
            type: "MISSING_ARGS_ERROR",
          };
        }
        const cachedRepository =
          this.requestCache.getRepo(cacheKey, args.repositoryId) ??
          new Set<string>();

        const protectedBranchRulesEnabledUserSettingsContext =
          await this.contextFactory.createContext(
            ProtectedBranchRulesEnabledUserSettingsContext
          );

        const enabledUsers =
          await protectedBranchRulesEnabledUserSettingsContext.getAllForBranchRuleSetting(
            args.protectedBranchRuleId,
            "anyoneCanCreateMergeRequests"
          );
        const enabledUserIds = enabledUsers.map((er) => er.userId);

        const protectedBranchRule =
          await this.repoSettingsService.updateBranchRuleSettingAccess(
            cachedRepository,
            args.protectedBranchRuleId,
            "anyoneCanCreateMergeRequests",
            (args.roleIds ?? []) as Array<string>,
            enabledUserIds
          );
        if (!protectedBranchRule) {
          return {
            __typename: "ProtectedBranchSettingChangeError",
            message: "Unknown Error",
            type: "UNKNOWN_ERROR",
          };
        }
        this.pubsub?.publish?.(`REPOSITORY_UPDATED:${cachedRepository.id}`, {
          repositoryUpdated: cachedRepository,
        });
        return {
          __typename: "ProtectedBranchSettingChangeSuccess",
          repository: cachedRepository,
          protectedBranchRule,
        };
      }
    ),

    updateAnyoneWithApprovalCanMerge: runWithHooks(
      () => [
        this.repositoryRemoteSettingsArgsLoader,
        this.rootRepositoryLoader,
        this.repoSettingAccessGuard,
      ],
      async (
        _,
        args: main.MutationUpdateAnyoneWithApprovalCanMergeArgs,
        { cacheKey }
      ) => {
        if (!args.protectedBranchRuleId || !args.repositoryId) {
          return {
            __typename: "ProtectedBranchSettingChangeError",
            message: "Misisng Args",
            type: "MISSING_ARGS_ERROR",
          };
        }
        const cachedRepository =
          this.requestCache.getRepo(cacheKey, args.repositoryId) ??
          new Set<string>();
        const protectedBranchRule =
          await this.repoSettingsService.updateBranchRuleSettingValue(
            cachedRepository,
            args.protectedBranchRuleId,
            "anyoneWithApprovalCanMerge",
            args?.anyoneWithApprovalCanMerge
          );
        if (!protectedBranchRule) {
          return {
            __typename: "ProtectedBranchSettingChangeError",
            message: "Unknown Error",
            type: "UNKNOWN_ERROR",
          };
        }
        this.pubsub?.publish?.(`REPOSITORY_UPDATED:${cachedRepository.id}`, {
          repositoryUpdated: cachedRepository,
        });
        return {
          __typename: "ProtectedBranchSettingChangeSuccess",
          repository: cachedRepository,
          protectedBranchRule,
        };
      }
    ),

    updateAnyoneWithApprovalCanMergeUsers: runWithHooks(
      () => [
        this.repositoryRemoteSettingsArgsLoader,
        this.rootRepositoryLoader,
        this.repoSettingAccessGuard,
      ],
      async (
        _,
        args: main.MutationUpdateAnyoneCanCreateMergeRequestsUsersArgs,
        { cacheKey }
      ) => {
        if (!args.protectedBranchRuleId || !args.repositoryId) {
          return {
            __typename: "ProtectedBranchSettingChangeError",
            message: "Misisng Args",
            type: "MISSING_ARGS_ERROR",
          };
        }
        const cachedRepository =
          this.requestCache.getRepo(cacheKey, args.repositoryId) ??
          new Set<string>();

        const protectedBranchRuleEnabledRoleSettingsContext =
          await this.contextFactory.createContext(
            ProtectedBranchRuleEnabledRoleSettingsContext
          );

        const enabledRoles =
          await protectedBranchRuleEnabledRoleSettingsContext.getAllForBranchRuleSetting(
            args.protectedBranchRuleId,
            "anyoneWithApprovalCanMerge"
          );
        const enabledRoleIds = enabledRoles.map((er) => er.roleId);

        const protectedBranchRule =
          await this.repoSettingsService.updateBranchRuleSettingAccess(
            cachedRepository,
            args.protectedBranchRuleId,
            "anyoneWithApprovalCanMerge",
            enabledRoleIds,
            (args.userIds ?? []) as Array<string>
          );
        if (!protectedBranchRule) {
          return {
            __typename: "ProtectedBranchSettingChangeError",
            message: "Unknown Error",
            type: "UNKNOWN_ERROR",
          };
        }
        this.pubsub?.publish?.(`REPOSITORY_UPDATED:${cachedRepository.id}`, {
          repositoryUpdated: cachedRepository,
        });
        return {
          __typename: "ProtectedBranchSettingChangeSuccess",
          repository: cachedRepository,
          protectedBranchRule,
        };
      }
    ),

    updateAnyoneWithApprovalCanMergeRoles: runWithHooks(
      () => [
        this.repositoryRemoteSettingsArgsLoader,
        this.rootRepositoryLoader,
        this.repoSettingAccessGuard,
      ],
      async (
        _,
        args: main.MutationUpdateAnyoneWithApprovalCanMergeRolesArgs,
        { cacheKey }
      ) => {
        if (!args.protectedBranchRuleId || !args.repositoryId) {
          return {
            __typename: "ProtectedBranchSettingChangeError",
            message: "Misisng Args",
            type: "MISSING_ARGS_ERROR",
          };
        }
        const cachedRepository =
          this.requestCache.getRepo(cacheKey, args.repositoryId) ??
          new Set<string>();

        const protectedBranchRulesEnabledUserSettingsContext =
          await this.contextFactory.createContext(
            ProtectedBranchRulesEnabledUserSettingsContext
          );

        const enabledUsers =
          await protectedBranchRulesEnabledUserSettingsContext.getAllForBranchRuleSetting(
            args.protectedBranchRuleId,
            "anyoneWithApprovalCanMerge"
          );
        const enabledUserIds = enabledUsers.map((er) => er.userId);

        const protectedBranchRule =
          await this.repoSettingsService.updateBranchRuleSettingAccess(
            cachedRepository,
            args.protectedBranchRuleId,
            "anyoneWithApprovalCanMerge",
            (args.roleIds ?? []) as Array<string>,
            enabledUserIds
          );
        if (!protectedBranchRule) {
          return {
            __typename: "ProtectedBranchSettingChangeError",
            message: "Unknown Error",
            type: "UNKNOWN_ERROR",
          };
        }
        this.pubsub?.publish?.(`REPOSITORY_UPDATED:${cachedRepository.id}`, {
          repositoryUpdated: cachedRepository,
        });
        return {
          __typename: "ProtectedBranchSettingChangeSuccess",
          repository: cachedRepository,
          protectedBranchRule,
        };
      }
    ),

    updateAnyoneCanApproveMergeRequests: runWithHooks(
      () => [
        this.repositoryRemoteSettingsArgsLoader,
        this.rootRepositoryLoader,
        this.repoSettingAccessGuard,
      ],
      async (
        _,
        args: main.MutationUpdateAnyoneCanApproveMergeRequestsArgs,
        { cacheKey }
      ) => {
        if (!args.protectedBranchRuleId || !args.repositoryId) {
          return {
            __typename: "ProtectedBranchSettingChangeError",
            message: "Misisng Args",
            type: "MISSING_ARGS_ERROR",
          };
        }
        const cachedRepository =
          this.requestCache.getRepo(cacheKey, args.repositoryId) ??
          new Set<string>();
        const protectedBranchRule =
          await this.repoSettingsService.updateBranchRuleSettingValue(
            cachedRepository,
            args.protectedBranchRuleId,
            "anyoneCanApproveMergeRequests",
            args?.anyoneCanApproveMergeRequests
          );
        if (!protectedBranchRule) {
          return {
            __typename: "ProtectedBranchSettingChangeError",
            message: "Unknown Error",
            type: "UNKNOWN_ERROR",
          };
        }
        this.pubsub?.publish?.(`REPOSITORY_UPDATED:${cachedRepository.id}`, {
          repositoryUpdated: cachedRepository,
        });
        return {
          __typename: "ProtectedBranchSettingChangeSuccess",
          repository: cachedRepository,
          protectedBranchRule,
        };
      }
    ),

    updateAnyoneCanApproveMergeRequestsUsers: runWithHooks(
      () => [
        this.repositoryRemoteSettingsArgsLoader,
        this.rootRepositoryLoader,
        this.repoSettingAccessGuard,
      ],
      async (
        _,
        args: main.MutationUpdateAnyoneCanApproveMergeRequestsUsersArgs,
        { cacheKey }
      ) => {
        if (!args.protectedBranchRuleId || !args.repositoryId) {
          return {
            __typename: "ProtectedBranchSettingChangeError",
            message: "Misisng Args",
            type: "MISSING_ARGS_ERROR",
          };
        }
        const cachedRepository =
          this.requestCache.getRepo(cacheKey, args.repositoryId) ??
          new Set<string>();

        const protectedBranchRuleEnabledRoleSettingsContext =
          await this.contextFactory.createContext(
            ProtectedBranchRuleEnabledRoleSettingsContext
          );

        const enabledRoles =
          await protectedBranchRuleEnabledRoleSettingsContext.getAllForBranchRuleSetting(
            args.protectedBranchRuleId,
            "anyoneCanApproveMergeRequests"
          );
        const enabledRoleIds = enabledRoles.map((er) => er.roleId);

        const protectedBranchRule =
          await this.repoSettingsService.updateBranchRuleSettingAccess(
            cachedRepository,
            args.protectedBranchRuleId,
            "anyoneCanApproveMergeRequests",
            enabledRoleIds,
            (args.userIds ?? []) as Array<string>
          );
        if (!protectedBranchRule) {
          return {
            __typename: "ProtectedBranchSettingChangeError",
            message: "Unknown Error",
            type: "UNKNOWN_ERROR",
          };
        }
        this.pubsub?.publish?.(`REPOSITORY_UPDATED:${cachedRepository.id}`, {
          repositoryUpdated: cachedRepository,
        });
        return {
          __typename: "ProtectedBranchSettingChangeSuccess",
          repository: cachedRepository,
          protectedBranchRule,
        };
      }
    ),

    updateAnyoneCanApproveMergeRequestsRoles: runWithHooks(
      () => [
        this.repositoryRemoteSettingsArgsLoader,
        this.rootRepositoryLoader,
        this.repoSettingAccessGuard,
      ],
      async (
        _,
        args: main.MutationUpdateAnyoneCanApproveMergeRequestsRolesArgs,
        { cacheKey }
      ) => {
        if (!args.protectedBranchRuleId || !args.repositoryId) {
          return {
            __typename: "ProtectedBranchSettingChangeError",
            message: "Misisng Args",
            type: "MISSING_ARGS_ERROR",
          };
        }
        const cachedRepository =
          this.requestCache.getRepo(cacheKey, args.repositoryId) ??
          new Set<string>();

        const protectedBranchRulesEnabledUserSettingsContext =
          await this.contextFactory.createContext(
            ProtectedBranchRulesEnabledUserSettingsContext
          );

        const enabledUsers =
          await protectedBranchRulesEnabledUserSettingsContext.getAllForBranchRuleSetting(
            args.protectedBranchRuleId,
            "anyoneCanApproveMergeRequests"
          );
        const enabledUserIds = enabledUsers.map((er) => er.userId);

        const protectedBranchRule =
          await this.repoSettingsService.updateBranchRuleSettingAccess(
            cachedRepository,
            args.protectedBranchRuleId,
            "anyoneCanApproveMergeRequests",
            (args.roleIds ?? []) as Array<string>,
            enabledUserIds
          );
        if (!protectedBranchRule) {
          return {
            __typename: "ProtectedBranchSettingChangeError",
            message: "Unknown Error",
            type: "UNKNOWN_ERROR",
          };
        }
        this.pubsub?.publish?.(`REPOSITORY_UPDATED:${cachedRepository.id}`, {
          repositoryUpdated: cachedRepository,
        });
        return {
          __typename: "ProtectedBranchSettingChangeSuccess",
          repository: cachedRepository,
          protectedBranchRule,
        };
      }
    ),

    updateAnyoneCanRevert: runWithHooks(
      () => [
        this.repositoryRemoteSettingsArgsLoader,
        this.rootRepositoryLoader,
        this.repoSettingAccessGuard,
      ],
      async (_, args: main.MutationUpdateAnyoneCanRevertArgs, { cacheKey }) => {
        if (!args.protectedBranchRuleId || !args.repositoryId) {
          return {
            __typename: "ProtectedBranchSettingChangeError",
            message: "Misisng Args",
            type: "MISSING_ARGS_ERROR",
          };
        }
        const cachedRepository =
          this.requestCache.getRepo(cacheKey, args.repositoryId) ??
          new Set<string>();
        const protectedBranchRule =
          await this.repoSettingsService.updateBranchRuleSettingValue(
            cachedRepository,
            args.protectedBranchRuleId,
            "anyoneCanRevert",
            args?.anyoneCanRevert
          );
        if (!protectedBranchRule) {
          return {
            __typename: "ProtectedBranchSettingChangeError",
            message: "Unknown Error",
            type: "UNKNOWN_ERROR",
          };
        }
        this.pubsub?.publish?.(`REPOSITORY_UPDATED:${cachedRepository.id}`, {
          repositoryUpdated: cachedRepository,
        });
        return {
          __typename: "ProtectedBranchSettingChangeSuccess",
          repository: cachedRepository,
          protectedBranchRule,
        };
      }
    ),

    updateAnyoneCanRevertUsers: runWithHooks(
      () => [
        this.repositoryRemoteSettingsArgsLoader,
        this.rootRepositoryLoader,
        this.repoSettingAccessGuard,
      ],
      async (
        _,
        args: main.MutationUpdateAnyoneCanRevertUsersArgs,
        { cacheKey }
      ) => {
        if (!args.protectedBranchRuleId || !args.repositoryId) {
          return {
            __typename: "ProtectedBranchSettingChangeError",
            message: "Misisng Args",
            type: "MISSING_ARGS_ERROR",
          };
        }
        const cachedRepository =
          this.requestCache.getRepo(cacheKey, args.repositoryId) ??
          new Set<string>();

        const protectedBranchRuleEnabledRoleSettingsContext =
          await this.contextFactory.createContext(
            ProtectedBranchRuleEnabledRoleSettingsContext
          );

        const enabledRoles =
          await protectedBranchRuleEnabledRoleSettingsContext.getAllForBranchRuleSetting(
            args.protectedBranchRuleId,
            "anyoneCanRevert"
          );
        const enabledRoleIds = enabledRoles.map((er) => er.roleId);

        const protectedBranchRule =
          await this.repoSettingsService.updateBranchRuleSettingAccess(
            cachedRepository,
            args.protectedBranchRuleId,
            "anyoneCanRevert",
            enabledRoleIds,
            (args.userIds ?? []) as Array<string>
          );
        if (!protectedBranchRule) {
          return {
            __typename: "ProtectedBranchSettingChangeError",
            message: "Unknown Error",
            type: "UNKNOWN_ERROR",
          };
        }
        this.pubsub?.publish?.(`REPOSITORY_UPDATED:${cachedRepository.id}`, {
          repositoryUpdated: cachedRepository,
        });
        return {
          __typename: "ProtectedBranchSettingChangeSuccess",
          repository: cachedRepository,
          protectedBranchRule,
        };
      }
    ),
    updateAnyoneCanRevertRoles: runWithHooks(
      () => [
        this.repositoryRemoteSettingsArgsLoader,
        this.rootRepositoryLoader,
        this.repoSettingAccessGuard,
      ],
      async (
        _,
        args: main.MutationUpdateAnyoneCanRevertRolesArgs,
        { cacheKey }
      ) => {
        if (!args.protectedBranchRuleId || !args.repositoryId) {
          return {
            __typename: "ProtectedBranchSettingChangeError",
            message: "Misisng Args",
            type: "MISSING_ARGS_ERROR",
          };
        }
        const cachedRepository =
          this.requestCache.getRepo(cacheKey, args.repositoryId) ??
          new Set<string>();

        const protectedBranchRulesEnabledUserSettingsContext =
          await this.contextFactory.createContext(
            ProtectedBranchRulesEnabledUserSettingsContext
          );

        const enabledUsers =
          await protectedBranchRulesEnabledUserSettingsContext.getAllForBranchRuleSetting(
            args.protectedBranchRuleId,
            "anyoneCanRevert"
          );
        const enabledUserIds = enabledUsers.map((er) => er.userId);

        const protectedBranchRule =
          await this.repoSettingsService.updateBranchRuleSettingAccess(
            cachedRepository,
            args.protectedBranchRuleId,
            "anyoneCanRevert",
            (args.roleIds ?? []) as Array<string>,
            enabledUserIds
          );
        if (!protectedBranchRule) {
          return {
            __typename: "ProtectedBranchSettingChangeError",
            message: "Unknown Error",
            type: "UNKNOWN_ERROR",
          };
        }
        this.pubsub?.publish?.(`REPOSITORY_UPDATED:${cachedRepository.id}`, {
          repositoryUpdated: cachedRepository,
        });
        return {
          __typename: "ProtectedBranchSettingChangeSuccess",
          repository: cachedRepository,
          protectedBranchRule,
        };
      }
    ),

    updateAnyoneCanAutofix: runWithHooks(
      () => [
        this.repositoryRemoteSettingsArgsLoader,
        this.rootRepositoryLoader,
        this.repoSettingAccessGuard,
      ],
      async (
        _,
        args: main.MutationUpdateAnyoneCanAutofixArgs,
        { cacheKey }
      ) => {
        if (!args.protectedBranchRuleId || !args.repositoryId) {
          return {
            __typename: "ProtectedBranchSettingChangeError",
            message: "Misisng Args",
            type: "MISSING_ARGS_ERROR",
          };
        }
        const cachedRepository =
          this.requestCache.getRepo(cacheKey, args.repositoryId) ??
          new Set<string>();
        const protectedBranchRule =
          await this.repoSettingsService.updateBranchRuleSettingValue(
            cachedRepository,
            args.protectedBranchRuleId,
            "anyoneCanAutofix",
            args?.anyoneCanAutofix
          );
        if (!protectedBranchRule) {
          return {
            __typename: "ProtectedBranchSettingChangeError",
            message: "Unknown Error",
            type: "UNKNOWN_ERROR",
          };
        }
        this.pubsub?.publish?.(`REPOSITORY_UPDATED:${cachedRepository.id}`, {
          repositoryUpdated: cachedRepository,
        });
        return {
          __typename: "ProtectedBranchSettingChangeSuccess",
          repository: cachedRepository,
          protectedBranchRule,
        };
      }
    ),

    updateAnyoneCanAutofixUsers: runWithHooks(
      () => [
        this.repositoryRemoteSettingsArgsLoader,
        this.rootRepositoryLoader,
        this.repoSettingAccessGuard,
      ],
      async (
        _,
        args: main.MutationUpdateAnyoneCanAutofixUsersArgs,
        { cacheKey }
      ) => {
        if (!args.protectedBranchRuleId || !args.repositoryId) {
          return {
            __typename: "ProtectedBranchSettingChangeError",
            message: "Misisng Args",
            type: "MISSING_ARGS_ERROR",
          };
        }
        const cachedRepository =
          this.requestCache.getRepo(cacheKey, args.repositoryId) ??
          new Set<string>();

        const protectedBranchRuleEnabledRoleSettingsContext =
          await this.contextFactory.createContext(
            ProtectedBranchRuleEnabledRoleSettingsContext
          );

        const enabledRoles =
          await protectedBranchRuleEnabledRoleSettingsContext.getAllForBranchRuleSetting(
            args.protectedBranchRuleId,
            "anyoneCanAutofix"
          );
        const enabledRoleIds = enabledRoles.map((er) => er.roleId);

        const protectedBranchRule =
          await this.repoSettingsService.updateBranchRuleSettingAccess(
            cachedRepository,
            args.protectedBranchRuleId,
            "anyoneCanAutofix",
            enabledRoleIds,
            (args.userIds ?? []) as Array<string>
          );
        if (!protectedBranchRule) {
          return {
            __typename: "ProtectedBranchSettingChangeError",
            message: "Unknown Error",
            type: "UNKNOWN_ERROR",
          };
        }
        this.pubsub?.publish?.(`REPOSITORY_UPDATED:${cachedRepository.id}`, {
          repositoryUpdated: cachedRepository,
        });
        return {
          __typename: "ProtectedBranchSettingChangeSuccess",
          repository: cachedRepository,
          protectedBranchRule,
        };
      }
    ),
    updateAnyoneCanAutofixRoles: runWithHooks(
      () => [
        this.repositoryRemoteSettingsArgsLoader,
        this.rootRepositoryLoader,
        this.repoSettingAccessGuard,
      ],
      async (
        _,
        args: main.MutationUpdateAnyoneCanAutofixRolesArgs,
        { cacheKey }
      ) => {
        if (!args.protectedBranchRuleId || !args.repositoryId) {
          return {
            __typename: "ProtectedBranchSettingChangeError",
            message: "Misisng Args",
            type: "MISSING_ARGS_ERROR",
          };
        }
        const cachedRepository =
          this.requestCache.getRepo(cacheKey, args.repositoryId) ??
          new Set<string>();

        const protectedBranchRulesEnabledUserSettingsContext =
          await this.contextFactory.createContext(
            ProtectedBranchRulesEnabledUserSettingsContext
          );

        const enabledUsers =
          await protectedBranchRulesEnabledUserSettingsContext.getAllForBranchRuleSetting(
            args.protectedBranchRuleId,
            "anyoneCanAutofix"
          );
        const enabledUserIds = enabledUsers.map((er) => er.userId);

        const protectedBranchRule =
          await this.repoSettingsService.updateBranchRuleSettingAccess(
            cachedRepository,
            args.protectedBranchRuleId,
            "anyoneCanAutofix",
            (args.roleIds ?? []) as Array<string>,
            enabledUserIds
          );
        if (!protectedBranchRule) {
          return {
            __typename: "ProtectedBranchSettingChangeError",
            message: "Unknown Error",
            type: "UNKNOWN_ERROR",
          };
        }
        this.pubsub?.publish?.(`REPOSITORY_UPDATED:${cachedRepository.id}`, {
          repositoryUpdated: cachedRepository,
        });
        return {
          __typename: "ProtectedBranchSettingChangeSuccess",
          repository: cachedRepository,
          protectedBranchRule,
        };
      }
    ),
  };
}
