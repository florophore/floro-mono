import container from "../../../test_utils/testContainer";
import { test } from "mocha";

import "../../../test_utils/setupTests";

import { loadFixtures } from "@floro/database/src/test/test_utils/setupFixtures";

import { Organization } from "@floro/database/src/entities/Organization";
import { Plugin } from "@floro/database/src/entities/Plugin";
import { User } from "@floro/database/src/entities/User";
import Backend from "../../../Backend";
import { GraphQLSchema } from "graphql";
import { ApolloServer } from "apollo-server-express";
import ApolloRestClientFactory from "../../../controllers/ApolloRestClientFactory";
import { PluginNameCheckDocument, CreateUserPluginDocument } from "@floro/graphql-schemas/build/generated/main-client-graphql";
import { expect } from "chai";
import { UserAuthCredential } from "@floro/database/src/entities/UserAuthCredential";
import SessionStore from "@floro/redis/src/sessions/SessionStore";

describe("PluginResolverModule", () => {
  let backend: Backend;
  let schema: GraphQLSchema;
  let apolloServer: ApolloServer;
  let apolloRestClientFactory: ApolloRestClientFactory;

  beforeEach(async () => {
    backend = container.get(Backend);
    schema = backend.buildExecutableSchema();
    apolloServer = backend.buildApolloServer();
    await apolloServer.start();
    apolloRestClientFactory = container.get(ApolloRestClientFactory);
    apolloRestClientFactory.setSchema(schema);
  });

  afterEach(async () => {
    await apolloServer.stop();
  });

  describe("checkPluginNameIsTaken", () => {
    let plugin: Plugin;

    beforeEach(async () => {
      [, , plugin] = await loadFixtures<[User, Organization, Plugin]>([
        "User:user_0",
        "Organization:org_0",
        "Plugin:plugin_user_public_0",
      ]);
    });

    test("returns exists when exists", async () => {
      return await apolloRestClientFactory.runWithApolloClient(
        "",
        async (_, apolloClient) => {
          const result = await apolloClient.query({
            query: PluginNameCheckDocument,
            variables: {
              pluginName: plugin.name,
            },
          });
          expect(result.data.checkPluginNameIsTaken.exists).eql(true);
          expect(result.data.checkPluginNameIsTaken.pluginName).eql(
            plugin.name
          );
        }
      );
    });

    test("returns false when DNE", async () => {
      return await apolloRestClientFactory.runWithApolloClient(
        "",
        async (_, apolloClient) => {
          const result = await apolloClient.query({
            query: PluginNameCheckDocument,
            variables: {
              pluginName: "unclaimed-app",
            },
          });
          expect(result.data.checkPluginNameIsTaken.exists).eql(false);
          expect(result.data.checkPluginNameIsTaken.pluginName).eql(
            "unclaimed-app"
          );
        }
      );
    });
  });

  describe("createUserPlugin", () => {

    test("throw FORBIDDEN_ACTION if not logged in", async () => {
      return await apolloRestClientFactory.runWithApolloClient(
        "",
        async (_, apolloClient) => {
          const result = await apolloClient.mutate({
            mutation: CreateUserPluginDocument,
            variables: {
              name: "new-plugin",
              isPrivate: true
            },
          });
          expect(result.data.type).eql('UNAUTHENTICATED_ERROR');
        }
      );
    });

    test("throws name taken error if name taken", async () => {
      const [user, credential, plugin] = await loadFixtures<[User, UserAuthCredential, Plugin]>([
        "User:user_0",
        "UserAuthCredential:email_pass_for_test@gmail",
        "Plugin:plugin_user_public_0"
      ]);
      const sessionStorage = container.get(SessionStore);
      const session = await sessionStorage.setNewSession(user, credential);
      return await apolloRestClientFactory.runWithApolloClient(
        session.clientKey,
        async (_, apolloClient) => {
          const result = await apolloClient.mutate({
            mutation: CreateUserPluginDocument,
            variables: {
              name: plugin.name,
              isPrivate: true
            },
          });
          expect(result.data.createUserPlugin.type).eql("PLUGIN_NAME_TAKEN_ERROR");
        }
      );
    });

    test("creates new plugin when params are valid", async () => {
      const [user, credential] = await loadFixtures<[User, UserAuthCredential]>([
        "User:user_0",
        "UserAuthCredential:email_pass_for_test@gmail"
      ]);
      const sessionStorage = container.get(SessionStore);
      const session = await sessionStorage.setNewSession(user, credential);
      return await apolloRestClientFactory.runWithApolloClient(
        session.clientKey,
        async (_, apolloClient) => {
          const result = await apolloClient.mutate({
            mutation: CreateUserPluginDocument,
            variables: {
              name: "new-plugin",
              isPrivate: true
            },
          });
          expect(result.data.createUserPlugin.name).eql("new-plugin")
          expect(result.data.createUserPlugin.isPrivate).eql(true)
        }
      );
    });

  });
});
