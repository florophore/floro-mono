import { injectable, inject } from "inversify";

import DatabaseConnection from "@floro/database/src/connection/DatabaseConnection";
import ContextFactory from "@floro/database/src/contexts/ContextFactory";
import OrganizationMembersContext from "@floro/database/src/contexts/organizations/OrganizationMembersContext";
import OrganizationRolesContext from "@floro/database/src/contexts/organizations/OrganizationRolesContext";
import OrganizationInvitationRolesContext from "@floro/database/src/contexts/organizations/OrganizationInvitationRolesContext";
import { User } from "@floro/database/src/entities/User";
import EmailQueue from "@floro/redis/src/queues/EmailQueue";
import ProfanityFilter from "bad-words";
import { NAME_REGEX } from "@floro/common-web/src/utils/validators";
import EmailHelper from "@floro/database/src/contexts/utils/EmailHelper";
import UsersContext from "@floro/database/src/contexts/users/UsersContext";
import { Organization } from "@floro/database/src/entities/Organization";
import EmailValidator from "email-validator";
import OrganizationInvitationsContext from "@floro/database/src/contexts/organizations/OrganizationInvitationsContext";
import { OrganizationRole } from "@floro/database/src/entities/OrganizationRole";
import UserAuthCredentialsContext from "@floro/database/src/contexts/authentication/UserAuthCredentialsContext";
import { OrganizationMember } from "@floro/database/src/entities/OrganizationMember";
import EmailAuthStore from "@floro/redis/src/stores/EmailAuthStore";
import { OrganizationInvitation } from "@floro/database/src/entities/OrganizationInvitation";
import CreateUserEventHandler from "../events/CreateUserEventHandler";
import { QueryRunner } from "typeorm";
import { OrganizationPermissions } from "./OrganizationPermissionService";
import { UserAuthCredential } from "@floro/database/src/entities/UserAuthCredential";
import OrganizationMemberRolesContext from "@floro/database/src/contexts/organizations/OrganizationMemberRolesContext";
import OrganizationsContext from "@floro/database/src/contexts/organizations/OrganizationsContext";

const profanityFilter = new ProfanityFilter();

export interface CreateOrganizationInvitationReponse {
  action:
    | "INVITATION_CREATED"
    | "NO_REMAINING_SEATS_ERROR"
    | "INVALID_PERMISSIONS_ERROR"
    | "INVALID_PARAMS_ERROR"
    | "FORBIDDEN_ACTION_ERROR"
    | "NO_USER_FOUND_ERROR"
    | "MEMBERSHIP_EXISTS_ERROR"
    | "INVITATION_EXISTS_ERROR"
    | "LOG_ERROR";
  organizationInvitation?: OrganizationInvitation;
  error?: {
    type: string;
    message: string;
    meta?: unknown;
  };
}

export interface RejectOrganizationInvitationReponse {
  action:
    | "INVITATION_REJECTED"
    | "NO_USER_FOUND_ERROR"
    | "INVALID_STATE_ERROR"
    | "LOG_ERROR";
  organizationInvitation?: OrganizationInvitation;
  error?: {
    type: string;
    message: string;
    meta?: unknown;
  };
}

export interface CancelOrganizationInvitationReponse {
  action:
    | "INVITATION_CANCELLED"
    | "INVALID_STATE_ERROR"
    | "FORBIDDEN_ACTION_ERROR"
    | "LOG_ERROR";
  organizationInvitation?: OrganizationInvitation;
  error?: {
    type: string;
    message: string;
    meta?: unknown;
  };
}

export interface ResendOrganizationInvitationReponse {
  action:
    | "INVITATION_RESENT"
    | "INVALID_STATE_ERROR"
    | "FORBIDDEN_ACTION_ERROR"
    | "LOG_ERROR";
  organizationInvitation?: OrganizationInvitation;
  error?: {
    type: string;
    message: string;
    meta?: unknown;
  };
}

