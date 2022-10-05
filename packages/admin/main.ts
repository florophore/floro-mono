import process from 'process';
import * as fs from 'fs'
import * as path from 'path'
import { fileURLToPath } from 'url'

import container from '@floro/servers/src/container';
import AdminAppServer from '@floro/servers/src/AdminAppServer';

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const isDevelopment = process.env.NODE_ENV == 'development';

let template = fs.readFileSync(
  path.resolve(__dirname, isDevelopment ? 'index.html' : './dist/client/index.html'),
  'utf-8'
);

(async () => {
  const adminAppServer = container.get(AdminAppServer);
  adminAppServer.startServer(template);
  console.log("started admin app...")
})();