import { inject, injectable, multiInject } from "inversify";
import BaseResolverModule from "./resolvers/BaseResolverModule";
import { main } from '@floro/graphql-schemas'; 
import { Server } from 'http';
import { mainSchema as typeDefs } from "@floro/graphql-schemas";
import { resolvers as scalarResolvers } from 'graphql-scalars';
import { ApolloServer } from "apollo-server-express";
import {
    ApolloServerPluginDrainHttpServer,
    ApolloServerPluginLandingPageDisabled,
    ApolloServerPluginLandingPageLocalDefault,
  } from 'apollo-server-core';
import DatabaseConnection from "@floro/database/src/connection/DatabaseConnection";
import ContextFactory from "@floro/database/src/contexts/ContextFactory";
import RedisClient from "@floro/redis/src/RedisClient";
import MailerClient from "@floro/mailer/src/MailerClient";
import process from "process";
import { makeExecutableSchema } from "graphql-tools";
import { WebSocketServer } from 'ws';
import { useServer } from 'graphql-ws/lib/use/ws';

const isProduction = process.env.NODE_ENV === 'production';

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
      const schema = this.buildExecutableSchema();
      // Creating the WebSocket server
      const wsServer = new WebSocketServer({
        // This is the `httpServer` we created in a previous step.
        server: this.httpServer,
        // Pass a different path here if your ApolloServer serves at
        // a different path.
        path: "/graphql",
      });

      // Hand in the schema we just created and have the
      // WebSocketServer start listening.
      const serverCleanup = useServer({ schema }, wsServer);
      return new ApolloServer({
        schema,
        csrfPrevention: true,
        cache: "bounded",
        plugins: [
          ApolloServerPluginDrainHttpServer({ httpServer: this.httpServer }),
          {
            async serverWillStart() {
              return {
                async drainServer() {
                  await serverCleanup.dispose();
                },
              };
            },
          },
          ...(isProduction
            ? [ApolloServerPluginLandingPageDisabled()]
            : [ApolloServerPluginLandingPageLocalDefault({ embed: true })]),
        ],
      });
    }
}