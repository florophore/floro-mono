import { dialog, nativeImage } from 'electron'
import {
  autoUpdater
} from 'electron-updater'
import dialogIcon from "@floro/common-assets/assets/images/floro_logo.png";
import log from 'electron-log'

export function update(win: Electron.BrowserWindow) {
  const icon = nativeImage.createFromDataURL(dialogIcon)
  log.transports.file.level = "info";
  autoUpdater.logger = log;
  let hasAcked = false;
  autoUpdater.on('update-downloaded', (event) => {
    log.info("update-available");
    if (hasAcked) {
      return;
    }
    setTimeout(() => {
      dialog.showMessageBox({
        title: 'New Version Downloaded',
        message: 'A New Version of floro was downloaded. The update will be applied the next time you start the app. Close and restart now to run the latest version.',
        buttons: ['Restart', 'Later'],
        icon
      }).then(returnValue => {
        hasAcked = true;
        if (returnValue.response == 0){
          autoUpdater.quitAndInstall();
        }
      });
    }, 6000);
  });

  autoUpdater.on("error", (e) => {
    dialog.showMessageBox(win, { message: "An auto-update error occured" });
    console.error("There was a problem updating the application");
    console.error(e);
    log.info(e.message)
  });

  setInterval(() => {
    autoUpdater.checkForUpdatesAndNotify();
  }, 60_000)
  autoUpdater.checkForUpdatesAndNotify();

}