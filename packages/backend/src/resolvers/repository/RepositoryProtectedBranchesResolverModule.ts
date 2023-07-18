import BaseResolverModule from "../BaseResolverModule";
import { main } from "@floro/graphql-schemas/build";
import { inject, injectable } from "inversify";
import ContextFactory from "@floro/database/src/contexts/ContextFactory";
import RequestCache from "../../request/RequestCache";
import LoggedInUserGuard from "../hooks/guards/LoggedInUserGuard";
import { runWithHooks } from "../hooks/ResolverHook";
import RootOrganizationMemberPermissionsLoader from "../hooks/loaders/Root/OrganizationID/RootOrganizationMemberPermissionsLoader";
import RepositoryService from "../../services/repositories/RepositoryService";
import OrganizationMembersContext from "@floro/database/src/contexts/organizations/OrganizationMembersContext";
import RepositoryRemoteSettingsLoader from "../hooks/loaders/Repository/RepositoryRemoteSettingsLoader";
import RepositoryBranchesLoader from "../hooks/loaders/Repository/RepositoryBranchesLoader";
import { Repository } from "@floro/database/src/entities/Repository";
import RepositoryCommitsLoader from "../hooks/loaders/Repository/RepositoryCommitsLoader";
import RepositoryCommitHistoryLoader from "../hooks/loaders/Repository/RepositoryCommitHistoryLoader";
import RootRepositoryLoader from "../hooks/loaders/Root/RepositoryID/RepositoryLoader";
import { Commit } from "@floro/database/src/entities/Commit";
import RepositoryRevertRangesLoader from "../hooks/loaders/Repository/RepositoryRevertRangesLoader";
import CommitStateDatasourceLoader from "../hooks/loaders/Repository/CommitStateDatasourceLoader";
import {
  getCanAutofixReversionIfNotWIP,
  getCanRevert,
  getMergeRebaseCommitList,
} from "floro/dist/src/repoapi";
import CommitStatePluginVersionsLoader from "../hooks/loaders/Repository/CommitStatePluginVersionsLoader";
import CommitStateBinaryRefsLoader from "../hooks/loaders/Repository/CommitStateBinaryRefsLoader";
import CommitInfoRepositoryLoader from "../hooks/loaders/Repository/CommitInfoRepoLoader";
import MergeRequestsContext from "@floro/database/src/contexts/merge_requests/MergeRequestsContext";
import { withFilter } from "graphql-subscriptions";
import {
  CommitInfo,
  OrganizationRole,
  SubscriptionSubscribeFn,
} from "@floro/graphql-schemas/build/generated/main-graphql";
import BranchService from "../../services/repositories/BranchService";
import IgnoredBranchNotificationsContext from "@floro/database/src/contexts/merge_requests/IgnoredBranchNotificationsContext";
import MergeRequestService from "../../services/merge_requests/MergeRequestService";
import {
  EMPTY_COMMIT_STATE,
  canAutoMergeCommitStates,
  getCommitState,
  getDivergenceOrigin,
  getMergeOriginSha,
} from "floro/dist/src/repo";
import { User as FloroUser } from "floro/dist/src/filestructure";
import { CommitData } from "floro/dist/src/sequenceoperations";
import OpenMergeRequestsLoader from "../hooks/loaders/MergeRequest/OpenMergeRequestsLoader";
import ClosedMergeRequestsLoader from "../hooks/loaders/MergeRequest/ClosedMergeRequestsLoader";
import { User } from "@floro/database/src/entities/User";
import OrganizationMemberRolesContext from "@floro/database/src/contexts/organizations/OrganizationMemberRolesContext";
import RepositoryEnabledRoleSettingsContext from "@floro/database/src/contexts/repositories/RepositoryEnabledRoleSettingsContext";
import RepositoryEnabledUserSettingsContext from "@floro/database/src/contexts/repositories/RepositoryEnabledUserSettingsContext";
import ProtectedBranchRulesContext from "@floro/database/src/contexts/repositories/ProtectedBranchRulesContext";
import ProtectedBranchRulesEnabledUserSettingsContext from "@floro/database/src/contexts/repositories/ProtectedBranchRulesEnabledUserSettingsContext";
import ProtectedBranchRuleEnabledRoleSettingsContext from "@floro/database/src/contexts/repositories/ProtectedBranchRulesEnabledRoleSettingsContext";

@injectable()
export default class RepositoryProtectedBranchesResolverModule extends BaseResolverModule {
  public resolvers: Array<keyof this & keyof main.ResolversTypes> = [
    "Query",
    "Mutation",
    "ProtectedBranchRule",
  ];
  protected repositoryService!: RepositoryService;
  protected branchService!: BranchService;
  protected mergeRequestService!: MergeRequestService;
  protected contextFactory!: ContextFactory;
  protected requestCache!: RequestCache;

