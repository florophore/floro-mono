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

import path from "path";
import compression from "compression";
import serveStatic from "serve-static";
import busboy from 'connect-busboy';
import { fileURLToPath } from "url";

import { createServer as createViteServer } from "vite";

import { SchemaLink } from "@apollo/client/link/schema";
// eslint-disable-next-line 
import ApolloPkg from '@apollo/client';
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

  public async startServer(indexHTMLTemplate: string): Promise<void> {
    const storageRoot = await this.backend.startStorageClient();
    const schema = this.backend.buildExecutableSchema();
    await this.backend.startDatabase();
    this.backend.startRedis();

    this.app.use(cookieParser());
    this.app.use(busboy());
    this.app.use(express.json());
    this.app.use(express.urlencoded({ extended: true }));

    this.app.use("/graphql", graphqlUploadExpress());

    this.backend.setupRestRoutes(this.app);
    const apolloServer = this.backend.buildApolloServer();
    await apolloServer.start();
    apolloServer.applyMiddleware({ app: this.app });

    if (isDevelopment || isTest) {
      this.startMailDev();
    }

    // CORS POLICY
    this.app.use(
      cors({
        origin: [
          "http://localhost:63403",
          "http://localhost:9000",
          "https://floro.io",
        ],
      })
    );

    this.app.use((req, res, next) => {
      res.header("Access-Control-Allow-Origin", "http://localhost:63403,http://localhost:9000,https://floro.io");
      res.header("Access-Control-Allow-Methods", "GET,POST,PUT");
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
    this.app.use("/assets", requestHandler);

    if (storageRoot) {
      const storageRequestHandler = express.static(
        storageRoot
      );
      this.app.use(storageRequestHandler);
      this.app.use("/cdn", storageRequestHandler);
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
      try {
        const sessionContext = await this.backend.fetchSessionUserContext(req.cookies?.["user-session"]);
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
        const { appHtml, appState, helmet } = await render(
          url,
          { client },
          context
        );
        this.backend.requestCache.release(cacheKey);
        if (context.url && context.url != url) {
          return res.redirect(301, context.url);
        }
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
          .replace("__HELMET_LINK__", helmet?.link?.toString?.() ?? "");

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

  protected startMailDev() {
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

    try {
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
