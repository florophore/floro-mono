import "reflect-metadata";

import * as fs from 'fs'
import * as path from 'path'
import { fileURLToPath } from 'url'
import { Container } from "inversify";

import BackendModule from '@floro/main-backend/src/module';
import DBModule from "@floro/database/src/module";
import WebModule from './server/module';
import AppServer from './server/AppServer'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

let template = fs.readFileSync(
  path.resolve(__dirname, 'index.html'),
  'utf-8'
);

const container: Container = new Container({
  autoBindInjectable: true,
  defaultScope: 'Singleton',
});

container.load(
  DBModule,
  BackendModule,
  WebModule
);

(async () => {
  const appServer = container.get(AppServer);
  appServer.startServer(template);
})();