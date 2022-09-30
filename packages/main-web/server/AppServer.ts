import { inject, injectable } from "inversify";
import express, { Express } from 'express';
import { Server } from 'http';
import Backend from '@floro/main-backend/src/Backend';
import { env } from 'process';
import path from 'node:path';
import { fileURLToPath } from 'node:url'
import { createProxyMiddleware } from 'http-proxy-middleware';
import MailDev from 'maildev';

import { createServer as createViteServer } from 'vite'
import ApolloClientPkg from "@apollo/client";
import { SchemaLink } from '@apollo/client/link/schema';

const { ApolloClient, InMemoryCache } = ApolloClientPkg;

const NODE_ENV = env.NODE_ENV;
const isDevelopment = NODE_ENV == 'development';
const isProduction = NODE_ENV == 'production';
const isTest = NODE_ENV == 'test';
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const resolve = (p) => path.resolve(__dirname, p)

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
      mode: "production",
    }); 
    // STUPID VITE HACK: createViteServer resets NODE_ENV to development, because
    // that's a really awesome thing to do.
    // direct import suggested in official vite ssr docs doesn't work either for either mjs or cjs
    //!! DO NOT REMOVE !!
    process.env.NODE_ENV = NODE_ENV;
    //!! DO NOT REMOVE !!

    this.app.use(vite.middlewares);
    const requestHandler = express.static(resolve("../assets"));
    this.app.use(requestHandler);
    this.app.use("/assets", requestHandler);

    if (isProduction) {
      this.app.use((await import('compression')).default())
      this.app.use(
        (await import('serve-static')).default(resolve('../dist/client'), {
          index: false
        })
      )
    }

    this.app.use("*", async (req, res, next) => {
      try {
        const url = req.originalUrl;
        const template = isProduction ? indexHTMLTemplate : await vite.transformIndexHtml(url, indexHTMLTemplate);
        const { render } = await vite.ssrLoadModule(!isProduction ? "/src/entry-server.tsx" : "/dist/server/entry-server.js");
        const authorizationToken: string|undefined = req.header('authorization-token');
        const context = {
            authorizationToken
        };
        const client = new ApolloClient({
          ssrMode: true,
          link: new SchemaLink({
            schema,
            context
          }),
          cache: new InMemoryCache(),
        });
        const { appHtml, appState } = await render(url, { client });
        const html = template
        .replace(`<!--ssr-outlet-->`, appHtml)
        .replace('__APP_STATE__', JSON.stringify(appState).replace(/</g, '\\u003c'));
        res.status(200).set({ "Content-Type": "text/html" }).end(html);
      } catch (e) {
        if (isDevelopment) {
          vite.ssrFixStacktrace(e as Error);
        } else {
          console.log(e);
        }
        next(e);
      }
    });

    await new Promise<void>((resolve) =>
      this.server.listen({ port: 9000 }, resolve)
    );
    console.log(`🚀 Server ready at http://localhost:9000`);
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