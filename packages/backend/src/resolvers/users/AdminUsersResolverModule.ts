import BaseResolverModule, { IResolverModule } from "../BaseResolverModule";
import { main } from '@floro/graphql-schemas'; 
import { inject, injectable } from "inversify";
import AuthenticationService from "../../services/authentication/AuthenticationService";
import SessionStore from "@floro/redis/src/sessions/SessionStore";
import { UserAuthCredential } from "@floro/database/src/entities/UserAuthCredential";
import { User } from "@floro/database/src/entities/User";
import { AuthAction, UnsavedUser } from "@floro/graphql-schemas/src/generated/main-graphql";

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