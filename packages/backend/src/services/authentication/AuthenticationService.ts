import { injectable, inject, multiInject } from "inversify";

import DatabaseConnection from "@floro/database/src/connection/DatabaseConnection";
import ContextFactory from "@floro/database/src/contexts/ContextFactory";
import UsersContext from "@floro/database/src/contexts/users/UsersContext";
import UserAuthCredentialsContext from "@floro/database/src/contexts/authentication/UserAuthCredentialsContext";
import UserServiceAgreementsContext from "@floro/database/src/contexts/users/UserServiceAgreementsContext"; 
import { UserAuthCredential } from "@floro/database/src/entities/UserAuthCredential";
import { User } from "@floro/database/src/entities/User";
import GithubLoginClient from "@floro/third-party-services/src/github/GithubLoginClient";
import GithubAccessToken from "@floro/third-party-services/src/github/schemas/GithubAccessToken";
import GithubEmail from "@floro/third-party-services/src/github/schemas/GithubEmail";
import GithubUser from "@floro/third-party-services/src/github/schemas/GithubUser";
import GoogleUser from "@floro/third-party-services/src/google/schemas/GoogleUser";
import GoogleLoginClient from "@floro/third-party-services/src/google/GoogleLoginClient";
import GoogleAccessToken from "@floro/third-party-services/src/google/schemas/GoogleAccessToken";
import EmailQueue from "@floro/redis/src/queues/EmailQueue";
import EmailVerificationStore from "@floro/redis/src/stores/EmailVerificationStore";
import EmailAuthStore from "@floro/redis/src/stores/EmailAuthStore";
import { SignUpExchange } from "@floro/redis/src/stores/SignUpExchangeStore";
import ProfanityFilter from 'bad-words';
import { NAME_REGEX, USERNAME_REGEX } from '@floro/common-web/src/utils/validators';
import OrganizationsContext from "@floro/database/src/contexts/organizations/OrganizationsContext";
import HandleChecker from "../utils/HandleChecker";
import CreateUserEventHandler from "../events/CreateUserEventHandler";

const profanityFilter = new ProfanityFilter();

export interface AuthReponse {
    action: 'COMPLETE_SIGNUP'|'LOG_ERROR'|'LOGIN'|'VERIFICATION_REQUIRED'|'VERIFICATION_SENT'|'NOT_FOUND';
    user?: User;
    credential?: UserAuthCredential;
    email?: string;
    firstName?: string;
    lastName?: string;
    error?: {
        type: string;
        message: string;
        meta?: any;
    };
}

export interface AccountCreationResponse {
    action: 'BAD_CREDENTIAL_ID'|'BAD_EXCHANGE_KEY'|'INVALID_CREDENTIALS'|'CREDENTIAL_ALREADY_IN_USE'|'USERNAME_ALREADY_IN_USE'|'USER_CREATED'|'LOG_ERROR';
    user?: User;
    credential?: UserAuthCredential;
    message?: string;
    error?: {
        type: string;
        message: string;
        meta?: any;
    };
}

@injectable()
export default class AuthenticationService {

    private databaseConnection!: DatabaseConnection;
    private contextFactory!: ContextFactory;
    private githubLoginClient!: GithubLoginClient;
    private googleLoginClient!: GoogleLoginClient;
    private emailVerificationStore!: EmailVerificationStore;
    private emailAuthStore!: EmailAuthStore;
    private emailQueue?: EmailQueue;
    private createUserHandlers!: CreateUserEventHandler[];

    constructor(
        @inject(DatabaseConnection) databaseConnection: DatabaseConnection,
        @inject(ContextFactory) contextFactory: ContextFactory,
        @inject(GithubLoginClient) githubLoginClient: GithubLoginClient,
        @inject(GoogleLoginClient) googleLoginClient: GoogleLoginClient,
        @inject(EmailVerificationStore) emailVerificationStore: EmailVerificationStore,
        @inject(EmailAuthStore) emailAuthStore: EmailAuthStore,
        @inject(EmailQueue) emailQueue: EmailQueue,
        @multiInject("CreateUserHandler") createUserHandlers: CreateUserEventHandler[]
        ) {
        this.databaseConnection = databaseConnection;
        this.contextFactory = contextFactory;
        this.githubLoginClient = githubLoginClient;
        this.googleLoginClient = googleLoginClient;
        this.emailVerificationStore = emailVerificationStore;
        this.emailAuthStore = emailAuthStore;
        this.emailQueue = emailQueue;
        this.createUserHandlers = createUserHandlers;
    }

