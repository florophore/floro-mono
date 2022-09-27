import { QueryRunner } from "typeorm";
import { expect } from "chai";
import { test } from "mocha";

import "../../test_utils/setGlobals";
import container from "../../test_utils/testContainer";
import { loadFixtures } from "../../test_utils/setupFixtures";

import ContextFactory from "../../../contexts/ContextFactory";
import { UserAuthCredential } from "../../../entities/UserAuthCredential";
import DatabaseConnection from "../../../connection/DatabaseConnection";

import { User } from "../../../entities/User";
import UserEmailPasswordsContext from "../../../contexts/authentication/UserEmailPasswordsContext";
import { UserEmailPassword } from "../../../entities/UserEmailPassword";

describe("UserEmailPasswordsContext", () => {
  let userEmailPasswordsContext: UserEmailPasswordsContext;
  let queryRunner: QueryRunner;

  beforeEach(async () => {
    const contextFactory = container.get(ContextFactory);
    const databaseConnection = container.get(DatabaseConnection);
    queryRunner = await databaseConnection.makeQueryRunner();
    userEmailPasswordsContext = await contextFactory.createContext(
      UserEmailPasswordsContext,
      queryRunner
    );
  });

  afterEach(async () => {
    await queryRunner.release();
  });

  describe("createEmailPassword", () => {
    test("creates a new password when no prior password is passed", async () => {
      const [user, userAuthCredential] = await loadFixtures<
        [User, UserAuthCredential]
      >(["User:user_0", "UserAuthCredential:email_pass_for_test@gmail"]);
      const result = await userEmailPasswordsContext.createEmailPassword(
        user,
        userAuthCredential,
        "testPass123&"
      );
      expect(result.isCurrent).to.be.true;
    });
  });

  describe("findCurrentUserEmailPasswordByEmailAuthCredential", () => {
    test("returns associated current user email pass", async () => {
      const [user, userAuthCredential, userEmailPassword] = await loadFixtures<
        [User, UserAuthCredential, UserEmailPassword]
      >([
        "User:user_0",
        "UserAuthCredential:email_pass_for_test@gmail",
        "UserEmailPassword:user_email_password_0",
      ]);
      const result =
        await userEmailPasswordsContext.findCurrentUserEmailPasswordByEmailAuthCredential(
          userAuthCredential
        );
      expect(result?.id).to.equal(userEmailPassword.id);
      expect(result?.userId).to.equal(user.id);
      expect(result?.userAuthCredentialId).to.equal(userAuthCredential.id);
    });
  });

  describe("passwordMatches", () => {
    test("returns true when matches", async () => {
      const [, , userEmailPassword] = await loadFixtures<
        [User, UserAuthCredential, UserEmailPassword]
      >([
        "User:user_0",
        "UserAuthCredential:email_pass_for_test@gmail",
        "UserEmailPassword:user_email_password_0",
      ]);
      const result = userEmailPasswordsContext.passwordMatches(
        userEmailPassword,
        "testPass123&"
      );
      expect(result).to.be.true;
    });

    test("returns false when wrong password", async () => {
      const [, , userEmailPassword] = await loadFixtures<
        [User, UserAuthCredential, UserEmailPassword]
      >([
        "User:user_0",
        "UserAuthCredential:email_pass_for_test@gmail",
        "UserEmailPassword:user_email_password_0",
      ]);
      const result = userEmailPasswordsContext.passwordMatches(
        userEmailPassword,
        "wrongpassword"
      );
      expect(result).to.be.false;
    });
  });

  describe("unsetCurrentEmailPasswords", () => {
    test("unsets current password", async () => {
      const [, userAuthCredential, userEmailPassword] = await loadFixtures<
        [User, UserAuthCredential, UserEmailPassword]
      >([
        "User:user_0",
        "UserAuthCredential:email_pass_for_test@gmail",
        "UserEmailPassword:user_email_password_0",
      ]);
      await userEmailPasswordsContext.unsetCurrentEmailPasswords(
        userAuthCredential
      );
      const result =
        await userEmailPasswordsContext.findCurrentUserEmailPasswordByEmailAuthCredential(
          userAuthCredential
        );

      expect(userEmailPassword.isCurrent).to.be.true;
      expect(result).to.be.null;
    });
  });

  describe("canChangePassword", () => {
    test("returns true when no past passwords matches proposed", async () => {
      const [user] = await loadFixtures<
        [User, UserAuthCredential, UserEmailPassword]
      >([
        "User:user_0",
        "UserAuthCredential:email_pass_for_test@gmail",
        "UserEmailPassword:user_email_password_0",
      ]);
      const result = await userEmailPasswordsContext.canChangePassword(
        user,
        "newUntakenPassword!2"
      );

      expect(result).to.be.true;
    });

    test("returns false when a past passwords matches proposed", async () => {
      const [user] = await loadFixtures<
        [User, UserAuthCredential, UserEmailPassword]
      >([
        "User:user_0",
        "UserAuthCredential:email_pass_for_test@gmail",
        "UserEmailPassword:user_email_password_0",
      ]);
      const result = await userEmailPasswordsContext.canChangePassword(
        user,
        "testPass123&"
      );

      expect(result).to.be.false;
    });
  });
});
