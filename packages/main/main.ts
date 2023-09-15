//import 'dotenv/config'
import process from 'process';
import * as fs from 'fs'
import * as path from 'path'
import { fileURLToPath } from 'url'

import container from '@floro/servers/src/container';
import AppServer from '@floro/servers/src/AppServer';

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const isDevelopment = process.env.NODE_ENV == 'development';

let template = fs.readFileSync(
  path.resolve(__dirname, isDevelopment ? 'index.html' : './dist/client/index.html'),
  'utf-8'
);

(async () => {
  console.log("DOMAIN ENV VAR", process.env?.['DOMAIN'])
  console.log("DEPLOY ENV", process.env?.['DEPLOY_ENV'])
  const appServer = container.get(AppServer);
  appServer.startServer(template);
  console.log("started main app...")
})();