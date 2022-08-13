import { inject, injectable, multiInject } from "inversify";
import BaseResolverModule from "./resolvers/BaseResolverModule";
import { main } from '@floro/graphql-schemas' 
import { Server } from 'http';
import { mainSchema as typeDefs } from "@floro/graphql-schemas";
import { ApolloServer } from "apollo-server-express";
import {
    ApolloServerPluginDrainHttpServer,
    ApolloServerPluginLandingPageLocalDefault,
  } from 'apollo-server-core';

@injectable()
export default class Backend {

    private resolverModules: BaseResolverModule[];
    private httpServer: Server;

    constructor(
        @multiInject(BaseResolverModule) resolverModules: BaseResolverModule[],
        @inject(Server) httpServer: Server
    ) {
        this.resolverModules = resolverModules;
        this.httpServer = httpServer;
    }

    public mergeResolvers(): {
        Query: main.Query,
        Mutation: main.Mutation,
        Subscription: main.Subscription
    } {
        return this.resolverModules.reduce((resolvers, resolverModule) => {
            return resolverModule.append(resolvers);
        }, {
            Query: {},
            Mutation: {},
            Subscription: {}
        });
    }

    public buildApolloServer(): ApolloServer {
        const resolvers = this.mergeResolvers();
        return new ApolloServer({
            typeDefs,
            resolvers,
            csrfPrevention: true,
            cache: 'bounded',
            plugins: [
              ApolloServerPluginDrainHttpServer({ httpServer: this.httpServer }),
              ApolloServerPluginLandingPageLocalDefault({ embed: true }),
            ],
          })
    }
}