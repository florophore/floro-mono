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



const getCounterArrowBalanance = (str: string): number => {
  let counter = 0;
  for (let i = 0; i < str.length; ++i) {
    if (str[i] == "<") counter++;
    if (str[i] == ">") counter--;
  }
  return counter;
};

const extractKeyValueFromRefString = (
  str: string
): { key: string; value: string } => {
  let key = "";
  let i = 0;
  while (str[i] != "<") {
    key += str[i++];
  }
  let value = "";
  let counter = 1;
  i++;
  while (i < str.length) {
    if (str[i] == "<") counter++;
    if (str[i] == ">") counter--;
    if (counter >= 1) {
      value += str[i];
    }
    i++;
  }
  return {
    key,
    value,
  };
};

const splitPath = (str: string): Array<string> => {
  let out: Array<string> = [];
  let arrowBalance = 0;
  let curr = "";
  for (let i = 0; i <= str.length; ++i) {
    if (i == str.length) {
      out.push(curr);
      continue;
    }
    if (arrowBalance == 0 && str[i] == ".") {
      out.push(curr);
      curr = "";
      continue;
    }
    if (str[i] == "<") {
      arrowBalance++;
    }
    if (str[i] == ">") {
      arrowBalance--;
    }
    curr += str[i];
  }
  return out;
};

const decodeSchemaPathWithArrays = (
  pathString: string
): Array<{key: string, value: string} | string | number> => {
  return splitPath(pathString).map((part) => {
    if (/^\[(\d+)\]$/.test(part)) {
      return parseInt(((/^\[(\d+)\]$/.exec(part) as Array<string>)[1]));
    }
    if (/^(.+)<(.+)>$/.test(part) && getCounterArrowBalanance(part) == 0) {
      const { key, value } = extractKeyValueFromRefString(part);
      return {
        key,
        value,
      };
    }
    return part;
  });
};