    public async authWithGithubOAuth(code: string, loginClient: 'web'|'desktop'): Promise<AuthReponse> {
        const queryRunner = await this.databaseConnection.makeQueryRunner();
        try {
            const githubAccessToken = await this.githubLoginClient.getAccessToken(code); 
            if (!(githubAccessToken instanceof GithubAccessToken)) {
                return { action: 'LOG_ERROR', error: { type: 'GITHUB_OAUTH_ERROR', message: 'Bad auth code', meta: { code }} };
            }
            const githubUser = await this.githubLoginClient.getGithubUser(githubAccessToken.accessToken);
            if (!(githubUser instanceof GithubUser)) {
                return { action: 'LOG_ERROR', error: { type: 'GITHUB_OAUTH_ERROR', message: 'Bad access token', meta: { accessToken: githubAccessToken.accessToken }} };
            }
            const githubUserEmails = await this.githubLoginClient.getGithubUserEmails(githubAccessToken.accessToken);
            if (!(githubUserEmails instanceof Array<GithubEmail>)) {
                return { action: 'LOG_ERROR', error: { type: 'GITHUB_OAUTH_ERROR', message: 'Bad access token', meta: { githubUserEmails }} };
            }
            const primaryEmail = githubUserEmails.find((email: GithubEmail) => {
                return !!email.primary;
            });

            if (!(primaryEmail instanceof GithubEmail) || !primaryEmail?.email) {
                return { action: 'LOG_ERROR', error: { type: 'GITHUB_OAUTH_ERROR', message: 'No primary email', meta: { githubUserEmails }} };
            }

            await queryRunner.startTransaction();
            const usersContext = await this.contextFactory.createContext(UsersContext, queryRunner);
            const userAuthCredentialsContext = await this.contextFactory.createContext(UserAuthCredentialsContext, queryRunner);
            const credentials = await userAuthCredentialsContext.getCredentialsByEmail(primaryEmail.email);
            const userId = userAuthCredentialsContext.getUserIdFromCredentials(credentials);

            // USER DOES NOT HAVE GITHUB CREDENTIAL AND HAS NOT SIGNED UP
            if (!userId && !userAuthCredentialsContext.hasGithubCredential(credentials)) {

                const credential = await userAuthCredentialsContext.createGithubCredential(
                    githubAccessToken,
                    githubUser,
                    primaryEmail,
                    credentials.length == 0, // isSignupCredential
                    userAuthCredentialsContext.getGithubCredential(credentials)?.isThirdPartyVerified
                )
                await queryRunner.commitTransaction();
                // ADD TRUE TO TEST LOGIC
                if (!credential?.isThirdPartyVerified) {
                    const verification = await this.emailVerificationStore.createEmailVerification(credential);
                    const link = this.emailVerificationStore.link(verification, loginClient);
                    // SEND VERIFICATION EMAIL
                    await this.emailQueue?.add({
                        jobId: verification.id,
                        template: "VerifyGithubOAuthEmail",
                        props: {
                            link,
                            action: "signup"
                        },
                        to: credential.email as string,
                        from: "accounts@floro.io",
                        subject: "Verify Email"
                    });
                    return { action: 'VERIFICATION_REQUIRED', email: credential.email as string };
                }
                return { action: 'COMPLETE_SIGNUP', credential };
            }

            // USER HAS GITHUB CREDENTIAL BUT HAS NOT SIGNED UP
            if (!userId) {
                const credential = userAuthCredentialsContext.getGithubCredential(credentials) as UserAuthCredential;
                await queryRunner.commitTransaction();
                // construct partial user
                return { action: 'COMPLETE_SIGNUP', credential };
            }

            const user = await usersContext.getById(userId);
            if (!user) {
                await queryRunner.rollbackTransaction();
                return { action: 'LOG_ERROR', error: { type: 'POSTGRES_ERROR', message: 'No user', meta: { userId }} };
            }
            if (!userAuthCredentialsContext.hasGithubCredential(credentials)) {
                // CREATE CREDENTIAL;
                await userAuthCredentialsContext.createGithubCredential(
                    githubAccessToken,
                    githubUser,
                    primaryEmail,
                    false,
                    userAuthCredentialsContext.getGithubCredential(credentials)?.isThirdPartyVerified,
                    user
                );
            }
            await userAuthCredentialsContext.attachUserToCredentials(credentials, user)
            const credential = userAuthCredentialsContext.getGithubCredential(
                await userAuthCredentialsContext.getCredentialsByEmail(primaryEmail.email) 
            );
            if (credential && !credential.isThirdPartyVerified) {
                const verification = await this.emailVerificationStore.createEmailVerification(credential);
                const link = this.emailVerificationStore.link(verification, loginClient);
                // SEND VERIFICATION EMAIL
                await this.emailQueue?.add({
                    jobId: verification.id,
                    template: "VerifyGithubOAuthEmail",
                    props: {
                        link,
                        action: "login"
                    },
                    to: primaryEmail.email as string,
                    from: "accounts@floro.io",
                    subject: "Verify Email"
                });
                return { action: 'VERIFICATION_REQUIRED', email: primaryEmail.email };
            }
            if (credential) {
                await queryRunner.commitTransaction();
                return { action: 'LOGIN', user, credential };
            }
            await queryRunner.rollbackTransaction();
            return { action: 'LOG_ERROR', error: { type: 'MALFORMED_CREDENTIAL', message: 'Github credential not created'} };
        } catch (e: any) {
            if (!queryRunner.isReleased) {
                await queryRunner.rollbackTransaction();
            }
            return { action: 'LOG_ERROR', error: { type: 'UNKNOWN_GITHUB_LOGIN_ERROR', message: e?.message, meta: e} };
        } finally {
            await queryRunner.release();
        }
    }

