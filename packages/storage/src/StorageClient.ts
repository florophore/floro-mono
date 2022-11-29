import { injectable, inject } from 'inversify';
import DiskStorageDriver from './drivers/DiskStorageDriver';
import StorageDriver from './drivers/StrorageDriver';
import { env } from 'process';
import { createHash } from "crypto";

const NODE_ENV = env.NODE_ENV;
const isProduction = NODE_ENV == "production";
const isDevelopment = NODE_ENV == "development";
const isTest = NODE_ENV == "test";

@injectable()
export default class StorageClient {
  public driver!: StorageDriver;

  constructor(@inject(DiskStorageDriver) diskStorageDriver: StorageDriver) {
    if (isDevelopment || isTest) {
      this.driver = diskStorageDriver;
    } 
    if (isProduction) {
      // REPLACE WITH S3
      this.driver = diskStorageDriver;
    }
  }

  public async start(): Promise<void> {
    await this.driver.init();
  }

  public getStaticRoot() {
    if (isDevelopment || isTest) {
      return this.driver?.staticRoot?.();
    }
    return null;
  }

  public hashBuffer(buffer: Buffer): string {
    const hash = createHash("sha256");
    hash.update(buffer);
    return hash.digest("hex");
  }
}