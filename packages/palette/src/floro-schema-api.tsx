import React, { useEffect, createContext, useMemo, useCallback, useState, useContext, useRef } from 'react';

export type FileRef = `${string}.${string}`;

export type PartialDiffableQuery = `$(palette).colors`|`$(palette).colors.id<${string}>`|`$(palette).palette`|`$(palette).palette.id<${QueryTypes['$(palette).colors.id<?>']|QueryTypes['$(palette).shades.id<?>']}>`|`$(palette).palette.id<${QueryTypes['$(palette).colors.id<?>']|QueryTypes['$(palette).shades.id<?>']}>.colors`|`$(palette).palette.id<${QueryTypes['$(palette).colors.id<?>']|QueryTypes['$(palette).shades.id<?>']}>.colors.id<${QueryTypes['$(palette).colors.id<?>']|QueryTypes['$(palette).shades.id<?>']}>`|`$(palette).shades`|`$(palette).shades.id<${string}>`;

export type DiffableQuery = `$(palette).colors.id<${string}>`|`$(palette).palette.id<${QueryTypes['$(palette).colors.id<?>']|QueryTypes['$(palette).shades.id<?>']}>`|`$(palette).palette.id<${QueryTypes['$(palette).colors.id<?>']|QueryTypes['$(palette).shades.id<?>']}>.colors.id<${QueryTypes['$(palette).colors.id<?>']|QueryTypes['$(palette).shades.id<?>']}>`|`$(palette).shades.id<${string}>`;

export type QueryTypes = {
  ['$(palette).colors.id<?>']: `$(palette).colors.id<${string}>`;
  ['$(palette).palette.id<?>']: `$(palette).palette.id<${QueryTypes['$(palette).colors.id<?>']|QueryTypes['$(palette).shades.id<?>']}>`;
  ['$(palette).palette.id<?>.colors.id<?>']: `$(palette).palette.id<${QueryTypes['$(palette).colors.id<?>']|QueryTypes['$(palette).shades.id<?>']}>.colors.id<${QueryTypes['$(palette).colors.id<?>']|QueryTypes['$(palette).shades.id<?>']}>`;
  ['$(palette).shades.id<?>']: `$(palette).shades.id<${string}>`;
};

export function makeQueryRef(query: '$(palette).colors.id<?>', arg0: string): QueryTypes['$(palette).colors.id<?>'];
export function makeQueryRef(query: '$(palette).palette.id<?>', arg0: QueryTypes['$(palette).colors.id<?>']|QueryTypes['$(palette).shades.id<?>']): QueryTypes['$(palette).palette.id<?>'];
export function makeQueryRef(query: '$(palette).palette.id<?>.colors.id<?>', arg0: QueryTypes['$(palette).colors.id<?>']|QueryTypes['$(palette).shades.id<?>'], arg1: QueryTypes['$(palette).colors.id<?>']|QueryTypes['$(palette).shades.id<?>']): QueryTypes['$(palette).palette.id<?>.colors.id<?>'];
export function makeQueryRef(query: '$(palette).shades.id<?>', arg0: string): QueryTypes['$(palette).shades.id<?>'];
export function makeQueryRef(query: '$(palette).colors.id<?>'|'$(palette).palette.id<?>'|'$(palette).palette.id<?>.colors.id<?>'|'$(palette).shades.id<?>', arg0: string|QueryTypes['$(palette).colors.id<?>']|QueryTypes['$(palette).shades.id<?>'], arg1?: QueryTypes['$(palette).colors.id<?>']|QueryTypes['$(palette).shades.id<?>']): QueryTypes['$(palette).colors.id<?>']|QueryTypes['$(palette).palette.id<?>']|QueryTypes['$(palette).palette.id<?>.colors.id<?>']|QueryTypes['$(palette).shades.id<?>']|null {
  if ((arg0 != null && arg0 != undefined) && query == '$(palette).colors.id<?>') {
    return `$(palette).colors.id<${arg0 as string}>`;
  }
  if ((arg0 != null && arg0 != undefined) && query == '$(palette).palette.id<?>') {
    return `$(palette).palette.id<${arg0 as QueryTypes['$(palette).colors.id<?>']|QueryTypes['$(palette).shades.id<?>']}>`;
  }
  if ((arg0 != null && arg0 != undefined) && (arg1 != null && arg1 != undefined) && query == '$(palette).palette.id<?>.colors.id<?>') {
    return `$(palette).palette.id<${arg0 as QueryTypes['$(palette).colors.id<?>']|QueryTypes['$(palette).shades.id<?>']}>.colors.id<${arg1 as QueryTypes['$(palette).colors.id<?>']|QueryTypes['$(palette).shades.id<?>']}>`;
  }
  if ((arg0 != null && arg0 != undefined) && query == '$(palette).shades.id<?>') {
    return `$(palette).shades.id<${arg0 as string}>`;
  }
  return null;
};

