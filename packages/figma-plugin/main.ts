import * as fs from 'fs'
import * as path from 'path'
import { fileURLToPath } from 'url'
import { createServer as createViteServer } from 'vite'
import bodyParser from 'body-parser';
import express from 'express';
import compression from "compression";

// change this to whatever
const PORT = 11000;

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
        app.use("/plugins/floro-figma-plugin/assets", requestHandler);
        app.use(compression())
    }
  
    // Create Vite server in middleware mode and configure the app type as
    // 'custom', disabling Vite's own HTML serving logic so parent server
    // can take control
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'custom'
    })

    // use vite's connect instance as middleware
    // if you use your own express router (express.Router()), you should use router.use
    app.use(vite.middlewares)
    app.use(bodyParser.json());

    app.get("/plugins/floro-figma-plugin*", async (req, res) => {

        const template = isProduction ? indexHTMLTemplate : await vite.transformIndexHtml(req.originalUrl, indexHTMLTemplate);

        return res.status(200).set({ "Content-Type": "text/html" }).end(template);
    });

    app.listen(PORT);
  }
  
  createServer()