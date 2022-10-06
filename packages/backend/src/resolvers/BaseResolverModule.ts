import { admin, main } from '@floro/graphql-schemas'; 
import { injectable } from 'inversify';
import { RedisPubSub } from 'graphql-redis-subscriptions';

@injectable()
export default class BaseResolverModule {
  public resolvers!: Array<keyof main.ResolversTypes&keyof this>;
  protected pubsub!: RedisPubSub;

  public setRedisPubsub(pubsub: RedisPubSub) {
    this.pubsub = pubsub;
  }

  public static mergeResolvers(resolverModules: BaseResolverModule[]): Partial<main.ResolversTypes|admin.ResolversTypes>&object {
    return resolverModules.reduce((acc, resolverModule) => {
      return resolverModule.resolvers.reduce((acc, key) => {
        return {
          ...acc,
          [key]: {
            ...((acc[key] as object) ?? {}),
            ...(resolverModule[key] as object)
          }
        }

      }, acc);
    }, {});

  }
}