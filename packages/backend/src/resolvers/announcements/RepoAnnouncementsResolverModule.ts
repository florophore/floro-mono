import BaseResolverModule from "../BaseResolverModule";
import { main } from "@floro/graphql-schemas";
import { inject, injectable } from "inversify";
import LoggedInUserGuard from "../hooks/guards/LoggedInUserGuard";
import { runWithHooks } from "../hooks/ResolverHook";
import RequestCache from "../../request/RequestCache";
import ContextFactory from "@floro/database/src/contexts/ContextFactory";
import RootRepositoryLoader from "../hooks/loaders/Root/RepositoryID/RepositoryLoader";
import RepoAccessGuard from "../hooks/guards/RepoAccessGuard";
import RepositoryDatasourceFactoryService from "../../services/repositories/RepoDatasourceFactoryService";
import RepoSettingsService from "../../services/repositories/RepoSettingsService";
import RepoDataService from "../../services/repositories/RepoDataService";
import { withFilter } from "graphql-subscriptions";
import { SubscriptionSubscribeFn } from "@floro/graphql-schemas/build/generated/admin-graphql";
import OrganizationMembersContext from "@floro/database/src/contexts/organizations/OrganizationMembersContext";
import OrganizationMemberRolesContext from "@floro/database/src/contexts/organizations/OrganizationMemberRolesContext";
import RepositoryEnabledRoleSettingsContext from "@floro/database/src/contexts/repositories/RepositoryEnabledRoleSettingsContext";
import RepositoryEnabledUserSettingsContext from "@floro/database/src/contexts/repositories/RepositoryEnabledUserSettingsContext";
import RepoAnnouncementService from "../../services/announcements/RepoAnnouncementService";
import RepoAnnouncementLoader from "../hooks/loaders/RepoAnnouncements/RepoAnnouncementLoader";
import RepoAnnouncementReplyLoader from "../hooks/loaders/RepoAnnouncements/RepoAnnouncementReplyLoader";
import { RepoAnnouncement } from "@floro/database/src/entities/RepoAnnouncement";
import RepoAnnouncementsContext from "@floro/database/src/contexts/announcements/RepoAnnouncementsContext";

const PAGINATION_LIMIT = 10;

@injectable()
export default class RepoAnnouncementsResolverModule extends BaseResolverModule {
  public resolvers: Array<keyof this & keyof main.ResolversTypes> = [
    "Query",
    "Mutation",
    "Subscription",
  ];
  protected contextFactory!: ContextFactory;
  protected requestCache!: RequestCache;
  protected repoDataService!: RepoDataService;
  protected repositoryDatasourceFactoryService!: RepositoryDatasourceFactoryService;
  protected repoAnnouncementService!: RepoAnnouncementService;

  //loaders
  protected rootRepositoryLoader!: RootRepositoryLoader;

  protected repoSettingsService!: RepoSettingsService;

  protected repoAnnouncementLoader!: RepoAnnouncementLoader;
  protected repoAnnouncementReplyLoader!: RepoAnnouncementReplyLoader;

  // guards
  protected loggedInUserGuard!: LoggedInUserGuard;
  protected repoAccessGuard!: RepoAccessGuard;

