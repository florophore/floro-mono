import BaseResolverModule from "../BaseResolverModule";
import { main } from "@floro/graphql-schemas";
import { inject, injectable } from "inversify";
import { User } from "@floro/database/src/entities/User";
import {
  Referral,
  UsernameCheckResult,
} from "@floro/graphql-schemas/src/generated/main-graphql";
import UsersService from "../../services/users/UsersService";
import { USERNAME_REGEX } from "@floro/common-web/src/utils/validators";
import ContextFactory from "@floro/database/src/contexts/ContextFactory";
import UsersContext from "@floro/database/src/contexts/users/UsersContext";
import OrganizationsContext from "@floro/database/src/contexts/organizations/OrganizationsContext";
import RequestCache from "../../request/RequestCache";
import { OrganizationMember } from "@floro/database/src/entities/OrganizationMember";
import { OrganizationRole } from "@floro/database/src/entities/OrganizationRole";
import { OrganizationInvitation } from "@floro/database/src/entities/OrganizationInvitation";
import LoggedInUserGuard from "../hooks/guards/LoggedInUserGuard";
import { runWithHooks } from "../hooks/ResolverHook";
import OrganizationInvitationsContext from "@floro/database/src/contexts/organizations/OrganizationInvitationsContext";
import OrganizationInvitationService from "../../services/organizations/OrganizationInvitationService";
import ReferralsContext from "@floro/database/src/contexts/referrals/ReferralsContext";
import RepositoriesContext from "@floro/database/src/contexts/repositories/RepositoriesContext";
import {
  Repository,
  SubscriptionSubscribeFn,
} from "@floro/graphql-schemas/build/generated/main-graphql";
import PhotoUploadService from "../../services/photos/PhotoUploadService";
import PhotosContext from "@floro/database/src/contexts/photos/PhotosContext";
import { Photo } from "@floro/database/src/entities/Photo";
import PluginsContext from "@floro/database/src/contexts/plugins/PluginsContext";
import ApiKeysContext from "@floro/database/src/contexts/api_keys/ApiKeysContext";
import WebhookKeysContext from "@floro/database/src/contexts/api_keys/WebhookKeysContext";
import RepoAnnouncementService from "../../services/announcements/RepoAnnouncementService";
import NotificationsContext from "@floro/database/src/contexts/notifications/NotificationsContext";
import NotificationsService from "../../services/notifications/NotificationsService";
import { withFilter } from "graphql-subscriptions";

declare type UserSettingType =
  | "hideBookmarksInProfile"
  | "hideOrganizationsInProfile"
  | "muteRepoAnnouncementReplyAdded"
  | "muteRepoWriteAccessGranted"
  | "muteMergeRequestBranchUpdated"
  | "muteMergeRequestMergedOrClosed"
  | "muteMergeRequestReviewStatusChanged"
  | "muteMergeRequestCommentAdded"
  | "muteMergeRequestCommentReplyAdded";

@injectable()
export default class UsersResolverModule extends BaseResolverModule {
  public resolvers: Array<keyof this & keyof main.ResolversTypes> = [
    "Query",
    "User",
    "Mutation",
    "Subscription",
  ];
  protected usersService!: UsersService;
  protected contextFactory!: ContextFactory;
  protected requestCache!: RequestCache;

  protected photoUploadService!: PhotoUploadService;
  protected organizationInvitationService!: OrganizationInvitationService;
  protected loggedInUserGuard!: LoggedInUserGuard;
  protected repoAnnouncementService!: RepoAnnouncementService;
  protected notificationsService!: NotificationsService;

