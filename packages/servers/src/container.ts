import "reflect-metadata";

import { Container } from "inversify";

import ServersModule from './module';
import ConfigModule from '@floro/config/src/module';
import BackendModule from '@floro/backend/src/module';
import DBModule from "@floro/database/src/module";
import RedisModule from "@floro/redis/src/module";
import MailerModule from "@floro/mailer/src/module";
import ThirdPartyServicesModule from '@floro/third-party-services/src/module'; 
import StorageModule from "@floro/storage/src/module";

const container: Container = new Container({
  autoBindInjectable: true,
  defaultScope: 'Singleton',
});

container.load(
  ConfigModule,
  ThirdPartyServicesModule,
  DBModule,
  RedisModule,
  MailerModule,
  BackendModule,
  ServersModule,
  StorageModule
);

export default container;