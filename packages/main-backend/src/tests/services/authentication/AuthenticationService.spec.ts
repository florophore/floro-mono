import container from "../../../test_utils/testContainer";
import nock from "nock";
import { deserialize } from "@dhkatz/json-ts";
import { test } from "mocha";

import "../../../test_utils/setupTests";

import GoogleAccessToken from "@floro/main-backend/src/thirdpartyclients/google/schemas/GoogleAccessToken";
import GoogleUser from "@floro/main-backend/src/thirdpartyclients/google/schemas/GoogleUser";
import GithubAccessToken from "@floro/main-backend/src/thirdpartyclients/github/schemas/GithubAccessToken";
import GithubUser from "@floro/main-backend/src/thirdpartyclients/github/schemas/GithubUser";
import GithubEmail from "@floro/main-backend/src/thirdpartyclients/github/schemas/GithubEmail";

import { loadFixtures } from "@floro/database/src/test/test_utils/setupFixtures";

import { createRequire } from "module";
const require = createRequire(import.meta.url);

import AuthenticationService from "../../../services/authentication/AuthenticationService";
import { expect } from "chai";
import GithubAPIError from "../../../thirdpartyclients/github/schemas/GithubAPIError";
import { UserAuthCredential } from "@floro/database/src/entities/UserAuthCredential";
import { User } from "@floro/database/src/entities/User";
import GoogleAccessTokenError from "../../../thirdpartyclients/google/schemas/GoogleAccessTokenError";
import GoogleAPIError from "../../../thirdpartyclients/google/schemas/GoogleAPIError";

const GoogleUserSuccessMockJSON = require("../../thirdpartyclients/google/mocks/GoogleUserSuccessMock.json");
const GoogleUserSuccessMock = deserialize(
  GoogleUser,
  GoogleUserSuccessMockJSON
);
const GoogleAccessTokenSuccessMockJSON = require("../../thirdpartyclients/google/mocks/GoogleAccessTokenSuccessMock.json");
const GoogleAccessTokenMock = deserialize(
  GoogleAccessToken,
  GoogleAccessTokenSuccessMockJSON
);

const GoogleAccessTokenErrorMockJSON = require("../../thirdpartyclients/google/mocks/GoogleAccessTokenErrorMock.json");
const GoogleAccessTokenErrorMock = deserialize(
  GoogleAccessTokenError,
  GoogleAccessTokenErrorMockJSON
);

const GoogleApiErrorMockJSON = require("../../thirdpartyclients/google/mocks/GoogleAPIErrorMock.json");
const GoogleApiErrorMock = deserialize(GoogleAPIError, GoogleApiErrorMockJSON);

const GithubAccessTokenMock = deserialize(GithubAccessToken, {
  access_token: "abc",
  scope: "user",
  token_type: "bearer",
});

const GithubUserSuccessMockJSON = require("../../thirdpartyclients/github/mocks/GithubUserSuccessMock.json");
const GithubUserSuccessMock = deserialize(
  GithubUser,
  GithubUserSuccessMockJSON
);

const GithubApiErrorMockJSON = require("../../thirdpartyclients/github/mocks/GithubAPIErrorMock.json");
const GithubApiErrorMock = deserialize(GithubAPIError, GithubApiErrorMockJSON);

const GithubEmailsSuccessMockJSON = require("../../thirdpartyclients/github/mocks/GithubEmailsSuccessMock.json");
const GithubEmailsSuccessMock = deserialize(
  GithubEmail,
  GithubEmailsSuccessMockJSON
);

