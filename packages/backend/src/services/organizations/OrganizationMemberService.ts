import { injectable, inject } from "inversify";

import DatabaseConnection from "@floro/database/src/connection/DatabaseConnection";
import ContextFactory from "@floro/database/src/contexts/ContextFactory";
import OrganizationMembersContext from "@floro/database/src/contexts/organizations/OrganizationMembersContext";
import OrganizationRolesContext from "@floro/database/src/contexts/organizations/OrganizationRolesContext";
import { USERNAME_REGEX } from "@floro/common-web/src/utils/validators";
import { Organization } from "@floro/database/src/entities/Organization";
import OrganizationInvitationsContext from "@floro/database/src/contexts/organizations/OrganizationInvitationsContext";
import { OrganizationRole } from "@floro/database/src/entities/OrganizationRole";
import { OrganizationMember } from "@floro/database/src/entities/OrganizationMember";
import { OrganizationPermissions } from "./OrganizationPermissionService";
import OrganizationMemberRolesContext from "@floro/database/src/contexts/organizations/OrganizationMemberRolesContext";
import ProfanityFilter from "bad-words";

const profanityFilter = new ProfanityFilter();
const PAGE_SIZE = 10;

export interface DeactivateOrganizationMemberResponse {
  action:
    | "MEMBER_DEACTIVATED"
    | "FORBIDDEN_ACTION_ERROR"
    | "INVALID_STATE_ERROR"
    | "LOG_ERROR";
  organizationMember?: OrganizationMember;
  error?: {
    type: string;
    message: string;
    meta?: unknown;
  };
}
export interface ReactivateOrganizationMemberResponse {
  action:
    | "MEMBER_REACTIVATED"
    | "FORBIDDEN_ACTION_ERROR"
    | "INVALID_STATE_ERROR"
    | "NO_REMAINING_SEATS_ERROR"
    | "LOG_ERROR";
  organizationMember?: OrganizationMember;
  error?: {
    type: string;
    message: string;
    meta?: unknown;
  };
}
export interface UpdateOrganizationMemberResponse {
  action:
    | "MEMBER_UPDATED"
    | "FORBIDDEN_ACTION_ERROR"
    | "INVALID_PARAMS_ERROR"
    | "NO_REMAINING_SEATS_ERROR"
    | "LOG_ERROR";
  organizationMember?: OrganizationMember;
  error?: {
    type: string;
    message: string;
    meta?: unknown;
  };
}

@injectable()
export default class OrganizationMemberService {
  private databaseConnection!: DatabaseConnection;
  private contextFactory!: ContextFactory;

  constructor(
    @inject(DatabaseConnection) databaseConnection: DatabaseConnection,
    @inject(ContextFactory) contextFactory: ContextFactory
  ) {
    this.databaseConnection = databaseConnection;
    this.contextFactory = contextFactory;
  }

  public getPaginatedMembersResult(memebers: OrganizationMember[], id: string, query: string, filterDeactivated?: boolean) {
    const lowerCaseQuery = (query ?? "").trim();
    const isSearching = lowerCaseQuery == "";
    const out: Array<OrganizationMember> = [];
    const sortedMembers = memebers?.filter(m => {
      if (!filterDeactivated) {
        return true;
      }
      return m.membershipState == "active";
    }).sort((a, b) => {
      const aName = `${a.user?.firstName} ${a.user?.lastName}`.toLowerCase();
      const bName = `${b.user?.firstName} ${b.user?.lastName}`.toLowerCase();
      return aName >= bName ? 1 : -1;
    });
    if (isSearching) {
      for (const member of sortedMembers) {
        const fullname = `${member.user?.firstName} ${member.user?.lastName}`.toLowerCase();
        const username = `${member.user?.username}`.toLowerCase();
        if (`@${username}`.indexOf(lowerCaseQuery) != -1 || username.indexOf(lowerCaseQuery) != -1) {
          out.push(member);
        } else if (fullname.indexOf(lowerCaseQuery) != -1) {
          out.push(member);
        }
        if (out.length == PAGE_SIZE) {
          return {
            id: null,
            nextId: null,
            lastId: null,
            memebers: out
          }
        }
      }
      return {
        id: null,
        nextId: null,
        lastId: null,
        memebers: out
      }
    }

    let found = !id;
    let lastId:string|null = null;
    for (let i = 0; i < sortedMembers.length; ++i) {
      const memeber = sortedMembers[i];
      if(found) {
        out.push(memeber);
        if (out.length == sortedMembers.length) {
          return {
            id: memeber?.id,
            nextId: sortedMembers[i + 1]?.id,
            lastId,
            memebers: out
          }
        }
        continue;
      }
      if (memeber.id == id) {
        lastId = sortedMembers[i - 1]?.id;
        found = true;
        out.push(memeber);
      }
    }
    return {
      id: out[out.length - 1]?.id,
      nextId: null,
      lastId,
      memebers: out
    }
  }