  constructor(
    @inject(ContextFactory) contextFactory: ContextFactory,
    @inject(RequestCache) requestCache: RequestCache,
    @inject(UsersService) usersService: UsersService,
    @inject(PhotoUploadService) photoUploadService: PhotoUploadService,
    @inject(OrganizationInvitationService)
    organizationInvitationService: OrganizationInvitationService,
    @inject(LoggedInUserGuard) loggedInUserGuard: LoggedInUserGuard,
    @inject(RepoAnnouncementService)
    repoAnnouncementService: RepoAnnouncementService,
    @inject(NotificationsService)
    notificationsService: NotificationsService
  ) {
    super();
    this.contextFactory = contextFactory;
    this.usersService = usersService;
    this.requestCache = requestCache;

    this.photoUploadService = photoUploadService;
    this.organizationInvitationService = organizationInvitationService;
    this.loggedInUserGuard = loggedInUserGuard;
    this.repoAnnouncementService = repoAnnouncementService;
    this.notificationsService = notificationsService;
  }

  public Query: main.QueryResolvers = {
    fetchNotifications: runWithHooks(
      () => [this.loggedInUserGuard],
      async (_, args: main.QueryFetchNotificationsArgs, { currentUser }) => {
        const result = await this.notificationsService.fetchNotifications(
          currentUser,
          args?.lastId as string
        );
        if (!result) {
          return null;
        }
        return {
          ...result,
          __typename: "FetchNotificationsResult",
        };
      }
    ),
    user: async (_root, { id }) => {
      const usersContext = await this.contextFactory.createContext(
        UsersContext
      );
      return await usersContext.getById(id);
    },
    userByUsername: async (_root, { username }) => {
      const usersContext = await this.contextFactory.createContext(
        UsersContext
      );
      return await usersContext.getByUsername(username);
    },
    currentUser: runWithHooks(
      () => [this.loggedInUserGuard],
      async (_root, _, { currentUser }) => {
        return {
          __typename: "User",
          ...currentUser,
        };
      }
    ),
    usernameCheck: async (
      _root,
      { username }
    ): Promise<UsernameCheckResult> => {
      if (!username || username == "" || !USERNAME_REGEX.test(username)) {
        return {
          __typename: "UsernameCheckResult",
          exists: false,
          username: username ?? "",
        };
      }
      const exists = await this.usersService.checkUsernameIsTaken(
        username ?? ""
      );
      return {
        __typename: "UsernameCheckResult",
        exists,
        username: username,
      };
    },
    searchUsers: async (_, { query }) => {
      if (
        ((query ?? "")?.length < 2 && query?.[0] != "@") ||
        (query?.[0] == "@" && (query ?? "")?.length < 3)
      ) {
        return [];
      }
      const usersContext = await this.contextFactory.createContext(
        UsersContext
      );
      return await usersContext.searchUsers(query ?? "");
    },
  };

