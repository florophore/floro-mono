import { inject, injectable } from "inversify";
import { ApolloServer } from 'apollo-server-express';
import { Express } from 'express';
import { Server } from 'http';
import Backend from '@floro/main-backend/src/Backend';

import { createServer as createViteServer } from 'vite'

@injectable()
export default class AppServer {
    private apolloServer: ApolloServer;
    private app: Express;
    private server: Server;

    constructor(
        @inject('ExpressApplication') app,
        @inject(Server) server,
        @inject(Backend) backend
        ) {
        this.app =  app;
        this.server = server;
        this.apolloServer = backend.buildApolloServer();
    } 

    public async startServer(indexHTMLTemplate: string): Promise<void> {
        await this.apolloServer.start();
        this.apolloServer.applyMiddleware({ app: this.app });

        const vite = await createViteServer({
          server: { middlewareMode: true },
          appType: "custom",
        });

        this.app.use(vite.middlewares);

        this.app.use('*', async (req, res, next) => {
            try {
              const url = req.originalUrl
              const template = await vite.transformIndexHtml(url, indexHTMLTemplate);
              const { render } = await vite.ssrLoadModule('/src/entry-server.tsx')
              const appHtml = render(url);
              const html = template.replace(`<!--ssr-outlet-->`, appHtml)
              res.status(200).set({ 'Content-Type': 'text/html' }).end(html)
            } catch(e) {
              vite.ssrFixStacktrace(e as Error)
              next(e)
            }
        });

        await new Promise<void>(resolve => this.server.listen({ port: 3000 }, resolve));
        console.log(`🚀 Server ready at http://localhost:3000`);
    }

}