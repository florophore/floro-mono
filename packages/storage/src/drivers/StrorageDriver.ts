
export default interface StorageDriver {
    init: () => Promise<void>;
    exists: (path: string) => Promise<boolean>;
    read: (path: string) => Promise<Buffer|string>;
    write: (path: string, data: Buffer) => Promise<void>;
    staticRoot?: () => string;
}