import { JsonProperty } from '@dhkatz/json-ts';

export default class GithubAccessToken {

    @JsonProperty("access_token")
    public accessToken?: string;

    @JsonProperty("scope")
    public scope?: string;

    @JsonProperty("token_type")
    public tokenType?: string;

}
