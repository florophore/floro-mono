import * as fs from 'fs'
import * as path from 'path'
import { fileURLToPath } from 'url'
import { createServer as createViteServer } from 'vite'
import { render } from 'mjml-react';
import bodyParser from 'body-parser';
import express, { Express, Response } from 'express';

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const resolve = (p: string) => path.resolve(__dirname, p);

let template = fs.readFileSync(
  path.resolve(__dirname, 'index.html'),
  'utf-8'
);

async function createServer() {
    const app = express()

    console.log(resolve("../common-assets/assets"))
    const requestHandler = express.static(resolve("../common-assets/assets"));
    app.use(requestHandler);
    app.use("/assets", requestHandler);

  
    // Create Vite server in middleware mode and configure the app type as
    // 'custom', disabling Vite's own HTML serving logic so parent server
    // can take control
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'custom'
    })


    const extractMocksFromTemplate = (emailTemplate) => {
      let mocks = { default: emailTemplate?.mock ?? {}};
      for(let exp in emailTemplate) {
        if (/Mock$/.test(exp)) {
          const [mockName,] = exp.split('Mock');
          mocks[mockName] = emailTemplate[exp];
        }
      }
      return mocks;
    }
  
    // use vite's connect instance as middleware
    // if you use your own express router (express.Router()), you should use router.use
    app.use(vite.middlewares)
    app.use(bodyParser.json());

    app.get('/templates', async (req ,res) => {
      try {
        const templates = fs.readdirSync('./src/templates');
        const allTemplates = await Promise.all(templates.map(async (v) => {
          const emailTemplate = await vite.ssrLoadModule('./src/templates/' + v);
          const mocks = extractMocksFromTemplate(emailTemplate);
          const mockKeys = Object.keys(mocks);
          return {
            fileName: v,
            mocks: mockKeys,
            module: v.split('.')[0]
          }
        }));
      res.send(allTemplates);
      } catch (e) {
        console.error(e);
        res.send([])
      }
    })

    app.post('/templates', async (req, res) => {
      try {
        const componentName = req.body.componentName;
        const emailTemplate = await vite.ssrLoadModule('./src/templates/' + componentName);
        const { default: Template } = emailTemplate;
        const mocks = extractMocksFromTemplate(emailTemplate);
        const defaultMock = emailTemplate?.mocks?.default ?? {};
        const requestedMock = req.body.componentMock ?? 'default';
        const props = mocks?.[requestedMock] ?? defaultMock;
        const { html, errors } = render(Template(props), {validationLevel: 'strict'});
        if (errors.length > 0) {
          res.status(500).send(errors);
        } else {
          res.status(200).send({html, mocks})
        }
      } catch (e) {
        console.error(e);
      }
    });
  
    app.use('*', async (req, res) => {
      // serve index.html - we will tackle this next

      const url = req.originalUrl;
      const outTemplate = await vite.transformIndexHtml(url, template)
      res.status(200).set({ 'Content-Type': 'text/html' }).end(outTemplate)
    })
  
    app.listen(5173)
  }
  
  createServer()