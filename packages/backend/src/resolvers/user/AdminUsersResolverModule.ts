import BaseResolverModule from "../BaseResolverModule";
import { main } from '@floro/graphql-schemas'; 
import { inject, injectable } from "inversify";
import SessionStore from "@floro/redis/src/sessions/SessionStore";

@injectable()
export default class AdminUsersResolverModule extends BaseResolverModule {
  public resolvers: Array<keyof this&keyof main.ResolversTypes> = ["Query", "User"];
  protected sessionStore!: SessionStore;

  constructor(
    @inject(SessionStore) sessionStore: SessionStore
  ) {
    super();
    this.sessionStore = sessionStore;
  }

  public Query: main.QueryResolvers = {
  };

  public User: main.UserResolvers = {
  }
}