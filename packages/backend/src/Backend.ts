import { inject, injectable, multiInject } from "inversify";
import BaseResolverModule from "./resolvers/BaseResolverModule";
import { main, mainSchema as typeDefs } from "@floro/graphql-schemas";
import { Server } from "http";
import { resolvers as scalarResolvers } from "graphql-scalars";
import { ApolloServer } from "apollo-server-express";
import {
  ApolloServerPluginDrainHttpServer,
  ApolloServerPluginLandingPageDisabled,
  ApolloServerPluginLandingPageLocalDefault,
} from "apollo-server-core";
import GraphQLUpload from "graphql-upload/GraphQLUpload.mjs";
import DatabaseConnection from "@floro/database/src/connection/DatabaseConnection";
import ContextFactory from "@floro/database/src/contexts/ContextFactory";
import RedisClient from "@floro/redis/src/RedisClient";
import process from "process";
import { makeExecutableSchema } from "graphql-tools";
import { WebSocketServer } from "ws";
import { Extra, useServer } from "graphql-ws/lib/use/ws";
import RedisQueueWorkers from "@floro/redis/src/RedisQueueWorkers";
import { GraphQLSchema } from "graphql";
import RedisPubsubFactory from "@floro/redis/src/RedisPubsubFactory";
import BaseController from "./controllers/BaseController";
import { Express } from "express";
import StorageClient from "@floro/storage/src/StorageClient";
import RequestCache from "./request/RequestCache";
import ApolloRestClientFactory from "./controllers/ApolloRestClientFactory";
import { Context } from "graphql-ws";
import { QueueService } from "./services/QueueService";

const isProduction = process.env.NODE_ENV === "production";
const isTest = process.env.NODE_ENV === "test";
const isDevelopment = process.env.NODE_ENV === "development";

@injectable()
export default class Backend {
  public resolverModules: BaseResolverModule[];
  public controllers: BaseController[];
  public storageClient!: StorageClient;
  public requestCache!: RequestCache;
  public queueServices!: QueueService[];

  protected httpServer: Server;
  private databaseConnection!: DatabaseConnection;
  private redisClient!: RedisClient;
  private redisQueueWorkers!: RedisQueueWorkers;
  private redisPubSubFactory!: RedisPubsubFactory;
  private contextFactory!: ContextFactory;
  private apolloRestClientFactory!: ApolloRestClientFactory;

  constructor(
    @multiInject("ResolverModule") resolverModules: BaseResolverModule[],
    @multiInject("Controllers") controllers: BaseController[],
    @multiInject("QueueServices") queueServics: QueueService[],
    @inject(DatabaseConnection) databaseConnection: DatabaseConnection,
    @inject(RedisClient) redisClient: RedisClient,
    @inject(RedisQueueWorkers) redisQueueWorkers: RedisQueueWorkers,
    @inject(RedisPubsubFactory) redisPubSubFactory: RedisPubsubFactory,
    @inject(StorageClient) storageClient: StorageClient,
    @inject(ContextFactory) contextFactory: ContextFactory,
    @inject(Server) httpServer: Server,
    @inject(RequestCache) requestCache: RequestCache,
    @inject(ApolloRestClientFactory)
    apolloRestClientFactory: ApolloRestClientFactory
  ) {
    this.resolverModules = resolverModules;
    this.controllers = controllers;
    this.queueServices = queueServics;
    this.httpServer = httpServer;
    this.databaseConnection = databaseConnection;
    this.redisClient = redisClient;
    this.redisQueueWorkers = redisQueueWorkers;
    this.redisPubSubFactory = redisPubSubFactory;
    this.storageClient = storageClient;
    this.contextFactory = contextFactory;
    this.requestCache = requestCache;
    this.apolloRestClientFactory = apolloRestClientFactory;
  }

  public async startPublicStorageClient(): Promise<null | string> {
    await this.storageClient.start();
    return this.storageClient?.getStaticRoot?.("public") ?? null;
  }

  public async startPrivateStorageClient(): Promise<null | string> {
    await this.storageClient.start();
    return this.storageClient?.getStaticRoot?.("private") ?? null;
  }

  public async startDatabase(performMigrations: boolean = false): Promise<void> {
    await this.databaseConnection.open();
    if (performMigrations) {
      await this.databaseConnection.migrate();
    }
    await this.contextFactory.warmQueryRunnerConnection();
  }

