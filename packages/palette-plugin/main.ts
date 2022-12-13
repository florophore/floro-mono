import * as fs from 'fs'
import * as path from 'path'
import { fileURLToPath } from 'url'
import { createServer as createViteServer } from 'vite'
import bodyParser from 'body-parser';
import express from 'express';
import compression from "compression";

// change this to whatever
const PORT = 2000;

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const resolve = (p: string) => path.resolve(__dirname, p);
const isDevelopment = process.env.NODE_ENV == 'development';
const isProduction = process.env.NODE_ENV == "production";

let indexHTMLTemplate = fs.readFileSync(
  path.resolve(__dirname, isDevelopment ? 'index.html' : './dist/index.html'),
  'utf-8'
);

async function createServer() {
    const app = express()

    if (!isProduction) {
        const requestHandler = express.static(resolve("../common-assets/assets"));
        app.use(requestHandler);
        app.use("/assets", requestHandler);
    } else {
        const requestHandler = express.static(resolve("./dist/assets"));
        app.use("/plugins/floro-palette-plugin/assets", requestHandler);
        app.use(compression())
    }

    const publicRequestHandler = express.static(resolve("../floro"));
    app.use(publicRequestHandler);
    app.use("/plugins/floro-palette-plugin/floro", publicRequestHandler);
  
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'custom'
    })

    app.use(vite.middlewares)
    app.use(bodyParser.json());

    app.get("*", async (req, res) => {
      const template = isProduction
        ? indexHTMLTemplate
        : await vite.transformIndexHtml(req.originalUrl, indexHTMLTemplate);

      return res.status(200).set({ "Content-Type": "text/html" }).end(template);
    });

    app.listen(PORT);
  }
  
  createServer()