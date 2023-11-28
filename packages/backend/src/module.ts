import { ContainerModule  } from 'inversify';
import UsersResolverModule from "./resolvers/user/UsersResolverModule";
import AdminBackend from "./AdminBackend";
import Backend from "./Backend";
import AuthenticationService from './services/authentication/AuthenticationService';
import UsersService from './services/users/UsersService';
import AuthenticationResolverModule from './resolvers/authentication/AuthenticationResolverModule';
import AdminUsersResolverModule from './resolvers/user/AdminUsersResolverModule';
import AuthenticationController from './controllers/AuthenticationController';
import OrganizationService from './services/organizations/OrganizationService';
import OrganizationResolverModule from './resolvers/organization/OrganizationResolverModule';
import RequestCache from './request/RequestCache';
import LoggedInUserGuard from './resolvers/hooks/guards/LoggedInUserGuard';
import OrganizationPermissionService from './services/organizations/OrganizationPermissionService';
import OrganizationMemberResolverModule from './resolvers/organization/OrganizationMemberResolverModule';
import OrganizationMemberRolesLoader from './resolvers/hooks/loaders/Organization/OrganizationMemberRolesLoader';
import OrganizationMemberLoader from './resolvers/hooks/loaders/Organization/OrganizationMemberLoader';
import MembershipPermissionsLoader from './resolvers/hooks/loaders/OrganizationMembership/MembershipPermissionsLoader';
import MembershipRolesLoader from './resolvers/hooks/loaders/OrganizationMembership/MembershipRolesLoader';
import OrganizationMemberPermissionsLoader from './resolvers/hooks/loaders/Organization/OrganizationMemberPermissionsLoader';
import OrganizationRolesLoader from './resolvers/hooks/loaders/Organization/OrganizationRolesLoader';
import OrganizationInvitationResolverModule from './resolvers/organization/OrganizationInvitationResolverModule';
import RootOrganizationLoader from './resolvers/hooks/loaders/Root/OrganizationID/RootOrganizationLoader';
import RootOrganizationMemberLoader from './resolvers/hooks/loaders/Root/OrganizationID/RootOrganizationMemberLoader';
import RootOrganizationMemberRolesLoader from './resolvers/hooks/loaders/Root/OrganizationID/RootOrganizationMemberRolesLoader';
import RootOrganizationMemberPermissionsLoader from './resolvers/hooks/loaders/Root/OrganizationID/RootOrganizationMemberPermissionsLoader';
import OrganizationInvitationService from './services/organizations/OrganizationInvitationService';
import OrganizationInvitationOrganizationLoader from './resolvers/hooks/loaders/OrganizationInvitation/OrganizationInvitationOrganizationLoader';
import OrganizationInvitationOrganizationMemberLoader from './resolvers/hooks/loaders/OrganizationInvitation/OrganizationInvitationMemberLoader';
import OrganizationInvitationOrganizationMemberRolesLoader from './resolvers/hooks/loaders/OrganizationInvitation/OrganizationInvitationOrganizationMemberRoles';
import OrganizationInvitationMemberPermissionsLoader from './resolvers/hooks/loaders/OrganizationInvitation/OrganizationInvitationMemberPermissionLoader';
import OrganizationActiveMemberCountLoader from './resolvers/hooks/loaders/Organization/OrganizationActiveMemberCountLoader';
import OrganizationMemberCountLoader from './resolvers/hooks/loaders/Organization/OrganizationMemberCountLoader';
import OrganizationSentInvitationsCountLoader from './resolvers/hooks/loaders/Organization/OrganizationSentInvitationsCountLoader';
import RepositoryBranchesLoader from './resolvers/hooks/loaders/Repository/RepositoryBranchesLoader';
import RepositoryCommitsLoader from './resolvers/hooks/loaders/Repository/RepositoryCommitsLoader';
import RepositoryCommitHistoryLoader from './resolvers/hooks/loaders/Repository/RepositoryCommitHistoryLoader';
import RepositoryRemoteSettingsLoader from './resolvers/hooks/loaders/Repository/RepositoryRemoteSettingsLoader';
import RepositoryRevertRangesLoader from "./resolvers/hooks/loaders/Repository/RepositoryRevertRangesLoader";
import CreateUserEventHandler from './services/events/CreateUserEventHandler';
import OrganizationMemberService from './services/organizations/OrganizationMemberService';
import OrganizationRoleService from './services/organizations/OrganizationRoleService';
import OrganizationRoleResolverModule from './resolvers/organization/OrganizationRoleResolverModule';
import ReferralResolverModule from './resolvers/referral/ReferralResolverModule';
import ReferralService from './services/referrals/ReferralService';
import RepositoryService from './services/repositories/RepositoryService';
import RepoRBACService from './services/repositories/RepoRBACService';
import RepositoryResolverModule from './resolvers/repository/RepositoryResolverModule';
import PhotoUploadService from './services/photos/PhotoUploadService';
import PhotoResolverModule from './resolvers/photo/PhotoResolverModule';
import RepoController from './controllers/RepoController';
import ApolloRestClientFactory from './controllers/ApolloRestClientFactory';
import PluginRegistryService from './services/plugins/PluginRegistryService';
import PluginResolverModule from './resolvers/plugin/PluginResolverModule';
import PluginController from './controllers/PluginController';
import PrivateCDNTestController from './controllers/PrivateCDNTestController';
import PluginPermissionService from './services/plugins/PluginPermissionService';
import PluginVersionResolverModule from './resolvers/plugin/PluginVersionResolverModule';
import PluginSearchService from './services/plugins/PluginSearchService';
import BranchService from './services/repositories/BranchService';
import RootRepositoryLoader from './resolvers/hooks/loaders/Root/RepositoryID/RepositoryLoader';
import RepositoryDatasourceFactoryService from './services/repositories/RepoDatasourceFactoryService';
import CommitStateDatasourceLoader from './resolvers/hooks/loaders/Repository/CommitStateDatasourceLoader';
import CommitStatePluginVersionsLoader from './resolvers/hooks/loaders/Repository/CommitStatePluginVersionsLoader';
import MergeRequestService from './services/merge_requests/MergeRequestService';
import BranchPushHandler from './services/events/BranchPushEventHandler';
import MergeRequestEventService from './services/merge_requests/MergeRequestEventService';
import CreateMergeRequestEventHandler from './services/merge_requests/merge_request_events/CreateMergeRequestEventHandler';
import UpdateMergeRequestEventHandler from './services/merge_requests/merge_request_events/UpdateMergeRequestEventHandler';
import CloseMergeRequestEventHandler from './services/merge_requests/merge_request_events/CloseMergeRequestEventHandler';
import UpdatedMergeRequestReviewersEventHandler from './services/merge_requests/merge_request_events/UpdatedMergeRequestReviewersEventHandler';
import ReviewStatusChangeEventHandler from './services/merge_requests/merge_request_events/ReviewStatusChangeEventHandler';
import MergeRequestCommentEventHandler from './services/merge_requests/merge_request_events/MergeRequestCommentEventHandler';
import MergeRequestCommentReplyEventHandler from './services/merge_requests/merge_request_events/MergeRequestCommentReplyEventHandler';
import MergeRequestResolverModule from './resolvers/merge_requests/MergeRequestResolverModule';
import MergeRequestLoader from './resolvers/hooks/loaders/MergeRequest/MergeRequestLoader';
import MergeRequestCommentLoader from './resolvers/hooks/loaders/MergeRequest/MergeRequestCommentLoader';
import MergeRequestCommentReplyLoader from './resolvers/hooks/loaders/MergeRequest/MergeRequestCommentReplyLoader';
import RepoAccessGuard from './resolvers/hooks/guards/RepoAccessGuard';
import MergeRequestAccessGuard from './resolvers/hooks/guards/MergeRequestAccessGuard';
import MergeRequestCommentAccessGuard from './resolvers/hooks/guards/MergeRequestCommentAccessGuard';
import MergeRequestCommentReplyAccessGuard from './resolvers/hooks/guards/MergeRequestCommentAccessReplyGuard';
import CommitInfoRepositoryLoader from './resolvers/hooks/loaders/Repository/CommitInfoRepoLoader';
import OpenMergeRequestsLoader from './resolvers/hooks/loaders/MergeRequest/OpenMergeRequestsLoader';
import ClosedMergeRequestsLoader from './resolvers/hooks/loaders/MergeRequest/ClosedMergeRequestsLoader';
import MergeRequestPermissionsLoader from './resolvers/hooks/loaders/MergeRequest/MergeRequestPermissionsLoader';
import RepoSettingsService from './services/repositories/RepoSettingsService';
import RootRepositoryRemoteSettingsLoader from './resolvers/hooks/loaders/Root/RepositoryID/RootRepositoryRemoteSettingsLoader';
import RepositoryProtectedBranchesResolverModule from './resolvers/repository/RepositoryProtectedBranchesResolverModule';
import WriteAccessIdsLoader from './resolvers/hooks/loaders/Repository/WriteAccessIdsLoader';
import GrantAccessReceiverService from './services/repositories/GrantAccessReceiverService';
import GrantRepoAccessHandler from './services/events/GrantRepoAccessHandler';
import ProtectedBranchRuleLoader from './resolvers/hooks/loaders/Root/ProtectedBranchRuleID/ProtectedBranchRuleLoader';
import RepositoryRemoteSettingsArgsLoader from './resolvers/hooks/loaders/Repository/RepositoryRemoteSettingsArgsLoader';
import RepoDataService from './services/repositories/RepoDataService';
import { QueueService } from './services/QueueService';
import MergeRequestCommentsLoader from './resolvers/hooks/loaders/MergeRequest/MergeRequestCommentsLoader';
import MergeService from './services/merge_requests/MergeService';
import MergedMergeRequestEventHandler from './services/merge_requests/merge_request_events/MergedMergeRequestEventHandler';
import PreMergeCommitQueue from './services/merge_requests/PreMergeCommitQueue';
import CommitService from './services/merge_requests/CommitService';
import UserClosedMergeRequestsLoader from './resolvers/hooks/loaders/MergeRequest/UserClosedMergeRequestsLoader';
import RevertService from './services/repositories/RevertService';
import BranchStateRepositoryLoader from './resolvers/hooks/loaders/Repository/BranchStateRepoLoader';
import ApiKeyService from './services/api_keys/ApiKeyService';
import WebhookKeyService from './services/api_keys/WebhookKeyService';
import WebhookKeyResolverModule from './resolvers/api_keys/WebhookKeyResolverModule';
import ApiKeyResolverModule from './resolvers/api_keys/ApiKeyResolverModule';
import ApiKeyLoader from './resolvers/hooks/loaders/ApiKey/ApiKeyLoader';
import WebhookKeyLoader from './resolvers/hooks/loaders/ApiKey/WebhookKeyLoader';
import OrgApiKeyGuard from './resolvers/hooks/guards/OrgApiKeyGuard';
import OrgWebhookKeyGuard from './resolvers/hooks/guards/OrgWebhookKeyGuard';
import UserApiKeyGuard from './resolvers/hooks/guards/UserApiKeyGuard';
import UserWebhookKeyGuard from './resolvers/hooks/guards/UserWebhookKeyGuard';
import TestWebhookController from './controllers/TestWebhookController';
import RepoApiSettingAccessGuard from './resolvers/hooks/guards/RepoApiSettingAccessGuard';
import RepoEnabledApiKeyService from './services/api_keys/RepoEnabledApiKeyService';
import RepoEnabledWebhookKeyService from './services/api_keys/RepoEnabledWebhookKeyService';
import PublicApiV0Controller from './controllers/public_api/PublicApiV0Controller';
import BranchUpdateWebhookQueue from './services/webhook_queues/BranchUpdateWebhookQueue';
import HealthCheckController from './controllers/HealthCheckController';
import DeepLProxyController from './controllers/proxy/DeepLProxyController';
import SyncController from './controllers/sync/SyncController';
import UpdateTextWebhookController from './controllers/UpdateTextWebhookController';
import RepoSearchService from './services/repositories/RepoSearchService';
import SearchResolverModule from './resolvers/search/SearchResolverModule';
import RepoAnnouncementService from './services/announcements/RepoAnnouncementService';
import RepoAnnouncementsResolverModule from './resolvers/announcements/RepoAnnouncementsResolverModule';
import RepoAnnouncementLoader from './resolvers/hooks/loaders/RepoAnnouncements/RepoAnnouncementLoader';
import RepoAnnouncementReplyLoader from './resolvers/hooks/loaders/RepoAnnouncements/RepoAnnouncementReplyLoader';
import NotificationsService from './services/notifications/NotificationsService';
import OrgInvitationsHandler from './services/events/OrgInvitationsHandler';
import BookmarkSubscriptionsHandler from './services/events/BookmarkSubscriptionsHandler';
import RepoAnnouncementReplyHandler from './services/events/RepoAnnouncementReplyHandler';
import NotificationFanOutQueue from './services/notifications/NotificationFanOutQueue';
import NotificationReceiverController from './controllers/NotificationReceiverController';
import OrganizationDailyActiveMemberQueue from './services/organizations/OrganizationDailyActiveMemberQueue';
import ChatGPTController from './controllers/proxy/ChatGPTController';

