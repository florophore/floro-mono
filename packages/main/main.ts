// just for development
import 'dotenv/config'
import process from 'process';
import * as fs from 'fs'
import * as path from 'path'
import { fileURLToPath } from 'url'
import EventEmmitter from 'events';
import cluster from 'node:cluster';
import os from 'os';

EventEmmitter.defaultMaxListeners = 50;

import container from '@floro/servers/src/container';
import AppServer from '@floro/servers/src/AppServer';
import Backend from '@floro/backend/src/Backend';

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const isDevelopment = process.env.NODE_ENV == 'development';

let template = fs.readFileSync(
  path.resolve(__dirname, isDevelopment ? 'index.html' : './dist/client/index.html'),
  'utf-8'
);

(async () => {
  const numCPUs = os.cpus().length;
  if (process?.env?.RUN_AS_CLUSTER == "TRUE" && cluster.isPrimary && numCPUs > 1) {
    const backend = container.get(Backend);
    await backend.startDatabase(true);

    for (let i = 0; i < numCPUs; i++) {
      const worker = cluster.fork();
      worker.on('exit', (code, signal) => {
        if (signal) {
          console.log(`worker was killed by signal: ${signal}`);
        } else if (code !== 0) {
          console.log(`worker exited with error code: ${code}`);
        } else {
          console.log('worker success!');
        }
      });
    }
  } else {
    const shouldPerformMigrations = process?.env?.RUN_AS_CLUSTER != "TRUE" || numCPUs <= 1;
    const appServer = container.get(AppServer);
    appServer.startServer(template, shouldPerformMigrations);
    console.log("started main app...")
  }
})();