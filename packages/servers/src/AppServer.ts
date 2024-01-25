import { inject, injectable } from "inversify";
import express, { Express, Response } from "express";
import { Server } from "http";
import Backend from "@floro/backend/src/Backend";
import { env } from "process";
import { createProxyMiddleware } from "http-proxy-middleware";
import MailDev from "maildev";
import cors from 'cors';
import cookieParser from 'cookie-parser';
import graphqlUploadExpress from "graphql-upload/graphqlUploadExpress.mjs";
import kill from 'kill-port';

import path from "path";
import compression from "compression";
import serveStatic from "serve-static";
import busboy from 'connect-busboy';
import { fileURLToPath } from "url";

import { createServer as createViteServer } from "vite";

import { SchemaLink } from "@apollo/client/link/schema";
// eslint-disable-next-line
import ApolloPkg from '@apollo/client';
import { LocalizedPhrases } from "@floro/common-generators/floro_modules/text-generator";

const { ApolloClient, InMemoryCache } = ApolloPkg;

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const resolve = (p: string) => path.resolve(__dirname, p);

const NODE_ENV = env.NODE_ENV;
const isProduction = NODE_ENV == "production";
const isDevelopment = NODE_ENV == "development";
const isTest = NODE_ENV == "test";

@injectable()
export default class AppServer {
  private app: Express;
  private server: Server;
  private backend: Backend;
  protected port = 9000;

  constructor(
    @inject("ExpressApplication") app,
    @inject(Server) server,
    @inject(Backend) backend
  ) {
    this.app = app;
    this.server = server;
    this.backend = backend;
  }

  protected distClient() {
    return serveStatic(resolve("../../main/dist/client"), {
      index: false,
    });
  }

