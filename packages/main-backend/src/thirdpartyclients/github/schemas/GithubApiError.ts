import { JsonProperty } from '@dhkatz/json-ts';

export default class GithubApiError {

    @JsonProperty("message")
    public message?: string;

    @JsonProperty("document_url")
    public documentUrl?: string;
}