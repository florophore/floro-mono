export type FileRef = `${string}.${string}`;
export type SchemaTypes = {
    ['$(theme).themeColors.id<?>.variants.id<?>.variantDefinitions.id<?>']: {
        ['alpha']?: number;
        ['id']: QueryTypes['$(theme).themes.id<?>'];
        ['paletteColorShade']?: QueryTypes['$(palette).colorPalettes.id<?>.colorShades.id<?>'];
    };
    ['$(theme).themeColors.id<?>.variants.id<?>.variantDefinitions']: Array<{
        ['alpha']?: number;
        ['id']: QueryTypes['$(theme).themes.id<?>'];
        ['paletteColorShade']?: QueryTypes['$(palette).colorPalettes.id<?>.colorShades.id<?>'];
    }>;
    ['$(theme).themeColors.id<?>.themeDefinitions.id<?>']: {
        ['alpha']?: number;
        ['id']: QueryTypes['$(theme).themes.id<?>'];
        ['paletteColorShade']: QueryTypes['$(palette).colorPalettes.id<?>.colorShades.id<?>'];
    };
    ['$(theme).themeColors.id<?>.variants.id<?>']: {
        ['id']: QueryTypes['$(theme).stateVariants.id<?>'];
        ['variantDefinitions']: Array<{
            ['alpha']?: number;
            ['id']: QueryTypes['$(theme).themes.id<?>'];
            ['paletteColorShade']?: QueryTypes['$(palette).colorPalettes.id<?>.colorShades.id<?>'];
        }>;
    };
    ['$(palette).colorPalettes.id<?>.colorShades.id<?>']: {
        ['hexcode']?: string;
        ['id']: QueryTypes['$(palette).shades.id<?>'];
    };
    ['$(theme).themeColors.id<?>.themeDefinitions']: Array<{
        ['alpha']?: number;
        ['id']: QueryTypes['$(theme).themes.id<?>'];
        ['paletteColorShade']: QueryTypes['$(palette).colorPalettes.id<?>.colorShades.id<?>'];
    }>;
    ['$(theme).themeColors.id<?>.variants']: Array<{
        ['id']: QueryTypes['$(theme).stateVariants.id<?>'];
        ['variantDefinitions']: Array<{
            ['alpha']?: number;
            ['id']: QueryTypes['$(theme).themes.id<?>'];
            ['paletteColorShade']?: QueryTypes['$(palette).colorPalettes.id<?>.colorShades.id<?>'];
        }>;
    }>;
    ['$(theme).themes.id<?>.backgroundColor']: {
        ['hexcode']: string;
    };
    ['$(palette).colorPalettes.id<?>.colorShades']: Array<{
        ['hexcode']?: string;
        ['id']: QueryTypes['$(palette).shades.id<?>'];
    }>;
    ['$(theme).stateVariants.id<?>']: {
        ['id']: string;
        ['name']: string;
    };
    ['$(theme).themeColors.id<?>']: {
        ['id']: string;
        ['includeVariants']: boolean;
        ['name']: string;
        ['themeDefinitions']: Array<{
            ['alpha']?: number;
            ['id']: QueryTypes['$(theme).themes.id<?>'];
            ['paletteColorShade']: QueryTypes['$(palette).colorPalettes.id<?>.colorShades.id<?>'];
        }>;
        ['variants']: Array<{
            ['id']: QueryTypes['$(theme).stateVariants.id<?>'];
            ['variantDefinitions']: Array<{
                ['alpha']?: number;
                ['id']: QueryTypes['$(theme).themes.id<?>'];
                ['paletteColorShade']?: QueryTypes['$(palette).colorPalettes.id<?>.colorShades.id<?>'];
            }>;
        }>;
    };
    ['$(theme).themes.id<?>']: {
        ['backgroundColor']: {
            ['hexcode']: string;
        };
        ['id']: string;
        ['name']: string;
    };
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
    ['$(theme).stateVariants']: Array<{
        ['id']: string;
        ['name']: string;
    }>;
    ['$(theme).themeColors']: Array<{
        ['id']: string;
        ['includeVariants']: boolean;
        ['name']: string;
        ['themeDefinitions']: Array<{
            ['alpha']?: number;
            ['id']: QueryTypes['$(theme).themes.id<?>'];
            ['paletteColorShade']: QueryTypes['$(palette).colorPalettes.id<?>.colorShades.id<?>'];
        }>;
        ['variants']: Array<{
            ['id']: QueryTypes['$(theme).stateVariants.id<?>'];
            ['variantDefinitions']: Array<{
                ['alpha']?: number;
                ['id']: QueryTypes['$(theme).themes.id<?>'];
                ['paletteColorShade']?: QueryTypes['$(palette).colorPalettes.id<?>.colorShades.id<?>'];
            }>;
        }>;
    }>;
    ['$(theme).themes']: Array<{
        ['backgroundColor']: {
            ['hexcode']: string;
        };
        ['id']: string;
        ['name']: string;
    }>;
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
    ['$(theme).themeColors.id<?>.variants.id<?>.variantDefinitions.id<?>']: `$(theme).themeColors.id<${string}>.variants.id<${QueryTypes['$(theme).stateVariants.id<?>']}>.variantDefinitions.id<${QueryTypes['$(theme).themes.id<?>']}>`;
    ['$(theme).themeColors.id<?>.variants.id<?>.variantDefinitions']: `$(theme).themeColors.id<${string}>.variants.id<${QueryTypes['$(theme).stateVariants.id<?>']}>.variantDefinitions`;
    ['$(theme).themeColors.id<?>.themeDefinitions.id<?>']: `$(theme).themeColors.id<${string}>.themeDefinitions.id<${QueryTypes['$(theme).themes.id<?>']}>`;
    ['$(theme).themeColors.id<?>.variants.id<?>']: `$(theme).themeColors.id<${string}>.variants.id<${QueryTypes['$(theme).stateVariants.id<?>']}>`;
    ['$(palette).colorPalettes.id<?>.colorShades.id<?>']: `$(palette).colorPalettes.id<${string}>.colorShades.id<${QueryTypes['$(palette).shades.id<?>']}>`;
    ['$(theme).themeColors.id<?>.themeDefinitions']: `$(theme).themeColors.id<${string}>.themeDefinitions`;
    ['$(theme).themeColors.id<?>.variants']: `$(theme).themeColors.id<${string}>.variants`;
    ['$(theme).themes.id<?>.backgroundColor']: `$(theme).themes.id<${string}>.backgroundColor`;
    ['$(palette).colorPalettes.id<?>.colorShades']: `$(palette).colorPalettes.id<${string}>.colorShades`;
    ['$(theme).stateVariants.id<?>']: `$(theme).stateVariants.id<${string}>`;
    ['$(theme).themeColors.id<?>']: `$(theme).themeColors.id<${string}>`;
    ['$(theme).themes.id<?>']: `$(theme).themes.id<${string}>`;
    ['$(palette).colorPalettes.id<?>']: `$(palette).colorPalettes.id<${string}>`;
    ['$(palette).shades.id<?>']: `$(palette).shades.id<${string}>`;
    ['$(theme).stateVariants']: `$(theme).stateVariants`;
    ['$(theme).themeColors']: `$(theme).themeColors`;
    ['$(theme).themes']: `$(theme).themes`;
    ['$(palette).colorPalettes']: `$(palette).colorPalettes`;
    ['$(palette).shades']: `$(palette).shades`;
};
export type SchemaRoot = {
    ['theme']: {
        ['stateVariants']: Array<{
            ['id']: string;
            ['name']: string;
        }>;
        ['themeColors']: Array<{
            ['id']: string;
            ['includeVariants']: boolean;
            ['name']: string;
            ['themeDefinitions']: Array<{
                ['alpha']?: number;
                ['id']: QueryTypes['$(theme).themes.id<?>'];
                ['paletteColorShade']: QueryTypes['$(palette).colorPalettes.id<?>.colorShades.id<?>'];
            }>;
            ['variants']: Array<{
                ['id']: QueryTypes['$(theme).stateVariants.id<?>'];
                ['variantDefinitions']: Array<{
                    ['alpha']?: number;
                    ['id']: QueryTypes['$(theme).themes.id<?>'];
                    ['paletteColorShade']?: QueryTypes['$(palette).colorPalettes.id<?>.colorShades.id<?>'];
                }>;
            }>;
        }>;
        ['themes']: Array<{
            ['backgroundColor']: {
                ['hexcode']: string;
            };
            ['id']: string;
            ['name']: string;
        }>;
    };
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
    ['$(theme).stateVariants.id<?>']: `$(theme).stateVariants.id<${string}>`;
    ['$(theme).themeColors.id<?>']: `$(theme).themeColors.id<${string}>`;
    ['$(theme).themeColors.id<?>.themeDefinitions.id<?>']: `$(theme).themeColors.id<${string}>.themeDefinitions.id<${QueryTypes['$(theme).themes.id<?>']}>`;
    ['$(theme).themeColors.id<?>.variants.id<?>']: `$(theme).themeColors.id<${string}>.variants.id<${QueryTypes['$(theme).stateVariants.id<?>']}>`;
    ['$(theme).themeColors.id<?>.variants.id<?>.variantDefinitions.id<?>']: `$(theme).themeColors.id<${string}>.variants.id<${QueryTypes['$(theme).stateVariants.id<?>']}>.variantDefinitions.id<${QueryTypes['$(theme).themes.id<?>']}>`;
    ['$(theme).themes.id<?>']: `$(theme).themes.id<${string}>`;
    ['$(palette).colorPalettes.id<?>']: `$(palette).colorPalettes.id<${string}>`;
    ['$(palette).colorPalettes.id<?>.colorShades.id<?>']: `$(palette).colorPalettes.id<${string}>.colorShades.id<${QueryTypes['$(palette).shades.id<?>']}>`;
    ['$(palette).shades.id<?>']: `$(palette).shades.id<${string}>`;
};
export declare function makeQueryRef(query: '$(theme).themeColors.id<?>.variants.id<?>.variantDefinitions.id<?>', arg0: string, arg1: QueryTypes['$(theme).stateVariants.id<?>'], arg2: QueryTypes['$(theme).themes.id<?>']): QueryTypes['$(theme).themeColors.id<?>.variants.id<?>.variantDefinitions.id<?>'];
export declare function makeQueryRef(query: '$(theme).themeColors.id<?>.themeDefinitions.id<?>', arg0: string, arg1: QueryTypes['$(theme).themes.id<?>']): QueryTypes['$(theme).themeColors.id<?>.themeDefinitions.id<?>'];
export declare function makeQueryRef(query: '$(palette).colorPalettes.id<?>.colorShades.id<?>', arg0: string, arg1: QueryTypes['$(palette).shades.id<?>']): QueryTypes['$(palette).colorPalettes.id<?>.colorShades.id<?>'];
export declare function makeQueryRef(query: '$(theme).themeColors.id<?>.variants.id<?>', arg0: string, arg1: QueryTypes['$(theme).stateVariants.id<?>']): QueryTypes['$(theme).themeColors.id<?>.variants.id<?>'];
export declare function makeQueryRef(query: '$(palette).colorPalettes.id<?>', arg0: string): QueryTypes['$(palette).colorPalettes.id<?>'];
export declare function makeQueryRef(query: '$(theme).stateVariants.id<?>', arg0: string): QueryTypes['$(theme).stateVariants.id<?>'];
export declare function makeQueryRef(query: '$(theme).themeColors.id<?>', arg0: string): QueryTypes['$(theme).themeColors.id<?>'];
export declare function makeQueryRef(query: '$(palette).shades.id<?>', arg0: string): QueryTypes['$(palette).shades.id<?>'];
export declare function makeQueryRef(query: '$(theme).themes.id<?>', arg0: string): QueryTypes['$(theme).themes.id<?>'];
export declare function extractQueryArgs(query?: QueryTypes['$(theme).themeColors.id<?>.variants.id<?>.variantDefinitions.id<?>']): [string, QueryTypes['$(theme).stateVariants.id<?>'], QueryTypes['$(theme).themes.id<?>']];
export declare function extractQueryArgs(query?: QueryTypes['$(theme).themeColors.id<?>.themeDefinitions.id<?>']): [string, QueryTypes['$(theme).themes.id<?>']];
export declare function extractQueryArgs(query?: QueryTypes['$(palette).colorPalettes.id<?>.colorShades.id<?>']): [string, QueryTypes['$(palette).shades.id<?>']];
export declare function extractQueryArgs(query?: QueryTypes['$(theme).themeColors.id<?>.variants.id<?>']): [string, QueryTypes['$(theme).stateVariants.id<?>']];
export declare function extractQueryArgs(query?: QueryTypes['$(palette).colorPalettes.id<?>']): [string];
export declare function extractQueryArgs(query?: QueryTypes['$(theme).stateVariants.id<?>']): [string];
export declare function extractQueryArgs(query?: QueryTypes['$(theme).themeColors.id<?>']): [string];
export declare function extractQueryArgs(query?: QueryTypes['$(palette).shades.id<?>']): [string];
export declare function extractQueryArgs(query?: QueryTypes['$(theme).themes.id<?>']): [string];
export declare function getReferencedObject(root: SchemaRoot, query?: PointerTypes['$(theme).themeColors.id<?>.variants.id<?>.variantDefinitions.id<?>']): SchemaTypes['$(theme).themeColors.id<?>.variants.id<?>.variantDefinitions.id<?>'];
export declare function getReferencedObject(root: SchemaRoot, query?: PointerTypes['$(theme).themeColors.id<?>.variants.id<?>.variantDefinitions']): SchemaTypes['$(theme).themeColors.id<?>.variants.id<?>.variantDefinitions'];
export declare function getReferencedObject(root: SchemaRoot, query?: PointerTypes['$(theme).themeColors.id<?>.themeDefinitions.id<?>']): SchemaTypes['$(theme).themeColors.id<?>.themeDefinitions.id<?>'];
export declare function getReferencedObject(root: SchemaRoot, query?: PointerTypes['$(theme).themeColors.id<?>.variants.id<?>']): SchemaTypes['$(theme).themeColors.id<?>.variants.id<?>'];
export declare function getReferencedObject(root: SchemaRoot, query?: PointerTypes['$(palette).colorPalettes.id<?>.colorShades.id<?>']): SchemaTypes['$(palette).colorPalettes.id<?>.colorShades.id<?>'];
export declare function getReferencedObject(root: SchemaRoot, query?: PointerTypes['$(theme).themeColors.id<?>.themeDefinitions']): SchemaTypes['$(theme).themeColors.id<?>.themeDefinitions'];
export declare function getReferencedObject(root: SchemaRoot, query?: PointerTypes['$(theme).themeColors.id<?>.variants']): SchemaTypes['$(theme).themeColors.id<?>.variants'];
export declare function getReferencedObject(root: SchemaRoot, query?: PointerTypes['$(theme).themes.id<?>.backgroundColor']): SchemaTypes['$(theme).themes.id<?>.backgroundColor'];
export declare function getReferencedObject(root: SchemaRoot, query?: PointerTypes['$(palette).colorPalettes.id<?>.colorShades']): SchemaTypes['$(palette).colorPalettes.id<?>.colorShades'];
export declare function getReferencedObject(root: SchemaRoot, query?: PointerTypes['$(theme).stateVariants.id<?>']): SchemaTypes['$(theme).stateVariants.id<?>'];
export declare function getReferencedObject(root: SchemaRoot, query?: PointerTypes['$(theme).themeColors.id<?>']): SchemaTypes['$(theme).themeColors.id<?>'];
export declare function getReferencedObject(root: SchemaRoot, query?: PointerTypes['$(theme).themes.id<?>']): SchemaTypes['$(theme).themes.id<?>'];
export declare function getReferencedObject(root: SchemaRoot, query?: PointerTypes['$(palette).colorPalettes.id<?>']): SchemaTypes['$(palette).colorPalettes.id<?>'];
export declare function getReferencedObject(root: SchemaRoot, query?: PointerTypes['$(palette).shades.id<?>']): SchemaTypes['$(palette).shades.id<?>'];
export declare function getReferencedObject(root: SchemaRoot, query?: PointerTypes['$(theme).stateVariants']): SchemaTypes['$(theme).stateVariants'];
export declare function getReferencedObject(root: SchemaRoot, query?: PointerTypes['$(theme).themeColors']): SchemaTypes['$(theme).themeColors'];
export declare function getReferencedObject(root: SchemaRoot, query?: PointerTypes['$(theme).themes']): SchemaTypes['$(theme).themes'];
export declare function getReferencedObject(root: SchemaRoot, query?: PointerTypes['$(palette).colorPalettes']): SchemaTypes['$(palette).colorPalettes'];
export declare function getReferencedObject(root: SchemaRoot, query?: PointerTypes['$(palette).shades']): SchemaTypes['$(palette).shades'];
