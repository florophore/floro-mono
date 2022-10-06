import { QueryRunner } from "typeorm";
import { expect } from "chai";
import { test } from "mocha";
import { deserialize } from "@dhkatz/json-ts";

import "../../test_utils/setGlobals";
import container from "../../test_utils/testContainer";
import { loadFixtures } from "../../test_utils/setupFixtures";

import ContextFactory from "../../../contexts/ContextFactory";
import UserAuthCredentialsContext from "../../../contexts/authentication/UserAuthCredentialsContext";
import { UserAuthCredential } from "../../../entities/UserAuthCredential";
import DatabaseConnection from "../../../connection/DatabaseConnection";

import GoogleAccessToken from "@floro/third-party-services/src/google/schemas/GoogleAccessToken";
import GoogleUser from "@floro/third-party-services/src/google/schemas/GoogleUser";
import GithubAccessToken from "@floro/third-party-services/src/github/schemas/GithubAccessToken";
import GithubUser from "@floro/third-party-services/src/github/schemas/GithubUser";
import GithubEmail from "@floro/third-party-services/src/github/schemas/GithubEmail";

import { createRequire } from "module";
import { User } from "../../../entities/User";
const require = createRequire(import.meta.url);

const GoogleUserSuccessMockJSON = require("../../../../../third-party-services/src/tests/google/mocks/GoogleUserSuccessMock.json");
const GoogleUserSuccessMock = deserialize(
  GoogleUser,
  GoogleUserSuccessMockJSON
);
const GoogleAccessTokenSuccessMockJSON = require("../../../../../third-party-services/src/tests/google/mocks/GoogleAccessTokenSuccessMock.json");
const GoogleAccessTokenMock = deserialize(
  GoogleAccessToken,
  GoogleAccessTokenSuccessMockJSON
);

const GithubAccessTokenMock = deserialize(GithubAccessToken, {
  access_token: "abc",
  scope: "user",
  token_type: "bearer",
});

const GithubUserSuccessMockJSON = require("../../../../../third-party-services/src/tests/github/mocks/GithubUserSuccessMock.json");
const GithubUserSuccessMock = deserialize(
  GithubUser,
  GithubUserSuccessMockJSON
);
const GithubEmailsSuccessMockJSON = require("../../../../../third-party-services/src/tests/github/mocks/GithubEmailsSuccessMock.json");
const GithubEmailsSuccessMock = deserialize(
  GithubEmail,
  GithubEmailsSuccessMockJSON
);

