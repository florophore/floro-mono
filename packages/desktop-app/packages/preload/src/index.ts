/**
 * @module preload
 */

export {sha256sum} from './nodeCrypto';
export {versions} from './versions';
import { contextBridge, ipcRenderer } from 'electron';


contextBridge.exposeInMainWorld('systemAPI', {
    getSystemTheme: () => ipcRenderer.invoke('system:getSystemTheme'),
    subscribeToSystemThemeChange: (cb: (t: 'dark'|'light') => void) => {
        ipcRenderer.on('system:themeUpdated', (_, theme: 'dark'|'light') => {
            console.log("UMMM", theme);
            cb(theme);
        });
    },
});