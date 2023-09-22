import { injectable, inject } from "inversify";
import StorageDriver from "../drivers/StrorageDriver";
import StorageClient from "../StorageClient";
import MainConfig from "@floro/config/src/MainConfig";
import path from "path";

@injectable()
export default class PluginAccessor {
  private driver!: StorageDriver;
  private config!: MainConfig;

  constructor(
    @inject(StorageClient) storageClient: StorageClient,
    @inject(MainConfig) config: MainConfig
  ) {
    this.driver = storageClient.publicDriver;
    this.config = config;
  }

  public rootDirectory() {
    const rootDir =  path.join(this.driver.staticRoot?.() ?? "", "plugins");
    if (rootDir[0] == "/") {
      return rootDir;
    }
    return `/${rootDir}`;
  }

  public async writePluginFiles(uploadHash: string, files: {
    [key: string]: string | Buffer | undefined;
  }): Promise<boolean> {
    const tasks: Promise<boolean>[] = [];
    const driver = this.driver;
    const rootDir = this.rootDirectory();
    for (const fname in files) {
      if (files[fname]) {
        const task = async () => {
          try {
            const subdir = path.dirname(fname);
            const dir = path.join(rootDir, uploadHash, subdir);
            if (!(await driver.exists(dir))) {
              await driver.mkdir(dir);
            }
            const filepath = path.join(rootDir, uploadHash, fname);
            await driver.write(filepath, files[fname] as string | Buffer);
            return true;
          } catch (e) {
            return false;
          }
        };
        tasks.push(task());
      }
    }
    return (await Promise.all(tasks)).reduce(
      (isOkay, didUpload) => isOkay && didUpload,
      true
    );
  }
}
