/// <reference types="node" />
import { SchemaRoot } from "./floro-generator-schema-api";
type Languages = "typescript";
export declare function filename(): string;
export declare function getFloroGenerator(): {
    name: string;
    dependencies: {
        icons: string;
    };
};
export declare function getJSON<T>(state: SchemaRoot, args?: {
    assetHost?: string;
    svgPreprocessor?: (svg: string) => Promise<string>;
}, mode?: "build" | "hot" | "live-update", assetAccessor?: (binaryRef: string) => Promise<string | Buffer | null>): Promise<T>;
export declare function generate(state: SchemaRoot, outDir: string, args: {
    lang: Languages;
    svgPreprocessor?: (svg: string) => Promise<string>;
}, assetAccessor: (binaryRef: string) => Promise<Buffer | string | null>): Promise<void>;
export {};
