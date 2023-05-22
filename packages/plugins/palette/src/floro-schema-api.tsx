import React, { useEffect, createContext, useMemo, useCallback, useState, useContext, useRef } from 'react';

export type FileRef = `${string}.${string}`;

export type PartialDiffableQuery = `$(palette).colorPalettes.id<${string}>.colorShades.id<${QueryTypes['$(palette).shades.id<?>']}>`|`$(palette).colorPalettes.id<${string}>.colorShades`|`$(palette).colorPalettes.id<${string}>`|`$(palette).shades.id<${string}>`|`$(palette).colorPalettes`|`$(palette).shades`;

export type DiffableQuery = `$(palette).colorPalettes.id<${string}>.colorShades.id<${QueryTypes['$(palette).shades.id<?>']}>`|`$(palette).colorPalettes.id<${string}>`|`$(palette).shades.id<${string}>`;

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



interface Packet {
  id: string;
  chunk: string;
  index: number;
  totalPackets: number;
  pluginName: string;
}

interface PluginState {
  commandMode: "view" | "edit" | "compare";
  compareFrom: "none" | "before" | "after";
  applicationState: SchemaRoot | null;
  apiStoreInvalidity: {[key: string]: Array<string>};
  conflictList: Array<string>;
  changeset: Array<string>;
  binaryUrls: {
    upload: null|string,
    download: null|string,
  };
}

interface IFloroContext {
  commandMode: "view" | "edit" | "compare";
  compareFrom: "none" | "before" | "after";
  applicationState: SchemaRoot | null;
  changeset: Set<string>;
  apiStoreInvalidity: {[key: string]: Array<string>};
  apiStoreInvaliditySets: {[key: string]: Set<string>};
  conflictSet: Set<string>;
  hasLoaded: boolean;
  saveState: <T extends keyof SchemaRoot>(pluginName: T, state: SchemaRoot|null) => string | null;
  setPluginState: (state: PluginState) => void;
  pluginState: PluginState;
  loadingIds: Set<string>;
}

const FloroContext = createContext({
  commandMode: "view",
  compareFrom: "none",
  applicationState: null,
  changeset: new Set([]),
  apiStoreInvalidity: {},
  apiStoreInvaliditySets: {},
  conflictSet: new Set([]),
  hasLoaded: false,
  saveState: (_state: null) => null,
  setPluginState: (_state: PluginState) => {},
  pluginState: {
    commandMode: "view",
    compareFrom: "none",
    applicationState: null,
    apiStoreInvalidity: {},
    conflictList: [],
    changeset: [],
    binaryUrls: {
      upload: null,
      download: null,
    },
  },
  loadingIds: new Set([]),
} as IFloroContext);

export interface Props {
  children: React.ReactElement;
}

const MAX_DATA_SIZE = 10_000;
const sendMessagetoParent = (id: string, pluginName: string, command: string, data: object) => {
  const dataString = JSON.stringify({ command, data });
  const totalPackets = Math.floor(dataString.length / MAX_DATA_SIZE);
  for (let i = 0; i < dataString.length; i += MAX_DATA_SIZE) {
    const chunk =
      i + MAX_DATA_SIZE > dataString.length
        ? dataString.substring(i)
        : dataString.substring(i, i + MAX_DATA_SIZE);
    setTimeout(() => {
      window.parent?.postMessage(
        {
          id,
          chunk,
          index: i / MAX_DATA_SIZE,
          totalPackets,
          pluginName
        },
        "*"
      );
    }, 0);
  }
};

