import BaseResolverModule from "../BaseResolverModule";
import { main } from "@floro/graphql-schemas/build";
import { inject, injectable } from "inversify";
import ContextFactory from "@floro/database/src/contexts/ContextFactory";
import RequestCache from "../../request/RequestCache";
import LoggedInUserGuard from "../hooks/guards/LoggedInUserGuard";
import { runWithHooks } from "../hooks/ResolverHook";
import RootOrganizationMemberPermissionsLoader from "../hooks/loaders/Root/OrganizationID/RootOrganizationMemberPermissionsLoader";
import RepositoryService from "../../services/repositories/RepositoryService";
import RepositoryRemoteSettingsLoader from "../hooks/loaders/Repository/RepositoryRemoteSettingsLoader";
import RepositoryBranchesLoader from "../hooks/loaders/Repository/RepositoryBranchesLoader";
import RepositoryCommitsLoader from "../hooks/loaders/Repository/RepositoryCommitsLoader";
import RepositoryCommitHistoryLoader from "../hooks/loaders/Repository/RepositoryCommitHistoryLoader";
import RootRepositoryLoader from "../hooks/loaders/Root/RepositoryID/RepositoryLoader";
import RepositoryRevertRangesLoader from "../hooks/loaders/Repository/RepositoryRevertRangesLoader";
import CommitStateDatasourceLoader from "../hooks/loaders/Repository/CommitStateDatasourceLoader";
import CommitStatePluginVersionsLoader from "../hooks/loaders/Repository/CommitStatePluginVersionsLoader";
import CommitStateBinaryRefsLoader from "../hooks/loaders/Repository/CommitStateBinaryRefsLoader";
import CommitInfoRepositoryLoader from "../hooks/loaders/Repository/CommitInfoRepoLoader";
import { OrganizationRole } from "@floro/graphql-schemas/build/generated/main-graphql";
import BranchService from "../../services/repositories/BranchService";
import MergeRequestService from "../../services/merge_requests/MergeRequestService";
import OpenMergeRequestsLoader from "../hooks/loaders/MergeRequest/OpenMergeRequestsLoader";
import ClosedMergeRequestsLoader from "../hooks/loaders/MergeRequest/ClosedMergeRequestsLoader";
import { User } from "@floro/database/src/entities/User";
import ProtectedBranchRulesEnabledUserSettingsContext from "@floro/database/src/contexts/repositories/ProtectedBranchRulesEnabledUserSettingsContext";
import ProtectedBranchRuleEnabledRoleSettingsContext from "@floro/database/src/contexts/repositories/ProtectedBranchRulesEnabledRoleSettingsContext";
import WriteAccessIdsLoader from "../hooks/loaders/Repository/WriteAccessIdsLoader";
import ProtectedBranchRuleLoader from "../hooks/loaders/Root/ProtectedBranchRuleID/ProtectedBranchRuleLoader";
import RepoSettingsService from "../../services/repositories/RepoSettingsService";
import RepoSettingAccessGuard from "../hooks/guards/RepoSettingAccessGuard";
import RepositoryRemoteSettingsArgsLoader from "../hooks/loaders/Repository/RepositoryRemoteSettingsArgsLoader";

@injectable()
export default class RepositoryProtectedBranchesResolverModule extends BaseResolverModule {
  public resolvers: Array<keyof this & keyof main.ResolversTypes> = [
    "Query",
    "Mutation",
    "ProtectedBranchRule",
  ];
  protected repositoryService!: RepositoryService;
  protected repoSettingsService!: RepoSettingsService;
  protected branchService!: BranchService;
  protected mergeRequestService!: MergeRequestService;
  protected contextFactory!: ContextFactory;
  protected requestCache!: RequestCache;

  protected loggedInUserGuard!: LoggedInUserGuard;

  protected rootOrganizationMemberPermissionsLoader!: RootOrganizationMemberPermissionsLoader;
  protected repositoryRemoteSettingsArgsLoader!: RepositoryRemoteSettingsArgsLoader;
  protected repositoryBranchesLoader!: RepositoryBranchesLoader;
  protected repositoryCommitsLoader!: RepositoryCommitsLoader;
  protected repositoryCommitHistoryLoader!: RepositoryCommitHistoryLoader;
  protected repositoryRevertRangesLoader!: RepositoryRevertRangesLoader;
  protected rootRepositoryLoader!: RootRepositoryLoader;
  protected commitStateDatasourceLoader!: CommitStateDatasourceLoader;
  protected commitStatePluginVersionsLoader!: CommitStatePluginVersionsLoader;
  protected commitStateBinaryRefsLoader!: CommitStateBinaryRefsLoader;
  protected commitInfoRepositoryLoader!: CommitInfoRepositoryLoader;
  protected writeAccessIdsLoader!: WriteAccessIdsLoader;
  protected repoSettingAccessGuard!: RepoSettingAccessGuard;