export function useQueryRef(query: '$(palette).colors.id<?>', arg0: string): QueryTypes['$(palette).colors.id<?>'];
export function useQueryRef(query: '$(palette).palette.id<?>', arg0: QueryTypes['$(palette).colors.id<?>']|QueryTypes['$(palette).shades.id<?>']): QueryTypes['$(palette).palette.id<?>'];
export function useQueryRef(query: '$(palette).palette.id<?>.colors.id<?>', arg0: QueryTypes['$(palette).colors.id<?>']|QueryTypes['$(palette).shades.id<?>'], arg1: QueryTypes['$(palette).colors.id<?>']|QueryTypes['$(palette).shades.id<?>']): QueryTypes['$(palette).palette.id<?>.colors.id<?>'];
export function useQueryRef(query: '$(palette).shades.id<?>', arg0: string): QueryTypes['$(palette).shades.id<?>'];
export function useQueryRef(query: '$(palette).colors.id<?>'|'$(palette).palette.id<?>'|'$(palette).palette.id<?>.colors.id<?>'|'$(palette).shades.id<?>', arg0: string|QueryTypes['$(palette).colors.id<?>']|QueryTypes['$(palette).shades.id<?>'], arg1?: QueryTypes['$(palette).colors.id<?>']|QueryTypes['$(palette).shades.id<?>']): QueryTypes['$(palette).colors.id<?>']|QueryTypes['$(palette).palette.id<?>']|QueryTypes['$(palette).palette.id<?>.colors.id<?>']|QueryTypes['$(palette).shades.id<?>']|null {
  return useMemo(() => {
    if (query == '$(palette).colors.id<?>') {
      return makeQueryRef(query, arg0 as string);
    }
    if (query == '$(palette).palette.id<?>') {
      return makeQueryRef(query, arg0 as QueryTypes['$(palette).colors.id<?>']|QueryTypes['$(palette).shades.id<?>']);
    }
    if (query == '$(palette).palette.id<?>.colors.id<?>') {
      return makeQueryRef(query, arg0 as QueryTypes['$(palette).colors.id<?>']|QueryTypes['$(palette).shades.id<?>'], arg1 as QueryTypes['$(palette).colors.id<?>']|QueryTypes['$(palette).shades.id<?>']);
    }
    if (query == '$(palette).shades.id<?>') {
      return makeQueryRef(query, arg0 as string);
    }
    return null;
  }, [query, arg0, arg1]);
};

export type SchemaTypes = {
  ['$(palette).colors']: Array<{
    ['id']: string;
    ['name']: string;
  }>;
  ['$(palette).colors.id<?>']: {
    ['id']: string;
    ['name']: string;
  };
  ['$(palette).palette']: Array<{
    ['colors']: Array<{
      ['alpha']?: number;
      ['hexcode']?: string;
      ['id']: QueryTypes['$(palette).colors.id<?>']|QueryTypes['$(palette).shades.id<?>'];
    }>;
    ['id']: QueryTypes['$(palette).colors.id<?>']|QueryTypes['$(palette).shades.id<?>'];
  }>;
  ['$(palette).palette.id<?>']: {
    ['colors']: Array<{
      ['alpha']?: number;
      ['hexcode']?: string;
      ['id']: QueryTypes['$(palette).colors.id<?>']|QueryTypes['$(palette).shades.id<?>'];
    }>;
    ['id']: QueryTypes['$(palette).colors.id<?>']|QueryTypes['$(palette).shades.id<?>'];
  };
  ['$(palette).palette.id<?>.colors']: Array<{
    ['alpha']?: number;
    ['hexcode']?: string;
    ['id']: QueryTypes['$(palette).colors.id<?>']|QueryTypes['$(palette).shades.id<?>'];
  }>;
  ['$(palette).palette.id<?>.colors.id<?>']: {
    ['alpha']?: number;
    ['hexcode']?: string;
    ['id']: QueryTypes['$(palette).colors.id<?>']|QueryTypes['$(palette).shades.id<?>'];
  };
  ['$(palette).shades']: Array<{
    ['id']: string;
    ['name']: string;
  }>;
  ['$(palette).shades.id<?>']: {
    ['id']: string;
    ['name']: string;
  };
};


