import "reflect-metadata"

import { Container, ContainerModule } from "inversify";
import express from 'express';
import http, { Server } from 'http';

import MainConfigModule from "@floro/config/src/module";
import MailerClientModule from "@floro/mailer/src/module";
import { mockMailerDeps } from '@floro/mailer/src/test/test_utils/testContainer';
import BackendModule from '../../module';
import DBModule from "@floro/database/src/module";
import RedisModule from "@floro/redis/src/module";
import ThirdPartyServicesModule from '@floro/third-party-services/src/module'; 
import StorageModule from '@floro/storage/src/module'; 

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

container.load(
  MainConfigModule,
  MailerClientModule,
  ThirdPartyServicesModule,
  DBModule,
  RedisModule,
  StorageModule,
  mockMailerDeps,
  downstreamDependencies,
  BackendModule
);

export default container;