  protected openMergeRequestsLoader!: OpenMergeRequestsLoader;
  protected closedMergeRequestsLoader!: ClosedMergeRequestsLoader;
  protected protectedBranchRuleLoader!: ProtectedBranchRuleLoader;

  constructor(
    @inject(ContextFactory) contextFactory: ContextFactory,
    @inject(RequestCache) requestCache: RequestCache,
    @inject(RepositoryService) repositoryService: RepositoryService,
    @inject(RepoSettingsService) repoSettingsService: RepoSettingsService,
    @inject(LoggedInUserGuard) loggedInUserGuard: LoggedInUserGuard,
    @inject(RootOrganizationMemberPermissionsLoader)
    rootOrganizationMemberPermissionsLoader: RootOrganizationMemberPermissionsLoader,
    @inject(RepositoryRemoteSettingsArgsLoader)
    repositoryRemoteSettingsArgsLoader: RepositoryRemoteSettingsArgsLoader,
    @inject(RepositoryBranchesLoader)
    repositoryBranchesLoader: RepositoryBranchesLoader,
    @inject(RepositoryCommitsLoader)
    repositoryCommitsLoader: RepositoryCommitsLoader,
    @inject(RepositoryCommitHistoryLoader)
    repositoryCommitHistoryLoader: RepositoryCommitHistoryLoader,
    @inject(RepositoryRevertRangesLoader)
    repositoryRevertRangesLoader: RepositoryRevertRangesLoader,
    @inject(RootRepositoryLoader)
    rootRepositoryLoader: RootRepositoryLoader,
    @inject(CommitStateDatasourceLoader)
    commitStateDatasourceLoader: CommitStateDatasourceLoader,
    @inject(CommitStatePluginVersionsLoader)
    commitStatePluginVersionsLoader: CommitStatePluginVersionsLoader,
    @inject(CommitStateBinaryRefsLoader)
    commitStateBinaryRefsLoader: CommitStateBinaryRefsLoader,
    @inject(CommitInfoRepositoryLoader)
    commitInfoRepositoryLoader: CommitInfoRepositoryLoader,
    @inject(BranchService) branchService: BranchService,
    @inject(MergeRequestService) mergeRequestService: MergeRequestService,
    @inject(OpenMergeRequestsLoader)
    openMergeRequestsLoader: OpenMergeRequestsLoader,
    @inject(ClosedMergeRequestsLoader)
    closedMergeRequestsLoader: ClosedMergeRequestsLoader,
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

    this.repositoryService = repositoryService;
    this.repoSettingsService = repoSettingsService;
    this.branchService = branchService;
    this.mergeRequestService = mergeRequestService;

    this.loggedInUserGuard = loggedInUserGuard;

    this.rootOrganizationMemberPermissionsLoader =
      rootOrganizationMemberPermissionsLoader;

    this.repositoryRemoteSettingsArgsLoader = repositoryRemoteSettingsArgsLoader;
    this.repositoryBranchesLoader = repositoryBranchesLoader;
    this.repositoryCommitsLoader = repositoryCommitsLoader;
    this.repositoryCommitHistoryLoader = repositoryCommitHistoryLoader;
    this.repositoryRevertRangesLoader = repositoryRevertRangesLoader;
    this.rootRepositoryLoader = rootRepositoryLoader;
    this.commitStateDatasourceLoader = commitStateDatasourceLoader;
    this.commitStatePluginVersionsLoader = commitStatePluginVersionsLoader;
    this.commitStateBinaryRefsLoader = commitStateBinaryRefsLoader;
    this.commitInfoRepositoryLoader = commitInfoRepositoryLoader;
    this.writeAccessIdsLoader = writeAccessIdsLoader;
    this.repoSettingAccessGuard = repoSettingAccessGuard;

    this.openMergeRequestsLoader = openMergeRequestsLoader;
    this.closedMergeRequestsLoader = closedMergeRequestsLoader;
    this.protectedBranchRuleLoader = protectedBranchRuleLoader;
  }