describe("AuthenticationService", () => {
  let authenticationService: AuthenticationService;

  beforeEach(async () => {
    authenticationService = container.get(AuthenticationService);
  });

  describe("authWithGoogleOAuth", () => {
    describe("when user has not created an account", () => {
      describe("when user has bad auth code", () => {
        test('return as LOG_ERROR with "Bad auth code" message', async () => {
          const scope = nock("https://oauth2.googleapis.com")
            .post("/token")
            .query(true)
            .reply(200, JSON.stringify(GoogleAccessTokenErrorMock));
          const result = await authenticationService.authWithGoogleOAuth("bad");
          expect(result.action).to.equal("LOG_ERROR");
          expect(result?.error?.type).to.equal("GOOGLE_OAUTH_ERROR");
          expect(result?.error?.message).to.equal("Bad auth code");
          scope.done();
        });
      });

      describe("has GoogleUser API user", () => {
        test('returns a LOG_ERROR with "Bad access token" message', async () => {
          const scope = nock("https://oauth2.googleapis.com")
            .post("/token")
            .query(true)
            .reply(200, JSON.stringify(GoogleAccessTokenSuccessMockJSON));
          const scopeUser = nock("https://www.googleapis.com")
            .matchHeader("Authorization", "Bearer google_access")
            .get("/oauth2/v2/userinfo")
            .reply(401, JSON.stringify(GoogleApiErrorMock));
          const result = await authenticationService.authWithGoogleOAuth(
            "good"
          );
          expect(result.action).to.equal("LOG_ERROR");
          expect(result?.error?.type).to.equal("GOOGLE_OAUTH_ERROR");
          expect(result?.error?.message).to.equal("Bad access token");
          scope.done();
          scopeUser.done();
        });
      });

      describe("when no credentials exist", () => {
        test("returns a COMPLETE_SIGNUP AuthResponse", async () => {
          const scope = nock("https://oauth2.googleapis.com")
            .post("/token")
            .query(true)
            .reply(200, JSON.stringify(GoogleAccessTokenSuccessMockJSON));
          const scopeUser = nock("https://www.googleapis.com")
            .matchHeader("Authorization", "Bearer google_access")
            .get("/oauth2/v2/userinfo")
            .reply(200, JSON.stringify(GoogleUserSuccessMock));
          const result = await authenticationService.authWithGoogleOAuth(
            "good"
          );
          expect(result.action).to.equal("COMPLETE_SIGNUP");
          scope.done();
          scopeUser.done();
        });
      });
    });

    describe("when user has existing email hash credential", () => {
      test("returns a LOGIN action", async () => {
        await loadFixtures<[User, UserAuthCredential]>([
          "User:user_0",
          "UserAuthCredential:email_pass_for_test@gmail",
        ]);
        const scope = nock("https://oauth2.googleapis.com")
          .post("/token")
          .query(true)
          .reply(200, JSON.stringify(GoogleAccessTokenSuccessMockJSON));
        const scopeUser = nock("https://www.googleapis.com")
          .matchHeader("Authorization", "Bearer google_access")
          .get("/oauth2/v2/userinfo")
          .reply(
            200,
            JSON.stringify({
              ...GoogleUserSuccessMock,
              email: "test@gmail.com",
            })
          );
        const result = await authenticationService.authWithGoogleOAuth("good");
        expect(result.action).to.equal("LOGIN");
        scope.done();
        scopeUser.done();
      });
    });
  });

  describe("authWithGithubOAuth", () => {
    describe("when user has not created an account", () => {
      describe("has AccessToken error", () => {
        test('returns a LOG_ERROR with "Bad auth code" message', async () => {
          const ERROR_STRING =
            "error=bad_verification_code&error_description=The+code+passed+is+incorrect+or+expired.&error_uri=https%3A%2F%2Fdocs.github.com%2Fapps%2Fmanaging-oauth-apps%2Ftroubleshooting-oauth-app-access-token-request-errors%2F%23bad-verification-code";
          const scope = nock("https://github.com")
            .filteringRequestBody(/code=[^&]*/g, "code=bad")
            .post("/login/oauth/access_token")
            .reply(200, ERROR_STRING);
          const result = await authenticationService.authWithGithubOAuth("bad");
          expect(result.action).to.equal("LOG_ERROR");
          expect(result?.error?.type).to.equal("GITHUB_OAUTH_ERROR");
          expect(result?.error?.message).to.equal("Bad auth code");
          scope.done();
        });
      });

      describe("has GithubUser API error", () => {
        test('returns a LOG_ERROR with "Bad access token" message', async () => {
          const SUCCESS_STRING =
            "access_token=bad_token&scope=user&token_type=bearer";
          const scope = nock("https://github.com")
            .filteringRequestBody(/code=[^&]*/g, "code=good")
            .post("/login/oauth/access_token")
            .reply(200, SUCCESS_STRING);
          const scopeUser = nock("https://api.github.com")
            .matchHeader("Authorization", "token bad_token")
            .get("/user")
            .reply(401, JSON.stringify(GithubApiErrorMock));
          const result = await authenticationService.authWithGithubOAuth(
            "good"
          );
          expect(result.action).to.equal("LOG_ERROR");
          expect(result?.error?.type).to.equal("GITHUB_OAUTH_ERROR");
          expect(result?.error?.message).to.equal("Bad access token");
          scope.done();
          scopeUser.done();
        });
      });

      describe("invalid primary email", () => {
        test('returns a LOG_ERROR with "No primary email" message', async () => {
          const SUCCESS_STRING =
            "access_token=good_token&scope=user&token_type=bearer";
          const scope = nock("https://github.com")
            .filteringRequestBody(/code=[^&]*/g, "code=good")
            .post("/login/oauth/access_token")
            .reply(200, SUCCESS_STRING);
          const scopeUser = nock("https://api.github.com")
            .matchHeader("Authorization", "token good_token")
            .get("/user")
            .reply(200, GithubUserSuccessMock);
          const scopeEmails = nock("https://api.github.com")
            .matchHeader("Authorization", "token good_token")
            .get("/user/emails")
            .reply(200, []);
          const result = await authenticationService.authWithGithubOAuth(
            "good"
          );
          expect(result.action).to.equal("LOG_ERROR");
          expect(result?.error?.type).to.equal("GITHUB_OAUTH_ERROR");
          expect(result?.error?.message).to.equal("No primary email");
          scope.done();
          scopeUser.done();
          scopeEmails.done();
        });
      });

      describe("when no credentials exist", () => {
        test("returns a COMPLETE_SIGNUP AuthResponse", async () => {
          const SUCCESS_STRING =
            "access_token=good_token&scope=user&token_type=bearer";
          const scope = nock("https://github.com")
            .filteringRequestBody(/code=[^&]*/g, "code=good")
            .post("/login/oauth/access_token")
            .reply(200, SUCCESS_STRING);
          const scopeUser = nock("https://api.github.com")
            .matchHeader("Authorization", "token good_token")
            .get("/user")
            .reply(200, GithubUserSuccessMock);
          const scopeEmails = nock("https://api.github.com")
            .matchHeader("Authorization", "token good_token")
            .get("/user/emails")
            .reply(200, GithubEmailsSuccessMock);
          const result = await authenticationService.authWithGithubOAuth(
            "good"
          );
          expect(result.action).to.equal("COMPLETE_SIGNUP");
          scope.done();
          scopeUser.done();
          scopeEmails.done();
        });
      });
    });

    describe("when user has existing email hash credential", () => {
      test("returns a LOGIN action", async () => {
        await loadFixtures<[User, UserAuthCredential]>([
          "User:user_0",
          "UserAuthCredential:email_pass_for_test@gmail",
        ]);
        const SUCCESS_STRING =
          "access_token=good_token&scope=user&token_type=bearer";
        const scope = nock("https://github.com")
          .filteringRequestBody(/code=[^&]*/g, "code=good")
          .post("/login/oauth/access_token")
          .reply(200, SUCCESS_STRING);
        const scopeUser = nock("https://api.github.com")
          .matchHeader("Authorization", "token good_token")
          .get("/user")
          .reply(200, GithubUserSuccessMock);
        const GithubEmailsTestAtGmailSuccessMock = [
          {
            ...GithubEmailsSuccessMock[0],
            email: "test@gmail.com",
          },
        ];
        const scopeEmails = nock("https://api.github.com")
          .matchHeader("Authorization", "token good_token")
          .get("/user/emails")
          .reply(200, GithubEmailsTestAtGmailSuccessMock);
        const result = await authenticationService.authWithGithubOAuth("good");
        expect(result.action).to.equal("LOGIN");
        scope.done();
        scopeUser.done();
        scopeEmails.done();
      });
    });
  });
});