  public Mutation: main.MutationResolvers = {
    updateUserName: runWithHooks(
      () => [],
      async (
        _root,
        { firstName, lastName }: main.MutationUpdateUserNameArgs,
        { currentUser }
      ) => {
        const result = await this.usersService.updateUserName(
          currentUser,
          firstName,
          lastName
        );
        if (result.action == "UPDATE_USER_NAME_SUCCEEDED") {
          return {
            __typename: "UpdateUserNameSuccess",
            user: result.user,
          };
        }
        if (result.action == "LOG_ERROR") {
          console.error(
            result.error?.type,
            result?.error?.message,
            result?.error?.meta
          );
          return {
            __typename: "UpdateUserNameError",
            message: "Unknown Error",
            type: "UNKNOWN_ERROR",
          };
        }
        return {
          __typename: "UpdateUserNameError",
          message: result.error?.message ?? "Unknown Error",
          type: result.error?.type ?? "UNKNOWN_ERROR",
        };
      }
    ),
    acceptOrganizationInvitation: runWithHooks(
      () => [this.loggedInUserGuard],
      async (
        _root,
        { invitationId }: main.MutationRejectOrganizationInvitationArgs,
        { currentUser }
      ) => {
        const organizationInvitationsContext =
          await this.contextFactory.createContext(
            OrganizationInvitationsContext
          );
        const organizationInvitation =
          await organizationInvitationsContext.getById(invitationId);
        if (!organizationInvitation) {
          return {
            __typename: "AcceptOrganizationInvitationError",
            message: "Unknown Error",
            type: "UNKNOWN_ERROR",
          };
        }
        const result =
          await this.organizationInvitationService.acceptInvitation(
            organizationInvitation,
            currentUser
          );

        if (result.action == "INVITATION_ACCEPTED") {
          return {
            __typename: "AcceptOrganizationInvitationSuccess",
            organizationInvitation: result.organizationInvitation,
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
            __typename: "AcceptOrganizationInvitationError",
            message: "Unknown Error",
            type: "UNKNOWN_ERROR",
          };
        }
        return {
          __typename: "AcceptOrganizationInvitationError",
          message: result.error?.message ?? "Unknown Error",
          type: result.error?.type ?? "UNKNOWN_ERROR",
        };
      }
    ),
    rejectOrganizationInvitation: runWithHooks(
      () => [this.loggedInUserGuard],
      async (
        _root,
        { invitationId }: main.MutationAcceptOrganizationInvitationArgs,
        { currentUser }
      ) => {
        const organizationInvitationsContext =
          await this.contextFactory.createContext(
            OrganizationInvitationsContext
          );
        const organizationInvitation =
          await organizationInvitationsContext.getById(invitationId);
        if (!organizationInvitation) {
          return {
            __typename: "RejectOrganizationInvitationError",
            message: "Unknown Error",
            type: "UNKNOWN_ERROR",
          };
        }
        const result =
          await this.organizationInvitationService.rejectInvitation(
            organizationInvitation,
            currentUser
          );

        if (result.action == "INVITATION_REJECTED") {
          return {
            __typename: "RejectOrganizationInvitationSuccess",
            organizationInvitation: result.organizationInvitation,
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
            __typename: "RejectOrganizationInvitationError",
            message: "Unknown Error",
            type: "UNKNOWN_ERROR",
          };
        }
        return {
          __typename: "RejectOrganizationInvitationError",
          message: result.error?.message ?? "Unknown Error",
          type: result.error?.type ?? "UNKNOWN_ERROR",
        };
      }
    ),
    clearNotification: runWithHooks(
      () => [],
      async (_, args: main.MutationClearNotificationArgs, { currentUser }) => {
        const notificationsContext = await this.contextFactory.createContext(
          NotificationsContext
        );
        const notification = await notificationsContext.getById(
          args.notificationId
        );
        if (notification?.userId != currentUser?.id || !notification) {
          return {
            __typename: "ClearNotificationError",
            message: "Unknown error",
            type: "UNKNOWN_ERROR",
          };
        }
        const updatedNotification =
          await notificationsContext.updatehNotification(notification, {
            hasBeenChecked: true,
          });
        return {
          __typename: "ClearNotificationResult",
          notification: updatedNotification,
          user: currentUser,
        };
      }
    ),
    clearRepoAnnouncementNotifications: runWithHooks(
      () => [],
      async (
        _,
        args: main.MutationClearRepoAnnouncementNotificationsArgs,
        { currentUser }
      ) => {
        const notificationsContext = await this.contextFactory.createContext(
          NotificationsContext
        );
        if (!args.repoAnnouncementId) {
          return {
            __typename: "ClearNotificationsError",
            message: "Unknown error",
            type: "UNKNOWN_ERROR",
          };
        }
        await notificationsContext.markCheckedRepoAnnouncementNotificationsForUser(
          args.repoAnnouncementId,
          currentUser.id
        );
        return {
          __typename: "ClearNotificationsResult",
          user: currentUser,
        };
      }
    ),
    clearMergeRequestNotifications: runWithHooks(
      () => [],
      async (
        _,
        args: main.MutationClearMergeRequestNotificationsArgs,
        { currentUser }
      ) => {
        const notificationsContext = await this.contextFactory.createContext(
          NotificationsContext
        );
        if (!args.mergeRequestId) {
          return {
            __typename: "ClearNotificationsError",
            message: "Unknown error",
            type: "UNKNOWN_ERROR",
          };
        }
        await notificationsContext.markCheckedMergeRequestNotificationsForUser(
          args.mergeRequestId,
          currentUser.id
        );
        return {
          __typename: "ClearNotificationsResult",
          user: currentUser,
        };
      }
    ),
    clearRepositoryNotifications: runWithHooks(
      () => [],
      async (
        _,
        args: main.MutationClearRepositoryNotificationsArgs,
        { currentUser }
      ) => {
        const notificationsContext = await this.contextFactory.createContext(
          NotificationsContext
        );
        if (!args.repositoryId) {
          return {
            __typename: "ClearNotificationsError",
            message: "Unknown error",
            type: "UNKNOWN_ERROR",
          };
        }
        await notificationsContext.markCheckedRepositoryNotificationsForUser(
          args.repositoryId,
          currentUser.id
        );
        return {
          __typename: "ClearNotificationsResult",
          user: currentUser,
        };
      }
    ),
    updateUserSetting: runWithHooks(
      () => [this.loggedInUserGuard],
      async (_, args: main.MutationUpdateUserSettingArgs, context) => {

        const settingsSet = new Set<UserSettingType>([
          "hideBookmarksInProfile",
          "hideOrganizationsInProfile",
          "muteRepoAnnouncementReplyAdded",
          "muteRepoWriteAccessGranted",
          "muteMergeRequestBranchUpdated",
          "muteMergeRequestMergedOrClosed",
          "muteMergeRequestReviewStatusChanged",
          "muteMergeRequestCommentAdded",
          "muteMergeRequestCommentReplyAdded",
        ]);
        if (!settingsSet.has(args.settingName as UserSettingType)) {
          return {
            __typename: "UpdateUserSettingError",
            message: "Unknown setting type",
            type: "UNKNOWN_SETTING_TYPE",
          };
        }
        const usersContext = await this.contextFactory.createContext(
          UsersContext
        );
        const user = await usersContext.updateUserById(context.currentUser?.id, {
          [args.settingName]: !!args.value
        });
        return {
          __typename: "UpdateUserSettingSuccess",
          user
        };
      }
    ),
  };

