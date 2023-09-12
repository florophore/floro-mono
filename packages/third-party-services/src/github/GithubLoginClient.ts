import { injectable } from "inversify";
import fetch from 'node-fetch';
import { deserialize } from "@dhkatz/json-ts";
import FormData from 'form-data';
import GithubAccessToken from "./schemas/GithubAccessToken";
import GithubAccessTokenError from "./schemas/GithubAccessTokenError";
import GithubAPIError from "./schemas/GithubAPIError";
import GithubUser from "./schemas/GithubUser";
import GithubEmail from "./schemas/GithubEmail";
import process from 'process';

@injectable()
export default class GithubLoginClient {
    private clientId!: string;
    private clientSecret!: string;

    constructor() {
        this.clientId = process?.env?.['GITHUB_OAUTH_CLIENT_ID'] ?? '';
        this.clientSecret = process?.env?.['GITHUB_OAUTH_CLIENT_SECRET'] ?? '';
    }

    public async getAccessToken(code: string): Promise<GithubAccessToken|GithubAccessTokenError|Error> {
        try {
            const data = new FormData();
            data.append("client_id", this.clientId);
            data.append("client_secret", this.clientSecret);
            data.append("code", code);
            const response = await fetch(
              "https://github.com/login/oauth/access_token",
              {
                method: "POST",
                body: data,
              }
            );
            if (response.status != 200) {
                return new Error('bad response code');
            }
            const text = await response.text();
            const json = text.split("&").reduce(
              (json, kv) => {
                const [key, value] = kv.split("=");
                return {
                    ...json,
                    [key]: value,
                }
              },
              {}
            );
            if (json['error']) {
              return deserialize(GithubAccessTokenError, json);
            }
            return deserialize(GithubAccessToken, json);
        } catch (e: any) {
            return e;
        }
    }

    public async getGithubUser(accessToken?: string): Promise<GithubUser|GithubAPIError|Error> {
        if (!accessToken) {
            throw new Error('missing access token');
        }
        try {
            const response = await fetch(
              "https://api.github.com/user",
              {
                method: "GET",
                headers: {
                    'Authorization': `token ${accessToken}`,
                }
              }
            );
            if (response.status >= 500) {
                throw new Error('bad response code');
            }
            const json = await response.json();
            if (json['message']) {
                return deserialize(GithubAPIError, json);
            }
            return deserialize(GithubUser, json);

        } catch (e: any) {
            return e;
        }
    }

    public async getGithubUserEmails(accessToken?: string): Promise<Array<GithubEmail>|GithubAPIError|Error> {
        if (!accessToken) {
            throw new Error('missing access token');
        }
        try {
            const response = await fetch(
              "https://api.github.com/user/emails",
              {
                method: "GET",
                headers: {
                    'Authorization': `token ${accessToken}`,
                }
              }
            );
            if (response.status >= 500) {
                throw new Error('bad response code');
            }
            const json = await response.json();
            if (json['message']) {
                return deserialize(GithubAPIError, json);
            }
            return json.map(email => deserialize(GithubEmail, email));

        } catch (e: any) {
            return e;
        }
    }
}