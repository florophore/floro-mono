import container from '../../../test_utils/testContainer';
import GithubLoginClient from '../../../thirdpartyclients/github/GithubLoginClient';
import nock from 'nock';
import { expect } from 'chai'
import GithubAccessToken from '../../../thirdpartyclients/github/schemas/GithubAccessToken';
import GithubAccessTokenError from '../../../thirdpartyclients/github/schemas/GithubAccessTokenError';
import GithubUser from '../../../thirdpartyclients/github/schemas/GithubUser';
import GithubPlan from '../../../thirdpartyclients/github/schemas/GithubPlan';
import GithubAPIError from '../../../thirdpartyclients/github/schemas/GithubAPIError';
import GithubEmail from '../../../thirdpartyclients/github/schemas/GithubEmail';
import { createRequire } from "module";

const require = createRequire(import.meta.url);

const GithubUserSuccessMock = require('./mocks/GithubUserSuccessMock.json');
const GithubEmailsSuccessMock = require('./mocks/GithubEmailsSuccessMock.json');
const GithubApiErrorMock = require('./mocks/GithubAPIErrorMock.json');

describe('GithubLoginClient', () => {
    let githubLoginClient: GithubLoginClient;

    before(() => {
        githubLoginClient = container.get(GithubLoginClient);
    });

    describe('getAccessToken', () => {

        it('returns access token when api succeeds', async () => {
            const SUCCESS_STRING = "access_token=good_token&scope=user&token_type=bearer";
            const scope = nock("https://github.com")
              .filteringRequestBody(/code=[^&]*/g, 'code=good')
              .post("/login/oauth/access_token")
              .reply(200, SUCCESS_STRING);
            const response = await githubLoginClient.getAccessToken("good") as GithubAccessToken;
            expect(response).to.be.instanceOf(GithubAccessToken);
            scope.done();
        })

        it('returns access token error when api returns error', async () => {
            const ERROR_STRING = "error=bad_verification_code&error_description=The+code+passed+is+incorrect+or+expired.&error_uri=https%3A%2F%2Fdocs.github.com%2Fapps%2Fmanaging-oauth-apps%2Ftroubleshooting-oauth-app-access-token-request-errors%2F%23bad-verification-code";
            const scope = nock("https://github.com")
              .filteringRequestBody(/code=[^&]*/g, 'code=bad')
              .post("/login/oauth/access_token")
              .reply(200, ERROR_STRING);
            const response = await githubLoginClient.getAccessToken("bad") as GithubAccessTokenError;
            expect(response).to.be.instanceOf(GithubAccessTokenError);
            scope.done();
        });

        it('throws if none 200 response', async () => {
            const scope = nock("https://github.com")
              .filteringRequestBody(/code=[^&]*/g, 'code=foobar')
              .post("/login/oauth/access_token")
              .reply(500);
            const response = await githubLoginClient.getAccessToken("foobar");
            expect(response).to.be.instanceOf(Error);
            scope.done();
        });
    });

    describe('getGithubUser', () => {

        it('returns the github user if access token is ok', async () => {
            const scope = nock("https://api.github.com")
              .matchHeader("Authorization", "token good")
              .get("/user")
              .reply(200, JSON.stringify(GithubUserSuccessMock));
            const response = (await githubLoginClient.getGithubUser(
              "good"
            )) as GithubUser;
            expect(response).to.be.instanceOf(GithubUser);
            expect(response?.plan).to.be.instanceOf(GithubPlan);
            scope.done();
        });

        it('returns a GithubApiError if access token is bad', async () => {
            const scope = nock("https://api.github.com")
              .matchHeader("Authorization", "token bad")
              .get("/user")
              .reply(401, JSON.stringify(GithubApiErrorMock));
            const response = await githubLoginClient.getGithubUser("bad") as GithubAPIError;
            expect(response).to.be.instanceOf(GithubAPIError);
            scope.done();
        });

        it('throws if response is bad', async () => {
            const scope = nock("https://api.github.com")
              .matchHeader("Authorization", "token foobar")
              .get("/user")
              .reply(500);
            const response = (await githubLoginClient.getGithubUser(
              "foobar"
            )) as Error;
            expect(response).to.be.instanceOf(Error);
            scope.done();
        });
    });

    describe('getGithubUserEmails', () => {

        it('returns a list of github user emails if access token is ok', async () => {
            const scope = nock("https://api.github.com")
              .matchHeader("Authorization", "token good")
              .get("/user/emails")
              .reply(200, JSON.stringify(GithubEmailsSuccessMock));
            const response = await githubLoginClient.getGithubUserEmails("good") as GithubEmail[];
            for (let email of response) {
                expect(email).to.be.instanceOf(GithubEmail);
            }
            scope.done();
        });

        it('returns a GithubAPIError if access token is bad', async () => {
            const scope = nock("https://api.github.com")
              .matchHeader("Authorization", "token bad")
              .get("/user/emails")
              .reply(401, JSON.stringify(GithubApiErrorMock));
            const response = (await githubLoginClient.getGithubUserEmails(
              "bad"
            )) as GithubAPIError;
            expect(response).to.be.instanceOf(GithubAPIError);
            scope.done();
        });

        it('throws if response is bad', async () => {
            const scope = nock("https://api.github.com")
              .matchHeader("Authorization", "token foobar")
              .get("/user/emails")
              .reply(500);
            const response = (await githubLoginClient.getGithubUserEmails(
              "foobar"
            )) as Error;
            expect(response).to.be.instanceOf(Error);
            scope.done();
        });
    });
});