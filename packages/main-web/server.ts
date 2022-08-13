import * as fs from 'fs'
import * as path from 'path'
import { fileURLToPath } from 'url'
import express from 'express'
import { createServer as createViteServer } from 'vite'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

let template = fs.readFileSync(
  path.resolve(__dirname, 'index.html'),
  'utf-8'
)

async function createServer() {
  const app = express()

  // Create Vite server in middleware mode and configure the app type as
  // 'custom', disabling Vite's own HTML serving logic so parent server
  // can take control
  const vite = await createViteServer({
    server: { middlewareMode: true },
    appType: 'custom'
  })

  // add apollo
  // add apollo server
  // hydrate state
  // add helmet
  // finish productionization


  // use vite's connect instance as middleware
  // if you use your own express router (express.Router()), you should use router.use
  app.use(vite.middlewares)

  app.use('*', async (req, res, next) => {
    try {
      const url = req.originalUrl
      const t = await vite.transformIndexHtml(url, template);
      const { render } = await vite.ssrLoadModule('/src/entry-server.tsx')
      const appHtml = render(url);
      const html = t.replace(`<!--ssr-outlet-->`, appHtml)
      res.status(200).set({ 'Content-Type': 'text/html' }).end(html)
    } catch(e) {
      vite.ssrFixStacktrace(e as Error)
      next(e)
    }
  })

  app.listen(3000)
  console.log("listening on port 3000")
}

createServer()