  constructor(
    @inject(ContextFactory) contextFactory: ContextFactory,
    @inject(RequestCache) requestCache: RequestCache,
    @inject(RepositoryDatasourceFactoryService)
    repositoryDatasourceFactoryService: RepositoryDatasourceFactoryService,
    @inject(LoggedInUserGuard) loggedInUserGuard: LoggedInUserGuard,
    @inject(RootRepositoryLoader) rootRepositoryLoader: RootRepositoryLoader,
    @inject(RepoAccessGuard) repoAccessGuard: RepoAccessGuard,
    @inject(RepoDataService)
    repoDataService: RepoDataService,
    @inject(RepoSettingsService) repoSettingsService: RepoSettingsService,
    @inject(RepoAnnouncementService)
    repoAnnouncementService: RepoAnnouncementService,
    @inject(RepoAnnouncementLoader)
    repoAnnouncementLoader: RepoAnnouncementLoader,
    @inject(RepoAnnouncementReplyLoader)
    repoAnnouncementReplyLoader: RepoAnnouncementReplyLoader
  ) {
    super();
    this.requestCache = requestCache;
    this.contextFactory = contextFactory;
    this.repoDataService = repoDataService;
    this.repositoryDatasourceFactoryService =
      repositoryDatasourceFactoryService;
    this.repoSettingsService = repoSettingsService;

    this.repoAnnouncementService = repoAnnouncementService;

    // guards
    this.loggedInUserGuard = loggedInUserGuard;
    this.repoAccessGuard = repoAccessGuard;

    // loaders
    this.rootRepositoryLoader = rootRepositoryLoader;

    this.repoAnnouncementLoader = repoAnnouncementLoader;
    this.repoAnnouncementReplyLoader = repoAnnouncementReplyLoader;
  }

  public Query: main.QueryResolvers = {

    fetchRepoAnnouncement: runWithHooks(
      () => [this.loggedInUserGuard],
      async (_, args: main.QueryFetchRepoAnnouncementArgs, { currentUser }) => {

        const repoAnnouncementsContext = await this.contextFactory.createContext(
          RepoAnnouncementsContext
        );
        try {
          const repoAnnouncement = await repoAnnouncementsContext.getByIdWithRelations(args.repoAnnouncementId);
          if (!repoAnnouncement?.repository) {
            return null;
          }
          const remoteSettings =
            await this.repoDataService.fetchRepoSettingsForUser(
              repoAnnouncement?.repository.id,
              currentUser
            );
          if (!remoteSettings?.canReadRepo) {
            return null;
          }
          return {
            __typename: "FetchRepoAnnouncementResult",
            repoAnnouncement
          }
        } catch (e) {
          return null;
        }
      }
    ),
    fetchFeed: runWithHooks(
      () => [this.loggedInUserGuard],
      async (_, args: main.QueryFetchFeedArgs, { currentUser }) => {
        const result = await this.repoAnnouncementService.fetchFeed(
          currentUser,
          args?.lastId as string
        );
        if (!result) {
          return null;
        }
        return {
          ...result,
          __typename: "FetchRepoAnnouncementsResult",
        };
      }
    ),
    fetchOrgRepoAnnouncements: runWithHooks(
      () => [this.loggedInUserGuard],
      async (_, args: main.QueryFetchOrgRepoAnnouncementsArgs, { currentUser }) => {
        const result = await this.repoAnnouncementService.fetchRepoAnnouncementsForOrg(
          args.organizationId,
          currentUser,
          args?.lastId as string
        );
        if (!result) {
          return null;
        }
        return {
          ...result,
          __typename: "FetchRepoAnnouncementsResult",
        };
      }
    ),
    fetchUserRepoAnnouncements: runWithHooks(
      () => [this.loggedInUserGuard],
      async (_, args: main.QueryFetchUserRepoAnnouncementsArgs, { currentUser }) => {
        const result = await this.repoAnnouncementService.fetchRepoAnnouncementsForUser(
          args.userId,
          currentUser,
          args?.lastId as string
        );
        if (!result) {
          return null;
        }
        return {
          ...result,
          __typename: "FetchRepoAnnouncementsResult",
        };
      }
    ),
    fetchRepoAnnouncements: runWithHooks(
      () => [this.loggedInUserGuard],
      async (_, args: main.QueryFetchRepoAnnouncementsArgs, { currentUser }) => {
        const result = await this.repoAnnouncementService.fetchRepoAnnouncementsForRepo(
          args.repositoryId,
          currentUser,
          args?.lastId as string
        );
        if (!result) {
          return null;
        }
        return {
          ...result,
          __typename: "FetchRepoAnnouncementsResult",
        };
      }
    ),
  };

