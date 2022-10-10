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

@injectable()
export default class AdminBackend extends Backend {
  public resolverModules: BaseResolverModule[];

  constructor(
    @multiInject("AdminResolverModule") adminResolverModules: BaseResolverModule[],
    @multiInject("ResolverModule") resolverModules: BaseResolverModule[],
    @inject(DatabaseConnection) databaseConnection: DatabaseConnection,
    @inject(RedisClient) redisClient: RedisClient,
    @inject(RedisQueueWorkers) redisQueueWorkers: RedisQueueWorkers,
    @inject(RedisPubsubFactory) redisPubSubFactory: RedisPubsubFactory,
    @inject(ContextFactory) contextFactory: ContextFactory,
    @inject(Server) httpServer: Server
  ) {
    super(
      resolverModules,
      databaseConnection,
      redisClient,
      redisQueueWorkers,
      redisPubSubFactory,
      contextFactory,
      httpServer
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
