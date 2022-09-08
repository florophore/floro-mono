import BaseResolverModule from "../BaseResolverModule";
import { main } from '@floro/graphql-schemas'; 
import { inject, injectable } from "inversify";
import ContextFactory from '@floro/database/src/contexts/ContextFactory';
import UsersContext from '@floro/database/src/contexts/users/UsersContext';
import GithubLoginClient from "../../thirdpartyclients/github/GithubLoginClient";
import GithubAccessToken from "../../thirdpartyclients/github/schemas/GithubAccessToken";
import DatabaseConnection from "@floro/database/src/connection/DatabaseConnection";

@injectable()
export default class UsersResolverModule extends BaseResolverModule {
  protected resolvers: Array<keyof this&keyof main.ResolversTypes> = ["Query", "Mutation"];
  protected databaseConnection!: DatabaseConnection;
  protected contextFactory!: ContextFactory;
  protected usersContext?: UsersContext;
  protected githubLoginClient?: GithubLoginClient;

  constructor(
    @inject(ContextFactory) contextFactory: ContextFactory,
    @inject(DatabaseConnection) databaseConnection: DatabaseConnection,
    @inject(GithubLoginClient) githubLoginClient: GithubLoginClient,
  ) {
    super();
    this.githubLoginClient = githubLoginClient;
    this.databaseConnection = databaseConnection;
    this.contextFactory = contextFactory;
  }

  public Query: main.QueryResolvers = {
    users: async () => {
      return [];
    },
  };

  public Mutation: main.MutationResolvers = {
    submitOAuthForAction: async (root, {code}) => {
      const githubAccessToken = await this.githubLoginClient?.getAccessToken(
        code as string
      );
      const user = await this.githubLoginClient?.getGithubUser(
        (githubAccessToken as GithubAccessToken).accessToken
      );
      console.log("USER", user);
      return null;
    },
  };
}