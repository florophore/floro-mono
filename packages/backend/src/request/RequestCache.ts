import { injectable } from "inversify";
import { Organization } from "@floro/database/src/entities/Organization";
import { OrganizationMember } from "@floro/database/src/entities/OrganizationMember";
import { User } from "@floro/database/src/entities/User";
import { v4 as uuid } from "uuid";
import { Plugin } from "@floro/database/src/entities/Plugin";
import { OrganizationRole } from "@floro/database/src/entities/OrganizationRole";
import { OrganizationPermissions } from "../services/organizations/OrganizationPermissionService";
import sizeof from "object-sizeof";
import { OrganizationInvitation } from "@floro/database/src/entities/OrganizationInvitation";
import { Repository } from "@floro/database/src/entities/Repository";
import { Branch as FloroBranch, RemoteSettings} from "floro/dist/src/repo";
import { MergeRequestPermissions, PluginVersion, RepositoryBranchStateArgs } from "@floro/graphql-schemas/build/generated/main-graphql";
import { Commit } from "@floro/database/src/entities/Commit";
import { DataSource } from "floro/dist/src/datasource";
import { MergeRequest } from "@floro/database/src/entities/MergeRequest";
import { MergeRequestComment } from "@floro/database/src/entities/MergeRequestComment";
import { MergeRequestCommentReply } from "@floro/database/src/entities/MergeRequestCommentReply";

@injectable()
export default class RequestCache {
  private cache: { [key: string]: object } = {};

  public init(): string {
    const cacheKey = uuid();
    this.cache[cacheKey] = {};
    return cacheKey;
  }

  public release(cacheKey: string) {
    delete this.cache[cacheKey];
  }

  public clear(cacheKey: string) {
    this.cache[cacheKey] = {};
  }

  public getCache(cacheKey: string) {
    if (!this.cache[cacheKey]) {
      this.cache[cacheKey] = {};
    }
    return this.cache[cacheKey];
  }

  public getSize(cacheKey?: string) {
    if (cacheKey) {
      return sizeof(this.cache[cacheKey]);
    }
    return sizeof(this.cache);
  }

  public setOrganization(cacheKey: string, organization: Organization) {
    const cache = this.getCache(cacheKey);
    cache[`organization:${organization.id}`] = organization;
  }

  public getOrganization(
    cacheKey: string,
    organizationId: string
  ): Organization {
    const cache = this.getCache(cacheKey);
    return cache[`organization:${organizationId}`] as Organization;
  }

  public setUserOrganizations(
    cacheKey: string,
    user: User,
    organizations: Organization[]
  ) {
    const cache = this.getCache(cacheKey);
    cache[`user-organizations:${user.id}`] = organizations;
  }

  public getUserOrganizations(
    cacheKey: string,
    userId: string
  ): Organization[] {
    const cache = this.getCache(cacheKey);
    return cache[`user-organizations:${userId}`] as Organization[];
  }

  public setOrganizationMembership(
    cacheKey: string,
    organization: Organization,
    user: User,
    organizationMember: OrganizationMember
  ) {
    const cache = this.getCache(cacheKey);
    cache[`organization-membership:${organization.id}:${user.id}`] =
      organizationMember;
  }

  public getOrganizationMembership(
    cacheKey: string,
    organizationId: string,
    userId: string
  ): OrganizationMember {
    const cache = this.getCache(cacheKey);
    return (
      (cache[
        `organization-membership:${organizationId}:${userId}`
      ] as OrganizationMember) ?? null
    );
  }

  public setMembershipRoles(
    cacheKey: string,
    organizationMember: OrganizationMember,
    roles: OrganizationRole[]
  ) {
    const cache = this.getCache(cacheKey);
    cache[`membership-roles:${organizationMember.id}`] = roles;
  }

  public clearMembershipRoles(
    cacheKey: string,
    organizationMember: OrganizationMember
  ) {
    const cache = this.getCache(cacheKey);
    delete cache[`membership-roles:${organizationMember.id}`];
    this.cache[cacheKey] = cache;
  }

  public getMembershipRoles(
    cacheKey: string,
    organizationMemberId: string
  ): OrganizationRole[] {
    const cache = this.getCache(cacheKey);
    return (
      (cache[
        `membership-roles:${organizationMemberId}`
      ] as OrganizationRole[]) ?? null
    );
  }

  public setMembershipPermissions(
    cacheKey: string,
    organizationMember: OrganizationMember,
    permissions: OrganizationPermissions
  ) {
    const cache = this.getCache(cacheKey);
    cache[`membership-permissions:${organizationMember.id}`] = permissions;
  }

