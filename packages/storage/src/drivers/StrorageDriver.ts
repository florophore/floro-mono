import { Readable } from "stream";

export default interface StorageDriver {
    init: () => Promise<void>;
    zipDirectory: (path: string) => Promise<Readable>;
    exists: (path: string) => Promise<boolean>;
    read: (path: string) => Promise<Buffer|string>;
    mkdir: (path: string) => Promise<void>;
    write: (path: string, data: Buffer) => Promise<void>;
    staticRoot?: () => string;
}