  public Mutation: main.MutationResolvers = {
    createRepoAnnouncementComment: runWithHooks(
      () => [
        this.loggedInUserGuard,
        this.repoAccessGuard,
        this.rootRepositoryLoader,
      ],
      async (
        _,
        args: main.MutationCreateRepoAnnouncementCommentArgs,
        { currentUser, cacheKey }
      ) => {
        if (!currentUser) {
          return null;
        }
        const repository = this.requestCache.getRepo(
          cacheKey,
          args.repositoryId
        );
        const result =
          await this.repoAnnouncementService.createRepoAnnouncement(
            repository,
            currentUser,
            args.text
          );

        if (result.action == "REPO_ANNOUNCEMENT_CREATED") {
          return {
            __typename: "CreateRepoAnnouncementSuccess",
            repository: repository,
            repoAnnouncement: result.repoAnnouncement,
          };
        }
        if (result.action == "LOG_ERROR") {
          console.error(
            result.error?.type,
            result?.error?.message,
            result?.error?.meta
          );
          return {
            __typename: "CreateRepoAnnouncementError",
            message: "Unknown Error",
            type: "UNKNOWN_ERROR",
          };
        }
        return {
          __typename: "CreateRepoAnnouncementError",
          message: result.error?.message ?? "Unknown Error",
          type: result.error?.type ?? "UNKNOWN_ERROR",
        };
      }
    ),
    updateRepoAnnouncementComment: runWithHooks(
      () => [
        this.loggedInUserGuard,
        this.repoAccessGuard,
        this.rootRepositoryLoader,
        this.repoAnnouncementLoader,
      ],
      async (
        _,
        args: main.MutationUpdateRepoAnnouncementCommentArgs,
        { currentUser, cacheKey }
      ) => {
        if (!currentUser) {
          return null;
        }
        const repository = this.requestCache.getRepo(
          cacheKey,
          args.repositoryId
        );
        const repoAnnouncement = this.requestCache.getRepoAnnouncement(
          cacheKey,
          args.repoAnnouncementId
        );
        if (!repoAnnouncement) {
          return null;
        }
        const result =
          await this.repoAnnouncementService.updateRepoAnnouncement(
            repoAnnouncement,
            repository,
            currentUser,
            args.text
          );

        if (result.action == "REPO_ANNOUNCEMENT_UPDATED") {
          this.pubsub?.publish?.(
            `MERGE_REQUEST_UPDATED:${result?.repoAnnouncement?.id}`,
            {
              repoAnnouncementUpdated: result.repoAnnouncement,
            }
          );
          return {
            __typename: "UpdateRepoAnnouncementSuccess",
            repository: repository,
            repoAnnouncement: result.repoAnnouncement,
          };
        }
        if (result.action == "LOG_ERROR") {
          console.error(
            result.error?.type,
            result?.error?.message,
            result?.error?.meta
          );
          return {
            __typename: "UpdateRepoAnnouncementError",
            message: "Unknown Error",
            type: "UNKNOWN_ERROR",
          };
        }
        return {
          __typename: "UpdateRepoAnnouncementError",
          message: result.error?.message ?? "Unknown Error",
          type: result.error?.type ?? "UNKNOWN_ERROR",
        };
      }
    ),
    deleteRepoAnnouncementComment: runWithHooks(
      () => [
        this.loggedInUserGuard,
        this.repoAccessGuard,
        this.rootRepositoryLoader,
        this.repoAnnouncementLoader,
      ],
      async (
        _,
        args: main.MutationDeleteRepoAnnouncementCommentArgs,
        { currentUser, cacheKey }
      ) => {
        const repository = this.requestCache.getRepo(
          cacheKey,
          args.repositoryId
        );
        const repoAnnouncement = this.requestCache.getRepoAnnouncement(
          cacheKey,
          args.repoAnnouncementId
        );
        if (!repoAnnouncement) {
          return null;
        }
        const result =
          await this.repoAnnouncementService.deleteRepoAnnouncement(
            repoAnnouncement,
            repository,
            currentUser
          );

        if (result.action == "REPO_ANNOUNCEMENT_DELETED") {

          this.pubsub?.publish?.(
            `MERGE_REQUEST_UPDATED:${result?.repoAnnouncement?.id}`,
            {
              repoAnnouncementUpdated: result.repoAnnouncement,
            }
          );
          return {
            __typename: "DeleteRepoAnnouncementSuccess",
            repository: repository,
            repoAnnouncement: result.repoAnnouncement,
          };
        }
        if (result.action == "LOG_ERROR") {
          console.error(
            result.error?.type,
            result?.error?.message,
            result?.error?.meta
          );
          return {
            __typename: "DeleteRepoAnnouncementError",
            message: "Unknown Error",
            type: "UNKNOWN_ERROR",
          };
        }
        return {
          __typename: "DeleteRepoAnnouncementError",
          message: result.error?.message ?? "Unknown Error",
          type: result.error?.type ?? "UNKNOWN_ERROR",
        };
      }
    ),
    createRepoAnnouncementReplyComment: runWithHooks(
      () => [
        this.loggedInUserGuard,
        this.repoAccessGuard,
        this.rootRepositoryLoader,
        this.repoAnnouncementLoader,
      ],
      async (
        _,
        args: main.MutationCreateRepoAnnouncementReplyCommentArgs,
        { currentUser, cacheKey }
      ) => {
        const repository = this.requestCache.getRepo(
          cacheKey,
          args.repositoryId
        );
        const repoAnnouncement = this.requestCache.getRepoAnnouncement(
          cacheKey,
          args.repoAnnouncementId
        );
        if (!repoAnnouncement) {
          return null;
        }

        const result =
          await this.repoAnnouncementService.createRepoAnnouncementReply(
            repoAnnouncement,
            repository,
            currentUser,
            args.text
          );
        if (result.action == "REPO_ANNOUNCEMENT_REPLY_CREATED") {
          this.pubsub?.publish?.(
            `MERGE_REQUEST_UPDATED:${result?.repoAnnouncement?.id}`,
            {
              repoAnnouncementUpdated: result.repoAnnouncement,
            }
          );
          return {
            __typename: "CreateRepoAnnouncementReplySuccess",
            repository: repository,
            repoAnnouncement: result.repoAnnouncement,
          };
        }
        if (result.action == "LOG_ERROR") {
          console.error(
            result.error?.type,
            result?.error?.message,
            result?.error?.meta
          );
          return {
            __typename: "CreateRepoAnnouncementReplyError",
            message: "Unknown Error",
            type: "UNKNOWN_ERROR",
          };
        }
        return {
          __typename: "CreateRepoAnnouncementReplyError",
          message: result.error?.message ?? "Unknown Error",
          type: result.error?.type ?? "UNKNOWN_ERROR",
        };
      }
    ),
    updateRepoAnnouncementReplyComment: runWithHooks(
      () => [
        this.loggedInUserGuard,
        this.repoAccessGuard,
        this.rootRepositoryLoader,
        this.repoAnnouncementLoader,
        this.repoAnnouncementReplyLoader,
      ],
      async (
        _,
        args: main.MutationUpdateRepoAnnouncementReplyCommentArgs,
        { currentUser, cacheKey }
      ) => {
        const repository = this.requestCache.getRepo(
          cacheKey,
          args.repositoryId
        );
        const repoAnnouncement = this.requestCache.getRepoAnnouncement(
          cacheKey,
          args.repoAnnouncementId
        );
        if (!repoAnnouncement) {
          return null;
        }
        const repoAnnouncementReply =
          this.requestCache.getRepoAnnouncementReply(
            cacheKey,
            args.repoAnnouncementReplyId
          );
        if (!repoAnnouncementReply) {
          return null;
        }

        const result =
          await this.repoAnnouncementService.updateRepoAnnouncementReply(
            repoAnnouncementReply,
            repoAnnouncement,
            repository,
            currentUser,
            args.text
          );
        if (result.action == "REPO_ANNOUNCEMENT_REPLY_UPDATED") {
          this.pubsub?.publish?.(
            `MERGE_REQUEST_UPDATED:${result?.repoAnnouncement?.id}`,
            {
              repoAnnouncementUpdated: result.repoAnnouncement,
            }
          );
          return {
            __typename: "UpdateRepoAnnouncementReplySuccess",
            repository: repository,
            repoAnnouncement: result.repoAnnouncement,
          };
        }
        if (result.action == "LOG_ERROR") {
          console.error(
            result.error?.type,
            result?.error?.message,
            result?.error?.meta
          );
          return {
            __typename: "UpdateRepoAnnouncementReplyError",
            message: "Unknown Error",
            type: "UNKNOWN_ERROR",
          };
        }
        return {
          __typename: "UpdateRepoAnnouncementReplyError",
          message: result.error?.message ?? "Unknown Error",
          type: result.error?.type ?? "UNKNOWN_ERROR",
        };
      }
    ),

    deleteRepoAnnouncementReplyComment: runWithHooks(
      () => [
        this.loggedInUserGuard,
        this.repoAccessGuard,
        this.rootRepositoryLoader,
        this.repoAnnouncementLoader,
        this.repoAnnouncementReplyLoader,
      ],
      async (
        _,
        args: main.MutationDeleteRepoAnnouncementReplyCommentArgs,
        { currentUser, cacheKey }
      ) => {
        const repository = this.requestCache.getRepo(
          cacheKey,
          args.repositoryId
        );
        const repoAnnouncement = this.requestCache.getRepoAnnouncement(
          cacheKey,
          args.repoAnnouncementId
        );
        if (!repoAnnouncement) {
          return null;
        }
        const repoAnnouncementReply =
          this.requestCache.getRepoAnnouncementReply(
            cacheKey,
            args.repoAnnouncementReplyId
          );
        if (!repoAnnouncementReply) {
          return null;
        }

        const result =
          await this.repoAnnouncementService.deleteRepoAnnouncementReply(
            repoAnnouncementReply,
            repoAnnouncement,
            repository,
            currentUser
          );
        if (result.action == "REPO_ANNOUNCEMENT_REPLY_DELETED") {
          this.pubsub?.publish?.(
            `MERGE_REQUEST_UPDATED:${result?.repoAnnouncement?.id}`,
            {
              repoAnnouncementUpdated: result.repoAnnouncement,
            }
          );
          return {
            __typename: "DeleteRepoAnnouncementReplySuccess",
            repository: repository,
            repoAnnouncement: result.repoAnnouncement,
          };
        }
        if (result.action == "LOG_ERROR") {
          console.error(
            result.error?.type,
            result?.error?.message,
            result?.error?.meta
          );
          return {
            __typename: "DeleteRepoAnnouncementReplyError",
            message: "Unknown Error",
            type: "UNKNOWN_ERROR",
          };
        }
        return {
          __typename: "DeleteRepoAnnouncementReplyError",
          message: result.error?.message ?? "Unknown Error",
          type: result.error?.type ?? "UNKNOWN_ERROR",
        };
      }
    ),
  };

  public Subscription: main.SubscriptionResolvers = {
    repoAnnouncementUpdated: {
      subscribe: withFilter(
        (_, { repoAnnouncementId }) => {
          if (repoAnnouncementId) {
            return this.pubsub.asyncIterator(
              `REPO_ANNOUNCEMENT_UPDATED:${repoAnnouncementId}`
            );
          }
          return this.pubsub.asyncIterator([]);
        },
        runWithHooks(
          () => [],
          async (
            payload: { repoAnnouncementUpdated: RepoAnnouncement },
            args: { repoAnnouncementId: string },
            context
          ) => {
            const currentUser = context.currentUser;
            if (
              payload?.repoAnnouncementUpdated?.id != args.repoAnnouncementId
            ) {
              return false;
            }
            const repository = await this.repoDataService.fetchRepoById(
              payload.repoAnnouncementUpdated?.repositoryId
            );
            if (!repository) {
              return false;
            }
            if (!repository.isPrivate) {
              return true;
            }
            if (repository?.repoType == "user_repo") {
              return currentUser && currentUser?.id == repository?.userId;
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
                repository.organizationId as string,
                currentUser.id
              );
            if (membership?.membershipState != "active") {
              return false;
            }
            if (repository.anyoneCanRead) {
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
