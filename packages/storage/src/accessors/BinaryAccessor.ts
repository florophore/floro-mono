import { injectable, inject } from "inversify";
import path from "path";
import StorageDriver from "../drivers/StrorageDriver";
import StorageClient from "../StorageClient";

@injectable()
export default class BinaryAccessor {
  private driver!: StorageDriver;

  constructor(@inject(StorageClient) storageClient: StorageClient) {
    this.driver = storageClient.privateDriver;
    this.initBinFolder()
  }

  public async initBinFolder() {
    const binDir = this.parentRootDirectory();
    const exists = await this.driver.exists(binDir);
    if (!exists){
      await this.driver.mkdir(binDir);
    }
  }

  public parentRootDirectory() {
    return path.join(this.driver.staticRoot?.() ?? "", "binaries");
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