  public getMembershipPermissions(
    cacheKey: string,
    organizationMemberId: string
  ): OrganizationPermissions {
    const cache = this.getCache(cacheKey);
    return (
      (cache[
        `membership-permissions:${organizationMemberId}`
      ] as OrganizationPermissions) ?? null
    );
  }

  public setOrganizationRoles(
    cacheKey: string,
    organization: Organization,
    roles: OrganizationRole[]
  ) {
    const cache = this.getCache(cacheKey);
    cache[`organization-roles:${organization.id}`] = roles;
  }

  public getOrganizationRoles(
    cacheKey: string,
    organizationId: string
  ): OrganizationRole[] {
    const cache = this.getCache(cacheKey);
    return (
      (cache[`organization-roles:${organizationId}`] as OrganizationRole[]) ??
      null
    );
  }

  public clearOrganizationRoles(cacheKey: string, organization: Organization) {
    const cache = this.getCache(cacheKey);
    delete cache[`organization-roles:${organization.id}`];
    this.cache[cacheKey] = cache;
  }

  public setOrganizationMembers(
    cacheKey: string,
    organization: Organization,
    members: OrganizationMember[]
  ) {
    const cache = this.getCache(cacheKey);
    cache[`organization-members:${organization.id}`] = members;
  }

  public getOrganizationMembers(
    cacheKey: string,
    organizationId: string
  ): OrganizationMember[] {
    const cache = this.getCache(cacheKey);
    return (
      (cache[
        `organization-members:${organizationId}`
      ] as OrganizationMember[]) ?? null
    );
  }

  public setOrganizationInvitations(
    cacheKey: string,
    organization: Organization,
    organizationInvitations: OrganizationInvitation[]
  ) {
    const cache = this.getCache(cacheKey);
    cache[`organization-invitations:${organization.id}`] =
      organizationInvitations;
  }

  public getOrganizationInvitations(
    cacheKey: string,
    organizationId: string
  ): OrganizationInvitation[] {
    const cache = this.getCache(cacheKey);
    return (
      (cache[
        `organization-invitations:${organizationId}`
      ] as OrganizationInvitation[]) ?? null
    );
  }

  public setOrganizationInvitationRoles(
    cacheKey: string,
    organizationInvitation: OrganizationInvitation,
    roles: OrganizationRole[]
  ) {
    const cache = this.getCache(cacheKey);
    cache[`organization-invitation-roles:${organizationInvitation.id}`] = roles;
  }

  public getOrganizationInvitationRoles(
    cacheKey: string,
    organizationInvitationId: string
  ): OrganizationRole[] {
    const cache = this.getCache(cacheKey);
    return (
      (cache[
        `organization-invitation-roles:${organizationInvitationId}`
      ] as OrganizationRole[]) ?? null
    );
  }

  public setOrganizationActiveMemberCount(
    cacheKey: string,
    organization: Organization,
    count: number
  ) {
    const cache = this.getCache(cacheKey);
    cache[`organization-active-members-count:${organization.id}`] = count;
  }

  public getOrganizationActiveMemberCount(
    cacheKey: string,
    organizationId: string
  ): number {
    const cache = this.getCache(cacheKey);
    return (
      (cache[
        `organization-active-members-count:${organizationId}`
      ] as number) ?? null
    );
  }

  public setOrganizationSentInvitationsCount(
    cacheKey: string,
    organization: Organization,
    count: number
  ) {
    const cache = this.getCache(cacheKey);
    cache[`organization-sent-invitations-count:${organization.id}`] = count;
  }

  public getOrganizationSentInvitationsCount(
    cacheKey: string,
    organizationId: string
  ): number {
    const cache = this.getCache(cacheKey);
    return (
      (cache[
        `organization-sent-invitations-count:${organizationId}`
      ] as number) ?? null
    );
  }

  public setUserRepos(cacheKey: string, user: User, repos: Repository[]) {
    const cache = this.getCache(cacheKey);
    cache[`user-repos:${user.id}`] = repos;
  }

  public getUserRepos(cacheKey: string, userId: string): Repository[] {
    const cache = this.getCache(cacheKey);
    return cache[`user-repos:${userId}`] as Repository[];
  }

  public setUserPrivateRepos(
    cacheKey: string,
    user: User,
    repos: Repository[]
  ) {
    const cache = this.getCache(cacheKey);
    cache[`user-private-repos:${user.id}`] = repos;
  }

  public getUserPrivateRepos(cacheKey: string, userId: string): Repository[] {
    const cache = this.getCache(cacheKey);
    return cache[`user-private-repos:${userId}`] as Repository[];
  }

