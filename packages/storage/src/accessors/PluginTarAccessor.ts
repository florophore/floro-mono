import { injectable, inject } from "inversify";
import StorageDriver from "../drivers/StrorageDriver";
import StorageClient from "../StorageClient";

import fs, { ReadStream } from "fs";
import path from "path";
import DiskStorageDriver from "../drivers/DiskStorageDriver";

@injectable()
export default class PluginTarAccessor {
  private driver!: StorageDriver;

  constructor(@inject(StorageClient) storageClient: StorageClient) {
    this.driver = storageClient.privateDriver;
  }

  public rootDirectory() {
    const rootDir = path.join(this.driver.staticRoot?.() ?? "", "plugin-tars");
    if (rootDir[0] == "/") {
      return rootDir;
    }
    return `/${rootDir}`;
  }

  public getTarPath(uploadHash: string): string {
    const tarPath = path.join(this.rootDirectory(), `${uploadHash}.tar.gz`);
    return tarPath;
  }

  public async writeTar(
    uploadHash: string,
    readStream: ReadStream
  ): Promise<boolean> {
    try {
      if (this.driver instanceof DiskStorageDriver) {
        const rootDirExists = await this.driver.exists(this.rootDirectory());
        if (!rootDirExists) {
          await this.driver.mkdir(this.rootDirectory());
        }
      }
      const tarPath = path.join(this.rootDirectory(), `${uploadHash}.tar.gz`);
      const writeStream = fs.createWriteStream(tarPath);
      let hasFinished = false;
      return await new Promise((resolve) => {
        writeStream.on("finish", () => {
          if (!hasFinished) {
            resolve(true);
            hasFinished = true;
          }
        });
        writeStream.on("error", (e) => {
          if (!hasFinished) {
            resolve(false);
            hasFinished = true;
          }
        });
        readStream.pipe(writeStream);
      });
    } catch (e) {
      return false;
    }
  }
}
