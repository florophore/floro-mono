import { main } from '@floro/graphql-schemas'; 
import { injectable } from 'inversify';

@injectable()
export default abstract class BaseResolverModule {
  public Query: main.QueryResolvers = {};
  public Mutation: main.MutationResolvers = {};
  public Subscription: main.SubscriptionResolvers = {};

  public append(resolver: {
    Query: main.QueryResolvers,
    Mutation: main.MutationResolvers,
    Subscription: main.SubscriptionResolvers
  }): {
    Query: main.QueryResolvers,
    Mutation: main.MutationResolvers,
    Subscription: main.SubscriptionResolvers
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