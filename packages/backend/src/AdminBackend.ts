import { inject, injectable, multiInject } from "inversify";
import Backend from "./Backend";

import { admin, adminSchema as typeDefs } from "@floro/graphql-schemas";
import BaseResolverModule from "./resolvers/BaseResolverModule";
import { Server } from "http";
import { resolvers as scalarResolvers } from "graphql-scalars";
import DatabaseConnection from "@floro/database/src/connection/DatabaseConnection";
import ContextFactory from "@floro/database/src/contexts/ContextFactory";
import RedisClient from "@floro/redis/src/RedisClient";
import { makeExecutableSchema } from "graphql-tools";
import RedisQueueWorkers from "@floro/redis/src/RedisQueueWorkers";
import { GraphQLSchema } from "graphql";
import RedisPubsubFactory from "@floro/redis/src/RedisPubsubFactory";
import BaseController from "./controllers/BaseController";
import RequestCache from "./request/RequestCache";
import StorageClient from "@floro/storage/src/StorageClient";
import ApolloRestClientFactory from "./controllers/ApolloRestClientFactory";
import { QueueService } from "./services/QueueService";

@injectable()
export default class AdminBackend extends Backend {
  public resolverModules: BaseResolverModule[];

  constructor(
    @multiInject("AdminResolverModule") adminResolverModules: BaseResolverModule[],
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
    @inject(ApolloRestClientFactory) apolloRestClientFactory: ApolloRestClientFactory,
  ) {
    super(
      resolverModules,
      controllers,
      queueServics,
      databaseConnection,
      redisClient,
      redisQueueWorkers,
      redisPubSubFactory,
      storageClient,
      contextFactory,
      httpServer,
      requestCache,
      apolloRestClientFactory
    );
    this.resolverModules = [...resolverModules, ...adminResolverModules];
  }

  public mergeResolvers(): Partial<admin.ResolversTypes> {
    return BaseResolverModule.mergeResolvers(this.resolverModules);
  }

  public buildExecutableSchema(): GraphQLSchema {
    const resolvers = {
      ...scalarResolvers,
      ...this.mergeResolvers(),
    } as admin.Resolvers;
    return makeExecutableSchema({
      typeDefs,
      resolvers,
    });
  }
}
