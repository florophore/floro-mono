import type {Request, Response} from 'express';
import express from 'express';
import http from 'http';
import type {BrowserWindow} from 'electron';
import {createHttpTerminator} from 'http-terminator';

const app = express();
const server = http.createServer(app);
//const io = new Server(server);

export default function startStart(mainWindow: BrowserWindow) {
  app.get('/', async (req: Request, res: Response) => {
    res.send('testing the waters');
    mainWindow.show();
    return;
  });

  const PORT = 63121;
  server.listen(PORT, () => console.log(`Express server listening on port ${PORT}`));
  return createHttpTerminator({
    server,
  });
}