  public async startRedis(): Promise<void> {
    await this.redisClient.startRedis();
    this.redisQueueWorkers.start(this.redisClient);
    const pubsub = this.redisPubSubFactory.create();
    this.queueServices.forEach((queueService) => {
      queueService.setRedisPubsub(pubsub);
      queueService.startQueueWorker(this.redisClient);
    });
    this.resolverModules.forEach((resolverModule) => {
      resolverModule.setRedisPubsub(pubsub);
    });
    this.controllers.forEach((controller) => {
      controller.setRedisPubsub(pubsub);
    })
  }

  public mergeResolvers(): Partial<main.ResolversTypes> {
    return {
      Upload: GraphQLUpload,
      ...BaseResolverModule.mergeResolvers(this.resolverModules),
    };
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

  public async fetchSessionUserContext(authorizationToken?: string) {
    return this.apolloRestClientFactory.createSessionContext(
      authorizationToken
    );
  }

  public buildApolloServer(): ApolloServer {
    const schema = this.buildExecutableSchema();

    this.apolloRestClientFactory.setSchema(schema);

    const wsServer = this.getWsServer();

    const requestCache = this.requestCache;

    const getDynamicContext = async (
      ctx: Context<
        Record<string, unknown> | undefined,
        Extra & Partial<Record<PropertyKey, never>>
      >,
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      _msg: unknown,
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      _args: unknown
    ): Promise<{[key: string]: any}> => {
      const token = (ctx?.connectionParams?.["authorization"] as string)?.split?.("Bearer ")?.[1] as string;
      const context = await this.fetchSessionUserContext(token);
      return context;
    };

    const serverCleanup = useServer(
      {
        schema,
        context: async (ctx, msg, args) => {
          const dynamicContext = await getDynamicContext(ctx, msg, args);
          const requestCacheId = requestCache.init();
          dynamicContext.cacheKey = requestCacheId;
          if (ctx['cacheKey']) {
            requestCache.release(ctx['cacheKey']);
          }
          ctx['cacheKey'] = requestCacheId;
          return dynamicContext;
        },
        onNext: (_ctx, _args, context) => {
          if (context.contextValue?.['cacheKey']) {
            requestCache.clear(context.contextValue?.['cacheKey'] as string);
          }
        },
        onComplete: (ctx) => {
          if (ctx['cacheKey']) {
            requestCache.release(ctx['cacheKey'])
          }
        }
      },
      wsServer
    );

    return new ApolloServer({
      schema,
      csrfPrevention: true,
      cache: "bounded",
      context: async ({ req }) => {
        if (req?.cookies?.["user-session"]) {
          return await this.fetchSessionUserContext(
            req?.cookies?.["user-session"]
          );
        }
        if (req?.headers?.authorization?.startsWith("Bearer")) {
          const [, token] = req?.headers?.authorization?.split("Bearer ") ?? [
            "",
            "",
          ];
          return await this.fetchSessionUserContext(token);
        }
        return {
          session: null,
          currentUser: null,
          authorizationToken: "",
        };
      },
      plugins: [
        {
          async requestDidStart(requestContext) {
            const requestCacheId = requestCache.init();
            requestContext.context.cacheKey = requestCacheId;
            return {
              async willSendResponse(requestContext) {
                requestCache.release(requestContext.context.cacheKey);
                return;
              },
            };
          },
        },
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
      const controllers = this.controllers.filter(c => {
        if (isProduction) {
          return c.envs.includes("production");
        }
        if (isDevelopment) {
          return c.envs.includes("development");
        }
        if (isTest) {
          return c.envs.includes("test");
        }
        return false;
      });
      for (const route in routes) {
        const controller = controllers.find((controller) => {
          return (
            controller?.[routes[route]["name"]] === routes[route]["method"]
          );
        });
        if (!controller) {
          continue;
        }
        if (HttpMethod == "POST") {
          app.post(route, (request, response) =>
            controller?.[routes[route]["name"]](request, response)
          );
        }
        if (HttpMethod == "GET") {
          app.get(route, (request, response) =>
            controller?.[routes[route]["name"]](request, response)
          );
        }
        if (HttpMethod == "PUT") {
          app.put(route, (request, response) =>
            controller?.[routes[route]["name"]](request, response)
          );
        }
        if (HttpMethod == "PATCH") {
          app.patch(route, (request, response) =>
            controller?.[routes[route]["name"]](request, response)
          );
        }
        if (HttpMethod == "DELETE") {
          app.delete(route, (request, response) =>
            controller?.[routes[route]["name"]](request, response)
          );
        }
        if (HttpMethod == "OPTIONS") {
          app.options(route, (request, response) =>
            controller?.[routes[route]["name"]](request, response)
          );
        }
      }
    }
  }
}