  protected loggedInUserGuard!: LoggedInUserGuard;

  protected rootOrganizationMemberPermissionsLoader!: RootOrganizationMemberPermissionsLoader;
  protected repositoryRemoteSettingsLoader!: RepositoryRemoteSettingsLoader;
  protected repositoryBranchesLoader!: RepositoryBranchesLoader;
  protected repositoryCommitsLoader!: RepositoryCommitsLoader;
  protected repositoryCommitHistoryLoader!: RepositoryCommitHistoryLoader;
  protected repositoryRevertRangesLoader!: RepositoryRevertRangesLoader;
  protected rootRepositoryLoader!: RootRepositoryLoader;
  protected commitStateDatasourceLoader!: CommitStateDatasourceLoader;
  protected commitStatePluginVersionsLoader!: CommitStatePluginVersionsLoader;
  protected commitStateBinaryRefsLoader!: CommitStateBinaryRefsLoader;
  protected commitInfoRepositoryLoader!: CommitInfoRepositoryLoader;

  protected openMergeRequestsLoader!: OpenMergeRequestsLoader;
  protected closedMergeRequestsLoader!: ClosedMergeRequestsLoader;

  constructor(
    @inject(ContextFactory) contextFactory: ContextFactory,
    @inject(RequestCache) requestCache: RequestCache,
    @inject(RepositoryService) repositoryService: RepositoryService,
    @inject(LoggedInUserGuard) loggedInUserGuard: LoggedInUserGuard,
    @inject(RootOrganizationMemberPermissionsLoader)
    rootOrganizationMemberPermissionsLoader: RootOrganizationMemberPermissionsLoader,
    @inject(RepositoryRemoteSettingsLoader)
    repositoryRemoteSettingsLoader: RepositoryRemoteSettingsLoader,
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
    closedMergeRequestsLoader: ClosedMergeRequestsLoader
  ) {
    super();
    this.contextFactory = contextFactory;
    this.requestCache = requestCache;

    this.repositoryService = repositoryService;
    this.branchService = branchService;
    this.mergeRequestService = mergeRequestService;

    this.loggedInUserGuard = loggedInUserGuard;

    this.rootOrganizationMemberPermissionsLoader =
      rootOrganizationMemberPermissionsLoader;

    this.repositoryRemoteSettingsLoader = repositoryRemoteSettingsLoader;
    this.repositoryBranchesLoader = repositoryBranchesLoader;
    this.repositoryCommitsLoader = repositoryCommitsLoader;
    this.repositoryCommitHistoryLoader = repositoryCommitHistoryLoader;
    this.repositoryRevertRangesLoader = repositoryRevertRangesLoader;
    this.rootRepositoryLoader = rootRepositoryLoader;
    this.commitStateDatasourceLoader = commitStateDatasourceLoader;
    this.commitStatePluginVersionsLoader = commitStatePluginVersionsLoader;
    this.commitStateBinaryRefsLoader = commitStateBinaryRefsLoader;
    this.commitInfoRepositoryLoader = commitInfoRepositoryLoader;

    this.openMergeRequestsLoader = openMergeRequestsLoader;
    this.closedMergeRequestsLoader = closedMergeRequestsLoader;
  }

  public ProtectedBranchRule: main.ProtectedBranchRuleResolvers = {
    canCreateMergeRequestsUsers: runWithHooks(
      () => [],
      async (protectedBranchRule: main.ProtectedBranchRule) => {
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
        return enabledUsersForSetting?.map((r) => r.user as User);
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
        return enabledRolesForSetting?.map((r) => r.role as OrganizationRole);
      }
    ),

    withApprovalCanMergeUsers: runWithHooks(
      () => [],
      async (protectedBranchRule: main.ProtectedBranchRule) => {
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
        return enabledUsersForSetting?.map((r) => r.user as User);
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
        return enabledRolesForSetting?.map((r) => r.role as OrganizationRole);
      }
    ),

    canApproveMergeRequestsUsers: runWithHooks(
      () => [],
      async (protectedBranchRule: main.ProtectedBranchRule) => {
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
        return enabledUsersForSetting?.map((r) => r.user as User);
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
        return enabledRolesForSetting?.map((r) => r.role as OrganizationRole);
      }
    ),

    canRevertUsers: runWithHooks(
      () => [],
      async (protectedBranchRule: main.ProtectedBranchRule) => {
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
        return enabledUsersForSetting?.map((r) => r.user as User);
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
        return enabledRolesForSetting?.map((r) => r.role as OrganizationRole);
      }
    ),

    canAutofixUsers: runWithHooks(
      () => [],
      async (protectedBranchRule: main.ProtectedBranchRule) => {
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
        return enabledUsersForSetting?.map((r) => r.user as User);
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
        return enabledRolesForSetting?.map((r) => r.role as OrganizationRole);
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
  };
}
