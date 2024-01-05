export type SchemaTypes = {
    ['$(palette).colorPalettes.id<?>.colorShades.id<?>']: {
        ['hexcode']?: string;
        ['id']: QueryTypes['$(palette).shades.id<?>'];
    };
    ['$(palette).colorPalettes.id<?>.colorShades']: Array<{
        ['hexcode']?: string;
        ['id']: QueryTypes['$(palette).shades.id<?>'];
    }>;
    ['$(palette).colorPalettes.id<?>']: {
        ['colorShades']: Array<{
            ['hexcode']?: string;
            ['id']: QueryTypes['$(palette).shades.id<?>'];
        }>;
        ['id']: string;
        ['name']: string;
    };
    ['$(palette).shades.id<?>']: {
        ['id']: string;
        ['name']: string;
    };
    ['$(palette).colorPalettes']: Array<{
        ['colorShades']: Array<{
            ['hexcode']?: string;
            ['id']: QueryTypes['$(palette).shades.id<?>'];
        }>;
        ['id']: string;
        ['name']: string;
    }>;
    ['$(palette).shades']: Array<{
        ['id']: string;
        ['name']: string;
    }>;
};
export type PointerTypes = {
    ['$(palette).colorPalettes.id<?>.colorShades.id<?>']: `$(palette).colorPalettes.id<${string}>.colorShades.id<${QueryTypes['$(palette).shades.id<?>']}>`;
    ['$(palette).colorPalettes.id<?>.colorShades']: `$(palette).colorPalettes.id<${string}>.colorShades`;
    ['$(palette).colorPalettes.id<?>']: `$(palette).colorPalettes.id<${string}>`;
    ['$(palette).shades.id<?>']: `$(palette).shades.id<${string}>`;
    ['$(palette).colorPalettes']: `$(palette).colorPalettes`;
    ['$(palette).shades']: `$(palette).shades`;
};
export type SchemaRoot = {
    ['palette']: {
        ['colorPalettes']: Array<{
            ['colorShades']: Array<{
                ['hexcode']?: string;
                ['id']: QueryTypes['$(palette).shades.id<?>'];
            }>;
            ['id']: string;
            ['name']: string;
        }>;
        ['shades']: Array<{
            ['id']: string;
            ['name']: string;
        }>;
    };
};
export type QueryTypes = {
    ['$(palette).colorPalettes.id<?>']: `$(palette).colorPalettes.id<${string}>`;
    ['$(palette).colorPalettes.id<?>.colorShades.id<?>']: `$(palette).colorPalettes.id<${string}>.colorShades.id<${QueryTypes['$(palette).shades.id<?>']}>`;
    ['$(palette).shades.id<?>']: `$(palette).shades.id<${string}>`;
};
export declare function makeQueryRef(query: '$(palette).colorPalettes.id<?>.colorShades.id<?>', arg0: string, arg1: QueryTypes['$(palette).shades.id<?>']): QueryTypes['$(palette).colorPalettes.id<?>.colorShades.id<?>'];
export declare function makeQueryRef(query: '$(palette).colorPalettes.id<?>', arg0: string): QueryTypes['$(palette).colorPalettes.id<?>'];
export declare function makeQueryRef(query: '$(palette).shades.id<?>', arg0: string): QueryTypes['$(palette).shades.id<?>'];
export declare function extractQueryArgs(query?: QueryTypes['$(palette).colorPalettes.id<?>.colorShades.id<?>']): [string, QueryTypes['$(palette).shades.id<?>']];
export declare function extractQueryArgs(query?: QueryTypes['$(palette).colorPalettes.id<?>']): [string];
export declare function extractQueryArgs(query?: QueryTypes['$(palette).shades.id<?>']): [string];
export declare function getReferencedObject(root: SchemaRoot, query?: PointerTypes['$(palette).colorPalettes.id<?>.colorShades.id<?>']): SchemaTypes['$(palette).colorPalettes.id<?>.colorShades.id<?>'];
export declare function getReferencedObject(root: SchemaRoot, query?: PointerTypes['$(palette).colorPalettes.id<?>.colorShades']): SchemaTypes['$(palette).colorPalettes.id<?>.colorShades'];
export declare function getReferencedObject(root: SchemaRoot, query?: PointerTypes['$(palette).colorPalettes.id<?>']): SchemaTypes['$(palette).colorPalettes.id<?>'];
export declare function getReferencedObject(root: SchemaRoot, query?: PointerTypes['$(palette).shades.id<?>']): SchemaTypes['$(palette).shades.id<?>'];
export declare function getReferencedObject(root: SchemaRoot, query?: PointerTypes['$(palette).colorPalettes']): SchemaTypes['$(palette).colorPalettes'];
export declare function getReferencedObject(root: SchemaRoot, query?: PointerTypes['$(palette).shades']): SchemaTypes['$(palette).shades'];
