import BaseResolverModule from "../BaseResolverModule";
import { main } from '@floro/graphql-schemas'; 
import { inject, injectable } from "inversify";
import AuthenticationService from "../../services/authentication/AuthenticationService";
import SessionStore from "@floro/redis/src/sessions/SessionStore";
import { UserAuthCredential } from "@floro/database/src/entities/UserAuthCredential";
import { User } from "@floro/database/src/entities/User";
import { AuthAction, UnsavedUser } from "@floro/graphql-schemas/src/generated/main-graphql";
import SignupExchangStore from "@floro/redis/src/stores/SignUpExchangeStore";

@injectable()
export default class AuthenticationResolverModule extends BaseResolverModule {
  public resolvers: Array<keyof this&keyof main.ResolversTypes> = ["Query"];
  protected authenticationService!: AuthenticationService;
  protected sessionStore!: SessionStore;
  protected signupExchangeStore!: SignupExchangStore;

  constructor(
    @inject(AuthenticationService) authenticationService: AuthenticationService,
    @inject(SessionStore) sessionStore: SessionStore,
    @inject(SignupExchangStore) signupExchangeStore: SignupExchangStore
  ) {
    super();
    this.authenticationService = authenticationService;
    this.sessionStore = sessionStore;
    this.signupExchangeStore = signupExchangeStore;
  }