export const FloroProvider = (props: Props) => {
  const [pluginState, setPluginState] = useState<PluginState>({
    commandMode: "view",
    compareFrom: "none",
    applicationState: null,
    apiStoreInvalidity: {},
    conflictList: [],
    changeset: [],
    binaryUrls: {
      upload: null,
      download: null,
    },
  });
  const [hasLoaded, setHasLoaded] = useState(false);
  const [loadingIds, setLoadingIds] = useState<Set<string>>(new Set());
  const ids = useRef<Set<string>>(new Set());

  const incoming = useRef({});

  const commandMode = useMemo(() => {
    return pluginState.commandMode;
  }, [pluginState.commandMode]);

  const compareFrom = useMemo(() => {
    return pluginState.compareFrom;
  }, [pluginState.compareFrom]);

  const changeset = useMemo(() => {
    return new Set(pluginState.changeset);
  }, [pluginState.changeset]);

  const conflictSet = useMemo(() => {
    return new Set(pluginState.conflictList ?? []);
  }, [pluginState.conflictList]);

  useEffect(() => {
    const commandToggleListeners = (event: KeyboardEvent) => {
      if (event.metaKey && event.shiftKey && event.key == "p") {
        window.parent?.postMessage("toggle-vcs", "*");
      }
      if (event.metaKey && event.shiftKey && event.key == "e") {
        window.parent?.postMessage("toggle-command-mode", "*");
      }

      if (event.metaKey && event.shiftKey && event.key == "[") {
        window.parent?.postMessage("toggle-before", "*");
      }

      if (event.metaKey && event.shiftKey && event.key == "]") {
        window.parent?.postMessage("toggle-after", "*");
      }

      if (event.metaKey && event.shiftKey && event.key == "c") {
        window.parent?.postMessage("toggle-compare-mode", "*");
      }

      if (event.metaKey && event.shiftKey && event.key == "b") {
        window.parent?.postMessage("toggle-branches", "*");
      }
    };
    window.addEventListener("keydown", commandToggleListeners);
    return () => {
      window.removeEventListener("keydown", commandToggleListeners);
    };
  }, []);

  const saveState = useCallback(
    <T extends keyof SchemaRoot>(pluginName: T, state: SchemaRoot|null): string | null => {
      if (commandMode != "edit") {
        return null;
      }
      if (state == null || state[pluginName] == null) {
        return null;
      }
      if (ids.current) {
        const id = Math.random().toString(16).substring(2);
        ids.current = new Set([...Array.from(ids.current), id]);
        setLoadingIds(ids.current);
        new Promise((resolve) => {
          const onReturnId = ({ data }) => {
            if (data.id == id) {
              if (
                incoming.current[data.id] &&
                incoming.current[data.id].counter == data.totalPackets + 1
              ) {
                ids.current = new Set([
                  ...Array.from(ids.current).filter((i) => i != id),
                ]);
                setLoadingIds(ids.current);
                delete incoming.current[data.id];
                window.removeEventListener("message", onReturnId);
                resolve(id);
              }
            }
          };
          window.addEventListener("message", onReturnId);
          sendMessagetoParent(id, pluginName, "save", state[pluginName]);
        });
        return id;
      }
      return null;
    },
    [commandMode, loadingIds]
  );

  const applicationState = useMemo(() => {
    if (!hasLoaded) {
      return {} as SchemaRoot;
    }
    return pluginState.applicationState;
  }, [pluginState.applicationState, hasLoaded]);

  const apiStoreInvalidity = useMemo(() => {
    if (!hasLoaded) {
      return {} as {[key: string]: Array<string>};
    }
    return pluginState.apiStoreInvalidity ?? {};
  }, [pluginState.apiStoreInvalidity, hasLoaded]);

  const apiStoreInvalidityStr = useMemo(() => {
    return JSON.stringify(apiStoreInvalidity);
  }, [apiStoreInvalidity]);

  const apiStoreInvaliditySets = useMemo(() => {
    const out: {[key: string]: Set<string>} = {};
     for (let plugin in apiStoreInvalidity) {
      out[plugin] = new Set(apiStoreInvalidity?.[plugin] ?? []);
     }
     return out;
  }, [apiStoreInvalidityStr]);

  useEffect(() => {
    const onMessage = ({ data }: { data: Packet }) => {
      if (!incoming.current[data.id]) {
        incoming.current[data.id] = {
          counter: 0,
          data: new Array(data.totalPackets + 1),
        };
      }
      incoming.current[data.id].data[data.index] = data.chunk;
      incoming.current[data.id].counter++;
      if (incoming.current[data.id].counter == data.totalPackets + 1) {
        const response: {event: string, data: unknown} = JSON.parse(
          incoming.current[data.id].data.join("")
        );
        if (response.event == "load") {
            const state: PluginState = response.data as PluginState;
            setPluginState(state);
            setHasLoaded(true);
        }
        if (response.event == "ack" || response.event == "update") {
            const state: PluginState = response.data as PluginState;
            setPluginState(state);
        }
        if (!ids.current.has(data.id)) {
          delete incoming.current[data.id];
        }
      }
    };
    window.addEventListener("message", onMessage, true);
    window.parent?.postMessage("ready", "*");
    return () => {
      window.removeEventListener("message", onMessage, true);
    };
  }, []);

  return (
    <FloroContext.Provider
      value={{
        applicationState,
        apiStoreInvalidity,
        apiStoreInvaliditySets,
        changeset,
        conflictSet,
        commandMode,
        compareFrom,
        hasLoaded,
        saveState,
        setPluginState,
        pluginState,
        loadingIds,
      }}
    >
      {props.children}
    </FloroContext.Provider>
  );
};

export const useFloroContext = () => {
  return useContext(FloroContext);
};

function getPluginNameFromQuery(query: string|null): keyof SchemaRoot|null {
  if (query == null) {
    return null;
  }
  const [pluginWrapper] = query.split(".");
  const pluginName = /^\$\((.+)\)$/.exec(pluginWrapper as string)?.[1] ?? null;
  if (!pluginName) {
    return null;
  }
  return pluginName as keyof SchemaRoot;
}

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

export function containsDiffable(changeset: Set<string>, query: PartialDiffableQuery, fuzzy: boolean): boolean;
export function containsDiffable(changeset: Set<string>, query: DiffableQuery, fuzzy: boolean): boolean;
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

const getIndexPathInStateMap = (
  stateMap: { [pluginName: string]: object },
  path: string
): Array<string | number> | null => {
  let current: null | object = null;
  const [pluginWrapper, ...decodedPath] = decodeSchemaPathWithArrays(path);
  const pluginName = /^\$\((.+)\)$/.exec(pluginWrapper as string)?.[1] ?? null;
  const indexPath: Array<string | number> = [];
  if (pluginName == null) {
    return null;
  }
  indexPath.push(pluginName);
  current = stateMap[pluginName];
  for (const part of decodedPath) {
    if (!current) {
      return null;
    }
    if (typeof part == "number") {
      current = current[part];
      indexPath.push(part);
    } else if (typeof part != "string") {
      const { key, value } = part as { key: string; value: string };
      if (Array.isArray(current)) {
        const element = current?.find?.((v, index) => {
          if (v?.[key] == value) {
            indexPath.push(index);
            return true;
          }
          return false;
        });
        current = element;
      } else {
        return null;
      }
    } else {
      indexPath.push(part);
      current = current[part];
    }
  }
  return indexPath;
};

const updateObjectInStateMap = (
  stateMap: { [pluginName: string]: object },
  path: string,
  objectToUpdate: object
) => {
  const indexPath = getIndexPathInStateMap(stateMap, path);
  if (indexPath == null) {
    return null;
  }
  let current: object = stateMap;
  let last!: object | Array<object>;
  for (let i = 0; i < indexPath.length; ++i) {
    last = current;
    current = current[indexPath[i]];
  }
  if (!last) {
    return stateMap;
  }
  last[indexPath[indexPath.length - 1]] = objectToUpdate;
  return stateMap;
};


