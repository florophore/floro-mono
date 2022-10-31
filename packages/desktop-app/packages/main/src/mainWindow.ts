import {app, BrowserWindow, ipcMain, nativeTheme} from 'electron';
import {join} from 'path';
import {URL} from 'url';
import { createSocket } from '@floro/common-react/src/pubsub/socket';

const getSystemTheme = (): 'light' | 'dark' => {
  return nativeTheme.shouldUseDarkColors ? 'dark' : 'light';
};

const socket = createSocket('desktop');

async function createWindow() {
  const browserWindow = new BrowserWindow({
    show: false, // Use the 'ready-to-show' event to show the instantiated BrowserWindow.
    titleBarStyle: 'hidden',
    titleBarOverlay: true,
    height: 900,
    width: 1200,
    minHeight: 800,
    minWidth: 900,
    webPreferences: {
      webSecurity: false,
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
    ipcMain.on('system:openOAuthWindow', async (_: any, provider: any) => {
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
          webSecurity: false,
          nodeIntegration: false,
          contextIsolation: true,
          sandbox: false,
          webviewTag: false,
          preload: join(app.getAppPath(), 'packages/oauth/dist/index.cjs'),
        },
      });

      if (provider == 'github') {
        oauthWindow.loadURL('https://github.com/login/oauth/authorize?client_id=75b180c6c897d28dbf66&scope=user');
      }
      if (provider == 'google') {
        oauthWindow.loadURL('https://accounts.google.com/o/oauth2/v2/auth?scope=https%3A//www.googleapis.com/auth/userinfo.email%20https://www.googleapis.com/auth/userinfo.profile&include_granted_scopes=true&response_type=code&redirect_uri=http%3A//localhost:9000/oauth/google/callback&client_id=417722275204-e8n6h2vqcgnbnj7uuj3p561ij5sqn3tg.apps.googleusercontent.com');
      }
      oauthWindow.once('ready-to-show', () => {
        oauthWindow?.show();
        if (import.meta.env.DEV) {
          oauthWindow?.webContents.openDevTools();
        }
      });

      socket.on('login', () => {
        oauthWindow.close();
        oauthWindow.destroy();
        socket.off('login');
        socket.off('complete_signup');
      });

      socket.on('complete_signup', () => {
        oauthWindow.close();
        oauthWindow.destroy();
        socket.off('login');
        socket.off('complete_signup');
      });

      ipcMain.once('oauth:sendOAuthResult', () => {
        oauthWindow.close();
        oauthWindow.destroy();
      });
    });
  });
  /***
   * 
   * https://accounts.google.com/o/oauth2/v2/auth?scope=https%3A//www.googleapis.com/auth/userinfo.email%20https://www.googleapis.com/auth/userinfo.profile&include_granted_scopes=true&response_type=code&redirect_uri=http%3A//localhost:9000/oauth/google/callback&client_id=417722275204-e8n6h2vqcgnbnj7uuj3p561ij5sqn3tg.apps.googleusercontent.com
   */

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
  socket.off('bring-to-front');

  if (window === undefined) {
    window = await createWindow();
  }
    nativeTheme?.on('updated', () => {
      window?.webContents.send('system:themeUpdated', getSystemTheme());
    });

  if (window.isMinimized()) {
    window.restore();
  }

  window.focus();
  socket.on('bring-to-front', () => {
    window?.focus?.();
    window?.show?.();
  });
  return window;
}
