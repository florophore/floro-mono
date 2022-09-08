import { QueryRunner } from "typeorm";
import { expect } from "chai";
import { test } from "mocha";

import "../../test_utils/setupTests";
import container from "../../test_utils/testContainer";
import { loadFixtures } from "../../test_utils/setupFixtures";

import ContextFactory from "../../../contexts/ContextFactory";
import { User } from "../../../entities/User";
import DatabaseConnection from "../../../connection/DatabaseConnection";
import UserServiceAgreementsContext from "../../../contexts/users/UserServiceAgreementsContext";
import { ValidationError } from "class-validator";
import { UserServiceAgreement } from "../../../entities/UserServiceAgreement";

describe("UserServiceAgreementsContext", () => {
  let userServiceAgreementsContext: UserServiceAgreementsContext;
  let queryRunner: QueryRunner;

  beforeEach(async () => {
    const contextFactory = container.get(ContextFactory);
    const databaseConnection = container.get(DatabaseConnection);
    queryRunner = await databaseConnection.makeQueryRunner();
    userServiceAgreementsContext = await contextFactory.createContext(
      UserServiceAgreementsContext,
      queryRunner
    );
  });

  afterEach(async () => {
    await queryRunner.release();
  });

  describe("createUserServiceAgreement", () => {
    test("creates a valid service agreement when user agrees to tos and privacy", async () => {
      const [user] = await loadFixtures<[User]>(["User:user_0"]);
      const serviceAgreement =
        await userServiceAgreementsContext.createUserServiceAgreement({
          userId: user.id,
          agreedToPrivacyPolicy: true,
          agreedToTos: true,
        });

      expect(serviceAgreement.userId).to.equal(user.id);
      expect(serviceAgreement.agreedToPrivacyPolicy).to.be.true;
      expect(serviceAgreement.agreedToTos).to.be.true;
    });

    test("creates throws when user doesnt agree to tos or privacy", async () => {
      const [user] = await loadFixtures<[User]>(["User:user_0"]);
      try {
        await userServiceAgreementsContext.createUserServiceAgreement({
          userId: user.id,
          agreedToPrivacyPolicy: false,
          agreedToTos: true,
        });
      } catch (e) {
        expect((e as Error[])[0]).to.be.instanceOf(ValidationError);
      }

      try {
        await userServiceAgreementsContext.createUserServiceAgreement({
          userId: user.id,
          agreedToPrivacyPolicy: true,
          agreedToTos: false,
        });
      } catch (e) {
        expect((e as Error[])[0]).to.be.instanceOf(ValidationError);
      }
    });
  });

  describe("getByUserId", () => {
    test("fetches by user id", async () => {
      const [user, userServiceAgreement] = await loadFixtures<
        [User, UserServiceAgreement]
      >(["User:user_0", "UserServiceAgreement:user_service_agreement_0"]);
      const serviceAgreement = await userServiceAgreementsContext.getByUserId(
        user.id
      );

      expect(serviceAgreement?.userId).to.equal(user.id);
      expect(serviceAgreement?.id).to.equal(userServiceAgreement.id);
    });
  });
});