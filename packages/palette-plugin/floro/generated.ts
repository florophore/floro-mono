import { useMemo } from "react";

export type QueryTypes = {
  ['$(A).aObjects.aKey<?>']: `$(A).aObjects.aKey<${number}>`;
  ['$(A).aObjects.aKey<?>.nestedValue.nestedSet.nestedSetKey<?>']: `$(A).aObjects.aKey<${number}>.nestedValue.nestedSet.nestedSetKey<${QueryTypes['$(A).aObjects.aKey<?>']}>`;
  ['$(B).bObjects.mainKey<?>']: `$(B).bObjects.mainKey<${string}>`;
};

export function makeQueryRef(query: '$(A).aObjects.aKey<?>', arg0: number): QueryTypes['$(A).aObjects.aKey<?>'];
export function makeQueryRef(query: '$(A).aObjects.aKey<?>.nestedValue.nestedSet.nestedSetKey<?>', arg0: number, arg1: QueryTypes['$(A).aObjects.aKey<?>']): QueryTypes['$(A).aObjects.aKey<?>.nestedValue.nestedSet.nestedSetKey<?>'];
export function makeQueryRef(query: '$(B).bObjects.mainKey<?>', arg0: string): QueryTypes['$(B).bObjects.mainKey<?>'];
export function makeQueryRef(query: '$(A).aObjects.aKey<?>'|'$(A).aObjects.aKey<?>.nestedValue.nestedSet.nestedSetKey<?>'|'$(B).bObjects.mainKey<?>', arg0: number|string, arg1?: QueryTypes['$(A).aObjects.aKey<?>']): QueryTypes['$(A).aObjects.aKey<?>']|QueryTypes['$(A).aObjects.aKey<?>.nestedValue.nestedSet.nestedSetKey<?>']|QueryTypes['$(B).bObjects.mainKey<?>']|null {
  if (query == '$(A).aObjects.aKey<?>') {
    return `$(A).aObjects.aKey<${arg0 as number}>`;
  }
  if (query == '$(A).aObjects.aKey<?>.nestedValue.nestedSet.nestedSetKey<?>') {
    return `$(A).aObjects.aKey<${arg0 as number}>.nestedValue.nestedSet.nestedSetKey<${arg1 as QueryTypes['$(A).aObjects.aKey<?>']}>`;
  }
  if (query == '$(B).bObjects.mainKey<?>') {
    return `$(B).bObjects.mainKey<${arg0 as string}>`;
  }
  return null;
};


export type SchemaRoot = {
  ['A']: {
    ['aObjects']: Array<{
      ['aKey']: number;
      ['something']: {
        ['someRef']: QueryTypes['$(A).aObjects.aKey<?>'];
      };
      ['nestedValue']: {
        ['nestedSet']: Array<{
          ['nestedSetKey']: QueryTypes['$(A).aObjects.aKey<?>'];
        }>;
      };
    }>;
  };
  ['B']: {
    ['bObjects']: Array<{
      ['mainKey']: string;
      ['aRef']: QueryTypes['$(A).aObjects.aKey<?>'];
      ['aConstrainedRef']: QueryTypes['$(A).aObjects.aKey<?>.nestedValue.nestedSet.nestedSetKey<?>'];
    }>;
  };
};


