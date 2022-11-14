import BaseResolverModule from "../BaseResolverModule";
import { main } from "@floro/graphql-schemas";
import { inject, injectable } from "inversify";
import AuthenticationService from "../../services/authentication/AuthenticationService";
import SessionStore from "@floro/redis/src/sessions/SessionStore";
import { UserAuthCredential } from "@floro/database/src/entities/UserAuthCredential";
import { User } from "@floro/database/src/entities/User";
import {
  AuthAction,
  UnsavedUser,
  AccountCreationErrorAction,
} from "@floro/graphql-schemas/src/generated/main-graphql";
import SignupExchangStore from "@floro/redis/src/stores/SignUpExchangeStore";
import {
  AccountCreationSuccessAction,
  EmailAuthErrorAction,
  VerificationSentAction,
} from "@floro/graphql-schemas/build/generated/main-graphql";
import EmailValidator from "email-validator";

@injectable()
export default class AuthenticationResolverModule extends BaseResolverModule {
  public resolvers: Array<keyof this & keyof main.ResolversTypes> = [
    "Query",
    "Mutation",
  ];
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
    session: (_root, _args, { session }) => {
      return session;
    },

    submitOAuthForAction: async (_root, { code, provider, loginClient }) => {
      if (loginClient != "web" && loginClient != "desktop") {
        return null;
      }
      if (provider == "github" && code) {
        const authenticationResult =
          await this.authenticationService.authWithGithubOAuth(
            code,
            loginClient as "web" | "desktop"
          );
        if (authenticationResult.action == "COMPLETE_SIGNUP") {
          const githubNameParts: string[] =
            authenticationResult?.credential?.githubName?.split(" ") ?? [];
          const firstName =
            githubNameParts?.slice(0, githubNameParts.length - 1)?.join(" ") ??
            "";
          const lastName = githubNameParts?.[githubNameParts?.length - 1];
          const unsavedUser: UnsavedUser = {
            __typename: "UnsavedUser",
            username: authenticationResult?.credential?.githubLogin,
            firstName,
            lastName,
            email: authenticationResult?.credential?.email,
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
            exchangeKey: signupExchange.id,
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
        if (authenticationResult.action == "VERIFICATION_REQUIRED") {
          const action: AuthAction = {
            __typename: "VerificationRequiredAction",
            email: authenticationResult.email as string,
          };
          return {
            type: "VERIFICATION_REQUIRED",
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
        return null;
      }
      if (provider == "google" && code) {
        const authenticationResult =
          await this.authenticationService.authWithGoogleOAuth(code);
        if (authenticationResult.action == "COMPLETE_SIGNUP") {
          const unsavedUser: UnsavedUser = {
            __typename: "UnsavedUser",
            username: authenticationResult?.credential?.email
              ?.split?.("@")?.[0]
              .substring(0, 20),
            firstName: authenticationResult?.credential?.googleGivenName,
            lastName: authenticationResult?.credential?.googleFamilyName,
            email: authenticationResult?.credential?.email,
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
            exchangeKey: signupExchange.id,
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
        return null;
      }
      return null;
    },

    fetchEmailAuth: async (_root, { authCode }) => {
      if (!authCode) {
        return null;
      }
      const authenticationResult =
        await this.authenticationService.authorizeEmailLink(authCode);
      if (authenticationResult.action == "COMPLETE_SIGNUP") {
        const unsavedUser: UnsavedUser = {
          __typename: "UnsavedUser",
          username: authenticationResult?.credential?.email
            ?.split?.("@")?.[0]
            .substring(0, 20),
          firstName: authenticationResult?.firstName ?? "",
          lastName: authenticationResult?.lastName ?? "",
          email: authenticationResult?.credential?.email,
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
          exchangeKey: signupExchange.id,
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
          message: "Not found",
        };

        return {
          type: "NOT_FOUND",
          action,
        };
      }

      return null;
    },

    fetchGithubVerification: async (_root, { verificationCode }) => {
      if (!verificationCode) {
        return null;
      }
      const authenticationResult =
        await this.authenticationService.verifyGithubCredential(
          verificationCode
        );
      if (authenticationResult.action == "COMPLETE_SIGNUP") {
        const githubNameParts: string[] =
          authenticationResult?.credential?.githubName?.split(" ") ?? [];
        const firstName =
          githubNameParts?.slice(0, githubNameParts.length - 1)?.join(" ") ??
          "";
        const lastName = githubNameParts?.[githubNameParts?.length - 1];
        const unsavedUser: UnsavedUser = {
          __typename: "UnsavedUser",
          username: authenticationResult?.credential?.githubLogin,
          email: authenticationResult?.credential?.email,
          firstName,
          lastName,
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
          exchangeKey: signupExchange.id,
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
        return null;
      }

      if (authenticationResult.action == "NOT_FOUND") {
        const action: AuthAction = {
          __typename: "AuthNotFound",
          message: "Not found",
        };

        return {
          type: "NOT_FOUND",
          action,
        };
      }
      return null;
    },
  };

  public Mutation: main.MutationResolvers = {
    exchangeSession: async (_root, _args, { session, currentUser }) => {
      if (session) {
        const exchangeSession = await this.sessionStore.exchangeSession(session);
        if (currentUser) {
          return await this.sessionStore.updateSessionUser(exchangeSession, currentUser);
        }
        return exchangeSession;
      }
      return null;
    },
    submitEmailForAuth: async (_root, { email, loginClient }) => {
      if (loginClient != "web" && loginClient != "desktop") {
        return null;
      }
      if (!email || !EmailValidator.validate(email)) {
        const action: EmailAuthErrorAction = {
          __typename: "EmailAuthErrorAction",
          type: "INVALID_EMAIL",
          message: "Invalid email",
        };
        return {
          type: "EMAIL_AUTH_ERROR",
          action,
        };
      }
      const verificationResult =
        await this.authenticationService.signupOrLoginByEmail(
          email as string,
          loginClient
        );
      if (verificationResult?.action == "LOG_ERROR") {
        console.error(
          verificationResult?.error?.type,
          verificationResult?.error?.message,
          verificationResult?.error?.meta
        );
        return null;
      }
      const action: VerificationSentAction = {
        __typename: "VerificationSentAction",
        message: "Email verification sent",
      };

      return {
        type: "VERIFICATION_SENT",
        action,
      };
    },

    createAccount: async (
      _root,
      { firstName, lastName, username, agreeToTOS, exchangeKey, credentialId }
    ) => {
      const signupExchange = await this.signupExchangeStore.fetchSignupExchange(
        exchangeKey
      );
      if (!signupExchange) {
        const action: AccountCreationErrorAction = {
          __typename: "AccountCreationErrorAction",
          message: "Bad exchange key",
          type: "BAD_EXCHANGE_KEY",
        };
        return {
          type: "ACCOUNT_ERROR",
          action,
        };
      }
      const creationResult = await this.authenticationService.createAccount(
        signupExchange,
        credentialId,
        firstName,
        lastName,
        username,
        agreeToTOS ?? false
      );
      if (creationResult.action == "USER_CREATED") {
        const session = await this.sessionStore.setNewSession(
          creationResult.user as User,
          creationResult.credential as UserAuthCredential
        );
        const action: AccountCreationSuccessAction = {
          __typename: "AccountCreationSuccessAction",
          user: creationResult.user,
          session,
        };
        return {
          type: "ACCOUNT_CREATION_SUCCESS",
          action,
        };
      }
      if (creationResult.action == "LOG_ERROR") {
        console.error(
          creationResult?.error?.type,
          creationResult?.error?.message,
          creationResult?.error?.meta
        );
        return null;
      }
      const action: AccountCreationErrorAction = {
        __typename: "AccountCreationErrorAction",
        message: creationResult.message,
        type: creationResult.action,
      };
      return {
        type: "ACCOUNT_CREATION_ERROR",
        action,
      };
    },
  };
}
