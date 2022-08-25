import { ContainerModule  } from 'inversify';
import UsersResolverModule from "./resolvers/users/UsersResolverModule";
import Backend from "./Backend";
import GithubLoginClient from './thirdpartyclients/github/GithubLoginClient';

export default new ContainerModule((bind): void => {
    bind("ResolverModule").to(UsersResolverModule);
    bind(Backend).toSelf();
    bind(GithubLoginClient).toSelf();
});