import "reflect-metadata";

import process from 'process';
import * as fs from 'fs'
import * as path from 'path'
import { fileURLToPath } from 'url'
import { Container } from "inversify";

import ConfigModule from '@floro/config/src/module';
import BackendModule from '@floro/backend/src/module';
import DBModule from "@floro/database/src/module";
import RedisModule from "@floro/redis/src/module";
import MailerModule from "@floro/mailer/src/module";
import WebModule from './server/module';
import AppServer from './server/AppServer'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const isDevelopment = process.env.NODE_ENV == 'development';

let template = fs.readFileSync(
  path.resolve(__dirname, isDevelopment ? 'index.html' : './dist/client/index.html'),
  'utf-8'
);

const container: Container = new Container({
  autoBindInjectable: true,
  defaultScope: 'Singleton',
});

container.load(
  ConfigModule,
  DBModule,
  RedisModule,
  MailerModule,
  BackendModule,
  WebModule
);

(async () => {
  const appServer = container.get(AppServer);
  appServer.startServer(template);
  console.log("started app...")
})();