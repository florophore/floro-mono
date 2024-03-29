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
  ApplicationKVState,
  EMPTY_COMMIT_STATE,
  canAutoMergeCommitStates,
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
import WriteAccessIdsLoader from "../hooks/loaders/Repository/WriteAccessIdsLoader";
import RootRepositoryRemoteSettingsLoader from "../hooks/loaders/Root/RepositoryID/RootRepositoryRemoteSettingsLoader";
import RepoSettingsService from "../../services/repositories/RepoSettingsService";
import RepoSettingAccessGuard from "../hooks/guards/RepoSettingAccessGuard";
import RepoDataService from "../../services/repositories/RepoDataService";
import RepositoryDatasourceFactoryService from "../../services/repositories/RepoDatasourceFactoryService";
import UserClosedMergeRequestsLoader from "../hooks/loaders/MergeRequest/UserClosedMergeRequestsLoader";
import RevertService from "../../services/repositories/RevertService";
import BranchStateRepositoryLoader from "../hooks/loaders/Repository/BranchStateRepoLoader";
import BranchesContext from "@floro/database/src/contexts/repositories/BranchesContext";
import MergeService from "../../services/merge_requests/MergeService";
import CommitsContext from "@floro/database/src/contexts/repositories/CommitsContext";
import OrganizationPermissionService from "../../services/organizations/OrganizationPermissionService";
import RepositoryEnabledApiKeysContext from "@floro/database/src/contexts/api_keys/RepositoryEnabledApiKeysContext";
import RepositoryEnabledWebhookKeysContext from "@floro/database/src/contexts/api_keys/RepositoryEnabledWebhookKeysContext";
import RepoApiSettingAccessGuard from "../hooks/guards/RepoApiSettingAccessGuard";
import ApiKeyLoader from "../hooks/loaders/ApiKey/ApiKeyLoader";
import WebhookKeyLoader from "../hooks/loaders/ApiKey/WebhookKeyLoader";
import ApiKeysContext from "@floro/database/src/contexts/api_keys/ApiKeysContext";
import WebhookKeysContext from "@floro/database/src/contexts/api_keys/WebhookKeysContext";
import RepoEnabledApiKeyService from "../../services/api_keys/RepoEnabledApiKeyService";
import RepoEnabledWebhookKeyService from "../../services/api_keys/RepoEnabledWebhookKeyService";
import RepositoriesContext from "@floro/database/src/contexts/repositories/RepositoriesContext";
import RepoAnnouncementService from "../../services/announcements/RepoAnnouncementService";
import RepoBookmarksContext from "@floro/database/src/contexts/announcements/RepoBookmarksContext";
import RepoSubscriptionsContext from "@floro/database/src/contexts/announcements/RepoSubscriptionsContext";

const NEW_REPOS_PAGINATION_SIZE = 10;
const PAGINATION_LIMIT = 10;

@injectable()
export default class RepositoryResolverModule extends BaseResolverModule {
  public resolvers: Array<keyof this & keyof main.ResolversTypes> = [
    "Mutation",
    "Query",
    "Subscription",
    "Repository",
    "BranchState",
    "CommitState",
    "CommitInfo",
  ];
  protected repositoryService!: RepositoryService;
  protected repoDataService!: RepoDataService;
  protected repositoryDatasourceFactoryService!: RepositoryDatasourceFactoryService;
  protected repoSettingsService!: RepoSettingsService;
  protected branchService!: BranchService;
  protected mergeRequestService!: MergeRequestService;
  protected mergeService!: MergeService;
  protected revertService!: RevertService;
  protected contextFactory!: ContextFactory;
  protected requestCache!: RequestCache;
  protected organizationPermissionsService!: OrganizationPermissionService;
  protected repoEnabledApiKeyService!: RepoEnabledApiKeyService;
  protected repoEnabledWebhookKeyService!: RepoEnabledWebhookKeyService;
  protected repoAnnouncementService!: RepoAnnouncementService;

  protected loggedInUserGuard!: LoggedInUserGuard;

  protected rootOrganizationMemberPermissionsLoader!: RootOrganizationMemberPermissionsLoader;
  protected repositoryRemoteSettingsLoader!: RepositoryRemoteSettingsLoader;
  protected repositoryBranchesLoader!: RepositoryBranchesLoader;
  protected repositoryCommitsLoader!: RepositoryCommitsLoader;
  protected repositoryCommitHistoryLoader!: RepositoryCommitHistoryLoader;
  protected repositoryRevertRangesLoader!: RepositoryRevertRangesLoader;
  protected rootRepositoryLoader!: RootRepositoryLoader;
  protected rootRepositoryRemoteSettingsLoader!: RootRepositoryRemoteSettingsLoader;
  protected commitStateDatasourceLoader!: CommitStateDatasourceLoader;
  protected commitStatePluginVersionsLoader!: CommitStatePluginVersionsLoader;
  protected commitStateBinaryRefsLoader!: CommitStateBinaryRefsLoader;
  protected commitInfoRepositoryLoader!: CommitInfoRepositoryLoader;
  protected branchStateRepositoryLoader!: BranchStateRepositoryLoader;
  protected writeAccessIdsLoader!: WriteAccessIdsLoader;
  protected apiKeyLoader!: ApiKeyLoader;
  protected webhookKeyLoader!: WebhookKeyLoader;
  protected repoSettingAccessGuard!: RepoSettingAccessGuard;
  protected repoApiSettingAccessGuard!: RepoApiSettingAccessGuard;

  protected openMergeRequestsLoader!: OpenMergeRequestsLoader;
  protected userClosedMergeRequestsLoader!: UserClosedMergeRequestsLoader;
  protected closedMergeRequestsLoader!: ClosedMergeRequestsLoader;

  constructor(
    @inject(ContextFactory) contextFactory: ContextFactory,
    @inject(RequestCache) requestCache: RequestCache,
    @inject(RepositoryService) repositoryService: RepositoryService,
    @inject(RepoDataService) repoDataService: RepoDataService,
    @inject(RepositoryDatasourceFactoryService)
    repositoryDatasourceFactoryService: RepositoryDatasourceFactoryService,
    @inject(RepoSettingsService) repoSettingsService: RepoSettingsService,
    @inject(LoggedInUserGuard) loggedInUserGuard: LoggedInUserGuard,
    @inject(RootOrganizationMemberPermissionsLoader)
    rootOrganizationMemberPermissionsLoader: RootOrganizationMemberPermissionsLoader,
    @inject(RepoApiSettingAccessGuard)
    repoApiSettingAccessGuard: RepoApiSettingAccessGuard,
    @inject(OrganizationPermissionService)
    organizationPermissionsService: OrganizationPermissionService,
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
    @inject(RootRepositoryRemoteSettingsLoader)
    rootRepositoryRemoteSettingsLoader: RootRepositoryRemoteSettingsLoader,
    @inject(CommitStateDatasourceLoader)
    commitStateDatasourceLoader: CommitStateDatasourceLoader,
    @inject(CommitStatePluginVersionsLoader)
    commitStatePluginVersionsLoader: CommitStatePluginVersionsLoader,
    @inject(CommitStateBinaryRefsLoader)
    commitStateBinaryRefsLoader: CommitStateBinaryRefsLoader,
    @inject(CommitInfoRepositoryLoader)
    commitInfoRepositoryLoader: CommitInfoRepositoryLoader,
    @inject(BranchStateRepositoryLoader)
    branchStateRepositoryLoader: BranchStateRepositoryLoader,
    @inject(BranchService) branchService: BranchService,
    @inject(MergeRequestService) mergeRequestService: MergeRequestService,
    @inject(MergeService) mergeService: MergeService,
    @inject(OpenMergeRequestsLoader)
    openMergeRequestsLoader: OpenMergeRequestsLoader,
    @inject(ClosedMergeRequestsLoader)
    closedMergeRequestsLoader: ClosedMergeRequestsLoader,
    @inject(UserClosedMergeRequestsLoader)
    userClosedMergeRequestsLoader: UserClosedMergeRequestsLoader,
    @inject(WriteAccessIdsLoader) writeAccessIdsLoader: WriteAccessIdsLoader,
    @inject(RepoSettingAccessGuard)
    repoSettingAccessGuard: RepoSettingAccessGuard,
    @inject(RevertService) revertService: RevertService,
    @inject(RepoEnabledApiKeyService)
    repoEnabledApiKeyService: RepoEnabledApiKeyService,
    @inject(RepoEnabledWebhookKeyService)
    repoEnabledWebhookKeyService: RepoEnabledWebhookKeyService,
    @inject(RepoAnnouncementService)
    repoAnnouncementService: RepoAnnouncementService
  ) {
    super();
    this.contextFactory = contextFactory;
    this.requestCache = requestCache;

    this.repoDataService = repoDataService;
    this.repositoryDatasourceFactoryService =
      repositoryDatasourceFactoryService;
    this.repositoryService = repositoryService;
    this.repoSettingsService = repoSettingsService;
    this.branchService = branchService;
    this.mergeRequestService = mergeRequestService;
    this.mergeService = mergeService;
    this.revertService = revertService;
    this.organizationPermissionsService = organizationPermissionsService;

    this.loggedInUserGuard = loggedInUserGuard;

    this.rootOrganizationMemberPermissionsLoader =
      rootOrganizationMemberPermissionsLoader;

    this.repositoryRemoteSettingsLoader = repositoryRemoteSettingsLoader;
    this.repositoryBranchesLoader = repositoryBranchesLoader;
    this.repositoryCommitsLoader = repositoryCommitsLoader;
    this.repositoryCommitHistoryLoader = repositoryCommitHistoryLoader;
    this.repositoryRevertRangesLoader = repositoryRevertRangesLoader;
    this.rootRepositoryLoader = rootRepositoryLoader;
    this.rootRepositoryRemoteSettingsLoader =
      rootRepositoryRemoteSettingsLoader;
    this.commitStateDatasourceLoader = commitStateDatasourceLoader;
    this.commitStatePluginVersionsLoader = commitStatePluginVersionsLoader;
    this.commitStateBinaryRefsLoader = commitStateBinaryRefsLoader;
    this.commitInfoRepositoryLoader = commitInfoRepositoryLoader;
    this.branchStateRepositoryLoader = branchStateRepositoryLoader;
    this.writeAccessIdsLoader = writeAccessIdsLoader;
    this.repoSettingAccessGuard = repoSettingAccessGuard;
    this.repoApiSettingAccessGuard = repoApiSettingAccessGuard;

    this.openMergeRequestsLoader = openMergeRequestsLoader;
    this.closedMergeRequestsLoader = closedMergeRequestsLoader;
    this.userClosedMergeRequestsLoader = userClosedMergeRequestsLoader;

    this.repoEnabledApiKeyService = repoEnabledApiKeyService;
    this.repoEnabledWebhookKeyService = repoEnabledWebhookKeyService;
    this.repoAnnouncementService = repoAnnouncementService;
  }

