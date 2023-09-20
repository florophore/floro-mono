import {app, BrowserWindow, ipcMain, nativeTheme} from 'electron';
import {join, resolve} from 'node:path';

import { createSocket } from '@floro/common-react/src/pubsub/socket';

const socket = createSocket('desktop');
let ipcRendererHasMounted = false;

const getSystemTheme = (): 'light' | 'dark' => {
  return nativeTheme.shouldUseDarkColors ? 'dark' : 'light';
};

async function createWindow() {
  const browserWindow = new BrowserWindow({
    show: false, // Use the 'ready-to-show' event to show the instantiated BrowserWindow.
    titleBarStyle: 'hidden',
    titleBarOverlay: true,
    height: 920,
    width: 1200,
    minHeight: 675,
    minWidth: 900,
    webPreferences: {
      webSecurity: false,
      nodeIntegration: false,
      contextIsolation: true,
      sandbox: false,
      webviewTag: false, // The webview tag is not recommended. Consider alternatives like an iframe or Electron's BrowserView. @see https://www.electronjs.org/docs/latest/api/webview-tag#warning
      preload: join(app.getAppPath(), 'packages/preload/dist/index.cjs'),
      zoomFactor: 0.9,
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
      //browserWindow?.webContents.openDevTools();
    }

    if (!ipcRendererHasMounted) {
      ipcMain.handle('system:getSystemTheme', getSystemTheme);
      ipcRendererHasMounted = true;
    }
    ipcMain.on('system:openOAuthWindow', async (_: any, provider: any) => {
      const oauthWindow = new BrowserWindow({
        show: true, // Use the 'ready-to-show' event to show the instantiated BrowserWindow.
        //titleBarStyle: 'hidden',
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
          zoomFactor: 0.9,
        },
      });

      if (provider == 'github') {
        const githubOAuthUrl = `https://github.com/login/oauth/authorize?client_id=${process?.env?.['GITHUB_OAUTH_CLIENT_ID']}&scope=user`
        oauthWindow.loadURL(githubOAuthUrl);
      }
      if (provider == 'google') {
        const googleOAuthUrl = `https://accounts.google.com/o/oauth2/v2/auth?scope=https%3A//www.googleapis.com/auth/userinfo.email%20https://www.googleapis.com/auth/userinfo.profile&include_granted_scopes=true&response_type=code&redirect_uri=${process.env['GOOGLE_OAUTH_REDIRECT_URI']}&client_id=${process.env['GOOGLE_OAUTH_CLIENT_ID']}`;
        oauthWindow.loadURL(googleOAuthUrl);
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
        socket.off('kill_oauth');
      });

      socket.on('complete_signup', () => {
        oauthWindow.close();
        oauthWindow.destroy();
        socket.off('login');
        socket.off('complete_signup');
        socket.off('kill_oauth');
      });

      socket.on('oauth_failed', () => {
        oauthWindow.close();
        oauthWindow.destroy();
        socket.off('login');
        socket.off('complete_signup');
        socket.off('kill_oauth');
      });
      socket.on('kill_oauth', () => {
        oauthWindow.close();
        oauthWindow.destroy();
        socket.off('login');
        socket.off('complete_signup');
        socket.off('kill_oauth');
      });

      ipcMain.once('oauth:sendOAuthResult', () => {
        oauthWindow.close();
        oauthWindow.destroy();
      });
    });
  });

  /**
   * Load the main page of the main window.
   */
  if (import.meta.env.DEV && import.meta.env.VITE_DEV_SERVER_URL !== undefined) {
    /**
     * Load from the Vite dev server for development.
     */
    await browserWindow.loadURL(import.meta.env.VITE_DEV_SERVER_URL);
  } else {
    /**
     * Load from the local file system for production and test.
     *
     * Use BrowserWindow.loadFile() instead of BrowserWindow.loadURL() for WhatWG URL API limitations
     * when path contains special characters like `#`.
     * Let electron handle the path quirks.
     * @see https://github.com/nodejs/node/issues/12682
     * @see https://github.com/electron/electron/issues/6869
     */
    await browserWindow.loadFile(resolve(__dirname, '../../renderer/dist/index.html'));
  }

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
