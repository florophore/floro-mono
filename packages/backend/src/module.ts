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

export default new ContainerModule((bind): void => {
    //main
    bind(Backend).toSelf();
    //admin
    bind(AdminBackend).toSelf();

    //Other
    bind(RequestCache).toSelf().inSingletonScope();

    //Guards
    bind(LoggedInUserGuard).toSelf()

    // SERVICES
    bind(AuthenticationService).toSelf();
    bind(UsersService).toSelf();
    bind(OrganizationService).toSelf();

    // Controllers
    bind<AuthenticationController>("Controllers").to(AuthenticationController);

    // RESOLVER MODULES
    bind<UsersResolverModule>("ResolverModule").to(UsersResolverModule);
    bind<AuthenticationResolverModule>("ResolverModule").to(AuthenticationResolverModule);
    bind<OrganizationResolverModule>("ResolverModule").to(OrganizationResolverModule);

    // ADMIN MODULES OVERRIDE WITH AdminResolverModule
    bind<AdminUsersResolverModule>("AdminResolverModule").to(AdminUsersResolverModule);
});