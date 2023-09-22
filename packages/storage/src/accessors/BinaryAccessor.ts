import { injectable, inject } from "inversify";
import path from "path";
import StorageDriver from "../drivers/StrorageDriver";
import StorageClient from "../StorageClient";
import DiskStorageDriver from "../drivers/DiskStorageDriver";

@injectable()
export default class BinaryAccessor {
  private driver!: StorageDriver;

  constructor(@inject(StorageClient) storageClient: StorageClient) {
    this.driver = storageClient.privateDriver;
    this.initBinFolder()
  }

  public async initBinFolder() {
    const binDir = this.parentRootDirectory();
    if (this.driver instanceof DiskStorageDriver){
      const exists = await this.driver.exists(binDir);
      if (!exists) {
        await this.driver.mkdir(binDir);
      }
    }
  }

  public parentRootDirectory() {
    const rootDir = path.join(this.driver.staticRoot?.() ?? "", "binaries");
    if (rootDir[0] == "/") {
      return rootDir;
    }
    return `/${rootDir}`;
  }

  public getRelativeBinaryPath(fileName: string) {
    return path.join("binaries", fileName);
  }

  public async writeBinary(filename: string, contents: string | Buffer) {
    try {
      const filePath = path.join(this.parentRootDirectory?.() ?? "", filename);
      const exists = await this.driver.exists(filePath);
      if (!exists) {
        await this.driver.write(filePath, contents);
        return true;
      }
      return true;
    } catch (e) {
      return false;
    }
  }
}
