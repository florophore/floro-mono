import { injectable, inject } from "inversify";

import DatabaseConnection from "@floro/database/src/connection/DatabaseConnection";
import ContextFactory from "@floro/database/src/contexts/ContextFactory";
import { OrganizationMember } from "@floro/database/src/entities/OrganizationMember";
import { User } from "@floro/database/src/entities/User";
import { OrganizationPermissions } from "./OrganizationPermissionService";
import OrganizationRolesContext from "@floro/database/src/contexts/organizations/OrganizationRolesContext";
import { Organization } from "@floro/database/src/entities/Organization";
import { OrganizationRole } from "@floro/database/src/entities/OrganizationRole";
import OrganizationMemberRolesContext from "@floro/database/src/contexts/organizations/OrganizationMemberRolesContext";

export interface CreateOrganizationInvitationReponse {
  action: "ROLE_CREATED" | "FORBIDDEN_ACTION_ERROR" | "INVALID_PARAMS_ERROR";
  organizationRole?: OrganizationRole;
  error?: {
    type: string;
    message: string;
    meta?: unknown;
  };
}

export interface UpdateOrganizationInvitationReponse {
  action:
    | "ROLE_UPDATED"
    | "FORBIDDEN_ACTION_ERROR"
    | "INVALID_PARAMS_ERROR"
    | "INVALID_STATE_ERROR";
  organizationRole?: OrganizationRole;
  error?: {
    type: string;
    message: string;
    meta?: unknown;
  };
}

export interface RemoveOrganizationInvitationReponse {
  action:
    | "ROLE_REMOVED"
    | "FORBIDDEN_ACTION_ERROR"
    | "INVALID_STATE_ERROR"
    | "LOG_ERROR";
  organizationRole?: OrganizationRole;
  error?: {
    type: string;
    message: string;
    meta?: unknown;
  };
}

@injectable()
export default class OrganizationRoleService {
  private databaseConnection!: DatabaseConnection;
  private contextFactory!: ContextFactory;

  constructor(
    @inject(DatabaseConnection) databaseConnection: DatabaseConnection,
    @inject(ContextFactory) contextFactory: ContextFactory
  ) {
    this.databaseConnection = databaseConnection;
    this.contextFactory = contextFactory;
  }

  public async createRole(
    currentMember: OrganizationMember,
    currentMemberPermissions: OrganizationPermissions,
    currentUser: User,
    organization: Organization,
    name: string,
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
    canAssignRoles: boolean
  ): Promise<CreateOrganizationInvitationReponse> {
    if (currentMember.membershipState != "active") {
      return {
        action: "FORBIDDEN_ACTION_ERROR",
        error: {
          type: "FORBIDDEN_ACTION_ERROR",
          message: "Forbidden Action",
        },
      };
    }
    if (!currentMemberPermissions.canModifyOrganizationRoles) {
      return {
        action: "FORBIDDEN_ACTION_ERROR",
        error: {
          type: "FORBIDDEN_ACTION_ERROR",
          message: "Forbidden Action",
        },
      };
    }

    const organizationRolesContext = await this.contextFactory.createContext(
      OrganizationRolesContext
    );
    const rolesForOrg = await organizationRolesContext.getAllForOrg(
      organization
    );
    const roleNames = new Set(
      rolesForOrg.map((role) => role.name.toLowerCase().trim())
    );
    if (roleNames.has(name.toLocaleLowerCase().trim())) {
      return {
        action: "INVALID_PARAMS_ERROR",
        error: {
          type: "INVALID_PARAMS_ERROR",
          message: "Invalid name. Already is use by role.",
        },
      };
    }
    const organizationRole =
      await organizationRolesContext.createOrganizationRole({
        isMutable: true,
        name,
        createdByUserId: currentUser.id,
        createdByOrganizationMemberId: currentMember.id,
        organizationId: organization.id,
        isDefault,
        canCreateRepos,
        canModifyOrganizationSettings,
        canModifyOrganizationDeveloperSettings,
        canModifyOrganizationMembers,
        canInviteMembers,
        canModifyInvites,
        canModifyOwnInternalHandle,
        canModifyBilling,
        canModifyOrganizationRoles,
        canAssignRoles,
      });

    return {
      action: "ROLE_CREATED",
      organizationRole,
    };
  }