export type DiffableReturnTypes = SchemaTypes['$(palette).colors']|SchemaTypes['$(palette).colors.id<?>']|SchemaTypes['$(palette).palette']|SchemaTypes['$(palette).palette.id<?>']|SchemaTypes['$(palette).palette.id<?>.colors']|SchemaTypes['$(palette).palette.id<?>.colors.id<?>']|SchemaTypes['$(palette).shades']|SchemaTypes['$(palette).shades.id<?>'];

export type PointerTypes = {
  ['$(palette).colors']: `$(palette).colors`;
  ['$(palette).colors.id<?>']: `$(palette).colors.id<${string}>`;
  ['$(palette).palette']: `$(palette).palette`;
  ['$(palette).palette.id<?>']: `$(palette).palette.id<${QueryTypes['$(palette).colors.id<?>']|QueryTypes['$(palette).shades.id<?>']}>`;
  ['$(palette).palette.id<?>.colors']: `$(palette).palette.id<${QueryTypes['$(palette).colors.id<?>']|QueryTypes['$(palette).shades.id<?>']}>.colors`;
  ['$(palette).palette.id<?>.colors.id<?>']: `$(palette).palette.id<${QueryTypes['$(palette).colors.id<?>']|QueryTypes['$(palette).shades.id<?>']}>.colors.id<${QueryTypes['$(palette).colors.id<?>']|QueryTypes['$(palette).shades.id<?>']}>`;
  ['$(palette).shades']: `$(palette).shades`;
  ['$(palette).shades.id<?>']: `$(palette).shades.id<${string}>`;
};


export type SchemaRoot = {
  ['palette']: {
    ['colors']: Array<{
      ['id']: string;
      ['name']: string;
    }>;
    ['palette']: Array<{
      ['colors']: Array<{
        ['alpha']?: number;
        ['hexcode']?: string;
        ['id']: QueryTypes['$(palette).colors.id<?>']|QueryTypes['$(palette).shades.id<?>'];
      }>;
      ['id']: QueryTypes['$(palette).colors.id<?>']|QueryTypes['$(palette).shades.id<?>'];
    }>;
    ['shades']: Array<{
      ['id']: string;
      ['name']: string;
    }>;
  };
};


