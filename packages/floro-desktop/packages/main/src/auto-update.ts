import { autoUpdater } from "electron-updater"
import { app, dialog, ipcMain } from "electron"

const WINDOW_CLOSE_EVENT = "window-close"
const OPEN_SETTINGS_EVENT = "open-settings"
const SETTINGS_CHANGE_EVENT = "settings-change"

const UPDATE_AVAILABLE_EVENT = "update-available"
const UPDATE_NOT_AVAILABLE_EVENT = "update-not-available"
const UPDATE_DOWNLOADED = "update-downloaded"
const UPDATE_ERROR = "update-error"
const UPDATE_DOWNLOAD_PROGRESS = "update-download-progress"

const UPDATE_START_DOWNLOAD = "auto-update:startDownload"
const UPDATE_INSTALL_AND_RESTART = "auto-update:installAndRestart"
const UPDATE_CHECK_FOR_UPDATES = "auto-update:checkForUpdates"
import log from 'electron-log';

// will reference the main window
let window

autoUpdater.logger = log;
//autoUpdater.logger.transports.file.level = "info"

autoUpdater.autoDownload = false
autoUpdater.allowDowngrade = true

autoUpdater.on('error', (error) => {
    window?.webContents.send(UPDATE_ERROR, error == null ? "unknown" : (error.stack || error).toString())
})

autoUpdater.on('update-available', (info) => {
    window?.webContents.send(UPDATE_AVAILABLE_EVENT, {
        version: info.version,
        releaseDate: info.releaseDate,
        currentVersion: app.getVersion(),
    })
})

autoUpdater.on('update-not-available', () => {
    window?.webContents.send(UPDATE_NOT_AVAILABLE_EVENT)
})

autoUpdater.on('update-downloaded', () => {
    window?.webContents.send(UPDATE_DOWNLOADED)
})

autoUpdater.on('download-progress', (info) => {
    window?.webContents.send(UPDATE_DOWNLOAD_PROGRESS, {
        percent: info.percent,
        total: info.total,
        transferred: info.transferred,
        bytesPerSecond: info.bytesPerSecond,
    })
})

// handle messages from Vue components
ipcMain.handle(UPDATE_START_DOWNLOAD, () => {
    autoUpdater.downloadUpdate()
})

ipcMain.handle(UPDATE_INSTALL_AND_RESTART, () => {
    setImmediate(() => autoUpdater.quitAndInstall(true, true))
})


export function checkForUpdates() {
    //autoUpdater.allowPrerelease = CONFIG.get("settings.allowBetaVersions")
    autoUpdater.checkForUpdates()
    // for development, the autoUpdater will not work, so we need to trigger the event manually
    if (process.env.NODE_ENV === "development") {
        window?.webContents.send(UPDATE_NOT_AVAILABLE_EVENT)
    }
}

ipcMain.handle(UPDATE_CHECK_FOR_UPDATES, () => {
    checkForUpdates()
})

export function initializeAutoUpdate(win) {
    window = win

    /**
     * To debug auto updates (actually downloading an update won't work),
     * uncomment the lines below, and create a dev-app-update.yml with the content:
     *
     * owner: florophore
     * repo: floro-mono
     * provider: github
     */
    // Useful for some dev/debugging tasks, but download can
    // not be validated becuase dev app is not signed
    //autoUpdater.updateConfigPath = "/Users/jamiedev/git/floro-mono/packages/floro-desktop/dev-app-update.yml" //path.join(__dirname, 'dev-app-update.yml');
    //autoUpdater.forceDevUpdateConfig = true;
}