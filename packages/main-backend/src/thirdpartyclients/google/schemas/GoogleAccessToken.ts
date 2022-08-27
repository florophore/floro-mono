import { JsonProperty } from '@dhkatz/json-ts';

export default class GoogleAccessToken {

    @JsonProperty("access_token")
    public accessToken?: string;

    @JsonProperty("expires_in")
    public expiresIn?: number;

    @JsonProperty("scope")
    public scope?: string;

    @JsonProperty("token_type")
    public tokenType?: string;

    @JsonProperty("id_token")
    public idToken?: string;
}
