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
import DatabaseConnection from "@floro/database/src/connection/DatabaseConnection";
import ContextFactory from "@floro/database/src/contexts/ContextFactory";
import RedisClient from "@floro/redis/src/RedisClient";
import MailerClient from "@floro/mailer/src/MailerClient";
import { Schema } from "inspector";
import { makeExecutableSchema } from "graphql-tools";

@injectable()
export default class Backend {

    private resolverModules: BaseResolverModule[];
    private httpServer: Server;
    private databaseConnection!: DatabaseConnection;
    private redisClient!: RedisClient;
    private mailerClient!: MailerClient;
    private contextFactory!: ContextFactory;

    constructor(
        @multiInject("ResolverModule") resolverModules: BaseResolverModule[],
        @inject(DatabaseConnection) databaseConnection: DatabaseConnection,
        @inject(RedisClient) redisClient: RedisClient,
        @inject(MailerClient) mailerClient: MailerClient,
        @inject(ContextFactory) contextFactory: ContextFactory,
        @inject(Server) httpServer: Server
    ) {
        this.resolverModules = resolverModules;
        this.httpServer = httpServer;
        this.databaseConnection = databaseConnection;
        this.redisClient = redisClient;
        this.mailerClient = mailerClient;
        this.contextFactory = contextFactory;
    }

    public mergeResolvers(): Partial<main.ResolversTypes> {
        return this.resolverModules.reduce((resolvers, resolverModule) => {
            return resolverModule.append(resolvers);
        }, {});
    }

    public async startDatabase(): Promise<void> {
        await this.databaseConnection.open();
        await this.databaseConnection.migrate();
        await this.contextFactory.warmQueryRunnerConnection();
    }

    public startRedis(): void {
        this.redisClient.startRedis();
    }

    public async startMailer(): Promise<void> {
        await this.mailerClient.startMailTransporter();
    }

    public buildExecutableSchema() {
        const resolvers = {
            ...scalarResolvers,
            ...this.mergeResolvers()
        } as main.Resolvers;
        return makeExecutableSchema({
            typeDefs,
            resolvers,
        })
    }

    public buildApolloServer(): ApolloServer {
        const resolvers = {
            ...scalarResolvers,
            ...this.mergeResolvers()
        } as main.Resolvers;
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