export type RefReturnTypes = {
  ['$(A).aObjects.aKey<?>']:   {
    ['aKey']: number;
    ['something']: {
      ['someRef']: QueryTypes['$(A).aObjects.aKey<?>'];
    };
    ['nestedValue']: {
      ['nestedSet']: Array<{
        ['nestedSetKey']: QueryTypes['$(A).aObjects.aKey<?>'];
      }>;
    };
  };

  ['$(A).aObjects.aKey<?>.nestedValue.nestedSet.nestedSetKey<?>']:   {
    ['nestedSetKey']: QueryTypes['$(A).aObjects.aKey<?>'];
  };

  ['$(B).bObjects.mainKey<?>']:   {
    ['mainKey']: string;
    ['aRef']: QueryTypes['$(A).aObjects.aKey<?>'];
    ['aConstrainedRef']: QueryTypes['$(A).aObjects.aKey<?>.nestedValue.nestedSet.nestedSetKey<?>'];
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

export const decodeSchemaPath = (
  pathString: string
): Array<{ key: string; value: string } | string> => {
  return splitPath(pathString).map((part) => {
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

export const getObjectInStateMap = (stateMap: object, path: string): object | null => {
  let current: null | undefined | object = null;
  const [pluginWrapper, ...decodedPath] = decodeSchemaPath(path);
  const pluginName = /^$((.+))$/.exec(pluginWrapper as string)?.[1] ?? null;
  if (!pluginName) {
    return null;
  }
  current = stateMap[pluginName];
  for (let part of decodedPath) {
    if (!current) {
      return null;
    }
    if (typeof part != "string") {
      const { key, value } = part as { key: string; value: string };
      if (Array.isArray(current)) {
        const element = current.find?.((v) => v?.[key] == value);
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

const replaceRefVarsWithWildcards = (pathString: string): string => {
  const path = splitPath(pathString);
  return path
    .map((part) => {
      if (/^(.+)<(.+)>$/.test(part)) {
        const { key } = extractKeyValueFromRefString(part);
        return `${key}<?>`;
      }
      return part;
    })
    .join(".");
};

export function getReferencedObject(root: SchemaRoot, query: QueryTypes['$(A).aObjects.aKey<?>']): RefReturnTypes['$(A).aObjects.aKey<?>'];
export function getReferencedObject(root: SchemaRoot, query: QueryTypes['$(A).aObjects.aKey<?>.nestedValue.nestedSet.nestedSetKey<?>']): RefReturnTypes['$(A).aObjects.aKey<?>.nestedValue.nestedSet.nestedSetKey<?>'];
export function getReferencedObject(root: SchemaRoot, query: QueryTypes['$(B).bObjects.mainKey<?>']): RefReturnTypes['$(B).bObjects.mainKey<?>'];
export function getReferencedObject(root: SchemaRoot, query: QueryTypes['$(A).aObjects.aKey<?>']|QueryTypes['$(A).aObjects.aKey<?>.nestedValue.nestedSet.nestedSetKey<?>']|QueryTypes['$(B).bObjects.mainKey<?>']): RefReturnTypes['$(A).aObjects.aKey<?>']|RefReturnTypes['$(A).aObjects.aKey<?>.nestedValue.nestedSet.nestedSetKey<?>']|RefReturnTypes['$(B).bObjects.mainKey<?>']|null {
  if (replaceRefVarsWithWildcards(query) == '$(A).aObjects.aKey<?>') {
    return getObjectInStateMap(root, query) as RefReturnTypes['$(A).aObjects.aKey<?>'];
  }
  if (replaceRefVarsWithWildcards(query) == '$(A).aObjects.aKey<?>.nestedValue.nestedSet.nestedSetKey<?>') {
    return getObjectInStateMap(root, query) as RefReturnTypes['$(A).aObjects.aKey<?>.nestedValue.nestedSet.nestedSetKey<?>'];
  }
  if (replaceRefVarsWithWildcards(query) == '$(B).bObjects.mainKey<?>') {
    return getObjectInStateMap(root, query) as RefReturnTypes['$(B).bObjects.mainKey<?>'];
  }
  return null;
}

export function getPluginStore(root: SchemaRoot, plugin: 'A'): SchemaRoot['A'];
export function getPluginStore(root: SchemaRoot, plugin: 'B'): SchemaRoot['B'];
export function getPluginStore(root: SchemaRoot, plugin: 'A'|'B'): SchemaRoot['A']|SchemaRoot['B'] {
  return root[plugin];
}

export function usePluginStore(root: SchemaRoot, plugin: 'A'): SchemaRoot['A'];
export function usePluginStore(root: SchemaRoot, plugin: 'B'): SchemaRoot['B'];
export function usePluginStore(root: SchemaRoot, plugin: 'A'|'B'): SchemaRoot['A']|SchemaRoot['B'] {
  return useMemo(() => {
    return root[plugin];
  }, [root, plugin]);
}
