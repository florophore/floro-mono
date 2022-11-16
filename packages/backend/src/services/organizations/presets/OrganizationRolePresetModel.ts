import { Organization } from "@floro/database/src/entities/Organization";
import { OrganizationMember } from "@floro/database/src/entities/OrganizationMember";
import { User } from "@floro/database/src/entities/User";

export interface OrganizationRoleModel {
  name: string;
  presetCode?: 'admin'|'contributor'|'billing_admin'|'technical_admin';
  isMutable: boolean;
  isDefault: boolean;
  canCreateRepos: boolean;
  canModifyOrganizationSettings: boolean;
  canModifyOrganizationDeveloperSettings: boolean;
  canModifyOrganizationMembers: boolean;
  canInviteMembers: boolean;
  canModifyInvites: boolean;
  canModifyOwnInternalHandle: boolean;
  canModifyBilling: boolean;
  canModifyOrganizationRoles: boolean;
  canAssignRoles: boolean;

  organizationId: string;
  createdByUserId: string;
  createdByOrganizationMemberId: string;
}

export default class OrganizationRolePresetModel implements OrganizationRoleModel {
  public name!: string;
  public presetCode!: 'admin'|'contributor'|'billing_admin'|'technical_admin';
  public isMutable!: boolean;
  public isDefault!: boolean;
  public canCreateRepos!: boolean;
  public canModifyOrganizationSettings!: boolean;
  public canModifyOrganizationDeveloperSettings!: boolean;
  public canModifyOrganizationMembers!: boolean;
  public canInviteMembers!: boolean;
  public canModifyInvites!: boolean;
  public canModifyOwnInternalHandle!: boolean;
  public canModifyBilling!: boolean;
  public canModifyOrganizationRoles!: boolean;
  public canAssignRoles!: boolean;

  public organizationId!: string;
  public createdByUserId!: string;
  public createdByOrganizationMemberId!: string;

  constructor(
    name: string,
    presetCode: 'admin'|'contributor'|'billing_admin'|'technical_admin',
    isMutable: boolean,
    isDefault: boolean,
    canCreateRepos: boolean,
    canModifyOrganizationSettings: boolean,
    canModifyOrganizationDeveloperSettings: boolean,
    canModifyOrganizationMembers: boolean,
    canInviteMembers: boolean,
    canModifyInvites: boolean,
    canModifyOwnInternalHandle: boolean,
    canModifyBilling: boolean,
    canModifyOrganizationRoles: boolean,
    canAssignRoles: boolean,
    organizationId: string,
    createdByUserId: string,
    createdByOrganizationMemberId: string,
  ) {
    this.name = name;
    this.presetCode = presetCode;
    this.isMutable = isMutable;
    this.isDefault = isDefault;
    this.canCreateRepos = canCreateRepos;
    this.canModifyOrganizationSettings = canModifyOrganizationSettings;
    this.canModifyOrganizationDeveloperSettings =
      canModifyOrganizationDeveloperSettings;
    this.canModifyOrganizationMembers = canModifyOrganizationMembers;
    this.canInviteMembers = canInviteMembers;
    this.canModifyInvites = canModifyInvites;
    this.canModifyOwnInternalHandle = canModifyOwnInternalHandle;
    this.canModifyBilling = canModifyBilling;
    this.canModifyOrganizationRoles = canModifyOrganizationRoles;
    this.canAssignRoles = canAssignRoles;


    this.organizationId = organizationId;
    this.createdByUserId = createdByUserId;
    this.createdByOrganizationMemberId = createdByOrganizationMemberId;
  }