    public async authWithGoogleOAuth(code: string): Promise<AuthReponse> {
        const queryRunner = await this.databaseConnection.makeQueryRunner();
        try {
            const googleAccessToken = await this.googleLoginClient.getAccessToken(code); 
            if (!(googleAccessToken instanceof GoogleAccessToken)) {
                return { action: 'LOG_ERROR', error: { type: 'GOOGLE_OAUTH_ERROR', message: 'Bad auth code', meta: { code }} };
            }
            const googleUser = await this.googleLoginClient.getGoogleUser(googleAccessToken.accessToken);
            if (!(googleUser instanceof GoogleUser)) {
                return { action: 'LOG_ERROR', error: { type: 'GOOGLE_OAUTH_ERROR', message: 'Bad access token', meta: { accessToken: googleAccessToken.accessToken }} };
            }
            if (!googleUser?.email) {
                return { action: 'LOG_ERROR', error: { type: 'GOOGLE_OAUTH_ERROR', message: 'No google account email', meta: { googleUser }} };
            }
            await queryRunner.startTransaction();
            const usersContext = await this.contextFactory.createContext(UsersContext, queryRunner);
            const userAuthCredentialsContext = await this.contextFactory.createContext(UserAuthCredentialsContext, queryRunner);
            const credentials = await userAuthCredentialsContext.getCredentialsByEmail(googleUser.email);
            const userId =  userAuthCredentialsContext.getUserIdFromCredentials(credentials);

            if (!userId && !userAuthCredentialsContext.hasGoogleCredential(credentials)) {
                const credential = await userAuthCredentialsContext.createGoogleCredential(
                    googleAccessToken,
                    googleUser,
                    credentials.length == 0, // isSignupCredential
                    userAuthCredentialsContext.hasVerifiedCredential(credentials)
                )
                await queryRunner.commitTransaction();
                return { action: 'COMPLETE_SIGNUP', credential };
            }
            // HAS NOT SIGNED UP BUT HAS EXISTING GOOGLE CREDENTIAL
            if (!userId) {
                const credential = userAuthCredentialsContext.getGoogleCredential(credentials) as UserAuthCredential;
                await queryRunner.commitTransaction();
                return { action: 'COMPLETE_SIGNUP', credential };
            }
            const user = await usersContext.getById(userId);
            if (!user) {
                await queryRunner.rollbackTransaction();
                return { action: 'LOG_ERROR', error: { type: 'POSTGRES_ERROR', message: 'No user', meta: { userId }} };
            }
            if (!userAuthCredentialsContext.hasGoogleCredential(credentials)) {
                // CREATE CREDENTIAL;
                await userAuthCredentialsContext.createGoogleCredential(
                    googleAccessToken,
                    googleUser,
                    false,
                    userAuthCredentialsContext.hasVerifiedCredential(credentials),
                    user
                )
            }
            await userAuthCredentialsContext.attachUserToCredentials(credentials, user)
            const credential = userAuthCredentialsContext.getGoogleCredential(
                await userAuthCredentialsContext.getCredentialsByEmail(googleUser.email) 
            );
            if (credential) {
                await queryRunner.commitTransaction();
                return { action: 'LOGIN', user, credential };
            }
            await queryRunner.rollbackTransaction();
            return { action: 'LOG_ERROR', error: { type: 'MALFORMED_CREDENTIAL', message: 'Google credential not created'} };

        } catch (e: any) {
            if (!queryRunner.isReleased) {
                await queryRunner?.rollbackTransaction?.();
            }
            return { action: 'LOG_ERROR', error: { type: 'UNKNOWN_GOOGLE_LOGIN_ERROR', message: e?.message, meta: e} };
        } finally {
            queryRunner.release();
        }
    }

