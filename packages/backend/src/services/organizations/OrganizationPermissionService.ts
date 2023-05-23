import { injectable, inject } from "inversify";

import ContextFactory from "@floro/database/src/contexts/ContextFactory";
import OrganizationMembersContext from "@floro/database/src/contexts/organizations/OrganizationMembersContext";
import OrganizationMemberRolesContext from "@floro/database/src/contexts/organizations/OrganizationMemberRolesContext";
import { User } from "@floro/database/src/entities/User";
import { Organization } from "@floro/database/src/entities/Organization";
import { OrganizationRole } from "@floro/database/src/entities/OrganizationRole";
import { OrganizationMember } from "@floro/database/src/entities/OrganizationMember";

export interface OrganizationPermissions {
  canCreateRepos: boolean;
  canModifyOrganizationSettings: boolean;
  canModifyOrganizationDeveloperSettings: boolean;
  canModifyOrganizationMembers: boolean;
  canInviteMembers: boolean;
  canModifyInvites: boolean;
  canModifyOwnInternalHandle: boolean;
  canModifyBilling: boolean;
  canRegisterPlugins: boolean,
  canUploadPlugins: boolean,
  canReleasePlugins: boolean,
  canModifyOrganizationRoles: boolean;
  canAssignRoles: boolean;
}

export const PERMISSION_KEYS: (keyof OrganizationPermissions)[] = [
    "canCreateRepos",
    "canModifyOrganizationSettings",
    "canModifyOrganizationDeveloperSettings",
    "canModifyOrganizationMembers",
    "canInviteMembers",
    "canModifyInvites",
    "canModifyOwnInternalHandle",
    "canModifyBilling",
    "canRegisterPlugins",
    "canUploadPlugins",
    "canReleasePlugins",
    "canModifyOrganizationRoles",
    "canAssignRoles"
];

@injectable()
export default class OrganizationPermissionService {
  private contextFactory!: ContextFactory;

  constructor(
    @inject(ContextFactory) contextFactory: ContextFactory
  ) {
    this.contextFactory = contextFactory;
  }

  public async getUserMembership(organization: Organization, user: User) {
    const organizationMembersContext = await this.contextFactory.createContext(OrganizationMembersContext);
    return await organizationMembersContext.getByOrgAndUser(organization, user);
  }

  public async calculateMemberOrgPermissions(organizationMember: OrganizationMember) {
    const organizationMemberRolesContext = await this.contextFactory.createContext(OrganizationMemberRolesContext);
    const roles = await organizationMemberRolesContext.getRolesByMember(organizationMember);
    return await this.calculatePermissions(roles);
  }

  public calculatePermissions(roles: OrganizationRole[]): OrganizationPermissions {
    const defaultPermissions: OrganizationPermissions = {
      canCreateRepos: false,
      canModifyOrganizationSettings: false,
      canModifyOrganizationDeveloperSettings: false,
      canModifyOrganizationMembers: false,
      canInviteMembers: false,
      canModifyInvites: false,
      canModifyOwnInternalHandle: false,
      canModifyBilling: false,
      canRegisterPlugins: false,
      canUploadPlugins: false,
      canReleasePlugins: false,
      canModifyOrganizationRoles: false,
      canAssignRoles: false
    };
    return roles.reduce((permissions, role) => {
        return PERMISSION_KEYS.reduce((perms, key) => {
            return {
                ...perms,
                [key]: perms[key] || role[key]
            };
        }, permissions)

    }, defaultPermissions);
  }
}