  public async deactivateMember(
    organizationMember: OrganizationMember,
    organization: Organization,
    currentMember: OrganizationMember,
    permissions: OrganizationPermissions
  ): Promise<DeactivateOrganizationMemberResponse> {
    if (organizationMember.id == currentMember.id) {
      // CANNOT DEACTIVATE SELF
      return {
        action: "INVALID_STATE_ERROR",
        error: {
          type: "INVALID_STATE_ERROR",
          message: "Cannot deactivate self",
        },
      };
    }
    // cannot deactivate self
    // cannot deactivate if last admin
    if (currentMember.membershipState != "active") {
      return {
        action: "FORBIDDEN_ACTION_ERROR",
        error: {
          type: "FORBIDDEN_ACTION_ERROR",
          message: "Forbidden Action",
        },
      };
    }

    if (!permissions.canModifyInvites) {
      return {
        action: "FORBIDDEN_ACTION_ERROR",
        error: {
          type: "FORBIDDEN_ACTION_ERROR",
          message: "Forbidden Action",
        },
      };
    }

    if (organizationMember.membershipState != "active") {
      return {
        action: "INVALID_STATE_ERROR",
        error: {
          type: "INVALID_STATE_ERROR",
          message: "Invalid membership state",
        },
      };
    }
    const organizationMembersContext = await this.contextFactory.createContext(
      OrganizationMembersContext
    );
    const organizationMemberRolesContext =
      await this.contextFactory.createContext(OrganizationMemberRolesContext);
    const organizationRolesContext = await this.contextFactory.createContext(
      OrganizationRolesContext
    );
    const roles = await organizationRolesContext.getAllForOrg(
      organization as Organization
    );
    const adminRole = roles.find((role) => role.presetCode == "admin");
    const memberRoles = await organizationMemberRolesContext.getRolesForOrg(
      organization
    );
    const activeMemberRoles = memberRoles?.filter((organizationMemberRole) => {
      return (
        organizationMemberRole?.organizationMember?.membershipState ==
          "active" && organizationMemberRole.organizationRoleId == adminRole?.id
      );
    });
    if (
      activeMemberRoles.length == 1 &&
      activeMemberRoles[0].id == organizationMember.id
    ) {
      return {
        action: "INVALID_STATE_ERROR",
        error: {
          type: "INVALID_STATE_ERROR",
          message: "Cannot deactivate last active admin",
        },
      };
    }
    const deactivatedMember =
      await organizationMembersContext.deactivateMembership(organizationMember);
    if (!deactivatedMember) {
      return {
        action: "LOG_ERROR",
        error: {
          type: "UNKNOWN_DEACTIVATION_ERROR",
          message: "Organization member not deactivated",
        },
      };
    }
    return {
      action: "MEMBER_DEACTIVATED",
      organizationMember: deactivatedMember,
    };
  }

  public async reactivateMember(
    organizationMember: OrganizationMember,
    organization: Organization,
    currentMember: OrganizationMember,
    permissions: OrganizationPermissions
  ): Promise<ReactivateOrganizationMemberResponse> {
    if (currentMember.membershipState != "active") {
      return {
        action: "FORBIDDEN_ACTION_ERROR",
        error: {
          type: "FORBIDDEN_ACTION_ERROR",
          message: "Forbidden Action",
        },
      };
    }

    if (!permissions.canModifyInvites) {
      return {
        action: "FORBIDDEN_ACTION_ERROR",
        error: {
          type: "FORBIDDEN_ACTION_ERROR",
          message: "Forbidden Action",
        },
      };
    }

    if (organizationMember.membershipState != "inactive") {
      return {
        action: "INVALID_STATE_ERROR",
        error: {
          type: "INVALID_STATE_ERROR",
          message: "Invalid membership state",
        },
      };
    }
    const queryRunner = await this.databaseConnection.makeQueryRunner();
    try {
      const organizationMembersContext =
        await this.contextFactory.createContext(
          OrganizationMembersContext,
          queryRunner
        );

      const organizationInvitationsContext =
        await this.contextFactory.createContext(
          OrganizationInvitationsContext,
          queryRunner
        );

      await queryRunner.startTransaction();

      if (organization.billingPlan == "free") {
        const activeMemberCount =
          await organizationMembersContext.getMemberCountForOrganization(
            organization.id as string
          );
        const sentInviteCount =
          await organizationInvitationsContext.getSentInvitationCountForOrganization(
            organization.id as string
          );
        const remainingSeats =
          (organization?.freeSeats ?? 10) -
          (activeMemberCount + sentInviteCount);
        if (remainingSeats <= 0) {
          await queryRunner.rollbackTransaction();
          return {
            action: "NO_REMAINING_SEATS_ERROR",
            error: {
              type: "NO_REMAINING_SEATS_ERROR",
              message: "No remaining seats",
            },
          };
        }
      }

      const reactivatedMember =
        await organizationMembersContext.reactivateMembership(
          organizationMember
        );
      if (!reactivatedMember) {
        await queryRunner.rollbackTransaction();
        return {
          action: "LOG_ERROR",
          error: {
            type: "UNKNOWN_ERROR",
            message: "Organization member not deactivated",
          },
        };
      }
      await queryRunner.commitTransaction();
      return {
        action: "MEMBER_REACTIVATED",
        organizationMember: reactivatedMember,
      };
    } catch (e: any) {
      if (!queryRunner.isReleased) {
        await queryRunner?.rollbackTransaction?.();
      }
      return {
        action: "LOG_ERROR",
        error: {
          type: "UNKNOWN_REACTIVATION_ERROR",
          message: e?.message,
          meta: e,
        },
      };
    } finally {
      if (!queryRunner.isReleased) {
        queryRunner.release();
      }
    }
  }

