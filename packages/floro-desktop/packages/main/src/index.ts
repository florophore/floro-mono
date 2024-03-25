import 'dotenv/config';

import {app, powerMonitor, powerSaveBlocker} from 'electron';
import { buildFloroFilestructure, setFloroEnv } from "floro/src/filestructure";
import './security-restrictions';
import {restoreOrCreateWindow} from '/@/mainWindow';
import {platform} from 'node:process';
import { startDaemon, killDaemon } from './daemon';
import {getVersion} from '../../../version/getVersion.mjs';
import { init } from '@sentry/electron/main';

init({
  dsn: import.meta.env.VITE_DESKTOP_SENTRY_DSN,
});

if (import.meta.env.VITE_BUILD_ENV === "dev") {
  setFloroEnv("dev");
}

if (import.meta.env.VITE_BUILD_ENV === "staging") {
  setFloroEnv("staging");
}

if (import.meta.env.VITE_BUILD_ENV === "prod") {
  setFloroEnv("production");
}

buildFloroFilestructure();

const version = getVersion();
console.log("running version: " + version);

/**
 * Prevent electron from running multiple instances.
 */
const isSingleInstance = app.requestSingleInstanceLock();
if (!isSingleInstance) {
  app.quit();
  process.exit(0);
}
app.on('second-instance', restoreOrCreateWindow);

/**
 * Disable Hardware Acceleration to save more system resources.
 */
app.disableHardwareAcceleration();

/**
 * Kill Daemon
 */
app.on('before-quit', () => {
  killDaemon();
});

/**
 * Shout down background process if all windows was closed
 */
app.on('window-all-closed', () => {
  if (platform !== 'darwin') {
    app.quit();
  }
});

/**
 * @see https://www.electronjs.org/docs/latest/api/app#event-activate-macos Event: 'activate'.
 */
app.on('activate', restoreOrCreateWindow);

app.commandLine.appendSwitch('js-flags', '--max-old-space-size=4096')

/**
 * Create the application window when the background process is ready.
 */
app
  .whenReady()
  .then(async () => {
    startDaemon();
    restoreOrCreateWindow();
    powerMonitor.on("lock-screen", () => {
      powerSaveBlocker.start("prevent-app-suspension");
    });
    powerMonitor.on("suspend", () => {
      powerSaveBlocker.start("prevent-app-suspension");
    });
  })
  .catch(e => console.error('Failed create window:', e));

/**
 * Check for app updates, install it in background and notify user that new version was installed.
 * No reason run this in non-production build.
 * @see https://www.electron.build/auto-update.html#quick-setup-guide
 *
 * Note: It may throw "ENOENT: no such file app-update.yml"
 * if you compile production app without publishing it to distribution server.
 * Like `npm run compile` does. It's ok 😅
 */
if (import.meta.env.PROD) {
  app
    .whenReady()
    .then(() =>
      /**
       * Here we forced to use `require` since electron doesn't fully support dynamic import in asar archives
       * @see https://github.com/electron/electron/issues/38829
       * Potentially it may be fixed by this https://github.com/electron/electron/pull/37535
       */
      require('electron-updater').autoUpdater.checkForUpdatesAndNotify(),
    )
    .catch(e => console.error('Failed check and install updates:', e));
}
