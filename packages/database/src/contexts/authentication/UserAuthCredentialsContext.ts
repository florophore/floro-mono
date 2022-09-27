import { DeepPartial, In, QueryRunner, Repository } from "typeorm";
import { UserAuthCredential } from "../../entities/UserAuthCredential";
import BaseContext from "../BaseContext";
import GoogleAccessToken from '@floro/main-backend/src/thirdpartyclients/google/schemas/GoogleAccessToken';
import GoogleUser from '@floro/main-backend/src/thirdpartyclients/google/schemas/GoogleUser';
import GithubAccessToken from '@floro/main-backend/src/thirdpartyclients/github/schemas/GithubAccessToken';
import GithubUser from '@floro/main-backend/src/thirdpartyclients/github/schemas/GithubUser';
import GithubEmail from '@floro/main-backend/src/thirdpartyclients/github/schemas/GithubEmail';
import EmailHelper from "../utils/EmailHelper";
import UsersContext from "../users/UsersContext";
import ContextFactory from "../ContextFactory";
import { User } from "../../entities/User";

export default class UserAuthCredentialsContext extends BaseContext {
  private userAuthCredentialRepo!: Repository<UserAuthCredential>;
  private userContext!: UsersContext;

  public async init(
    queryRunner: QueryRunner,
    contextFactory: ContextFactory
  ): Promise<void> {
    await super.init(queryRunner, contextFactory);
    this.userAuthCredentialRepo =
      this.conn.datasource.getRepository(UserAuthCredential);
    this.userContext = await contextFactory.createContext(
      UsersContext,
      queryRunner
    );
  }

  public async createGithubCredential(
    githubAccessToken: GithubAccessToken,
    githubUser: GithubUser,
    githubEmail: GithubEmail,
    isSignupCredential = false,
    hasVerifiedCredential = false,
    user?: User|null
  ): Promise<UserAuthCredential> {
    const email = githubEmail.email as string;
    const isGoogleEmail = await EmailHelper.isGoogleEmail(email);
    const normalizedEmail = EmailHelper.getUniqueEmail(
      email,
      isGoogleEmail
    );
    const emailHash = EmailHelper.getEmailHash(email, isGoogleEmail);
    const userAuthCredentialEntity = this.userAuthCredentialRepo.create({
      credentialType: "github_oauth",
      accessToken: githubAccessToken.accessToken,
      email,
      normalizedEmail,
      emailHash,
      isSignupCredential,
      isVerified: hasVerifiedCredential || !!githubEmail.verified,
      isThirdPartyVerified: githubEmail.verified,
      hasThirdPartyTwoFactorEnabled: githubUser.twoFactorAuthentication,
      userId: user?.id,
      githubId: githubUser.id,
      githubLogin: githubUser.login,
      githubNodeId: githubUser.nodeId,
      githubName: githubUser.name,
      githubCompany: githubUser.company,
    });
    return await this.queryRunner.manager.save(
      UserAuthCredential,
      userAuthCredentialEntity
    );
  }

  public async createGoogleCredential(
    googleAccessToken: GoogleAccessToken,
    googleUser: GoogleUser,
    isSignupCredential = false,
    hasVerifiedCredential = false,
    user?: User
  ): Promise<UserAuthCredential> {
    const email = googleUser.email as string;
    const normalizedEmail = await EmailHelper.getUniqueEmail(email, true);
    const emailHash = EmailHelper.getEmailHash(email, true);
    const userAuthCredentialEntity = this.userAuthCredentialRepo.create({
      credentialType: "google_oauth",
      accessToken: googleAccessToken.accessToken,
      email,
      normalizedEmail,
      emailHash,
      isSignupCredential,
      isVerified: hasVerifiedCredential || !!googleUser.verifiedEmail,
      isThirdPartyVerified: googleUser.verifiedEmail,
      hasThirdPartyTwoFactorEnabled: false,
      userId: user?.id,
      googleId: googleUser.id,
      googleGivenName: googleUser.givenName,
      googleFamilyName: googleUser.familyName,
      googleLocale: googleUser.locale,
    });
    return await this.queryRunner.manager.save(
      UserAuthCredential,
      userAuthCredentialEntity
    );
  }

