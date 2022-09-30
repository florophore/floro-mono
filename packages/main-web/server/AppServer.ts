import { inject, injectable } from "inversify";
import express, { Express } from 'express';
import { Server } from 'http';
import Backend from '../../main-backend/src/Backend';
import { env } from 'process';
import { createProxyMiddleware } from 'http-proxy-middleware';
import MailDev from 'maildev';

import path from "path";
import compression from 'compression';
import serveStatic from "serve-static";
import { fileURLToPath } from 'url'

import { createServer as createViteServer } from 'vite'
import ApolloClientPackage from "@apollo/client";

import { SchemaLink } from '@apollo/client/link/schema';
const { ApolloClient, InMemoryCache } = ApolloClientPackage;

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const resolve = (p: string) => path.resolve(__dirname, p);

const NODE_ENV = env.NODE_ENV;
const isProduction = NODE_ENV == 'production';
const isDevelopment = NODE_ENV == 'development';
const isTest = NODE_ENV == 'test';

@injectable()
export default class AppServer {
  private app: Express;
  private server: Server;
  private backend: Backend;

  constructor(
    @inject("ExpressApplication") app,
    @inject(Server) server,
    @inject(Backend) backend
  ) {
    this.app = app;
    this.server = server;
    this.backend = backend;
  }

  public async startServer(indexHTMLTemplate: string): Promise<void> {
    const schema = this.backend.buildExecutableSchema();
    await this.backend.startDatabase();
    this.backend.startRedis();
    await this.backend.startMailer();
    const apolloServer = this.backend.buildApolloServer();
    await apolloServer.start();
    apolloServer.applyMiddleware({ app: this.app });

    if (isDevelopment || isTest) {
      this.startMailDev();
    }

    const NODE_ENV = process.env.NODE_ENV;
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "custom",
    });
    // HACK!!!
    // someone at think thought it would be an awesome idea to set
    // the NODE_ENV to development, whenever createViteServer is called.
    // Unfortunately directly importing the cjs or mjs, per the official
    // documentation doesn't work with type: module node modules. For the
    // time being we are going to play with fire and assume vite server is
    // start-up production safe.
    // DO NOT REMOVE!
    process.env.NODE_ENV = NODE_ENV;
    // DO NOT REMOVE!

    this.app.use(vite.middlewares);

    const requestHandler = express.static(resolve("../assets"));
    this.app.use(requestHandler);
    this.app.use("/assets", requestHandler);
  
    if (isProduction) {
      this.app.use(compression());
      this.app.use(
        serveStatic(resolve("../dist/client"), {
          index: false,
        }),
      );
    }

    this.app.use("*", async (req, res, next) => {
      try {
        const url = req.originalUrl;
        const template = isProduction ? indexHTMLTemplate : await vite.transformIndexHtml(url, indexHTMLTemplate);
        const { render } = await vite.ssrLoadModule(!isProduction ? "./src/entry-server.tsx" : "./dist/server/entry-server.js");
        const authorizationToken: string|undefined = req.header('authorization-token');
        const context = {
            authorizationToken,
            url,
            should404: false,
            isSSR: true
        };
        const client = new ApolloClient({
          ssrMode: true,
          link: new SchemaLink({
            schema,
            context
          }),
          cache: new InMemoryCache(),
        });
        const { appHtml, appState } = await render(url, { client }, context);
        if (context.url && context.url != url) {
          return res.redirect(301, context.url)
        }
        const html = template
        .replace(`<!--ssr-outlet-->`, appHtml)
        .replace('__APP_STATE__', JSON.stringify(appState).replace(/</g, '\\u003c'));
        if (context.should404) {
          return res.status(404).set({ "Content-Type": "text/html" }).end(html);
        }
        return res.status(200).set({ "Content-Type": "text/html" }).end(html);
      } catch (e) {
        vite.ssrFixStacktrace(e as Error);
        next(e);
      }
    });

    await new Promise<void>((resolve) =>
      this.server.listen({ port: 9000 }, resolve)
    );
    console.log(`🚀 Server ready at http://127.0.0.1:9000`);
  }

  private startMailDev() {
    const maildev = new MailDev({
      basePathname: "/maildev",
    });

    maildev.listen(function (err) {
      console.log("send emails to port 1025!");
    });

    const proxy = createProxyMiddleware("/maildev", {
      target: `http://localhost:1080`,
      ws: true,
    });

    this.app.use(proxy);
  }
}