export interface AcceptOrganizationInvitationReponse {
  action:
    | "INVITATION_ACCEPTED"
    | "INVALID_STATE_ERROR"
    | "FORBIDDEN_ACTION_ERROR"
    | "NO_USER_FOUND_ERROR"
    | "LOG_ERROR";
  organizationInvitation?: OrganizationInvitation;
  error?: {
    type: string;
    message: string;
    meta?: unknown;
  };
}

export interface UpdatedOrganizationInvitationRolesReponse {
  action:
    | "INVITATION_ROLES_UPDATED"
    | "INVALID_STATE_ERROR"
    | "FORBIDDEN_ACTION_ERROR"
    | "LOG_ERROR";
  organizationInvitation?: OrganizationInvitation;
  error?: {
    type: string;
    message: string;
    meta?: unknown;
  };
}

@injectable()
export default class OrganizationInvitationService
  implements CreateUserEventHandler
{
  private databaseConnection!: DatabaseConnection;
  private contextFactory!: ContextFactory;
  private emailAuthStore!: EmailAuthStore;
  private emailQueue!: EmailQueue;

  constructor(
    @inject(DatabaseConnection) databaseConnection: DatabaseConnection,
    @inject(ContextFactory) contextFactory: ContextFactory,
    @inject(EmailAuthStore) emailAuthStore: EmailAuthStore,
    @inject(EmailQueue) emailQueue: EmailQueue
  ) {
    this.databaseConnection = databaseConnection;
    this.contextFactory = contextFactory;
    this.emailAuthStore = emailAuthStore;
    this.emailQueue = emailQueue;
  }

  public async onUserCreated(
    queryRunner: QueryRunner,
    user: User,
    userAuthCredential: UserAuthCredential
  ): Promise<void> {
    const organizationInvitationsContext =
      await this.contextFactory.createContext(
        OrganizationInvitationsContext,
        queryRunner
      );
    const invitations =
      await organizationInvitationsContext.getInvitationsForEmailHash(
        userAuthCredential.emailHash
      );
    for (const invitation of invitations) {
      await organizationInvitationsContext.updateOrganizationInvitationById(
        invitation.id,
        { userId: user.id }
      );
    }
  }

  public async createInvitation(
    organization: Organization,
    invitingUser: User,
    invitingMember?: OrganizationMember,
    inivitingMemberPermissions?: OrganizationPermissions,
    userId?: string,
    submittedEmail?: string,
    submittedFirstName?: string,
    submittedLastName?: string,
    roleIds: string[] = []
  ): Promise<CreateOrganizationInvitationReponse> {
    if (!inivitingMemberPermissions?.canInviteMembers) {
      return {
        action: "INVALID_PERMISSIONS_ERROR",
        error: {
          type: "INVALID_PERMISSIONS_ERROR",
          message: "Invalid Permissions",
        },
      };
    }

    if (invitingMember?.membershipState != "active") {
      return {
        action: "FORBIDDEN_ACTION_ERROR",
        error: {
          type: "FORBIDDEN_ACTION_ERROR",
          message: "Forbidden Action",
        },
      };
    }

    let isGoogleEmail = false;
    let userExistedAlready = false;
    let normalizedEmail: string;
    let emailHash: string;
    let email: string;
    let firstName: string | undefined;
    let lastName: string | undefined;
    if (submittedEmail && !userId) {
      if (!EmailValidator.validate(submittedEmail)) {
        return {
          action: "INVALID_PARAMS_ERROR",
          error: {
            type: "INVALID_PARAMS_ERROR",
            message: "No user or email present",
          },
        };
      }
      isGoogleEmail = await EmailHelper.isGoogleEmail(submittedEmail);
    }
    if (!userId && !submittedEmail) {
      return {
        action: "INVALID_PARAMS_ERROR",
        error: {
          type: "INVALID_PARAMS_ERROR",
          message: "No user or email present",
        },
      };
    }

    const queryRunner = await this.databaseConnection.makeQueryRunner();
    try {
      const usersContext = await this.contextFactory.createContext(
        UsersContext,
        queryRunner
      );
      const userAuthCredentialsContext =
        await this.contextFactory.createContext(
          UserAuthCredentialsContext,
          queryRunner
        );
      const organizationInvitationsContext =
        await this.contextFactory.createContext(
          OrganizationInvitationsContext,
          queryRunner
        );
      const organizationInvitationsRolesContext =
        await this.contextFactory.createContext(
          OrganizationInvitationRolesContext,
          queryRunner
        );
      const organizationMembersContext =
        await this.contextFactory.createContext(
          OrganizationMembersContext,
          queryRunner
        );
      const organizationRolesContext = await this.contextFactory.createContext(
        OrganizationRolesContext,
        queryRunner
      );
      let user: User | null = null;
      await queryRunner.startTransaction();

      if (organization?.billingPlan == "free") {
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
          return {
            action: "NO_REMAINING_SEATS_ERROR",
            error: {
              type: "NO_REMAINING_SEATS_ERROR",
              message: "No remaining seats",
            },
          };
        }
      }

      if (userId) {
        user = await usersContext.getById(userId);
        if (!user) {
          await queryRunner.rollbackTransaction();
          return {
            action: "NO_USER_FOUND_ERROR",
            error: {
              type: "NO_USER_FOUND_ERROR",
              message: "No user found",
            },
          };
        }
        const credentials =
          await userAuthCredentialsContext.getCredentialsByUserId(userId);
        email = credentials[0].email;
        emailHash = credentials[0].emailHash;
        normalizedEmail = credentials[0].normalizedEmail;
      } else {
        email = submittedEmail as string;
        emailHash = EmailHelper.getEmailHash(email, isGoogleEmail);
        normalizedEmail = EmailHelper.getUniqueEmail(email, isGoogleEmail);
        const credentials =
          await userAuthCredentialsContext.getCredentialsByEmailHash(emailHash);
        const userIdFromCredentials =
          await userAuthCredentialsContext.getUserIdFromCredentials(
            credentials
          );
        if (userIdFromCredentials) {
          user = await usersContext.getById(userIdFromCredentials);
        }
      }
      if (user) {
        const existingInvitation =
          await organizationInvitationsContext.getByOrgAndUser(
            organization,
            user
          );
        if (
          existingInvitation?.invitationState == "sent" ||
          existingInvitation?.invitationState == "accepted"
        ) {
          await queryRunner.rollbackTransaction();
          return {
            action: "INVITATION_EXISTS_ERROR",
            error: {
              type: "INVITATION_EXISTS_ERROR",
              message: "Invitation already exists",
            },
          };
        }

        const existingMembership =
          await organizationMembersContext.getByOrgAndUser(organization, user);

        if (existingMembership) {
          await queryRunner.rollbackTransaction();
          return {
            action: "MEMBERSHIP_EXISTS_ERROR",
            error: {
              type: "MEMBERSHIP_EXISTS_ERROR",
              message: "Membership already exists",
            },
          };
        }
        firstName = user.firstName;
        lastName = user.lastName;
        userExistedAlready = true;
      }

      if (!user) {
        // validate params here
        if (!submittedFirstName) {
          await queryRunner.rollbackTransaction();
          return {
            action: "INVALID_PARAMS_ERROR",
            error: {
              type: "INVALID_PARAMS_ERROR",
              message: "Missing first name",
            },
          };
        }

        if (
          !NAME_REGEX.test(submittedFirstName ?? "") ||
          profanityFilter.isProfane(submittedFirstName)
        ) {
          await queryRunner.rollbackTransaction();
          return {
            action: "INVALID_PARAMS_ERROR",
            error: {
              type: "INVALID_PARAMS_ERROR",
              message: "Invalid first name",
            },
          };
        }

        if (
          submittedLastName &&
          (!NAME_REGEX.test(submittedLastName ?? "") ||
            profanityFilter.isProfane(submittedLastName))
        ) {
          await queryRunner.rollbackTransaction();
          return {
            action: "INVALID_PARAMS_ERROR",
            error: {
              type: "INVALID_PARAMS_ERROR",
              message: "Invalid last name",
            },
          };
        }
        firstName = submittedFirstName;
        lastName = submittedLastName;
        // only do this if no email credentials
        const credentials =
          await userAuthCredentialsContext.getCredentialsByEmail(
            email,
            isGoogleEmail
          );
        const existingCredential =
          userAuthCredentialsContext.getEmailCredential(credentials);
        if (!existingCredential) {
          await userAuthCredentialsContext.createEmailCredential(email, true);
        }
      }

      const organizationRoles = await organizationRolesContext.getAllForOrg(
        organization
      );
      const assignedRoles: OrganizationRole[] = [];
      if (inivitingMemberPermissions.canAssignRoles) {
        organizationRoles.forEach((role) => {
          if (roleIds.includes(role.id)) {
            assignedRoles.push(role);
          }
        });
      } else {
        organizationRoles.forEach((role) => {
          if (role.isDefault) {
            assignedRoles.push(role);
          }
        });
      }
      const organizationInvitation =
        await organizationInvitationsContext.createOrganizationInvitation({
          userId: user?.id,
          invitedByUserId: invitingUser.id,
          invitedByOrganizationMemberId: invitingMember.id,
          organizationId: organization.id,
          invitationState: "sent",
          userExistedAlready,
          firstName,
          lastName,
          email,
          normalizedEmail,
          emailHash,
        });

      for (const organizationRole of assignedRoles) {
        await organizationInvitationsRolesContext.createOrganizationRole({
          organizationId: organization.id,
          organizationInvitationId: organizationInvitation.id,
          organizationRoleId: organizationRole.id,
        });
      }
      const authorization = await this.emailAuthStore.createEmailAuth(
        email,
        firstName,
        lastName
      );
      const link = this.emailAuthStore.link(authorization, "web");
      await this.emailQueue?.add({
        jobId: authorization.id,
        template: "OrganizationInvitationEmail",
        props: {
          link,
          firstName,
          invitingUserFirstName: invitingUser.firstName,
          invitingUserLastName: invitingUser.lastName,
          organizationName: organization.name,
          userExistedAlready,
        },
        to: email,
        from: "invites@floro.io",
        subject: "Floro Invitation to " + organization.name,
      });

      await queryRunner.commitTransaction();
      return {
        action: "INVITATION_CREATED",
        organizationInvitation,
      };
    } catch (e: any) {
      if (!queryRunner.isReleased) {
        await queryRunner?.rollbackTransaction?.();
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
        queryRunner.release();
      }
    }
  }

  public async acceptInvitation(
    organizationInvitation: OrganizationInvitation,
    currentUser: User
  ): Promise<AcceptOrganizationInvitationReponse> {
    if (currentUser?.id != organizationInvitation?.userId) {
      return {
        action: "NO_USER_FOUND_ERROR",
        error: {
          type: "NO_USER_FOUND_ERROR",
          message: "No user found",
        },
      };
    }

    if (organizationInvitation.invitationState != "sent") {
      return {
        action: "INVALID_STATE_ERROR",
        error: {
          type: "INVALID_STATE_ERROR",
          message: "Invalid invitation state",
        },
      };
    }
    const queryRunner = await this.databaseConnection.makeQueryRunner();
    try {
      const organizationsContext = await this.contextFactory.createContext(
        OrganizationsContext,
        queryRunner
      );
      const organizationInvitationsContext =
        await this.contextFactory.createContext(
          OrganizationInvitationsContext,
          queryRunner
        );
      const organizationInvitationsRolesContext =
        await this.contextFactory.createContext(
          OrganizationInvitationRolesContext,
          queryRunner
        );
      const organizationMembersContext =
        await this.contextFactory.createContext(
          OrganizationMembersContext,
          queryRunner
        );

      const organizationMemberRolesContext =
        await this.contextFactory.createContext(
          OrganizationMemberRolesContext,
          queryRunner
        );

      await queryRunner.startTransaction();
      const organization = await organizationsContext.getById(
        organizationInvitation.organizationId
      );
      if (!organization) {
        await queryRunner?.rollbackTransaction();
        return {
          action: "LOG_ERROR",
          error: {
            type: "UNKNOWN_ERROR",
            message: "Organization not found",
          },
        };
      }

      const organizationMember =
        await organizationMembersContext.createOrganizationMember({
          organizationId: organization.id,
          membershipState: "active",
          userId: currentUser.id,
        });
      const roles =
        await organizationInvitationsRolesContext.getRolesByInvitation(
          organizationInvitation
        );
      for (const role of roles) {
        await organizationMemberRolesContext.createOrganizationRole({
          organizationId: organization.id,
          organizationMemberId: organizationMember.id,
          organizationRoleId: role.id,
        });
      }

      const acceptedInvitation =
        await organizationInvitationsContext.acceptInvite(
          organizationInvitation
        );
      if (!acceptedInvitation) {
        await queryRunner?.rollbackTransaction();
        return {
          action: "LOG_ERROR",
          error: {
            type: "UNKNOWN_ERROR",
            message: "Invitation not accepted",
          },
        };
      }
      await queryRunner?.commitTransaction();
      return {
        action: "INVITATION_ACCEPTED",
        organizationInvitation: acceptedInvitation,
      };
    } catch (e: any) {
      if (!queryRunner.isReleased) {
        await queryRunner?.rollbackTransaction?.();
      }
      return {
        action: "LOG_ERROR",
        error: {
          type: "UNKNOWN_ACCEPT_INVITATION_ERROR",
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

  public async rejectInvitation(
    organizationInvitation: OrganizationInvitation,
    currentUser: User
  ): Promise<RejectOrganizationInvitationReponse> {
    if (currentUser?.id != organizationInvitation?.userId) {
      return {
        action: "NO_USER_FOUND_ERROR",
        error: {
          type: "NO_USER_FOUND_ERROR",
          message: "No user found",
        },
      };
    }

    if (organizationInvitation.invitationState != "sent") {
      return {
        action: "INVALID_STATE_ERROR",
        error: {
          type: "INVALID_STATE_ERROR",
          message: "Invalid invitation state",
        },
      };
    }
    const organizationInvitationsContext =
      await this.contextFactory.createContext(OrganizationInvitationsContext);
    const rejectedInvitation =
      await organizationInvitationsContext.cancelInvite(organizationInvitation);
    if (!rejectedInvitation) {
      return {
        action: "LOG_ERROR",
        error: {
          type: "UNKNOWN_ERROR",
          message: "Invitation not cancelled",
        },
      };
    }
    return {
      action: "INVITATION_REJECTED",
      organizationInvitation: rejectedInvitation,
    };
  }

  public async cancelInvitation(
    organizationInvitation: OrganizationInvitation,
    currentMember: OrganizationMember,
    permissions: OrganizationPermissions
  ): Promise<CancelOrganizationInvitationReponse> {
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

    if (organizationInvitation.invitationState != "sent") {
      return {
        action: "INVALID_STATE_ERROR",
        error: {
          type: "INVALID_STATE_ERROR",
          message: "Invalid invitation state",
        },
      };
    }

    const organizationInvitationsContext =
      await this.contextFactory.createContext(OrganizationInvitationsContext);
    const cancelledInvitation =
      await organizationInvitationsContext.cancelInvite(organizationInvitation);
    if (!cancelledInvitation) {
      return {
        action: "LOG_ERROR",
        error: {
          type: "UNKNOWN_ERROR",
          message: "Invitation not cancelled",
        },
      };
    }
    return {
      action: "INVITATION_CANCELLED",
      organizationInvitation: cancelledInvitation,
    };
  }

  public async resendInvitation(
    organizationInvitation: OrganizationInvitation,
    organization: Organization,
    currentUser: User,
    currentMember: OrganizationMember,
    permissions: OrganizationPermissions
  ): Promise<ResendOrganizationInvitationReponse> {
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

    if (organizationInvitation.invitationState != "sent") {
      return {
        action: "INVALID_STATE_ERROR",
        error: {
          type: "INVALID_STATE_ERROR",
          message: "Invalid invitation state",
        },
      };
    }
    const authorization = await this.emailAuthStore.createEmailAuth(
      organizationInvitation.email,
      organizationInvitation.firstName,
      organizationInvitation.lastName
    );
    const link = this.emailAuthStore.link(authorization, "web");
    await this.emailQueue?.add({
      jobId: authorization.id,
      template: "OrganizationInvitationEmail",
      props: {
        link,
        firstName: organizationInvitation.firstName,
        invitingUserFirstName: currentUser.firstName,
        invitingUserLastName: currentUser.lastName,
        organizationName: organization.name,
        userExistedAlready: !!organizationInvitation.userId,
      },
      to: organizationInvitation.email,
      from: "invites@floro.io",
      subject: "Floro Invitation to " + organization.name,
    });

    return {
      action: "INVITATION_RESENT",
      organizationInvitation,
    };
  }

  public async updateInvitationRoles(
    organizationInvitation: OrganizationInvitation,
    organization: Organization,
    currentMember: OrganizationMember,
    permissions: OrganizationPermissions,
    roleIds: string[]
  ): Promise<UpdatedOrganizationInvitationRolesReponse> {
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

    if (!permissions.canAssignRoles) {
      return {
        action: "FORBIDDEN_ACTION_ERROR",
        error: {
          type: "FORBIDDEN_ACTION_ERROR",
          message: "Forbidden Action",
        },
      };
    }

    if (organizationInvitation.invitationState != "sent") {
      return {
        action: "INVALID_STATE_ERROR",
        error: {
          type: "INVALID_STATE_ERROR",
          message: "Invalid invitation state",
        },
      };
    }
    const queryRunner = await this.databaseConnection.makeQueryRunner();
    try {
      const organizationInvitationsRolesContext =
        await this.contextFactory.createContext(
          OrganizationInvitationRolesContext,
          queryRunner
        );
      const organizationRolesContext = await this.contextFactory.createContext(
        OrganizationRolesContext,
        queryRunner
      );

      await queryRunner.startTransaction();
      await organizationInvitationsRolesContext.deleteRolesForInvitation(
        organizationInvitation
      );
      const organizationRoles = await organizationRolesContext.getAllForOrg(
        organization
      );
      const assignedRoles: OrganizationRole[] = [];
      organizationRoles.forEach((role) => {
        if (roleIds.includes(role.id)) {
          assignedRoles.push(role);
        }
      });
      for (const organizationRole of assignedRoles) {
        await organizationInvitationsRolesContext.createOrganizationRole({
          organizationId: organization.id,
          organizationInvitationId: organizationInvitation.id,
          organizationRoleId: organizationRole.id,
        });
      }
      await queryRunner.commitTransaction();
      return {
        action: "INVITATION_ROLES_UPDATED",
        organizationInvitation,
      };
    } catch (e: any) {
      if (!queryRunner.isReleased) {
        await queryRunner?.rollbackTransaction?.();
      }
      return {
        action: "LOG_ERROR",
        error: {
          type: "UNKNOWN_INVITATION_ROLE_UPDATE_ERROR",
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