  public async startServer(indexHTMLTemplate: string, shouldPerformMigrations: boolean): Promise<void> {
    await this.backend.startRedis();
    const publicStorageRoot = await this.backend.startPublicStorageClient();
    const privateStorageRoot = await this.backend.startPrivateStorageClient();

    await this.backend.startDatabase(shouldPerformMigrations);

    const schema = this.backend.buildExecutableSchema();

    this.app.use(cookieParser());
    this.app.use(busboy({
      limits: {
        fileSize: 1024 * 1024 * 20, //20MB limit
      },
    }));
    this.app.use(express.json({limit: '20mb'}));
    this.app.use(express.urlencoded({ extended: true, limit: '20mb' }));

    this.app.use("/graphql", graphqlUploadExpress());

    this.backend.setupRestRoutes(this.app);
    const apolloServer = this.backend.buildApolloServer();
    await apolloServer.start();
    apolloServer.applyMiddleware({ app: this.app });

    if (isDevelopment || isTest) {
      await this.startMailDev();
    }

    // CORS POLICY
    if (process.env?.['DOMAIN']) {
      this.app.use(
        cors({
          origin: [
            "null",
            "http://localhost:63403",
            `https://${process.env?.['DOMAIN']}`,
            `https://static-cdn.${process.env?.['DOMAIN']}`,
            `https://public-cdn.${process.env?.['DOMAIN']}`,
            `https://private-cdn.${process.env?.['DOMAIN']}`,
          ],
        })
      );

    } else {
      this.app.use(
        cors({
          origin: [
            "null",
            "http://localhost:63403",
            "http://localhost:9000",
          ],
        })
      );
    }

    this.app.use((_req, res, next) => {
      if (process.env?.['DOMAIN']) {
        res.header("Access-Control-Allow-Origin", `http://localhost:63403,https://${process.env?.['DOMAIN']},https://static-cdn.${process.env?.['DOMAIN']},https://public-cdn.${process.env?.['DOMAIN']},https://private-cdn.${process.env?.['DOMAIN']}`);
      } else {
        res.header("Access-Control-Allow-Origin", "http://localhost:63403,http://localhost:9000");
      }
      res.header("Access-Control-Allow-Methods", "GET,POST,PUT,OPTIONS");
      res.header("Access-Control-Allow-Headers", "Origin, Accept, X-Requested-With, Content-Type");
      res.header("Referrer-Policy", "no-referrer");
      next();
    });

    this.app.use("/proxy/*", (_req, res, next) => {
      res.header("Access-Control-Allow-Origin", "null");
      res.header("Access-Control-Allow-Methods", "GET,POST,PUT,OPTIONS");
      res.header("Access-Control-Allow-Headers", "Origin, Accept, X-Requested-With, Content-Type");
      res.header("Referrer-Policy", "no-referrer");
      next();
    });

    // DO NOT REMOVE!
    const NODE_ENV = process.env.NODE_ENV;
    // DO NOT REMOVE!
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "custom",
    });
    // Explanation:
    // Someone at vite thought it would be an awesome idea to set
    // the NODE_ENV to development whenever createViteServer is called.
    // ... this breaks everything in production builds...
    // Unfortunately directly importing the cjs or mjs, per the official
    // documentation doesn't work with type: "module" (which we require)
    // npm modules. For the time being we are going to play with fire
    // and assume vite server is start-up production safe.
    // DO NOT REMOVE!
    process.env.NODE_ENV = NODE_ENV;
    // DO NOT REMOVE!

    this.app.use(vite.middlewares);

    const requestHandler = express.static(
      resolve("../../common-assets/assets")
    );
    this.app.use(requestHandler);
    if (!isProduction) {
      this.app.use("/assets", requestHandler);
    }

    if (publicStorageRoot && !isProduction) {
      const storageRequestHandler = express.static(
        publicStorageRoot
      );
      this.app.use(storageRequestHandler);
      this.app.use("/cdn", storageRequestHandler);
    }

    if (privateStorageRoot && !isProduction) {
      const storageRequestHandler = express.static(
        privateStorageRoot
      );
      this.app.use(storageRequestHandler);
      this.app.use("/private-cdn", storageRequestHandler);
    }

    if (isProduction) {
      this.app.use(compression());
      this.app.use(this.distClient());
    }

    const { render } = await vite.ssrLoadModule(
      !isProduction ? "./src/entry-server.tsx" : "./dist/server/entry-server.js"
    );

    this.app.get("*", async (req, res, next): Promise<
      Response | undefined | void
    > => {
      const cacheKey = this.backend.requestCache.init();
      if (process.env?.['DOMAIN']) {
        res.header("Access-Control-Allow-Origin", `http://localhost:63403,https://${process.env?.['DOMAIN']},https://static-cdn.${process.env?.['DOMAIN']},https://public-cdn.${process.env?.['DOMAIN']},https://private-cdn.${process.env?.['DOMAIN']}`);
      } else {
        res.header("Access-Control-Allow-Origin", "http://localhost:63403,http://localhost:9000");
      }
      res.header("Access-Control-Allow-Methods", "GET,POST,PUT,OPTIONS");
      res.header("Access-Control-Allow-Headers", "Origin, Accept, X-Requested-With, Content-Type");
      res.header("Referrer-Policy", "no-referrer");
      try {
        const sessionContext = await this.backend.fetchSessionUserContext(req.cookies?.["user-session"]);
        const initTheme = req.cookies?.["theme-preference"] ?? "light";
        const initLocaleCode = req.cookies?.["locale-code"] as keyof LocalizedPhrases["locales"]&string ?? "EN";
        const url = req.originalUrl;
        const template = isProduction
          ? indexHTMLTemplate
          : await vite.transformIndexHtml(url, indexHTMLTemplate);
        const context = {
          authorizationToken: sessionContext?.authorizationToken,
          currentUser: sessionContext?.currentUser,
          session: sessionContext?.session,
          url,
          should404: false,
          isSSR: true,
          cacheKey
        };
        const client = new ApolloClient({
          ssrMode: true,
          link: new SchemaLink({
            schema,
            context,
          }),
          cache: new InMemoryCache(),
        });
        const ssrPhraseKeySet = new Set<string>();
        const { appHtml, appState, helmet } = await render(
          url,
          {
            client,
            floroText: this.backend.floroTextStore.getText(),
            localeLoads: this.backend.floroTextStore.getLocaleLoads(),
            env: env.VITE_BUILD_ENV_NORMALIZED ?? "development",
            initLocaleCode,
            initTheme,
            ssrPhraseKeySet
          },
          context
        );
        this.backend.requestCache.release(cacheKey);
        if (context.url && context.url != url) {
          return res.redirect(301, context.url);
        }

        const baseUrl = process?.env?.['DOMAIN'] ? `https://${process.env?.['DOMAIN']}` : 'http://localhost:9000';
        const html = template
          .replace(`<!--ssr-outlet-->`, appHtml)
          .replace(
            "__APP_STATE__",
            JSON.stringify(appState).replace(/</g, "\\u003c")
          )
          .replace(
            "__HELMET_HTML__",
            helmet?.htmlAttributes?.toString?.() ?? ""
          )
          .replace(
            "__HELMET_BODY__",
            helmet?.bodyAttributes?.toString?.() ?? ""
          )
          .replace("__HELMET_TITLE__", helmet?.title?.toString?.() ?? "")
          .replace("__HELMET_META__", helmet?.meta?.toString?.() ?? "")
          .replace("__HELMET_LINK__", helmet?.link?.toString?.() ?? "")
          .replace("__BASE_URL__", baseUrl)
          .replace("__SSR_FLORO_TEXT__", this.backend.floroTextStore.getTextSubSet(initLocaleCode, ssrPhraseKeySet))
          .replace("__SSR_FLORO_LOCALE_LOADS__", this.backend.floroTextStore.getLocaleLoadsString());

        if (context.should404) {
          return res.status(404).set({ "Content-Type": "text/html" }).end(html);
        }
        return res.status(200).set({ "Content-Type": "text/html" }).end(html);
      } catch (e) {
        this.backend.requestCache.release(cacheKey);
        vite.ssrFixStacktrace(e as Error);
        next(e);
      }
    });

    await new Promise<void>((resolve) =>
      this.server.listen({ port: this.port }, resolve)
    );
    console.log(`🚀 Server ready at http://127.0.0.1:${this.port}`);
  }

  protected async startMailDev() {
    await (new Promise((resolve) => {
      kill(1080, 'tcp')
      .then((message) => {
        console.log("KILLED", message)
        resolve(true);
      })
      .catch((e) => {
        console.log("FAILED KILL", e);
        resolve(false);
      })
    }))


    try {
      const maildev = new MailDev({
        basePathname: "/maildev",
      });

      maildev.listen(function (error: Error) {
        if (error) {
          console.error("Mock mailer error", error);
        } else {
          console.log("send emails to port 1025!");
        }
      });
      const proxy = createProxyMiddleware("/maildev", {
        target: `http://localhost:1080`,
        ws: true,
      });

      this.app.use(proxy);
    } catch (e) {
      console.error(e);
    }
  }
}
