import { injectable, inject } from "inversify";

import DatabaseConnection from "@floro/database/src/connection/DatabaseConnection";
import ContextFactory from "@floro/database/src/contexts/ContextFactory";
import OrganizationsContext from "@floro/database/src/contexts/organizations/OrganizationsContext";
import OrganizationMembersContext from "@floro/database/src/contexts/organizations/OrganizationMembersContext";
import OrganizationRolesContext from "@floro/database/src/contexts/organizations/OrganizationRolesContext";
import OrganizationMemberRolesContext from "@floro/database/src/contexts/organizations/OrganizationMemberRolesContext";
import { User } from "@floro/database/src/entities/User";
import EmailQueue from "@floro/redis/src/queues/EmailQueue";
import ProfanityFilter from "bad-words";
import {
  NAME_REGEX,
  USERNAME_REGEX,
} from "@floro/common-web/src/utils/validators";
import EmailHelper from "@floro/database/src/contexts/utils/EmailHelper";
import UsersContext from "@floro/database/src/contexts/users/UsersContext";
import HandleChecker from "../utils/HandleChecker";
import { Organization } from "@floro/database/src/entities/Organization";
import OrganizationRolePresetModel from "./presets/OrganizationRolePresetModel";
import EmailValidator from 'email-validator';

const profanityFilter = new ProfanityFilter();

export interface CreateOrganizationReponse {
  action:
    | "ORGANIZATION_CREATED"
    | "HANDLE_TAKEN"
    | "INVALID_PARAMS"
    | "LOG_ERROR";
  organization?: Organization;
  error?: {
    type: string;
    message: string;
    meta?: any;
  };
}

@injectable()
export default class OrganizationService {
  private databaseConnection!: DatabaseConnection;
  private contextFactory!: ContextFactory;
  private emailQueue?: EmailQueue;

  constructor(
    @inject(DatabaseConnection) databaseConnection: DatabaseConnection,
    @inject(ContextFactory) contextFactory: ContextFactory,
    @inject(EmailQueue) emailQueue: EmailQueue
  ) {
    this.databaseConnection = databaseConnection;
    this.contextFactory = contextFactory;
    this.emailQueue = emailQueue;
  }

  public async createOrg(
    name: string,
    legalName: string,
    handle: string,
    contactEmail: string,
    agreedToCustomerServiceAgreement: boolean,
    currentUser: User
  ) {
    const queryRunner = await this.databaseConnection.makeQueryRunner();
    try {
      await queryRunner.startTransaction();
      const organizationsContext = await this.contextFactory.createContext(
        OrganizationsContext,
        queryRunner
      );
      const usersContext = await this.contextFactory.createContext(
        UsersContext,
        queryRunner
      );
      const isValid =
        agreedToCustomerServiceAgreement &&
        USERNAME_REGEX.test(handle) &&
        NAME_REGEX.test(name) &&
        NAME_REGEX.test(legalName) &&
        EmailValidator.validate(contactEmail) &&
        !profanityFilter.isProfane(handle) &&
        !profanityFilter.isProfane(name) &&
        !profanityFilter.isProfane(legalName);
      if (!isValid) {
        await queryRunner.rollbackTransaction();
        return {
          action: "INVALID_PARAMS",
          error: {
            type: "INVALID_PARAMS",
            message: "Invalid params",
            meta: { currentUserId: currentUser.id },
          },
        };
      }
      const handleChecker = new HandleChecker(
        usersContext,
        organizationsContext
      );
      const handleIsTaken = await handleChecker.usernameOrHandleTaken(handle);
      if (handleIsTaken) {
        await queryRunner.rollbackTransaction();
        return {
          action: "HANDLE_TAKEN",
          error: {
            type: "HANDLE_TAKEN",
            message: "Handle taken",
            meta: { currentUserId: currentUser.id },
          },
        };
      }
      const isGoogleEmail = await EmailHelper.isGoogleEmail(contactEmail);
      const normalizedContactEmail = EmailHelper.getUniqueEmail(
        contactEmail,
        isGoogleEmail
      );
      const contactEmailHash = EmailHelper.getUniqueEmail(
        contactEmail,
        isGoogleEmail
      );
      const organization = await organizationsContext.createOrganization({
        name,
        legalName,
        handle,
        contactEmail,
        normalizedContactEmail,
        contactEmailHash,
        agreedToCustomerServiceAgreement,
        createdByUserId: currentUser.id,
      });
      const organizationMembersContext =
        await this.contextFactory.createContext(
          OrganizationMembersContext,
          queryRunner
        );
      const organizationMember =
        await organizationMembersContext.createOrganizationMember({
          organizationId: organization.id,
          membershipState: "active",
          userId: currentUser.id,
        });
      const organizationRolesContext = await this.contextFactory.createContext(
        OrganizationRolesContext,
        queryRunner
      );
      // CREATE PRESETS
      const adminRoleArgs = OrganizationRolePresetModel.createAdminPreset(
        organization,
        currentUser,
        organizationMember
      );
      const adminRole = await organizationRolesContext.createOrganizationRole(
        adminRoleArgs
      );
      const contributorRoleArgs =
        OrganizationRolePresetModel.createDefaultContributorPreset(
          organization,
          currentUser,
          organizationMember
        ).toModelArgs();
      await organizationRolesContext.createOrganizationRole(
        contributorRoleArgs
      );
      const technicalAdminRoleArgs =
        OrganizationRolePresetModel.createTechnicalAdminPreset(
          organization,
          currentUser,
          organizationMember
        ).toModelArgs();
      await organizationRolesContext.createOrganizationRole(
        technicalAdminRoleArgs
      );
      const billingAdminRoleArgs =
        OrganizationRolePresetModel.createBillingAdminPreset(
          organization,
          currentUser,
          organizationMember
        ).toModelArgs();
      await organizationRolesContext.createOrganizationRole(
        billingAdminRoleArgs
      );
      const organizationMemberRolesContext =
        await this.contextFactory.createContext(
          OrganizationMemberRolesContext,
          queryRunner
        );
      // ASSOCIATE ADMIN ROLE WITH CREATING MEMBER/CURRENT_USER
      await organizationMemberRolesContext.createOrganizationRole({
        organizationId: organization.id,
        organizationMemberId: organizationMember.id,
        organizationRoleId: adminRole.id,
      });
      await queryRunner.commitTransaction();
      return {
        action: "ORGANIZATION_CREATED",
        organization,
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
      await queryRunner.release();
    }
  }
}