  public setUserPublicRepos(cacheKey: string, user: User, repos: Repository[]) {
    const cache = this.getCache(cacheKey);
    cache[`user-public-repos:${user.id}`] = repos;
  }

  public getUserPublicRepos(cacheKey: string, userId: string): Repository[] {
    const cache = this.getCache(cacheKey);
    return cache[`user-public-repos:${userId}`] as Repository[];
  }

  public setOrganizationRepos(
    cacheKey: string,
    organization: Organization,
    repos: Repository[]
  ) {
    const cache = this.getCache(cacheKey);
    cache[`organization-repos:${organization.id}`] = repos;
  }

  public getOrganizationRepos(
    cacheKey: string,
    organizationId: string
  ): Repository[] {
    const cache = this.getCache(cacheKey);
    return cache[`organization-repos:${organizationId}`] as Repository[];
  }

  public setOrganizationPrivateRepos(
    cacheKey: string,
    organization: Organization,
    repos: Repository[]
  ) {
    const cache = this.getCache(cacheKey);
    cache[`organization-private-repos:${organization.id}`] = repos;
  }

  public getOrganizationPrivateRepos(
    cacheKey: string,
    organizationId: string
  ): Repository[] {
    const cache = this.getCache(cacheKey);
    return cache[
      `organization-private-repos:${organizationId}`
    ] as Repository[];
  }

  public setOrganizationPublicRepos(
    cacheKey: string,
    organization: Organization,
    repos: Repository[]
  ) {
    const cache = this.getCache(cacheKey);
    cache[`organization-public-repos:${organization.id}`] = repos;
  }

  public getOrganizationPublicRepos(
    cacheKey: string,
    organizationId: string
  ): Repository[] {
    const cache = this.getCache(cacheKey);
    return cache[`organization-public-repos:${organizationId}`] as Repository[];
  }

  public setUserPrivatePlugins(cacheKey: string, user: User, repos: Plugin[]) {
    const cache = this.getCache(cacheKey);
    cache[`user-private-plugins:${user.id}`] = repos;
  }

  public getUserPrivatePlugins(cacheKey: string, userId: string): Plugin[] {
    const cache = this.getCache(cacheKey);
    return cache[`user-private-plugins:${userId}`] as Plugin[];
  }

  public setUserPublicPlugins(cacheKey: string, user: User, repos: Plugin[]) {
    const cache = this.getCache(cacheKey);
    cache[`user-public-plugins:${user.id}`] = repos;
  }

  public getUserPublicPlugins(cacheKey: string, userId: string): Plugin[] {
    const cache = this.getCache(cacheKey);
    return cache[`user-public-plugins:${userId}`] as Plugin[];
  }

  public setUserPluginCount(cacheKey: string, user: User, count: number) {
    const cache = this.getCache(cacheKey);
    cache[`user-plugin-count:${user.id}`] = count;
  }

  public getUserPluginCount(cacheKey: string, userId: string): number {
    const cache = this.getCache(cacheKey);
    return cache[`user-plugin-count:${userId}`] as number;
  }

  public setOrgPrivatePlugins(
    cacheKey: string,
    organization: Organization,
    repos: Plugin[]
  ) {
    const cache = this.getCache(cacheKey);
    cache[`org-private-plugins:${organization.id}`] = repos;
  }

  public getOrgPrivatePlugins(
    cacheKey: string,
    organizationId: string
  ): Plugin[] {
    const cache = this.getCache(cacheKey);
    return cache[`org-private-plugins:${organizationId}`] as Plugin[];
  }

  public setOrgPublicPlugins(
    cacheKey: string,
    org: Organization,
    repos: Plugin[]
  ) {
    const cache = this.getCache(cacheKey);
    cache[`org-public-plugins:${org.id}`] = repos;
  }

  public getOrgPublicPlugins(
    cacheKey: string,
    organizationId: string
  ): Plugin[] {
    const cache = this.getCache(cacheKey);
    return cache[`org-public-plugins:${organizationId}`] as Plugin[];
  }

  public setOrgPluginCount(
    cacheKey: string,
    organization: Organization,
    count: number
  ) {
    const cache = this.getCache(cacheKey);
    cache[`org-plugin-count:${organization.id}`] = count;
  }

  public getOrgPluginCount(cacheKey: string, organizationId: string): number {
    const cache = this.getCache(cacheKey);
    return cache[`org-plugin-count:${organizationId}`] as number;
  }
  public setRepo(cacheKey: string, repository: Repository) {
    if (repository?.id) {
      const cache = this.getCache(cacheKey);
      cache[`repo:${repository?.id}`] = repository;
    }
  }