  public async updateRole(
    organizationRole: OrganizationRole,
    currentMember: OrganizationMember,
    currentMemberPermissions: OrganizationPermissions,
    organization: Organization,
    name: string,
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
    canAssignRoles: boolean
  ): Promise<UpdateOrganizationInvitationReponse> {
    if (organization.id != organizationRole.organizationId) {
      return {
        action: "FORBIDDEN_ACTION_ERROR",
        error: {
          type: "FORBIDDEN_ACTION_ERROR",
          message: "Forbidden Action",
        },
      };
    }
    if (currentMember.membershipState != "active") {
      return {
        action: "FORBIDDEN_ACTION_ERROR",
        error: {
          type: "FORBIDDEN_ACTION_ERROR",
          message: "Forbidden Action",
        },
      };
    }
    if (!currentMemberPermissions.canModifyOrganizationRoles) {
      return {
        action: "FORBIDDEN_ACTION_ERROR",
        error: {
          type: "FORBIDDEN_ACTION_ERROR",
          message: "Forbidden Action",
        },
      };
    }
    if (!organizationRole.isMutable) {
      return {
        action: "INVALID_STATE_ERROR",
        error: {
          type: "INVALID_STATE_ERROR",
          message: "Role is immutable.",
        },
      };
    }
    const organizationRolesContext = await this.contextFactory.createContext(
      OrganizationRolesContext
    );
    const rolesForOrg = await organizationRolesContext.getAllForOrg(
      organization
    );
    const roleNames = new Set(
      rolesForOrg
        .filter((role) => role.id != organizationRole.id)
        .map((role) => role.name.toLowerCase().trim())
    );
    if (roleNames.has(name.toLocaleLowerCase().trim())) {
      return {
        action: "INVALID_PARAMS_ERROR",
        error: {
          type: "INVALID_PARAMS_ERROR",
          message: "Invalid name. Already is use by role.",
        },
      };
    }
    const updatedOrganizationRole = await organizationRolesContext.updateRole(
      organizationRole,
      {
        name,
        isDefault,
        canCreateRepos,
        canModifyOrganizationSettings,
        canModifyOrganizationDeveloperSettings,
        canModifyOrganizationMembers,
        canInviteMembers,
        canModifyInvites,
        canModifyOwnInternalHandle,
        canModifyBilling,
        canModifyOrganizationRoles,
        canAssignRoles,
      }
    );
    return {
      action: "ROLE_UPDATED",
      organizationRole: updatedOrganizationRole,
    };
  }

  public async removeRole(
    organizationRole: OrganizationRole,
    currentMember: OrganizationMember,
    currentMemberPermissions: OrganizationPermissions,
    organization: Organization
  ): Promise<RemoveOrganizationInvitationReponse> {
    if (organization.id != organizationRole.organizationId) {
      return {
        action: "FORBIDDEN_ACTION_ERROR",
        error: {
          type: "FORBIDDEN_ACTION_ERROR",
          message: "Forbidden Action",
        },
      };
    }

    if (currentMember.membershipState != "active") {
      return {
        action: "FORBIDDEN_ACTION_ERROR",
        error: {
          type: "FORBIDDEN_ACTION_ERROR",
          message: "Forbidden Action",
        },
      };
    }

    if (!currentMemberPermissions.canModifyOrganizationRoles) {
      return {
        action: "FORBIDDEN_ACTION_ERROR",
        error: {
          type: "FORBIDDEN_ACTION_ERROR",
          message: "Forbidden Action",
        },
      };
    }

    if (!organizationRole.isMutable) {
      return {
        action: "INVALID_STATE_ERROR",
        error: {
          type: "INVALID_STATE_ERROR",
          message: "Role is immutable.",
        },
      };
    }

    const queryRunner = await this.databaseConnection.makeQueryRunner();
    try {
      const organizationMemberRolesContext =
        await this.contextFactory.createContext(
          OrganizationMemberRolesContext,
          queryRunner
        );
      const organizationRolesContext = await this.contextFactory.createContext(
        OrganizationRolesContext,
        queryRunner
      );
      await queryRunner.startTransaction();
      await organizationMemberRolesContext.deleteRolesByRole(organizationRole);
      await organizationRolesContext.deleteRole(organizationRole);
      await queryRunner.commitTransaction();
      return {
        action: "ROLE_REMOVED",
        organizationRole,
      };
    } catch (e: any) {
      if (!queryRunner.isReleased) {
        await queryRunner.rollbackTransaction();
      }
      return {
        action: "LOG_ERROR",
        error: {
          type: "UNKNOWN_CREATE_ORGANIZATION_ERROR",
          message: e?.message,
          meta: e,
        },
      };
    } finally {
      if (!queryRunner.isReleased) {
        await queryRunner.release();
      }
    }
  }
}
