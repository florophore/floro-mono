import { ContainerModule  } from 'inversify';
import UsersResolverModule from "./resolvers/users/UsersResolverModule";
import AdminBackend from "./AdminBackend";
import Backend from "./Backend";
import GithubLoginClient from './thirdpartyclients/github/GithubLoginClient';
import GoogleLoginClient from './thirdpartyclients/google/GoogleLoginClient';
import AuthenticationService from './services/authentication/AuthenticationService';
import AuthenticationResolverModule from './resolvers/authentication/AuthenticationResolverModule';
import AdminUsersResolverModule from './resolvers/users/AdminUsersResolverModule';

export default new ContainerModule((bind): void => {
    //third party
    bind(GithubLoginClient).toSelf();
    bind(GoogleLoginClient).toSelf();
    //main
    bind(Backend).toSelf();
    //admin
    bind(AdminBackend).toSelf();

    // SERVICES
    bind(AuthenticationService).toSelf();

    // RESOLVER MODULES
    bind<UsersResolverModule>("ResolverModule").to(UsersResolverModule);
    bind<AuthenticationResolverModule>("ResolverModule").to(AuthenticationResolverModule);

    // ADMIN MODULES OVERRIDE WITH AdminResolverModule
    bind<AdminUsersResolverModule>("AdminResolverModule").to(AdminUsersResolverModule);
});