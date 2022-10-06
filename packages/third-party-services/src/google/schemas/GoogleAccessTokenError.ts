import { JsonProperty } from '@dhkatz/json-ts';

export default class GoogleAccessTokenError {

    @JsonProperty("error")
    public error?: string;

    @JsonProperty("error_description")
    public errorDescription?: string;
}
