import DatabaseConnection from "@floro/database/src/connection/DatabaseConnection";
import ContextFactory from "@floro/database/src/contexts/ContextFactory";
import UsersContext from "@floro/database/src/contexts/users/UsersContext";
import UserAuthCredentialsContext from "@floro/database/src/contexts/authentication/UserAuthCredentialsContext";
import { injectable, inject } from "inversify";
import GithubLoginClient from "../../thirdpartyclients/github/GithubLoginClient";
import GithubAccessToken from "../../thirdpartyclients/github/schemas/GithubAccessToken";
import GithubEmail from "../../thirdpartyclients/github/schemas/GithubEmail";
import GithubUser from "../../thirdpartyclients/github/schemas/GithubUser";
import GoogleLoginClient from "../../thirdpartyclients/google/GoogleLoginClient";
import { User } from "@floro/database/src/entities/User";
import GoogleAccessToken from "../../thirdpartyclients/google/schemas/GoogleAccessToken";
import { UserAuthCredential } from "@floro/database/src/entities/UserAuthCredential";
import GoogleUser from "../../thirdpartyclients/google/schemas/GoogleUser";

export interface AuthReponse {
    action: 'COMPLETE_SIGNUP'|'LOG_ERROR'|'LOGIN';
    user?: User;
    credential?: UserAuthCredential;
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

    constructor(
        @inject(DatabaseConnection) databaseConnection: DatabaseConnection,
        @inject(ContextFactory) contextFactory: ContextFactory,
        @inject(GithubLoginClient) githubLoginClient: GithubLoginClient,
        @inject(GoogleLoginClient) googleLoginClient: GoogleLoginClient,
        ) {
        this.databaseConnection = databaseConnection;
        this.contextFactory = contextFactory;
        this.githubLoginClient = githubLoginClient;
        this.googleLoginClient = googleLoginClient;
    }

    public async authWithGithubOAuth(code: string): Promise<AuthReponse> {
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

            const usersContext = await this.contextFactory.createContext(UsersContext, queryRunner);
            const userAuthCredentialsContext = await this.contextFactory.createContext(UserAuthCredentialsContext, queryRunner);
            await queryRunner.startTransaction();
            const credentials = await userAuthCredentialsContext.getCredentialsByEmail(primaryEmail.email);
            const userId =  userAuthCredentialsContext.getUserIdFromCredentials(credentials);
            if (!userId) {
                if (!userAuthCredentialsContext.hasGithubCredential(credentials)) {
                    const credential = await userAuthCredentialsContext.createGithubCredential(
                        githubAccessToken,
                        githubUser,
                        primaryEmail,
                        credentials.length == 0, // isSignupCredential
                        userAuthCredentialsContext.hasVerifiedCredential(credentials)
                    )
                    await queryRunner.commitTransaction();
                    return { action: 'COMPLETE_SIGNUP', credential };
                }
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
                    userAuthCredentialsContext.hasVerifiedCredential(credentials),
                    user
                );
            }
            await userAuthCredentialsContext.attachUserToCredentials(credentials, user)
            const credential = userAuthCredentialsContext.getGithubCredential(
                await userAuthCredentialsContext.getCredentialsByEmail(primaryEmail.email) 
            );
            if (credential) {
                await queryRunner.commitTransaction();
                return { action: 'LOGIN', user, credential };
            } else {
                await queryRunner.rollbackTransaction();
                return { action: 'LOG_ERROR', error: { type: 'MALFORMED_CREDENTIAL', message: 'Github credential not created'} };
            }
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
            const usersContext = await this.contextFactory.createContext(UsersContext, queryRunner);
            const userAuthCredentialsContext = await this.contextFactory.createContext(UserAuthCredentialsContext, queryRunner);
            await queryRunner.startTransaction();
            const credentials = await userAuthCredentialsContext.getCredentialsByEmail(googleUser.email);
            const userId =  userAuthCredentialsContext.getUserIdFromCredentials(credentials);
            if (!userId) {
                if (!userAuthCredentialsContext.hasGoogleCredential(credentials)) {
                    const credential = await userAuthCredentialsContext.createGoogleCredential(
                        googleAccessToken,
                        googleUser,
                        credentials.length == 0, // isSignupCredential
                        userAuthCredentialsContext.hasVerifiedCredential(credentials)
                    )
                    await queryRunner.commitTransaction();
                    return { action: 'COMPLETE_SIGNUP', credential };
                }
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
            } else {
                await queryRunner.rollbackTransaction();
                return { action: 'LOG_ERROR', error: { type: 'MALFORMED_CREDENTIAL', message: 'Google credential not created'} };
            }

        } catch (e: any) {
            if (!queryRunner.isReleased) {
                await queryRunner?.rollbackTransaction?.();
            }
            return { action: 'LOG_ERROR', error: { type: 'UNKNOWN_GOOGLE_LOGIN_ERROR', message: e?.message, meta: e} };
        } finally {
            queryRunner.release();
        }
    }
}