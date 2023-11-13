export type FileRef = `${string}.${string}`;

export type SchemaTypes = {
  ['$(todo).todos.id<?>.inProgress']: {
    ['value']: boolean;
  };
  ['$(todo).todos.id<?>']: {
    ['id']: string;
    ['inProgress']: {
      ['value']: boolean;
    };
    ['isDone']: boolean;
  };
  ['$(todo).todos']: Array<{
    ['id']: string;
    ['inProgress']: {
      ['value']: boolean;
    };
    ['isDone']: boolean;
  }>;
};


export type PointerTypes = {
  ['$(todo).todos.id<?>.inProgress']: `$(todo).todos.id<${string}>.inProgress`;
  ['$(todo).todos.id<?>']: `$(todo).todos.id<${string}>`;
  ['$(todo).todos']: `$(todo).todos`;
};


export type SchemaRoot = {
  ['todo']: {
    ['todos']: Array<{
      ['id']: string;
      ['inProgress']: {
        ['value']: boolean;
      };
      ['isDone']: boolean;
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
  ['$(todo).todos.id<?>']: `$(todo).todos.id<${string}>`;
};

export function makeQueryRef(query: '$(todo).todos.id<?>', arg0: string): QueryTypes['$(todo).todos.id<?>'];
export function makeQueryRef(query: '$(todo).todos.id<?>', arg0: string): QueryTypes['$(todo).todos.id<?>']|null {
  if ((arg0 != null && arg0 != undefined) && query == '$(todo).todos.id<?>') {
    return `$(todo).todos.id<${arg0 as string}>`;
  }
  return null;
};


export function extractQueryArgs(query?: QueryTypes['$(todo).todos.id<?>']): [string];
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

export function getReferencedObject(root: SchemaRoot, query?: PointerTypes['$(todo).todos.id<?>.inProgress']): SchemaTypes['$(todo).todos.id<?>.inProgress'];
export function getReferencedObject(root: SchemaRoot, query?: PointerTypes['$(todo).todos.id<?>']): SchemaTypes['$(todo).todos.id<?>'];
export function getReferencedObject(root: SchemaRoot, query?: PointerTypes['$(todo).todos']): SchemaTypes['$(todo).todos'];

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

