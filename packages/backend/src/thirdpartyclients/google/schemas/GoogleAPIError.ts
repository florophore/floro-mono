import { JsonProperty } from '@dhkatz/json-ts';

export class GoogleError {

    @JsonProperty("code")
    public code?: number;

    @JsonProperty("message")
    public message?: string;

    @JsonProperty("status")
    public status?: string;
}

export default class GoogleAPIError {

    @JsonProperty({name: "error", type: GoogleError})
    public error?: GoogleError;
}
