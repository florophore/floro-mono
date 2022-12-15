import { injectable } from "inversify";
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import StorageDriver from "./StrorageDriver";
import fs from 'fs';
import tar from 'tar';
import { Readable } from "stream";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const root = join(__dirname, "..", "..", ".local_root");

@injectable()
export default class DiskStorageDriver implements StorageDriver {

  public async mkdir(path: string) {
      await fs.promises.mkdir(path, { recursive: true})
  }

  public async init() {
    if (!this.exists(root)) {
      await fs.promises.mkdir(root)
    }
  }

  public async exists(path: string) {
    const exists = await fs.promises
      .access(path, fs.constants.F_OK)
      .then(() => true)
      .catch(() => false);
    return exists;
  }

  public async read(path: string) {
    return await fs.promises.readFile(path);
  }

  public async write(path: string, data: Buffer) {
    return await fs.promises.writeFile(path, data, );
  }

  public async zipDirectory(path: string): Promise<Readable> {
    return tar.c({
      gzip: true,
      cwd: path
    }, ["."])
  }

  public staticRoot() {
    return root;
  }
}
