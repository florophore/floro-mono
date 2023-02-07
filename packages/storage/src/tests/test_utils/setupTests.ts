import { Container } from 'inversify';
import fs from 'fs';
import StorageClient from '../../StorageClient';

export const storageBeforeEach = (container: Container) => async (): Promise<void> => {
    const storageClient = container.get(StorageClient);
    const publicRoot = storageClient.getStaticRoot("public");
    const privateRoot = storageClient.getStaticRoot("private");
    await fs.promises.mkdir(publicRoot as string, { recursive: true})
    await fs.promises.mkdir(privateRoot as string, { recursive: true})
} ;

export const storageAfterEach = (container) => async (): Promise<void> => {
    const storageClient = container.get(StorageClient);
    const publicRoot = storageClient.getStaticRoot("public");
    const privateRoot = storageClient.getStaticRoot("private");
    await fs.promises.rm(publicRoot, { recursive: true})
    await fs.promises.rm(privateRoot, { recursive: true})
} ;