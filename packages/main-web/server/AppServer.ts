import { inject, injectable } from "inversify";
import { Express } from 'express';
import { Server } from 'http';
import Backend from '@floro/main-backend/src/Backend';
import { env } from 'process';
import { createProxyMiddleware } from 'http-proxy-middleware';
import MailDev from 'maildev';

import { createServer as createViteServer } from 'vite'

const NODE_ENV = env.NODE_ENV;
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
    await this.backend.startDatabase();
    this.backend.startRedis();
    await this.backend.startMailer();
    const apolloServer = this.backend.buildApolloServer();
    await apolloServer.start();
    apolloServer.applyMiddleware({ app: this.app });

    if (isDevelopment || isTest) {
      this.startMailDev();
    }

    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "custom",
    });

    this.app.use(vite.middlewares);

    this.app.use("*", async (req, res, next) => {
      try {
        const url = req.originalUrl;
        const template = await vite.transformIndexHtml(url, indexHTMLTemplate);
        const { render } = await vite.ssrLoadModule("/src/entry-server.tsx");
        const appHtml = render(url);
        const html = template.replace(`<!--ssr-outlet-->`, appHtml);
        res.status(200).set({ "Content-Type": "text/html" }).end(html);
      } catch (e) {
        vite.ssrFixStacktrace(e as Error);
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
      console.log("We can now sent emails to port 1025!");
    });

    const proxy = createProxyMiddleware("/maildev", {
      target: `http://localhost:1080`,
      ws: true,
    });

    this.app.use(proxy);
  }
}