import { inject, injectable, multiInject } from "inversify";
import BaseResolverModule from "./resolvers/BaseResolverModule";
import { main } from '@floro/graphql-schemas'; 
import { Server } from 'http';
import { mainSchema as typeDefs } from "@floro/graphql-schemas";
import { resolvers as scalarResolvers } from 'graphql-scalars';
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
        @multiInject("ResolverModule") resolverModules: BaseResolverModule[],
        @inject(Server) httpServer: Server
    ) {
        this.resolverModules = resolverModules;
        this.httpServer = httpServer;
    }

    public mergeResolvers(): Partial<main.ResolversTypes> {
        return this.resolverModules.reduce((resolvers, resolverModule) => {
            return resolverModule.append(resolvers);
        }, {});
    }

    public buildApolloServer(): ApolloServer {
        const resolvers = {
            ...scalarResolvers,
            ...this.mergeResolvers()
        } as any;
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