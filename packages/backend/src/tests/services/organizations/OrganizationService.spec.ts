import container from "../../../test_utils/testContainer";
import { test } from "mocha";

import "../../../test_utils/setupTests";

import { loadFixtures } from "@floro/database/src/test/test_utils/setupFixtures";

import OrganizationService from "../../../services/organizations/OrganizationService";
import { expect } from "chai";
import { User } from "@floro/database/src/entities/User";
import EmailQueue from "@floro/redis/src/queues/EmailQueue";
import RedisClient from "@floro/redis/src/RedisClient";
import ContextFactory from "@floro/database/src/contexts/ContextFactory";
import { OrganizationMember } from "@floro/database/src/entities/OrganizationMember";
import OrganizationMembersContext from "@floro/database/src/contexts/organizations/OrganizationMembersContext";
import OrganizationRolesContext from "@floro/database/src/contexts/organizations/OrganizationRolesContext";
import { Organization } from "@floro/database/src/entities/Organization";
import OrganizationMemberRolesContext from "@floro/database/src/contexts/organizations/OrganizationMemberRolesContext";
import { OrganizationRole } from "@floro/database/src/entities/OrganizationRole";
import OrganizationRolePresetModel from "../../../services/organizations/presets/OrganizationRolePresetModel";

describe("OrganizationService", () => {
  let organizationService: OrganizationService;
  let redisClient: RedisClient;
  let emailQueue: EmailQueue;

  before(async () => {
      emailQueue = container.get(EmailQueue);
      emailQueue.startMailWorker();
  });

  beforeEach(async () => {
    organizationService = container.get(OrganizationService);
    redisClient = container.get(RedisClient);
    if (!redisClient.connectionExists) {
      redisClient.startRedis();
    }
  });

  describe('createOrg', async () => {
    let currentUser: User;

    test("fails with HANDLE_TAKEN error when handle already Exists", async () => {
      const [currentUser, existingOrg] = await loadFixtures<[User, Organization]>(['User:user_0', 'Organization:org_0']); 
      const result = await organizationService.createOrg(
        "floro",
        "Floro Inc.",
        existingOrg.handle as string,
        "floroadmin@gmail.com",
        true,
        currentUser
      );
      expect(result.action).to.eql('HANDLE_TAKEN');
    });

    test("fails with INVALID_PARAMS error when agreedToCustomerSeriviceAgreement is false", async () => {
      [currentUser] = await loadFixtures<[User]>(['User:user_0']); 
      const result = await organizationService.createOrg(
        "floro",
        "Floro Inc.",
        "neworghandle",
        "floroadmin@gmail.com",
        false,
        currentUser
      );
      expect(result.action).to.eql('INVALID_PARAMS');
    });

    test("fails with INVALID_PARAMS error when profanity in a public name", async () => {
      [currentUser] = await loadFixtures<[User]>(['User:user_0']); 
      const result = await organizationService.createOrg(
        "floro",
        "Fuck Inc.",
        "neworghandle",
        "floroadmin@gmail.com",
        false,
        currentUser
      );
      expect(result.action).to.eql('INVALID_PARAMS');
    });

    test("fails with INVALID_PARAMS error when name does not conform to pattern", async () => {
      [currentUser] = await loadFixtures<[User]>(['User:user_0']); 
      const result = await organizationService.createOrg(
        "f$oro",
        "Floro Inc.",
        "neworghandle",
        "floroadmin@gmail.com",
        false,
        currentUser
      );
      expect(result.action).to.eql('INVALID_PARAMS');
    });

    test('creates org when params are valid', async () => {
      [currentUser] = await loadFixtures<[User]>(['User:user_0']); 
      const result = await organizationService.createOrg(
        "floro",
        "Floro Inc.",
        "florophore",
        "floroadmin@gmail.com",
        true,
        currentUser
      );

      const contextFactory = container.get(ContextFactory);
      const orgMembersContext = await contextFactory.createContext(
        OrganizationMembersContext
      );

      const orgRolesContext = await contextFactory.createContext(
        OrganizationRolesContext
      );
      const organizationMember = await orgMembersContext.getByOrgAndUser(
        result.organization as Organization,
        currentUser
      );
      const orgMemberRoleContext = await contextFactory.createContext(
        OrganizationMemberRolesContext
      );
      expect(result.organization?.name).to.eql("floro");
      expect(result.organization?.handle).to.eql("florophore");
      expect(result.organization?.legalName).to.eql("Floro Inc.");
      expect(result.organization?.contactEmail).to.eql("floroadmin@gmail.com");
      const roles = await orgRolesContext.getAllForOrg(result.organization as Organization);
      const adminRolePreset = OrganizationRolePresetModel.createAdminPreset(
        result.organization as Organization,
        currentUser,
        organizationMember as OrganizationMember
      ).toModelArgs();
      for (const prop in adminRolePreset) {
        expect(adminRolePreset[prop]).to.eql(roles[0][prop]);
      }
      const billingRolePreset = OrganizationRolePresetModel.createBillingAdminPreset(
        result.organization as Organization,
        currentUser,
        organizationMember as OrganizationMember
      ).toModelArgs();
      for (const prop in billingRolePreset) {
        expect(billingRolePreset[prop]).to.eql(roles[1][prop]);
      }
      const contributorRolePreset = OrganizationRolePresetModel.createDefaultContributorPreset(
        result.organization as Organization,
        currentUser,
        organizationMember as OrganizationMember
      ).toModelArgs();
      for (const prop in contributorRolePreset) {
        expect(contributorRolePreset[prop]).to.eql(roles[2][prop]);
      }
      const technicalAdminRolePreset = OrganizationRolePresetModel.createTechnicalAdminPreset(
        result.organization as Organization,
        currentUser,
        organizationMember as OrganizationMember
      ).toModelArgs();
      for (const prop in technicalAdminRolePreset) {
        expect(technicalAdminRolePreset[prop]).to.eql(roles[3][prop]);
      }
      const adminRole = roles.find(r => r.name == "Admin");
      const memberRole = await orgMemberRoleContext.getByRoleAndOrg(
        result.organization as Organization, adminRole as OrganizationRole
      )
      expect(adminRole?.name).to.eql("Admin");
      expect(memberRole?.organizationId).to.eql(result?.organization?.id);
      expect(memberRole?.organizationRoleId).to.eql(adminRole?.id);
      expect(memberRole?.organizationRoleId).to.eql(adminRole?.id);
      expect(memberRole?.organizationMemberId).to.eql(organizationMember?.id);
    });
  });
});