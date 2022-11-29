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
import OrganizationSentInvitationsCountLoader from './resolvers/hooks/loaders/Organization/OrganizationSentInvitationsCountLoader';
import CreateUserEventHandler from './services/events/CreateUserEventHandler';
import OrganizationMemberService from './services/organizations/OrganizationMemberService';
import OrganizationRoleService from './services/organizations/OrganizationRoleService';
import OrganizationRoleResolverModule from './resolvers/organization/OrganizationRoleResolverModule';
import ReferralResolverModule from './resolvers/referral/ReferralResolverModule';
import ReferralService from './services/referrals/ReferralService';
import RepositoryService from './services/repositories/RepositoryService';
import RepositoryResolverModule from './resolvers/repository/RepositoryResolverModule';
import PhotoUploadService from './services/photos/PhotoUploadService';
import PhotoResolverModule from './resolvers/photos/PhotoResolverModule';

export default new ContainerModule((bind): void => {
    //main
    bind(Backend).toSelf();
    //admin
    bind(AdminBackend).toSelf();

    //Other
    bind(RequestCache).toSelf().inSingletonScope();

    //Guards
    bind(LoggedInUserGuard).toSelf()

    // LOADERS
    //ROOT LOADERS
    bind(RootOrganizationLoader).toSelf();
    bind(RootOrganizationMemberLoader).toSelf();
    bind(RootOrganizationMemberRolesLoader).toSelf();
    bind(RootOrganizationMemberPermissionsLoader).toSelf();

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
    bind(OrganizationActiveMemberCountLoader).toSelf();
    bind(OrganizationSentInvitationsCountLoader).toSelf();

    //MEMBERSHIP LOADERS
    bind(MembershipPermissionsLoader).toSelf();
    bind(MembershipRolesLoader).toSelf();

    // SERVICES
    bind(AuthenticationService).toSelf();
    bind(UsersService).toSelf();
    // ORGS
    bind(OrganizationService).toSelf();
    bind(OrganizationPermissionService).toSelf();
    bind(OrganizationInvitationService).toSelf();
    bind(OrganizationMemberService).toSelf();
    bind(OrganizationRoleService).toSelf();

    // PHOTOS
    bind(PhotoUploadService).toSelf();

    // REPOS
    bind(RepositoryService).toSelf();
    // REFERRALS
    bind(ReferralService).toSelf()

    // EVENT HANDLERS
    // CREATE USER HANLDER
    bind<CreateUserEventHandler>("CreateUserHandler").to(OrganizationInvitationService);
    bind<CreateUserEventHandler>("CreateUserHandler").to(ReferralService);

    // Controllers
    bind<AuthenticationController>("Controllers").to(AuthenticationController);

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

    // ADMIN MODULES OVERRIDE WITH AdminResolverModule
    bind<AdminUsersResolverModule>("AdminResolverModule").to(AdminUsersResolverModule);
});