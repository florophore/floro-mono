import { ContainerModule  } from 'inversify';
import OrganizationAccessor from './accessors/OrganizationAccessor';
import RepoAccessor from './accessors/RepoAccessor';
import UserAccessor from './accessors/UserAccessor';
import DiskStorageDriver from './drivers/DiskStorageDriver';
import StorageClient from './StorageClient';

export default new ContainerModule((bind): void => {
    bind(DiskStorageDriver).toSelf();
    bind(StorageClient).toSelf();
    bind(UserAccessor).toSelf();
    bind(RepoAccessor).toSelf();
    bind(OrganizationAccessor).toSelf();
});