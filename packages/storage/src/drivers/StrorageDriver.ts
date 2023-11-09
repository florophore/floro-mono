import { WriteStream } from "fs";
import { PassThrough, Readable } from "stream";
import { Upload } from '@aws-sdk/lib-storage';

export default interface StorageDriver {
    init: () => Promise<void>;
    zipDirectory: (path: string) => Promise<Readable>;
    exists: (path: string) => Promise<boolean>;
    read: (path: string) => Promise<Buffer|string|null>;
    mkdir: (path: string) => Promise<void>;
    write: (path: string, data: Buffer|string) => Promise<void>;
    writeStream: (path: string) => [WriteStream|PassThrough, Upload|null];
    staticRoot?: () => string;
}