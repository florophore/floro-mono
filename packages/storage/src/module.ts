import { ContainerModule  } from 'inversify';
import OrganizationAccessor from './accessors/OrganizationAccessor';
import PluginAccessor from './accessors/PluginAccessor';
import PluginTarAccessor from './accessors/PluginTarAccessor';
import RepoAccessor from './accessors/RepoAccessor';
import UserAccessor from './accessors/UserAccessor';
import DiskStorageDriver from './drivers/DiskStorageDriver';
import StorageAuthenticator from './StorageAuthenticator';
import StorageClient from './StorageClient';
import BinaryAccessor from './accessors/BinaryAccessor';
import AwsStorageDriver from './drivers/AwsStorageDriver';

export default new ContainerModule((bind): void => {
    bind<DiskStorageDriver>("PublicDiskStorageDriver").toConstantValue(new DiskStorageDriver("public"));
    bind<DiskStorageDriver>("PrivateDiskStorageDriver").toConstantValue(new DiskStorageDriver("private"));
    bind<AwsStorageDriver>("PublicAwsStorageDriver").toConstantValue(new AwsStorageDriver("public"));
    bind<AwsStorageDriver>("PrivateAwsStorageDriver").toConstantValue(new AwsStorageDriver("private"));

    bind(StorageClient).toSelf();
    bind(StorageAuthenticator).toSelf();
    bind(UserAccessor).toSelf();
    bind(RepoAccessor).toSelf();
    bind(OrganizationAccessor).toSelf();
    bind(PluginAccessor).toSelf();
    bind(PluginTarAccessor).toSelf();
    bind(BinaryAccessor).toSelf();
});