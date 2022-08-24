import {app, BrowserWindow, ipcMain, ipcRenderer, MessageChannelMain, nativeTheme} from 'electron';
import {join} from 'path';
import {URL} from 'url';

const getSystemTheme = (): 'light' | 'dark' => {
  return nativeTheme.shouldUseDarkColors ? 'dark' : 'light';
};


async function createWindow() {
  const browserWindow = new BrowserWindow({
    show: false, // Use the 'ready-to-show' event to show the instantiated BrowserWindow.
    titleBarStyle: 'hidden',
    titleBarOverlay: true,
    height: 900,
    width: 1200,
    minHeight: 675,
    minWidth: 900,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      sandbox: false, // Sandbox disabled because the demo of preload script depend on the Node.js api
      webviewTag: false, // The webview tag is not recommended. Consider alternatives like an iframe or Electron's BrowserView. @see https://www.electronjs.org/docs/latest/api/webview-tag#warning
      preload: join(app.getAppPath(), 'packages/preload/dist/index.cjs'),
    },
  });

  /**
   * If the 'show' property of the BrowserWindow's constructor is omitted from the initialization options,
   * it then defaults to 'true'. This can cause flickering as the window loads the html content,
   * and it also has show problematic behaviour with the closing of the window.
   * Use `show: false` and listen to the  `ready-to-show` event to show the window.
   *
   * @see https://github.com/electron/electron/issues/25012 for the afford mentioned issue.
   */
  browserWindow.on('ready-to-show', () => {
    browserWindow?.show();

    if (import.meta.env.DEV) {
      browserWindow?.webContents.openDevTools();
    }

    ipcMain.handle('system:getSystemTheme', getSystemTheme);
    ipcMain.on('system:openOAuthWindow', async () => {
      const oauthWindow = new BrowserWindow({
        show: true, // Use the 'ready-to-show' event to show the instantiated BrowserWindow.
        titleBarStyle: 'hidden',
        titleBarOverlay: true,
        parent: browserWindow,
        modal: true,
        height: 800,
        width: 600,
        resizable: false,
        roundedCorners: true,
        webPreferences: {
          nodeIntegration: false,
          contextIsolation: true,
          sandbox: false,
          webviewTag: false,
          preload: join(app.getAppPath(), 'packages/oauth/dist/index.cjs'),
        },
      });

      oauthWindow.loadURL('https://github.com/login/oauth/authorize?client_id=12fae6e8606646fc8d7f&scope=user');
      oauthWindow.once('ready-to-show', () => {
        oauthWindow?.show();
        //if (import.meta.env.DEV) {
        //  oauthWindow?.webContents.openDevTools();
        //}
      });
      ipcMain.once('oauth:sendOAuthResult', (event, ...args) => {
        console.log(event.sender.getURL(), args);
        oauthWindow.close();
        oauthWindow.destroy();

      });
    });
  });

  /**
   * URL for main window.
   * Vite dev server for development.
   * `file://../renderer/index.html` for production and test.
   */
  const pageUrl =
    import.meta.env.DEV && import.meta.env.VITE_DEV_SERVER_URL !== undefined
      ? import.meta.env.VITE_DEV_SERVER_URL
      : new URL('../renderer/dist/index.html', 'file://' + __dirname).toString();

  await browserWindow.loadURL(pageUrl);

  return browserWindow;
}

/**
 * Restore an existing BrowserWindow or Create a new BrowserWindow.
 */
export async function restoreOrCreateWindow() {
  let window = BrowserWindow.getAllWindows().find(w => !w.isDestroyed());

  if (window === undefined) {
    window = await createWindow();
  }
  nativeTheme.on('updated', () => {
    window?.webContents.send('system:themeUpdated', getSystemTheme());
  });

  if (window.isMinimized()) {
    window.restore();
  }

  window.focus();
}