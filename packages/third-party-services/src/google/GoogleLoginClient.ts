import { injectable } from "inversify";
import fetch from 'node-fetch';
import { deserialize } from "@dhkatz/json-ts";
import GoogleAccessToken from "./schemas/GoogleAccessToken";
import GoogleAccessTokenError from "./schemas/GoogleAccessTokenError";
import GoogleAPIError from "./schemas/GoogleAPIError";
import GoogleUser from "./schemas/GoogleUser";
import process from 'process';

@injectable()
export default class GoogleLoginClient {
    private clientId!: string;
    private clientSecret!: string;
    private redirectUri!: string;

    constructor() {
        this.clientId = process.env?.['GOOGLE_OAUTH_CLIENT_ID'] ?? '';
        this.clientSecret = process.env?.['GOOGLE_OAUTH_CLIENT_SECRET'] ?? '';
        this.redirectUri = process.env?.['GOOGLE_OAUTH_REDIRECT_URI'] ?? '';
    }

    public async getAccessToken(code: string): Promise<GoogleAccessToken|GoogleAccessTokenError|Error> {
        try {
            const url = "https://oauth2.googleapis.com/token?client_id=" + this.clientId + "&client_secret=" + this.clientSecret + "&redirect_uri=" + this.redirectUri + "&code=" + code + "&grant_type=authorization_code";
            const response = await fetch(
              url,
              {
                method: "POST"
              }
            );
            if (response.status >= 500) {
                return new Error('bad response code');
            }
            const json = await response.json();
            if (json['error']) {
              return deserialize(GoogleAccessTokenError, json);
            }
            return deserialize(GoogleAccessToken, json);
        } catch (e: any) {
            return e;
        }
    }

    public async getGoogleUser(accessToken?: string): Promise<GoogleUser|GoogleAPIError|Error> {
        if (!accessToken) {
            throw new Error('missing access token');
        }
        try {
            const response = await fetch(
              "https://www.googleapis.com/oauth2/v2/userinfo",
              {
                method: "GET",
                headers: {
                    'Authorization': `Bearer ${accessToken}`,
                }
              }
            );
            if (response.status >= 500) {
                throw new Error('bad response code');
            }
            const json = await response.json();
            if (json['error']) {
                return deserialize(GoogleAPIError, json);
            }
            return deserialize(GoogleUser, json);

        } catch (e: any) {
            return e;
        }
    }
}