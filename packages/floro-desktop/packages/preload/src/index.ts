/**
 * @module preload
 */

export {sha256sum} from './nodeCrypto';
export {versions} from './versions';
import { contextBridge, ipcRenderer } from 'electron';
import {getVersion} from '../../../version/getVersion.mjs';

contextBridge?.exposeInMainWorld?.('systemAPI', {
    bringToFront: () => {
        ipcRenderer.send('system:bringToFront');
    },
    // OAuth API
    openOAuthWindow: (provider: string) => {
        ipcRenderer.send('system:openOAuthWindow', provider);
    },
    openUrl: (url: string) => {
        ipcRenderer.send('system:openUrl', url);
    },
    buildVersion: getVersion()
});