  public async createEmailCredential(
    email: string,
    user: User,
    isSignupCredential = false,
    hasVerifiedCredential = false
  ): Promise<UserAuthCredential> {
    const isGoogleEmail = await EmailHelper.isGoogleEmail(email);
    const normalizedEmail = EmailHelper.getUniqueEmail(
      email,
      isGoogleEmail
    );
    const emailHash = EmailHelper.getEmailHash(email, isGoogleEmail);
    const userAuthCredentialEntity = this.userAuthCredentialRepo.create({
      credentialType: "email_pass",
      email,
      normalizedEmail,
      emailHash,
      isSignupCredential,
      isVerified: hasVerifiedCredential,
      isThirdPartyVerified: false,
      userId: user?.id,
    });
    return await this.queryRunner.manager.save(
      UserAuthCredential,
      userAuthCredentialEntity
    );
  }

  public async getById(id: string): Promise<UserAuthCredential | null> {
    return await this.queryRunner.manager.findOneBy(UserAuthCredential, { id });
  }

  public async getCredentialsByEmail(
    email: string
  ): Promise<UserAuthCredential[]> {
    const isGoogleEmail = await EmailHelper.isGoogleEmail(email);
    const emailHash = EmailHelper.getEmailHash(email, isGoogleEmail);
    return await this.queryRunner.manager.find(UserAuthCredential, {
      where: { emailHash },
    });
  }

  public async updateUserAuthCredential(
    userAuthCredential: UserAuthCredential,
    userAuthCredentialArgs: DeepPartial<UserAuthCredential>
  ): Promise<UserAuthCredential> {
    return (
      (await this.updateUserAuthCredentialById(
        userAuthCredential.id,
        userAuthCredentialArgs
      )) ?? userAuthCredential
    );
  }

  public async updateUserAuthCredentialById(
    id: string,
    userAuthCredentialArgs: DeepPartial<UserAuthCredential>
  ): Promise<UserAuthCredential | null> {
    const userAuthCredential = await this.getById(id);
    if (userAuthCredential === null) {
      throw new Error("Invalid ID to update for UserAuthCredential.id: " + id);
    }
    for (const prop in userAuthCredentialArgs) {
      userAuthCredential[prop] = userAuthCredentialArgs[prop];
    }
    return await this.queryRunner.manager.save(
      UserAuthCredential,
      userAuthCredential
    );
  }

  public async getUserForEmail(email: string): Promise<User | null> {
    const credentials = await this.getCredentialsByEmail(email);
    const userId = this.getUserIdFromCredentials(credentials) as string;
    if (userId !== null) {
      return await this.userContext.getById(userId);
    }
    return null;
  }

  public async attachUserToCredentials(
    credentials: UserAuthCredential[],
    user: User
  ) {
    await this.queryBuilder<UserAuthCredential>()
      .update(UserAuthCredential)
      .set({ userId: user.id })
      .whereInIds(credentials?.map((credential) => credential.id))
      .execute();
    return await this.queryRunner.manager.find(UserAuthCredential, {
      where: { id: In(credentials?.map((credential) => credential.id)) },
    });
  }

  public hasVerifiedCredential(credentials: UserAuthCredential[]): boolean {
    for (const credential of credentials) {
      if (credential.isVerified) {
        return true;
      }
    }
    return false;
  }

  public hasSignupCredential(credentials: UserAuthCredential[]): boolean {
    for (const credential of credentials) {
      if (credential.isSignupCredential) {
        return true;
      }
    }
    return false;
  }