  public toModelArgs(): OrganizationRoleModel {
    return {
      name: this.name,
      presetCode: this.presetCode,
      isMutable: this.isMutable,
      isDefault: this.isDefault,
      canCreateRepos: this.canCreateRepos,
      canModifyOrganizationSettings: this.canModifyOrganizationSettings,
      canModifyOrganizationDeveloperSettings:
        this.canModifyOrganizationDeveloperSettings,
      canModifyOrganizationMembers: this.canModifyOrganizationMembers,
      canInviteMembers: this.canInviteMembers,
      canModifyInvites: this.canModifyInvites,
      canModifyOwnInternalHandle: this.canModifyOwnInternalHandle,
      canModifyBilling: this.canModifyBilling,
      canModifyOrganizationRoles: this.canModifyOrganizationRoles,
      canAssignRoles: this.canAssignRoles,
      organizationId: this.organizationId,
      createdByUserId: this.createdByUserId,
      createdByOrganizationMemberId: this.createdByOrganizationMemberId,
    };
  }

  public static createAdminPreset(
    organization: Organization,
    createdByUser: User,
    createdByOrganizationMember: OrganizationMember
  ): OrganizationRolePresetModel {
    return new OrganizationRolePresetModel(
      "Admin", //  name
      "admin", // presetCode
      false,   //  isMutable
      false,   //  isDefault
      true,    //  canCreateRepos
      true,    //  canModifyOrganizationSettings
      true,    //  canModifyOrganizationDeveloperSettings
      true,    //  canModifyOrganizationMembers
      true,    //  canInviteMembers
      true,    //  canModifyInvites
      true,    //  canModifyOwnInternalHandle
      true,    //  canModifyBilling
      true,    //  canModifyOrganizationRoles
      true,    //  canAssignRoles
      organization.id,
      createdByUser.id,
      createdByOrganizationMember.id,
    );
  }

  public static createDefaultContributorPreset(
    organization: Organization,
    createdByUser: User,
    createdByOrganizationMember: OrganizationMember
  ): OrganizationRolePresetModel {
    return new OrganizationRolePresetModel(
      "Contributor", //  name
      "contributor", // presetCode
      true,          //  isMutable
      true,          //  isDefault
      true,          //  canCreateRepos
      false,         //  canModifyOrganizationSettings
      false,         //  canModifyOrganizationDeveloperSettings
      false,         //  canModifyOrganizationMembers
      true,          //  canInviteMembers
      false,         //  canModifyInvites
      true,          //  canModifyOwnInternalHandle
      false,         //  canModifyBilling
      false,         //  canModifyOrganizationRoles
      false,         //  canAssignRoles
      organization.id,
      createdByUser.id,
      createdByOrganizationMember.id,
    );
  }

  public static createBillingAdminPreset(
    organization: Organization,
    createdByUser: User,
    createdByOrganizationMember: OrganizationMember
  ): OrganizationRolePresetModel {
    return new OrganizationRolePresetModel(
      "Billing Admin", //  name
      "billing_admin", // presetCode
      true,            //  isMutable
      false,           //  isDefault
      false,           //  canCreateRepos
      false,           //  canModifyOrganizationSettings
      false,           //  canModifyOrganizationDeveloperSettings
      false,           //  canModifyOrganizationMembers
      false,           //  canInviteMembers
      false,           //  canModifyInvites
      true,            //  canModifyOwnInternalHandle
      true,            //  canModifyBilling
      false,           //  canModifyOrganizationRoles
      false,           //  canAssignRoles
      organization.id,
      createdByUser.id,
      createdByOrganizationMember.id,
    );
  }

  public static createTechnicalAdminPreset(
    organization: Organization,
    createdByUser: User,
    createdByOrganizationMember: OrganizationMember
  ): OrganizationRolePresetModel {
    return new OrganizationRolePresetModel(
      "Technical Admin", //  name
      "technical_admin", //  presetCode
      true,              //  isMutable
      false,             //  isDefault
      true,              //  canCreateRepos
      true,              //  canModifyOrganizationSettings
      true,              //  canModifyOrganizationDeveloperSettings
      false,             //  canModifyOrganizationMembers
      true,              //  canInviteMembers
      true,              //  canModifyInvites
      true,              //  canModifyOwnInternalHandle
      false,             //  canModifyBilling
      true,              //  canModifyOrganizationRoles
      true,              //  canAssignRoles
      organization.id,
      createdByUser.id,
      createdByOrganizationMember.id,
    );
  }
}