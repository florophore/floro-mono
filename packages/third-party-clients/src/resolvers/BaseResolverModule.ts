import { main } from '@floro/graphql-schemas' 
import { injectable } from 'inversify';

@injectable()
export default abstract class BaseResolverModule {
  public Query: main.QueryResolvers = {};
  public Mutation: main.Mutation = {};
  public Subscription: main.Subscription = {};

  public append(resolver: {
    Query: main.QueryResolvers,
    Mutation: any,
    Subscription: any
  }): {
    Query: main.QueryResolvers,
    Mutation: main.Mutation,
    Subscription: main.Subscription
  } {
    return {
      Query: {
        ...resolver.Query,
        ...this.Query,
      },
      Mutation: {
        ...resolver.Mutation,
        ...this.Mutation,
      },
      Subscription: {
        ...resolver.Subscription,
        ...this.Subscription,
      },
    };
  }
}