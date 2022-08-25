import { main } from '@floro/graphql-schemas'; 
import { injectable } from 'inversify';

@injectable()
export default abstract class BaseResolverModule {
  protected resolvers!: Array<keyof main.ResolversTypes&keyof this>;

  public append(resolver: Partial<main.ResolversTypes>&object): Partial<main.ResolversTypes>&object  {
    return this.resolvers.reduce((resolver, key) => {
      return {
        ...resolver,
        [key]: {
          ...((resolver[key] as object) ?? {}),
          ...this[key]
        }
      };
    }, resolver);
  }
}