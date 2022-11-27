import { injectable } from "inversify";
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import StorageDriver from "./StrorageDriver";
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const root = join(__dirname, "..", "..", ".locale_root");

@injectable()
export default class DiskStorageDriver implements StorageDriver {

  public async init() {
    if (!this.exists(root)) {
      await fs.promises.mkdir(root)
    }
  }

  public async exists(path: string) {
    const exists = await fs.promises
      .access(root, fs.constants.F_OK)
      .then(() => true)
      .catch(() => false);
    return exists;
  }

  public async read(path: string) {
    return new BigInt64Array();
  }

  public async write(path: string, data: BinaryData) {
    return;
  }

  public staticRoot() {
    return root;
  }
}
