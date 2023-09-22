/**
 * @module preload
 */

export {sha256sum} from './nodeCrypto';
export {versions} from './versions';
import { contextBridge, ipcRenderer } from 'electron';

contextBridge?.exposeInMainWorld?.('systemAPI', {
    bringToFront: () => {
        ipcRenderer.send('system:bringToFront');
    },
    // OAuth API
    openOAuthWindow: (provider: string) => {
        ipcRenderer.send('system:openOAuthWindow', provider);
    },
});