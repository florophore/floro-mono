import { Readable } from "stream";

export default interface StorageDriver {
    init: () => Promise<void>;
    zipDirectory: (path: string) => Promise<Readable>;
    exists: (path: string) => Promise<boolean>;
    read: (path: string) => Promise<Buffer|string|null>;
    //readMany: (paths: Array<string>) => Promise<Array<Buffer|string>>;
    mkdir: (path: string) => Promise<void>;
    write: (path: string, data: Buffer|string) => Promise<void>;
    staticRoot?: () => string;
}