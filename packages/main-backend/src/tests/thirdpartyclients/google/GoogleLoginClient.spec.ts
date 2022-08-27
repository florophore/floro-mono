import container from '../../../test_utils/testContainer';
import nock from 'nock';
import { expect } from 'chai'
import { createRequire } from "module";
import GoogleLoginClient from '../../../thirdpartyclients/google/GoogleLoginClient';
import GoogleAccessToken from '../../../thirdpartyclients/google/schemas/GoogleAccessToken';
import GoogleAccessTokenError from '../../../thirdpartyclients/google/schemas/GoogleAccessTokenError';
import GoogleUser from '../../../thirdpartyclients/google/schemas/GoogleUser';
import GoogleAPIError, { GoogleError } from '../../../thirdpartyclients/google/schemas/GoogleAPIError';

const require = createRequire(import.meta.url);

const GoogleUserSuccessMock = require('./mocks/GoogleUserSuccessMock.json');
const GoogleAccessTokenSuccessMock = require('./mocks/GoogleAccessTokenSuccessMock.json');
const GoogleAPIErrorMock = require('./mocks/GoogleAPIErrorMock.json');
const GoogleAccessTokenErrorMock = require('./mocks/GoogleAccessTokenErrorMock.json');

describe('GoogleLoginClient', () => {
    let googleLoginClient: GoogleLoginClient;

    before(() => {
        googleLoginClient = container.get(GoogleLoginClient);
    });

    describe('getAccessToken', () => {

        it('returns access token when api succeeds', async () => {
            const scope = nock("https://oauth2.googleapis.com")
              .filteringRequestBody(/code=[^&]*/g, 'code=good')
              .post("/token")
              .reply(200, JSON.stringify(GoogleAccessTokenSuccessMock));
            const response = await googleLoginClient.getAccessToken("good") as GoogleAccessToken;
            expect(response).to.be.instanceOf(GoogleAccessToken);
            scope.done();
        })

        it('returns access token error when api returns error', async () => {
            const scope = nock("https://oauth2.googleapis.com")
              .filteringRequestBody(/code=[^&]*/g, 'code=bad')
              .post("/token")
              .reply(400, JSON.stringify(GoogleAccessTokenErrorMock));
            const response = await googleLoginClient.getAccessToken("bad") as GoogleAccessTokenError;
            expect(response).to.be.instanceOf(GoogleAccessTokenError);
            scope.done();
        });

        it('throws if none 200 response', async () => {
            const scope = nock("https://oauth2.googleapis.com")
              .filteringRequestBody(/code=[^&]*/g, 'code=foobar')
              .post("/token")
              .reply(500);
            const response = await googleLoginClient.getAccessToken("foobar");
            expect(response).to.be.instanceOf(Error);
            scope.done();
        });
    });

    describe('getGoogleUser', () => {

        it('returns the github user if access token is ok', async () => {
            const scope = nock("https://www.googleapis.com")
              .matchHeader("Authorization", "Bearer good")
              .get("/oauth2/v2/userinfo")
              .reply(200, JSON.stringify(GoogleUserSuccessMock));
            const response = (await googleLoginClient.getGoogleUser(
              "good"
            )) as GoogleUser;
            expect(response).to.be.instanceOf(GoogleUser);
            scope.done();
        });

        it('returns a GoogleAPIError if access token is bad', async () => {
            const scope = nock("https://www.googleapis.com")
              .matchHeader("Authorization", "Bearer bad")
              .get("/oauth2/v2/userinfo")
              .reply(401, JSON.stringify(GoogleAPIErrorMock));
            const response = await googleLoginClient.getGoogleUser("bad") as GoogleAPIError;
            expect(response).to.be.instanceOf(GoogleAPIError);
            expect(response.error).to.be.instanceOf(GoogleError);
            scope.done();
        });

        it('throws if response is bad', async () => {
            const scope = nock("https://www.googleapis.com")
              .matchHeader("Authorization", "Bearer foobar")
              .get("/oauth2/v2/userinfo")
              .reply(500);
            const response = (await googleLoginClient.getGoogleUser(
              "foobar"
            )) as Error;
            expect(response).to.be.instanceOf(Error);
            scope.done();
        });
    });
});