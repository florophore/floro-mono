import { inject, injectable, multiInject } from "inversify";
import BaseResolverModule from "./resolvers/BaseResolverModule";
import { main , mainSchema as typeDefs } from '@floro/graphql-schemas'; 
import { Server } from 'http';
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
import RedisQueueWorkers from "@floro/redis/src/RedisQueueWorkers";
import { GraphQLSchema } from 'graphql';

const isProduction = process.env.NODE_ENV === 'production';

@injectable()
export default class Backend {
  public resolverModules: BaseResolverModule[];
  private httpServer: Server;
  private databaseConnection!: DatabaseConnection;
  private redisClient!: RedisClient;
  private redisQueueWorkers!: RedisQueueWorkers;
  private mailerClient!: MailerClient;
  private contextFactory!: ContextFactory;

  constructor(
    @multiInject("ResolverModule") resolverModules: BaseResolverModule[],
    @inject(DatabaseConnection) databaseConnection: DatabaseConnection,
    @inject(RedisClient) redisClient: RedisClient,
    @inject(RedisQueueWorkers) redisQueueWorkers: RedisQueueWorkers,
    @inject(MailerClient) mailerClient: MailerClient,
    @inject(ContextFactory) contextFactory: ContextFactory,
    @inject(Server) httpServer: Server
  ) {
    this.resolverModules = resolverModules;
    this.httpServer = httpServer;
    this.databaseConnection = databaseConnection;
    this.redisClient = redisClient;
    this.redisQueueWorkers = redisQueueWorkers;
    this.mailerClient = mailerClient;
    this.contextFactory = contextFactory;
  }

  public async startDatabase(): Promise<void> {
    await this.databaseConnection.open();
    await this.databaseConnection.migrate();
    await this.contextFactory.warmQueryRunnerConnection();
  }

  public startRedis(): void {
    this.redisClient.startRedis();
    this.redisQueueWorkers.start();
  }

  public mergeResolvers(): Partial<main.ResolversTypes> {
    return BaseResolverModule.mergeResolvers(this.resolverModules);
  }

  public buildExecutableSchema(): GraphQLSchema {
    const resolvers = {
      ...scalarResolvers,
      ...this.mergeResolvers(),
    } as main.Resolvers;
    return makeExecutableSchema({
      typeDefs,
      resolvers,
    });
  }

  public buildApolloServer(): ApolloServer {
    const schema = this.buildExecutableSchema();

    const wsServer = new WebSocketServer({
      server: this.httpServer,
      path: "/graphql",
    });

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