  public getRepo(cacheKey: string, repoId: string): Repository {
    const cache = this.getCache(cacheKey);
    return cache[`repo:${repoId}`] as Repository;
  }

  public setRepoBranches(
    cacheKey: string,
    repoId: string,
    branches: Array<FloroBranch & { updatedAt: string; dbId: string }>
  ) {
    const cache = this.getCache(cacheKey);
    cache[`repo-branches:${repoId}`] = branches;
  }

  public getRepoBranches(
    cacheKey: string,
    repoId: string
  ): Array<FloroBranch & { updatedAt: string; dbId: string }> {
    const cache = this.getCache(cacheKey);
    return cache[`repo-branches:${repoId}`] as Array<
      FloroBranch & { updatedAt: string; dbId: string }
    >;
  }

  public setRepoCommits(
    cacheKey: string,
    repoId: string,
    commits: Array<Commit>
  ) {
    const cache = this.getCache(cacheKey);
    cache[`repo-commits:${repoId}`] = commits;
  }

  public getRepoCommits(cacheKey: string, repoId: string): Array<Commit> {
    const cache = this.getCache(cacheKey);
    return cache[`repo-commits:${repoId}`] as Array<Commit>;
  }

  public setRepoCommitHistory(
    cacheKey: string,
    repoId: string,
    sha: string,
    commits: Array<Commit>
  ) {
    const cache = this.getCache(cacheKey);
    cache[`repo-commit-history:${repoId}:${sha}`] = commits;
  }

  public getRepoCommitHistory(
    cacheKey: string,
    repoId: string,
    sha: string
  ): Array<Commit> {
    const cache = this.getCache(cacheKey);
    return cache[`repo-commit-history:${repoId}:${sha}`] as Array<Commit>;
  }

  public setRepoRemoteSettings(
    cacheKey: string,
    repoId: string,
    remoteSettings: RemoteSettings
  ) {
    const cache = this.getCache(cacheKey);
    cache[`repo-remote-settings:${repoId}`] = remoteSettings;
  }

  public getRepoRemoteSettings(
    cacheKey: string,
    repoId: string
  ): RemoteSettings {
    const cache = this.getCache(cacheKey);
    return cache[`repo-remote-settings:${repoId}`] as RemoteSettings;
  }

  public getRepoRevertRanges(
    cacheKey: string,
    repoId: string,
    sha: string
  ): Array<{ fromIdx: number; toIdx: number }> {
    const cache = this.getCache(cacheKey);
    return cache[`repo-revert-ranges:${repoId}:${sha}`] as Array<{
      fromIdx: number;
      toIdx: number;
    }>;
  }

  public setRepoRevertRanges(
    cacheKey: string,
    repoId: string,
    sha: string,
    ranges: Array<{ fromIdx: number; toIdx: number }>
  ) {
    const cache = this.getCache(cacheKey);
    cache[`repo-revert-ranges:${repoId}:${sha}`] = ranges;
  }

  public getCommitStateDatasource(
    cacheKey: string,
    repoId: string,
    sha: string
  ): DataSource {
    const cache = this.getCache(cacheKey);
    return cache[`commit-state-datasource:${repoId}:${sha}`] as DataSource;
  }

  public setCommitStateDatasource(
    cacheKey: string,
    repoId: string,
    sha: string,
    datasource: DataSource
  ) {
    const cache = this.getCache(cacheKey);
    cache[`commit-state-datasource:${repoId}:${sha}`] = datasource;
  }
  public getCommitStatePluginVersions(
    cacheKey: string,
    repoId: string,
    sha: string
  ): PluginVersion[] {
    const cache = this.getCache(cacheKey);
    return cache[
      `commit-state-plugin-versions:${repoId}:${sha}`
    ] as PluginVersion[];
  }

  public setCommitStatePluginVersions(
    cacheKey: string,
    repoId: string,
    sha: string,
    pluginVersions: PluginVersion[]
  ) {
    const cache = this.getCache(cacheKey);
    cache[`commit-state-plugin-versions:${repoId}:${sha}`] = pluginVersions;
  }

  public getCommitStateBinaryRefs(
    cacheKey: string,
    repoId: string,
    sha: string
  ): { fileName: string; url: string }[] {
    const cache = this.getCache(cacheKey);
    return cache[`commit-state-binary-refs:${repoId}:${sha}`] as {
      fileName: string;
      url: string;
    }[];
  }

  public setCommitStateBinaryRefs(
    cacheKey: string,
    repoId: string,
    sha: string,
    binaryRefs: { fileName: string; url: string }[]
  ) {
    const cache = this.getCache(cacheKey);
    cache[`commit-state-binary-refs:${repoId}:${sha}`] = binaryRefs;
  }
  // MERGE REQUESTS