  public Query: main.QueryResolvers = {
    submitOAuthForAction: async (root, {code, provider, loginClient}) => {
      if (loginClient != "web" && loginClient != "desktop") {
        return null;
      }
      if (provider == 'github' && code) {
        const authenticationResult = await this.authenticationService.authWithGithubOAuth(code, loginClient as "web"|"desktop");
        if (authenticationResult.action == 'COMPLETE_SIGNUP') {
          const githubNameParts: string[] = authenticationResult?.credential?.githubName?.split(' ') ?? [];
          const firstName = githubNameParts?.slice(0, githubNameParts.length - 1)?.join(' ') ?? '';
          const lastName = githubNameParts?.[githubNameParts?.length - 1]; 
          const unsavedUser: UnsavedUser = {
            __typename: "UnsavedUser",
            username: authenticationResult?.credential?.email?.split?.('@')?.[0].substring(0, 20),
            firstName,
            lastName,
            email: authenticationResult?.credential?.email
          };
          const signupExchange =
            await this.signupExchangeStore.createSignupExchange(
              authenticationResult?.credential as UserAuthCredential
            );
          const action: AuthAction = {
            __typename: "CompleteSignupAction",
            authId: authenticationResult?.credential?.id,
            provider,
            unsavedUser,
            exchangeKey: signupExchange.id
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
          const action: AuthAction = {
            __typename: "PassedLoginAction",
            user: authenticationResult.user,
            session
          }
          return {
            type: "LOGIN",
            action
          };
        }
        if (authenticationResult.action == 'VERIFICATION_REQUIRED') {
          const action: AuthAction = {
            __typename: "VerificationRequiredAction",
            email: authenticationResult.email as string
          };
          return {
            type: 'VERIFICATION_REQUIRED',
            action
          }
        }
        if (authenticationResult.action == 'LOG_ERROR') {
          console.error(authenticationResult?.error?.type, authenticationResult?.error?.message, authenticationResult?.error?.meta);
        }
        return null;
      }
      if (provider == 'google' && code) {
        const authenticationResult = await this.authenticationService.authWithGoogleOAuth(code);
        if (authenticationResult.action == 'COMPLETE_SIGNUP') {
          const unsavedUser: UnsavedUser = {
            __typename: "UnsavedUser",
            username: authenticationResult?.credential?.email?.split?.('@')?.[0].substring(0, 20),
            firstName: authenticationResult?.credential?.googleGivenName,
            lastName: authenticationResult?.credential?.googleFamilyName,
            email: authenticationResult?.credential?.email
          };
          const signupExchange =
            await this.signupExchangeStore.createSignupExchange(
              authenticationResult?.credential as UserAuthCredential
            );
          const action: AuthAction = {
            __typename: "CompleteSignupAction",
            authId: authenticationResult?.credential?.id,
            provider,
            unsavedUser,
            exchangeKey: signupExchange.id
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
          const action: AuthAction = {
            __typename: "PassedLoginAction",
            user: authenticationResult.user,
            session
          }
          return {
            type: "LOGIN",
            action
          };
        }
        if (authenticationResult.action == 'LOG_ERROR') {
          console.error(authenticationResult?.error?.type, authenticationResult?.error?.message, authenticationResult?.error?.meta);
        }
        return null;
      }
      return null;
    },

    fetchEmailAuth: async (root, { authCode }) => {
      if (!authCode) {
        return null;
      }
      const authenticationResult = await this.authenticationService.authorizeEmailLink(authCode);
      if (authenticationResult.action == "COMPLETE_SIGNUP") {
        const unsavedUser: UnsavedUser = {
          __typename: "UnsavedUser",
          username: authenticationResult?.credential?.email?.split?.('@')?.[0].substring(0, 20),
          firstName: "",
          lastName: "",
          email: authenticationResult?.credential?.email
        };
        const signupExchange =
          await this.signupExchangeStore.createSignupExchange(
            authenticationResult?.credential as UserAuthCredential
          );
        const action: AuthAction = {
          __typename: "CompleteSignupAction",
          authId: authenticationResult?.credential?.id,
          provider: "floro",
          unsavedUser,
          exchangeKey: signupExchange.id
        };
        return {
          type: "COMPLETE_SIGNUP",
          action,
        };
      }
      if (authenticationResult.action == "LOGIN") {
        const session = await this.sessionStore.setNewSession(
          authenticationResult.user as User,
          authenticationResult.credential as UserAuthCredential
        );
        const action: AuthAction = {
          __typename: "PassedLoginAction",
          user: authenticationResult.user,
          session,
        };
        return {
          type: "LOGIN",
          action,
        };
      }
      if (authenticationResult.action == "LOG_ERROR") {
        console.error(
          authenticationResult?.error?.type,
          authenticationResult?.error?.message,
          authenticationResult?.error?.meta
        );
      }

      if (authenticationResult.action == "NOT_FOUND") {
        const action: AuthAction = {
          __typename: "AuthNotFound",
          message: "Not found"
        };

        return {
          type: "NOT_FOUND",
          action,
        };
      }

      return null;
    },

    fetchGithubVerification:async (root, { verificationCode }) => {
      if (!verificationCode) {
        return null;
      }
      const authenticationResult = await this.authenticationService.verifyGithubCredential(verificationCode);
      if (authenticationResult.action == "COMPLETE_SIGNUP") {
        const unsavedUser: UnsavedUser = {
          __typename: "UnsavedUser",
          username: authenticationResult?.credential?.email?.split?.("@")?.[0].substring(0, 20),
          email: authenticationResult?.credential?.email,
          firstName: "",
          lastName: ""
        };
        const signupExchange =
          await this.signupExchangeStore.createSignupExchange(
            authenticationResult?.credential as UserAuthCredential
          );
        const action: AuthAction = {
          __typename: "CompleteSignupAction",
          authId: authenticationResult?.credential?.id,
          provider: "floro",
          unsavedUser,
          exchangeKey: signupExchange.id
        };
        return {
          type: "COMPLETE_SIGNUP",
          action,
        };
      }
      if (authenticationResult.action == "LOGIN") {
        const session = await this.sessionStore.setNewSession(
          authenticationResult.user as User,
          authenticationResult.credential as UserAuthCredential
        );
        const action: AuthAction = {
          __typename: "PassedLoginAction",
          user: authenticationResult.user,
          session,
        };
        return {
          type: "LOGIN",
          action,
        };
      }
      if (authenticationResult.action == "LOG_ERROR") {
        console.error(
          authenticationResult?.error?.type,
          authenticationResult?.error?.message,
          authenticationResult?.error?.meta
        );
      }

      if (authenticationResult.action == "NOT_FOUND") {
        const action: AuthAction = {
          __typename: "AuthNotFound",
          message: "Not found"
        };

        return {
          type: "NOT_FOUND",
          action,
        };
      }
      return null;
    }
  };
}