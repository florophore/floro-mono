
export default interface StorageDriver {
    init: () => Promise<void>;
    exists: (path: string) => Promise<boolean>;
    read: (path: string) => Promise<BinaryData|string>;
    write: (path: string, data: BinaryData) => Promise<void>;
    staticRoot?: () => string;
}