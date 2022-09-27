import { ContainerModule  } from 'inversify';
import UsersResolverModule from "./resolvers/users/UsersResolverModule";
import Backend from "./Backend";
import GithubLoginClient from './thirdpartyclients/github/GithubLoginClient';
import GoogleLoginClient from './thirdpartyclients/google/GoogleLoginClient';
import AuthenticationService from './services/authentication/AuthenticationService';

export default new ContainerModule((bind): void => {
    bind(AuthenticationService).toSelf();
    //resolvers 
    bind("ResolverModule").to(UsersResolverModule);
    //third party
    bind(GithubLoginClient).toSelf();
    bind(GoogleLoginClient).toSelf();
    //main
    bind(Backend).toSelf();
});