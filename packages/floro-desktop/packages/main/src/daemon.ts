//import { killPortProcess  } from 'kill-port-process';
import kill from 'kill-port';
import { ChildProcess, fork } from "child_process";
import * as path from 'path';
import * as net from 'net';

const DAEMON_PORT = 63403;

const getFloroScriptPath = () => {
  try {
  let floroPath = require.resolve("floro");
  return  path.join(path.dirname(floroPath), 'server.js');
  } catch(e) {
    return  path.join(__dirname, 'server.js');
  }
}

const isPortOccupied = async (port: number): Promise<boolean> => {
  return new Promise((resolve) => {
      let s = net.createServer();
      s.once('error', (err) => {
          s.close();
          if (err["code"] == "EADDRINUSE") {
              resolve(true);
          } else {
              resolve(true);
          }
      });
      s.once('listening', () => {
          s.close();
          resolve(false);
      });
      s.listen(port);
  });
}

const freePort = async () => {
  try {
    await kill(DAEMON_PORT, 'tcp')
    return;
  } catch(e) {
    console.log(e);
  }
}

let child: ChildProcess;

export const startDaemon = async () => {
  const isOccupied = await isPortOccupied(DAEMON_PORT);
  if (isOccupied) {
    await freePort();
  }
  child = fork(getFloroScriptPath())
}

export const killDaemon =() => {
  if (child) {
    child.kill('SIGHUP')
  }
}