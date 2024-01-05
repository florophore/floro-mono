import { SchemaRoot } from "./floro-generator-schema-api";
type Languages = "typescript";
export declare function filename(): string;
export declare function getFloroGenerator(): {
    name: string;
    dependencies: {
        theme: string;
    };
};
export declare function getJSON<T>(state: SchemaRoot): Promise<T>;
export declare function generate(state: SchemaRoot, outDir: string, args?: {
    lang?: Languages;
}): Promise<void>;
export {};
