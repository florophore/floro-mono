import container from "../test_utils/testContainer";
import { test } from "mocha";

import "../test_utils/setupTests";

import { loadFixtures } from "@floro/database/src/test/test_utils/setupFixtures";

import { Plugin } from "@floro/database/src/entities/Plugin";
import { User } from "@floro/database/src/entities/User";
import Backend from "../../Backend";
import { GraphQLSchema } from "graphql";
import { ApolloServer } from "apollo-server-express";
import ApolloRestClientFactory from "../../controllers/ApolloRestClientFactory";
import { UserAuthCredential } from "@floro/database/src/entities/UserAuthCredential";
import SessionStore from "@floro/redis/src/sessions/SessionStore";
import express, { Express } from "express";
import { Server } from "http";
import request from "supertest";
import path, { dirname } from "path";
import tar from "tar";
import * as fs from "fs";
import { fileURLToPath } from "url";
import busboy from "connect-busboy";
import { expect } from "chai";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

describe("PluginController", () => {
  let backend: Backend;
  let schema: GraphQLSchema;
  let apolloServer: ApolloServer;
  let apolloRestClientFactory: ApolloRestClientFactory;
  let app: Express;
  let server: Server | null = null;

  beforeEach((done) => {
    backend = container.get(Backend);
    schema = backend.buildExecutableSchema();
    apolloServer = backend.buildApolloServer();
    apolloServer.start().then(async () => {
      await backend.startPublicStorageClient();
      await backend.startPrivateStorageClient();
      apolloRestClientFactory = container.get(ApolloRestClientFactory);
      apolloRestClientFactory.setSchema(schema);
      app = express();
      app.use(busboy());
      backend.setupRestRoutes(app);
      server = app.listen(function (err) {
        if (err) {
          return done(err);
        }
        done();
      });
    });
  });

  afterEach(async () => {
    await apolloServer.stop();
    if (server) {
      server.close();
      server = null;
    }
  });

  describe("/api/plugin/upload", () => {
    const mockPath = path.join(__dirname, "..", "mocks", "mock-plugin");
    const tarName = `mock-plugin@0.0.0.tar.gz`;
    const tarPath = path.join(__dirname, "..", "mocks", "out", tarName);
    let user: User;
    let credential: UserAuthCredential;
    //let plugin: Plugin;

    beforeEach(async () => {
      [user, credential] = await loadFixtures<
        [User, UserAuthCredential, Plugin]
      >([
        "User:user_0",
        "UserAuthCredential:email_pass_for_test@gmail",
        "Plugin:palette_plugin_user_public_0",
      ]);
      if (fs.existsSync(tarPath)) {
        fs.rmSync(tarPath, { recursive: true });
      }
      await tar.create(
        {
          gzip: true,
          file: tarPath,
          C: mockPath,
          portable: true,
        },
        await fs.promises.readdir(mockPath)
      );
    });

    test("end to end plugin upload", async () => {
      const sessionStorage = container.get(SessionStore);
      const session = await sessionStorage.setNewSession(user, credential);
      await new Promise((resolve) => {
        request(app)
          .post("/api/plugin/upload")
          .set("Content-Type", "multipart/form-data")
          .set("session_key", session.clientKey)
          .attach("file", tarPath)
          .expect(200, (err, res) => {
            expect(res.text).eq('{"message":"Successfully uploaded 0.0.0"}');
            resolve(null);
          });
      });
      const signedUrl: string = await new Promise((resolve) => {
        request(app)
          .get("/api/plugin/palette/0.0.0/install")
          .set("session_key", session.clientKey)
          .send()
          .end((err, res) => {
            resolve(res.body.link);
          });
      });
      const [, url] = signedUrl.split("http://localhost:9000");
      await new Promise((resolve) => {
        request(app)
          .get(url)
          .send()
          .end((err, res) => {
            expect(res.status).eql(200);
            resolve(null);
          });
      });
      await new Promise((resolve) => {
        request(app)
          .get("/api/plugin/palette/0.0.0/manifest")
          .set("session_key", session.clientKey)
          .send()
          .end((err, res) => {
            expect(res.status).eql(200);
            resolve(null);
          });
      });
      await new Promise((resolve) => {
        request(app)
          .get("/plugins/palette/0.0.0")
          .set("session_key", session.clientKey)
          .send()
          .end((err, res) => {
            expect(res.status).eql(200);
            resolve(null);
          });
      });
    });
  });
});
