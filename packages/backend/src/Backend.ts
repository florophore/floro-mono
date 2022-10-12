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
import process from "process";
import { makeExecutableSchema } from "graphql-tools";
import { WebSocketServer } from 'ws';
import { useServer } from 'graphql-ws/lib/use/ws';
import RedisQueueWorkers from "@floro/redis/src/RedisQueueWorkers";
import { GraphQLSchema } from 'graphql';
import RedisPubsubFactory from "@floro/redis/src/RedisPubsubFactory";
import BaseController from "./controllers/BaseController";
import { Express } from "express";

const isProduction = process.env.NODE_ENV === 'production';

@injectable()
export default class Backend {
  public resolverModules: BaseResolverModule[];
  public controllers: BaseController[];
  protected httpServer: Server;
  private databaseConnection!: DatabaseConnection;
  private redisClient!: RedisClient;
  private redisQueueWorkers!: RedisQueueWorkers;
  private redisPubSubFactory!: RedisPubsubFactory;
  private contextFactory!: ContextFactory;

  constructor(
    @multiInject("ResolverModule") resolverModules: BaseResolverModule[],
    @multiInject("Controllers") controllers: BaseController[],
    @inject(DatabaseConnection) databaseConnection: DatabaseConnection,
    @inject(RedisClient) redisClient: RedisClient,
    @inject(RedisQueueWorkers) redisQueueWorkers: RedisQueueWorkers,
    @inject(RedisPubsubFactory) redisPubSubFactory: RedisPubsubFactory,
    @inject(ContextFactory) contextFactory: ContextFactory,
    @inject(Server) httpServer: Server
  ) {
    this.resolverModules = resolverModules;
    this.controllers = controllers;
    this.httpServer = httpServer;
    this.databaseConnection = databaseConnection;
    this.redisClient = redisClient;
    this.redisQueueWorkers = redisQueueWorkers;
    this.redisPubSubFactory = redisPubSubFactory;
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
    const pubsub = this.redisPubSubFactory.create();
    this.resolverModules.forEach(resolverModule => {
      resolverModule.setRedisPubsub(pubsub);
    });
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

  protected getWsServer(): WebSocketServer {
    return new WebSocketServer({
      server: this.httpServer,
      path: "/graphql-subscriptions",
    });
  }

  public buildApolloServer(): ApolloServer {
    const schema = this.buildExecutableSchema();

    const wsServer = this.getWsServer();

    const getDynamicContext = async (_ctx, _msg, _args) => {
      // runs every time
      // ctx is the graphql-ws Context where connectionParams live
     //if (ctx.connectionParams.authentication) {
     //   const currentUser = await findUser(connectionParams.authentication);
     //   return { currentUser };
     // }
      // Otherwise let our resolvers know we don't have a current user
      return { currentUser: null };
    };

    const serverCleanup = useServer({ 
      schema,
      context: (ctx, msg, args) => {
       return getDynamicContext(ctx, msg, args);
     },
     }, wsServer);

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

  public setupRestRoutes(app: Express): void {
    for (const HttpMethod in BaseController.routingTable) {
      const routes = BaseController.routingTable[HttpMethod];
      for (const route in routes) {
        const controller = this.controllers.find(controller => {
          return controller?.[routes[route]['name']] === routes[route]['method'];
        });
        if (HttpMethod == "POST") {
          app.post(route, (request, response) => controller?.[routes[route]['name']](request, response));
        }
        if (HttpMethod == "GET") {
          app.get(route, (request, response) => controller?.[routes[route]['name']](request, response));
        }
        if (HttpMethod == "PUT") {
          app.put(route, (request, response) => controller?.[routes[route]['name']](request, response));
        }
        if (HttpMethod == "PATCH") {
          app.patch(route, (request, response) => controller?.[routes[route]['name']](request, response));
        }
        if (HttpMethod == "DELETE") {
          app.delete(route, (request, response) => controller?.[routes[route]['name']](request, response));
        }
        if (HttpMethod == "OPTIONS") {
          app.options(route, (request, response) => controller?.[routes[route]['name']](request, response));
        }
      }
    }
  }
}