  public User: main.UserResolvers = {
    profilePhoto: async (user) => {
      if (user?.profilePhoto) return user?.profilePhoto;
      if (!(user as User)?.profilePhotoId) return null;
      const photosContext = await this.contextFactory.createContext(
        PhotosContext
      );
      const photo = await photosContext.getById(
        (user as User)?.profilePhotoId ?? ""
      );
      return (photo as Photo) ?? null;
    },
    freeDiskSpaceBytes: (user, _, { currentUser }) => {
      if (user.id == currentUser?.id) {
        return user?.freeDiskSpaceBytes ?? null;
      }
      return null;
    },
    diskSpaceLimitBytes: (user, _, { currentUser }) => {
      if (user.id == currentUser?.id) {
        return user?.diskSpaceLimitBytes ?? null;
      }
      return null;
    },
    utilizedDiskSpaceBytes: (user, _, { currentUser }) => {
      if (user.id == currentUser?.id) {
        return user?.utilizedDiskSpaceBytes ?? null;
      }
      return null;
    },
    organizations: async (user, _, { currentUser, cacheKey }) => {
      if (user.id != currentUser.id) {
        //return null;
      }
      const cachedOrganizations = this.requestCache.getUserOrganizations(
        cacheKey,
        user.id as string
      );
      if (cachedOrganizations) {
        return cachedOrganizations;
      }
      const organizationsContext = await this.contextFactory.createContext(
        OrganizationsContext
      );
      const organizations =
        await organizationsContext.getAllOrganizationsForUser(
          user.id as string
        );
      organizations.forEach((organization) => {
        this.requestCache.setOrganization(cacheKey, organization);
        this.requestCache.setOrganizationRoles(
          cacheKey,
          organization,
          organization.organizationRoles as OrganizationRole[]
        );
        this.requestCache.setOrganizationMembers(
          cacheKey,
          organization,
          organization.organizationMembers as OrganizationMember[]
        );
        organization.organizationMembers?.forEach((member) => {
          const roles = organization.organizationMemberRoles
            ?.filter((memberRole) => {
              return memberRole.organizationMemberId == member.id;
            })
            .map((memberRole) => {
              this.requestCache.setOrganizationMembership(
                cacheKey,
                organization,
                member.user as User,
                memberRole.organizationMember as OrganizationMember
              );
              return memberRole.organizationRole;
            });
          this.requestCache.setMembershipRoles(
            cacheKey,
            member,
            roles as OrganizationRole[]
          );
        });
        this.requestCache.setOrganizationActiveMemberCount(
          cacheKey,
          organization,
          organization?.organizationMembers?.filter(
            (member) => member?.membershipState == "active"
          )?.length ?? 0
        );

        const invitations = organization?.organizationInvitations;
        this.requestCache.setOrganizationInvitations(
          cacheKey,
          organization,
          invitations as OrganizationInvitation[]
        );
        invitations?.forEach?.((invitation) => {
          const roles =
            invitation?.organizationInvitationRoles
              ?.filter?.(
                (invitationRole) =>
                  invitationRole.organizationInvitationId == invitation.id
              )
              ?.map?.((invitationRole) => invitationRole?.organizationRole)
              ?.filter?.((v) => v != undefined) ?? [];
          this.requestCache.setOrganizationInvitationRoles(
            cacheKey,
            invitation,
            roles as OrganizationRole[]
          );
        });
        this.requestCache.setOrganizationSentInvitationsCount(
          cacheKey,
          organization,
          invitations?.filter?.((invite) => invite?.invitationState == "sent")
            ?.length ?? 0
        );
      });
      this.requestCache.setUserOrganizations(
        cacheKey,
        user as User,
        organizations
      );
      return organizations;
    },
    organizationInvitations: async (user, _, { currentUser }) => {
      if (user?.id != currentUser?.id) {
        return null;
      }
      const organizationInvitationsContext =
        await this.contextFactory.createContext(OrganizationInvitationsContext);
      return await organizationInvitationsContext.getAllInvitationsForUser(
        user.id as string
      );
    },
    sentReferrals: async (user, _, { currentUser }) => {
      if (currentUser?.id != user.id) {
        return null;
      }
      if (!user.id) {
        return null;
      }
      const referralsContext = await this.contextFactory.createContext(
        ReferralsContext
      );
      return (await referralsContext.getPendingSentReferrals(
        user.id
      )) as unknown as Referral[];
    },
    sentClaimedReferrals: async (user, _, { currentUser }) => {
      if (currentUser?.id != user.id) {
        return null;
      }
      if (!user.id) {
        return null;
      }
      const referralsContext = await this.contextFactory.createContext(
        ReferralsContext
      );
      return (await referralsContext.getClaimedSentReferrals(
        user.id
      )) as unknown as Referral[];
    },
    claimedReferral: async (user, _, { currentUser }) => {
      if (currentUser?.id != user.id) {
        return null;
      }
      if (!user.id) {
        return null;
      }
      const referralsContext = await this.contextFactory.createContext(
        ReferralsContext
      );
      return (await referralsContext.getClaimedReferral(
        user.id
      )) as unknown as Referral;
    },
    receivedPendingReferral: async (user, _, { currentUser }) => {
      if (currentUser?.id != user.id) {
        return null;
      }
      if (!user.id) {
        return null;
      }
      const referralsContext = await this.contextFactory.createContext(
        ReferralsContext
      );
      return (await referralsContext.getPendingReferral(
        user.id
      )) as unknown as Referral;
    },
    publicRepositories: async (user, _, { cacheKey, currentUser }) => {
      const cachedPublicRepos = this.requestCache.getUserPublicRepos(
        cacheKey,
        user?.id as string
      );
      if (cachedPublicRepos) {
        return cachedPublicRepos as Repository[];
      }
      const repositoriesContext = await this.contextFactory.createContext(
        RepositoriesContext
      );
      const publicRepos = await repositoriesContext.getUserReposByType(
        user.id as string,
        false
      );
      this.requestCache.setUserPublicRepos(cacheKey, user as User, publicRepos);
      return publicRepos;
    },
    privateRepositories: async (user, _, { cacheKey, currentUser }) => {
      if (user.id != currentUser?.id) {
        return null;
      }
      const cachedPrivateRepos = this.requestCache.getUserPrivateRepos(
        cacheKey,
        user.id as string
      );
      if (cachedPrivateRepos) {
        return cachedPrivateRepos as Repository[];
      }
      const repositoriesContext = await this.contextFactory.createContext(
        RepositoriesContext
      );
      const privateRepos = await repositoriesContext.getUserReposByType(
        user.id as string,
        true
      );
      this.requestCache.setUserPrivateRepos(
        cacheKey,
        user as User,
        privateRepos
      );
      return privateRepos;
    },
    publicPlugins: async (user, _, { cacheKey }) => {
      const cachedPublicPlugins = this.requestCache.getUserPublicPlugins(
        cacheKey,
        user.id as string
      );
      if (cachedPublicPlugins) {
        return cachedPublicPlugins;
      }
      const pluginsContext = await this.contextFactory.createContext(
        PluginsContext
      );
      const publicPlugins = await pluginsContext.getUserPluginsByType(
        user?.id as string,
        false
      );
      this.requestCache.setUserPublicPlugins(
        cacheKey,
        user as User,
        publicPlugins
      );
      return publicPlugins;
    },
    privatePlugins: async (user, _, { cacheKey, currentUser }) => {
      if (user.id != currentUser?.id) {
        return [];
      }
      const cachedPrivatePlugins = this.requestCache.getUserPrivatePlugins(
        cacheKey,
        user.id as string
      );
      if (cachedPrivatePlugins) {
        return cachedPrivatePlugins;
      }
      const pluginsContext = await this.contextFactory.createContext(
        PluginsContext
      );
      const privatePlugins = await pluginsContext.getUserPluginsByType(
        user?.id as string,
        true
      );
      this.requestCache.setUserPrivatePlugins(
        cacheKey,
        user as User,
        privatePlugins
      );
      return privatePlugins;
    },
    pluginCount: async (user, _, { cacheKey, currentUser }) => {
      const cachedPluginCount = this.requestCache.getUserPluginCount(
        cacheKey,
        user.id as string
      );
      if (cachedPluginCount !== undefined) {
        return cachedPluginCount;
      }
      const pluginsContext = await this.contextFactory.createContext(
        PluginsContext
      );
      const publicCount = await pluginsContext.getUserPluginCountType(
        user?.id as string,
        false
      );
      if (user.id != currentUser?.id) {
        this.requestCache.setUserPluginCount(
          cacheKey,
          user as User,
          publicCount
        );
        return publicCount;
      }

      const privateCount = await pluginsContext.getUserPluginCountType(
        user?.id as string,
        true
      );
      this.requestCache.setUserPluginCount(
        cacheKey,
        user as User,
        publicCount + privateCount
      );
      return publicCount + privateCount;
    },
    apiKeys: runWithHooks(
      () => [],
      async (user, _, { currentUser, cacheKey }) => {
        if (!currentUser) {
          return null;
        }
        if (currentUser.id != user.id) {
          return null;
        }
        const apiKeysContext = await this.contextFactory.createContext(
          ApiKeysContext
        );
        return await apiKeysContext.getUserApiKeys(currentUser.id);
      }
    ),
    webhookKeys: runWithHooks(
      () => [],
      async (user, _, { currentUser, cacheKey }) => {
        if (!currentUser) {
          return null;
        }
        if (currentUser.id != user.id) {
          return null;
        }
        const webhookKeysContext = await this.contextFactory.createContext(
          WebhookKeysContext
        );
        return await webhookKeysContext.getUserWebhookKeys(currentUser.id);
      }
    ),
    bookmarkedRepositories: runWithHooks(
      () => [],
      async (user, _, context) => {
        if (
          user.id != context?.currentUser?.id &&
          user?.hideBookmarksInProfile
        ) {
          return [];
        }
        return await this.repoAnnouncementService.getBookmarkedRepos(
          user as User,
          context?.currentUser ?? null
        );
      }
    ),
    unreadNotificationsCount: runWithHooks(
      () => [],
      async (user, _, context) => {
        if (user.id != context?.currentUser?.id) {
          return null;
        }

        const notificationsContext = await this.contextFactory.createContext(
          NotificationsContext
        );
        return await notificationsContext.getUncheckedNotificationsCount(
          context?.currentUser?.id
        );
      }
    ),
    hideBookmarksInProfile: runWithHooks(
      () => [],
      async (user, _, context) => {
        if (user.id != context?.currentUser?.id) {
          return null;
        }
        return user?.hideBookmarksInProfile ?? false;
      }
    ),
    hideOrganizationsInProfile: runWithHooks(
      () => [],
      async (user, _, context) => {
        if (user.id != context?.currentUser?.id) {
          return null;
        }
        return user?.hideOrganizationsInProfile ?? false;
      }
    ),
    muteRepoAnnouncementReplyAdded: runWithHooks(
      () => [],
      async (user, _, context) => {
        if (user.id != context?.currentUser?.id) {
          return null;
        }
        return user?.muteRepoAnnouncementReplyAdded ?? false;
      }
    ),
    muteRepoWriteAccessGranted: runWithHooks(
      () => [],
      async (user, _, context) => {
        if (user.id != context?.currentUser?.id) {
          return null;
        }
        return user?.muteRepoWriteAccessGranted ?? false;
      }
    ),
    muteMergeRequestBranchUpdated: runWithHooks(
      () => [],
      async (user, _, context) => {
        if (user.id != context?.currentUser?.id) {
          return null;
        }
        return user?.muteMergeRequestBranchUpdated ?? false;
      }
    ),
    muteMergeRequestMergedOrClosed: runWithHooks(
      () => [],
      async (user, _, context) => {
        if (user.id != context?.currentUser?.id) {
          return null;
        }
        return user?.muteMergeRequestMergedOrClosed ?? false;
      }
    ),
    muteMergeRequestReviewStatusChanged: runWithHooks(
      () => [],
      async (user, _, context) => {
        if (user.id != context?.currentUser?.id) {
          return null;
        }
        return user?.muteMergeRequestReviewStatusChanged ?? false;
      }
    ),
    muteMergeRequestCommentAdded: runWithHooks(
      () => [],
      async (user, _, context) => {
        if (user.id != context?.currentUser?.id) {
          return null;
        }
        return user?.muteMergeRequestCommentAdded ?? false;
      }
    ),
    muteMergeRequestCommentReplyAdded: runWithHooks(
      () => [],
      async (user, _, context) => {
        if (user.id != context?.currentUser?.id) {
          return null;
        }
        return user?.muteMergeRequestCommentReplyAdded ?? false;
      }
    ),
  };

  public Subscription: main.SubscriptionResolvers = {
    userNotificationCountUpdated: {
      subscribe: withFilter(
        (_, { userId }) => {
          if (userId) {
            return this.pubsub.asyncIterator(
              `USER_NOTIFICATION_COUNT_UPDATED:${userId}`
            );
          }
          return this.pubsub.asyncIterator([]);
        },
        runWithHooks(
          () => [],
          async (
            payload: { userNotificationCountUpdated: User },
            { userId },
            { currentUser }
          ) => {
            if (!userId) {
              return false;
            }
            if (payload?.userNotificationCountUpdated?.id != userId) {
              return false;
            }
            return (
              currentUser &&
              currentUser?.id == payload?.userNotificationCountUpdated?.id
            );
          }
        )
      ) as unknown as SubscriptionSubscribeFn<any, any, any, any>,
    },
  };
}