const getObjectInStateMap = (
  stateMap: { [pluginName: string]: object },
  path: string
): object | null => {
  let current: null | object = null;
  const [pluginWrapper, ...decodedPath] = decodeSchemaPathWithArrays(path);
  const pluginName = /^\$\((.+)\)$/.exec(pluginWrapper as string)?.[1] ?? null;
  if (pluginName == null) {
    return null;
  }
  current = stateMap[pluginName];
  for (const part of decodedPath) {
    if (!current) {
      return null;
    }
    if (typeof part == "number") {
      current = current[part];
    } else if (typeof part != "string") {
      const { key, value } = part as {key: string, value: string};
      if (Array.isArray(current)) {
        const element = current?.find?.((v) => v?.[key] == value);
        current = element;
      } else {
        return null;
      }
    } else {
      current = current[part];
    }
  }
  return current ?? null;
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

export function makeQueryRef(query: '$(theme).themeColors.id<?>.variants.id<?>.variantDefinitions.id<?>', arg0: string, arg1: QueryTypes['$(theme).stateVariants.id<?>'], arg2: QueryTypes['$(theme).themes.id<?>']): QueryTypes['$(theme).themeColors.id<?>.variants.id<?>.variantDefinitions.id<?>'];
export function makeQueryRef(query: '$(theme).themeColors.id<?>.themeDefinitions.id<?>', arg0: string, arg1: QueryTypes['$(theme).themes.id<?>']): QueryTypes['$(theme).themeColors.id<?>.themeDefinitions.id<?>'];
export function makeQueryRef(query: '$(palette).colorPalettes.id<?>.colorShades.id<?>', arg0: string, arg1: QueryTypes['$(palette).shades.id<?>']): QueryTypes['$(palette).colorPalettes.id<?>.colorShades.id<?>'];
export function makeQueryRef(query: '$(theme).themeColors.id<?>.variants.id<?>', arg0: string, arg1: QueryTypes['$(theme).stateVariants.id<?>']): QueryTypes['$(theme).themeColors.id<?>.variants.id<?>'];
export function makeQueryRef(query: '$(palette).colorPalettes.id<?>', arg0: string): QueryTypes['$(palette).colorPalettes.id<?>'];
export function makeQueryRef(query: '$(theme).stateVariants.id<?>', arg0: string): QueryTypes['$(theme).stateVariants.id<?>'];
export function makeQueryRef(query: '$(theme).themeColors.id<?>', arg0: string): QueryTypes['$(theme).themeColors.id<?>'];
export function makeQueryRef(query: '$(palette).shades.id<?>', arg0: string): QueryTypes['$(palette).shades.id<?>'];
export function makeQueryRef(query: '$(theme).themes.id<?>', arg0: string): QueryTypes['$(theme).themes.id<?>'];
export function makeQueryRef(query: '$(theme).stateVariants.id<?>'|'$(theme).themeColors.id<?>'|'$(theme).themeColors.id<?>.themeDefinitions.id<?>'|'$(theme).themeColors.id<?>.variants.id<?>'|'$(theme).themeColors.id<?>.variants.id<?>.variantDefinitions.id<?>'|'$(theme).themes.id<?>'|'$(palette).colorPalettes.id<?>'|'$(palette).colorPalettes.id<?>.colorShades.id<?>'|'$(palette).shades.id<?>', arg0: string, arg1?: QueryTypes['$(theme).themes.id<?>']|QueryTypes['$(theme).stateVariants.id<?>']|QueryTypes['$(palette).shades.id<?>'], arg2?: QueryTypes['$(theme).themes.id<?>']): QueryTypes['$(theme).stateVariants.id<?>']|QueryTypes['$(theme).themeColors.id<?>']|QueryTypes['$(theme).themeColors.id<?>.themeDefinitions.id<?>']|QueryTypes['$(theme).themeColors.id<?>.variants.id<?>']|QueryTypes['$(theme).themeColors.id<?>.variants.id<?>.variantDefinitions.id<?>']|QueryTypes['$(theme).themes.id<?>']|QueryTypes['$(palette).colorPalettes.id<?>']|QueryTypes['$(palette).colorPalettes.id<?>.colorShades.id<?>']|QueryTypes['$(palette).shades.id<?>']|null {
  if ((arg0 != null && arg0 != undefined) && query == '$(theme).stateVariants.id<?>') {
    return `$(theme).stateVariants.id<${arg0 as string}>`;
  }
  if ((arg0 != null && arg0 != undefined) && query == '$(theme).themeColors.id<?>') {
    return `$(theme).themeColors.id<${arg0 as string}>`;
  }
  if ((arg0 != null && arg0 != undefined) && (arg1 != null && arg1 != undefined) && query == '$(theme).themeColors.id<?>.themeDefinitions.id<?>') {
    return `$(theme).themeColors.id<${arg0 as string}>.themeDefinitions.id<${arg1 as QueryTypes['$(theme).themes.id<?>']}>`;
  }
  if ((arg0 != null && arg0 != undefined) && (arg1 != null && arg1 != undefined) && query == '$(theme).themeColors.id<?>.variants.id<?>') {
    return `$(theme).themeColors.id<${arg0 as string}>.variants.id<${arg1 as QueryTypes['$(theme).stateVariants.id<?>']}>`;
  }
  if ((arg0 != null && arg0 != undefined) && (arg1 != null && arg1 != undefined) && (arg2 != null && arg2 != undefined) && query == '$(theme).themeColors.id<?>.variants.id<?>.variantDefinitions.id<?>') {
    return `$(theme).themeColors.id<${arg0 as string}>.variants.id<${arg1 as QueryTypes['$(theme).stateVariants.id<?>']}>.variantDefinitions.id<${arg2 as QueryTypes['$(theme).themes.id<?>']}>`;
  }
  if ((arg0 != null && arg0 != undefined) && query == '$(theme).themes.id<?>') {
    return `$(theme).themes.id<${arg0 as string}>`;
  }
  if ((arg0 != null && arg0 != undefined) && query == '$(palette).colorPalettes.id<?>') {
    return `$(palette).colorPalettes.id<${arg0 as string}>`;
  }
  if ((arg0 != null && arg0 != undefined) && (arg1 != null && arg1 != undefined) && query == '$(palette).colorPalettes.id<?>.colorShades.id<?>') {
    return `$(palette).colorPalettes.id<${arg0 as string}>.colorShades.id<${arg1 as QueryTypes['$(palette).shades.id<?>']}>`;
  }
  if ((arg0 != null && arg0 != undefined) && query == '$(palette).shades.id<?>') {
    return `$(palette).shades.id<${arg0 as string}>`;
  }
  return null;
};


export function extractQueryArgs(query?: QueryTypes['$(theme).themeColors.id<?>.variants.id<?>.variantDefinitions.id<?>']): [string, QueryTypes['$(theme).stateVariants.id<?>'], QueryTypes['$(theme).themes.id<?>']];
export function extractQueryArgs(query?: QueryTypes['$(theme).themeColors.id<?>.themeDefinitions.id<?>']): [string, QueryTypes['$(theme).themes.id<?>']];
export function extractQueryArgs(query?: QueryTypes['$(palette).colorPalettes.id<?>.colorShades.id<?>']): [string, QueryTypes['$(palette).shades.id<?>']];
export function extractQueryArgs(query?: QueryTypes['$(theme).themeColors.id<?>.variants.id<?>']): [string, QueryTypes['$(theme).stateVariants.id<?>']];
export function extractQueryArgs(query?: QueryTypes['$(palette).colorPalettes.id<?>']): [string];
export function extractQueryArgs(query?: QueryTypes['$(theme).stateVariants.id<?>']): [string];
export function extractQueryArgs(query?: QueryTypes['$(theme).themeColors.id<?>']): [string];
export function extractQueryArgs(query?: QueryTypes['$(palette).shades.id<?>']): [string];
export function extractQueryArgs(query?: QueryTypes['$(theme).themes.id<?>']): [string];
export function extractQueryArgs(query?: string): Array<string> {
  if (!query) {
    return [];
  }
  return (
    decodeSchemaPathWithArrays(query)
      ?.filter((v) => typeof v != "string")
      ?.map((v) => (v as { key: string; value: string }).value as string) ?? []
  );
};

export function getReferencedObject(root: SchemaRoot, query?: PointerTypes['$(theme).themeColors.id<?>.variants.id<?>.variantDefinitions.id<?>']): SchemaTypes['$(theme).themeColors.id<?>.variants.id<?>.variantDefinitions.id<?>'];
export function getReferencedObject(root: SchemaRoot, query?: PointerTypes['$(theme).themeColors.id<?>.variants.id<?>.variantDefinitions']): SchemaTypes['$(theme).themeColors.id<?>.variants.id<?>.variantDefinitions'];
export function getReferencedObject(root: SchemaRoot, query?: PointerTypes['$(theme).themeColors.id<?>.themeDefinitions.id<?>']): SchemaTypes['$(theme).themeColors.id<?>.themeDefinitions.id<?>'];
export function getReferencedObject(root: SchemaRoot, query?: PointerTypes['$(theme).themeColors.id<?>.variants.id<?>']): SchemaTypes['$(theme).themeColors.id<?>.variants.id<?>'];
export function getReferencedObject(root: SchemaRoot, query?: PointerTypes['$(palette).colorPalettes.id<?>.colorShades.id<?>']): SchemaTypes['$(palette).colorPalettes.id<?>.colorShades.id<?>'];
export function getReferencedObject(root: SchemaRoot, query?: PointerTypes['$(theme).themeColors.id<?>.themeDefinitions']): SchemaTypes['$(theme).themeColors.id<?>.themeDefinitions'];
export function getReferencedObject(root: SchemaRoot, query?: PointerTypes['$(theme).themeColors.id<?>.variants']): SchemaTypes['$(theme).themeColors.id<?>.variants'];
export function getReferencedObject(root: SchemaRoot, query?: PointerTypes['$(theme).themes.id<?>.backgroundColor']): SchemaTypes['$(theme).themes.id<?>.backgroundColor'];
export function getReferencedObject(root: SchemaRoot, query?: PointerTypes['$(palette).colorPalettes.id<?>.colorShades']): SchemaTypes['$(palette).colorPalettes.id<?>.colorShades'];
export function getReferencedObject(root: SchemaRoot, query?: PointerTypes['$(theme).stateVariants.id<?>']): SchemaTypes['$(theme).stateVariants.id<?>'];
export function getReferencedObject(root: SchemaRoot, query?: PointerTypes['$(theme).themeColors.id<?>']): SchemaTypes['$(theme).themeColors.id<?>'];
export function getReferencedObject(root: SchemaRoot, query?: PointerTypes['$(theme).themes.id<?>']): SchemaTypes['$(theme).themes.id<?>'];
export function getReferencedObject(root: SchemaRoot, query?: PointerTypes['$(palette).colorPalettes.id<?>']): SchemaTypes['$(palette).colorPalettes.id<?>'];
export function getReferencedObject(root: SchemaRoot, query?: PointerTypes['$(palette).shades.id<?>']): SchemaTypes['$(palette).shades.id<?>'];
export function getReferencedObject(root: SchemaRoot, query?: PointerTypes['$(theme).stateVariants']): SchemaTypes['$(theme).stateVariants'];
export function getReferencedObject(root: SchemaRoot, query?: PointerTypes['$(theme).themeColors']): SchemaTypes['$(theme).themeColors'];
export function getReferencedObject(root: SchemaRoot, query?: PointerTypes['$(theme).themes']): SchemaTypes['$(theme).themes'];
export function getReferencedObject(root: SchemaRoot, query?: PointerTypes['$(palette).colorPalettes']): SchemaTypes['$(palette).colorPalettes'];
export function getReferencedObject(root: SchemaRoot, query?: PointerTypes['$(palette).shades']): SchemaTypes['$(palette).shades'];

export function getReferencedObject<T>(root: SchemaRoot, query?: string): T|null {
  if (!query) {
    return null;
  }
  const existingObj = getObjectInStateMap(
    root,
    query
  );
  if (existingObj) {
    return existingObj as T;
  }
  return null;
};

