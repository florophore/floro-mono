import { QueryFailedError, QueryRunner } from "typeorm";
import { v4 as uuidv4 } from "uuid";
import { expect } from "chai";
import { test } from 'mocha';
import { ValidationError } from "class-validator";

import "../../test_utils/setGlobals";
import container from "../../test_utils/testContainer";
import { loadFixtures } from "../../test_utils/setupFixtures";

import ContextFactory from "../../../contexts/ContextFactory";
import OrganizationsContext from "../../../contexts/organizations/OrganizationsContext";
import { User } from "../../../entities/User";
import DatabaseConnection from "../../../connection/DatabaseConnection";
import EmailHelper from "../../../contexts/utils/EmailHelper";
import { Organization } from "../../../entities/Organization";

describe("OrganizationsContext", () => {
  let organizationsContext: OrganizationsContext;
  let queryRunner: QueryRunner;

  beforeEach(async () => {
    const contextFactory = container.get(ContextFactory);
    const databaseConnection = container.get(DatabaseConnection);
    queryRunner = await databaseConnection.makeQueryRunner();
    organizationsContext = await contextFactory.createContext(
      OrganizationsContext,
      queryRunner
    );
  });

  afterEach(async () => {
    await queryRunner.release();
  });

  describe("createOrganization", () => {
    let user: User;

    beforeEach(async () => {
      [user] = await loadFixtures<[User]>(["User:user_0"]);
    });

    const contactEmail = "test@gmail.com";
    const normalizedContactEmail = EmailHelper.getUniqueEmail(
      contactEmail,
      true
    );
    const contactEmailHash = EmailHelper.getEmailHash(contactEmail, true);
    const defaultParams = {
      name: "Floro",
      legalName: "Floro Inc.",
      handle: "floro",
      contactEmail,
      normalizedContactEmail,
      contactEmailHash,
      agreedToCustomerServiceAgreement: true,
    };

    test("can create org when required params are presetn", async () => {
      const createdOrg = await organizationsContext.createOrganization({
        ...defaultParams,
        createdByUserId: user.id,
      });
      const readOrg = await organizationsContext.getById(createdOrg.id);
      expect(readOrg).to.deep.equal(createdOrg);
    });

    test("throws when handle is already taken", async () => {
      await organizationsContext.createOrganization({
        ...defaultParams,
        createdByUserId: user.id,
      });

      try {
        await organizationsContext.createOrganization({
        ...defaultParams,
        createdByUserId: user.id,
      });
      } catch (e) {
        expect(e).to.be.an.instanceOf(QueryFailedError);
        const detail = (e as QueryFailedError).driverError.detail;
        expect(detail).to.equal(
          `Key (handle)=(${defaultParams.handle}) already exists.`
        );
      }
    });


    test("throws when either name or legalName is missing", async () => {
      try {
        await organizationsContext.createOrganization({
        legalName: "Floro Inc",
        handle: "floro",
        contactEmail,
        normalizedContactEmail,
        contactEmailHash,
        agreedToCustomerServiceAgreement: true,
        createdByUserId: user.id,
      });
      } catch (e) {
        const e0 = (e as ValidationError[])?.[0];
        expect(e0).to.be.an.instanceOf(ValidationError);
        expect(e0?.property).to.equal("name");
      }

      try {
        await organizationsContext.createOrganization({
          name: "Floro Inc",
          handle: "floro",
          contactEmail,
          normalizedContactEmail,
          contactEmailHash,
          agreedToCustomerServiceAgreement: true,
          createdByUserId: user.id,
        });
      } catch (e) {
        const e0 = (e as ValidationError[])?.[0];
        expect(e0).to.be.an.instanceOf(ValidationError);
        expect(e0?.property).to.equal("legalName");
      }
    });

    test("throws when any contactEmail info is missing", async () => {
      try {
        await organizationsContext.createOrganization({
          name: "floro",
          legalName: "Floro Inc",
          handle: "floro",
          normalizedContactEmail,
          contactEmailHash,
          agreedToCustomerServiceAgreement: true,
          createdByUserId: user.id,
        });
      } catch (e) {
        const e0 = (e as ValidationError[])?.[0];
        expect(e0).to.be.an.instanceOf(ValidationError);
        expect(e0?.property).to.equal("contactEmail");
      }

      try {
        await organizationsContext.createOrganization({
          name: "floro",
          legalName: "Floro Inc",
          handle: "floro",
          contactEmail,
          contactEmailHash,
          agreedToCustomerServiceAgreement: true,
          createdByUserId: user.id,
        });
      } catch (e) {
        const e0 = (e as ValidationError[])?.[0];
        expect(e0).to.be.an.instanceOf(ValidationError);
        expect(e0?.property).to.equal("normalizedContactEmail");
      }

      try {
        await organizationsContext.createOrganization({
          name: "floro",
          legalName: "Floro Inc",
          handle: "floro",
          contactEmail,
          normalizedContactEmail,
          agreedToCustomerServiceAgreement: true,
          createdByUserId: user.id,
        });
      } catch (e) {
        const e0 = (e as ValidationError[])?.[0];
        expect(e0).to.be.an.instanceOf(ValidationError);
        expect(e0?.property).to.equal("contactEmailHash");
      }
    });

    test("throws agreedToCustomerServiceAgreement is false", async () => {
      try {
        await organizationsContext.createOrganization({
          name: "floro",
          legalName: "Floro Inc",
          handle: "floro",
          contactEmail,
          normalizedContactEmail,
          contactEmailHash,
          agreedToCustomerServiceAgreement: false,
          createdByUserId: user.id,
        });
      } catch (e) {
        const e0 = (e as ValidationError[])?.[0];
        expect(e0).to.be.an.instanceOf(ValidationError);
        expect(e0?.property).to.equal("agreedToCustomerServiceAgreement");
      }
    });
  });

  describe("handleExists", () => {
    let organization: Organization;

    beforeEach(async () => {
      [, organization] = await loadFixtures<[User, Organization]>([
        "User:user_0",
        "Organization:org_0",
      ]);
    });

    test("returns true if handle is taken", async () => {
      const existsAlready = await organizationsContext.handleExists(
        organization.handle as string
      );
      expect(existsAlready).to.equal(true);
    });

    test("returns false if handle is not taken", async () => {
      const untakenHandle = "newcorp";
      const existsAlready = await organizationsContext.handleExists(untakenHandle);
      expect(existsAlready).to.equal(false);
    });
  });

  describe("updateOrganization", () => {
    let org: Organization;

    beforeEach(async () => {
      [,org] = await loadFixtures<[User, Organization]>(["User:user_0", "Organization:org_0"]);
    });

    test("updates attributes if attributes are valid", async () => {
      const name = "Floro 2";
      const legalName = "Floro 2 Corp.";

      const updatedOrg = await organizationsContext.updateOrganization(org, {
        name,
        legalName,
      });

      expect(updatedOrg.id).to.eq(org.id);
      expect(updatedOrg.name).not.to.equal(org.name);
      expect(updatedOrg.legalName).not.to.equal(org.legalName);
      expect(updatedOrg.name).to.equal(name);
      expect(updatedOrg.legalName).to.equal(legalName);
    });

    test("throws if attributes are invalid", async () => {
      try {
        await organizationsContext.updateOrganization(org, {
          name: "",
          legalName: "",
        });
      } catch (e) {
        const e0 = (e as ValidationError[])?.[0];
        const e1 = (e as ValidationError[])?.[1];
        expect(e0).to.be.an.instanceOf(ValidationError);
        expect(e0.property).to.equal("name");
        expect(e1).to.be.an.instanceOf(ValidationError);
        expect(e1.property).to.equal("legalName");
      }
    });
  });

  describe("updateOrganizationById", () => {
    let org: Organization;

    beforeEach(async () => {
      [,org] = await loadFixtures<[User, Organization]>(["User:user_0", "Organization:org_0"]);
    });

    test("updates attributes if attributes are valid", async () => {
      const name = "Floro 2";
      const legalName = "Floro 2 Corp.";

      const updatedOrg = await organizationsContext.updateOrganizationById(org.id, {
        name,
        legalName,
      });

      expect(updatedOrg?.id).to.eq(org.id);
      expect(updatedOrg?.name).not.to.equal(org.name);
      expect(updatedOrg?.legalName).not.to.equal(org.legalName);
      expect(updatedOrg?.name).to.equal(name);
      expect(updatedOrg?.legalName).to.equal(legalName);
    });

    test("throws invalid id error when id does not exist", async () => {
      const badId = uuidv4();
      try {
        await organizationsContext.updateOrganizationById(badId, {
          name: "badname",
        });
      } catch (e) {
        expect(e).to.be.an.instanceOf(Error);
        expect((e as Error)?.message).to.equal(
          "Invalid ID to update for Organization.id: " + badId
        );
      }
    });
  });
});