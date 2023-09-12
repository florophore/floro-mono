import { injectable, inject } from 'inversify';
import StorageDriver from './drivers/StrorageDriver';
import { env } from 'process';
import { createHash } from "crypto";

const NODE_ENV = env.NODE_ENV;
const isProduction = NODE_ENV == "production";
const isDevelopment = NODE_ENV == "development";
const isTest = NODE_ENV == "test";

@injectable()
export default class StorageClient {
  public publicDriver!: StorageDriver;
  public privateDriver!: StorageDriver;

  // INJECT S3 storage as well
  constructor(
    @inject("PublicDiskStorageDriver") publicDiskStorageDriver: StorageDriver,
    @inject("PrivateDiskStorageDriver") privateDiskStorageDriver: StorageDriver,
    @inject("PublicAwsStorageDriver") publicAwsStorageDriver: StorageDriver,
    @inject("PrivateAwsStorageDriver") privateAwsStorageDriver: StorageDriver,
    ) {
    if (isDevelopment || isTest) {
      this.publicDriver = publicDiskStorageDriver;
      this.privateDriver = privateDiskStorageDriver;
    }
    if (isProduction) {
      this.publicDriver = publicAwsStorageDriver;
      this.privateDriver = privateAwsStorageDriver;
    }
  }

  public async start(): Promise<void> {
    await this.publicDriver.init();
    await this.privateDriver.init();
  }

  public getStaticRoot(storageType: "public" | "private") {
    if (isDevelopment || isTest) {
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