    public async signupOrLoginByEmail(email: string, loginClient: 'cli'|'web'|'desktop') {
        const queryRunner = await this.databaseConnection.makeQueryRunner();
        const userAuthCredentialsContext = await this.contextFactory.createContext(UserAuthCredentialsContext, queryRunner);
        try {
            await queryRunner.startTransaction();
            const credentials = await userAuthCredentialsContext.getCredentialsByEmail(email);
            const userId = userAuthCredentialsContext.getUserIdFromCredentials(credentials);
            if (!userId && !userAuthCredentialsContext.hasEmailCredential(credentials)) {
                const credential = await userAuthCredentialsContext.createEmailCredential(
                    email,
                    credentials.length == 0,
                    userAuthCredentialsContext.hasVerifiedCredential(credentials)
                )
                await queryRunner.commitTransaction();

                const authorization = await this.emailAuthStore.createEmailAuth(credential.email);
                const link = this.emailAuthStore.link(authorization, loginClient);
                // update this
                await this.emailQueue?.add({
                    jobId: authorization.id,
                    template: "SignupEmail",
                    props: {
                        link
                    },
                    to: email,
                    from: "accounts@floro.io",
                    subject: "Complete Floro Sign Up"
                });
                return { action: 'VERIFICATION_SENT', credential };
            }
            if (!userId) {
                const credential = userAuthCredentialsContext.getEmailCredential(credentials) as UserAuthCredential;
                await queryRunner.commitTransaction();
                const authorization = await this.emailAuthStore.createEmailAuth(credential.email);
                const link = this.emailAuthStore.link(authorization, loginClient);
                await this.emailQueue?.add({
                    jobId: authorization.id,
                    template: "SignupEmail",
                    props: {
                        link
                    },
                    to: email,
                    from: "accounts@floro.io",
                    subject: "Complete Floro Sign Up"
                });
                return { action: 'VERIFICATION_SENT', credential };
            }
            const usersContext = await this.contextFactory.createContext(UsersContext, queryRunner);
            const user = await usersContext.getById(userId);

            if (!user) {
                await queryRunner.rollbackTransaction();
                return { action: 'LOG_ERROR', error: { type: 'POSTGRES_ERROR', message: 'No user', meta: { userId }} };
            }
            if (!userAuthCredentialsContext.hasEmailCredential(credentials)) {
                // CREATE CREDENTIAL;
                const credential = await userAuthCredentialsContext.createEmailCredential(
                    email,
                    credentials.length == 0,
                    false,
                    user
                );
                await queryRunner.commitTransaction();
                const authorization = await this.emailAuthStore.createEmailAuth(credential.email);
                const link = this.emailAuthStore.link(authorization, loginClient);
                await this.emailQueue?.add({
                    jobId: authorization.id,
                    template: "LoginEmail",
                    props: {
                        link
                    },
                    to: email,
                    from: "accounts@floro.io",
                    subject: "Floro Login"
                });
                return { action: 'VERIFICATION_SENT', credential };
            }
            const credential = userAuthCredentialsContext.getEmailCredential(credentials) as UserAuthCredential;
            await queryRunner.commitTransaction();
            const authorization = await this.emailAuthStore.createEmailAuth(credential.email);
            const link = this.emailAuthStore.link(authorization, loginClient);
            await this.emailQueue?.add({
                jobId: authorization.id,
                template: "LoginEmail",
                props: {
                    link
                },
                to: email,
                from: "accounts@floro.io",
                subject: "Floro Login"
            });
            return { action: 'VERIFICATION_SENT', credential };
        } catch (e: any) {
            if (!queryRunner.isReleased) {
                await queryRunner?.rollbackTransaction?.();
            }
            return { action: 'LOG_ERROR', error: { type: 'UNKNOWN_EMAIL_LOGIN_ERROR', message: e?.message, meta: e} };
        } finally {
            queryRunner.release();
        }
    }

