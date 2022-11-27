import { injectable, inject } from 'inversify';
import StorageDriver from '../drivers/StrorageDriver';
import StorageClient from '../StorageClient';

@injectable()
export default class RepoAccessor {
    private driver!: StorageDriver; 

    constructor(
        @inject(StorageClient) storageClient: StorageClient
    ) {
        this.driver = storageClient.driver;
    }
}