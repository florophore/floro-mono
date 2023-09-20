import { contextBridge, ipcRenderer } from 'electron';

contextBridge.exposeInMainWorld('OAuthAPI', {
    isDesktopApp: true,
    sendResult: (isSuccess: boolean, provider: string, code?: string) => {
        ipcRenderer.send('oauth:sendOAuthResult', isSuccess, provider, code);
    },
});