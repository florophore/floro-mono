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

    bind(WriteAccessIdsLoader).toSelf();
    bind(ProtectedBranchRuleLoader).toSelf();

    // MERGE REQUEST
    bind(MergeRequestLoader).toSelf();
    bind(MergeRequestCommentLoader).toSelf();
    bind(MergeRequestCommentReplyLoader).toSelf();
    bind(OpenMergeRequestsLoader).toSelf();
    bind(ClosedMergeRequestsLoader).toSelf();
    bind(MergeRequestPermissionsLoader).toSelf();
    bind(RepositoryRemoteSettingsArgsLoader).toSelf();

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
    bind(GrantAccessReceiverService).toSelf();
    bind(RepoDataService).toSelf();
    bind(CommitService).toSelf();

    // REFERRALS
    bind(ReferralService).toSelf()

    // MERGE REQUESTS
    bind(MergeRequestService).toSelf();
    bind(MergeRequestEventService).toSelf();
    bind(MergeService).toSelf();
    bind(PreMergeCommitQueue).toSelf();

    // EVENT HANDLERS

    // CREATE USER HANLDER
    bind<CreateUserEventHandler>("CreateUserHandler").to(OrganizationInvitationService);
    bind<CreateUserEventHandler>("CreateUserHandler").to(ReferralService);

    // BRANCH PUSH HANLDERS
    bind<BranchPushHandler>("BranchPushHandler").to(MergeRequestService).inSingletonScope();
    bind<BranchPushHandler>("BranchPushHandler").to(MergeRequestEventService).inSingletonScope();
    bind<BranchPushHandler>("BranchPushHandler").to(PreMergeCommitQueue).inSingletonScope();

    // MERGE REQUESTS
    bind<CreateMergeRequestEventHandler>("CreateMergeRequestEventHandler").to(MergeRequestEventService);
    bind<UpdateMergeRequestEventHandler>("UpdateMergeRequestEventHandler").to(MergeRequestEventService);
    bind<CloseMergeRequestEventHandler>("CloseMergeRequestEventHandler").to(MergeRequestEventService);
    bind<UpdatedMergeRequestReviewersEventHandler>("UpdatedMergeRequestReviewersEventHandler").to(MergeRequestEventService);
    bind<ReviewStatusChangeEventHandler>("ReviewStatusChangeEventHandler").to(MergeRequestEventService);
    bind<MergeRequestCommentEventHandler>("MergeRequestCommentEventHandler").to(MergeRequestEventService);
    bind<MergeRequestCommentReplyEventHandler>("MergeRequestCommentReplyEventHandler").to(MergeRequestEventService);
    bind<MergedMergeRequestEventHandler>("MergedMergeRequestEventHandler").to(MergeRequestEventService);

    // GRANT ACCESS HANDLER
    bind<GrantRepoAccessHandler>("GrantRepoAccessHandler").to(GrantAccessReceiverService);


    // QUEUE SERVICES
    bind<QueueService>("QueueServices").to(MergeRequestService).inSingletonScope();
    bind<QueueService>("QueueServices").to(PreMergeCommitQueue).inSingletonScope();

    // Controllers
    bind<AuthenticationController>("Controllers").to(AuthenticationController);
    bind<RepoController>("Controllers").to(RepoController);
    bind<PluginController>("Controllers").to(PluginController);
    bind<PrivateCDNTestController>("Controllers").to(PrivateCDNTestController);

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

    // ADMIN MODULES OVERRIDE WITH AdminResolverModule
    bind<AdminUsersResolverModule>("AdminResolverModule").to(AdminUsersResolverModule);
});