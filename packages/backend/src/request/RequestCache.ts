import { injectable } from "inversify";
import { Organization } from "@floro/database/src/entities/Organization";
import { OrganizationMember } from "@floro/database/src/entities/OrganizationMember";
import { User } from "@floro/database/src/entities/User";
import { v4 as uuid } from 'uuid';
import { OrganizationRole } from "@floro/database/src/entities/OrganizationRole";
import { OrganizationPermissions } from "../services/organizations/OrganizationPermissionService";
import sizeof from "object-sizeof";
import { OrganizationInvitation } from "@floro/database/src/entities/OrganizationInvitation";

@injectable()
export default class RequestCache {
    private cache: {[key: string]: object} = {};

    public init(): string {
        const cacheKey = uuid();
        this.cache[cacheKey] = {};
        return cacheKey;
    }

    public release(cacheKey: string) {
        delete this.cache[cacheKey];
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

    public getOrganization(cacheKey: string, organizationId: string): Organization {
        const cache = this.getCache(cacheKey);
        return cache[`organization:${organizationId}`] as Organization;
    } 

    public setUserOrganizations(cacheKey: string, user: User, organizations: Organization[]) {
        const cache = this.getCache(cacheKey);
        cache[`user-organizations:${user.id}`] = organizations;
    }

    public getUserOrganizations(cacheKey: string, userId: string): Organization[] {
        const cache = this.getCache(cacheKey);
        return cache[`user-organizations:${userId}`] as Organization[];
    } 

    public setOrganizationMembership(cacheKey: string, organization: Organization, user: User, organizationMember: OrganizationMember) {
        const cache = this.getCache(cacheKey);
        cache[`organization-membership:${organization.id}:${user.id}`] = organizationMember;
    }

    public getOrganizationMembership(cacheKey: string, organizationId: string, userId: string): OrganizationMember {
        const cache = this.getCache(cacheKey);
        return cache[`organization-membership:${organizationId}:${userId}`] as OrganizationMember ?? null;
    }

    public setMembershipRoles(cacheKey: string, organizationMember: OrganizationMember, roles: OrganizationRole[]) {
        const cache = this.getCache(cacheKey);
        cache[`membership-roles:${organizationMember.id}`] = roles;
    }

    public getMembershipRoles(cacheKey: string, organizationMemberId: string): OrganizationRole[] {
        const cache = this.getCache(cacheKey);
        return cache[`membership-roles:${organizationMemberId}`] as OrganizationRole[] ?? null;
    }

    public setMembershipPermissions(cacheKey: string, organizationMember: OrganizationMember, permissions: OrganizationPermissions) {
        const cache = this.getCache(cacheKey);
        cache[`membership-permissions:${organizationMember.id}`] = permissions;
    }

    public getMembershipPermissions(cacheKey: string, organizationMemberId: string): OrganizationPermissions {
        const cache = this.getCache(cacheKey);
        return cache[`membership-permissions:${organizationMemberId}`] as OrganizationPermissions ?? null;
    }

    public setOrganizationRoles(cacheKey: string, organization: Organization, roles: OrganizationRole[]) {
        const cache = this.getCache(cacheKey);
        cache[`organization-roles:${organization.id}`] = roles;
    }

    public getOrganizationRoles(cacheKey: string, organizationId: string): OrganizationRole[] {
        const cache = this.getCache(cacheKey);
        return cache[`organization-roles:${organizationId}`] as OrganizationRole[] ?? null;
    }

    public setOrganizationMembers(cacheKey: string, organization: Organization, members: OrganizationMember[]) {
        const cache = this.getCache(cacheKey);
        cache[`organization-members:${organization.id}`] = members;
    }

    public getOrganizationMembers(cacheKey: string, organizationId: string): OrganizationMember[] {
        const cache = this.getCache(cacheKey);
        return cache[`organization-members:${organizationId}`] as OrganizationMember[] ?? null;
    }

    public setOrganizationInvitations(cacheKey: string, organization: Organization, organizationInvitations: OrganizationInvitation[]) {
        const cache = this.getCache(cacheKey);
        cache[`organization-invitations:${organization.id}`] = organizationInvitations;
    }

    public getOrganizationInvitations(cacheKey: string, organizationId: string): OrganizationInvitation[] {
        const cache = this.getCache(cacheKey);
        return cache[`organization-invitations:${organizationId}`] as OrganizationInvitation[] ?? null;
    }

    public setOrganizationInvitationRoles(cacheKey: string, organizationInvitation: OrganizationInvitation, roles: OrganizationRole[]) {
        const cache = this.getCache(cacheKey);
        cache[`organization-invitation-roles:${organizationInvitation.id}`] = roles;
    }

    public getOrganizationInvitationRoles(cacheKey: string, organizationInvitationId: string): OrganizationRole[] {
        const cache = this.getCache(cacheKey);
        return cache[`organization-invitation-roles:${organizationInvitationId}`] as OrganizationRole[] ?? null;
    }

    public setOrganizationActiveMemberCount(cacheKey: string, organization: Organization, count: number) {
        const cache = this.getCache(cacheKey);
        cache[`organization-active-members-count:${organization.id}`] = count;
    }

    public getOrganizationActiveMemberCount(cacheKey: string, organizationId: string): number {
        const cache = this.getCache(cacheKey);
        return cache[`organization-active-members-count:${organizationId}`] as number ?? null;
    }

    public setOrganizationSentInvitationsCount(cacheKey: string, organization: Organization, count: number) {
        const cache = this.getCache(cacheKey);
        cache[`organization-sent-invitations-count:${organization.id}`] = count;
    }

    public getOrganizationSentInvitationsCount(cacheKey: string, organizationId: string): number {
        const cache = this.getCache(cacheKey);
        return cache[`organization-sent-invitations-count:${organizationId}`] as number ?? null;
    }
}