  public getMergeRequest(
    cacheKey: string,
    mergeRequestId: string,
  ): MergeRequest {
    const cache = this.getCache(cacheKey);
    return cache[`merge-request:${mergeRequestId}`] as MergeRequest;
  }

  public setMergeRequest(
    cacheKey: string,
    mergeRequest: MergeRequest,
  ) {
    const cache = this.getCache(cacheKey);
    cache[`merge-request:${mergeRequest.id}`] = mergeRequest;
  }

  public deleteMergeRequest(
    cacheKey: string,
    mergeRequest: MergeRequest,
  ) {
    const cache = this.getCache(cacheKey);
    delete cache[`merge-request:${mergeRequest.id}`];
  }

  public getMergeRequestComment(
    cacheKey: string,
    mergeRequesCommentId: string,
  ): MergeRequestComment {
    const cache = this.getCache(cacheKey);
    return cache[`merge-request-comment:${mergeRequesCommentId}`] as MergeRequestComment;
  }

  public setMergeRequestComment(
    cacheKey: string,
    mergeRequestComment: MergeRequestComment,
  ) {
    const cache = this.getCache(cacheKey);
    cache[`merge-request-comment:${mergeRequestComment.id}`] = mergeRequestComment;
  }

  public deleteMergeRequestComment(
    cacheKey: string,
    mergeRequestComment: MergeRequestComment,
  ) {
    const cache = this.getCache(cacheKey);
    delete cache[`merge-request-comment:${mergeRequestComment.id}`];
  }

  public getMergeRequestCommentReply(
    cacheKey: string,
    mergeRequestCommentReplyId: string,
  ): MergeRequestCommentReply {
    const cache = this.getCache(cacheKey);
    return cache[`merge-request-comment-reply:${mergeRequestCommentReplyId}`] as MergeRequestCommentReply;
  }

  public setMergeRequestCommentReply(
    cacheKey: string,
    mergeRequestCommentReply: MergeRequestCommentReply,
  ) {
    const cache = this.getCache(cacheKey);
    cache[`merge-request-comment-reply:${mergeRequestCommentReply.id}`] = mergeRequestCommentReply;
  }

  public deleteMergeRequestCommentReply(
    cacheKey: string,
    mergeRequestCommentReply: MergeRequestCommentReply,
  ) {
    const cache = this.getCache(cacheKey);
    delete cache[`merge-request-comment-reply:${mergeRequestCommentReply.id}`];
  }

  public setOpenUserBranches(
    cacheKey: string,
    repositoryId: string,
    branches: Array<FloroBranch>
  ) {
    const cache = this.getCache(cacheKey);
    cache[`open-user-branches:${repositoryId}`] = branches;
  }

  public getOpenUserBranches(
    cacheKey: string,
    repositoryId: string,
  ): Array<FloroBranch> {
    const cache = this.getCache(cacheKey);
    return cache[`open-user-branches:${repositoryId}`];
  }

  public setOpenRepoMergeRequests(
    cacheKey: string,
    repositoryId: string,
    mergeRequests: Array<MergeRequest>
  ) {
    const cache = this.getCache(cacheKey);
    cache[`open-repo-merge-requests:${repositoryId}`] = mergeRequests;
  }

  public getOpenRepoMergeRequests(
    cacheKey: string,
    repositoryId: string,
  ): Array<MergeRequest> {
    const cache = this.getCache(cacheKey);
    return cache[`open-repo-merge-requests:${repositoryId}`];
  }

  public setClosedRepoMergeRequests(
    cacheKey: string,
    repositoryId: string,
    mergeRequests: Array<MergeRequest>
  ) {
    const cache = this.getCache(cacheKey);
    cache[`closed-repo-merge-requests:${repositoryId}`] = mergeRequests;
  }

  public getClosedRepoMergeRequests(
    cacheKey: string,
    repositoryId: string,
  ): Array<MergeRequest> {
    const cache = this.getCache(cacheKey);
    return cache[`closed-repo-merge-requests:${repositoryId}`];
  }

  public setMergeRequestPermissions(
    cacheKey: string,
    mergeRequestId: string,
    mergeRequestPermissions: MergeRequestPermissions
  ) {
    const cache = this.getCache(cacheKey);
    cache[`merge-request-permissions:${mergeRequestId}`] = mergeRequestPermissions;
  }

  public getMergeRequestPermissions(
    cacheKey: string,
    mergeRequestId: string,
  ): MergeRequestPermissions {
    const cache = this.getCache(cacheKey);
    return cache[`merge-request-permissions:${mergeRequestId}`];
  }
}