  public Repository: main.RepositoryResolvers = {
    branchState: runWithHooks(
      () => [this.repositoryBranchesLoader],
      async (
        repository: main.Repository,
        { branchId }: main.RepositoryBranchStateArgs,
        { cacheKey, currentUser }
      ) => {
        if (!repository.id) {
          return null;
        }
        const dbRepo: Repository = repository as Repository;
        const cachedBranches = this.requestCache.getRepoBranches(
          cacheKey,
          repository.id
        );
        if (!cachedBranches) {
          return null;
        }
        const branch =
          cachedBranches.find((b) => b.id == branchId) ??
          cachedBranches?.find((b) => b.id == dbRepo.defaultBranchId);
        if (!branch) {
          return null;
        }
        if (repository) {
          this.requestCache.setRepo(cacheKey, dbRepo);
        }
        return {
          branchId: branch.id,
          updatedAt: branch.updatedAt,
          baseBranchId: branch?.baseBranchId,
          defaultBranchId: dbRepo.defaultBranchId,
          name: branch.name,
          branchHead: branch.lastCommit ?? null,
          repositoryId: repository.id,
          noIdPresent: !branchId,
          isConflictFree: branch.isConflictFree,
          isMerged: branch.isMerged,
        };
      }
    ),
    repoBranches: runWithHooks(
      () => [this.repositoryBranchesLoader],
      async (
        repository: main.Repository,
        _: main.RepositoryBranchStateArgs,
        { cacheKey, currentUser }
      ) => {
        if (!repository.id) {
          return [];
        }
        const cachedBranches = this.requestCache.getRepoBranches(
          cacheKey,
          repository.id
        );
        return cachedBranches ?? [];
      }
    ),
    openUserBranchesWithoutMergeRequests: runWithHooks(
      () => [
        this.repositoryBranchesLoader,
        this.repositoryRemoteSettingsLoader,
        this.userClosedMergeRequestsLoader,
      ],
      async (
        repository: main.Repository,
        {
          filterIgnored,
        }: main.RepositoryOpenUserBranchesWithoutMergeRequestsArgs,
        { currentUser, cacheKey }
      ) => {
        if (!currentUser) {
          return [];
        }
        if (!repository.id) {
          return [];
        }
        const cachedBranches = this.requestCache.getRepoBranches(
          cacheKey,
          repository.id
        );
        if (!cachedBranches) {
          return [];
        }

        const cachedUserClosedMergeRequests =
          this.requestCache.getUserClosedRepoMergeRequests(
            cacheKey,
            repository.id
          );
        if (!cachedUserClosedMergeRequests) {
          return [];
        }

        const cachedRemoteSettings = this.requestCache.getRepoRemoteSettings(
          cacheKey,
          repository.id
        );

        const cachedOpenUserBranches = this.requestCache.getOpenUserBranches(
          cacheKey,
          repository.id
        );
        if (cachedOpenUserBranches) {
          return cachedOpenUserBranches;
        }

        // RESULTS ARE ASC ON MERGE COUNT SO LAST COMMIT ALWAYS WINS
        const closedBranchIdMap = cachedUserClosedMergeRequests.reduce(
          (acc, mr) => {
            return {
              ...acc,
              [mr.branchId as string]: mr.branchHeadShaAtClose,
            };
          },
          {}
        );
        const openUserBranches = (
          await this.branchService.getOpenBranchesByUser(
            repository as Repository,
            currentUser,
            cachedBranches,
            cachedRemoteSettings,
            filterIgnored ?? true
          )
        )?.filter((b) => {
          if (!closedBranchIdMap[b.id]) {
            return true;
          }
          return closedBranchIdMap[b.id] != b.lastCommit;
        });
        if (openUserBranches) {
          this.requestCache.setOpenUserBranches(
            cacheKey,
            repository.id,
            openUserBranches
          );
        }

        return openUserBranches;
      }
    ),
    openUserBranchesWithoutMergeRequestsCount: runWithHooks(
      () => [
        this.repositoryBranchesLoader,
        this.repositoryRemoteSettingsLoader,
        this.userClosedMergeRequestsLoader,
      ],
      async (repository: main.Repository, _, { currentUser, cacheKey }) => {
        if (!currentUser) {
          return 0;
        }
        if (!repository.id) {
          return 0;
        }
        const cachedBranches = this.requestCache.getRepoBranches(
          cacheKey,
          repository.id
        );
        if (!cachedBranches) {
          return 0;
        }

        const cachedRemoteSettings = this.requestCache.getRepoRemoteSettings(
          cacheKey,
          repository.id
        );

        const cachedUserClosedMergeRequests =
          this.requestCache.getUserClosedRepoMergeRequests(
            cacheKey,
            repository.id
          );
        if (!cachedUserClosedMergeRequests) {
          return 0;
        }

        // RESULTS ARE ASC ON MERGE COUNT SO LAST COMMIT ALWAYS WINS
        const closedBranchIdMap = cachedUserClosedMergeRequests.reduce(
          (acc, mr) => {
            return {
              ...acc,
              [mr.branchId as string]: mr.branchHeadShaAtClose,
            };
          },
          {}
        );

        const openUserBranches = (
          await this.branchService.getOpenBranchesByUser(
            repository as Repository,
            currentUser,
            cachedBranches,
            cachedRemoteSettings,
            false
          )
        )?.filter((b) => {
          if (!closedBranchIdMap[b.id]) {
            return true;
          }
          return closedBranchIdMap[b.id] != b.lastCommit;
        });
        return openUserBranches?.length ?? 0;
      }
    ),
    openBranchesWithoutMergeRequests: runWithHooks(
      () => [this.repositoryBranchesLoader, this.openMergeRequestsLoader],
      async (repository: main.Repository, _, { cacheKey }) => {
        if (!repository.id) {
          return [];
        }
        const cachedBranches = this.requestCache.getRepoBranches(
          cacheKey,
          repository.id
        );
        if (!cachedBranches) {
          return [];
        }
        const cachedOpenMergeRequests =
          this.requestCache.getOpenRepoMergeRequests(cacheKey, repository.id);
        if (!cachedOpenMergeRequests) {
          return [];
        }

        const branchesWithMergeOpenMergeRequests = new Set(
          cachedOpenMergeRequests.map((mergeRequest) => {
            return mergeRequest.branchId;
          })
        );
        return cachedBranches?.filter((b) => {
          return (
            !branchesWithMergeOpenMergeRequests.has(b.id) && b.baseBranchId
          );
        });
      }
    ),
    openBranchesWithoutMergeRequestsCount: runWithHooks(
      () => [this.repositoryBranchesLoader, this.openMergeRequestsLoader],
      async (repository: main.Repository, _, { cacheKey }) => {
        if (!repository.id) {
          return 0;
        }
        const cachedBranches = this.requestCache.getRepoBranches(
          cacheKey,
          repository.id
        );
        if (!cachedBranches) {
          return 0;
        }
        const cachedOpenMergeRequests =
          this.requestCache.getOpenRepoMergeRequests(cacheKey, repository.id);
        if (!cachedOpenMergeRequests) {
          return 0;
        }
        const branchesWithMergeOpenMergeRequests = new Set(
          cachedOpenMergeRequests.map((mergeRequest) => {
            return mergeRequest.branchId;
          })
        );
        return cachedBranches?.filter((b) => {
          return (
            !branchesWithMergeOpenMergeRequests.has(b.id) && b.baseBranchId
          );
        }).length;
      }
    ),
    openUserMergeRequestsCount: runWithHooks(
      () => [this.repositoryBranchesLoader, this.openMergeRequestsLoader],
      async (
        repository: main.Repository,
        _,
        context: { cacheKey: string; currentUser?: User | null }
      ) => {
        if (!repository.id) {
          return 0;
        }
        if (!context.currentUser?.id) {
          return 0;
        }
        const cachedBranches = this.requestCache.getRepoBranches(
          context.cacheKey,
          repository.id
        );
        if (!cachedBranches) {
          return 0;
        }
        const cachedOpenMergeRequests =
          this.requestCache.getOpenRepoMergeRequests(
            context.cacheKey,
            repository.id
          );
        if (!cachedOpenMergeRequests) {
          return 0;
        }
        return cachedOpenMergeRequests?.filter((mr) => {
          return mr.openedByUserId == context.currentUser?.id;
        })?.length;
      }
    ),
    mergeRequest: runWithHooks(
      () => [],
      async (repository: main.Repository, { id }) => {
        if (!repository) {
          return null;
        }
        const mergeRequestsContext = await this.contextFactory.createContext(
          MergeRequestsContext
        );
        const mergeRequest = await mergeRequestsContext.getById(id ?? "");
        if (mergeRequest?.repositoryId == repository.id) {
          return mergeRequest;
        }
        return null;
      }
    ),
    openMergeRequests: runWithHooks(
      () => [this.openMergeRequestsLoader],
      async (
        repository: main.Repository,
        { id, openQuery, mode }: main.RepositoryOpenMergeRequestsArgs,
        { cacheKey }
      ) => {
        if (mode != "open") {
          return null;
        }
        if (!repository?.id) {
          return null;
        }
        const cachedOpenMergeRequests =
          this.requestCache.getOpenRepoMergeRequests(cacheKey, repository.id);
        if (!cachedOpenMergeRequests) {
          return null;
        }
        return this.mergeRequestService.getMergeRequestPaginatedResult(
          cachedOpenMergeRequests,
          id,
          openQuery
        );
      }
    ),

    openMergeRequestsCount: runWithHooks(
      () => [this.openMergeRequestsLoader],
      async (repository: main.Repository, _, { cacheKey }) => {
        if (!repository?.id) {
          return null;
        }
        const cachedOpenMergeRequests =
          this.requestCache.getOpenRepoMergeRequests(cacheKey, repository.id);
        if (!cachedOpenMergeRequests) {
          return null;
        }
        return cachedOpenMergeRequests.length;
      }
    ),
    closedMergeRequests: runWithHooks(
      () => [this.closedMergeRequestsLoader],
      async (
        repository: main.Repository,
        { id, closedQuery, mode }: main.RepositoryClosedMergeRequestsArgs,
        { cacheKey }
      ) => {
        if (mode != "closed") {
          return null;
        }
        if (!repository?.id) {
          return null;
        }
        const cachedClosedMergeRequests =
          this.requestCache.getClosedRepoMergeRequests(cacheKey, repository.id);
        if (!cachedClosedMergeRequests) {
          return null;
        }
        return this.mergeRequestService.getMergeRequestPaginatedResult(
          cachedClosedMergeRequests,
          id,
          closedQuery
        );
      }
    ),
    closedMergeRequestsCount: runWithHooks(
      () => [this.closedMergeRequestsLoader],
      async (repository: main.Repository, _, { cacheKey }) => {
        if (!repository?.id) {
          return null;
        }
        const cachedClosedMergeRequests =
          this.requestCache.getClosedRepoMergeRequests(cacheKey, repository.id);
        if (!cachedClosedMergeRequests) {
          return null;
        }
        return cachedClosedMergeRequests.length;
      }
    ),
    // PERMISSIONS
    anyoneCanRead: runWithHooks(
      () => [this.repositoryRemoteSettingsLoader],
      async (repository: main.Repository, _, { cacheKey, currentUser }) => {
        if (!repository?.id || !currentUser) {
          return null;
        }
        if (repository?.repoType != "org_repo") {
          return null;
        }
        const cachedRemoteSettings = this.requestCache.getRepoRemoteSettings(
          cacheKey,
          repository?.id
        );
        if (cachedRemoteSettings?.canChangeSettings) {
          return repository.anyoneCanRead ?? false;
        }
        return null;
      }
    ),
    canReadRoles: runWithHooks(
      () => [this.repositoryRemoteSettingsLoader],
      async (repository: main.Repository, _, { cacheKey, currentUser }) => {
        if (!repository?.id || !currentUser) {
          return null;
        }
        if (repository?.repoType != "org_repo") {
          return [];
        }
        const cachedRemoteSettings = this.requestCache.getRepoRemoteSettings(
          cacheKey,
          repository?.id
        );
        if (cachedRemoteSettings?.canChangeSettings) {
          const repositoryEnabledRoleSettingsContext =
            await this.contextFactory.createContext(
              RepositoryEnabledRoleSettingsContext
            );
          const enabledRoleSettings =
            await repositoryEnabledRoleSettingsContext.getAllForRepositorySetting(
              repository.id,
              "anyoneCanRead"
            );
          const roles = enabledRoleSettings?.map(
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
        return null;
      }
    ),
    canReadUsers: runWithHooks(
      () => [this.repositoryRemoteSettingsLoader],
      async (repository: main.Repository, _, { cacheKey, currentUser }) => {
        if (!repository?.id || !currentUser) {
          return null;
        }
        if (repository?.repoType != "org_repo") {
          return [];
        }
        const cachedRemoteSettings = this.requestCache.getRepoRemoteSettings(
          cacheKey,
          repository?.id
        );
        if (cachedRemoteSettings?.canChangeSettings) {
          const repositoryEnabledUserSettingsContext =
            await this.contextFactory.createContext(
              RepositoryEnabledUserSettingsContext
            );
          const enabledUserSettings =
            await repositoryEnabledUserSettingsContext.getAllForRepositorySetting(
              repository.id,
              "anyoneCanRead"
            );
          const users = enabledUserSettings?.map((s) => s.user as User);
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
        return [];
      }
    ),
    anyoneCanPushBranches: runWithHooks(
      () => [this.repositoryRemoteSettingsLoader],
      async (repository: main.Repository, _, { cacheKey, currentUser }) => {
        if (!repository?.id || !currentUser) {
          return null;
        }
        const cachedRemoteSettings = this.requestCache.getRepoRemoteSettings(
          cacheKey,
          repository?.id
        );
        if (cachedRemoteSettings?.canChangeSettings) {
          return repository.anyoneCanPushBranches ?? false;
        }
        return null;
      }
    ),
    allowExternalUsersToPush: runWithHooks(
      () => [this.repositoryRemoteSettingsLoader],
      async (repository: main.Repository, _, { cacheKey, currentUser }) => {
        if (!repository?.id || !currentUser) {
          return null;
        }
        const cachedRemoteSettings = this.requestCache.getRepoRemoteSettings(
          cacheKey,
          repository?.id
        );
        if (cachedRemoteSettings?.canChangeSettings) {
          return repository.allowExternalUsersToPush ?? false;
        }
        return null;
      }
    ),
    canPushBranchesRoles: runWithHooks(
      () => [this.repositoryRemoteSettingsLoader],
      async (repository: main.Repository, _, { cacheKey, currentUser }) => {
        if (!repository?.id || !currentUser) {
          return null;
        }
        if (repository?.repoType != "org_repo") {
          return [];
        }
        const cachedRemoteSettings = this.requestCache.getRepoRemoteSettings(
          cacheKey,
          repository?.id
        );
        if (cachedRemoteSettings?.canChangeSettings) {
          const repositoryEnabledRoleSettingsContext =
            await this.contextFactory.createContext(
              RepositoryEnabledRoleSettingsContext
            );
          const enabledRoleSettings =
            await repositoryEnabledRoleSettingsContext.getAllForRepositorySetting(
              repository.id,
              "anyoneCanPushBranches"
            );
          const roles = enabledRoleSettings?.map(
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
        return null;
      }
    ),
    canPushBranchesUsers: runWithHooks(
      () => [this.repositoryRemoteSettingsLoader, this.writeAccessIdsLoader],
      async (repository: main.Repository, _, { cacheKey, currentUser }) => {
        if (!repository?.id || !currentUser) {
          return null;
        }
        const cachedRemoteSettings = this.requestCache.getRepoRemoteSettings(
          cacheKey,
          repository?.id
        );

        const cachedWriteAccessIds =
          this.requestCache.getRepoWriteAccessIds(cacheKey, repository?.id) ??
          new Set<string>();
        if (cachedRemoteSettings?.canChangeSettings) {
          const repositoryEnabledUserSettingsContext =
            await this.contextFactory.createContext(
              RepositoryEnabledUserSettingsContext
            );
          const enabledUserSettings =
            await repositoryEnabledUserSettingsContext.getAllForRepositorySetting(
              repository.id,
              "anyoneCanPushBranches"
            );
          const users = enabledUserSettings
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
        return null;
      }
    ),
    anyoneCanWriteAnnouncements: runWithHooks(
      () => [this.repositoryRemoteSettingsLoader],
      async (repository: main.Repository, _, { cacheKey, currentUser }) => {
        if (!repository?.id || !currentUser) {
          return null;
        }
        if (repository?.repoType != "org_repo") {
          return null;
        }
        const cachedRemoteSettings = this.requestCache.getRepoRemoteSettings(
          cacheKey,
          repository?.id
        );
        if (cachedRemoteSettings?.canChangeSettings) {
          return repository.anyoneCanWriteAnnouncements ?? false;
        }
        return null;
      }
    ),
    canWriteAnnouncementsRoles: runWithHooks(
      () => [this.repositoryRemoteSettingsLoader],
      async (repository: main.Repository, _, { cacheKey, currentUser }) => {
        if (!repository?.id || !currentUser) {
          return null;
        }
        if (repository?.repoType != "org_repo") {
          return [];
        }
        const cachedRemoteSettings = this.requestCache.getRepoRemoteSettings(
          cacheKey,
          repository?.id
        );
        if (cachedRemoteSettings?.canChangeSettings) {
          const repositoryEnabledRoleSettingsContext =
            await this.contextFactory.createContext(
              RepositoryEnabledRoleSettingsContext
            );
          const enabledRoleSettings =
            await repositoryEnabledRoleSettingsContext.getAllForRepositorySetting(
              repository.id,
              "anyoneCanWriteAnnouncements"
            );
          const roles = enabledRoleSettings?.map(
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
        return null;
      }
    ),
    canWriteAnnouncementsUsers: runWithHooks(
      () => [this.repositoryRemoteSettingsLoader, this.writeAccessIdsLoader],
      async (repository: main.Repository, _, { cacheKey, currentUser }) => {
        if (!repository?.id || !currentUser) {
          return null;
        }
        const cachedRemoteSettings = this.requestCache.getRepoRemoteSettings(
          cacheKey,
          repository?.id
        );

        const cachedWriteAccessIds =
          this.requestCache.getRepoWriteAccessIds(cacheKey, repository?.id) ??
          new Set<string>();
        if (cachedRemoteSettings?.canChangeSettings) {
          const repositoryEnabledUserSettingsContext =
            await this.contextFactory.createContext(
              RepositoryEnabledUserSettingsContext
            );
          const enabledUserSettings =
            await repositoryEnabledUserSettingsContext.getAllForRepositorySetting(
              repository.id,
              "anyoneCanWriteAnnouncements"
            );
          const users = enabledUserSettings
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
        return null;
      }
    ),
    anyoneCanChangeSettings: runWithHooks(
      () => [this.repositoryRemoteSettingsLoader],
      async (repository: main.Repository, _, { cacheKey, currentUser }) => {
        if (!repository?.id || !currentUser) {
          return null;
        }
        if (repository?.repoType != "org_repo") {
          return null;
        }
        const cachedRemoteSettings = this.requestCache.getRepoRemoteSettings(
          cacheKey,
          repository?.id
        );
        if (cachedRemoteSettings?.canChangeSettings) {
          return repository.anyoneCanChangeSettings ?? false;
        }
        return null;
      }
    ),
    canChangeSettingsRoles: runWithHooks(
      () => [this.repositoryRemoteSettingsLoader],
      async (repository: main.Repository, _, { cacheKey, currentUser }) => {
        if (!repository?.id || !currentUser) {
          return null;
        }
        if (repository?.repoType != "org_repo") {
          return [];
        }
        const cachedRemoteSettings = this.requestCache.getRepoRemoteSettings(
          cacheKey,
          repository?.id
        );
        if (cachedRemoteSettings?.canChangeSettings) {
          const repositoryEnabledRoleSettingsContext =
            await this.contextFactory.createContext(
              RepositoryEnabledRoleSettingsContext
            );
          const enabledRoleSettings =
            await repositoryEnabledRoleSettingsContext.getAllForRepositorySetting(
              repository.id,
              "anyoneCanChangeSettings"
            );
          const roles = enabledRoleSettings?.map(
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
        return null;
      }
    ),
    canChangeSettingsUsers: runWithHooks(
      () => [this.repositoryRemoteSettingsLoader],
      async (repository: main.Repository, _, { cacheKey, currentUser }) => {
        if (!repository?.id || !currentUser) {
          return null;
        }
        if (repository?.repoType != "org_repo") {
          return [];
        }
        const cachedRemoteSettings = this.requestCache.getRepoRemoteSettings(
          cacheKey,
          repository?.id
        );
        if (cachedRemoteSettings?.canChangeSettings) {
          const repositoryEnabledUserSettingsContext =
            await this.contextFactory.createContext(
              RepositoryEnabledUserSettingsContext
            );
          const enabledUserSettings =
            await repositoryEnabledUserSettingsContext.getAllForRepositorySetting(
              repository.id,
              "anyoneCanChangeSettings"
            );
          const users = enabledUserSettings?.map((s) => s.user as User);
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
        return null;
      }
    ),
    repoPermissions: runWithHooks(
      () => [this.repositoryRemoteSettingsLoader],
      async (repository: main.Repository, _, { cacheKey, currentUser }) => {
        if (!repository?.id || !currentUser) {
          return null;
        }
        const cachedRemoteSettings = this.requestCache.getRepoRemoteSettings(
          cacheKey,
          repository?.id
        );
        return {
          canPushBranches: cachedRemoteSettings.canPushBranches,
          canChangeSettings: cachedRemoteSettings.canChangeSettings,
          canWriteAnnouncements: cachedRemoteSettings.canWriteAnnouncements,
        };
      }
    ),
    canTurnOffAnyoneCanRead: runWithHooks(
      () => [this.repositoryRemoteSettingsLoader],
      async (repository: main.Repository, _, { cacheKey, currentUser }) => {
        const dbRepo: Repository = repository as Repository;
        if (!repository?.id || !currentUser) {
          return null;
        }
        if (repository?.repoType != "org_repo" || !repository.isPrivate) {
          return false;
        }
        const cachedRemoteSettings = this.requestCache.getRepoRemoteSettings(
          cacheKey,
          repository?.id
        );
        if (cachedRemoteSettings?.canChangeSettings) {
          // check roles and ids
          // check user settings first
          const organizationMembersContext =
            await this.contextFactory.createContext(OrganizationMembersContext);
          const member = await organizationMembersContext.getByOrgIdAndUserId(
            dbRepo?.organizationId as string,
            currentUser.id
          );
          if (member?.membershipState != "active") {
            return false;
          }

          const organizationMemberRolesContext =
            await this.contextFactory.createContext(
              OrganizationMemberRolesContext
            );
          const memberRoles =
            await organizationMemberRolesContext.getRolesByMember(member);
          const isAdmin = !!memberRoles?.find((r) => r.presetCode == "admin");
          if (isAdmin) {
            return true;
          }
          const repositoryEnabledUserSettingsContext =
            await this.contextFactory.createContext(
              RepositoryEnabledUserSettingsContext
            );
          const enabledUserSettings =
            await repositoryEnabledUserSettingsContext.getAllForRepositorySetting(
              repository.id,
              "anyoneCanRead"
            );
          const enabledUserIds = enabledUserSettings?.map(
            (s) => s.user?.id as string
          );
          if (enabledUserIds.includes(currentUser?.id)) {
            return true;
          }

          const repositoryEnabledRoleSettingsContext =
            await this.contextFactory.createContext(
              RepositoryEnabledRoleSettingsContext
            );
          const enabledRoleSettings =
            await repositoryEnabledRoleSettingsContext.getAllForRepositorySetting(
              repository.id,
              "anyoneCanRead"
            );
          const enabledRoleIds = enabledRoleSettings.map((s) => s.roleId);

          const userRoles =
            await organizationMemberRolesContext.getRolesByMember(member);
          for (const userRole of userRoles) {
            if (enabledRoleIds.includes(userRole.id)) {
              return true;
            }
          }
          return false;
        }
        return false;
      }
    ),
    canTurnOffAnyoneCanChangeSettings: runWithHooks(
      () => [this.repositoryRemoteSettingsLoader],
      async (repository: main.Repository, _, { cacheKey, currentUser }) => {
        const dbRepo: Repository = repository as Repository;
        if (!repository?.id || !currentUser) {
          return null;
        }
        if (repository?.repoType != "org_repo") {
          return false;
        }
        const cachedRemoteSettings = this.requestCache.getRepoRemoteSettings(
          cacheKey,
          repository?.id
        );
        if (cachedRemoteSettings?.canChangeSettings) {
          // check roles and ids
          // check user settings first
          const organizationMembersContext =
            await this.contextFactory.createContext(OrganizationMembersContext);
          const member = await organizationMembersContext.getByOrgIdAndUserId(
            dbRepo?.organizationId as string,
            currentUser.id
          );
          if (member?.membershipState != "active") {
            return false;
          }

          const organizationMemberRolesContext =
            await this.contextFactory.createContext(
              OrganizationMemberRolesContext
            );
          const memberRoles =
            await organizationMemberRolesContext.getRolesByMember(member);
          const isAdmin = !!memberRoles?.find((r) => r.presetCode == "admin");
          if (isAdmin) {
            return true;
          }
          const repositoryEnabledUserSettingsContext =
            await this.contextFactory.createContext(
              RepositoryEnabledUserSettingsContext
            );
          const enabledUserSettings =
            await repositoryEnabledUserSettingsContext.getAllForRepositorySetting(
              repository.id,
              "anyoneCanChangeSettings"
            );
          const enabledUserIds = enabledUserSettings?.map(
            (s) => s.user?.id as string
          );
          if (enabledUserIds.includes(currentUser?.id)) {
            return true;
          }

          const repositoryEnabledRoleSettingsContext =
            await this.contextFactory.createContext(
              RepositoryEnabledRoleSettingsContext
            );
          const enabledRoleSettings =
            await repositoryEnabledRoleSettingsContext.getAllForRepositorySetting(
              repository.id,
              "anyoneCanChangeSettings"
            );
          const enabledRoleIds = enabledRoleSettings.map((s) => s.roleId);

          const userRoles =
            await organizationMemberRolesContext.getRolesByMember(member);
          for (const userRole of userRoles) {
            if (enabledRoleIds.includes(userRole.id)) {
              return true;
            }
          }
          return false;
        }
        return false;
      }
    ),
    protectedBranchRules: runWithHooks(
      () => [this.repositoryRemoteSettingsLoader],
      async (repository: main.Repository, _, { cacheKey, currentUser }) => {
        if (!repository?.id || !currentUser) {
          return null;
        }
        const cachedRemoteSettings = this.requestCache.getRepoRemoteSettings(
          cacheKey,
          repository?.id
        );
        if (cachedRemoteSettings?.canChangeSettings) {
          const protectedBranchRulesContext =
            await this.contextFactory.createContext(
              ProtectedBranchRulesContext
            );
          return await protectedBranchRulesContext.getProtectedBranchesForRepo(
            repository.id
          );
        }
        return null;
      }
    ),

    protectedBranchRule: runWithHooks(
      () => [this.repositoryRemoteSettingsLoader],
      async (
        repository: main.Repository,
        args: main.RepositoryProtectedBranchRuleArgs,
        { cacheKey, currentUser }
      ) => {
        if (!currentUser || !repository?.id || !args?.protectedBranchRuleId) {
          return null;
        }
        const cachedRemoteSettings = this.requestCache.getRepoRemoteSettings(
          cacheKey,
          repository?.id
        );
        if (cachedRemoteSettings?.canChangeSettings) {
          const protectedBranchRulesContext =
            await this.contextFactory.createContext(
              ProtectedBranchRulesContext
            );
          const branchRule = await protectedBranchRulesContext.getById(
            args?.protectedBranchRuleId
          );
          if (branchRule?.repositoryId != repository.id) {
            return null;
          }
          return branchRule;
        }
        return null;
      }
    ),
    enabledApiKeys: runWithHooks(
      () => [this.repositoryRemoteSettingsLoader],
      async (repository: main.Repository, _, { cacheKey, currentUser }) => {
        if (!currentUser || !repository?.id) {
          return null;
        }
        const cachedRemoteSettings = this.requestCache.getRepoRemoteSettings(
          cacheKey,
          repository?.id
        );

        const dbRepo: Repository = repository as Repository;
        if (!cachedRemoteSettings.canChangeSettings) {
          return null;
        }
        if (repository.repoType == "user_repo") {
          if (dbRepo.userId != currentUser?.id) {
            return null;
          }
        }
        if (repository.repoType == "org_repo") {
          const organizationMembersContext =
            await this.contextFactory.createContext(OrganizationMembersContext);
          const membership =
            await organizationMembersContext.getByOrgIdAndUserId(
              dbRepo.organizationId,
              currentUser.id
            );
          if (!membership || membership?.membershipState != "active") {
            return null;
          }
          const organizationMemberRolesContext =
            await this.contextFactory.createContext(
              OrganizationMemberRolesContext
            );
          const roles = await organizationMemberRolesContext.getRolesByMember(
            membership
          );
          const orgPermissions =
            this.organizationPermissionsService.calculatePermissions(
              roles ?? []
            );
          if (!orgPermissions.canModifyOrganizationDeveloperSettings) {
            return null;
          }
        }
        const repositoryEnabledApiKeysContext =
          await this.contextFactory.createContext(
            RepositoryEnabledApiKeysContext
          );
        return await repositoryEnabledApiKeysContext.getRepositoryApiKeys(
          repository.id
        );
      }
    ),

    enabledWebhookKeys: runWithHooks(
      () => [this.repositoryRemoteSettingsLoader],
      async (repository: main.Repository, _, { cacheKey, currentUser }) => {
        if (!currentUser || !repository?.id) {
          return null;
        }
        const cachedRemoteSettings = this.requestCache.getRepoRemoteSettings(
          cacheKey,
          repository?.id
        );

        const dbRepo: Repository = repository as Repository;
        if (!cachedRemoteSettings.canChangeSettings) {
          return null;
        }
        if (repository.repoType == "user_repo") {
          if (dbRepo.userId != currentUser?.id) {
            return null;
          }
        }
        if (repository.repoType == "org_repo") {
          const organizationMembersContext =
            await this.contextFactory.createContext(OrganizationMembersContext);
          const membership =
            await organizationMembersContext.getByOrgIdAndUserId(
              dbRepo.organizationId,
              currentUser.id
            );
          if (!membership || membership?.membershipState != "active") {
            return null;
          }
          const organizationMemberRolesContext =
            await this.contextFactory.createContext(
              OrganizationMemberRolesContext
            );
          const roles = await organizationMemberRolesContext.getRolesByMember(
            membership
          );
          const orgPermissions =
            this.organizationPermissionsService.calculatePermissions(
              roles ?? []
            );
          if (!orgPermissions.canModifyOrganizationDeveloperSettings) {
            return null;
          }
        }
        const repositoryEnabledWebhookKeysContext =
          await this.contextFactory.createContext(
            RepositoryEnabledWebhookKeysContext
          );
        return await repositoryEnabledWebhookKeysContext.getRepositoryWebhookKeys(
          repository.id
        );
      }
    ),
    isBookmarked: runWithHooks(
      () => [],
      async (repository, _, context) => {
        if (!repository?.id || !context?.currentUser?.id) {
          return null;
        }
        const cachedIsBookmarked = this.requestCache.getIsBookmarked(
          context.cacheKey,
          repository.id
        );
        if (cachedIsBookmarked !== undefined) {
          return cachedIsBookmarked;
        }

        const repoBookmarksContext = await this.contextFactory.createContext(
          RepoBookmarksContext
        );
        const existingBookmark =
          await repoBookmarksContext.getByUserIdAndRepoId(
            context?.currentUser?.id,
            repository.id
          );
        const isBookmarked = !!existingBookmark;
        this.requestCache.setIsBookmarked(
          context.cacheKey,
          repository.id,
          isBookmarked
        );

        return isBookmarked;
      }
    ),

    isSubscribed: runWithHooks(
      () => [],
      async (repository, _, context) => {
        if (!repository?.id || !context?.currentUser?.id) {
          return null;
        }
        const cachedIsBookmarked = this.requestCache.getIsSubscribed(
          context.cacheKey,
          repository.id
        );
        if (cachedIsBookmarked !== undefined) {
          return cachedIsBookmarked;
        }

        const repoSubscriptionsContext =
          await this.contextFactory.createContext(RepoSubscriptionsContext);
        const existingSubscription =
          await repoSubscriptionsContext.getByUserIdAndRepoId(
            context?.currentUser?.id,
            repository.id
          );
        const isSubscribed = !!existingSubscription;
        this.requestCache.setIsSubscribed(
          context.cacheKey,
          repository.id,
          isSubscribed
        );
        return isSubscribed;
      }
    ),
  };

  public CommitInfo: main.CommitInfoResolvers = {
    kvLink: runWithHooks(
      () => [this.commitInfoRepositoryLoader],
      async (commitInfo: main.CommitInfo, _, { cacheKey }) => {
        if (!commitInfo.repositoryId) {
          return null;
        }
        const cachedRepo = this.requestCache.getRepo(
          cacheKey,
          commitInfo.repositoryId
        );
        if (!cachedRepo) {
          return null;
        }

        return this.repoDataService.getKVLinkForCommit(
          cachedRepo,
          commitInfo as Commit
        );
      }
    ),
    stateLink: runWithHooks(
      () => [this.commitInfoRepositoryLoader],
      async (commitInfo: main.CommitInfo, _, { cacheKey }) => {
        if (!commitInfo.repositoryId) {
          return null;
        }
        const cachedRepo = this.requestCache.getRepo(
          cacheKey,
          commitInfo.repositoryId
        );
        if (!cachedRepo) {
          return null;
        }

        return this.repoDataService.getStateLinkForCommit(
          cachedRepo,
          commitInfo as Commit
        );
      }
    ),
  };

  public CommitState: main.CommitStateResolvers = {
    binaryRefs: runWithHooks(
      () => [this.commitStateBinaryRefsLoader],
      async (commitState: main.CommitState, _, { cacheKey }) => {
        if (!commitState?.repositoryId || !commitState?.sha) {
          return [];
        }
        const cachedBinaryRefs = this.requestCache.getCommitStateBinaryRefs(
          cacheKey,
          commitState?.repositoryId,
          commitState?.sha
        );
        if (!cachedBinaryRefs) {
          return [];
        }
        return cachedBinaryRefs;
      }
    ),
    pluginVersions: runWithHooks(
      () => [this.commitStatePluginVersionsLoader],
      async (commitState: main.CommitState, _, { cacheKey }) => {
        if (!commitState?.repositoryId || !commitState?.sha) {
          return null;
        }
        const cachedPluginVersions =
          this.requestCache.getCommitStatePluginVersions(
            cacheKey,
            commitState?.repositoryId,
            commitState?.sha
          );
        if (cachedPluginVersions) {
          return cachedPluginVersions;
        }
        return [];
      }
    ),
    canAutoFix: runWithHooks(
      () => [
        this.repositoryRemoteSettingsLoader,
        this.commitStateDatasourceLoader,
      ],
      async (commitState: main.CommitState, _, { cacheKey, currentUser }) => {
        if (!commitState?.repositoryId || !currentUser) {
          return null;
        }
        const cachedRemoteSettings = this.requestCache.getRepoRemoteSettings(
          cacheKey,
          commitState?.repositoryId
        );
        const userBranchRule = cachedRemoteSettings.branchRules?.find(
          (rule) => rule.branchId == commitState.branchId
        );
        if (userBranchRule) {
          if (!userBranchRule?.canAutofix) {
            return false;
          }
        }
        if (!commitState.sha) {
          return false;
        }
        if (commitState.isReverted) {
          return false;
        }

        const cachedDataSource = this.requestCache.getCommitStateDatasource(
          cacheKey,
          commitState.repositoryId as string,
          commitState.sha
        );
        if (!cachedDataSource) {
          return false;
        }
        return await getCanAutofixReversionIfNotWIP(
          cachedDataSource,
          commitState.repositoryId,
          commitState.sha,
          currentUser as any
        );
      }
    ),
    canRevert: runWithHooks(
      () => [
        this.repositoryRemoteSettingsLoader,
        this.commitStateDatasourceLoader,
      ],
      async (commitState: main.CommitState, _, { cacheKey, currentUser }) => {
        if (!commitState?.repositoryId || !currentUser) {
          return null;
        }
        const cachedRemoteSettings = this.requestCache.getRepoRemoteSettings(
          cacheKey,
          commitState?.repositoryId
        );
        const userBranchRule = cachedRemoteSettings.branchRules?.find(
          (rule) => rule.branchId == commitState.branchId
        );
        if (userBranchRule) {
          if (!userBranchRule?.canRevert) {
            return false;
          }
        }
        if (!commitState.sha) {
          return false;
        }
        if (commitState.isReverted) {
          return false;
        }

        const cachedDataSource = this.requestCache.getCommitStateDatasource(
          cacheKey,
          commitState.repositoryId as string,
          commitState.sha
        );
        if (!cachedDataSource) {
          return false;
        }
        return await getCanRevert(
          cachedDataSource,
          commitState.repositoryId,
          commitState.sha,
          currentUser as any
        );
      }
    ),
  };

  public BranchState: main.BranchStateResolvers = {
    proposedMergeRequest: runWithHooks(
      () => [this.repositoryRemoteSettingsLoader, this.repositoryCommitsLoader],
      async (
        branchState: main.BranchState,
        { idx }: main.BranchStateProposedMergeRequestArgs,
        { cacheKey, currentUser }
      ) => {
        if (!branchState.repositoryId) {
          return null;
        }
        if (!currentUser?.id) {
          return null;
        }
        const repository = await this.repositoryService.getRepository(
          branchState.repositoryId
        );
        if (!repository) {
          return null;
        }
        const cachedBranches = this.requestCache.getRepoBranches(
          cacheKey,
          repository.id
        );
        const cachedCommits = this.requestCache.getRepoCommits(
          cacheKey,
          branchState.repositoryId
        );

        const commitMap: { [key: string]: Commit } = {};
        for (let i = 0; i < cachedCommits.length; ++i) {
          const commit = cachedCommits[i];
          commitMap[commit.sha as string] = commit;
        }

        const cachedRemoteSettings = this.requestCache.getRepoRemoteSettings(
          cacheKey,
          branchState.repositoryId
        );

        const branch = cachedBranches?.find(
          (b) => b.id == branchState.branchId
        );
        if (!branch?.lastCommit) {
          return null;
        }
        const baseBranch = cachedBranches?.find(
          (b) => b.id == branchState.baseBranchId
        );
        if (!baseBranch) {
          return null;
        }
        const baseBranchRule = cachedRemoteSettings?.branchRules?.find(
          (b) => b.branchId == baseBranch?.id
        );
        const canCreateMergeRequest =
          baseBranchRule?.canCreateMergeRequests ?? true;

        const datasource =
          await this.mergeRequestService.getMergeRequestDataSourceForBaseBranch(
            repository,
            branch,
            baseBranch
          );
        const divergenceOrigin = await getDivergenceOrigin(
          datasource,
          repository.id,
          baseBranch?.lastCommit ?? undefined,
          branch?.lastCommit ?? undefined
        );
        const divergenceSha: string = getMergeOriginSha(
          divergenceOrigin
        ) as string;

        const isMerged =
          divergenceOrigin?.rebaseShas?.length == 0 &&
          baseBranch?.lastCommit != null &&
          !!branch?.lastCommit &&
          (divergenceOrigin?.intoLastCommonAncestor == branch?.lastCommit ||
            divergenceOrigin?.trueOrigin == baseBranch?.lastCommit);
        let isConflictFree =
          isMerged || divergenceSha === baseBranch?.lastCommit;
        if (!isConflictFree) {
          const divergenceState =
            (await datasource.readCommitApplicationState?.(
              repository.id,
              divergenceSha
            )) ?? (EMPTY_COMMIT_STATE as ApplicationKVState);
          const branchState =
            (await datasource.readCommitApplicationState?.(
              repository.id,
              branch?.lastCommit as string
            )) ?? (EMPTY_COMMIT_STATE as ApplicationKVState);
          const baseBranchState =
            (await datasource.readCommitApplicationState?.(
              repository.id,
              baseBranch?.lastCommit as string
            )) ?? (EMPTY_COMMIT_STATE as ApplicationKVState);
          const canAutoMerge = await canAutoMergeCommitStates(
            datasource,
            branchState,
            baseBranchState,
            divergenceState
          );
          if (canAutoMerge) {
            isConflictFree = true;
          }
        }
        const rebaseList = await getMergeRebaseCommitList(
          datasource,
          repository.id,
          branch?.lastCommit ?? null,
          currentUser as FloroUser,
          false
        );

        const history = this.repoDataService.getCommitHistory(
          cachedCommits,
          branch?.lastCommit
        );
        const ranges = this.repoDataService.getRevertRanges(history);
        const allPendingCommits =
          rebaseList.length == 0
            ? this.repositoryDatasourceFactoryService
                .getCommitsInRange(
                  cachedCommits,
                  branch?.lastCommit,
                  divergenceOrigin.fromOrigin ?? undefined
                )
                ?.map((c: CommitData | Commit) => commitMap[c.sha as string])
            : rebaseList
                ?.map(
                  (c: CommitData | Commit) => commitMap[c.originalSha as string]
                )
                .sort((a, b) => b.idx - a.idx);

        let pendingCommits: Array<CommitInfo>;
        if (idx === undefined || idx === null) {
          pendingCommits = allPendingCommits
            ?.slice(0, PAGINATION_LIMIT)
            .map((commit) => {
              return {
                ...commit,
                isReverted: this.repoDataService.isReverted(ranges, commit.idx),
              };
            });
        } else {
          const startIdx = idx;
          pendingCommits = allPendingCommits
            .slice(startIdx, startIdx + PAGINATION_LIMIT)
            .map((commit) => {
              return {
                ...commit,
                isReverted: this.repoDataService.isReverted(ranges, commit.idx),
              };
            });
        }

        const canMerge = isConflictFree && !isMerged;
        const divergeCommit = divergenceOrigin
          ? commitMap[divergenceSha]
          : null;
        const mergeRequest =
          this.mergeRequestService.getExistingMergeRequestByBranch(
            repository.id,
            branch.id
          );
        const suggestedTitle = branch?.name ?? "";
        const suggestedDescription =
          allPendingCommits[allPendingCommits.length - 1]?.message ?? "";

        const divergenceState = divergeCommit
          ? {
              sha: divergeCommit.sha,
              originalSha: divergeCommit.originalSha,
              message: divergeCommit.message,
              username: divergeCommit.username,
              userId: divergeCommit.userId,
              authorUsername: divergeCommit.authorUsername,
              authorUserId: divergeCommit.authorUserId,
              authorUser: divergeCommit.authorUser,
              user: divergeCommit.user,
              idx: divergeCommit.idx,
              updatedAt: divergeCommit.updatedAt,
              repositoryId: branchState.repositoryId,
              branchId: branchState.branchId,
              branchHead: branchState.branchHead,
              isReverted: this.repoDataService.isReverted(
                ranges,
                divergeCommit.idx
              ),
              isValid: divergeCommit.isValid ?? true,
              kvLink: this.repoDataService.getKVLinkForCommit(
                repository,
                divergeCommit
              ),
              stateLink: this.repoDataService.getStateLinkForCommit(
                repository,
                divergeCommit
              ),
              lastUpdatedAt: divergeCommit?.updatedAt?.toISOString(),
            }
          : null;
        return {
          suggestedTitle,
          suggestedDescription,
          mergeRequest,
          baseBranch,
          isConflictFree,
          isMerged,
          canMerge,
          canCreateMergeRequest,
          pendingCommits,
          divergenceState,
          pendingCommitsCount: allPendingCommits.length,
        };
      }
    ),
    commitState: runWithHooks(
      () => [this.repositoryCommitsLoader, this.repositoryRevertRangesLoader],
      async (
        branchState: main.BranchState,
        { sha }: main.BranchStateCommitStateArgs,
        { cacheKey }
      ) => {
        if (!branchState.repositoryId) {
          return null;
        }
        const cachedCommits = this.requestCache.getRepoCommits(
          cacheKey,
          branchState.repositoryId
        );
        const branchHeadCommit = cachedCommits.find(
          (c) => c.sha == branchState?.branchHead
        );
        const branchHistory = this.repoDataService.getCommitHistory(
          cachedCommits,
          branchState?.branchHead ?? ""
        );
        let commit: Commit | null | undefined = branchHistory.find(
          (c) => c.sha == sha
        );
        if (!commit) {
          if (branchState.noIdPresent && sha) {
            const commitsContext = await this.contextFactory.createContext(
              CommitsContext
            );
            commit = await commitsContext.getCommitBySha(
              branchState.repositoryId,
              sha
            );
            if (!commit) {
              return null;
            }
            const repository = await this.repositoryService.getRepository(
              branchState.repositoryId
            );
            if (!repository) {
              return null;
            }
            const kvLink = this.repoDataService.getKVLinkForCommit(
              repository,
              commit
            );
            const stateLink = this.repoDataService.getStateLinkForCommit(
              repository,
              commit
            );

            return {
              sha: commit.sha,
              originalSha: commit.originalSha,
              message: commit.message,
              username: commit.username,
              userId: commit.userId,
              authorUsername: commit.authorUsername,
              authorUserId: commit.authorUserId,
              authorUser: commit.authorUser,
              user: commit.user,
              idx: commit.idx,
              updatedAt: commit.updatedAt,
              repositoryId: branchState.repositoryId,
              branchId: branchState.branchId,
              branchHead: branchState.branchHead,
              isReverted: false,
              isValid: commit.isValid ?? true,
              kvLink,
              stateLink,
              lastUpdatedAt: commit?.updatedAt?.toISOString(),
              isOffBranch: true,
            };
          }
          if (branchHeadCommit) {
            commit = branchHeadCommit;
          }
          if (!commit) {
            return null;
          }
        }
        const repository = await this.repositoryService.getRepository(
          branchState.repositoryId
        );
        if (!repository) {
          return null;
        }
        const kvLink = this.repoDataService.getKVLinkForCommit(
          repository,
          commit
        );
        const stateLink = this.repoDataService.getStateLinkForCommit(
          repository,
          commit
        );

        const revertRanges = this.requestCache.getRepoRevertRanges(
          cacheKey,
          branchState?.repositoryId as string,
          branchState?.branchHead as string
        );

        return {
          sha: commit.sha,
          originalSha: commit.originalSha,
          message: commit.message,
          username: commit.username,
          userId: commit.userId,
          authorUsername: commit.authorUsername,
          authorUserId: commit.authorUserId,
          authorUser: commit.authorUser,
          user: commit.user,
          idx: commit.idx,
          updatedAt: commit.updatedAt,
          repositoryId: branchState.repositoryId,
          branchId: branchState.branchId,
          branchHead: branchState.branchHead,
          isReverted: this.repoDataService.isReverted(
            revertRanges,
            commit?.idx
          ),
          isValid: commit.isValid ?? true,
          kvLink,
          stateLink,
          lastUpdatedAt: commit?.updatedAt?.toISOString(),
          isOffBranch: false,
        };
      }
    ),
    commitsSize: runWithHooks(
      () => [this.repositoryCommitHistoryLoader],
      async (branchState: main.BranchState, _, { cacheKey }) => {
        const commitHistory = this.requestCache.getRepoCommitHistory(
          cacheKey,
          branchState?.repositoryId as string,
          branchState?.branchHead as string
        );
        if (commitHistory) {
          return commitHistory?.length;
        }
        return 0;
      }
    ),
    commits: runWithHooks(
      () => [
        this.repositoryCommitHistoryLoader,
        this.repositoryRevertRangesLoader,
      ],
      async (
        branchState: main.BranchState,
        { idx, searchQuery }: main.BranchStateCommitsArgs,
        { cacheKey }
      ) => {
        if ((searchQuery ?? "")?.trim()?.length > 0) {
          return [];
        }
        const commitHistory = this.requestCache.getRepoCommitHistory(
          cacheKey,
          branchState?.repositoryId as string,
          branchState?.branchHead as string
        );

        const revertRanges = this.requestCache.getRepoRevertRanges(
          cacheKey,
          branchState?.repositoryId as string,
          branchState?.branchHead as string
        );
        if (commitHistory) {
          if (idx === undefined || idx === null) {
            return commitHistory?.slice(0, PAGINATION_LIMIT).map((commit) => {
              return {
                ...commit,
                isReverted: this.repoDataService.isReverted(
                  revertRanges,
                  commit.idx
                ),
              };
            });
          }
          if (idx >= commitHistory.length) {
            return [];
          }
          const startIdx = commitHistory.length - 1 - idx;
          return commitHistory
            .slice(startIdx, startIdx + PAGINATION_LIMIT)
            .map((commit) => {
              return {
                ...commit,
                isReverted: this.repoDataService.isReverted(
                  revertRanges,
                  commit.idx
                ),
              };
            });
        }
        return [];
      }
    ),
    commitSearch: runWithHooks(
      () => [
        this.repositoryCommitHistoryLoader,
        this.repositoryRevertRangesLoader,
      ],
      async (
        branchState: main.BranchState,
        { searchQuery }: main.BranchStateCommitSearchArgs,
        { cacheKey }
      ) => {
        const commitHistory = this.requestCache.getRepoCommitHistory(
          cacheKey,
          branchState?.repositoryId as string,
          branchState?.branchHead as string
        );
        const revertRanges = this.requestCache.getRepoRevertRanges(
          cacheKey,
          branchState?.repositoryId as string,
          branchState?.branchHead as string
        );
        if (commitHistory) {
          if ((searchQuery ?? "")?.trim() == "") {
            return [];
          }
          const results = commitHistory?.filter((commit) => {
            if ((searchQuery?.length ?? 0) > 2) {
              if (commit?.sha?.startsWith(searchQuery?.toLowerCase() ?? "")) {
                return true;
              }
            }
            if (searchQuery?.startsWith("@")) {
              if (
                ("@" + commit?.username?.toLowerCase())?.indexOf(
                  searchQuery?.toLowerCase() ?? ""
                ) != -1 ||
                ("@" + commit?.authorUsername?.toLowerCase())?.indexOf(
                  searchQuery?.toLowerCase() ?? ""
                ) != -1
              ) {
                return true;
              }
            }
            if (
              (searchQuery?.length ?? 0) > 2 &&
              commit?.message
                ?.toLowerCase()
                ?.indexOf(searchQuery?.toLowerCase() ?? "") != -1
            ) {
              return true;
            }
            return false;
          });
          return results?.slice(0, PAGINATION_LIMIT).map((commit) => {
            return {
              ...commit,
              isReverted: this.repoDataService.isReverted(
                revertRanges,
                commit.idx
              ),
            };
          });
        }
        return [];
      }
    ),
    canDelete: runWithHooks(
      () => [
        this.branchStateRepositoryLoader,
        this.repositoryRemoteSettingsLoader,
      ],
      async (branchState: main.BranchState, _, { cacheKey, currentUser }) => {
        if (!currentUser) {
          return false;
        }
        if (!branchState.repositoryId) {
          return false;
        }

        const cachedRemoteSettings = this.requestCache.getRepoRemoteSettings(
          cacheKey,
          branchState.repositoryId
        );
        if (!cachedRemoteSettings?.canPushBranches) {
          return false;
        }

        const repository = this.requestCache.getRepo(
          cacheKey,
          branchState.repositoryId
        );
        if (!repository) {
          return false;
        }
        const cachedBranches = this.requestCache.getRepoBranches(
          cacheKey,
          repository.id
        );
        const floroBranch = cachedBranches.find(
          (b) => b.id == branchState.branchId
        );
        if (!floroBranch) {
          return false;
        }
        const branchRuleSettings = cachedRemoteSettings?.branchRules?.find(
          (br) => br.branchId == floroBranch.id
        );
        if (branchRuleSettings) {
          return false;
        }
        return await this.branchService.canDeleteBranch(
          repository,
          floroBranch
        );
      }
    ),
    canMergeDirectly: runWithHooks(
      () => [
        this.branchStateRepositoryLoader,
        this.repositoryRemoteSettingsLoader,
      ],
      async (branchState: main.BranchState, _, { cacheKey, currentUser }) => {
        if (!currentUser) {
          return false;
        }
        if (!branchState.repositoryId) {
          return false;
        }

        const cachedRemoteSettings = this.requestCache.getRepoRemoteSettings(
          cacheKey,
          branchState.repositoryId
        );
        if (!cachedRemoteSettings?.canPushBranches) {
          return false;
        }

        const repository = this.requestCache.getRepo(
          cacheKey,
          branchState.repositoryId
        );
        if (!repository) {
          return false;
        }

        const cachedBranches = this.requestCache.getRepoBranches(
          cacheKey,
          repository.id
        );
        const floroBranch = cachedBranches.find(
          (b) => b.id == branchState.branchId
        );
        if (!floroBranch) {
          return false;
        }
        if (floroBranch.id == repository.defaultBranchId) {
          return false;
        }
        const baseBranch = cachedBranches.find(
          (b) => b.id == floroBranch.baseBranchId
        );
        if (!baseBranch) {
          return false;
        }

        const mergeRequestsContext = await this.contextFactory.createContext(
          MergeRequestsContext
        );

        const branchHasOpenRequest =
          await mergeRequestsContext.repoHasOpenRequestOnBranch(
            repository.id,
            floroBranch.id
          );
        if (branchHasOpenRequest) {
          return false;
        }
        const branchRuleSettings = cachedRemoteSettings?.branchRules?.find(
          (br) => br.branchId == baseBranch.id
        );
        if (branchRuleSettings && branchRuleSettings?.requiresApprovalToMerge) {
          return false;
        }
        const branchesContext = await this.contextFactory.createContext(
          BranchesContext
        );
        const remoteBranch = await branchesContext.getByRepoAndBranchId(
          repository.id,
          floroBranch?.id
        );
        return (!remoteBranch?.isMerged &&
          (remoteBranch?.isConflictFree ?? false)) as boolean;
      }
    ),
    hasOpenMergeRequest: runWithHooks(
      () => [this.branchStateRepositoryLoader],
      async (branchState: main.BranchState, _, { cacheKey, currentUser }) => {
        if (!currentUser) {
          return false;
        }
        if (!branchState.repositoryId) {
          return false;
        }

        const repository = this.requestCache.getRepo(
          cacheKey,
          branchState.repositoryId
        );
        if (!repository) {
          return false;
        }

        const cachedBranches = this.requestCache.getRepoBranches(
          cacheKey,
          repository.id
        );
        const floroBranch = cachedBranches.find(
          (b) => b.id == branchState.branchId
        );
        if (!floroBranch) {
          return false;
        }
        const mergeRequestsContext = await this.contextFactory.createContext(
          MergeRequestsContext
        );

        const branchHasOpenRequest =
          await mergeRequestsContext.repoHasOpenRequestOnBranch(
            repository.id,
            floroBranch.id
          );
        return branchHasOpenRequest;
      }
    ),

    openMergeRequest: runWithHooks(
      () => [this.branchStateRepositoryLoader],
      async (branchState: main.BranchState, _, { cacheKey, currentUser }) => {
        if (!currentUser) {
          return null;
        }
        if (!branchState.repositoryId) {
          return null;
        }

        const repository = this.requestCache.getRepo(
          cacheKey,
          branchState.repositoryId
        );
        if (!repository) {
          return null;
        }

        const cachedBranches = this.requestCache.getRepoBranches(
          cacheKey,
          repository.id
        );
        const floroBranch = cachedBranches.find(
          (b) => b.id == branchState.branchId
        );
        if (!floroBranch) {
          return null;
        }
        const mergeRequestsContext = await this.contextFactory.createContext(
          MergeRequestsContext
        );

        const branchHasOpenRequest =
          await mergeRequestsContext.repoHasOpenRequestOnBranch(
            repository.id,
            floroBranch.id
          );
        if (!branchHasOpenRequest) {
          return null;
        }
        return await mergeRequestsContext?.getOpenMergeRequestByBranchNameAndRepo(
          repository.id,
          floroBranch.id
        );
      }
    ),
    showMergeAndDeleteOptions: runWithHooks(
      () => [
        this.branchStateRepositoryLoader,
        this.repositoryRemoteSettingsLoader,
      ],
      async (branchState: main.BranchState, _, { cacheKey, currentUser }) => {
        if (!currentUser) {
          return false;
        }
        if (!branchState.repositoryId) {
          return false;
        }

        const cachedRemoteSettings = this.requestCache.getRepoRemoteSettings(
          cacheKey,
          branchState.repositoryId
        );
        if (!cachedRemoteSettings?.canPushBranches) {
          return false;
        }

        const repository = this.requestCache.getRepo(
          cacheKey,
          branchState.repositoryId
        );
        if (!repository) {
          return false;
        }

        const cachedBranches = this.requestCache.getRepoBranches(
          cacheKey,
          repository.id
        );
        const floroBranch = cachedBranches.find(
          (b) => b.id == branchState.branchId
        );
        if (!floroBranch) {
          return false;
        }
        if (floroBranch.id == repository.defaultBranchId) {
          return false;
        }
        const branchRuleSettings = cachedRemoteSettings?.branchRules?.find(
          (br) => br.branchId == floroBranch.id
        );
        if (branchRuleSettings && branchRuleSettings?.requiresApprovalToMerge) {
          return false;
        }
        return true;
      }
    ),
  };

  public Query: main.QueryResolvers = {
    fetchRepositoryById: runWithHooks(
      () => [],
      async (
        _,
        { id }: main.QueryFetchRepositoryByIdArgs,
        { cacheKey, currentUser }
      ) => {
        const repository = await this.repoDataService.fetchRepoById(id);
        if (!repository?.isPrivate) {
          // cache repo
          return {
            __typename: "FetchRepositorySuccess",
            repository,
          };
        }
        if (!currentUser) {
          return {
            __typename: "FetchRepositoryError",
            type: "REPO_ERROR",
            message: "Repo error",
          };
        }
        if (
          repository?.repoType == "user_repo" &&
          currentUser?.id == repository?.userId
        ) {
          return {
            __typename: "FetchRepositorySuccess",
            repository,
          };
        }

        if (
          repository?.repoType == "user_repo" &&
          currentUser?.id != repository?.userId
        ) {
          return {
            __typename: "FetchRepositoryError",
            type: "REPO_ERROR",
            message: "Repo error",
          };
        }
        const organizationMembersContext =
          await this.contextFactory.createContext(OrganizationMembersContext);
        const member = await organizationMembersContext.getByOrgIdAndUserId(
          repository.organizationId as string,
          currentUser.id
        );
        if (member?.membershipState == "active") {
          if (!repository.anyoneCanRead) {
            const organizationMemberRolesContext =
              await this.contextFactory.createContext(
                OrganizationMemberRolesContext
              );
            const memberRoles =
              await organizationMemberRolesContext.getRolesByMember(member);
            const isAdmin = !!memberRoles?.find((r) => r.presetCode == "admin");
            if (isAdmin) {
              return {
                __typename: "FetchRepositorySuccess",
                repository,
              };
            }
            const roleIds = memberRoles?.map((r) => r.id);
            const repositoryEnabledRoleSettingsContext =
              await this.contextFactory.createContext(
                RepositoryEnabledRoleSettingsContext
              );

            const repositoryEnabledUserSettingsContext =
              await this.contextFactory.createContext(
                RepositoryEnabledUserSettingsContext
              );
            const hasUserPermission =
              await repositoryEnabledUserSettingsContext.hasRepoUserId(
                repository.id,
                currentUser.id,
                "anyoneCanRead"
              );
            if (!hasUserPermission) {
              const hasRoles =
                await repositoryEnabledRoleSettingsContext.hasRepoRoleIds(
                  repository.id,
                  roleIds,
                  "anyoneCanRead"
                );
              if (!hasRoles) {
                return {
                  __typename: "FetchRepositoryError",
                  type: "REPO_ERROR",
                  message: "Repo error",
                };
              }
            }
          }
          return {
            __typename: "FetchRepositorySuccess",
            repository,
          };
        }
        return {
          __typename: "FetchRepositoryError",
          type: "REPO_ERROR",
          message: "Repo error",
        };
      }
    ),
    fetchRepositoryByName: runWithHooks(
      () => [],
      async (
        _,
        { repoName, ownerHandle }: main.QueryFetchRepositoryByNameArgs,
        { cacheKey, currentUser }
      ) => {
        const repository = await this.repoDataService.fetchRepoByName(
          ownerHandle ?? "",
          repoName ?? ""
        );
        if (!repository?.isPrivate) {
          // cache repo
          return {
            __typename: "FetchRepositorySuccess",
            repository,
          };
        }
        if (!currentUser) {
          return {
            __typename: "FetchRepositoryError",
            type: "REPO_ERROR",
            message: "Repo error",
          };
        }
        if (
          repository?.repoType == "user_repo" &&
          currentUser?.id == repository?.userId
        ) {
          return {
            __typename: "FetchRepositorySuccess",
            repository,
          };
        }

        if (
          repository?.repoType == "user_repo" &&
          currentUser?.id != repository?.userId
        ) {
          return {
            __typename: "FetchRepositoryError",
            type: "REPO_ERROR",
            message: "Repo error",
          };
        }
        const organizationMembersContext =
          await this.contextFactory.createContext(OrganizationMembersContext);
        const member = await organizationMembersContext.getByOrgIdAndUserId(
          repository.organizationId as string,
          currentUser.id
        );
        if (member?.membershipState == "active") {
          if (!repository.anyoneCanRead) {
            const organizationMemberRolesContext =
              await this.contextFactory.createContext(
                OrganizationMemberRolesContext
              );
            const memberRoles =
              await organizationMemberRolesContext.getRolesByMember(member);
            const isAdmin = !!memberRoles?.find((r) => r.presetCode == "admin");
            if (isAdmin) {
              return {
                __typename: "FetchRepositorySuccess",
                repository,
              };
            }
            const roleIds = memberRoles?.map((r) => r.id);
            const repositoryEnabledRoleSettingsContext =
              await this.contextFactory.createContext(
                RepositoryEnabledRoleSettingsContext
              );

            const repositoryEnabledUserSettingsContext =
              await this.contextFactory.createContext(
                RepositoryEnabledUserSettingsContext
              );
            const hasUserPermission =
              await repositoryEnabledUserSettingsContext.hasRepoUserId(
                repository.id,
                currentUser.id,
                "anyoneCanRead"
              );
            if (!hasUserPermission) {
              const hasRoles =
                await repositoryEnabledRoleSettingsContext.hasRepoRoleIds(
                  repository.id,
                  roleIds,
                  "anyoneCanRead"
                );
              if (!hasRoles) {
                return {
                  __typename: "FetchRepositoryError",
                  type: "REPO_ERROR",
                  message: "Repo error",
                };
              }
            }
          }
          return {
            __typename: "FetchRepositorySuccess",
            repository,
          };
        }
        return {
          __typename: "FetchRepositoryError",
          type: "REPO_ERROR",
          message: "Repo error",
        };
      }
    ),
    searchUsersForRepoSettingsAccess: runWithHooks(
      () => [this.loggedInUserGuard],
      async (
        _,
        args: main.QuerySearchUsersForRepoSettingsAccessArgs,
        { currentUser }
      ) => {
        const repository = await this.repoDataService.fetchRepoById(
          args.repositoryId
        );
        if (!repository) {
          return null;
        }
        const remoteSettings =
          await this.repoDataService.fetchRepoSettingsForUser(
            args.repositoryId,
            currentUser
          );
        if (!remoteSettings?.canChangeSettings) {
          return {
            __typename: "SearchUsersForSettingError",
            type: "REPO_ERROR",
            message: "Repo error",
          };
        }
        const excludedUserIds: Array<string> = (args?.excludedUserIds ??
          []) as Array<string>;
        const query: string = args?.query ?? "";
        const result =
          await this.repoSettingsService.searchUsersForRepoCanAdjustRepoSettings(
            repository as Repository,
            query,
            excludedUserIds
          );
        if (!result) {
          return {
            __typename: "SearchUsersForSettingError",
            type: "REPO_ERROR",
            message: "Repo error",
          };
        }
        return {
          __typename: "SearchUsersForSettingSuccess",
          users: result,
        };
      }
    ),

    searchUsersForRepoReadAccess: runWithHooks(
      () => [this.loggedInUserGuard],
      async (
        _,
        args: main.QuerySearchUsersForRepoReadAccessArgs,
        { currentUser }
      ) => {
        const repository = await this.repoDataService.fetchRepoById(
          args.repositoryId
        );
        if (!repository) {
          return null;
        }
        const remoteSettings =
          await this.repoDataService.fetchRepoSettingsForUser(
            args.repositoryId,
            currentUser
          );
        if (!remoteSettings?.canChangeSettings) {
          return {
            __typename: "SearchUsersForSettingError",
            type: "REPO_ERROR",
            message: "Repo error",
          };
        }
        const excludedUserIds: Array<string> = (args?.excludedUserIds ??
          []) as Array<string>;
        const query: string = args?.query ?? "";
        const result =
          await this.repoSettingsService.searchUsersForRepoReadAccess(
            repository as Repository,
            query,
            excludedUserIds
          );
        if (!result) {
          return {
            __typename: "SearchUsersForSettingError",
            type: "REPO_ERROR",
            message: "Repo error",
          };
        }
        return {
          __typename: "SearchUsersForSettingSuccess",
          users: result,
        };
      }
    ),

    searchUsersForRepoPushAccess: runWithHooks(
      () => [this.loggedInUserGuard],
      async (
        _,
        args: main.QuerySearchUsersForRepoReadAccessArgs,
        { currentUser }
      ) => {
        const repository = await this.repoDataService.fetchRepoById(
          args.repositoryId
        );
        if (!repository) {
          return null;
        }
        const remoteSettings =
          await this.repoDataService.fetchRepoSettingsForUser(
            args.repositoryId,
            currentUser
          );
        if (!remoteSettings?.canChangeSettings) {
          return {
            __typename: "SearchUsersForSettingError",
            type: "REPO_ERROR",
            message: "Repo error",
          };
        }
        const excludedUserIds: Array<string> = (args?.excludedUserIds ??
          []) as Array<string>;
        const query: string = args?.query ?? "";
        const result =
          await this.repoSettingsService.searchUsersForRepoPushAccess(
            repository as Repository,
            query,
            excludedUserIds
          );
        if (!result) {
          return {
            __typename: "SearchUsersForSettingError",
            type: "REPO_ERROR",
            message: "Repo error",
          };
        }
        return {
          __typename: "SearchUsersForSettingSuccess",
          users: result,
        };
      }
    ),

    searchUsersForProtectedBranchAccess: runWithHooks(
      () => [this.loggedInUserGuard],
      async (
        _,
        args: main.QuerySearchUsersForRepoReadAccessArgs,
        { currentUser }
      ) => {
        const repository = await this.repoDataService.fetchRepoById(
          args.repositoryId
        );
        if (!repository) {
          return null;
        }
        const remoteSettings =
          await this.repoDataService.fetchRepoSettingsForUser(
            args.repositoryId,
            currentUser
          );
        if (!remoteSettings?.canChangeSettings) {
          return {
            __typename: "SearchUsersForSettingError",
            type: "REPO_ERROR",
            message: "Repo error",
          };
        }
        const excludedUserIds: Array<string> = (args?.excludedUserIds ??
          []) as Array<string>;
        const query: string = args?.query ?? "";
        const result =
          await this.repoSettingsService.searchUsersForRepoProtectedBranchSettingAccess(
            repository as Repository,
            query,
            excludedUserIds
          );
        if (!result) {
          return {
            __typename: "SearchUsersForSettingError",
            type: "REPO_ERROR",
            message: "Repo error",
          };
        }
        return {
          __typename: "SearchUsersForSettingSuccess",
          users: result,
        };
      }
    ),

    newRepos: runWithHooks(
      () => [this.loggedInUserGuard],
      async (_, args: main.QueryNewReposArgs) => {
        const repositoriesContext = await this.contextFactory.createContext(
          RepositoriesContext
        );
        const publicRepos =
          await repositoriesContext.getPublicReposWithCommit();

        if (!args.id) {
          const out = publicRepos.slice(0, NEW_REPOS_PAGINATION_SIZE);
          const lastId = out?.[out.length - 1]?.id ?? null;
          const hasMore = out.length < publicRepos.length;
          return {
            __typename: "FetchNewReposResult",
            repos: out,
            lastId,
            hasMore,
          };
        }
        const out: Array<Repository> = [];
        let i: number = 0;
        for (; i < publicRepos.length; ++i) {
          if (publicRepos[i]?.id == args.id) {
            for (
              let j = i + 1;
              j <
              Math.min(i + 1 + NEW_REPOS_PAGINATION_SIZE, publicRepos.length);
              ++j
            ) {
              out.push(publicRepos[j]);
            }
            const lastId = out?.[out.length - 1]?.id ?? null;
            return {
              __typename: "FetchNewReposResult",
              repos: out,
              lastId,
              hasMore: i + 1 + NEW_REPOS_PAGINATION_SIZE < publicRepos.length,
            };
          }
        }
        return null;
      }
    ),
  };

  public Mutation: main.MutationResolvers = {
    changeDefaultBranch: runWithHooks(
      () => [
        this.loggedInUserGuard,
        this.rootRepositoryRemoteSettingsLoader,
        this.repoSettingAccessGuard,
      ],
      async (_, args: main.MutationChangeDefaultBranchArgs) => {
        const repository = await this.repoDataService.fetchRepoById(
          args.repositoryId
        );
        if (!repository || !args.branchId) {
          return {
            __typename: "ChangeDefaultBranchError",
            message: "Unknown Error",
            type: "UNKNOWN_ERROR",
          };
        }
        const updatedRepo = await this.repoSettingsService.updateDefaultBranch(
          repository,
          args.branchId
        );
        if (!updatedRepo) {
          return {
            __typename: "ChangeDefaultBranchError",
            message: "Unknown Error",
            type: "UNKNOWN_ERROR",
          };
        }

        const protectedBranchRulesContext =
          await this.contextFactory.createContext(ProtectedBranchRulesContext);
        const protectedBranchRule =
          await protectedBranchRulesContext.getByRepoAndBranchId(
            repository.id,
            args.branchId
          );

        if (!protectedBranchRule) {
          return {
            __typename: "ChangeDefaultBranchError",
            message: "Unknown Error",
            type: "UNKNOWN_ERROR",
          };
        }

        this.pubsub?.publish?.(`REPOSITORY_UPDATED:${repository.id}`, {
          repositoryUpdated: updatedRepo,
        });
        return {
          __typename: "ChangeDefaultBranchSuccess",
          repository: updatedRepo,
          protectedBranchRule,
        };
      }
    ),
    createUserRepository: runWithHooks(
      () => [this.loggedInUserGuard],
      async (
        _root,
        { name, isPrivate }: main.MutationCreateUserRepositoryArgs,
        { currentUser }
      ) => {
        if (!currentUser) {
          return {
            __typename: "CreateUserRepositoryError",
            message: "Forbidden Action",
            type: "FORBIDDEN_ACTION_ERROR",
          };
        }
        const result = await this.repositoryService.createUserRepository(
          currentUser,
          name,
          isPrivate
        );
        if (result.action == "REPO_CREATED") {
          return {
            __typename: "CreateUserRepositorySuccess",
            repository: result.repository,
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
            __typename: "CreateUserRepositoryError",
            message: "Unknown Error",
            type: "UNKNOWN_ERROR",
          };
        }
        return {
          __typename: "CreateUserRepositoryError",
          message: result.error?.message ?? "Unknown Error",
          type: result.error?.type ?? "UNKNOWN_ERROR",
        };
      }
    ),
    createOrgRepository: runWithHooks(
      () => [
        this.loggedInUserGuard,
        this.rootOrganizationMemberPermissionsLoader,
      ],
      async (
        _root,
        {
          organizationId,
          name,
          isPrivate,
        }: main.MutationCreateOrgRepositoryArgs,
        { currentUser, cacheKey }
      ) => {
        if (!currentUser) {
          return {
            __typename: "CreateOrganizationRepositoryError",
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
            __typename: "CreateOrganizationRepositoryError",
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
            __typename: "CreateOrganizationRepositoryError",
            message: "Forbidden Action",
            type: "FORBIDDEN_ACTION_ERROR",
          };
        }

        const permissions = this.requestCache.getMembershipPermissions(
          cacheKey,
          membership.id
        );
        if (!permissions.canCreateRepos) {
          return {
            __typename: "CreateOrganizationRepositoryError",
            message: "Forbidden Action",
            type: "FORBIDDEN_ACTION_ERROR",
          };
        }
        const result =
          await this.repositoryService.createOrganizationRepository(
            organization,
            currentUser,
            name,
            isPrivate,
          );
        if (result.action == "REPO_CREATED") {
          return {
            __typename: "CreateOrganizationRepositorySuccess",
            repository: result.repository,
            organization: organization,
          };
        }
        if (result.action == "LOG_ERROR") {
          console.error(
            result.error?.type,
            result?.error?.message,
            result?.error?.meta
          );
          return {
            __typename: "CreateOrganizationRepositoryError",
            message: "Unknown Error",
            type: "UNKNOWN_ERROR",
          };
        }
        return {
          __typename: "CreateOrganizationRepositoryError",
          message: result.error?.message ?? "Unknown Error",
          type: result.error?.type ?? "UNKNOWN_ERROR",
        };
      }
    ),
    ignoreBranch: runWithHooks(
      () => [this.loggedInUserGuard],
      async (_, { repositoryId, branchId }, { currentUser }) => {
        if (!repositoryId || !branchId) {
          return {
            __typename: "IgnoreBranchError",
            message: "Invalid Params",
            type: "INVALID_PARAMS_ERROR",
          };
        }
        const repository = await this.repoDataService.fetchRepoById(
          repositoryId
        );
        if (!repository) {
          return {
            __typename: "IgnoreBranchError",
            message: "Repo Not Found",
            type: "REPO_NOT_FOUND_ERROR",
          };
        }
        if (repository?.isPrivate) {
          if (repository?.repoType == "user_repo") {
            if (repository?.userId != currentUser.id) {
              return {
                __typename: "IgnoreBranchError",
                message: "Forbidden Action",
                type: "FORBIDDEN_ACTION_ERROR",
              };
            }
          }
          if (repository?.repoType == "org_repo") {
            const organizationMembersContext =
              await this.contextFactory.createContext(
                OrganizationMembersContext
              );
            const member = await organizationMembersContext.getByOrgIdAndUserId(
              repository.organizationId as string,
              currentUser.id
            );
            if (member?.membershipState != "active") {
              return {
                __typename: "IgnoreBranchError",
                message: "Forbidden Action",
                type: "FORBIDDEN_ACTION_ERROR",
              };
            }
          }
        }

        const branches =
          (await this.repoDataService.getBranches(repositoryId as string)) ??
          [];
        const remoteSettings =
          await this.repoDataService.fetchRepoSettingsForUser(
            repositoryId,
            currentUser
          );
        if (!remoteSettings) {
          return {
            __typename: "IgnoreBranchError",
            message: "Forbidden Action",
            type: "FORBIDDEN_ACTION_ERROR",
          };
        }

        const openUserBranches = await this.branchService.getOpenBranchesByUser(
          repository as Repository,
          currentUser,
          branches,
          remoteSettings,
          true
        );
        const openBranch = openUserBranches.find((b) => b.id == branchId);
        if (!openBranch) {
          return {
            __typename: "IgnoreBranchError",
            message: "Open Branch Not Found",
            type: "OPEN_BRANCH_NOT_FOUND_ERROR",
          };
        }

        const ignoredBranchNotificationsContext =
          await this.contextFactory.createContext(
            IgnoredBranchNotificationsContext
          );
        await ignoredBranchNotificationsContext.create({
          branchId,
          repositoryId,
          userId: currentUser.id,
          isDeleted: false,
        });
        return {
          __typename: "IgnoreBranchSuccess",
          repository,
        };
      }
    ),
    // SETTING MUTATIONS
    updateAnyoneCanChangeSettings: runWithHooks(
      () => [
        this.loggedInUserGuard,
        this.rootRepositoryRemoteSettingsLoader,
        this.repoSettingAccessGuard,
      ],
      async (
        _,
        args: main.MutationUpdateAnyoneCanChangeSettingsArgs,
        { cacheKey, currentUser }
      ) => {
        const repository = await this.repoDataService.fetchRepoById(
          args.repositoryId
        );
        if (!repository) {
          return {
            __typename: "RepoSettingChangeError",
            message: "Repo Not Found",
            type: "REPO_NOT_FOUND_ERROR",
          };
        }

        const updatedRepo =
          await this.repoSettingsService.updateAnyoneCanChangeSettings(
            repository,
            args?.anyoneCanChangeSettings ?? false,
            currentUser
          );
        if (!updatedRepo) {
          return {
            __typename: "RepoSettingChangeError",
            message: "Repo Update Error",
            type: "REPO_UPDATE_ERROR",
          };
        }
        this.pubsub?.publish?.(`REPOSITORY_UPDATED:${repository.id}`, {
          repositoryUpdated: updatedRepo,
        });
        return {
          __typename: "RepoSettingChangeSuccess",
          repository: updatedRepo,
        };
      }
    ),

    updateAnyoneCanChangeSettingsUsers: runWithHooks(
      () => [
        this.loggedInUserGuard,
        this.rootRepositoryRemoteSettingsLoader,
        this.repoSettingAccessGuard,
      ],
      async (
        _,
        args: main.MutationUpdateAnyoneCanChangeSettingsUsersArgs,
        { currentUser }
      ) => {
        const repository = await this.repoDataService.fetchRepoById(
          args.repositoryId
        );
        if (!repository) {
          return {
            __typename: "RepoSettingChangeError",
            message: "Repo Not Found",
            type: "REPO_NOT_FOUND_ERROR",
          };
        }

        const repositoryEnabledRoleSettingsContext =
          await this.contextFactory.createContext(
            RepositoryEnabledRoleSettingsContext
          );
        const enabledRoles =
          await repositoryEnabledRoleSettingsContext.getAllForRepositorySetting(
            repository.id,
            "anyoneCanChangeSettings"
          );
        const enabledRoleIds = enabledRoles.map((er) => er.roleId);

        const updatedRepo = await this.repoSettingsService.updateSettingsAccess(
          repository,
          enabledRoleIds,
          (args?.userIds ?? []) as Array<string>,
          currentUser
        );
        if (!updatedRepo) {
          return {
            __typename: "RepoSettingChangeError",
            message: "Repo Update Error",
            type: "REPO_UPDATE_ERROR",
          };
        }
        this.pubsub?.publish?.(`REPOSITORY_UPDATED:${repository.id}`, {
          repositoryUpdated: updatedRepo,
        });
        return {
          __typename: "RepoSettingChangeSuccess",
          repository: updatedRepo,
        };
      }
    ),

    updateAnyoneCanChangeSettingsRoles: runWithHooks(
      () => [
        this.loggedInUserGuard,
        this.rootRepositoryRemoteSettingsLoader,
        this.repoSettingAccessGuard,
      ],
      async (
        _,
        args: main.MutationUpdateAnyoneCanChangeSettingsRolesArgs,
        { currentUser }
      ) => {
        const repository = await this.repoDataService.fetchRepoById(
          args.repositoryId
        );
        if (!repository) {
          return {
            __typename: "RepoSettingChangeError",
            message: "Repo Not Found",
            type: "REPO_NOT_FOUND_ERROR",
          };
        }

        const repositoryEnabledUserSettingsContext =
          await this.contextFactory.createContext(
            RepositoryEnabledUserSettingsContext
          );
        const enabledUsers =
          await repositoryEnabledUserSettingsContext.getAllForRepositorySetting(
            repository.id,
            "anyoneCanChangeSettings"
          );
        const enabledUserIds = enabledUsers.map((eu) => eu.userId);

        const updatedRepo = await this.repoSettingsService.updateSettingsAccess(
          repository,
          (args?.roleIds ?? []) as Array<string>,
          enabledUserIds,
          currentUser
        );
        if (!updatedRepo) {
          return {
            __typename: "RepoSettingChangeError",
            message: "Repo Update Error",
            type: "REPO_UPDATE_ERROR",
          };
        }
        this.pubsub?.publish?.(`REPOSITORY_UPDATED:${repository.id}`, {
          repositoryUpdated: updatedRepo,
        });
        return {
          __typename: "RepoSettingChangeSuccess",
          repository: updatedRepo,
        };
      }
    ),

    updateAnyoneCanWriteAnnouncements: runWithHooks(
      () => [
        this.loggedInUserGuard,
        this.rootRepositoryRemoteSettingsLoader,
        this.repoSettingAccessGuard,
      ],
      async (
        _,
        args: main.MutationUpdateAnyoneCanWriteAnnouncementsArgs,
        { cacheKey, currentUser }
      ) => {
        const repository = await this.repoDataService.fetchRepoById(
          args.repositoryId
        );
        if (!repository) {
          return {
            __typename: "RepoSettingChangeError",
            message: "Repo Not Found",
            type: "REPO_NOT_FOUND_ERROR",
          };
        }

        const updatedRepo =
          await this.repoSettingsService.updateAnyoneCanWriteAnnouncements(
            repository,
            args?.anyoneCanWriteAnnouncements ?? false
          );
        if (!updatedRepo) {
          return {
            __typename: "RepoSettingChangeError",
            message: "Repo Update Error",
            type: "REPO_UPDATE_ERROR",
          };
        }
        this.pubsub?.publish?.(`REPOSITORY_UPDATED:${repository.id}`, {
          repositoryUpdated: updatedRepo,
        });
        return {
          __typename: "RepoSettingChangeSuccess",
          repository: updatedRepo,
        };
      }
    ),
    updateAnyoneCanWriteAnnouncementsUsers: runWithHooks(
      () => [
        this.loggedInUserGuard,
        this.rootRepositoryRemoteSettingsLoader,
        this.repoSettingAccessGuard,
      ],
      async (
        _,
        args: main.MutationUpdateAnyoneCanWriteAnnouncementsUsersArgs
      ) => {
        const repository = await this.repoDataService.fetchRepoById(
          args.repositoryId
        );
        if (!repository) {
          return {
            __typename: "RepoSettingChangeError",
            message: "Repo Not Found",
            type: "REPO_NOT_FOUND_ERROR",
          };
        }

        const repositoryEnabledRoleSettingsContext =
          await this.contextFactory.createContext(
            RepositoryEnabledRoleSettingsContext
          );
        const enabledRoles =
          await repositoryEnabledRoleSettingsContext.getAllForRepositorySetting(
            repository.id,
            "anyoneCanWriteAnnouncements"
          );
        const enabledRoleIds = enabledRoles.map((er) => er.roleId);

        const updatedRepo =
          await this.repoSettingsService.updateWriteAnnouncementsAccess(
            repository,
            enabledRoleIds,
            (args?.userIds ?? []) as Array<string>
          );
        if (!updatedRepo) {
          return {
            __typename: "RepoSettingChangeError",
            message: "Repo Update Error",
            type: "REPO_UPDATE_ERROR",
          };
        }
        this.pubsub?.publish?.(`REPOSITORY_UPDATED:${repository.id}`, {
          repositoryUpdated: updatedRepo,
        });
        return {
          __typename: "RepoSettingChangeSuccess",
          repository: updatedRepo,
        };
      }
    ),
    updateAnyoneCanWriteAnnouncementsRoles: runWithHooks(
      () => [
        this.loggedInUserGuard,
        this.rootRepositoryRemoteSettingsLoader,
        this.repoSettingAccessGuard,
      ],
      async (
        _,
        args: main.MutationUpdateAnyoneCanWriteAnnouncementsRolesArgs
      ) => {
        const repository = await this.repoDataService.fetchRepoById(
          args.repositoryId
        );
        if (!repository) {
          return {
            __typename: "RepoSettingChangeError",
            message: "Repo Not Found",
            type: "REPO_NOT_FOUND_ERROR",
          };
        }
        const repositoryEnabledUserSettingsContext =
          await this.contextFactory.createContext(
            RepositoryEnabledUserSettingsContext
          );
        const enabledUsers =
          await repositoryEnabledUserSettingsContext.getAllForRepositorySetting(
            repository.id,
            "anyoneCanWriteAnnouncements"
          );
        const enabledUserIds = enabledUsers.map((eu) => eu.userId);

        const updatedRepo =
          await this.repoSettingsService.updateWriteAnnouncementsAccess(
            repository,
            (args?.roleIds ?? []) as Array<string>,
            enabledUserIds
          );
        if (!updatedRepo) {
          return {
            __typename: "RepoSettingChangeError",
            message: "Repo Update Error",
            type: "REPO_UPDATE_ERROR",
          };
        }
        this.pubsub?.publish?.(`REPOSITORY_UPDATED:${repository.id}`, {
          repositoryUpdated: updatedRepo,
        });
        return {
          __typename: "RepoSettingChangeSuccess",
          repository: updatedRepo,
        };
      }
    ),
    updateAnyoneCanRead: runWithHooks(
      () => [
        this.loggedInUserGuard,
        this.rootRepositoryRemoteSettingsLoader,
        this.repoSettingAccessGuard,
      ],
      async (
        _,
        args: main.MutationUpdateAnyoneCanReadArgs,
        { cacheKey, currentUser }
      ) => {
        const repository = await this.repoDataService.fetchRepoById(
          args.repositoryId
        );
        if (!repository) {
          return {
            __typename: "RepoSettingChangeError",
            message: "Repo Not Found",
            type: "REPO_NOT_FOUND_ERROR",
          };
        }

        const updatedRepo = await this.repoSettingsService.updateAnyoneCanRead(
          repository,
          args?.anyoneCanRead ?? false,
          currentUser
        );
        if (!updatedRepo) {
          return {
            __typename: "RepoSettingChangeError",
            message: "Repo Update Error",
            type: "REPO_UPDATE_ERROR",
          };
        }
        this.pubsub?.publish?.(`REPOSITORY_UPDATED:${repository.id}`, {
          repositoryUpdated: updatedRepo,
        });
        return {
          __typename: "RepoSettingChangeSuccess",
          repository: updatedRepo,
        };
      }
    ),
    updateAnyoneCanReadUsers: runWithHooks(
      () => [
        this.loggedInUserGuard,
        this.rootRepositoryRemoteSettingsLoader,
        this.repoSettingAccessGuard,
      ],
      async (
        _,
        args: main.MutationUpdateAnyoneCanReadUsersArgs,
        { currentUser }
      ) => {
        const repository = await this.repoDataService.fetchRepoById(
          args.repositoryId
        );
        if (!repository) {
          return {
            __typename: "RepoSettingChangeError",
            message: "Repo Not Found",
            type: "REPO_NOT_FOUND_ERROR",
          };
        }

        const repositoryEnabledRoleSettingsContext =
          await this.contextFactory.createContext(
            RepositoryEnabledRoleSettingsContext
          );
        const enabledRoles =
          await repositoryEnabledRoleSettingsContext.getAllForRepositorySetting(
            repository.id,
            "anyoneCanRead"
          );
        const enabledRoleIds = enabledRoles.map((er) => er.roleId);

        const updatedRepo = await this.repoSettingsService.updateReadAccess(
          repository,
          enabledRoleIds,
          (args?.userIds ?? []) as Array<string>,
          currentUser
        );
        if (!updatedRepo) {
          return {
            __typename: "RepoSettingChangeError",
            message: "Repo Update Error",
            type: "REPO_UPDATE_ERROR",
          };
        }
        this.pubsub?.publish?.(`REPOSITORY_UPDATED:${repository.id}`, {
          repositoryUpdated: updatedRepo,
        });
        return {
          __typename: "RepoSettingChangeSuccess",
          repository: updatedRepo,
        };
      }
    ),
    updateAnyoneCanReadRoles: runWithHooks(
      () => [
        this.loggedInUserGuard,
        this.rootRepositoryRemoteSettingsLoader,
        this.repoSettingAccessGuard,
      ],
      async (
        _,
        args: main.MutationUpdateAnyoneCanReadRolesArgs,
        { currentUser }
      ) => {
        const repository = await this.repoDataService.fetchRepoById(
          args.repositoryId
        );
        if (!repository) {
          return {
            __typename: "RepoSettingChangeError",
            message: "Repo Not Found",
            type: "REPO_NOT_FOUND_ERROR",
          };
        }
        const repositoryEnabledUserSettingsContext =
          await this.contextFactory.createContext(
            RepositoryEnabledUserSettingsContext
          );
        const enabledUsers =
          await repositoryEnabledUserSettingsContext.getAllForRepositorySetting(
            repository.id,
            "anyoneCanRead"
          );
        const enabledUserIds = enabledUsers.map((eu) => eu.userId);

        const updatedRepo = await this.repoSettingsService.updateReadAccess(
          repository,
          (args?.roleIds ?? []) as Array<string>,
          enabledUserIds,
          currentUser
        );
        if (!updatedRepo) {
          return {
            __typename: "RepoSettingChangeError",
            message: "Repo Update Error",
            type: "REPO_UPDATE_ERROR",
          };
        }
        this.pubsub?.publish?.(`REPOSITORY_UPDATED:${repository.id}`, {
          repositoryUpdated: updatedRepo,
        });
        return {
          __typename: "RepoSettingChangeSuccess",
          repository: updatedRepo,
        };
      }
    ),

    updateAnyoneCanPushBranches: runWithHooks(
      () => [
        this.loggedInUserGuard,
        this.rootRepositoryRemoteSettingsLoader,
        this.repoSettingAccessGuard,
      ],
      async (_, args: main.MutationUpdateAnyoneCanPushBranchesArgs) => {
        const repository = await this.repoDataService.fetchRepoById(
          args.repositoryId
        );
        if (!repository) {
          return {
            __typename: "RepoSettingChangeError",
            message: "Repo Not Found",
            type: "REPO_NOT_FOUND_ERROR",
          };
        }

        const updatedRepo =
          await this.repoSettingsService.updateAnyoneCanPushBranches(
            repository,
            args?.anyoneCanPushBranches ?? false
          );
        if (!updatedRepo) {
          return {
            __typename: "RepoSettingChangeError",
            message: "Repo Update Error",
            type: "REPO_UPDATE_ERROR",
          };
        }
        this.pubsub?.publish?.(`REPOSITORY_UPDATED:${repository.id}`, {
          repositoryUpdated: updatedRepo,
        });
        return {
          __typename: "RepoSettingChangeSuccess",
          repository: updatedRepo,
        };
      }
    ),
    updateAnyoneCanPushBranchesUsers: runWithHooks(
      () => [
        this.loggedInUserGuard,
        this.rootRepositoryRemoteSettingsLoader,
        this.repoSettingAccessGuard,
      ],
      async (
        _,
        args: main.MutationUpdateAnyoneCanPushBranchesUsersArgs,
        { currentUser }
      ) => {
        const repository = await this.repoDataService.fetchRepoById(
          args.repositoryId
        );
        if (!repository) {
          return {
            __typename: "RepoSettingChangeError",
            message: "Repo Not Found",
            type: "REPO_NOT_FOUND_ERROR",
          };
        }

        const repositoryEnabledRoleSettingsContext =
          await this.contextFactory.createContext(
            RepositoryEnabledRoleSettingsContext
          );
        const enabledRoles =
          await repositoryEnabledRoleSettingsContext.getAllForRepositorySetting(
            repository.id,
            "anyoneCanPushBranches"
          );
        const enabledRoleIds = enabledRoles.map((er) => er.roleId);

        const updatedRepo =
          await this.repoSettingsService.updatePushBranchesAccess(
            repository,
            enabledRoleIds,
            (args?.userIds ?? []) as Array<string>,
            currentUser
          );
        if (!updatedRepo) {
          return {
            __typename: "RepoSettingChangeError",
            message: "Repo Update Error",
            type: "REPO_UPDATE_ERROR",
          };
        }
        this.pubsub?.publish?.(`REPOSITORY_UPDATED:${repository.id}`, {
          repositoryUpdated: updatedRepo,
        });
        return {
          __typename: "RepoSettingChangeSuccess",
          repository: updatedRepo,
        };
      }
    ),
    updateAnyoneCanPushBranchesRoles: runWithHooks(
      () => [
        this.loggedInUserGuard,
        this.rootRepositoryRemoteSettingsLoader,
        this.repoSettingAccessGuard,
      ],
      async (
        _,
        args: main.MutationUpdateAnyoneCanPushBranchesRolesArgs,
        { currentUser }
      ) => {
        const repository = await this.repoDataService.fetchRepoById(
          args.repositoryId
        );
        if (!repository) {
          return {
            __typename: "RepoSettingChangeError",
            message: "Repo Not Found",
            type: "REPO_NOT_FOUND_ERROR",
          };
        }
        const repositoryEnabledUserSettingsContext =
          await this.contextFactory.createContext(
            RepositoryEnabledUserSettingsContext
          );
        const enabledUsers =
          await repositoryEnabledUserSettingsContext.getAllForRepositorySetting(
            repository.id,
            "anyoneCanPushBranches"
          );
        const enabledUserIds = enabledUsers.map((eu) => eu.userId);

        const updatedRepo =
          await this.repoSettingsService.updatePushBranchesAccess(
            repository,
            (args?.roleIds ?? []) as Array<string>,
            enabledUserIds,
            currentUser
          );
        if (!updatedRepo) {
          return {
            __typename: "RepoSettingChangeError",
            message: "Repo Update Error",
            type: "REPO_UPDATE_ERROR",
          };
        }
        this.pubsub?.publish?.(`REPOSITORY_UPDATED:${repository.id}`, {
          repositoryUpdated: updatedRepo,
        });
        return {
          __typename: "RepoSettingChangeSuccess",
          repository: updatedRepo,
        };
      }
    ),
    updateAllowExternalUsersToPush: runWithHooks(
      () => [
        this.loggedInUserGuard,
        this.rootRepositoryRemoteSettingsLoader,
        this.repoSettingAccessGuard,
      ],
      async (_, args: main.MutationUpdateAllowExternalUsersToPushArgs) => {
        const repository = await this.repoDataService.fetchRepoById(
          args.repositoryId
        );
        if (!repository) {
          return {
            __typename: "RepoSettingChangeError",
            message: "Repo Not Found",
            type: "REPO_NOT_FOUND_ERROR",
          };
        }

        const updatedRepo =
          await this.repoSettingsService.updateAllowExternalUsersToPush(
            repository,
            args?.allowExternalUsersToPush ?? false
          );
        if (!updatedRepo) {
          return {
            __typename: "RepoSettingChangeError",
            message: "Repo Update Error",
            type: "REPO_UPDATE_ERROR",
          };
        }
        this.pubsub?.publish?.(`REPOSITORY_UPDATED:${repository.id}`, {
          repositoryUpdated: updatedRepo,
        });
        return {
          __typename: "RepoSettingChangeSuccess",
          repository: updatedRepo,
        };
      }
    ),
    revertCommit: runWithHooks(
      () => [this.loggedInUserGuard, this.repoSettingAccessGuard],
      async (
        _,
        { repositoryId, sha, branchId }: main.MutationRevertCommitArgs,
        { currentUser }
      ) => {
        const repository = await this.repoDataService.fetchRepoById(
          repositoryId
        );
        if (!repository) {
          return {
            __typename: "RevertCommitError",
            message: "Unknown Error",
            type: "UNKNOWN_ERROR",
          };
        }

        const branches =
          (await this.repoDataService.getBranches(repositoryId as string)) ??
          [];
        const branch = branches.find((b) => b.id == branchId);
        if (!branch?.lastCommit) {
          return {
            __typename: "RevertCommitError",
            message: "Unknown Error",
            type: "UNKNOWN_ERROR",
          };
        }
        const baseBranch = branches.find(
          (b) => !!branch?.baseBranchId && b.id == branch.baseBranchId
        );
        const remoteSettings =
          await this.repoDataService.fetchRepoSettingsForUser(
            repositoryId,
            currentUser
          );
        const branchRule = remoteSettings?.branchRules.find(
          (br) => br.branchId == branchId
        );

        if (!remoteSettings?.canPushBranches) {
          return {
            __typename: "RevertCommitError",
            message: "Unknown Error",
            type: "UNKNOWN_ERROR",
          };
        }
        if (branchRule && !branchRule?.canAutofix) {
          return {
            __typename: "RevertCommitError",
            message: "Unknown Error",
            type: "UNKNOWN_ERROR",
          };
        }

        const commits = await this.repoDataService.getCommits(repositoryId);
        const commit = commits?.find((c) => c.sha == sha);
        if (!commit) {
          return {
            __typename: "RevertCommitError",
            message: "Unknown Error",
            type: "UNKNOWN_ERROR",
          };
        }

        const history = this.repoDataService.getCommitHistory(
          commits,
          branch?.lastCommit
        );

        const ranges = this.repoDataService.getRevertRanges(history);
        const isReverted = this.repoDataService.isReverted(ranges, commit.idx);
        if (isReverted) {
          return {
            __typename: "RevertCommitError",
            message: "Unknown Error",
            type: "UNKNOWN_ERROR",
          };
        }
        const result = await this.revertService.revertBranch(
          repository,
          sha,
          branch,
          baseBranch,
          currentUser
        );
        if (result.action == "BRANCH_REVERTED") {
          this.pubsub?.publish?.(`REPOSITORY_UPDATED:${repository.id}`, {
            repositoryUpdated: result.repository,
          });
          return {
            __typename: "RevertCommitSuccess",
            repository: result.repository,
          };
        }

        if (result.action == "LOG_ERROR") {
          console.error(
            result.error?.type,
            result?.error?.message,
            result?.error?.meta
          );
          return {
            __typename: "RevertCommitError",
            message: "Unknown Error",
            type: "UNKNOWN_ERROR",
          };
        }
        return {
          __typename: "RevertCommitError",
          message: result.error?.message ?? "Unknown Error",
          type: result.error?.type ?? "UNKNOWN_ERROR",
        };
      }
    ),
    autofixCommit: runWithHooks(
      () => [this.loggedInUserGuard, this.repoSettingAccessGuard],
      async (
        _,
        { repositoryId, sha, branchId }: main.MutationAutofixCommitArgs,
        { currentUser }
      ) => {
        const repository = await this.repoDataService.fetchRepoById(
          repositoryId
        );

        if (!repository) {
          return {
            __typename: "AutofixCommitError",
            message: "Unknown Error",
            type: "UNKNOWN_ERROR",
          };
        }

        const branches =
          (await this.repoDataService.getBranches(repositoryId as string)) ??
          [];
        const branch = branches.find((b) => b.id == branchId);
        if (!branch?.lastCommit) {
          return {
            __typename: "AutofixCommitError",
            message: "Unknown Error",
            type: "UNKNOWN_ERROR",
          };
        }
        const baseBranch = branches.find(
          (b) => !!branch?.baseBranchId && b.id == branch.baseBranchId
        );
        const remoteSettings =
          await this.repoDataService.fetchRepoSettingsForUser(
            repositoryId,
            currentUser
          );
        const branchRule = remoteSettings?.branchRules.find(
          (br) => br.branchId == branchId
        );

        if (!remoteSettings?.canPushBranches) {
          return {
            __typename: "AutofixCommitError",
            message: "Unknown Error",
            type: "UNKNOWN_ERROR",
          };
        }
        if (branchRule && !branchRule?.canAutofix) {
          return {
            __typename: "AutofixCommitError",
            message: "Unknown Error",
            type: "UNKNOWN_ERROR",
          };
        }

        const commits = await this.repoDataService.getCommits(repositoryId);
        const commit = commits?.find((c) => c.sha == sha);
        if (!commit) {
          return {
            __typename: "AutofixCommitError",
            message: "Unknown Error",
            type: "UNKNOWN_ERROR",
          };
        }
        const history = this.repoDataService.getCommitHistory(
          commits,
          branch?.lastCommit
        );

        const ranges = this.repoDataService.getRevertRanges(history);
        const isReverted = this.repoDataService.isReverted(ranges, commit.idx);
        if (isReverted) {
          return {
            __typename: "AutofixCommitError",
            message: "Unknown Error",
            type: "UNKNOWN_ERROR",
          };
        }
        const result = await this.revertService.autofixBranch(
          repository,
          sha,
          branch,
          baseBranch,
          currentUser
        );
        if (result.action == "BRANCH_AUTOFIXED") {
          this.pubsub?.publish?.(`REPOSITORY_UPDATED:${repository.id}`, {
            repositoryUpdated: result.repository,
          });
          return {
            __typename: "AutofixCommitSuccess",
            repository: result.repository,
          };
        }

        if (result.action == "LOG_ERROR") {
          console.error(
            result.error?.type,
            result?.error?.message,
            result?.error?.meta
          );
          return {
            __typename: "AutofixCommitError",
            message: "Unknown Error",
            type: "UNKNOWN_ERROR",
          };
        }
        return {
          __typename: "AutofixCommitError",
          message: result.error?.message ?? "Unknown Error",
          type: result.error?.type ?? "UNKNOWN_ERROR",
        };
      }
    ),

    deleteBranch: runWithHooks(
      () => [this.loggedInUserGuard, this.repoSettingAccessGuard],
      async (
        _,
        { repositoryId, branchId }: main.MutationDeleteBranchArgs,
        { currentUser }
      ) => {
        const repository = await this.repoDataService.fetchRepoById(
          repositoryId
        );

        if (!repository) {
          return {
            __typename: "DeleteBranchError",
            message: "Unknown Error",
            type: "UNKNOWN_ERROR",
          };
        }
        const remoteSettings =
          await this.repoDataService.fetchRepoSettingsForUser(
            repositoryId,
            currentUser
          );
        if (!remoteSettings?.canPushBranches) {
          return {
            __typename: "DeleteBranchError",
            message: "Unknown Error",
            type: "UNKNOWN_ERROR",
          };
        }
        const branches =
          (await this.repoDataService.getBranches(repositoryId as string)) ??
          [];
        const branch = branches.find((b) => b.id == branchId);
        if (!branch) {
          return {
            __typename: "DeleteBranchError",
            message: "Unknown Error",
            type: "UNKNOWN_ERROR",
          };
        }
        const canDelete = await this.branchService.canDeleteBranch(
          repository,
          branch
        );
        if (!canDelete) {
          return {
            __typename: "DeleteBranchError",
            message: "Unknown Error",
            type: "UNKNOWN_ERROR",
          };
        }
        const updatedBranch = await this.branchService.deleteBranch(
          repository,
          branch
        );
        if (!updatedBranch) {
          return {
            __typename: "DeleteBranchError",
            message: "Unknown Error",
            type: "UNKNOWN_ERROR",
          };
        }
        this.pubsub?.publish?.(`REPOSITORY_UPDATED:${repository.id}`, {
          repositoryUpdated: repository,
        });
        return {
          __typename: "DeleteBranchSuccess",
          repository,
        };
      }
    ),
    mergeBranch: runWithHooks(
      () => [this.loggedInUserGuard, this.repoSettingAccessGuard],
      async (
        _,
        { repositoryId, branchId }: main.MutationMergeBranchArgs,
        { currentUser }
      ) => {
        const repository = await this.repoDataService.fetchRepoById(
          repositoryId
        );

        if (!repository) {
          return {
            __typename: "MergeBranchError",
            message: "Unknown Error",
            type: "UNKNOWN_ERROR",
          };
        }
        const remoteSettings =
          await this.repoDataService.fetchRepoSettingsForUser(
            repositoryId,
            currentUser
          );
        if (!remoteSettings?.canPushBranches) {
          return {
            __typename: "MergeBranchError",
            message: "Unknown Error",
            type: "UNKNOWN_ERROR",
          };
        }
        const branches =
          (await this.repoDataService.getBranches(repositoryId as string)) ??
          [];
        const floroBranch = branches.find((b) => b.id == branchId);
        if (!floroBranch) {
          return {
            __typename: "MergeBranchError",
            message: "Unknown Error",
            type: "UNKNOWN_ERROR",
          };
        }
        const baseBranch = branches.find(
          (b) => !!floroBranch?.baseBranchId && b.id == floroBranch.baseBranchId
        );
        if (!baseBranch) {
          return {
            __typename: "MergeBranchError",
            message: "Unknown Error",
            type: "UNKNOWN_ERROR",
          };
        }

        const mergeRequestsContext = await this.contextFactory.createContext(
          MergeRequestsContext
        );

        const branchHasOpenRequest =
          await mergeRequestsContext.repoHasOpenRequestOnBranch(
            repository.id,
            floroBranch.id
          );
        if (branchHasOpenRequest) {
          return {
            __typename: "MergeBranchError",
            message: "Unknown Error",
            type: "UNKNOWN_ERROR",
          };
        }

        const branchRuleSettings = remoteSettings?.branchRules?.find(
          (br) => br.branchId == baseBranch.id
        );
        if (branchRuleSettings && branchRuleSettings?.requiresApprovalToMerge) {
          return {
            __typename: "MergeBranchError",
            message: "Unknown Error",
            type: "UNKNOWN_ERROR",
          };
        }
        const branchesContext = await this.contextFactory.createContext(
          BranchesContext
        );
        const remoteBranch = await branchesContext.getByRepoAndBranchId(
          repository.id,
          floroBranch?.id
        );
        const canMerge = (!remoteBranch?.isMerged &&
          (remoteBranch?.isConflictFree ?? false)) as boolean;
        if (!canMerge) {
          return {
            __typename: "MergeBranchError",
            message: "Unknown Error",
            type: "UNKNOWN_ERROR",
          };
        }
        const result = await this.mergeService.mergeBranch(
          repository,
          floroBranch,
          currentUser
        );

        if (result.action == "BRANCH_MERGED") {
          this.pubsub?.publish?.(`REPOSITORY_UPDATED:${repository.id}`, {
            repositoryUpdated: result.repository,
          });
          return {
            __typename: "MergeBranchSuccess",
            repository: result.repository,
          };
        }

        if (result.action == "LOG_ERROR") {
          console.error(
            result.error?.type,
            result?.error?.message,
            result?.error?.meta
          );
          return {
            __typename: "MergeBranchError",
            message: "Unknown Error",
            type: "UNKNOWN_ERROR",
          };
        }
        return {
          __typename: "MergeBranchError",
          message: result.error?.message ?? "Unknown Error",
          type: result.error?.type ?? "UNKNOWN_ERROR",
        };
      }
    ),

    addEnabledApiKey: runWithHooks(
      () => [this.repoApiSettingAccessGuard],
      async (_, args: main.MutationAddEnabledApiKeyArgs, { currentUser }) => {
        const repository = await this.repoDataService.fetchRepoById(
          args.repositoryId
        );
        const apiKeysContexts = await this.contextFactory.createContext(
          ApiKeysContext
        );
        const apiKey = await apiKeysContexts.getById(args.apiKeyId);
        if (!apiKey) {
          return {
            __typename: "RepositoryApiKeyError",
            message: "Forbidden Action",
            type: "FORBIDDEN_ACTION_ERROR",
          };
        }
        if (repository?.repoType == "user_repo") {
          if (
            apiKey?.keyType != "user_key" ||
            apiKey?.userId != repository?.userId ||
            apiKey?.userId != currentUser?.id
          ) {
            return {
              __typename: "RepositoryApiKeyError",
              message: "Forbidden Action",
              type: "FORBIDDEN_ACTION_ERROR",
            };
          }
        }
        if (repository?.repoType == "org_repo") {
          if (
            apiKey?.keyType != "org_key" ||
            apiKey?.organizationId != repository?.organizationId
          ) {
            return {
              __typename: "RepositoryApiKeyError",
              message: "Forbidden Action",
              type: "FORBIDDEN_ACTION_ERROR",
            };
          }
        }
        await this.repoEnabledApiKeyService.addEnabledApiKey(
          repository as Repository,
          apiKey,
          currentUser
        );
        return {
          __typename: "RepositoryApiKeySuccess",
          repository,
        };
      }
    ),
    removeEnabledApiKey: runWithHooks(
      () => [this.repoApiSettingAccessGuard],
      async (
        _,
        args: main.MutationRemoveEnabledApiKeyArgs,
        { currentUser }
      ) => {
        const repository = await this.repoDataService.fetchRepoById(
          args.repositoryId
        );
        const apiKeysContexts = await this.contextFactory.createContext(
          ApiKeysContext
        );
        const apiKey = await apiKeysContexts.getById(args.apiKeyId);
        if (!apiKey) {
          return {
            __typename: "RepositoryApiKeyError",
            message: "Forbidden Action",
            type: "FORBIDDEN_ACTION_ERROR",
          };
        }
        if (repository?.repoType == "user_repo") {
          if (
            apiKey?.keyType != "user_key" ||
            apiKey?.userId != repository?.userId ||
            apiKey?.userId != currentUser?.id
          ) {
            return {
              __typename: "RepositoryApiKeyError",
              message: "Forbidden Action",
              type: "FORBIDDEN_ACTION_ERROR",
            };
          }
        }
        if (repository?.repoType == "org_repo") {
          if (
            apiKey?.keyType != "org_key" ||
            apiKey?.organizationId != repository?.organizationId
          ) {
            return {
              __typename: "RepositoryApiKeyError",
              message: "Forbidden Action",
              type: "FORBIDDEN_ACTION_ERROR",
            };
          }
        }
        await this.repoEnabledApiKeyService.removeEnabledApiKey(
          repository as Repository,
          apiKey
        );
        return {
          __typename: "RepositoryApiKeySuccess",
          repository,
        };
      }
    ),
    createEnabledWebhookKey: runWithHooks(
      () => [this.repoApiSettingAccessGuard],
      async (
        _,
        args: main.MutationCreateEnabledWebhookKeyArgs,
        { currentUser }
      ) => {
        const repository = await this.repoDataService.fetchRepoById(
          args.repositoryId
        );
        const webhookKeysContext = await this.contextFactory.createContext(
          WebhookKeysContext
        );
        const webhookKey = await webhookKeysContext.getById(args.webhookKeyId);
        if (!webhookKey) {
          return {
            __typename: "RepositoryWebhookKeyError",
            message: "Forbidden Action",
            type: "FORBIDDEN_ACTION_ERROR",
          };
        }
        if (repository?.repoType == "user_repo") {
          if (
            webhookKey?.keyType != "user_key" ||
            webhookKey?.userId != repository?.userId ||
            webhookKey?.userId != currentUser?.id
          ) {
            return {
              __typename: "RepositoryWebhookKeyError",
              message: "Forbidden Action",
              type: "FORBIDDEN_ACTION_ERROR",
            };
          }
        }
        if (repository?.repoType == "org_repo") {
          if (
            webhookKey?.keyType != "org_key" ||
            webhookKey?.organizationId != repository?.organizationId
          ) {
            return {
              __typename: "RepositoryWebhookKeyError",
              message: "Forbidden Action",
              type: "FORBIDDEN_ACTION_ERROR",
            };
          }
        }
        const didSucceed =
          await this.repoEnabledWebhookKeyService.addEnabledWebhookKey(
            repository as Repository,
            currentUser,
            webhookKey,
            args.protocol ?? null,
            args.port ?? null,
            args.subdomain ?? null,
            args.uri ?? null
          );
        if (!didSucceed) {
          return {
            __typename: "RepositoryWebhookKeyError",
            message: "Unknown Error",
            type: "UNKNOWN_ERROR",
          };
        }
        this.pubsub?.publish?.(`REPOSITORY_UPDATED:${repository?.id}`, {
          repositoryUpdated: repository,
        });
        return {
          __typename: "RepositoryWebhookKeySuccess",
          repository,
        };
      }
    ),
    updateEnabledWebhookKey: runWithHooks(
      () => [this.repoApiSettingAccessGuard],
      async (
        _,
        args: main.MutationUpdateEnabledWebhookKeyArgs,
        { currentUser }
      ) => {
        const repository = await this.repoDataService.fetchRepoById(
          args.repositoryId
        );
        const repositoryEnabledWebhookKeysContext =
          await this.contextFactory.createContext(
            RepositoryEnabledWebhookKeysContext
          );
        const repositoryEnabledWebhookKey =
          await repositoryEnabledWebhookKeysContext.getById(
            args.repoEnabledWebhookKeyId
          );
        if (
          !repositoryEnabledWebhookKey ||
          repositoryEnabledWebhookKey.repositoryId != repository?.id
        ) {
          return {
            __typename: "RepositoryWebhookKeyError",
            message: "Forbidden Action",
            type: "FORBIDDEN_ACTION_ERROR",
          };
        }
        const webhookKeysContext = await this.contextFactory.createContext(
          WebhookKeysContext
        );
        const webhookKey = await webhookKeysContext.getById(args.webhookKeyId);
        if (!webhookKey) {
          return {
            __typename: "RepositoryWebhookKeyError",
            message: "Forbidden Action",
            type: "FORBIDDEN_ACTION_ERROR",
          };
        }
        if (repository?.repoType == "user_repo") {
          if (
            webhookKey?.keyType != "user_key" ||
            webhookKey?.userId != repository?.userId ||
            webhookKey?.userId != currentUser?.id
          ) {
            return {
              __typename: "RepositoryWebhookKeyError",
              message: "Forbidden Action",
              type: "FORBIDDEN_ACTION_ERROR",
            };
          }
        }
        if (repository?.repoType == "org_repo") {
          if (
            webhookKey?.keyType != "org_key" ||
            webhookKey?.organizationId != repository?.organizationId
          ) {
            return {
              __typename: "RepositoryWebhookKeyError",
              message: "Forbidden Action",
              type: "FORBIDDEN_ACTION_ERROR",
            };
          }
        }
        const didSucceed =
          await this.repoEnabledWebhookKeyService.updateEnabledWebhookKey(
            repositoryEnabledWebhookKey,
            webhookKey,
            args.protocol ?? null,
            args.port ?? null,
            args.subdomain ?? null,
            args.uri ?? null
          );
        if (!didSucceed) {
          return {
            __typename: "RepositoryWebhookKeyError",
            message: "Unknown Error",
            type: "UNKNOWN_ERROR",
          };
        }
        this.pubsub?.publish?.(`REPOSITORY_UPDATED:${repository?.id}`, {
          repositoryUpdated: repository,
        });
        return {
          __typename: "RepositoryWebhookKeySuccess",
          repository,
        };
      }
    ),
    removeEnabledWebhookKey: runWithHooks(
      () => [this.loggedInUserGuard, this.repoApiSettingAccessGuard],
      async (_, args: main.MutationRemoveEnabledWebhookKeyArgs) => {
        const repository = await this.repoDataService.fetchRepoById(
          args.repositoryId
        );
        const repositoryEnabledWebhookKeysContext =
          await this.contextFactory.createContext(
            RepositoryEnabledWebhookKeysContext
          );
        const repositoryEnabledWebhookKey =
          await repositoryEnabledWebhookKeysContext.getById(
            args.repoEnabledWebhookKeyId
          );
        if (
          !repositoryEnabledWebhookKey ||
          repositoryEnabledWebhookKey.repositoryId != repository?.id
        ) {
          return {
            __typename: "RepositoryWebhookKeyError",
            message: "Forbidden Action",
            type: "FORBIDDEN_ACTION_ERROR",
          };
        }
        const res = await this.repoEnabledWebhookKeyService.removeEnabledApiKey(
          repositoryEnabledWebhookKey
        );
        this.pubsub?.publish?.(`REPOSITORY_UPDATED:${repository?.id}`, {
          repositoryUpdated: repository,
        });
        return {
          __typename: "RepositoryWebhookKeySuccess",
          repository,
        };
      }
    ),
    bookmarkRepo: runWithHooks(
      () => [
        this.loggedInUserGuard,
        this.rootRepositoryRemoteSettingsLoader,
      ],
      async (_, {repositoryId}: main.MutationBookmarkRepoArgs, {cacheKey, currentUser}) => {
        if (!currentUser || !repositoryId) {
          return null;
        }

        const cachedRemoteSettings = this.requestCache.getRepoRemoteSettings(
          cacheKey,
          repositoryId
        );

        if (!cachedRemoteSettings?.canReadRepo) {
          return {
            __typename: "RepoSettingAccessError",
            type: "REPO_SETTING_ACCESS_ERROR",
            message: "Repo Setting access error",
          };
        }
        const repository = await this.repositoryService.getRepository(
          repositoryId
        );
        if (!repository) {
          return null
        }
        await this.repoAnnouncementService.bookmarkRepo(
          repository,
          currentUser
        );
        const bookmarkedRepo = await this.repositoryService.getRepository(
          repositoryId
        );
        return {
          __typename: "BookmarkRepoSuccess",
          repository: bookmarkedRepo,
          user: currentUser
        };
      }
    ),
    unbookmarkRepo: runWithHooks(
      () => [
        this.loggedInUserGuard,
        this.rootRepositoryRemoteSettingsLoader,
      ],
      async (_, {repositoryId}: main.MutationUnbookmarkRepoArgs, {cacheKey, currentUser}) => {
        if (!currentUser || !repositoryId) {
          return null;
        }

        const cachedRemoteSettings = this.requestCache.getRepoRemoteSettings(
          cacheKey,
          repositoryId
        );

        if (!cachedRemoteSettings?.canReadRepo) {
          return {
            __typename: "RepoSettingAccessError",
            type: "REPO_SETTING_ACCESS_ERROR",
            message: "Repo Setting access error",
          };
        }
        const repository = await this.repositoryService.getRepository(
          repositoryId
        );
        if (!repository) {
          return null
        }
        await this.repoAnnouncementService.unBookmarkRepo(
          repository,
          currentUser
        );
        const bookmarkedRepo = await this.repositoryService.getRepository(
          repositoryId
        );
        return {
          __typename: "BookmarkRepoSuccess",
          repository: bookmarkedRepo,
          user: currentUser
        };
      }
    ),
    subscribeToRepo: runWithHooks(
      () => [
        this.loggedInUserGuard,
        this.rootRepositoryRemoteSettingsLoader,
      ],
      async (_, {repositoryId}: main.MutationBookmarkRepoArgs, {cacheKey, currentUser}) => {
        if (!currentUser || !repositoryId) {
          return null;
        }

        const cachedRemoteSettings = this.requestCache.getRepoRemoteSettings(
          cacheKey,
          repositoryId
        );

        if (!cachedRemoteSettings?.canReadRepo) {
          return {
            __typename: "RepoSettingAccessError",
            type: "REPO_SETTING_ACCESS_ERROR",
            message: "Repo Setting access error",
          };
        }
        const repository = await this.repositoryService.getRepository(
          repositoryId
        );
        if (!repository) {
          return null
        }
        await this.repoAnnouncementService.subscribeToRepo(
          repository,
          currentUser
        );
        const subscribedRepo = await this.repositoryService.getRepository(
          repositoryId
        );
        return {
          __typename: "SubscribeRepoSuccess",
          repository: subscribedRepo
        };
      }
    ),
    unSubscribeFromRepo: runWithHooks(
      () => [
        this.loggedInUserGuard,
        this.rootRepositoryRemoteSettingsLoader,
      ],
      async (_, {repositoryId}: main.MutationBookmarkRepoArgs, {cacheKey, currentUser}) => {
        if (!currentUser || !repositoryId) {
          return null;
        }

        const cachedRemoteSettings = this.requestCache.getRepoRemoteSettings(
          cacheKey,
          repositoryId
        );

        if (!cachedRemoteSettings?.canReadRepo) {
          return {
            __typename: "RepoSettingAccessError",
            type: "REPO_SETTING_ACCESS_ERROR",
            message: "Repo Setting access error",
          };
        }
        const repository = await this.repositoryService.getRepository(
          repositoryId
        );
        if (!repository) {
          return null
        }
        await this.repoAnnouncementService.unsubscribeFromRepo(
          repository,
          currentUser
        );
        const unsubscribedRepo = await this.repositoryService.getRepository(
          repositoryId
        );
        return {
          __typename: "SubscribeRepoSuccess",
          repository: unsubscribedRepo
        };
      }
    ),
  };

  public Subscription: main.SubscriptionResolvers = {
    repositoryUpdated: {
      subscribe: withFilter(
        (_, { repositoryId }) => {
          if (repositoryId) {
            return this.pubsub.asyncIterator(
              `REPOSITORY_UPDATED:${repositoryId}`
            );
          }
          return this.pubsub.asyncIterator([]);
        },
        runWithHooks(
          () => [],
          async (
            payload: { repositoryUpdated: Repository },
            { repositoryId },
            { currentUser }
          ) => {
            if (!repositoryId) {
              return false;
            }
            if (payload?.repositoryUpdated?.id != repositoryId) {
              return false;
            }
            if (!payload.repositoryUpdated.isPrivate) {
              return true;
            }
            if (payload?.repositoryUpdated?.repoType == "user_repo") {
              return (
                currentUser &&
                currentUser?.id == payload?.repositoryUpdated?.userId
              );
            }
            if (!currentUser) {
              return false;
            }

            const organizationMembersContext =
              await this.contextFactory.createContext(
                OrganizationMembersContext
              );
            const membership =
              await organizationMembersContext.getByOrgIdAndUserId(
                payload.repositoryUpdated.organizationId as string,
                currentUser.id
              );
            if (membership?.membershipState != "active") {
              return false;
            }
            if (payload?.repositoryUpdated.anyoneCanRead) {
              return true;
            }

            const organizationMemberRolesContext =
              await this.contextFactory.createContext(
                OrganizationMemberRolesContext
              );
            const memberRoles =
              await organizationMemberRolesContext.getRolesByMember(membership);
            const isAdmin = !!memberRoles?.find((r) => r.presetCode == "admin");
            if (isAdmin) {
              return true;
            }
            const roleIds = memberRoles?.map((r) => r.id);
            const repositoryEnabledRoleSettingsContext =
              await this.contextFactory.createContext(
                RepositoryEnabledRoleSettingsContext
              );

            const repositoryEnabledUserSettingsContext =
              await this.contextFactory.createContext(
                RepositoryEnabledUserSettingsContext
              );
            const hasUserPermission =
              await repositoryEnabledUserSettingsContext.hasRepoUserId(
                payload.repositoryUpdated.id,
                currentUser.id,
                "anyoneCanRead"
              );
            if (!hasUserPermission) {
              const hasRoles =
                await repositoryEnabledRoleSettingsContext.hasRepoRoleIds(
                  payload.repositoryUpdated.id,
                  roleIds,
                  "anyoneCanRead"
                );
              if (!hasRoles) {
                return false;
              }
            }
            return true;
          }
        )
      ) as unknown as SubscriptionSubscribeFn<any, any, any, any>,
    },
  };
}
