import { JsonProperty } from '@dhkatz/json-ts';

export default class GithubPlan {

    @JsonProperty("name")
    public name?: string;

    @JsonProperty("space")
    public space?: number;

    @JsonProperty("collaborators")
    public collaborators?: number;

    @JsonProperty("private_repos")
    public private_repos?: number;
}