import { QueryFailedError, QueryRunner } from "typeorm";
import { v4 as uuidv4 } from "uuid";
import { expect } from "chai";
import { test } from 'mocha';
import { ValidationError } from "class-validator";

import "../../test_utils/setupTests";
import container from "../../test_utils/testContainer";
import { loadFixtures } from "../../test_utils/setupFixtures";

import ContextFactory from "../../../contexts/ContextFactory";
import UsersContext from "../../../contexts/users/UsersContext";
import { User } from "../../../entities/User";
import DatabaseConnection from "../../../connection/DatabaseConnection";

describe("UsersContext", () => {
  let usersContext: UsersContext;
  let queryRunner: QueryRunner;

  beforeEach(async () => {
    const contextFactory = container.get(ContextFactory);
    const databaseConnection = container.get(DatabaseConnection);
    queryRunner = await databaseConnection.makeQueryRunner();
    usersContext = await contextFactory.createContext(
      UsersContext,
      queryRunner
    );
  });

  afterEach(async () => {
    await queryRunner.release();
  });

  describe("createUser", () => {
    const defaultParams = {
      firstName: "foo",
      lastName: "bar",
      username: "doggylover",
    };

    test("can create user when required params are present", async () => {
      const createdUser = await usersContext.createUser(defaultParams);

      const readUser = await usersContext.getById(createdUser.id);
      expect(readUser).to.deep.equal(createdUser);
    });

    test("throws when username is already taken", async () => {
      await usersContext.createUser(defaultParams);

      try {
        await usersContext.createUser(defaultParams);
      } catch (e) {
        expect(e).to.be.an.instanceOf(QueryFailedError);
        const detail = (e as QueryFailedError).driverError.detail;
        expect(detail).to.equal(
          `Key (username)=(${defaultParams.username}) already exists.`
        );
      }
    });

    test("throws when either first_name or last_name is missing", async () => {
      try {
        await usersContext.createUser({
          lastName: defaultParams.lastName,
          username: defaultParams.username,
        });
      } catch (e) {
        const e0 = (e as ValidationError[])?.[0];
        expect(e0).to.be.an.instanceOf(ValidationError);
        expect(e0?.property).to.equal("firstName");
      }

      try {
        await usersContext.createUser({
          firstName: defaultParams.firstName,
          username: defaultParams.username,
        });
      } catch (e) {
        const e0 = (e as ValidationError[])?.[0];
        expect(e0).to.be.an.instanceOf(ValidationError);
        expect(e0?.property).to.equal("lastName");
      }
    });

    test("throws when either first_name or last_name are empty", async () => {
      try {
        await usersContext.createUser({
          firstName: "",
          lastName: "",
          username: defaultParams.username,
        });
      } catch (e) {
        const e0 = (e as ValidationError[])?.[0];
        const e1 = (e as ValidationError[])?.[1];
        expect(e0).to.be.an.instanceOf(ValidationError);
        expect(e0.property).to.equal("firstName");
        expect(e1).to.be.an.instanceOf(ValidationError);
        expect(e1.property).to.equal("lastName");
      }
    });
  });

  describe("userNameExists", () => {
    let user: User;

    beforeEach(async () => {
      [user] = await loadFixtures<[User]>(["User:user_0"]);
    });

    test("returns true if username is taken", async () => {
      const existsAlready = await usersContext.usernameExists(
        user.username as string
      );
      expect(existsAlready).to.equal(true);
    });

    test("returns false if username is not taken", async () => {
      const untakenUserName = "doggylover1";
      const existsAlready = await usersContext.usernameExists(untakenUserName);
      expect(existsAlready).to.equal(false);
    });
  });

  describe("updateUser", () => {
    let user: User;

    beforeEach(async () => {
      [user] = await loadFixtures<[User]>(["User:user_0"]);
    });

    test("updates attributes if attributes are valid", async () => {
      const firstName = "fooy";
      const lastName = "bary";

      const updatedUser = await usersContext.updateUser(user, {
        firstName,
        lastName,
      });

      expect(updatedUser.id).to.eq(user.id);
      expect(updatedUser.firstName).not.to.equal(user.firstName);
      expect(updatedUser.lastName).not.to.equal(user.lastName);
      expect(updatedUser.firstName).to.equal(firstName);
      expect(updatedUser.lastName).to.equal(lastName);
    });

    test("throws if attributes are invalid", async () => {
      try {
        await usersContext.updateUser(user, {
          firstName: "",
          lastName: "",
        });
      } catch (e) {
        const e0 = (e as ValidationError[])?.[0];
        const e1 = (e as ValidationError[])?.[1];
        expect(e0).to.be.an.instanceOf(ValidationError);
        expect(e0.property).to.equal("firstName");
        expect(e1).to.be.an.instanceOf(ValidationError);
        expect(e1.property).to.equal("lastName");
      }
    });
  });

  describe("updateUserById", () => {
    let user: User;

    test("updates attributes if attributes are valid", async () => {
      [user] = await loadFixtures<[User]>(["User:user_0"]);
      const firstName = "fooy";
      const lastName = "bary";
      const updatedUser = await usersContext.updateUserById(user.id, {
        firstName,
        lastName,
      });

      expect(updatedUser?.id).to.equal(user.id);
      expect(updatedUser?.firstName).not.to.equal(user.firstName);
      expect(updatedUser?.lastName).not.to.equal(user.lastName);
      expect(updatedUser?.firstName).to.equal(firstName);
      expect(updatedUser?.lastName).to.equal(lastName);
    });

    test("throws invalid id error when id does not exist", async () => {
      const badId = uuidv4();
      try {
        await usersContext.updateUserById(badId, {
          firstName: "fooy",
        });
      } catch (e) {
        expect(e).to.be.an.instanceOf(Error);
        expect((e as Error)?.message).to.equal(
          "Invalid ID to update for User.id: " + badId
        );
      }
    });
  });
});
