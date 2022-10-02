import { JsonProperty } from '@dhkatz/json-ts';

export default class GithubAccessTokenError {

    @JsonProperty("error")
    public error?: string;

    @JsonProperty("error_description")
    public errorDescription?: string;

    @JsonProperty("error_uri")
    public errorUri?: string;
}