  public async updateOrganizationMember(
    organizationMember: OrganizationMember,
    organization: Organization,
    currentMember: OrganizationMember,
    permissions: OrganizationPermissions,
    submittedInternalHandle?: string,
    submittedRoleIds?: string[]
  ): Promise<UpdateOrganizationMemberResponse> {
    if (currentMember.membershipState != "active") {
      return {
        action: "FORBIDDEN_ACTION_ERROR",
        error: {
          type: "FORBIDDEN_ACTION_ERROR",
          message: "Forbidden Action",
        },
      };
    }
    const queryRunner = await this.databaseConnection.makeQueryRunner();
    try {
      await queryRunner.startTransaction();
      const organizationMembersContext =
        await this.contextFactory.createContext(
          OrganizationMembersContext,
          queryRunner
        );
      if (
        submittedInternalHandle &&
        (permissions.canModifyOrganizationMembers ||
          (permissions.canModifyOwnInternalHandle &&
            currentMember.id == currentMember.id))
      ) {
        const members =
          await organizationMembersContext.getAllMembersForOrganization(
            organization.id as string
          );
        const reservedNames = new Set([
          organization.handle?.trim()?.toLowerCase(),
        ]);
        members.forEach((member) => {
          if (member.internalHandle) {
            reservedNames.add(member.internalHandle?.trim?.().toLowerCase?.());
          }
          reservedNames.add(member.user?.username?.trim?.()?.toLowerCase?.());
        });
        if (!reservedNames.has(submittedInternalHandle)) {
          // valid username for profanity regex here
          if (
            !USERNAME_REGEX.test(submittedInternalHandle) ||
            profanityFilter.isProfane(submittedInternalHandle)
          ) {
            await queryRunner.rollbackTransaction();
            return {
              action: "INVALID_PARAMS_ERROR",
              error: {
                type: "INVALID_PARAMS_ERROR",
                message: "Invalid internal handle params",
              },
            };
          }
          await organizationMembersContext.updateInternalHandle(
            organization,
            organizationMember,
            submittedInternalHandle.trim()
          );
        }
      }
      if (
        submittedRoleIds &&
        permissions.canModifyOrganizationMembers &&
        permissions.canAssignRoles
      ) {
        // 1) we need to check if they are an admin.
        // 2) we need to ensure they are not the last admin
        const organizationRolesContext =
          await this.contextFactory.createContext(
            OrganizationRolesContext,
            queryRunner
          );
        const organizationMemberRolesContext =
          await this.contextFactory.createContext(
            OrganizationMemberRolesContext,
            queryRunner
          );
        const roles = await organizationRolesContext.getAllForOrg(
          organization as Organization
        );
        const adminRole = roles.find((role) => role.presetCode == "admin");
        const memberRoles = await organizationMemberRolesContext.getRolesForOrg(
          organization
        );
        const activeMemberRoles = memberRoles?.filter(
          (organizationMemberRole) => {
            return (
              organizationMemberRole?.organizationMember?.membershipState ==
                "active" &&
              organizationMemberRole.organizationRoleId == adminRole?.id
            );
          }
        );
        if (
          activeMemberRoles.length > 1 ||
          activeMemberRoles[0]?.organizationMemberId != organizationMember.id ||
          submittedRoleIds?.includes(adminRole?.id as string)
        ) {
          await organizationMemberRolesContext.deleteRolesForMember(
            organizationMember
          );
          const assignedRoles: OrganizationRole[] = [];
          roles.forEach((role) => {
            if (submittedRoleIds.includes(role.id)) {
              assignedRoles.push(role);
            }
          });
          for (const role of assignedRoles) {
            await organizationMemberRolesContext.createOrganizationRole({
              organizationId: organization.id,
              organizationMemberId: organizationMember.id,
              organizationRoleId: role.id,
            });
          }
        }
      }
      const refreshedMember = await organizationMembersContext.getById(
        organizationMember.id
      );
      if (!refreshedMember) {
        await queryRunner.rollbackTransaction();
        return {
          action: "LOG_ERROR",
          error: {
            type: "UNKNOWN_ERROR",
            message: "Organization member not updated",
          },
        };
      }
      await queryRunner.commitTransaction();
      return {
        action: "MEMBER_UPDATED",
        organizationMember: refreshedMember,
      };
    } catch (e: any) {
      if (!queryRunner.isReleased) {
        await queryRunner?.rollbackTransaction?.();
      }
      return {
        action: "LOG_ERROR",
        error: {
          type: "UNKNOWN_UPDATE_MEMBERSHIP_ERROR",
          message: e?.message,
          meta: e,
        },
      };
    } finally {
      if (!queryRunner.isReleased) {
        queryRunner.release();
      }
    }
  }
}