  public ProtectedBranchRule: main.ProtectedBranchRuleResolvers = {
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

    canMergeMergeRequestsUsers: runWithHooks(
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
            "anyoneCanMergeMergeRequests"
          );
        const cachedWriteAccessIds =
          this.requestCache.getRepoWriteAccessIds(
            cacheKey,
            protectedBranchRule?.repositoryId as string
          ) ?? new Set<string>();
        return enabledUsersForSetting
          ?.filter((s) => cachedWriteAccessIds.has(s.userId))
          ?.map((s) => s.user as User);
      }
    ),
    canMergeMergeRequestsRoles: runWithHooks(
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
            "anyoneCanMergeMergeRequests"
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

  public Query: main.QueryResolvers = {
    // REPO SETTINGS MUTATIONS
    // PROTECTED BRANCH SETTINGS MUTATIONS
    //searchUsersForSetting: runWithHooks(
    //  () => [this.loggedInUserGuard],
    //  async (_, { }: main.QuerySearchPluginsForRepositoryArgs, { cacheKey, currentUser}) => {
    //    return null;
    //  }
    //),
  };

  public Mutation: main.MutationResolvers = {
    // REPO SETTINGS MUTATIONS
    // PROTECTED BRANCH SETTINGS MUTATIONS
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
        console.log("HELLO")
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
        //this.repoSettingsService
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
        //this.repoSettingsService
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
        //this.repoSettingsService
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
        //this.repoSettingsService
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
        return {
          __typename: "ProtectedBranchSettingChangeSuccess",
          repository: cachedRepository,
          protectedBranchRule,
        };
      }
    ),

    updateAnyoneCanMergeMergeRequests: runWithHooks(
      () => [
        this.repositoryRemoteSettingsArgsLoader,
        this.rootRepositoryLoader,
        this.repoSettingAccessGuard,
      ],
      async (
        _,
        args: main.MutationUpdateAnyoneCanMergeMergeRequestsArgs,
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
            "anyoneCanMergeMergeRequests",
            args?.anyoneCanMergeMergeRequests
          );
        if (!protectedBranchRule) {
          return {
            __typename: "ProtectedBranchSettingChangeError",
            message: "Unknown Error",
            type: "UNKNOWN_ERROR",
          };
        }
        return {
          __typename: "ProtectedBranchSettingChangeSuccess",
          repository: cachedRepository,
          protectedBranchRule,
        };
      }
    ),

    updateAnyoneCanMergeMergeRequestsUsers: runWithHooks(
      () => [
        this.repositoryRemoteSettingsArgsLoader,
        this.rootRepositoryLoader,
        this.repoSettingAccessGuard,
      ],
      async (
        _,
        args: main.MutationUpdateAnyoneCanMergeMergeRequestsUsersArgs,
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
            "anyoneCanMergeMergeRequests"
          );
        const enabledRoleIds = enabledRoles.map((er) => er.roleId);

        const protectedBranchRule =
          await this.repoSettingsService.updateBranchRuleSettingAccess(
            cachedRepository,
            args.protectedBranchRuleId,
            "anyoneCanMergeMergeRequests",
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
        return {
          __typename: "ProtectedBranchSettingChangeSuccess",
          repository: cachedRepository,
          protectedBranchRule,
        };
      }
    ),

    updateAnyoneCanMergeMergeRequestsRoles: runWithHooks(
      () => [
        this.repositoryRemoteSettingsArgsLoader,
        this.rootRepositoryLoader,
        this.repoSettingAccessGuard,
      ],
      async (
        _,
        args: main.MutationUpdateAnyoneCanMergeMergeRequestsRolesArgs,
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
            "anyoneCanMergeMergeRequests"
          );
        const enabledUserIds = enabledUsers.map((er) => er.userId);

        const protectedBranchRule =
          await this.repoSettingsService.updateBranchRuleSettingAccess(
            cachedRepository,
            args.protectedBranchRuleId,
            "anyoneCanMergeMergeRequests",
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
        return {
          __typename: "ProtectedBranchSettingChangeSuccess",
          repository: cachedRepository,
          protectedBranchRule,
        };
      }
    ),
  };
}
