import { useMemo } from 'react';

export type FileRef = `${string}.${string}`;

export type PartialDiffableQuery = `$(palette).colors`|`$(palette).colors.name<${string}>`|`$(palette).opacities`|`$(palette).opacities.percentage<${number}>`;

export type DiffableQuery = `$(palette).colors.name<${string}>`|`$(palette).opacities.percentage<${number}>`;

export type QueryTypes = {
  ['$(palette).colors.name<?>']: `$(palette).colors.name<${string}>`;
  ['$(palette).opacities.percentage<?>']: `$(palette).opacities.percentage<${number}>`;
};

export function makeQueryRef(query: '$(palette).colors.name<?>', arg0: string): QueryTypes['$(palette).colors.name<?>'];
export function makeQueryRef(query: '$(palette).opacities.percentage<?>', arg0: number): QueryTypes['$(palette).opacities.percentage<?>'];
export function makeQueryRef(query: '$(palette).colors.name<?>'|'$(palette).opacities.percentage<?>', arg0: string|number): QueryTypes['$(palette).colors.name<?>']|QueryTypes['$(palette).opacities.percentage<?>']|null {
  if (query == '$(palette).colors.name<?>') {
    return `$(palette).colors.name<${arg0 as string}>`;
  }
  if (query == '$(palette).opacities.percentage<?>') {
    return `$(palette).opacities.percentage<${arg0 as number}>`;
  }
  return null;
};

export function useQueryRef(query: '$(palette).colors.name<?>', arg0: string): QueryTypes['$(palette).colors.name<?>'];
export function useQueryRef(query: '$(palette).opacities.percentage<?>', arg0: number): QueryTypes['$(palette).opacities.percentage<?>'];
export function useQueryRef(query: '$(palette).colors.name<?>'|'$(palette).opacities.percentage<?>', arg0: string|number): QueryTypes['$(palette).colors.name<?>']|QueryTypes['$(palette).opacities.percentage<?>']|null {
  return useMemo(() => {
    if (query == '$(palette).colors.name<?>') {
      return makeQueryRef(query, arg0 as string);
    }
    if (query == '$(palette).opacities.percentage<?>') {
      return makeQueryRef(query, arg0 as number);
    }
    return null;
  }, [query, arg0]);
};

export type SchemaRoot = {
  ['palette']: {
    ['colors']: Array<{
      ['hexcode']: string;
      ['name']: string;
    }>;
    ['opacities']: Array<{
      ['percentage']: number;
    }>;
  };
};


export type RefReturnTypes = {
  ['$(palette).colors.name<?>']:   {
    ['hexcode']: string;
    ['name']: string;
  };

  ['$(palette).opacities.percentage<?>']:   {
    ['percentage']: number;
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
    if (/^[(d+)]$/.test(part)) {
      return parseInt(((/^[(d+)]$/.exec(part) as Array<string>)[1]));
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
  const pluginName = /^$((.+))$/.exec(pluginWrapper as string)?.[1] ?? null;
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

export const replaceRefVarsWithWildcards = (pathString: string): string => {
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

export function containsDiffable(changeset: Set<string>, query: PartialDiffableQuery, fuzzy: true): boolean;
export function containsDiffable(changeset: Set<string>, query: DiffableQuery, fuzzy: false): boolean;
export function containsDiffable(changeset: Set<string>, query: PartialDiffableQuery|DiffableQuery, fuzzy: boolean) {
  if (!fuzzy) {
    return changeset.has(query);
  }
  for (let value of changeset) {
    if (value.startsWith(query)) {
      return true;
    }
  }
  return false;
}

export function getReferencedObject(root: SchemaRoot, query: QueryTypes['$(palette).colors.name<?>']): RefReturnTypes['$(palette).colors.name<?>'];
export function getReferencedObject(root: SchemaRoot, query: QueryTypes['$(palette).opacities.percentage<?>']): RefReturnTypes['$(palette).opacities.percentage<?>'];
export function getReferencedObject(root: SchemaRoot, query: QueryTypes['$(palette).colors.name<?>']|QueryTypes['$(palette).opacities.percentage<?>']): RefReturnTypes['$(palette).colors.name<?>']|RefReturnTypes['$(palette).opacities.percentage<?>']|null {
  if (replaceRefVarsWithWildcards(query) == '$(palette).colors.name<?>') {
    return getObjectInStateMap(root, query) as RefReturnTypes['$(palette).colors.name<?>'];
  }
  if (replaceRefVarsWithWildcards(query) == '$(palette).opacities.percentage<?>') {
    return getObjectInStateMap(root, query) as RefReturnTypes['$(palette).opacities.percentage<?>'];
  }
  return null;
}
export function useReferencedObject(root: SchemaRoot, query: QueryTypes['$(palette).colors.name<?>']): RefReturnTypes['$(palette).colors.name<?>'];
export function useReferencedObject(root: SchemaRoot, query: QueryTypes['$(palette).opacities.percentage<?>']): RefReturnTypes['$(palette).opacities.percentage<?>'];
export function useReferencedObject(root: SchemaRoot, query: QueryTypes['$(palette).colors.name<?>']|QueryTypes['$(palette).opacities.percentage<?>']): RefReturnTypes['$(palette).colors.name<?>']|RefReturnTypes['$(palette).opacities.percentage<?>']|null {
  return useMemo(() => {
    if (replaceRefVarsWithWildcards(query) == '$(palette).colors.name<?>') {
      return getObjectInStateMap(root, query) as RefReturnTypes['$(palette).colors.name<?>'];
    }
    if (replaceRefVarsWithWildcards(query) == '$(palette).opacities.percentage<?>') {
      return getObjectInStateMap(root, query) as RefReturnTypes['$(palette).opacities.percentage<?>'];
    }
    return null;
  }, [root, query]);
}


export function getPluginStore(root: SchemaRoot, plugin: 'palette'): SchemaRoot['palette'];
export function getPluginStore(root: SchemaRoot, plugin: 'palette'): SchemaRoot['palette'] {
  return root[plugin];
}

export function usePluginStore(root: SchemaRoot, plugin: 'palette'): SchemaRoot['palette'];
export function usePluginStore(root: SchemaRoot, plugin: 'palette'): SchemaRoot['palette'] {
  return useMemo(() => {
    return root[plugin];
  }, [root, plugin]);
}
