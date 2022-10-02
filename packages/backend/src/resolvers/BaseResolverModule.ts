import { admin, main } from '@floro/graphql-schemas'; 
import { injectable } from 'inversify';

@injectable()
export default class BaseResolverModule {
  public resolvers!: Array<keyof main.ResolversTypes&keyof this>;

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

export interface IResolverModule extends BaseResolverModule {}
