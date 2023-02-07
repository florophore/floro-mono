import container from "../../test_utils/testContainer";
import { test } from "mocha";

import "../../test_utils/setupTests";

import { loadFixtures } from "@floro/database/src/test/test_utils/setupFixtures";

import { expect } from "chai";
import { User } from "@floro/database/src/entities/User";
import EmailQueue from "@floro/redis/src/queues/EmailQueue";
import RedisClient from "@floro/redis/src/RedisClient";
import ContextFactory from "@floro/database/src/contexts/ContextFactory";
import { OrganizationMember } from "@floro/database/src/entities/OrganizationMember";
import { Organization } from "@floro/database/src/entities/Organization";
import { OrganizationRole } from "@floro/database/src/entities/OrganizationRole";
import OrganizationInvitationService from "../../../services/organizations/OrganizationInvitationService";
import { OrganizationPermissions } from "../../../services/organizations/OrganizationPermissionService";
import { v4 as uuidv4 } from "uuid";
import { OrganizationInvitation } from "@floro/database/src/entities/OrganizationInvitation";
import { UserAuthCredential } from "@floro/database/src/entities/UserAuthCredential";
import OrganizationInvitationRolesContext from "@floro/database/src/contexts/organizations/OrganizationInvitationRolesContext";
import DatabaseConnection from "@floro/database/src/connection/DatabaseConnection";

