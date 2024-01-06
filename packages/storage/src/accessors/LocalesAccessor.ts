import { injectable, inject } from "inversify";
import StorageDriver from "../drivers/StrorageDriver";
import StorageClient from "../StorageClient";
import path from "path";
import DiskStorageDriver from "../drivers/DiskStorageDriver";

@injectable()
export default class LocalesAccessor {
  private driver!: StorageDriver;

  constructor(@inject(StorageClient) storageClient: StorageClient) {
    this.driver = storageClient.staticDriver;
  }

  public localesDirectory() {
    const localesDir = path.join(this.driver.staticRoot?.() ?? "", "locales");
    if (localesDir[0] == "/") {
      return localesDir;
    }
    return `/${localesDir}`;
  }

  public async writeLocales(
    fileName: string,
    localesJson: string
  ): Promise<boolean> {
    try {
      if (this.driver instanceof DiskStorageDriver) {
        const exists = await this.driver.exists(this.localesDirectory());
        if (!exists) {
          await this.driver.mkdir(this.localesDirectory());
        }
      }
      const filePath = path.join(this.localesDirectory(), fileName);
      await this.driver.write(filePath, Buffer.from(localesJson));
      return true;
    } catch (e) {
      console.log("static upload failed")
      return false;
    }
  }
}
