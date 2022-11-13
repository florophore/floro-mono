import { ContainerModule  } from 'inversify';
import UsersResolverModule from "./resolvers/users/UsersResolverModule";
import AdminBackend from "./AdminBackend";
import Backend from "./Backend";
import AuthenticationService from './services/authentication/AuthenticationService';
import UsersService from './services/users/UsersService';
import AuthenticationResolverModule from './resolvers/authentication/AuthenticationResolverModule';
import AdminUsersResolverModule from './resolvers/users/AdminUsersResolverModule';
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
    //ORG
    bind(OrganizationMemberLoader).toSelf();
    bind(OrganizationMemberRolesLoader).toSelf();
    bind(OrganizationMemberPermissionsLoader).toSelf();
    bind(OrganizationRolesLoader).toSelf();

    //MEMBERSHIP
    bind(MembershipPermissionsLoader).toSelf();
    bind(MembershipRolesLoader).toSelf();

    // SERVICES
    bind(AuthenticationService).toSelf();
    bind(UsersService).toSelf();
    bind(OrganizationService).toSelf();
    bind(OrganizationPermissionService).toSelf();

    // Controllers
    bind<AuthenticationController>("Controllers").to(AuthenticationController);

    // RESOLVER MODULES
    bind<UsersResolverModule>("ResolverModule").to(UsersResolverModule);
    bind<AuthenticationResolverModule>("ResolverModule").to(AuthenticationResolverModule);
    bind<OrganizationResolverModule>("ResolverModule").to(OrganizationResolverModule);
    bind<OrganizationMemberResolverModule>("ResolverModule").to(OrganizationMemberResolverModule);

    // ADMIN MODULES OVERRIDE WITH AdminResolverModule
    bind<AdminUsersResolverModule>("AdminResolverModule").to(AdminUsersResolverModule);
});