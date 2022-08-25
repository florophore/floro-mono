import { JsonProperty } from '@dhkatz/json-ts';
import GithubPlan from './GithubPlan';

 export default class GithubUser {

    @JsonProperty("login")
    public login?: string;

    @JsonProperty("id")
    public id?: number;

    @JsonProperty("node_id")
    public nodeId?: string;

    @JsonProperty("avatar_url")
    public avatarUrl?: string;

    @JsonProperty("gravatar_id")
    public gravatarId?: string;

    @JsonProperty("url")
    public url?: string;

    @JsonProperty("followers_url")
    public followersUrl?: string;

    @JsonProperty("following_url")
    public followingUrl?: string;

    @JsonProperty("gists_url")
    public gistsUrl?: string;

    @JsonProperty("starred_url")
    public starredUrl?: string;

    @JsonProperty("repos_url")
    public reposUrl?: string;

    @JsonProperty("events_url")
    public eventsUrl?: string;

    @JsonProperty("received_events_url")
    public receivedEventsUrl?: string;

    @JsonProperty("subscriptions_url")
    public subscriptionsUrl?: string;

    @JsonProperty("organizations_url")
    public organizationsUrl?: string;

    @JsonProperty("type")
    public type?: string;

    @JsonProperty("site_admin")
    public siteAdmin?: boolean;

    @JsonProperty("name")
    public name?: string;

    @JsonProperty("location")
    public location?: string;

    @JsonProperty("email")
    public email?: string;

    @JsonProperty("hireable")
    public hireable?: boolean;

    @JsonProperty("bio")
    public bio?: string;

    @JsonProperty("twitter_username")
    public twitterUsername?: string;

    @JsonProperty("company")
    public company?: string;

    @JsonProperty("public_repos")
    public publicRepos?: number;

    @JsonProperty("public_gists")
    public publicGists?: number;

    @JsonProperty("followers")
    public followers?: number;

    @JsonProperty("following")
    public following?: number;

    @JsonProperty({name: "created_at", type: Date})
    public createdAt?: Date;

    @JsonProperty({name: "updated_at", type: Date})
    public updatedAt?: Date;

    @JsonProperty("owned_private_repos")
    public ownedPrivateRepos?: number;

    @JsonProperty("total_private_repos")
    public totalPrivateRepos?: number;

    @JsonProperty("private_gists")
    public privateGists?: number;

    @JsonProperty("disk_usage")
    public diskUsage?: number;

    @JsonProperty("collaborators")
    public collaborators?: number;

    @JsonProperty("two_factor_authentication")
    public twoFactorAuthentication?: boolean;

    @JsonProperty({name: "plan", type: GithubPlan})
    public plan?: GithubPlan;
}