    public async verifyGithubCredential(verificationCode: string): Promise<AuthReponse> {
        try {
            const emailVerification = await this.emailVerificationStore.fetchEmailVerification(verificationCode);
            if (!emailVerification) {
                return { action: 'NOT_FOUND'};
            }
            const userAuthCredentialsContext = await this.contextFactory.createContext(UserAuthCredentialsContext);
            const userAuthCredential = await userAuthCredentialsContext.getById(emailVerification.oauthId) as UserAuthCredential;
            const credential = await userAuthCredentialsContext.updateUserAuthCredential(
                userAuthCredential,
                {
                    isThirdPartyVerified: true,
                    isVerified: true
                }
            );
            const credentials = await userAuthCredentialsContext.getCredentialsByEmail(userAuthCredential.email);
            const userId = userAuthCredentialsContext.getUserIdFromCredentials(credentials);
            if (!userId) {
                return { action: 'COMPLETE_SIGNUP', credential };
            }
            const usersContext = await this.contextFactory.createContext(UsersContext);
            const user = await usersContext.getById(userId);
            if (!user) {
                return { action: 'LOG_ERROR', error: { type: 'POSTGRES_ERROR', message: 'No user', meta: { userId }} };
            }
            return { action: 'LOGIN', user, credential };
        } catch(e: any) {
            return { action: 'LOG_ERROR', error: { type: 'UNKNOWN_GITHUB_VERIFICATION_ERROR', message: e?.message, meta: e} };
        }
    }

    public async authorizeEmailLink(authorizationCode: string): Promise<AuthReponse> {
        const userAuthCredentialsContext = await this.contextFactory.createContext(UserAuthCredentialsContext);
        try {
            const authorization = await this.emailAuthStore.fetchEmailAuth(authorizationCode);
            if (!authorization) {
                return { action: 'NOT_FOUND'};
            }
            const credentials = await userAuthCredentialsContext.getCredentialsByEmail(authorization.email);
            const userId = userAuthCredentialsContext.getUserIdFromCredentials(credentials);
            const userAuthCredential = userAuthCredentialsContext.getEmailCredential(credentials) as UserAuthCredential;
            const credential = await userAuthCredentialsContext.updateUserAuthCredential(userAuthCredential, { isVerified: true });
            if (!userId) {
                return { action: 'COMPLETE_SIGNUP', credential, firstName: authorization?.firstName ?? "", lastName: authorization?.lastName ?? "" };
            }
            const usersContext = await this.contextFactory.createContext(UsersContext);
            const user = await usersContext.getById(userId);

            if (!user) {
                return { action: 'LOG_ERROR', error: { type: 'POSTGRES_ERROR', message: 'No user', meta: { userId }} };
            }
            return { action: 'LOGIN', user, credential };
        } catch (e: any) {
            return { action: 'LOG_ERROR', error: { type: 'UNKNOWN_EMAIL_AUTHORIZATION_ERROR', message: e?.message, meta: e} };
        }
    }

