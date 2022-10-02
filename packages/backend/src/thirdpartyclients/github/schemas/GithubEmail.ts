import { JsonProperty } from '@dhkatz/json-ts';

export default class GithubEmail {

    @JsonProperty("email")
    public email?: string;

    @JsonProperty("primary")
    public primary?: boolean;

    @JsonProperty("verified")
    public verified?: boolean;

    @JsonProperty("visibility")
    public visibility?: string;
}