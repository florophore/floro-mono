import BaseResolverModule from "../BaseResolverModule";
import { main } from '@floro/graphql-schemas'; 
import { inject, injectable } from "inversify";
import ContextFactory from '@floro/database/src/contexts/ContextFactory';
import UsersContext from '@floro/database/src/contexts/UsersContext';

@injectable()
export default class UsersResolverModule extends BaseResolverModule {
    protected usersContext?: UsersContext;

    constructor(@inject(ContextFactory) contextFactory: ContextFactory) {
        super();
        this.init(contextFactory);
    }

    private async init(contextFactory: ContextFactory) {
        this.usersContext = await contextFactory.createContext(UsersContext);
    }

    public Query: main.QueryResolvers<any, {}> = {
        users: async () => {
            return [];
        },
    };

    public Mutation: main.MutationResolvers<any, {}> = {
        submitOAuthForAction: async () => {
            return null;
        }
    };
}