    public async createAccount(signupExchange: SignUpExchange, credentialId: string, firstName: string, lastName: string, username: string, agreeToTOS: boolean): Promise<AccountCreationResponse> {
        const queryRunner = await this.databaseConnection.makeQueryRunner();
        try {
            await queryRunner.startTransaction();
            const userAuthCredentialsContext = await this.contextFactory.createContext(UserAuthCredentialsContext, queryRunner);
            const usersContext = await this.contextFactory.createContext(UsersContext, queryRunner);
            const organizationsContext = await this.contextFactory.createContext(OrganizationsContext, queryRunner);
            const userServiceAgreementsContext = await this.contextFactory.createContext(
                UserServiceAgreementsContext,
                queryRunner
            );
            if (signupExchange.credentialId != credentialId) {
                return {action: 'BAD_EXCHANGE_KEY', message: "Bad Exchange Token"};
            }
            if (signupExchange.credentialId != credentialId) {
                return {action: 'BAD_CREDENTIAL_ID', message: "Bad credential ID"};
            }
            const isValid = (
                agreeToTOS &&
                USERNAME_REGEX.test(username) &&
                NAME_REGEX.test(firstName) &&
                NAME_REGEX.test(lastName) &&
                !profanityFilter.isProfane(username) &&
                !profanityFilter.isProfane(firstName) &&
                !profanityFilter.isProfane(lastName)
            );
            if (!isValid) {
                await queryRunner.rollbackTransaction();
                return { action: 'INVALID_CREDENTIALS', message: "Invalid credentials"};
            }
            const credential = await userAuthCredentialsContext.getById(credentialId);
            if (!credential) {
                await queryRunner.rollbackTransaction();
                return { action: 'BAD_CREDENTIAL_ID', message: "Bad credential ID"};
            }
            const credentials = await userAuthCredentialsContext.getCredentialsByEmail(credential.email);
            const existingUserId = userAuthCredentialsContext.getUserIdFromCredentials(credentials);
            if (existingUserId) {
                await queryRunner.rollbackTransaction();
                return { action: 'CREDENTIAL_ALREADY_IN_USE', message: "Credential already in use"};
            }

            const handleChecker = new HandleChecker(usersContext, organizationsContext);
            const usernameExists = await handleChecker.usernameOrHandleTaken(username);
            if (usernameExists) {
                await queryRunner.rollbackTransaction();
                return { action: 'USERNAME_ALREADY_IN_USE', message: "Username already in use"};
            }

            const user = await usersContext.createUser({
                firstName,
                lastName,
                username
            });

            await userServiceAgreementsContext.createUserServiceAgreement({
                userId: user.id,
                agreedToPrivacyPolicy: agreeToTOS,
                agreedToTos: agreeToTOS,
            });

            await userAuthCredentialsContext.attachUserToCredentials(credentials, user)
            const refreshedCredential = await userAuthCredentialsContext.getById(credentialId);
            if (!refreshedCredential) {
                throw new Error("credential missing")
            }
            for (const handler of this.createUserHandlers) {
                handler.onUserCreated(queryRunner, user, refreshedCredential);
            }
            await queryRunner.commitTransaction();
            return { action: 'USER_CREATED', credential: refreshedCredential as UserAuthCredential, user};
        } catch (e: any) {
            if (!queryRunner.isReleased) {
                await queryRunner?.rollbackTransaction?.();
            }
            return { action: 'LOG_ERROR', error: { type: 'UNKNOWN_ACCOUNT_CREATION_ERROR', message: e?.message, meta: e} };
        } finally {
            queryRunner.release();
        }
    }
}