  public hasThirdPartyVerifiedCredential(
    credentials: UserAuthCredential[]
  ): boolean {
    for (const credential of credentials) {
      if (credential.isThirdPartyVerified) {
        return true;
      }
    }
    return false;
  }

  public getEmailCredential(
    credentials: UserAuthCredential[]
  ): UserAuthCredential | null {
    for (const credential of credentials) {
      if (credential.credentialType == "email_pass") {
        return credential;
      }
    }
    return null;
  }

  public getGoogleCredential(
    credentials: UserAuthCredential[]
  ): UserAuthCredential | null {
    for (const credential of credentials) {
      if (credential.credentialType == "google_oauth") {
        return credential;
      }
    }
    return null;
  }

  public getGithubCredential(
    credentials: UserAuthCredential[]
  ): UserAuthCredential | null {
    for (const credential of credentials) {
      if (credential.credentialType == "github_oauth") {
        return credential;
      }
    }
    return null;
  }

  public hasEmailCredential(credentials: UserAuthCredential[]): boolean {
    for (const credential of credentials) {
      if (credential.credentialType == "email_pass") {
        return true;
      }
    }
    return false;
  }

  public hasGoogleCredential(credentials: UserAuthCredential[]): boolean {
    for (const credential of credentials) {
      if (credential.credentialType == "google_oauth") {
        return true;
      }
    }
    return false;
  }

  public hasGithubCredential(credentials: UserAuthCredential[]): boolean {
    for (const credential of credentials) {
      if (credential.credentialType == "github_oauth") {
        return true;
      }
    }
    return false;
  }

  public hasAnyOAuthCredential(credentials: UserAuthCredential[]): boolean {
    return (
      this.hasGithubCredential(credentials) ||
      this.hasGoogleCredential(credentials)
    );
  }

  public hasOnlySingleOAuthCredential(
    credentials: UserAuthCredential[]
  ): boolean {
    //xor
    if (
      this.hasOnlyGithubCredential(credentials) &&
      !this.hasOnlyGoogleCredential(credentials)
    ) {
      return true;
    }
    if (
      !this.hasOnlyGithubCredential(credentials) &&
      this.hasOnlyGoogleCredential(credentials)
    ) {
      return true;
    }
    return false;
  }

  public hasOnlyEmailCredential(credentials: UserAuthCredential[]): boolean {
    return (
      this.hasEmailCredential(credentials) &&
      !this.hasAnyOAuthCredential(credentials)
    );
  }

  public hasOnlyOAuthCredentials(credentials: UserAuthCredential[]): boolean {
    return (
      !this.hasEmailCredential(credentials) &&
      this.hasAnyOAuthCredential(credentials)
    );
  }

  public hasOnlyGoogleCredential(credentials: UserAuthCredential[]): boolean {
    return credentials.length == 1 && this.hasGoogleCredential(credentials);
  }

  public hasOnlyGithubCredential(credentials: UserAuthCredential[]): boolean {
    return credentials.length == 1 && this.hasGithubCredential(credentials);
  }

  public canAddEmailAuth(credentials: UserAuthCredential[]): boolean {
    return this.hasOnlyOAuthCredentials(credentials);
  }

  public userCouldUpdateEmailAuth(credentials: UserAuthCredential[]): boolean {
    return this.hasOnlyEmailCredential(credentials);
  }

  public async userCanUpdateEmailAuthAddress(
    credentials: UserAuthCredential[],
    proposedEmailAddress: string
  ): Promise<boolean> {
    if (!this.hasOnlyEmailCredential(credentials)) {
      return false;
    }
    const credentialsForProposedAddress = await this.getCredentialsByEmail(
      proposedEmailAddress
    );
    return credentialsForProposedAddress?.length === 0;
  }

  public getUserIdFromCredentials(
    credentials: UserAuthCredential[]
  ): string | null {
    for (const credential of credentials) {
      if (credential.userId) {
        return credential.userId;
      }
    }
    return null;
  }
}