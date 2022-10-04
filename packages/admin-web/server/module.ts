import "reflect-metadata"

import { ContainerModule  } from 'inversify';
import express from 'express';
import http, { Server } from 'http';
import AdminAppServer from "./AdminAppServer";

export default new ContainerModule((bind): void => {
    bind(AdminAppServer).to(AdminAppServer);
    const application = express();
    const httpServer = http.createServer(application);
    bind<Express.Application>('ExpressApplication').toConstantValue(application);
    bind(Server).toConstantValue(httpServer);
});