import { QueryRunner, Repository } from "typeorm";
import { UserAuthCredential } from "../../entities/UserAuthCredential";
import BaseContext from "../BaseContext";
import ContextFactory from "../ContextFactory";
import { User } from "../../entities/User";
import { UserEmailPassword } from "../../entities/UserEmailPassword";
import PasswordHelper from "../utils/PasswordHelper";

export default class UserEmailPasswordsContext extends BaseContext {
  private userEmailPasswordRepo!: Repository<UserEmailPassword>;

  public async init(
    queryRunner: QueryRunner,
    contextFactory: ContextFactory
  ): Promise<void> {
    await super.init(queryRunner, contextFactory);
    this.userEmailPasswordRepo =
      this.conn.datasource.getRepository(UserEmailPassword);
  }

  public async createEmailPassword(
    user: User,
    userAuthCredential: UserAuthCredential,
    password: string,
    currentEmailPassword?: UserEmailPassword
  ): Promise<UserEmailPassword> {
    const userEmailPassword = this.userEmailPasswordRepo.create({
      userId: user?.id,
      userAuthCredentialId: userAuthCredential?.id,
      password,
      lastHash: currentEmailPassword?.hash,
      isCurrent: true,
    });
    return await this.queryRunner.manager.save(
      UserEmailPassword,
      userEmailPassword
    );
  }

  public async findCurrentUserEmailPasswordByEmailAuthCredential(
    emailAuthCredential: UserAuthCredential
  ): Promise<UserEmailPassword | null> {
    return await this.queryRunner.manager.findOneBy(UserEmailPassword, {
      userAuthCredentialId: emailAuthCredential.id,
      isCurrent: true,
    });
  }

  public passwordMatches(
    userEmailPassword: UserEmailPassword,
    assertingPassword: string
  ): boolean {
    return PasswordHelper.compareHash(
      userEmailPassword.hash,
      userEmailPassword.userId,
      assertingPassword
    );
  }

  public async unsetCurrentEmailPasswords(
    emailAuthCredential: UserAuthCredential
  ): Promise<void> {
    await this.queryBuilder<UserEmailPassword>()
      .update(UserEmailPassword)
      .set({ isCurrent: false })
      .where({ userAuthCredentialId: emailAuthCredential.id })
      .execute();
  }

  public async canChangePassword(
    user: User,
    proposedPassword: string
  ): Promise<boolean> {
    const existingPasswordsWithSameHash = await this.queryRunner.manager.find(
      UserEmailPassword,
      {
        where: {
          userId: user.id,
          hash: PasswordHelper.hashPassword(user.id, proposedPassword),
        },
      }
    );
    return existingPasswordsWithSameHash?.length == 0;
  }
}