describe("UserAuthCredentialsContext", () => {
  let userAuthCredentialsContext: UserAuthCredentialsContext;
  let queryRunner: QueryRunner;

  beforeEach(async () => {
    const contextFactory = container.get(ContextFactory);
    const databaseConnection = container.get(DatabaseConnection);
    queryRunner = await databaseConnection.makeQueryRunner();
    userAuthCredentialsContext = await contextFactory.createContext(
      UserAuthCredentialsContext,
      queryRunner
    );
  });

  afterEach(async () => {
    await queryRunner.release();
  });

  describe("createGithubCredential", () => {
    describe("when no user exists", () => {
      test("it creates a userless github credential", async () => {
        const result = await userAuthCredentialsContext.createGithubCredential(
          GithubAccessTokenMock,
          GithubUserSuccessMock,
          GithubEmailsSuccessMock[0]
        );
        expect(result.credentialType).to.equal("github_oauth");
        expect(result.userId).to.be.undefined;
      });
    });

    describe("when user exists", () => {
      test("it creates a github credential associated to user", async () => {
        const [user] = await loadFixtures<[User]>(["User:user_0"]);
        const result = await userAuthCredentialsContext.createGithubCredential(
          GithubAccessTokenMock,
          GithubUserSuccessMock,
          GithubEmailsSuccessMock[0],
          false,
          false,
          user
        );
        expect(result.credentialType).to.equal("github_oauth");
        expect(result.userId).to.equal(user.id);
      });
    });
  });

  describe("createGoogleCredential", () => {
    describe("when no user exists", () => {
      test("it creates a userless google credential", async () => {
        const result = await userAuthCredentialsContext.createGoogleCredential(
          GoogleAccessTokenMock,
          GoogleUserSuccessMock
        );
        expect(result.credentialType).to.equal("google_oauth");
        expect(result.userId).to.be.undefined;
      });
    });

    describe("when user exists", () => {
      test("it creates a google credential associated to user", async () => {
        const [user] = await loadFixtures<[User]>(["User:user_0"]);
        const result = await userAuthCredentialsContext.createGoogleCredential(
          GoogleAccessTokenMock,
          GoogleUserSuccessMock,
          false,
          false,
          user
        );
        expect(result.credentialType).to.equal("google_oauth");
        expect(result.userId).to.equal(user.id);
      });
    });
  });

  describe("createEmailCredential", () => {
    test("it creates an email pass credential associated to user", async () => {
      const [user] = await loadFixtures<[User]>(["User:user_0"]);
      const result = await userAuthCredentialsContext.createEmailCredential(
        "foo.bar@gmail.com",
        user
      );
      expect(result.credentialType).to.equal("email_pass");
      expect(result.userId).to.equal(user.id);
    });
  });

  describe("getById", () => {
    test("fetches UserAuthCredential", async () => {
      const [userAuthCredential] = await loadFixtures<[UserAuthCredential]>([
        "UserAuthCredential:userless_google_oauth_for_test@gmail",
      ]);
      const result = await userAuthCredentialsContext.getById(
        userAuthCredential.id
      );
      expect(result?.id).to.eql(userAuthCredential.id);
    });
  });

  describe("getCredentialsByEmail", () => {
    test("fetches UserAuthCredential", async () => {
      const [userAuthCredential] = await loadFixtures<[UserAuthCredential]>([
        "UserAuthCredential:userless_google_oauth_for_test@gmail",
      ]);
      const [result] = await userAuthCredentialsContext.getCredentialsByEmail(
        userAuthCredential.email
      );
      expect(result?.id).to.eql(userAuthCredential.id);
    });
  });

  describe("updateUserAuthCredential", () => {
    test("updates auth credential", async () => {
      const [userAuthCredential] = await loadFixtures<[UserAuthCredential]>([
        "UserAuthCredential:userless_google_oauth_for_test@gmail",
      ]);
      const result = await userAuthCredentialsContext.updateUserAuthCredential(
        userAuthCredential,
        {
          isVerified: true,
        }
      );
      expect(userAuthCredential?.isVerified).to.be.false;
      expect(result?.isVerified).to.be.true;
    });
  });

  describe("updateUserAuthCredentialById", () => {
    test("updates auth credential", async () => {
      const [userAuthCredential] = await loadFixtures<[UserAuthCredential]>([
        "UserAuthCredential:userless_google_oauth_for_test@gmail",
      ]);
      const result =
        await userAuthCredentialsContext.updateUserAuthCredentialById(
          userAuthCredential?.id,
          {
            isVerified: true,
          }
        );
      expect(userAuthCredential?.isVerified).to.be.false;
      expect(result?.isVerified).to.be.true;
    });
  });

  describe("attachUserToCredentials", () => {
    test("updates auth credential", async () => {
      const [user] =
        await loadFixtures<[User]>([
          "User:user_0",
        ]);
      const [googleUserAuthCredential, githubUserAuthCredential] =
        await loadFixtures<[UserAuthCredential, UserAuthCredential]>([
          "UserAuthCredential:userless_google_oauth_for_test@gmail",
          "UserAuthCredential:userless_github_oauth_for_test@gmail",
        ]);
      const result = await userAuthCredentialsContext.attachUserToCredentials(
        [googleUserAuthCredential, githubUserAuthCredential],
        user
      );
      expect(result[0].userId).to.equal(result[1].userId);
    });
  });

  describe("hasVerifiedCredential", () => {
    test("returns false if no credentials are verified", async () => {
      const [googleUserAuthCredential, githubUserAuthCredential] =
        await loadFixtures<[UserAuthCredential, UserAuthCredential]>([
          "UserAuthCredential:userless_google_oauth_for_test@gmail",
          "UserAuthCredential:userless_github_oauth_for_test@gmail",
        ]);
      const result = userAuthCredentialsContext.hasVerifiedCredential([
        googleUserAuthCredential,
        githubUserAuthCredential,
      ]);
      expect(result).to.be.false;
    });

    test("returns true if a credential is verified", async () => {
      const [googleUserAuthCredential, githubUserAuthCredential] =
        await loadFixtures<[UserAuthCredential, UserAuthCredential]>([
          "UserAuthCredential:userless_google_oauth_for_test@gmail",
          "UserAuthCredential:userless_github_oauth_for_test@gmail",
        ]);
      googleUserAuthCredential.isVerified = true;
      const result = userAuthCredentialsContext.hasVerifiedCredential([
        googleUserAuthCredential,
        githubUserAuthCredential,
      ]);
      expect(result).to.be.true;
    });
  });

  describe("hasSignupCredential", () => {
    test("returns false if no credentials are signup credentials", async () => {
      const [googleUserAuthCredential, githubUserAuthCredential] =
        await loadFixtures<[UserAuthCredential, UserAuthCredential]>([
          "UserAuthCredential:userless_google_oauth_for_test@gmail",
          "UserAuthCredential:userless_github_oauth_for_test@gmail",
        ]);
      const result = userAuthCredentialsContext.hasSignupCredential([
        googleUserAuthCredential,
        githubUserAuthCredential,
      ]);
      expect(result).to.be.false;
    });

    test("returns true if a credential is a signup credential", async () => {
      const [googleUserAuthCredential, githubUserAuthCredential] =
        await loadFixtures<[UserAuthCredential, UserAuthCredential]>([
          "UserAuthCredential:userless_google_oauth_for_test@gmail",
          "UserAuthCredential:userless_github_oauth_for_test@gmail",
        ]);
      googleUserAuthCredential.isSignupCredential = true;
      const result = userAuthCredentialsContext.hasSignupCredential([
        googleUserAuthCredential,
        githubUserAuthCredential,
      ]);
      expect(result).to.be.true;
    });
  });

  describe("hasThirdPartyVerifiedCredential", () => {
    test("returns false if no credentials are third party verified", async () => {
      const [googleUserAuthCredential, githubUserAuthCredential] =
        await loadFixtures<[UserAuthCredential, UserAuthCredential]>([
          "UserAuthCredential:userless_google_oauth_for_test@gmail",
          "UserAuthCredential:userless_github_oauth_for_test@gmail",
        ]);
      const result = userAuthCredentialsContext.hasThirdPartyVerifiedCredential(
        [googleUserAuthCredential, githubUserAuthCredential]
      );
      expect(result).to.be.false;
    });

    test("returns true if a credential is a signup credential", async () => {
      const [googleUserAuthCredential, githubUserAuthCredential] =
        await loadFixtures<[UserAuthCredential, UserAuthCredential]>([
          "UserAuthCredential:userless_google_oauth_for_test@gmail",
          "UserAuthCredential:userless_github_oauth_for_test@gmail",
        ]);
      googleUserAuthCredential.isThirdPartyVerified = true;
      const result = userAuthCredentialsContext.hasThirdPartyVerifiedCredential(
        [googleUserAuthCredential, githubUserAuthCredential]
      );
      expect(result).to.be.true;
    });
  });

  describe("hasEmailCredential", () => {
    test("returns false if no credentials are email_pass", async () => {
      const [googleUserAuthCredential, githubUserAuthCredential] =
        await loadFixtures<[UserAuthCredential, UserAuthCredential]>([
          "UserAuthCredential:userless_google_oauth_for_test@gmail",
          "UserAuthCredential:userless_github_oauth_for_test@gmail",
        ]);
      const result = userAuthCredentialsContext.hasEmailCredential([
        googleUserAuthCredential,
        githubUserAuthCredential,
      ]);
      expect(result).to.be.false;
    });

    test("returns true if an email_pass credential is present", async () => {
      const [
        googleUserAuthCredential,
        githubUserAuthCredential,
        ,
        emailPassUser,
      ] = await loadFixtures<
        [UserAuthCredential, UserAuthCredential, User, UserAuthCredential]
      >([
        "UserAuthCredential:userless_google_oauth_for_test@gmail",
        "UserAuthCredential:userless_github_oauth_for_test@gmail",
        "User:user_0",
        "UserAuthCredential:email_pass_for_test@gmail",
      ]);
      const result = userAuthCredentialsContext.hasEmailCredential([
        googleUserAuthCredential,
        githubUserAuthCredential,
        emailPassUser,
      ]);
      expect(result).to.be.true;
    });
  });

  describe("hasGoogleCredential", () => {
    test("returns false if no credentials are google_oauth", async () => {
      const [githubUserAuthCredential, , emailPassUser] = await loadFixtures<
        [UserAuthCredential, User, UserAuthCredential]
      >([
        "UserAuthCredential:userless_github_oauth_for_test@gmail",
        "User:user_0",
        "UserAuthCredential:email_pass_for_test@gmail",
      ]);
      const result = userAuthCredentialsContext.hasGoogleCredential([
        githubUserAuthCredential,
        emailPassUser,
      ]);
      expect(result).to.be.false;
    });

    test("returns true if google credential is present", async () => {
      const [
        googleUserAuthCredential,
        githubUserAuthCredential,
        ,
        emailPassUser,
      ] = await loadFixtures<
        [UserAuthCredential, UserAuthCredential, User, UserAuthCredential]
      >([
        "UserAuthCredential:userless_google_oauth_for_test@gmail",
        "UserAuthCredential:userless_github_oauth_for_test@gmail",
        "User:user_0",
        "UserAuthCredential:email_pass_for_test@gmail",
      ]);
      const result = userAuthCredentialsContext.hasGoogleCredential([
        googleUserAuthCredential,
        githubUserAuthCredential,
        emailPassUser,
      ]);
      expect(result).to.be.true;
    });
  });

  describe("hasGithubCredential", () => {
    test("returns false if no credentials are github_oauth", async () => {
      const [googleUserAuthCredential, , emailPassUser] = await loadFixtures<
        [UserAuthCredential, User, UserAuthCredential]
      >([
        "UserAuthCredential:userless_google_oauth_for_test@gmail",
        "User:user_0",
        "UserAuthCredential:email_pass_for_test@gmail",
      ]);
      const result = userAuthCredentialsContext.hasGithubCredential([
        googleUserAuthCredential,
        emailPassUser,
      ]);
      expect(result).to.be.false;
    });

    test("returns true if github credential is present", async () => {
      const [
        googleUserAuthCredential,
        githubUserAuthCredential,
        ,
        emailPassUser,
      ] = await loadFixtures<
        [UserAuthCredential, UserAuthCredential, User, UserAuthCredential]
      >([
        "UserAuthCredential:userless_google_oauth_for_test@gmail",
        "UserAuthCredential:userless_github_oauth_for_test@gmail",
        "User:user_0",
        "UserAuthCredential:email_pass_for_test@gmail",
      ]);
      const result = userAuthCredentialsContext.hasGithubCredential([
        googleUserAuthCredential,
        githubUserAuthCredential,
        emailPassUser,
      ]);
      expect(result).to.be.true;
    });
  });
});
