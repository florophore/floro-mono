
import { QueryRunner } from "typeorm";
import { expect } from "chai";
import { test } from 'mocha';
import { ValidationError } from "class-validator";

import "../../test_utils/setGlobals";
import container from "../../test_utils/testContainer";
import { loadFixtures } from "../../test_utils/setupFixtures";

import ContextFactory from "../../../contexts/ContextFactory";
import PluginsContext from "../../../contexts/plugins/PluginsContext";
import PluginHelper from "../../../contexts/utils/PluginHelper";
import { User } from "../../../entities/User";
import { Plugin } from "../../../entities/Plugin";
import DatabaseConnection from "../../../connection/DatabaseConnection";
import { Organization } from "../../../entities/Organization";

describe("PluginsContext", () => {
  let pluginsContext: PluginsContext;
  let queryRunner: QueryRunner;

  beforeEach(async () => {
    const contextFactory = container.get(ContextFactory);
    const databaseConnection = container.get(DatabaseConnection);
    queryRunner = await databaseConnection.makeQueryRunner();
    pluginsContext = await contextFactory.createContext(
      PluginsContext,
      queryRunner
    );
  });

  afterEach(async () => {
    await queryRunner.release();
  });

  describe("createPlugin", () => {
    let user: User;
    let org: Organization;

    beforeEach(async () => {
      [user, org] = await loadFixtures<[User, Organization]>(["User:user_0", "Organization:org_0"]);
    });

    test("can create public user plugin", async () => {
        const name = "test-plugin";
        const nameKey = PluginHelper.getPluginKeyUUID(name) as string;
        const params = {
            name,
            nameKey,
            ownerType: "user_plugin",
            isPrivate: false,
            userId: user.id,
            createdByUserId: user.id,
        }
        const plugin = await pluginsContext.createPlugin(params);
        for (const prop in params) {
            expect(plugin[prop]).eql(plugin[prop]);
        }
    });

    test("can create private user plugin", async () => {
        const name = "test-plugin";
        const nameKey = PluginHelper.getPluginKeyUUID(name) as string;
        const params = {
            name,
            nameKey,
            ownerType: "user_plugin",
            isPrivate: true,
            userId: user.id,
            createdByUserId: user.id,
        }
        const plugin = await pluginsContext.createPlugin(params);
        for (const prop in params) {
            expect(plugin[prop]).eql(plugin[prop]);
        }
    });

    test("can create public org plugin", async () => {
        const name = "test-plugin";
        const nameKey = PluginHelper.getPluginKeyUUID(name) as string;
        const params = {
            name,
            nameKey,
            ownerType: "org_plugin",
            isPrivate: false,
            organizationId: org.id,
            createdByUserId: user.id,
        }
        const plugin = await pluginsContext.createPlugin(params);
        for (const prop in params) {
            expect(plugin[prop]).eql(plugin[prop]);
        }
    });

    test("can create private user plugin", async () => {
        const name = "test-plugin";
        const nameKey = PluginHelper.getPluginKeyUUID(name) as string;
        const params = {
            name,
            nameKey,
            ownerType: "org_plugin",
            isPrivate: true,
            organizationId: org.id,
            createdByUserId: user.id,
        }
        const plugin = await pluginsContext.createPlugin(params);
        for (const prop in params) {
            expect(plugin[prop]).eql(plugin[prop]);
        }
    });
  });

  describe("pluginExistsByNameKey", () => {
    let plugin: Plugin;

    beforeEach(async () => {
      [,, plugin] = await loadFixtures<[User, Organization, Plugin]>([
        "User:user_0",
        "Organization:org_0",
        "Plugin:plugin_user_public_0",
      ]);
    });

    test("returns true if plugin name is already taken", async () => {
      const existsAlready = await pluginsContext.pluginExistsByNameKey(
        plugin.nameKey
      );
      expect(existsAlready).to.equal(true);
    });

    test("returns false if username is taken", async () => {
      const existsAlready = await pluginsContext.pluginExistsByNameKey(
        PluginHelper.getPluginKeyUUID("unclaimed-plugin") as string
      );
      expect(existsAlready).to.equal(false);
    });
  });
});