import 'dotenv/config'
import {app} from 'electron';
import { startDaemon, killDaemon } from 'floro/src/daemon';
//import { buildFloroFilestructure } from 'floro/src/filestructure';
import './security-restrictions';
import {restoreOrCreateWindow} from '/@/mainWindow';

//buildFloroFilestructure();
(async () =>{
  await startDaemon();
})();

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
 * Shout down background process if all windows was closed
 */
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

/**
 * @see https://www.electronjs.org/docs/latest/api/app#event-activate-macos Event: 'activate'.
 */
app.on('activate', async () => {
  await restoreOrCreateWindow();
  //delete this
  // const window = await restoreOrCreateWindow();
  //serverTerminator = startServer(window);
});

/**
 * Create the application window when the background process is ready.
 */
app
  .whenReady()
  .then(restoreOrCreateWindow)
  .catch(e => console.error('Failed create window:', e));

if (import.meta.env.PROD) {
  app
    .whenReady()
    .then(() => import('electron-updater'))
    .then(({autoUpdater}) => autoUpdater.checkForUpdatesAndNotify())
    .catch(e => console.error('Failed check updates:', e));
}
