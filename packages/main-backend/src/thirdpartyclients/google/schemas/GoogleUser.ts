import { JsonProperty } from '@dhkatz/json-ts';

export default class GoogleUser {

    @JsonProperty("id")
    public id?: string;

    @JsonProperty("email")
    public email?: string;

    @JsonProperty("verified_email")
    public verifiedEmail?: boolean;

    @JsonProperty("name")
    public name?: string;

    @JsonProperty("given_name")
    public givenName?: string;

    @JsonProperty("family_name")
    public familyName?: string;

    @JsonProperty("picture")
    public picture?: string;

    @JsonProperty("locale")
    public locale?: string;

    @JsonProperty("hd")
    public hd?: string;
}

