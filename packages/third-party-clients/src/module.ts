import { ContainerModule  } from 'inversify';
import BaseResolverModule from "./resolvers/BaseResolverModule";
import UsersResolverModule from "./resolvers/users/UsersResolverModule";
import Backend from "./Backend";

export default new ContainerModule((bind): void => {
    bind(BaseResolverModule).to(UsersResolverModule);
    bind(Backend).toSelf();
});