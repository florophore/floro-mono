import { injectable } from "inversify";
import { fileURLToPath } from "url";
import { dirname, join } from "path";
import StorageDriver from "./StrorageDriver";
import fs, { WriteStream } from "fs";
import tar from "tar";
import { Readable } from "stream";
import { env } from "process";

const NODE_ENV = env.NODE_ENV;
const isTest = NODE_ENV == "test";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const root = isTest
  ? join(__dirname, "..", "..", ".test_root")
  : join(__dirname, "..", "..", ".local_root");
const privateRoot = isTest
  ? join(__dirname, "..", "..", ".test_private_root")
  : join(__dirname, "..", "..", ".local_private_root");

@injectable()
export default class DiskStorageDriver implements StorageDriver {
  private root: string;

  constructor(storageType: "public" | "private") {
    this.root = storageType == "public" ? root : privateRoot;
  }
  public writeStream(path: string): WriteStream {
    return fs.createWriteStream(path);
  };

  public async mkdir(path: string) {
    await fs.promises.mkdir(path, { recursive: true });
  }

  public async init() {
    if (!this.exists(this.root)) {
      await fs.promises.mkdir(this.root);
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

  public async write(path: string, data: Buffer|string) {
    return await fs.promises.writeFile(path, data);
  }

  public async zipDirectory(path: string): Promise<Readable> {
    return tar.c(
      {
        gzip: true,
        cwd: path,
      },
      ["."]
    );
  }

  public staticRoot() {
    return this.root;
  }
}