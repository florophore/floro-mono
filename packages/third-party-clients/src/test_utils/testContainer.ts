import "reflect-metadata"

import { Container, ContainerModule } from "inversify";
import express from 'express';
import http, { Server } from 'http';

import BackendModule from '../module';
import DBModule from "@floro/database/src/module";

const container: Container = new Container({
    autoBindInjectable: true,
    defaultScope: 'Singleton',
});

const downstreamDependencies =  new ContainerModule((bind): void => {
    const application = express();
    const httpServer = http.createServer(application);
    bind<Express.Application>('ExpressApplication').toConstantValue(application);
    bind(Server).toConstantValue(httpServer);
});

container.load(DBModule, downstreamDependencies, BackendModule);

export default container;