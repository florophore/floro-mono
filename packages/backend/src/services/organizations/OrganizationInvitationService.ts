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
import { OrganizationPermissions } from "@floro/graphql-schemas/build/generated/main-graphql";
import OrganizationInvitationsContext from "@floro/database/src/contexts/organizations/OrganizationInvitationsContext";
import { OrganizationRole } from "@floro/database/src/entities/OrganizationRole";
import UserAuthCredentialsContext from "@floro/database/src/contexts/authentication/UserAuthCredentialsContext";
import { OrganizationMember } from "@floro/database/src/entities/OrganizationMember";
import EmailAuthStore from "@floro/redis/src/stores/EmailAuthStore";
import { OrganizationInvitation } from "@floro/database/src/entities/OrganizationInvitation";

const profanityFilter = new ProfanityFilter();

export interface CreateOrganizationInvitationReponse {
  action:
    | "INVITATION_CREATED"
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

@injectable()
export default class OrganizationInvitationService {
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

  public async createInivitation(
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
      // fix this
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
      queryRunner.startTransaction();
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
}