export type RefReturnTypes = {
  ['$(palette).colors.id<?>']: {
    ['id']: string;
    ['name']: string;
  };
  ['$(palette).palette.id<?>']: {
    ['colors']: Array<{
      ['alpha']?: number;
      ['hexcode']?: string;
      ['id']: QueryTypes['$(palette).colors.id<?>']|QueryTypes['$(palette).shades.id<?>'];
    }>;
    ['id']: QueryTypes['$(palette).colors.id<?>']|QueryTypes['$(palette).shades.id<?>'];
  };
  ['$(palette).palette.id<?>.colors.id<?>']: {
    ['alpha']?: number;
    ['hexcode']?: string;
    ['id']: QueryTypes['$(palette).colors.id<?>']|QueryTypes['$(palette).shades.id<?>'];
  };
  ['$(palette).shades.id<?>']: {
    ['id']: string;
    ['name']: string;
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
  changeset: Array<string>;
}

interface IFloroContext {
  commandMode: "view" | "edit" | "compare";
  compareFrom: "none" | "before" | "after";
  applicationState: SchemaRoot | null;
  changeset: Set<string>;
  apiStoreInvalidity: {[key: string]: Array<string>};
  apiStoreInvaliditySets: {[key: string]: Set<string>};
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
  hasLoaded: false,
  saveState: (_state: null) => null,
  setPluginState: (_state: PluginState) => {},
  pluginState: {
    commandMode: "view",
    compareFrom: "none",
    applicationState: null,
    apiStoreInvalidity: {},
    changeset: [],
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
    changeset: [],
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



export function getReferencedObject(root: SchemaRoot, query: QueryTypes['$(palette).colors.id<?>']): RefReturnTypes['$(palette).colors.id<?>'];
export function getReferencedObject(root: SchemaRoot, query: QueryTypes['$(palette).palette.id<?>']): RefReturnTypes['$(palette).palette.id<?>'];
export function getReferencedObject(root: SchemaRoot, query: QueryTypes['$(palette).palette.id<?>.colors.id<?>']): RefReturnTypes['$(palette).palette.id<?>.colors.id<?>'];
export function getReferencedObject(root: SchemaRoot, query: QueryTypes['$(palette).shades.id<?>']): RefReturnTypes['$(palette).shades.id<?>'];
export function getReferencedObject(root: SchemaRoot, query: QueryTypes['$(palette).colors.id<?>']|QueryTypes['$(palette).palette.id<?>']|QueryTypes['$(palette).palette.id<?>.colors.id<?>']|QueryTypes['$(palette).shades.id<?>']): RefReturnTypes['$(palette).colors.id<?>']|RefReturnTypes['$(palette).palette.id<?>']|RefReturnTypes['$(palette).palette.id<?>.colors.id<?>']|RefReturnTypes['$(palette).shades.id<?>']|null {
  if (root && query && replaceRefVarsWithWildcards(query) == '$(palette).colors.id<?>') {
    return getObjectInStateMap(root, query) as RefReturnTypes['$(palette).colors.id<?>'];
  }
  if (root && query && replaceRefVarsWithWildcards(query) == '$(palette).palette.id<?>') {
    return getObjectInStateMap(root, query) as RefReturnTypes['$(palette).palette.id<?>'];
  }
  if (root && query && replaceRefVarsWithWildcards(query) == '$(palette).palette.id<?>.colors.id<?>') {
    return getObjectInStateMap(root, query) as RefReturnTypes['$(palette).palette.id<?>.colors.id<?>'];
  }
  if (root && query && replaceRefVarsWithWildcards(query) == '$(palette).shades.id<?>') {
    return getObjectInStateMap(root, query) as RefReturnTypes['$(palette).shades.id<?>'];
  }
  return null;
}
export function useReferencedObject(query: QueryTypes['$(palette).colors.id<?>']): RefReturnTypes['$(palette).colors.id<?>'];
export function useReferencedObject(query: QueryTypes['$(palette).palette.id<?>']): RefReturnTypes['$(palette).palette.id<?>'];
export function useReferencedObject(query: QueryTypes['$(palette).palette.id<?>.colors.id<?>']): RefReturnTypes['$(palette).palette.id<?>.colors.id<?>'];
export function useReferencedObject(query: QueryTypes['$(palette).shades.id<?>']): RefReturnTypes['$(palette).shades.id<?>'];
export function useReferencedObject(query: QueryTypes['$(palette).colors.id<?>']|QueryTypes['$(palette).palette.id<?>']|QueryTypes['$(palette).palette.id<?>.colors.id<?>']|QueryTypes['$(palette).shades.id<?>']): RefReturnTypes['$(palette).colors.id<?>']|RefReturnTypes['$(palette).palette.id<?>']|RefReturnTypes['$(palette).palette.id<?>.colors.id<?>']|RefReturnTypes['$(palette).shades.id<?>']|null {
  const ctx = useFloroContext();
  const root = ctx.applicationState;
  return useMemo(() => {
    if (root && query && replaceRefVarsWithWildcards(query) == '$(palette).colors.id<?>') {
      return getObjectInStateMap(root, query) as RefReturnTypes['$(palette).colors.id<?>'];
    }
    if (root && query && replaceRefVarsWithWildcards(query) == '$(palette).palette.id<?>') {
      return getObjectInStateMap(root, query) as RefReturnTypes['$(palette).palette.id<?>'];
    }
    if (root && query && replaceRefVarsWithWildcards(query) == '$(palette).palette.id<?>.colors.id<?>') {
      return getObjectInStateMap(root, query) as RefReturnTypes['$(palette).palette.id<?>.colors.id<?>'];
    }
    if (root && query && replaceRefVarsWithWildcards(query) == '$(palette).shades.id<?>') {
      return getObjectInStateMap(root, query) as RefReturnTypes['$(palette).shades.id<?>'];
    }
    return null;
  }, [root, query]);
}
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
export function useFloroState(query: PointerTypes['$(palette).colors'], defaultData?: SchemaTypes['$(palette).colors'], mutateStoreWithDefault?: boolean): [SchemaTypes['$(palette).colors']|null, (t: SchemaTypes['$(palette).colors'], doSave?: boolean) => void, boolean, () => void];
export function useFloroState(query: PointerTypes['$(palette).colors.id<?>'], defaultData?: SchemaTypes['$(palette).colors.id<?>'], mutateStoreWithDefault?: boolean): [SchemaTypes['$(palette).colors.id<?>']|null, (t: SchemaTypes['$(palette).colors.id<?>'], doSave?: boolean) => void, boolean, () => void];
export function useFloroState(query: PointerTypes['$(palette).palette'], defaultData?: SchemaTypes['$(palette).palette'], mutateStoreWithDefault?: boolean): [SchemaTypes['$(palette).palette']|null, (t: SchemaTypes['$(palette).palette'], doSave?: boolean) => void, boolean, () => void];
export function useFloroState(query: PointerTypes['$(palette).palette.id<?>'], defaultData?: SchemaTypes['$(palette).palette.id<?>'], mutateStoreWithDefault?: boolean): [SchemaTypes['$(palette).palette.id<?>']|null, (t: SchemaTypes['$(palette).palette.id<?>'], doSave?: boolean) => void, boolean, () => void];
export function useFloroState(query: PointerTypes['$(palette).palette.id<?>.colors'], defaultData?: SchemaTypes['$(palette).palette.id<?>.colors'], mutateStoreWithDefault?: boolean): [SchemaTypes['$(palette).palette.id<?>.colors']|null, (t: SchemaTypes['$(palette).palette.id<?>.colors'], doSave?: boolean) => void, boolean, () => void];
export function useFloroState(query: PointerTypes['$(palette).palette.id<?>.colors.id<?>'], defaultData?: SchemaTypes['$(palette).palette.id<?>.colors.id<?>'], mutateStoreWithDefault?: boolean): [SchemaTypes['$(palette).palette.id<?>.colors.id<?>']|null, (t: SchemaTypes['$(palette).palette.id<?>.colors.id<?>'], doSave?: boolean) => void, boolean, () => void];
export function useFloroState(query: PointerTypes['$(palette).shades'], defaultData?: SchemaTypes['$(palette).shades'], mutateStoreWithDefault?: boolean): [SchemaTypes['$(palette).shades']|null, (t: SchemaTypes['$(palette).shades'], doSave?: boolean) => void, boolean, () => void];
export function useFloroState(query: PointerTypes['$(palette).shades.id<?>'], defaultData?: SchemaTypes['$(palette).shades.id<?>'], mutateStoreWithDefault?: boolean): [SchemaTypes['$(palette).shades.id<?>']|null, (t: SchemaTypes['$(palette).shades.id<?>'], doSave?: boolean) => void, boolean, () => void];

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
export function useIsFloroInvalid(query: PointerTypes['$(palette).colors'], fuzzy?: boolean): boolean;
export function useIsFloroInvalid(query: PointerTypes['$(palette).colors.id<?>'], fuzzy?: boolean): boolean;
export function useIsFloroInvalid(query: PointerTypes['$(palette).palette'], fuzzy?: boolean): boolean;
export function useIsFloroInvalid(query: PointerTypes['$(palette).palette.id<?>'], fuzzy?: boolean): boolean;
export function useIsFloroInvalid(query: PointerTypes['$(palette).palette.id<?>.colors'], fuzzy?: boolean): boolean;
export function useIsFloroInvalid(query: PointerTypes['$(palette).palette.id<?>.colors.id<?>'], fuzzy?: boolean): boolean;
export function useIsFloroInvalid(query: PointerTypes['$(palette).shades'], fuzzy?: boolean): boolean;
export function useIsFloroInvalid(query: PointerTypes['$(palette).shades.id<?>'], fuzzy?: boolean): boolean;

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
export function useWasAdded(query: PointerTypes['$(palette).colors'], fuzzy?: boolean): boolean;
export function useWasAdded(query: PointerTypes['$(palette).colors.id<?>'], fuzzy?: boolean): boolean;
export function useWasAdded(query: PointerTypes['$(palette).palette'], fuzzy?: boolean): boolean;
export function useWasAdded(query: PointerTypes['$(palette).palette.id<?>'], fuzzy?: boolean): boolean;
export function useWasAdded(query: PointerTypes['$(palette).palette.id<?>.colors'], fuzzy?: boolean): boolean;
export function useWasAdded(query: PointerTypes['$(palette).palette.id<?>.colors.id<?>'], fuzzy?: boolean): boolean;
export function useWasAdded(query: PointerTypes['$(palette).shades'], fuzzy?: boolean): boolean;
export function useWasAdded(query: PointerTypes['$(palette).shades.id<?>'], fuzzy?: boolean): boolean;

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
export function useWasRemoved(query: PointerTypes['$(palette).colors'], fuzzy?: boolean): boolean;
export function useWasRemoved(query: PointerTypes['$(palette).colors.id<?>'], fuzzy?: boolean): boolean;
export function useWasRemoved(query: PointerTypes['$(palette).palette'], fuzzy?: boolean): boolean;
export function useWasRemoved(query: PointerTypes['$(palette).palette.id<?>'], fuzzy?: boolean): boolean;
export function useWasRemoved(query: PointerTypes['$(palette).palette.id<?>.colors'], fuzzy?: boolean): boolean;
export function useWasRemoved(query: PointerTypes['$(palette).palette.id<?>.colors.id<?>'], fuzzy?: boolean): boolean;
export function useWasRemoved(query: PointerTypes['$(palette).shades'], fuzzy?: boolean): boolean;
export function useWasRemoved(query: PointerTypes['$(palette).shades.id<?>'], fuzzy?: boolean): boolean;

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