export default new ContainerModule((bind): void => {
    //main
    bind(Backend).toSelf();
    bind(ApolloRestClientFactory).toSelf();
    //admin
    bind(AdminBackend).toSelf();

    //Other
    bind(RequestCache).toSelf().inSingletonScope();

    //Guards
    bind(LoggedInUserGuard).toSelf()
    // REPO GUARDS
    bind(RepoAccessGuard).toSelf();
    // MERGE REQUEST GUARDS
    bind(MergeRequestAccessGuard).toSelf();
    bind(MergeRequestCommentAccessGuard).toSelf();
    bind(MergeRequestCommentReplyAccessGuard).toSelf();
    bind(MergeRequestCommentsLoader).toSelf()

    // LOADERS
    //ROOT LOADERS
    bind(RootOrganizationLoader).toSelf();
    bind(RootOrganizationMemberLoader).toSelf();
    bind(RootOrganizationMemberRolesLoader).toSelf();
    bind(RootOrganizationMemberPermissionsLoader).toSelf();
    // ROOT REPO
    bind(RootRepositoryRemoteSettingsLoader).toSelf();

    //ORGANIZATION LOADERS
    bind(OrganizationMemberLoader).toSelf();
    bind(OrganizationMemberRolesLoader).toSelf();
    bind(OrganizationMemberPermissionsLoader).toSelf();
    bind(OrganizationRolesLoader).toSelf();

    // ORGANIZATION INVITATION LOADERS
    bind(OrganizationInvitationOrganizationLoader).toSelf();
    bind(OrganizationInvitationOrganizationMemberLoader).toSelf();
    bind(OrganizationInvitationOrganizationMemberRolesLoader).toSelf();
    bind(OrganizationInvitationMemberPermissionsLoader).toSelf();
    bind(OrganizationMemberCountLoader).toSelf();
    bind(OrganizationActiveMemberCountLoader).toSelf();
    bind(OrganizationSentInvitationsCountLoader).toSelf();

    bind(OrganizationDailyActiveMemberQueue).toSelf().inSingletonScope();

    //MEMBERSHIP LOADERS
    bind(MembershipPermissionsLoader).toSelf();
    bind(MembershipRolesLoader).toSelf();

    //REPOSITORY LOADERS
    bind(RootRepositoryLoader).toSelf();
    bind(RepositoryBranchesLoader).toSelf();
    bind(RepositoryRemoteSettingsLoader).toSelf();
    bind(RepositoryCommitsLoader).toSelf();
    bind(RepositoryCommitHistoryLoader).toSelf();
    bind(RepositoryRevertRangesLoader).toSelf();
    bind(CommitStateDatasourceLoader).toSelf();
    bind(CommitStatePluginVersionsLoader).toSelf()
    bind(CommitInfoRepositoryLoader).toSelf();
    bind(BranchStateRepositoryLoader).toSelf();

    bind(WriteAccessIdsLoader).toSelf();
    bind(ProtectedBranchRuleLoader).toSelf();

    // REPO ANNOUNCEMENT LOADERS
    bind(RepoAnnouncementLoader).toSelf();
    bind(RepoAnnouncementReplyLoader).toSelf();

    // MERGE REQUEST
    bind(MergeRequestLoader).toSelf();
    bind(MergeRequestCommentLoader).toSelf();
    bind(MergeRequestCommentReplyLoader).toSelf();
    bind(OpenMergeRequestsLoader).toSelf();
    bind(ClosedMergeRequestsLoader).toSelf();
    bind(MergeRequestPermissionsLoader).toSelf();
    bind(RepositoryRemoteSettingsArgsLoader).toSelf();
    bind(UserClosedMergeRequestsLoader).toSelf();

    // API KEYs
    bind(ApiKeyLoader).toSelf();
    bind(WebhookKeyLoader).toSelf();

    bind(OrgApiKeyGuard).toSelf();
    bind(OrgWebhookKeyGuard).toSelf();
    bind(UserApiKeyGuard).toSelf();
    bind(UserWebhookKeyGuard).toSelf();
    bind(RepoApiSettingAccessGuard).toSelf();

    // SERVICES
    bind(AuthenticationService).toSelf();
    bind(UsersService).toSelf();
    // ORGS
    bind(OrganizationService).toSelf();
    bind(OrganizationPermissionService).toSelf();
    bind(OrganizationInvitationService).toSelf();
    bind(OrganizationMemberService).toSelf();
    bind(OrganizationRoleService).toSelf();

    // PLUGINS
    bind(PluginRegistryService).toSelf();
    bind(PluginPermissionService).toSelf();
    bind(PluginSearchService).toSelf();

    // PHOTOS
    bind(PhotoUploadService).toSelf();

    // REPOS
    bind(RepositoryService).toSelf();
    bind(RepoRBACService).toSelf();
    bind(BranchService).toSelf();
    bind(RepositoryDatasourceFactoryService).toSelf();
    bind(RepoSettingsService).toSelf();
    bind(RepoDataService).toSelf();
    bind(CommitService).toSelf();
    bind(RevertService).toSelf();
    bind(RepoSearchService).toSelf();

    bind(GrantAccessReceiverService).toSelf().inSingletonScope();

    bind(RepoEnabledApiKeyService).toSelf();
    bind(RepoEnabledWebhookKeyService).toSelf();

    // REFERRALS
    bind(ReferralService).toSelf()

    //ANNOUNCEMENTS
    bind(RepoAnnouncementService).toSelf();

    // MERGE REQUESTS
    bind(MergeService).toSelf();
    bind(MergeRequestService).toSelf().inSingletonScope();
    bind(MergeRequestEventService).toSelf().inSingletonScope();
    bind(PreMergeCommitQueue).toSelf().inSingletonScope();

    // NOTIFICATIONS
    bind(NotificationsService).toSelf().inSingletonScope();
    bind(NotificationFanOutQueue).toSelf().inSingletonScope();

    // API KEYS
    bind(ApiKeyService).toSelf();
    bind(WebhookKeyService).toSelf();

    bind(BranchUpdateWebhookQueue).toSelf().inSingletonScope();

    // EVENT HANDLERS

    // CREATE USER HANLDER
    bind<CreateUserEventHandler>("CreateUserHandler").to(OrganizationInvitationService);
    bind<CreateUserEventHandler>("CreateUserHandler").to(ReferralService);

    // BRANCH PUSH HANLDERS
    bind<BranchPushHandler>("BranchPushHandler").toService(MergeRequestService);
    bind<BranchPushHandler>("BranchPushHandler").toService(MergeRequestEventService);
    bind<BranchPushHandler>("BranchPushHandler").toService(PreMergeCommitQueue);
    bind<BranchPushHandler>("BranchPushHandler").toService(BranchUpdateWebhookQueue);

    // MERGE REQUESTS
    bind<CreateMergeRequestEventHandler>("CreateMergeRequestEventHandler").toService(MergeRequestEventService);
    bind<UpdateMergeRequestEventHandler>("UpdateMergeRequestEventHandler").toService(MergeRequestEventService);
    bind<UpdateMergeRequestEventHandler>("UpdateMergeRequestEventHandler").toService(NotificationsService);
    bind<CloseMergeRequestEventHandler>("CloseMergeRequestEventHandler").toService(MergeRequestEventService);
    bind<CloseMergeRequestEventHandler>("CloseMergeRequestEventHandler").toService(NotificationsService);
    bind<UpdatedMergeRequestReviewersEventHandler>("UpdatedMergeRequestReviewersEventHandler").toService(MergeRequestEventService);
    bind<UpdatedMergeRequestReviewersEventHandler>("UpdatedMergeRequestReviewersEventHandler").toService(NotificationsService);
    bind<ReviewStatusChangeEventHandler>("ReviewStatusChangeEventHandler").toService(MergeRequestEventService);
    bind<ReviewStatusChangeEventHandler>("ReviewStatusChangeEventHandler").toService(NotificationsService);
    bind<MergeRequestCommentEventHandler>("MergeRequestCommentEventHandler").toService(MergeRequestEventService);
    bind<MergeRequestCommentEventHandler>("MergeRequestCommentEventHandler").toService(NotificationsService);
    bind<MergeRequestCommentReplyEventHandler>("MergeRequestCommentReplyEventHandler").toService(MergeRequestEventService);
    bind<MergeRequestCommentReplyEventHandler>("MergeRequestCommentReplyEventHandler").toService(NotificationsService);
    bind<MergedMergeRequestEventHandler>("MergedMergeRequestEventHandler").toService(MergeRequestEventService);
    bind<MergedMergeRequestEventHandler>("MergedMergeRequestEventHandler").toService(NotificationsService);

    // GRANT ACCESS HANDLER
    bind<GrantRepoAccessHandler>("GrantRepoAccessHandler").toService(GrantAccessReceiverService);
    bind<GrantRepoAccessHandler>("GrantRepoAccessHandler").toService(NotificationsService);

    // ORG INVITATIONS
    bind<OrgInvitationsHandler>("OrgInvitationsHandler").toService(NotificationsService);

    // BOOKMARK SUBSCRIPTIONS/REPO ANNOUNCEMENTS
    bind<BookmarkSubscriptionsHandler>("BookmarkSubscriptionsHandler").toService(NotificationsService);
    bind<RepoAnnouncementReplyHandler>("RepoAnnouncementReplyHandler").toService(NotificationsService);

    // QUEUE SERVICES
    bind<QueueService>("QueueServices").toService(MergeRequestService);
    bind<QueueService>("QueueServices").toService(PreMergeCommitQueue);
    bind<QueueService>("QueueServices").toService(BranchUpdateWebhookQueue);
    bind<QueueService>("QueueServices").toService(NotificationFanOutQueue);
    bind<QueueService>("QueueServices").toService(OrganizationDailyActiveMemberQueue);

    // Controllers
    bind<HealthCheckController>("Controllers").to(HealthCheckController);
    bind<AuthenticationController>("Controllers").to(AuthenticationController);
    bind<RepoController>("Controllers").to(RepoController);
    bind<PluginController>("Controllers").to(PluginController);
    bind<PrivateCDNTestController>("Controllers").to(PrivateCDNTestController);
    bind<TestWebhookController>("Controllers").to(TestWebhookController);
    bind<PublicApiV0Controller>("Controllers").to(PublicApiV0Controller);
    bind<SyncController>("Controllers").to(SyncController);
    // Plugin Controllers
    bind<DeepLProxyController>("Controllers").to(DeepLProxyController);
    bind<ChatGPTController>("Controllers").to(ChatGPTController);
    // Floro Plugin Webhooks
    bind<UpdateTextWebhookController>("Controllers").to(UpdateTextWebhookController);
    // notifications
    bind<NotificationReceiverController>("Controllers").to(NotificationReceiverController);

    // RESOLVER MODULES
    bind<UsersResolverModule>("ResolverModule").to(UsersResolverModule);
    bind<AuthenticationResolverModule>("ResolverModule").to(AuthenticationResolverModule);
    bind<OrganizationResolverModule>("ResolverModule").to(OrganizationResolverModule);
    bind<OrganizationMemberResolverModule>("ResolverModule").to(OrganizationMemberResolverModule);
    bind<OrganizationInvitationResolverModule>("ResolverModule").to(OrganizationInvitationResolverModule);
    bind<OrganizationRoleResolverModule>("ResolverModule").to(OrganizationRoleResolverModule);
    bind<ReferralResolverModule>("ResolverModule").to(ReferralResolverModule);
    bind<RepositoryResolverModule>("ResolverModule").to(RepositoryResolverModule);
    bind<PhotoResolverModule>("ResolverModule").to(PhotoResolverModule);
    bind<PluginResolverModule>("ResolverModule").to(PluginResolverModule);
    bind<PluginVersionResolverModule>("ResolverModule").to(PluginVersionResolverModule);
    bind<MergeRequestResolverModule>("ResolverModule").to(MergeRequestResolverModule);
    bind<RepositoryProtectedBranchesResolverModule>("ResolverModule").to(RepositoryProtectedBranchesResolverModule);
    bind<ApiKeyResolverModule>("ResolverModule").to(ApiKeyResolverModule);
    bind<WebhookKeyResolverModule>("ResolverModule").to(WebhookKeyResolverModule);
    bind<SearchResolverModule>("ResolverModule").to(SearchResolverModule);
    bind<RepoAnnouncementsResolverModule>("ResolverModule").to(RepoAnnouncementsResolverModule);

    // ADMIN MODULES OVERRIDE WITH AdminResolverModule
    bind<AdminUsersResolverModule>("AdminResolverModule").to(AdminUsersResolverModule);
});