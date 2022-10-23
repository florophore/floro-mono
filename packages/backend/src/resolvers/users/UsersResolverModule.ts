import BaseResolverModule from "../BaseResolverModule";
import { main } from '@floro/graphql-schemas'; 
import { inject, injectable } from "inversify";
import AuthenticationService from "../../services/authentication/AuthenticationService";
import SessionStore from "@floro/redis/src/sessions/SessionStore";
import { UserAuthCredential } from "@floro/database/src/entities/UserAuthCredential";
import { User } from "@floro/database/src/entities/User";
import { AuthAction, UnsavedUser, UsernameCheckResult } from "@floro/graphql-schemas/src/generated/main-graphql";
import UsersService from "../../services/users/UsersService";
import { USERNAME_REGEX } from '@floro/common-web/src/utils/validators';

@injectable()
export default class UsersResolverModule extends BaseResolverModule {
  public resolvers: Array<keyof this&keyof main.ResolversTypes> = ["Query", "User"];
  protected sessionStore!: SessionStore;
  protected usersService!: UsersService;


  constructor(
    @inject(SessionStore) sessionStore: SessionStore,
    @inject(UsersService) usersService: UsersService
  ) {
    super();
    this.sessionStore = sessionStore;
    this.usersService = usersService;
  }

  public Query: main.QueryResolvers = {
    users: async () => {
      return [];
    },
    usernameCheck: async(root, { username }): Promise<UsernameCheckResult> => {
      if (!username || username == "" || !USERNAME_REGEX.test(username)) {
        return {
          __typename: "UsernameCheckResult",
          exists: false,
          username: username ?? ""
        };
      }
      const exists = await this.usersService.checkUsernameIsTaken(username ?? "");
        return {
          __typename: "UsernameCheckResult",
          exists,
          username: username
        };
    }
  };

  public User: main.UserResolvers = {

    user: async () => {
      return null;
    }
  }
}