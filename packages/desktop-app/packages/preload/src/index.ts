/**
 * @module preload
 */

export {sha256sum} from './nodeCrypto';
export {versions} from './versions';
import { contextBridge, ipcRenderer } from 'electron';

contextBridge?.exposeInMainWorld?.('systemAPI', {
    // OAuth API
    openOAuthWindow: (provider: string) => {
        ipcRenderer.send('system:openOAuthWindow', provider);
    },
});