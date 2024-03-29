import { injectable, inject } from 'inversify';
import StorageDriver from './drivers/StrorageDriver';
import { env } from 'process';
import { createHash } from "crypto";
import StorageAuthenticator from './StorageAuthenticator';
import AwsStorageDriver from './drivers/AwsStorageDriver';
import DiskStorageDriver from './drivers/DiskStorageDriver';
import MainConfig from '@floro/config/src/MainConfig';

const NODE_ENV = env.NODE_ENV;
const isProduction = NODE_ENV == "production";
const isDevelopment = NODE_ENV == "development";
const isTest = NODE_ENV == "test";

@injectable()
export default class StorageClient {
  public publicDriver!: StorageDriver;
  public privateDriver!: StorageDriver;
  public staticDriver!: StorageDriver;
  public storageAuthenticator!: StorageAuthenticator;

  constructor(
    @inject(StorageAuthenticator) storageAuthenticator: StorageAuthenticator,
    @inject(MainConfig) mainConfig: MainConfig,
    @inject("PublicDiskStorageDriver") publicDiskStorageDriver: DiskStorageDriver,
    @inject("PrivateDiskStorageDriver") privateDiskStorageDriver: DiskStorageDriver,
    @inject("StaticDiskStorageDriver") staticDiskStorageDriver: DiskStorageDriver,
    @inject("PublicAwsStorageDriver") publicAwsStorageDriver: AwsStorageDriver,
    @inject("PrivateAwsStorageDriver") privateAwsStorageDriver: AwsStorageDriver,
    @inject("StaticAwsStorageDriver") staticAwsStorageDriver: AwsStorageDriver,
    ) {
    if (isDevelopment || isTest) {
      this.publicDriver = publicDiskStorageDriver;
      this.privateDriver = privateDiskStorageDriver;
      this.staticDriver = staticDiskStorageDriver;
    }
    if (isProduction) {
      publicAwsStorageDriver.setMainConfig(mainConfig);
      this.publicDriver = publicAwsStorageDriver;
      privateAwsStorageDriver.setMainConfig(mainConfig);
      privateAwsStorageDriver.setAuthenticator(storageAuthenticator);
      this.privateDriver = privateAwsStorageDriver;
      this.staticDriver = staticAwsStorageDriver;
    }
  }

  public async start(): Promise<void> {
    await this.publicDriver.init();
    await this.privateDriver.init();
    if (isTest) {
      await this.staticDriver.init();
    }
  }

  public getStaticRoot(storageType: "public" | "private" | "static") {
    if (isDevelopment || isTest) {
      if (storageType == "static") {
        return this.staticDriver.staticRoot?.();
      }
      return storageType == "public" ? this.publicDriver?.staticRoot?.() : this.privateDriver?.staticRoot?.();
    }
    return null;
  }

  public hashBuffer(buffer: Buffer): string {
    const hash = createHash("sha256");
    hash.update(buffer);
    return hash.digest("hex");
  }
}