export type QueryTypes = {
  ['$(palette).colorPalettes.id<?>']: `$(palette).colorPalettes.id<${string}>`;
  ['$(palette).colorPalettes.id<?>.colorShades.id<?>']: `$(palette).colorPalettes.id<${string}>.colorShades.id<${QueryTypes['$(palette).shades.id<?>']}>`;
  ['$(palette).shades.id<?>']: `$(palette).shades.id<${string}>`;
};

export function makeQueryRef(query: '$(palette).colorPalettes.id<?>.colorShades.id<?>', arg0: string, arg1: QueryTypes['$(palette).shades.id<?>']): QueryTypes['$(palette).colorPalettes.id<?>.colorShades.id<?>'];
export function makeQueryRef(query: '$(palette).colorPalettes.id<?>', arg0: string): QueryTypes['$(palette).colorPalettes.id<?>'];
export function makeQueryRef(query: '$(palette).shades.id<?>', arg0: string): QueryTypes['$(palette).shades.id<?>'];
export function makeQueryRef(query: '$(palette).colorPalettes.id<?>'|'$(palette).colorPalettes.id<?>.colorShades.id<?>'|'$(palette).shades.id<?>', arg0: string, arg1?: QueryTypes['$(palette).shades.id<?>']): QueryTypes['$(palette).colorPalettes.id<?>']|QueryTypes['$(palette).colorPalettes.id<?>.colorShades.id<?>']|QueryTypes['$(palette).shades.id<?>']|null {
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

export function useQueryRef(query: '$(palette).colorPalettes.id<?>.colorShades.id<?>', arg0: string, arg1: QueryTypes['$(palette).shades.id<?>']): QueryTypes['$(palette).colorPalettes.id<?>.colorShades.id<?>'];
export function useQueryRef(query: '$(palette).colorPalettes.id<?>', arg0: string): QueryTypes['$(palette).colorPalettes.id<?>'];
export function useQueryRef(query: '$(palette).shades.id<?>', arg0: string): QueryTypes['$(palette).shades.id<?>'];
export function useQueryRef(query: '$(palette).colorPalettes.id<?>'|'$(palette).colorPalettes.id<?>.colorShades.id<?>'|'$(palette).shades.id<?>', arg0: string, arg1?: QueryTypes['$(palette).shades.id<?>']): QueryTypes['$(palette).colorPalettes.id<?>']|QueryTypes['$(palette).colorPalettes.id<?>.colorShades.id<?>']|QueryTypes['$(palette).shades.id<?>']|null {
  return useMemo(() => {
    if (query == '$(palette).colorPalettes.id<?>') {
      return makeQueryRef(query, arg0 as string);
    }
    if (query == '$(palette).colorPalettes.id<?>.colorShades.id<?>') {
      return makeQueryRef(query, arg0 as string, arg1 as QueryTypes['$(palette).shades.id<?>']);
    }
    if (query == '$(palette).shades.id<?>') {
      return makeQueryRef(query, arg0 as string);
    }
    return null;
  }, [query, arg0, arg1]);
};

export function extractQueryArgs(query?: QueryTypes['$(palette).colorPalettes.id<?>.colorShades.id<?>']): [string, QueryTypes['$(palette).shades.id<?>']];
export function extractQueryArgs(query?: QueryTypes['$(palette).colorPalettes.id<?>']): [string];
export function extractQueryArgs(query?: QueryTypes['$(palette).shades.id<?>']): [string];
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

export function useExtractQueryArgs(query?: QueryTypes['$(palette).colorPalettes.id<?>.colorShades.id<?>']): [string, QueryTypes['$(palette).shades.id<?>']];
export function useExtractQueryArgs(query?: QueryTypes['$(palette).colorPalettes.id<?>']): [string];
export function useExtractQueryArgs(query?: QueryTypes['$(palette).shades.id<?>']): [string];
export function useExtractQueryArgs(query?: string): Array<string> {
  return useMemo(() => {
    if (!query) {
      return [];
    }
    return (
      decodeSchemaPathWithArrays(query)
        ?.filter((v) => typeof v != "string")
        ?.map((v) => (v as { key: string; value: string }).value as string) ?? []
    );
  }, [query]);
};

export function getPluginStore(plugin: 'palette'): SchemaRoot['palette'];
export function getPluginStore(plugin: 'palette'): SchemaRoot['palette'] {
  const ctx = useFloroContext();
  const root = ctx.applicationState;
  if (root == null) {
    return {} as SchemaRoot['palette'];
  }
  return root[plugin];
}

export function usePluginStore(plugin: 'palette'): SchemaRoot['palette'];
export function usePluginStore(plugin: 'palette'): SchemaRoot['palette'] {
  const ctx = useFloroContext();
  const root = ctx.applicationState;
  return useMemo(() => {
    if (root == null) {
      return {} as SchemaRoot['palette'];
    }
    return root[plugin];
  }, [root, plugin]);
}

export function getReferencedObject(root: SchemaRoot, query?: PointerTypes['$(palette).colorPalettes.id<?>.colorShades.id<?>']): SchemaTypes['$(palette).colorPalettes.id<?>.colorShades.id<?>'];
export function getReferencedObject(root: SchemaRoot, query?: PointerTypes['$(palette).colorPalettes.id<?>.colorShades']): SchemaTypes['$(palette).colorPalettes.id<?>.colorShades'];
export function getReferencedObject(root: SchemaRoot, query?: PointerTypes['$(palette).colorPalettes.id<?>']): SchemaTypes['$(palette).colorPalettes.id<?>'];
export function getReferencedObject(root: SchemaRoot, query?: PointerTypes['$(palette).shades.id<?>']): SchemaTypes['$(palette).shades.id<?>'];
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

export function useReferencedObject(query?: PointerTypes['$(palette).colorPalettes.id<?>.colorShades.id<?>']): SchemaTypes['$(palette).colorPalettes.id<?>.colorShades.id<?>'];
export function useReferencedObject(query?: PointerTypes['$(palette).colorPalettes.id<?>.colorShades']): SchemaTypes['$(palette).colorPalettes.id<?>.colorShades'];
export function useReferencedObject(query?: PointerTypes['$(palette).colorPalettes.id<?>']): SchemaTypes['$(palette).colorPalettes.id<?>'];
export function useReferencedObject(query?: PointerTypes['$(palette).shades.id<?>']): SchemaTypes['$(palette).shades.id<?>'];
export function useReferencedObject(query?: PointerTypes['$(palette).colorPalettes']): SchemaTypes['$(palette).colorPalettes'];
export function useReferencedObject(query?: PointerTypes['$(palette).shades']): SchemaTypes['$(palette).shades'];

export function useReferencedObject<T>(query?: string): T|null {
  const ctx = useFloroContext();
  return useMemo(() => {
    if (!query) {
      return null;
    }
    const existingObj = getObjectInStateMap(
      ctx.applicationState as SchemaRoot,
      query
    );
    if (existingObj) {
      return existingObj as T;
    }
    return null;
  }, [query, ctx.applicationState]);
};

export function useFloroState(query: PointerTypes['$(palette).colorPalettes.id<?>.colorShades.id<?>'], defaultData?: SchemaTypes['$(palette).colorPalettes.id<?>.colorShades.id<?>'], mutateStoreWithDefault?: boolean): [SchemaTypes['$(palette).colorPalettes.id<?>.colorShades.id<?>']|null, (t: SchemaTypes['$(palette).colorPalettes.id<?>.colorShades.id<?>'], doSave?: boolean) => void, boolean, () => void];
export function useFloroState(query: PointerTypes['$(palette).colorPalettes.id<?>.colorShades'], defaultData?: SchemaTypes['$(palette).colorPalettes.id<?>.colorShades'], mutateStoreWithDefault?: boolean): [SchemaTypes['$(palette).colorPalettes.id<?>.colorShades']|null, (t: SchemaTypes['$(palette).colorPalettes.id<?>.colorShades'], doSave?: boolean) => void, boolean, () => void];
export function useFloroState(query: PointerTypes['$(palette).colorPalettes.id<?>'], defaultData?: SchemaTypes['$(palette).colorPalettes.id<?>'], mutateStoreWithDefault?: boolean): [SchemaTypes['$(palette).colorPalettes.id<?>']|null, (t: SchemaTypes['$(palette).colorPalettes.id<?>'], doSave?: boolean) => void, boolean, () => void];
export function useFloroState(query: PointerTypes['$(palette).shades.id<?>'], defaultData?: SchemaTypes['$(palette).shades.id<?>'], mutateStoreWithDefault?: boolean): [SchemaTypes['$(palette).shades.id<?>']|null, (t: SchemaTypes['$(palette).shades.id<?>'], doSave?: boolean) => void, boolean, () => void];
export function useFloroState(query: PointerTypes['$(palette).colorPalettes'], defaultData?: SchemaTypes['$(palette).colorPalettes'], mutateStoreWithDefault?: boolean): [SchemaTypes['$(palette).colorPalettes']|null, (t: SchemaTypes['$(palette).colorPalettes'], doSave?: boolean) => void, boolean, () => void];
export function useFloroState(query: PointerTypes['$(palette).shades'], defaultData?: SchemaTypes['$(palette).shades'], mutateStoreWithDefault?: boolean): [SchemaTypes['$(palette).shades']|null, (t: SchemaTypes['$(palette).shades'], doSave?: boolean) => void, boolean, () => void];

export function useFloroState<T>(query: string, defaultData?: T, mutateStoreWithDefault = true): [T|null, (t: T, doSave?: boolean) => void, boolean, () => void] {
  const ctx = useFloroContext();
  const pluginName = useMemo(() => getPluginNameFromQuery(query), [query]);
  const objString = useMemo(() => {
    if (!ctx.applicationState) {
        return null;
    }
    const existingObj = getObjectInStateMap(
      ctx.applicationState as SchemaRoot,
      query
    );
    if (!existingObj) {
      return null;
    }
    return JSON.stringify(existingObj);
  }, [ctx.applicationState, query])


  const obj = useMemo((): T|null => {
    if (!ctx.hasLoaded) {
      return defaultData ?? null;
    }
    const existingObj = getObjectInStateMap(
      ctx.applicationState as SchemaRoot,
      query
    );
    if (existingObj) {
      return existingObj as T;
    }

    if (mutateStoreWithDefault && ctx.applicationState && defaultData) {
      updateObjectInStateMap(ctx.applicationState, query, defaultData);
    }
    if (ctx.applicationState && defaultData) {
      return defaultData;
    }
    return null;
  }, [ctx.applicationState, query, defaultData, mutateStoreWithDefault, ctx.hasLoaded]);

  const [getter, setter] = useState<T|null>(obj ?? defaultData ?? null);

  const [id, setId] = useState<string | null>(null);

  useEffect(() => {
    setter(obj);
  }, [objString]);

  const isLoading = useMemo(
    () => !!id && ctx.loadingIds.has(id),
    [id, ctx.loadingIds]
  );

  const save = useCallback(() => {
    if (ctx.applicationState && pluginName && getter && ctx.commandMode == "edit") {
      updateObjectInStateMap(ctx.applicationState, query, getter);
      ctx.setPluginState({
        ...ctx.pluginState,
        applicationState: ctx.applicationState
      });
      const id = ctx.saveState(pluginName, ctx.applicationState);
      if (id) {
        setId(id);
      }
    }
  }, [query, pluginName, ctx.pluginState, ctx.applicationState, ctx.commandMode, getter]);

  const set = useCallback((obj: T, save: boolean = false) => {
    setter(obj);
    if (save && ctx.applicationState && pluginName && obj && ctx.commandMode == "edit") {
      updateObjectInStateMap(ctx.applicationState, query, obj);
      ctx.setPluginState({
        ...ctx.pluginState,
        applicationState: ctx.applicationState
      });
      const id = ctx.saveState(pluginName, ctx.applicationState);
      if (id) {
        setId(id);
      }
    }
  }, [query, pluginName, ctx.pluginState, ctx.applicationState, ctx.commandMode])
  return [getter, set, isLoading, save];
};
export function useIsFloroInvalid(query: PointerTypes['$(palette).colorPalettes.id<?>.colorShades.id<?>'], fuzzy?: boolean): boolean;
export function useIsFloroInvalid(query: PointerTypes['$(palette).colorPalettes.id<?>.colorShades'], fuzzy?: boolean): boolean;
export function useIsFloroInvalid(query: PointerTypes['$(palette).colorPalettes.id<?>'], fuzzy?: boolean): boolean;
export function useIsFloroInvalid(query: PointerTypes['$(palette).shades.id<?>'], fuzzy?: boolean): boolean;
export function useIsFloroInvalid(query: PointerTypes['$(palette).colorPalettes'], fuzzy?: boolean): boolean;
export function useIsFloroInvalid(query: PointerTypes['$(palette).shades'], fuzzy?: boolean): boolean;

export function useIsFloroInvalid(query: PartialDiffableQuery|DiffableQuery, fuzzy = true): boolean {
  const ctx = useFloroContext();
  const pluginName = useMemo(() => getPluginNameFromQuery(query), [query]);
  const invalidQueriesSet = useMemo(() => {
    if (!pluginName) {
      return new Set() as Set<PartialDiffableQuery | DiffableQuery>;
    }
    return (
      ctx.apiStoreInvaliditySets?.[pluginName] ??
      (new Set() as Set<PartialDiffableQuery | DiffableQuery>)
    );
  }, [ctx.apiStoreInvaliditySets, pluginName]);
  return useMemo(() => {
    if (fuzzy) {
      return containsDiffable(invalidQueriesSet, query, true);
    }
    return containsDiffable(invalidQueriesSet, query, false);
  }, [invalidQueriesSet, query, fuzzy])
};
export function useWasAdded(query: PointerTypes['$(palette).colorPalettes.id<?>.colorShades.id<?>'], fuzzy?: boolean): boolean;
export function useWasAdded(query: PointerTypes['$(palette).colorPalettes.id<?>.colorShades'], fuzzy?: boolean): boolean;
export function useWasAdded(query: PointerTypes['$(palette).colorPalettes.id<?>'], fuzzy?: boolean): boolean;
export function useWasAdded(query: PointerTypes['$(palette).shades.id<?>'], fuzzy?: boolean): boolean;
export function useWasAdded(query: PointerTypes['$(palette).colorPalettes'], fuzzy?: boolean): boolean;
export function useWasAdded(query: PointerTypes['$(palette).shades'], fuzzy?: boolean): boolean;

export function useWasAdded(query: PartialDiffableQuery|DiffableQuery, fuzzy = true): boolean {
  const ctx = useFloroContext();
  return useMemo(() => {
    if (ctx.commandMode != "compare" || ctx.compareFrom != "after") {
      return false;
    }
    if (fuzzy) {
      return containsDiffable(ctx.changeset, query, true);
    }
    return containsDiffable(ctx.changeset, query, false);
  }, [ctx.changeset, query, fuzzy, ctx.compareFrom, ctx.commandMode])
};
export function useWasRemoved(query: PointerTypes['$(palette).colorPalettes.id<?>.colorShades.id<?>'], fuzzy?: boolean): boolean;
export function useWasRemoved(query: PointerTypes['$(palette).colorPalettes.id<?>.colorShades'], fuzzy?: boolean): boolean;
export function useWasRemoved(query: PointerTypes['$(palette).colorPalettes.id<?>'], fuzzy?: boolean): boolean;
export function useWasRemoved(query: PointerTypes['$(palette).shades.id<?>'], fuzzy?: boolean): boolean;
export function useWasRemoved(query: PointerTypes['$(palette).colorPalettes'], fuzzy?: boolean): boolean;
export function useWasRemoved(query: PointerTypes['$(palette).shades'], fuzzy?: boolean): boolean;

export function useWasRemoved(query: PartialDiffableQuery|DiffableQuery, fuzzy = true): boolean {
  const ctx = useFloroContext();
  return useMemo(() => {
    if (ctx.commandMode != "compare" || ctx.compareFrom != "before") {
      return false;
    }
    if (fuzzy) {
      return containsDiffable(ctx.changeset, query, true);
    }
    return containsDiffable(ctx.changeset, query, false);
  }, [ctx.changeset, query, fuzzy, ctx.compareFrom, ctx.commandMode])
};
export function useHasConflict(query: PointerTypes['$(palette).colorPalettes.id<?>.colorShades.id<?>'], fuzzy?: boolean): boolean;
export function useHasConflict(query: PointerTypes['$(palette).colorPalettes.id<?>.colorShades'], fuzzy?: boolean): boolean;
export function useHasConflict(query: PointerTypes['$(palette).colorPalettes.id<?>'], fuzzy?: boolean): boolean;
export function useHasConflict(query: PointerTypes['$(palette).shades.id<?>'], fuzzy?: boolean): boolean;
export function useHasConflict(query: PointerTypes['$(palette).colorPalettes'], fuzzy?: boolean): boolean;
export function useHasConflict(query: PointerTypes['$(palette).shades'], fuzzy?: boolean): boolean;

export function useHasConflict(query: PartialDiffableQuery|DiffableQuery, fuzzy = true): boolean {
  const ctx = useFloroContext();
  return useMemo(() => {
    if (ctx.commandMode != "compare") {
      return false;
    }
    if (fuzzy) {
      return containsDiffable(ctx.conflictSet, query, true);
    }
    return containsDiffable(ctx.conflictSet, query, false);
  }, [ctx.conflictSet, query, fuzzy, ctx.commandMode])
};
export function useWasChanged(query: PointerTypes['$(palette).colorPalettes.id<?>.colorShades.id<?>'], fuzzy?: boolean): boolean;
export function useWasChanged(query: PointerTypes['$(palette).colorPalettes.id<?>.colorShades'], fuzzy?: boolean): boolean;
export function useWasChanged(query: PointerTypes['$(palette).colorPalettes.id<?>'], fuzzy?: boolean): boolean;
export function useWasChanged(query: PointerTypes['$(palette).shades.id<?>'], fuzzy?: boolean): boolean;
export function useWasChanged(query: PointerTypes['$(palette).colorPalettes'], fuzzy?: boolean): boolean;
export function useWasChanged(query: PointerTypes['$(palette).shades'], fuzzy?: boolean): boolean;

export function useWasChanged(query: PartialDiffableQuery|DiffableQuery, fuzzy = true): boolean {
  const ctx = useFloroContext();
  const wasAdded = useMemo(() => {
    if (ctx.commandMode != "compare" || ctx.compareFrom != "after") {
      return false;
    }
    if (fuzzy) {
      return containsDiffable(ctx.changeset, query, true);
    }
    return containsDiffable(ctx.changeset, query, false);
  }, [ctx.changeset, query, fuzzy, ctx.compareFrom, ctx.commandMode])

  const wasRemoved = useMemo(() => {
    if (ctx.commandMode != "compare" || ctx.compareFrom != "before") {
      return false;
    }
    if (fuzzy) {
      return containsDiffable(ctx.changeset, query, true);
    }
    return containsDiffable(ctx.changeset, query, false);
  }, [ctx.changeset, query, fuzzy, ctx.compareFrom, ctx.commandMode])
  return wasAdded || wasRemoved;
};
export function useHasIndication(query: PointerTypes['$(palette).colorPalettes.id<?>.colorShades.id<?>'], fuzzy?: boolean): boolean;
export function useHasIndication(query: PointerTypes['$(palette).colorPalettes.id<?>.colorShades'], fuzzy?: boolean): boolean;
export function useHasIndication(query: PointerTypes['$(palette).colorPalettes.id<?>'], fuzzy?: boolean): boolean;
export function useHasIndication(query: PointerTypes['$(palette).shades.id<?>'], fuzzy?: boolean): boolean;
export function useHasIndication(query: PointerTypes['$(palette).colorPalettes'], fuzzy?: boolean): boolean;
export function useHasIndication(query: PointerTypes['$(palette).shades'], fuzzy?: boolean): boolean;

export function useHasIndication(query: PartialDiffableQuery|DiffableQuery, fuzzy = true): boolean {
  const ctx = useFloroContext();

  const pluginName = useMemo(() => getPluginNameFromQuery(query), [query]);
  const invalidQueriesSet = useMemo(() => {
    if (!pluginName) {
      return new Set() as Set<PartialDiffableQuery | DiffableQuery>;
    }
    return (
      ctx.apiStoreInvaliditySets?.[pluginName] ??
      (new Set() as Set<PartialDiffableQuery | DiffableQuery>)
    );
  }, [ctx.apiStoreInvaliditySets, pluginName]);
  const isInvalid = useMemo(() => {
    if (fuzzy) {
      return containsDiffable(invalidQueriesSet, query, true);
    }
    return containsDiffable(invalidQueriesSet, query, false);
  }, [invalidQueriesSet, query, fuzzy])

  const wasAdded = useMemo(() => {
    if (ctx.commandMode != "compare" || ctx.compareFrom != "after") {
      return false;
    }
    if (fuzzy) {
      return containsDiffable(ctx.changeset, query, true);
    }
    return containsDiffable(ctx.changeset, query, false);
  }, [ctx.changeset, query, fuzzy, ctx.compareFrom, ctx.commandMode])

  const wasRemoved = useMemo(() => {
    if (ctx.commandMode != "compare" || ctx.compareFrom != "before") {
      return false;
    }
    if (fuzzy) {
      return containsDiffable(ctx.changeset, query, true);
    }
    return containsDiffable(ctx.changeset, query, false);
  }, [ctx.changeset, query, fuzzy, ctx.compareFrom, ctx.commandMode])

  const hasConflict = useMemo(() => {
    if (ctx.commandMode != "compare") {
      return false;
    }
    if (fuzzy) {
      return containsDiffable(ctx.conflictSet, query, true);
    }
    return containsDiffable(ctx.conflictSet, query, false);
  }, [ctx.conflictSet, query, fuzzy, ctx.commandMode])
  return isInvalid || wasAdded || wasRemoved || hasConflict;
};

type MimeTypes =
  | "audio/aac"
  | "application/x-abiword"
  | "application/x-freearc"
  | "video/x-msvideo"
  | "application/vnd.amazon.ebook"
  | "application/octet-stream"
  | "image/bmp"
  | "application/x-bzip"
  | "application/x-bzip2"
  | "application/x-csh"
  | "text/css"
  | "text/csv"
  | "application/msword"
  | "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
  | "application/vnd.ms-fontobject"
  | "application/epub+zip"
  | "application/gzip"
  | "image/gif"
  | "text/html"
  | "image/vnd.microsoft.icon"
  | "text/calendar"
  | "application/java-archive"
  | "text/javascript"
  | "application/json"
  | "application/ld+json"
  | "text/javascript"
  | "audio/mpeg"
  | "video/mpeg"
  | "application/vnd.apple.installer+xml"
  | "application/vnd.oasis.opendocument.presentation"
  | "application/vnd.oasis.opendocument.spreadsheet"
  | "application/vnd.oasis.opendocument.text"
  | "audio/ogg"
  | "video/ogg"
  | "application/ogg"
  | "audio/opus"
  | "font/otf"
  | "image/png"
  | "application/pdf"
  | "application/php"
  | "application/vnd.ms-powerpoint"
  | "application/vnd.openxmlformats-officedocument.presentationml.presentation"
  | "application/vnd.rar"
  | "application/rtf"
  | "application/x-sh"
  | "image/svg+xml"
  | "application/x-shockwave-flash"
  | "application/x-tar"
  | "image/tiff"
  | "image/tiff"
  | "video/mp2t"
  | "font/ttf"
  | "text/plain"
  | "application/vnd.visio"
  | "audio/wav"
  | "audio/webm"
  | "video/webm"
  | "image/webp"
  | "font/woff"
  | "font/woff2"
  | "application/xhtml+xml"
  | "application/vnd.ms-excel"
  | "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
  | "application/vnd.mozilla.xul+xml"
  | "application/zip"
  | "video/3gpp"
  | "video/3gpp2"
  | "application/x-7z-compressed"
  | ".jpg"
  | ".midi"
  | "XML";

const mimeMap: { [Property in MimeTypes]: `.${string}` } = {
  "audio/aac": ".aac",
  "application/x-abiword": ".abw",
  "application/x-freearc": ".arc",
  "video/x-msvideo": ".avi",
  "application/vnd.amazon.ebook": ".azw",
  "application/octet-stream": ".bin",
  "image/bmp": ".bmp",
  "application/x-bzip": ".bz",
  "application/x-bzip2": ".bz2",
  "application/x-csh": ".csh",
  "text/css": ".css",
  "text/csv": ".csv",
  "application/msword": ".doc",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document": ".docx",
  "application/vnd.ms-fontobject": ".eot",
  "application/epub+zip": ".epub",
  "application/gzip": ".gz",
  "image/gif": ".gif",
  "text/html": ".html",
  "image/vnd.microsoft.icon": ".ico",
  "text/calendar": ".ics",
  "application/java-archive": ".jar",
  ".jpg": ".jpeg",
  "XML": ".xml",
  "text/javascript": ".mjs",
  "application/json": ".json",
  "application/ld+json": ".jsonld",
  ".midi": ".mid",
  "audio/mpeg": ".mp3",
  "video/mpeg": ".mpeg",
  "application/vnd.apple.installer+xml": ".mpkg",
  "application/vnd.oasis.opendocument.presentation": ".odp",
  "application/vnd.oasis.opendocument.spreadsheet": ".ods",
  "application/vnd.oasis.opendocument.text": ".odt",
  "audio/ogg": ".oga",
  "video/ogg": ".ogv",
  "application/ogg": ".ogx",
  "audio/opus": ".opus",
  "font/otf": ".otf",
  "image/png": ".png",
  "application/pdf": ".pdf",
  "application/php": ".php",
  "application/vnd.ms-powerpoint": ".ppt",
  "application/vnd.openxmlformats-officedocument.presentationml.presentation": ".pptx",
  "application/vnd.rar": ".rar",
  "application/rtf": ".rtf",
  "application/x-sh": ".sh",
  "image/svg+xml": ".svg",
  "application/x-shockwave-flash": ".swf",
  "application/x-tar": ".tar",
  "image/tiff": ".tiff",
  "video/mp2t": ".ts",
  "font/ttf": ".ttf",
  "text/plain": ".txt",
  "application/vnd.visio": ".vsd",
  "audio/wav": ".wav",
  "audio/webm": ".weba",
  "video/webm": ".webm",
  "image/webp": ".webp",
  "font/woff": ".woff",
  "font/woff2": ".woff2",
  "application/xhtml+xml": ".xhtml",
  "application/vnd.ms-excel": ".xls",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet": ".xlsx",
  "application/vnd.mozilla.xul+xml": ".xul",
  "application/zip": ".zip",
  "video/3gpp": ".3gp",
  "video/3gpp2": ".3g2",
  "application/x-7z-compressed": ".7z",
};

const startUploadBlob = (
  data: BlobPart[],
  type: MimeTypes,
  url: string,
  progressCallback: (loaded: number, total: number) => void
) => {
  const blob = new Blob(data, { type });
  const ext = mimeMap[type];
  const fileName = `upload.${ext}`;

  const formData = new FormData();
  formData.append("file", blob, fileName);
  return upload(formData, url, progressCallback);
};

const startUploadFile = (
  file: File,
  url: string,
  progressCallback: (loaded: number, total: number) => void
) => {
  const formData = new FormData();
  formData.append("file", file);
  return upload(formData, url, progressCallback);
};

const upload = (
  formData: FormData,
  url: string,
  progressCallback: (loaded: number, total: number) => void
) => {
  const xhr = new XMLHttpRequest();
  let promise: Promise<FileRef> | null = new Promise<FileRef>(
    (resolve, reject) => {
      xhr.responseType = "json";
      xhr.open("POST", url);
      xhr.onprogress = function (e) {
        progressCallback(e.loaded, e.total);
      };
      xhr.onerror = function (e) {
        reject(e);
      };
      xhr.onreadystatechange = function (e) {
        if (xhr.readyState === XMLHttpRequest.DONE) {
          const status = xhr.status;
          if (status === 0 || (status >= 200 && status < 400)) {
            resolve(xhr.response["fileRef"]);
          } else {
            reject(e);
          }
        }
      };
      xhr.send(formData);
    }
  );

  return {
    promise,
    abort: () => {
      xhr.abort();
      promise = null;
    },
  };
};

export const useUploadFile = () => {
  const { pluginState } = useFloroContext();
  const [status, setStatus] =
    useState<"none" | "in_progress" | "success" | "error">("none");
  const [progress, setProgress] = useState<number>(0);
  const [fileRef, setFileRef] = useState<FileRef | null>(null);
  const [uploadObject, setUploadObject] =
    useState<null | { promise: Promise<FileRef> | null; abort: () => void }>(
      null
    );

  const reset = useCallback(() => {
    setStatus("none");
    setProgress(0);
    setFileRef(null);
    setUploadObject(null)
  }, []);

  const isLoading = useMemo(() => status == "in_progress", [status]);

  const onProgress = useCallback((loaded: number, total: number) => {
    setProgress(loaded / total);
  }, []);

  const uploadFile = useCallback(
    (file: File) => {
      if (status == "in_progress") {
        return;
      }
      if (!pluginState.binaryUrls.upload) {
        return;
      }
      setStatus("in_progress");
      setProgress(0);
      setUploadObject(
        startUploadFile(file, pluginState.binaryUrls.upload, onProgress)
      );
    },
    [status, pluginState.binaryUrls.upload, onProgress]
  );

  const uploadBlob = useCallback(
    (data: BlobPart[], type: MimeTypes) => {
      if (status == "in_progress") {
        return;
      }
      if (!pluginState.binaryUrls.upload) {
        return;
      }
      setUploadObject(
        startUploadBlob(data, type, pluginState.binaryUrls.upload, onProgress)
      );
      setStatus("in_progress");
      setProgress(0);
    },
    [status, pluginState.binaryUrls.upload, onProgress]
  );

  useEffect(() => {
    if (!uploadObject) {
      return;
    }
    let aborted = false;
    uploadObject.promise
      ?.then((fileRef) => {
        if (!aborted) {
          setStatus("success");
          setProgress(1);
          setFileRef(fileRef);
        }
      })
      .catch((e) => {
        if (!aborted) {
          setStatus("error");
          setProgress(0);
        }
      });
    return () => {
      uploadObject.abort();
      aborted = true;
    };
  }, [uploadObject]);

  return {
    uploadBlob,
    uploadFile,
    reset,
    status,
    progress,
    fileRef,
    isLoading,
  };
};

export const useBinaryRef = (fileRef?: FileRef|null) => {
    const { pluginState } = useFloroContext();
    if (!fileRef) {
        return null;
    }
    if (!pluginState.binaryUrls.download) {
        return null;
    }
    return `${pluginState.binaryUrls.download}/${fileRef}`;
}

interface BinaryReturn {
  "arraybuffer": ArrayBuffer,
  "blob": Blob,
  "document": Document|XMLDocument,
  "json": object,
  "text": string,
};

const download = (
  url: string,
  responseType: keyof BinaryReturn
) => {
  const xhr = new XMLHttpRequest();
  let promise: Promise<FileRef> | null = new Promise<FileRef>(
    (resolve, reject) => {
      xhr.responseType = responseType;
      xhr.open("GET", url);
      xhr.onerror = function (e) {
        reject(e);
      };
      xhr.onreadystatechange = function (e) {
        if (xhr.readyState === XMLHttpRequest.DONE) {
          const status = xhr.status;
          if (status === 0 || (status >= 200 && status < 400)) {
            resolve(xhr.response);
          } else {
            reject(e);
          }
        }
      };
      xhr.send();
    }
  );

  return {
    promise,
    abort: () => {
      xhr.abort();
      promise = null;
    },
  };
};

export const useBinaryData = <K extends keyof BinaryReturn>(
  fileRef: FileRef | null,
  responseType: K
) => {
  const binRef = useBinaryRef(fileRef);
  const [data, setData] = useState<BinaryReturn[K] | null>(null);
  const [status, setStatus] =
    useState<"none" | "in_progress" | "success" | "error">("none");
  const isLoading = useMemo(() => status == "in_progress", [status]);

  useEffect(() => {
    if (binRef) {
      setStatus("none");
    }
  }, [binRef]);

  useEffect(() => {
    if (status != "none") {
      return;
    }
    if (!binRef) {
      return;
    }
    let aborted = false;
    const downloadObject = download(binRef, responseType);
    downloadObject.promise
      .then((result: unknown) => {
        if (!aborted) {
          setData(result as BinaryReturn[K]);
          setStatus("success");
        }
      })
      .catch(() => {
        if (!aborted) {
          setStatus("error");
        }
      });
    return () => {
      aborted = true;
      downloadObject?.abort();
    };
  }, [status, binRef, responseType]);

  return { isLoading, status, data };
};