describe("OrganizationInvitationService", () => {
  let databaseConnection: DatabaseConnection;
  let organizationInvitationService: OrganizationInvitationService;
  let redisClient: RedisClient;
  let emailQueue: EmailQueue;
  let contextFactory: ContextFactory;

  before(async () => {
    emailQueue = container.get(EmailQueue);
    emailQueue.startMailWorker();
  });

  beforeEach(async () => {
    contextFactory = container.get(ContextFactory);
    databaseConnection = container.get(DatabaseConnection);
    organizationInvitationService = container.get(
      OrganizationInvitationService
    );
    redisClient = container.get(RedisClient);
    if (!redisClient.connectionExists) {
      redisClient.startRedis();
    }
  });

  describe("createInivitation", () => {
    let currentUser: User;
    let receipientUser: User;
    let organization: Organization;
    let invitingMember: OrganizationMember;
    let permissions: OrganizationPermissions;
    let adminRole: OrganizationRole;
    let contributorRole: OrganizationRole;
    let recipientAuthCred: UserAuthCredential;

    describe("when no invitation or membership exists yet", () => {
      beforeEach(async () => {
        [
          currentUser,
          receipientUser,
          organization,
          recipientAuthCred,
          invitingMember,
          adminRole,
          contributorRole,
        ] = await loadFixtures<
          [
            User,
            User,
            Organization,
            UserAuthCredential,
            OrganizationMember,
            OrganizationRole,
            OrganizationRole,
            OrganizationRole,
            OrganizationRole
          ]
        >([
          "User:user_0",
          "User:user_1",
          "Organization:org_0",
          "UserAuthCredential:email_pass_for_user1",
          "OrganizationMember:org_member_0",
          "OrganizationRole:org_0_admin_role",
          "OrganizationRole:org_0_contributor_role",
          "OrganizationRole:org_0_billing_admin_role",
          "OrganizationRole:org_0_technical_admin_role",
        ]);

        permissions = {
          canCreateRepos: true,
          canModifyOrganizationSettings: true,
          canModifyOrganizationDeveloperSettings: true,
          canModifyOrganizationMembers: true,
          canInviteMembers: true,
          canModifyInvites: true,
          canModifyOwnInternalHandle: true,
          canModifyBilling: true,
          canModifyOrganizationRoles: true,
          canAssignRoles: true,
        };
      });

      test("throws INVALID_PERMISSIONS_ERROR if inviting user does not have canInviteMembers permission", async () => {
        permissions = {
          ...permissions,
          canInviteMembers: false,
        };
        const result = await organizationInvitationService.createInvitation(
          organization,
          currentUser,
          invitingMember,
          permissions
        );
        expect(result.action).to.eql("INVALID_PERMISSIONS_ERROR");
      });

      test("throws FORBIDDEN_ACTION_ERROR if inviting user has inactive membership", async () => {
        invitingMember.membershipState = "inactive";
        const result = await organizationInvitationService.createInvitation(
          organization,
          currentUser,
          invitingMember,
          permissions
        );
        expect(result.action).to.eql("FORBIDDEN_ACTION_ERROR");
      });

      test("throws INVALID_PARAMS_ERROR if input email is invalid and userId is undefined", async () => {
        const result = await organizationInvitationService.createInvitation(
          organization,
          currentUser,
          invitingMember,
          permissions,
          undefined,
          "bad@@@eamil,com"
        );
        expect(result.action).to.eql("INVALID_PARAMS_ERROR");
      });

      test("throws INVALID_PARAMS_ERROR if neither email nor userId are provided", async () => {
        const result = await organizationInvitationService.createInvitation(
          organization,
          currentUser,
          invitingMember,
          permissions
        );
        expect(result.action).to.eql("INVALID_PARAMS_ERROR");
      });

      test("throws NO_USER_FOUND_ERROR if bad userId is passed", async () => {
        const result = await organizationInvitationService.createInvitation(
          organization,
          currentUser,
          invitingMember,
          permissions,
          uuidv4()
        );
        expect(result.action).to.eql("NO_USER_FOUND_ERROR");
      });

      test("throws INVALID_PARAMS_ERROR if bad first name supplied", async () => {
        const result = await organizationInvitationService.createInvitation(
          organization,
          currentUser,
          invitingMember,
          permissions,
          undefined,
          "%%% first name"
        );
        expect(result.action).to.eql("INVALID_PARAMS_ERROR");
      });
      test("throws INVALID_PARAMS_ERROR if profane first name supplied", async () => {
        const result = await organizationInvitationService.createInvitation(
          organization,
          currentUser,
          invitingMember,
          permissions,
          undefined,
          "fuck"
        );
        expect(result.action).to.eql("INVALID_PARAMS_ERROR");
      });

      test("throws INVALID_PARAMS_ERROR if bad last name supplied", async () => {
        const result = await organizationInvitationService.createInvitation(
          organization,
          currentUser,
          invitingMember,
          permissions,
          undefined,
          "okay",
          "!last !name"
        );
        expect(result.action).to.eql("INVALID_PARAMS_ERROR");
      });

      test("throws INVALID_PARAMS_ERROR if profane last name supplied", async () => {
        const result = await organizationInvitationService.createInvitation(
          organization,
          currentUser,
          invitingMember,
          permissions,
          undefined,
          "new_user@gmail.com",
          "okay",
          "fuck"
        );
        expect(result.action).to.eql("INVALID_PARAMS_ERROR");
      });

      test("creates invitation for un-registered user if email is supplied and does not exist yet", async () => {
        const result = await organizationInvitationService.createInvitation(
          organization,
          currentUser,
          invitingMember,
          permissions,
          undefined,
          "new_user@gmail.com",
          "okayfname",
          "okaylname"
        );
        expect(result.action).to.eql("INVITATION_CREATED");
        expect(result.organizationInvitation?.userExistedAlready).to.eql(false);
      });

      test("creates invitation for registered user if userId is supplied", async () => {
        const result = await organizationInvitationService.createInvitation(
          organization,
          currentUser,
          invitingMember,
          permissions,
          receipientUser.id
        );
        expect(result.action).to.eql("INVITATION_CREATED");
        expect(result.organizationInvitation?.userExistedAlready).to.eql(true);
        expect(result.organizationInvitation?.firstName).to.eql(
          receipientUser.firstName
        );
        expect(result.organizationInvitation?.lastName).to.eql(
          receipientUser.lastName
        );
        expect(result.organizationInvitation?.emailHash).to.eql(
          recipientAuthCred.emailHash
        );
      });

      test("throw NO_REMAINING_SEATS_ERROR if in excess of seat limit",  async () => {
        for (let i = 0; i < (organization?.freeSeats ?? 10) - 1; ++i) {
          const result = await organizationInvitationService.createInvitation(
            organization,
            currentUser,
            invitingMember,
            permissions,
            undefined,
            "test-" + i +"@gmail.com",
            "foo",
            "bar"
          );
          expect(result.action).to.eql("INVITATION_CREATED")
        }
          const result = await organizationInvitationService.createInvitation(
            organization,
            currentUser,
            invitingMember,
            permissions,
            undefined,
            "overflow@gmail.com",
            "foo",
            "bar"
          );
          expect(result.action).to.eql("NO_REMAINING_SEATS_ERROR")
      });

      test("creates invitation and respects roleIds if inviting member has canAssignRoles permission", async () => {
        const result = await organizationInvitationService.createInvitation(
          organization,
          currentUser,
          invitingMember,
          permissions,
          receipientUser.id,
          undefined,
          undefined,
          undefined,
          [adminRole.id]
        );
        expect(result.action).to.eql("INVITATION_CREATED");
        const queryRunner = await databaseConnection.makeQueryRunner();
        const organizationInvitationsRolesContext =
          await contextFactory.createContext(
            OrganizationInvitationRolesContext,
            queryRunner
          );
        const roles =
          await organizationInvitationsRolesContext.getByInvitationId(
            result?.organizationInvitation?.id as string
          );
        expect(roles.length).to.eql(1);
        expect(roles[0].organizationRoleId).to.eql(adminRole.id);
      });

      test("creates invitation and but does not respect roleIds if inviting member does NOT have canAssignRoles permission", async () => {
        permissions = {
          ...permissions,
          canAssignRoles: false,
        };
        const result = await organizationInvitationService.createInvitation(
          organization,
          currentUser,
          invitingMember,
          permissions,
          receipientUser.id,
          undefined,
          undefined,
          undefined,
          [adminRole.id]
        );
        expect(result.action).to.eql("INVITATION_CREATED");
        const queryRunner = await databaseConnection.makeQueryRunner();
        const organizationInvitationsRolesContext =
          await contextFactory.createContext(
            OrganizationInvitationRolesContext,
            queryRunner
          );
        const roles =
          await organizationInvitationsRolesContext.getByInvitationId(
            result?.organizationInvitation?.id as string
          );
        expect(roles.length).to.eql(1);
        expect(roles[0].organizationRoleId).to.eql(contributorRole.id);
      });
    });

    describe("when a member or invitation already exists", () => {
      beforeEach(() => {
        permissions = {
          canCreateRepos: true,
          canModifyOrganizationSettings: true,
          canModifyOrganizationDeveloperSettings: true,
          canModifyOrganizationMembers: true,
          canInviteMembers: true,
          canModifyInvites: true,
          canModifyOwnInternalHandle: true,
          canModifyBilling: true,
          canModifyOrganizationRoles: true,
          canAssignRoles: true,
        };
      });

      test("throws INVITATION_EXISTS_ERROR if user already invited", async () => {
        [currentUser, receipientUser, organization, , invitingMember] =
          await loadFixtures<
            [
              User,
              User,
              Organization,
              UserAuthCredential,
              OrganizationMember,
              OrganizationRole,
              OrganizationRole,
              OrganizationRole,
              OrganizationRole,
              OrganizationInvitation
            ]
          >([
            "User:user_0",
            "User:user_1",
            "Organization:org_0",
            "UserAuthCredential:email_pass_for_user1",
            "OrganizationMember:org_member_0",
            "OrganizationRole:org_0_admin_role",
            "OrganizationRole:org_0_contributor_role",
            "OrganizationRole:org_0_billing_admin_role",
            "OrganizationRole:org_0_technical_admin_role",
            "OrganizationInvitation:org_0_invitation_sent_1",
          ]);
        const result = await organizationInvitationService.createInvitation(
          organization,
          currentUser,
          invitingMember,
          permissions,
          receipientUser.id
        );
        expect(result.action).to.eql("INVITATION_EXISTS_ERROR");
      });

      test("throws MEMBERSHIP_EXISTS_ERROR if user already member of org", async () => {
        [currentUser, receipientUser, organization, , invitingMember] =
          await loadFixtures<
            [
              User,
              User,
              Organization,
              UserAuthCredential,
              OrganizationMember,
              OrganizationMember,
              OrganizationRole,
              OrganizationRole,
              OrganizationRole,
              OrganizationRole
            ]
          >([
            "User:user_0",
            "User:user_1",
            "Organization:org_0",
            "UserAuthCredential:email_pass_for_user1",
            "OrganizationMember:org_member_0",
            "OrganizationMember:org_member_1",
            "OrganizationRole:org_0_admin_role",
            "OrganizationRole:org_0_contributor_role",
            "OrganizationRole:org_0_billing_admin_role",
            "OrganizationRole:org_0_technical_admin_role",
          ]);
        const result = await organizationInvitationService.createInvitation(
          organization,
          currentUser,
          invitingMember,
          permissions,
          receipientUser.id
        );
        expect(result.action).to.eql("MEMBERSHIP_EXISTS_ERROR");
      });

      test("successfully creates invitation if recipient user exists but only email of recipient is supplied", async () => {
        const [
          currentUser,
          receipientUser,
          organization,
          recipientAuthCred,
          invitingMember,
        ] = await loadFixtures<
          [
            User,
            User,
            Organization,
            UserAuthCredential,
            OrganizationMember,
            OrganizationRole,
            OrganizationRole,
            OrganizationRole,
            OrganizationRole
          ]
        >([
          "User:user_0",
          "User:user_1",
          "Organization:org_0",
          "UserAuthCredential:email_pass_for_user1",
          "OrganizationMember:org_member_0",
          "OrganizationRole:org_0_admin_role",
          "OrganizationRole:org_0_contributor_role",
          "OrganizationRole:org_0_billing_admin_role",
          "OrganizationRole:org_0_technical_admin_role",
        ]);
        const result = await organizationInvitationService.createInvitation(
          organization,
          currentUser,
          invitingMember,
          permissions,
          undefined,
          recipientAuthCred.email,
          "aaa",
          "bbb"
        );
        expect(result.action).to.eql("INVITATION_CREATED");
        expect(result.organizationInvitation?.firstName).to.eql(
          receipientUser.firstName
        );
        expect(result.organizationInvitation?.lastName).to.eql(
          receipientUser.lastName
        );
        expect(result.organizationInvitation?.emailHash).to.eql(
          recipientAuthCred.emailHash
        );
        expect(result.organizationInvitation?.userExistedAlready).to.eql(true);
      });
    });
  });
});
