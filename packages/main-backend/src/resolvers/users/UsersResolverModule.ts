import BaseResolverModule from "../BaseResolverModule";
import { main } from '@floro/graphql-schemas'; 
import { inject, injectable } from "inversify";
import AuthenticationService from "../../services/authentication/AuthenticationService";
import SessionStore from "@floro/redis/src/sessions/SessionStore";
import { UserAuthCredential } from "@floro/database/src/entities/UserAuthCredential";
import { User } from "@floro/database/src/entities/User";
import { AuthAction, UnsavedUser } from "@floro/graphql-schemas/build/generated/main-graphql";

@injectable()
export default class UsersResolverModule extends BaseResolverModule {
  protected resolvers: Array<keyof this&keyof main.ResolversTypes> = ["Query", "Mutation", "User"];
  protected authenticationService!: AuthenticationService;
  protected sessionStore!: SessionStore;

  constructor(
    @inject(AuthenticationService) authenticationService: AuthenticationService,
    @inject(SessionStore) sessionStore: SessionStore
  ) {
    super();
    this.authenticationService = authenticationService;
    this.sessionStore = sessionStore;
  }

  public Query: main.QueryResolvers = {
    users: async () => {
      return [];
    },
  };

  public Mutation: main.MutationResolvers = {
    submitOAuthForAction: async (root, {code, provider}) => {
      if (provider == 'github' && code) {
        const authenticationResult = await this.authenticationService.authWithGithubOAuth(code);
        if (authenticationResult.action == 'COMPLETE_SIGNUP') {
          const githubNameParts: string[] = authenticationResult?.credential?.githubName?.split(' ') ?? [];
          const firstName = githubNameParts?.slice(0, githubNameParts.length - 1)?.join(' ') ?? '';
          const lastName = githubNameParts?.[githubNameParts?.length - 1]; 
          const unsavedUser: UnsavedUser = {
            __typename: "UnsavedUser",
            username: authenticationResult?.credential?.email?.split?.('@')?.[0],
            firstName,
            lastName,
            email: authenticationResult?.credential?.email
          };
          const action: AuthAction = {
            __typename: "CompleteSignupAction",
            OAuthId: authenticationResult?.credential?.id,
            provider,
            unsavedUser
          };
          return {
            type: "COMPLETE_SIGNUP",
            action
          }
        }
        if (authenticationResult.action == 'LOGIN') {
          const session = await this.sessionStore.setNewSession(
            authenticationResult.user as User,
            authenticationResult.credential as UserAuthCredential
          );
        }
        if (authenticationResult.action == 'LOG_ERROR') {

        }

        return null;
      }
      if (provider == 'google' && code) {
        const authenticationResult = await this.authenticationService.authWithGoogleOAuth(code);
        if (authenticationResult.action == 'COMPLETE_SIGNUP') {
          const unsavedUser: UnsavedUser = {
            __typename: "UnsavedUser",
            username: authenticationResult?.credential?.email?.split?.('@')?.[0],
            firstName: authenticationResult?.credential?.googleGivenName,
            lastName: authenticationResult?.credential?.googleFamilyName,
            email: authenticationResult?.credential?.email
          }
          const action: AuthAction = {
            __typename: "CompleteSignupAction",
            OAuthId: authenticationResult?.credential?.id,
            provider,
            unsavedUser
          };
          return {
            type: "COMPLETE_SIGNUP",
            action
          }
        }
        if (authenticationResult.action == 'LOGIN') {
          const session = await this.sessionStore.setNewSession(
            authenticationResult.user as User,
            authenticationResult.credential as UserAuthCredential
          );
          console.log("SESSION", session);
        }
        if (authenticationResult.action == 'LOG_ERROR') {

        }
        return null;
      }
      return null;
    },
  };

  public User: main.UserResolvers = {

  }
}