import { inject, injectable } from "inversify";
import { Server } from 'http';
import AdminBackend from '../../backend/src/AdminBackend';
import AppServer from '@floro/main-web/server/AppServer';

import { fileURLToPath } from 'url';
import serveStatic from 'serve-static';
import path from 'path';

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const resolve = (p: string) => path.resolve(__dirname, p);

@injectable()
export default class AdminAppServer extends AppServer {
  protected port: number = 8000;

  constructor(
    @inject("ExpressApplication") app,
    @inject(Server) server,
    @inject(AdminBackend) backend
  ) {
    super(
      app,
      server,
      backend
    );
  }

  protected distClient() {
    return serveStatic(resolve("../dist/client"), {
      index: false,
    })
  }

  protected startMailDev() {/*will conflict with main app*/}
}