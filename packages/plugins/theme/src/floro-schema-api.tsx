import React, { useEffect, createContext, useMemo, useCallback, useState, useContext, useRef } from 'react';

export type FileRef = `${string}.${string}`;

export type PartialDiffableQuery = `$(theme).themeColors.id<${string}>.variants.id<${QueryTypes['$(theme).stateVariants.id<?>']}>.variantDefinitions.id<${QueryTypes['$(theme).themes.id<?>']}>`|`$(theme).themeColors.id<${string}>.variants.id<${QueryTypes['$(theme).stateVariants.id<?>']}>.variantDefinitions`|`$(palette).colorPalettes.id<${string}>.colorShades.id<${QueryTypes['$(palette).shades.id<?>']}>`|`$(theme).themeColors.id<${string}>.themeDefinitions.id<${QueryTypes['$(theme).themes.id<?>']}>`|`$(theme).themeColors.id<${string}>.variants.id<${QueryTypes['$(theme).stateVariants.id<?>']}>`|`$(palette).colorPalettes.id<${string}>.colorShades`|`$(theme).themeColors.id<${string}>.themeDefinitions`|`$(theme).themeColors.id<${string}>.variants`|`$(theme).themes.id<${string}>.backgroundColor`|`$(palette).colorPalettes.id<${string}>`|`$(palette).shades.id<${string}>`|`$(theme).stateVariants.id<${string}>`|`$(theme).themeColors.id<${string}>`|`$(theme).themes.id<${string}>`|`$(palette).colorPalettes`|`$(palette).shades`|`$(theme).stateVariants`|`$(theme).themeColors`|`$(theme).themes`;

export type DiffableQuery = `$(theme).themeColors.id<${string}>.variants.id<${QueryTypes['$(theme).stateVariants.id<?>']}>.variantDefinitions.id<${QueryTypes['$(theme).themes.id<?>']}>`|`$(palette).colorPalettes.id<${string}>.colorShades.id<${QueryTypes['$(palette).shades.id<?>']}>`|`$(theme).themeColors.id<${string}>.themeDefinitions.id<${QueryTypes['$(theme).themes.id<?>']}>`|`$(theme).themeColors.id<${string}>.variants.id<${QueryTypes['$(theme).stateVariants.id<?>']}>`|`$(theme).themes.id<${string}>.backgroundColor`|`$(palette).colorPalettes.id<${string}>`|`$(palette).shades.id<${string}>`|`$(theme).stateVariants.id<${string}>`|`$(theme).themeColors.id<${string}>`|`$(theme).themes.id<${string}>`;

export type SchemaTypes = {
  ['$(theme).themeColors.id<?>.variants.id<?>.variantDefinitions.id<?>']: {
    ['id']: QueryTypes['$(theme).themes.id<?>'];
    ['paletteColorShade']?: QueryTypes['$(palette).colorPalettes.id<?>.colorShades.id<?>'];
  };
  ['$(theme).themeColors.id<?>.variants.id<?>.variantDefinitions']: Array<{
    ['id']: QueryTypes['$(theme).themes.id<?>'];
    ['paletteColorShade']?: QueryTypes['$(palette).colorPalettes.id<?>.colorShades.id<?>'];
  }>;
  ['$(palette).colorPalettes.id<?>.colorShades.id<?>']: {
    ['alpha']: number;
    ['hexcode']?: string;
    ['id']: QueryTypes['$(palette).shades.id<?>'];
  };
  ['$(theme).themeColors.id<?>.themeDefinitions.id<?>']: {
    ['id']: QueryTypes['$(theme).themes.id<?>'];
    ['paletteColorShade']: QueryTypes['$(palette).colorPalettes.id<?>.colorShades.id<?>'];
  };
  ['$(theme).themeColors.id<?>.variants.id<?>']: {
    ['id']: QueryTypes['$(theme).stateVariants.id<?>'];
    ['variantDefinitions']: Array<{
      ['id']: QueryTypes['$(theme).themes.id<?>'];
      ['paletteColorShade']?: QueryTypes['$(palette).colorPalettes.id<?>.colorShades.id<?>'];
    }>;
  };
  ['$(palette).colorPalettes.id<?>.colorShades']: Array<{
    ['alpha']: number;
    ['hexcode']?: string;
    ['id']: QueryTypes['$(palette).shades.id<?>'];
  }>;
  ['$(theme).themeColors.id<?>.themeDefinitions']: Array<{
    ['id']: QueryTypes['$(theme).themes.id<?>'];
    ['paletteColorShade']: QueryTypes['$(palette).colorPalettes.id<?>.colorShades.id<?>'];
  }>;
  ['$(theme).themeColors.id<?>.variants']: Array<{
    ['id']: QueryTypes['$(theme).stateVariants.id<?>'];
    ['variantDefinitions']: Array<{
      ['id']: QueryTypes['$(theme).themes.id<?>'];
      ['paletteColorShade']?: QueryTypes['$(palette).colorPalettes.id<?>.colorShades.id<?>'];
    }>;
  }>;
  ['$(theme).themes.id<?>.backgroundColor']: {
    ['alpha']: number;
    ['hexcode']: string;
  };
  ['$(palette).colorPalettes.id<?>']: {
    ['colorShades']: Array<{
      ['alpha']: number;
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
  ['$(theme).stateVariants.id<?>']: {
    ['id']: string;
    ['name']: string;
  };
  ['$(theme).themeColors.id<?>']: {
    ['id']: string;
    ['includeVariants']: boolean;
    ['name']: string;
    ['themeDefinitions']: Array<{
      ['id']: QueryTypes['$(theme).themes.id<?>'];
      ['paletteColorShade']: QueryTypes['$(palette).colorPalettes.id<?>.colorShades.id<?>'];
    }>;
    ['variants']: Array<{
      ['id']: QueryTypes['$(theme).stateVariants.id<?>'];
      ['variantDefinitions']: Array<{
        ['id']: QueryTypes['$(theme).themes.id<?>'];
        ['paletteColorShade']?: QueryTypes['$(palette).colorPalettes.id<?>.colorShades.id<?>'];
      }>;
    }>;
  };
  ['$(theme).themes.id<?>']: {
    ['backgroundColor']: {
      ['alpha']: number;
      ['hexcode']: string;
    };
    ['id']: string;
    ['name']: string;
  };
  ['$(palette).colorPalettes']: Array<{
    ['colorShades']: Array<{
      ['alpha']: number;
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
  ['$(theme).stateVariants']: Array<{
    ['id']: string;
    ['name']: string;
  }>;
  ['$(theme).themeColors']: Array<{
    ['id']: string;
    ['includeVariants']: boolean;
    ['name']: string;
    ['themeDefinitions']: Array<{
      ['id']: QueryTypes['$(theme).themes.id<?>'];
      ['paletteColorShade']: QueryTypes['$(palette).colorPalettes.id<?>.colorShades.id<?>'];
    }>;
    ['variants']: Array<{
      ['id']: QueryTypes['$(theme).stateVariants.id<?>'];
      ['variantDefinitions']: Array<{
        ['id']: QueryTypes['$(theme).themes.id<?>'];
        ['paletteColorShade']?: QueryTypes['$(palette).colorPalettes.id<?>.colorShades.id<?>'];
      }>;
    }>;
  }>;
  ['$(theme).themes']: Array<{
    ['backgroundColor']: {
      ['alpha']: number;
      ['hexcode']: string;
    };
    ['id']: string;
    ['name']: string;
  }>;
};


export type PointerTypes = {
  ['$(theme).themeColors.id<?>.variants.id<?>.variantDefinitions.id<?>']: `$(theme).themeColors.id<${string}>.variants.id<${QueryTypes['$(theme).stateVariants.id<?>']}>.variantDefinitions.id<${QueryTypes['$(theme).themes.id<?>']}>`;
  ['$(theme).themeColors.id<?>.variants.id<?>.variantDefinitions']: `$(theme).themeColors.id<${string}>.variants.id<${QueryTypes['$(theme).stateVariants.id<?>']}>.variantDefinitions`;
  ['$(palette).colorPalettes.id<?>.colorShades.id<?>']: `$(palette).colorPalettes.id<${string}>.colorShades.id<${QueryTypes['$(palette).shades.id<?>']}>`;
  ['$(theme).themeColors.id<?>.themeDefinitions.id<?>']: `$(theme).themeColors.id<${string}>.themeDefinitions.id<${QueryTypes['$(theme).themes.id<?>']}>`;
  ['$(theme).themeColors.id<?>.variants.id<?>']: `$(theme).themeColors.id<${string}>.variants.id<${QueryTypes['$(theme).stateVariants.id<?>']}>`;
  ['$(palette).colorPalettes.id<?>.colorShades']: `$(palette).colorPalettes.id<${string}>.colorShades`;
  ['$(theme).themeColors.id<?>.themeDefinitions']: `$(theme).themeColors.id<${string}>.themeDefinitions`;
  ['$(theme).themeColors.id<?>.variants']: `$(theme).themeColors.id<${string}>.variants`;
  ['$(theme).themes.id<?>.backgroundColor']: `$(theme).themes.id<${string}>.backgroundColor`;
  ['$(palette).colorPalettes.id<?>']: `$(palette).colorPalettes.id<${string}>`;
  ['$(palette).shades.id<?>']: `$(palette).shades.id<${string}>`;
  ['$(theme).stateVariants.id<?>']: `$(theme).stateVariants.id<${string}>`;
  ['$(theme).themeColors.id<?>']: `$(theme).themeColors.id<${string}>`;
  ['$(theme).themes.id<?>']: `$(theme).themes.id<${string}>`;
  ['$(palette).colorPalettes']: `$(palette).colorPalettes`;
  ['$(palette).shades']: `$(palette).shades`;
  ['$(theme).stateVariants']: `$(theme).stateVariants`;
  ['$(theme).themeColors']: `$(theme).themeColors`;
  ['$(theme).themes']: `$(theme).themes`;
};


export type SchemaRoot = {
  ['palette']: {
    ['colorPalettes']: Array<{
      ['colorShades']: Array<{
        ['alpha']: number;
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
        ['id']: QueryTypes['$(theme).themes.id<?>'];
        ['paletteColorShade']: QueryTypes['$(palette).colorPalettes.id<?>.colorShades.id<?>'];
      }>;
      ['variants']: Array<{
        ['id']: QueryTypes['$(theme).stateVariants.id<?>'];
        ['variantDefinitions']: Array<{
          ['id']: QueryTypes['$(theme).themes.id<?>'];
          ['paletteColorShade']?: QueryTypes['$(palette).colorPalettes.id<?>.colorShades.id<?>'];
        }>;
      }>;
    }>;
    ['themes']: Array<{
      ['backgroundColor']: {
        ['alpha']: number;
        ['hexcode']: string;
      };
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
  ['$(theme).stateVariants.id<?>']: `$(theme).stateVariants.id<${string}>`;
  ['$(theme).themeColors.id<?>']: `$(theme).themeColors.id<${string}>`;
  ['$(theme).themeColors.id<?>.themeDefinitions.id<?>']: `$(theme).themeColors.id<${string}>.themeDefinitions.id<${QueryTypes['$(theme).themes.id<?>']}>`;
  ['$(theme).themeColors.id<?>.variants.id<?>']: `$(theme).themeColors.id<${string}>.variants.id<${QueryTypes['$(theme).stateVariants.id<?>']}>`;
  ['$(theme).themeColors.id<?>.variants.id<?>.variantDefinitions.id<?>']: `$(theme).themeColors.id<${string}>.variants.id<${QueryTypes['$(theme).stateVariants.id<?>']}>.variantDefinitions.id<${QueryTypes['$(theme).themes.id<?>']}>`;
  ['$(theme).themes.id<?>']: `$(theme).themes.id<${string}>`;
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
export function makeQueryRef(query: '$(palette).colorPalettes.id<?>'|'$(palette).colorPalettes.id<?>.colorShades.id<?>'|'$(palette).shades.id<?>'|'$(theme).stateVariants.id<?>'|'$(theme).themeColors.id<?>'|'$(theme).themeColors.id<?>.themeDefinitions.id<?>'|'$(theme).themeColors.id<?>.variants.id<?>'|'$(theme).themeColors.id<?>.variants.id<?>.variantDefinitions.id<?>'|'$(theme).themes.id<?>', arg0: string, arg1?: QueryTypes['$(palette).shades.id<?>']|QueryTypes['$(theme).themes.id<?>']|QueryTypes['$(theme).stateVariants.id<?>'], arg2?: QueryTypes['$(theme).themes.id<?>']): QueryTypes['$(palette).colorPalettes.id<?>']|QueryTypes['$(palette).colorPalettes.id<?>.colorShades.id<?>']|QueryTypes['$(palette).shades.id<?>']|QueryTypes['$(theme).stateVariants.id<?>']|QueryTypes['$(theme).themeColors.id<?>']|QueryTypes['$(theme).themeColors.id<?>.themeDefinitions.id<?>']|QueryTypes['$(theme).themeColors.id<?>.variants.id<?>']|QueryTypes['$(theme).themeColors.id<?>.variants.id<?>.variantDefinitions.id<?>']|QueryTypes['$(theme).themes.id<?>']|null {
  if ((arg0 != null && arg0 != undefined) && query == '$(palette).colorPalettes.id<?>') {
    return `$(palette).colorPalettes.id<${arg0 as string}>`;
  }
  if ((arg0 != null && arg0 != undefined) && (arg1 != null && arg1 != undefined) && query == '$(palette).colorPalettes.id<?>.colorShades.id<?>') {
    return `$(palette).colorPalettes.id<${arg0 as string}>.colorShades.id<${arg1 as QueryTypes['$(palette).shades.id<?>']}>`;
  }
  if ((arg0 != null && arg0 != undefined) && query == '$(palette).shades.id<?>') {
    return `$(palette).shades.id<${arg0 as string}>`;
  }
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
  return null;
};

export function useQueryRef(query: '$(theme).themeColors.id<?>.variants.id<?>.variantDefinitions.id<?>', arg0: string, arg1: QueryTypes['$(theme).stateVariants.id<?>'], arg2: QueryTypes['$(theme).themes.id<?>']): QueryTypes['$(theme).themeColors.id<?>.variants.id<?>.variantDefinitions.id<?>'];
export function useQueryRef(query: '$(theme).themeColors.id<?>.themeDefinitions.id<?>', arg0: string, arg1: QueryTypes['$(theme).themes.id<?>']): QueryTypes['$(theme).themeColors.id<?>.themeDefinitions.id<?>'];
export function useQueryRef(query: '$(palette).colorPalettes.id<?>.colorShades.id<?>', arg0: string, arg1: QueryTypes['$(palette).shades.id<?>']): QueryTypes['$(palette).colorPalettes.id<?>.colorShades.id<?>'];
export function useQueryRef(query: '$(theme).themeColors.id<?>.variants.id<?>', arg0: string, arg1: QueryTypes['$(theme).stateVariants.id<?>']): QueryTypes['$(theme).themeColors.id<?>.variants.id<?>'];
export function useQueryRef(query: '$(palette).colorPalettes.id<?>', arg0: string): QueryTypes['$(palette).colorPalettes.id<?>'];
export function useQueryRef(query: '$(theme).stateVariants.id<?>', arg0: string): QueryTypes['$(theme).stateVariants.id<?>'];
export function useQueryRef(query: '$(theme).themeColors.id<?>', arg0: string): QueryTypes['$(theme).themeColors.id<?>'];
export function useQueryRef(query: '$(palette).shades.id<?>', arg0: string): QueryTypes['$(palette).shades.id<?>'];
export function useQueryRef(query: '$(theme).themes.id<?>', arg0: string): QueryTypes['$(theme).themes.id<?>'];
export function useQueryRef(query: '$(palette).colorPalettes.id<?>'|'$(palette).colorPalettes.id<?>.colorShades.id<?>'|'$(palette).shades.id<?>'|'$(theme).stateVariants.id<?>'|'$(theme).themeColors.id<?>'|'$(theme).themeColors.id<?>.themeDefinitions.id<?>'|'$(theme).themeColors.id<?>.variants.id<?>'|'$(theme).themeColors.id<?>.variants.id<?>.variantDefinitions.id<?>'|'$(theme).themes.id<?>', arg0: string, arg1?: QueryTypes['$(palette).shades.id<?>']|QueryTypes['$(theme).themes.id<?>']|QueryTypes['$(theme).stateVariants.id<?>'], arg2?: QueryTypes['$(theme).themes.id<?>']): QueryTypes['$(palette).colorPalettes.id<?>']|QueryTypes['$(palette).colorPalettes.id<?>.colorShades.id<?>']|QueryTypes['$(palette).shades.id<?>']|QueryTypes['$(theme).stateVariants.id<?>']|QueryTypes['$(theme).themeColors.id<?>']|QueryTypes['$(theme).themeColors.id<?>.themeDefinitions.id<?>']|QueryTypes['$(theme).themeColors.id<?>.variants.id<?>']|QueryTypes['$(theme).themeColors.id<?>.variants.id<?>.variantDefinitions.id<?>']|QueryTypes['$(theme).themes.id<?>']|null {
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
    if (query == '$(theme).stateVariants.id<?>') {
      return makeQueryRef(query, arg0 as string);
    }
    if (query == '$(theme).themeColors.id<?>') {
      return makeQueryRef(query, arg0 as string);
    }
    if (query == '$(theme).themeColors.id<?>.themeDefinitions.id<?>') {
      return makeQueryRef(query, arg0 as string, arg1 as QueryTypes['$(theme).themes.id<?>']);
    }
    if (query == '$(theme).themeColors.id<?>.variants.id<?>') {
      return makeQueryRef(query, arg0 as string, arg1 as QueryTypes['$(theme).stateVariants.id<?>']);
    }
    if (query == '$(theme).themeColors.id<?>.variants.id<?>.variantDefinitions.id<?>') {
      return makeQueryRef(query, arg0 as string, arg1 as QueryTypes['$(theme).stateVariants.id<?>'], arg2 as QueryTypes['$(theme).themes.id<?>']);
    }
    if (query == '$(theme).themes.id<?>') {
      return makeQueryRef(query, arg0 as string);
    }
    return null;
  }, [query, arg0, arg1, arg2]);
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

export function useExtractQueryArgs(query?: QueryTypes['$(theme).themeColors.id<?>.variants.id<?>.variantDefinitions.id<?>']): [string, QueryTypes['$(theme).stateVariants.id<?>'], QueryTypes['$(theme).themes.id<?>']];
export function useExtractQueryArgs(query?: QueryTypes['$(theme).themeColors.id<?>.themeDefinitions.id<?>']): [string, QueryTypes['$(theme).themes.id<?>']];
export function useExtractQueryArgs(query?: QueryTypes['$(palette).colorPalettes.id<?>.colorShades.id<?>']): [string, QueryTypes['$(palette).shades.id<?>']];
export function useExtractQueryArgs(query?: QueryTypes['$(theme).themeColors.id<?>.variants.id<?>']): [string, QueryTypes['$(theme).stateVariants.id<?>']];
export function useExtractQueryArgs(query?: QueryTypes['$(palette).colorPalettes.id<?>']): [string];
export function useExtractQueryArgs(query?: QueryTypes['$(theme).stateVariants.id<?>']): [string];
export function useExtractQueryArgs(query?: QueryTypes['$(theme).themeColors.id<?>']): [string];
export function useExtractQueryArgs(query?: QueryTypes['$(palette).shades.id<?>']): [string];
export function useExtractQueryArgs(query?: QueryTypes['$(theme).themes.id<?>']): [string];
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
export function getPluginStore(plugin: 'theme'): SchemaRoot['theme'];
export function getPluginStore(plugin: 'palette'|'theme'): SchemaRoot['palette']|SchemaRoot['theme'] {
  const ctx = useFloroContext();
  const root = ctx.applicationState;
  if (root == null) {
    return {} as SchemaRoot['palette']|SchemaRoot['theme'];
  }
  return root[plugin];
}

export function usePluginStore(plugin: 'palette'): SchemaRoot['palette'];
export function usePluginStore(plugin: 'theme'): SchemaRoot['theme'];
export function usePluginStore(plugin: 'palette'|'theme'): SchemaRoot['palette']|SchemaRoot['theme'] {
  const ctx = useFloroContext();
  const root = ctx.applicationState;
  return useMemo(() => {
    if (root == null) {
      return {} as SchemaRoot['palette']|SchemaRoot['theme'];
    }
    return root[plugin];
  }, [root, plugin]);
}

export function getReferencedObject(root: SchemaRoot, query?: PointerTypes['$(theme).themeColors.id<?>.variants.id<?>.variantDefinitions.id<?>']): SchemaTypes['$(theme).themeColors.id<?>.variants.id<?>.variantDefinitions.id<?>'];
export function getReferencedObject(root: SchemaRoot, query?: PointerTypes['$(theme).themeColors.id<?>.variants.id<?>.variantDefinitions']): SchemaTypes['$(theme).themeColors.id<?>.variants.id<?>.variantDefinitions'];
export function getReferencedObject(root: SchemaRoot, query?: PointerTypes['$(palette).colorPalettes.id<?>.colorShades.id<?>']): SchemaTypes['$(palette).colorPalettes.id<?>.colorShades.id<?>'];
export function getReferencedObject(root: SchemaRoot, query?: PointerTypes['$(theme).themeColors.id<?>.themeDefinitions.id<?>']): SchemaTypes['$(theme).themeColors.id<?>.themeDefinitions.id<?>'];
export function getReferencedObject(root: SchemaRoot, query?: PointerTypes['$(theme).themeColors.id<?>.variants.id<?>']): SchemaTypes['$(theme).themeColors.id<?>.variants.id<?>'];
export function getReferencedObject(root: SchemaRoot, query?: PointerTypes['$(palette).colorPalettes.id<?>.colorShades']): SchemaTypes['$(palette).colorPalettes.id<?>.colorShades'];
export function getReferencedObject(root: SchemaRoot, query?: PointerTypes['$(theme).themeColors.id<?>.themeDefinitions']): SchemaTypes['$(theme).themeColors.id<?>.themeDefinitions'];
export function getReferencedObject(root: SchemaRoot, query?: PointerTypes['$(theme).themeColors.id<?>.variants']): SchemaTypes['$(theme).themeColors.id<?>.variants'];
export function getReferencedObject(root: SchemaRoot, query?: PointerTypes['$(theme).themes.id<?>.backgroundColor']): SchemaTypes['$(theme).themes.id<?>.backgroundColor'];
export function getReferencedObject(root: SchemaRoot, query?: PointerTypes['$(palette).colorPalettes.id<?>']): SchemaTypes['$(palette).colorPalettes.id<?>'];
export function getReferencedObject(root: SchemaRoot, query?: PointerTypes['$(palette).shades.id<?>']): SchemaTypes['$(palette).shades.id<?>'];
export function getReferencedObject(root: SchemaRoot, query?: PointerTypes['$(theme).stateVariants.id<?>']): SchemaTypes['$(theme).stateVariants.id<?>'];
export function getReferencedObject(root: SchemaRoot, query?: PointerTypes['$(theme).themeColors.id<?>']): SchemaTypes['$(theme).themeColors.id<?>'];
export function getReferencedObject(root: SchemaRoot, query?: PointerTypes['$(theme).themes.id<?>']): SchemaTypes['$(theme).themes.id<?>'];
export function getReferencedObject(root: SchemaRoot, query?: PointerTypes['$(palette).colorPalettes']): SchemaTypes['$(palette).colorPalettes'];
export function getReferencedObject(root: SchemaRoot, query?: PointerTypes['$(palette).shades']): SchemaTypes['$(palette).shades'];
export function getReferencedObject(root: SchemaRoot, query?: PointerTypes['$(theme).stateVariants']): SchemaTypes['$(theme).stateVariants'];
export function getReferencedObject(root: SchemaRoot, query?: PointerTypes['$(theme).themeColors']): SchemaTypes['$(theme).themeColors'];
export function getReferencedObject(root: SchemaRoot, query?: PointerTypes['$(theme).themes']): SchemaTypes['$(theme).themes'];

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

export function useReferencedObject(query?: PointerTypes['$(theme).themeColors.id<?>.variants.id<?>.variantDefinitions.id<?>']): SchemaTypes['$(theme).themeColors.id<?>.variants.id<?>.variantDefinitions.id<?>'];
export function useReferencedObject(query?: PointerTypes['$(theme).themeColors.id<?>.variants.id<?>.variantDefinitions']): SchemaTypes['$(theme).themeColors.id<?>.variants.id<?>.variantDefinitions'];
export function useReferencedObject(query?: PointerTypes['$(palette).colorPalettes.id<?>.colorShades.id<?>']): SchemaTypes['$(palette).colorPalettes.id<?>.colorShades.id<?>'];
export function useReferencedObject(query?: PointerTypes['$(theme).themeColors.id<?>.themeDefinitions.id<?>']): SchemaTypes['$(theme).themeColors.id<?>.themeDefinitions.id<?>'];
export function useReferencedObject(query?: PointerTypes['$(theme).themeColors.id<?>.variants.id<?>']): SchemaTypes['$(theme).themeColors.id<?>.variants.id<?>'];
export function useReferencedObject(query?: PointerTypes['$(palette).colorPalettes.id<?>.colorShades']): SchemaTypes['$(palette).colorPalettes.id<?>.colorShades'];
export function useReferencedObject(query?: PointerTypes['$(theme).themeColors.id<?>.themeDefinitions']): SchemaTypes['$(theme).themeColors.id<?>.themeDefinitions'];
export function useReferencedObject(query?: PointerTypes['$(theme).themeColors.id<?>.variants']): SchemaTypes['$(theme).themeColors.id<?>.variants'];
export function useReferencedObject(query?: PointerTypes['$(theme).themes.id<?>.backgroundColor']): SchemaTypes['$(theme).themes.id<?>.backgroundColor'];
export function useReferencedObject(query?: PointerTypes['$(palette).colorPalettes.id<?>']): SchemaTypes['$(palette).colorPalettes.id<?>'];
export function useReferencedObject(query?: PointerTypes['$(palette).shades.id<?>']): SchemaTypes['$(palette).shades.id<?>'];
export function useReferencedObject(query?: PointerTypes['$(theme).stateVariants.id<?>']): SchemaTypes['$(theme).stateVariants.id<?>'];
export function useReferencedObject(query?: PointerTypes['$(theme).themeColors.id<?>']): SchemaTypes['$(theme).themeColors.id<?>'];
export function useReferencedObject(query?: PointerTypes['$(theme).themes.id<?>']): SchemaTypes['$(theme).themes.id<?>'];
export function useReferencedObject(query?: PointerTypes['$(palette).colorPalettes']): SchemaTypes['$(palette).colorPalettes'];
export function useReferencedObject(query?: PointerTypes['$(palette).shades']): SchemaTypes['$(palette).shades'];
export function useReferencedObject(query?: PointerTypes['$(theme).stateVariants']): SchemaTypes['$(theme).stateVariants'];
export function useReferencedObject(query?: PointerTypes['$(theme).themeColors']): SchemaTypes['$(theme).themeColors'];
export function useReferencedObject(query?: PointerTypes['$(theme).themes']): SchemaTypes['$(theme).themes'];

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

export function useFloroState(query: PointerTypes['$(theme).themeColors.id<?>.variants.id<?>.variantDefinitions.id<?>'], defaultData?: SchemaTypes['$(theme).themeColors.id<?>.variants.id<?>.variantDefinitions.id<?>'], mutateStoreWithDefault?: boolean): [SchemaTypes['$(theme).themeColors.id<?>.variants.id<?>.variantDefinitions.id<?>']|null, (t: SchemaTypes['$(theme).themeColors.id<?>.variants.id<?>.variantDefinitions.id<?>'], doSave?: boolean) => void, boolean, () => void];
export function useFloroState(query: PointerTypes['$(theme).themeColors.id<?>.variants.id<?>.variantDefinitions'], defaultData?: SchemaTypes['$(theme).themeColors.id<?>.variants.id<?>.variantDefinitions'], mutateStoreWithDefault?: boolean): [SchemaTypes['$(theme).themeColors.id<?>.variants.id<?>.variantDefinitions']|null, (t: SchemaTypes['$(theme).themeColors.id<?>.variants.id<?>.variantDefinitions'], doSave?: boolean) => void, boolean, () => void];
export function useFloroState(query: PointerTypes['$(palette).colorPalettes.id<?>.colorShades.id<?>'], defaultData?: SchemaTypes['$(palette).colorPalettes.id<?>.colorShades.id<?>'], mutateStoreWithDefault?: boolean): [SchemaTypes['$(palette).colorPalettes.id<?>.colorShades.id<?>']|null, (t: SchemaTypes['$(palette).colorPalettes.id<?>.colorShades.id<?>'], doSave?: boolean) => void, boolean, () => void];
export function useFloroState(query: PointerTypes['$(theme).themeColors.id<?>.themeDefinitions.id<?>'], defaultData?: SchemaTypes['$(theme).themeColors.id<?>.themeDefinitions.id<?>'], mutateStoreWithDefault?: boolean): [SchemaTypes['$(theme).themeColors.id<?>.themeDefinitions.id<?>']|null, (t: SchemaTypes['$(theme).themeColors.id<?>.themeDefinitions.id<?>'], doSave?: boolean) => void, boolean, () => void];
export function useFloroState(query: PointerTypes['$(theme).themeColors.id<?>.variants.id<?>'], defaultData?: SchemaTypes['$(theme).themeColors.id<?>.variants.id<?>'], mutateStoreWithDefault?: boolean): [SchemaTypes['$(theme).themeColors.id<?>.variants.id<?>']|null, (t: SchemaTypes['$(theme).themeColors.id<?>.variants.id<?>'], doSave?: boolean) => void, boolean, () => void];
export function useFloroState(query: PointerTypes['$(palette).colorPalettes.id<?>.colorShades'], defaultData?: SchemaTypes['$(palette).colorPalettes.id<?>.colorShades'], mutateStoreWithDefault?: boolean): [SchemaTypes['$(palette).colorPalettes.id<?>.colorShades']|null, (t: SchemaTypes['$(palette).colorPalettes.id<?>.colorShades'], doSave?: boolean) => void, boolean, () => void];
export function useFloroState(query: PointerTypes['$(theme).themeColors.id<?>.themeDefinitions'], defaultData?: SchemaTypes['$(theme).themeColors.id<?>.themeDefinitions'], mutateStoreWithDefault?: boolean): [SchemaTypes['$(theme).themeColors.id<?>.themeDefinitions']|null, (t: SchemaTypes['$(theme).themeColors.id<?>.themeDefinitions'], doSave?: boolean) => void, boolean, () => void];
export function useFloroState(query: PointerTypes['$(theme).themeColors.id<?>.variants'], defaultData?: SchemaTypes['$(theme).themeColors.id<?>.variants'], mutateStoreWithDefault?: boolean): [SchemaTypes['$(theme).themeColors.id<?>.variants']|null, (t: SchemaTypes['$(theme).themeColors.id<?>.variants'], doSave?: boolean) => void, boolean, () => void];
export function useFloroState(query: PointerTypes['$(theme).themes.id<?>.backgroundColor'], defaultData?: SchemaTypes['$(theme).themes.id<?>.backgroundColor'], mutateStoreWithDefault?: boolean): [SchemaTypes['$(theme).themes.id<?>.backgroundColor']|null, (t: SchemaTypes['$(theme).themes.id<?>.backgroundColor'], doSave?: boolean) => void, boolean, () => void];
export function useFloroState(query: PointerTypes['$(palette).colorPalettes.id<?>'], defaultData?: SchemaTypes['$(palette).colorPalettes.id<?>'], mutateStoreWithDefault?: boolean): [SchemaTypes['$(palette).colorPalettes.id<?>']|null, (t: SchemaTypes['$(palette).colorPalettes.id<?>'], doSave?: boolean) => void, boolean, () => void];
export function useFloroState(query: PointerTypes['$(palette).shades.id<?>'], defaultData?: SchemaTypes['$(palette).shades.id<?>'], mutateStoreWithDefault?: boolean): [SchemaTypes['$(palette).shades.id<?>']|null, (t: SchemaTypes['$(palette).shades.id<?>'], doSave?: boolean) => void, boolean, () => void];
export function useFloroState(query: PointerTypes['$(theme).stateVariants.id<?>'], defaultData?: SchemaTypes['$(theme).stateVariants.id<?>'], mutateStoreWithDefault?: boolean): [SchemaTypes['$(theme).stateVariants.id<?>']|null, (t: SchemaTypes['$(theme).stateVariants.id<?>'], doSave?: boolean) => void, boolean, () => void];
export function useFloroState(query: PointerTypes['$(theme).themeColors.id<?>'], defaultData?: SchemaTypes['$(theme).themeColors.id<?>'], mutateStoreWithDefault?: boolean): [SchemaTypes['$(theme).themeColors.id<?>']|null, (t: SchemaTypes['$(theme).themeColors.id<?>'], doSave?: boolean) => void, boolean, () => void];
export function useFloroState(query: PointerTypes['$(theme).themes.id<?>'], defaultData?: SchemaTypes['$(theme).themes.id<?>'], mutateStoreWithDefault?: boolean): [SchemaTypes['$(theme).themes.id<?>']|null, (t: SchemaTypes['$(theme).themes.id<?>'], doSave?: boolean) => void, boolean, () => void];
export function useFloroState(query: PointerTypes['$(palette).colorPalettes'], defaultData?: SchemaTypes['$(palette).colorPalettes'], mutateStoreWithDefault?: boolean): [SchemaTypes['$(palette).colorPalettes']|null, (t: SchemaTypes['$(palette).colorPalettes'], doSave?: boolean) => void, boolean, () => void];
export function useFloroState(query: PointerTypes['$(palette).shades'], defaultData?: SchemaTypes['$(palette).shades'], mutateStoreWithDefault?: boolean): [SchemaTypes['$(palette).shades']|null, (t: SchemaTypes['$(palette).shades'], doSave?: boolean) => void, boolean, () => void];
export function useFloroState(query: PointerTypes['$(theme).stateVariants'], defaultData?: SchemaTypes['$(theme).stateVariants'], mutateStoreWithDefault?: boolean): [SchemaTypes['$(theme).stateVariants']|null, (t: SchemaTypes['$(theme).stateVariants'], doSave?: boolean) => void, boolean, () => void];
export function useFloroState(query: PointerTypes['$(theme).themeColors'], defaultData?: SchemaTypes['$(theme).themeColors'], mutateStoreWithDefault?: boolean): [SchemaTypes['$(theme).themeColors']|null, (t: SchemaTypes['$(theme).themeColors'], doSave?: boolean) => void, boolean, () => void];
export function useFloroState(query: PointerTypes['$(theme).themes'], defaultData?: SchemaTypes['$(theme).themes'], mutateStoreWithDefault?: boolean): [SchemaTypes['$(theme).themes']|null, (t: SchemaTypes['$(theme).themes'], doSave?: boolean) => void, boolean, () => void];

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
export function useIsFloroInvalid(query: PointerTypes['$(theme).themeColors.id<?>.variants.id<?>.variantDefinitions.id<?>'], fuzzy?: boolean): boolean;
export function useIsFloroInvalid(query: PointerTypes['$(theme).themeColors.id<?>.variants.id<?>.variantDefinitions'], fuzzy?: boolean): boolean;
export function useIsFloroInvalid(query: PointerTypes['$(palette).colorPalettes.id<?>.colorShades.id<?>'], fuzzy?: boolean): boolean;
export function useIsFloroInvalid(query: PointerTypes['$(theme).themeColors.id<?>.themeDefinitions.id<?>'], fuzzy?: boolean): boolean;
export function useIsFloroInvalid(query: PointerTypes['$(theme).themeColors.id<?>.variants.id<?>'], fuzzy?: boolean): boolean;
export function useIsFloroInvalid(query: PointerTypes['$(palette).colorPalettes.id<?>.colorShades'], fuzzy?: boolean): boolean;
export function useIsFloroInvalid(query: PointerTypes['$(theme).themeColors.id<?>.themeDefinitions'], fuzzy?: boolean): boolean;
export function useIsFloroInvalid(query: PointerTypes['$(theme).themeColors.id<?>.variants'], fuzzy?: boolean): boolean;
export function useIsFloroInvalid(query: PointerTypes['$(theme).themes.id<?>.backgroundColor'], fuzzy?: boolean): boolean;
export function useIsFloroInvalid(query: PointerTypes['$(palette).colorPalettes.id<?>'], fuzzy?: boolean): boolean;
export function useIsFloroInvalid(query: PointerTypes['$(palette).shades.id<?>'], fuzzy?: boolean): boolean;
export function useIsFloroInvalid(query: PointerTypes['$(theme).stateVariants.id<?>'], fuzzy?: boolean): boolean;
export function useIsFloroInvalid(query: PointerTypes['$(theme).themeColors.id<?>'], fuzzy?: boolean): boolean;
export function useIsFloroInvalid(query: PointerTypes['$(theme).themes.id<?>'], fuzzy?: boolean): boolean;
export function useIsFloroInvalid(query: PointerTypes['$(palette).colorPalettes'], fuzzy?: boolean): boolean;
export function useIsFloroInvalid(query: PointerTypes['$(palette).shades'], fuzzy?: boolean): boolean;
export function useIsFloroInvalid(query: PointerTypes['$(theme).stateVariants'], fuzzy?: boolean): boolean;
export function useIsFloroInvalid(query: PointerTypes['$(theme).themeColors'], fuzzy?: boolean): boolean;
export function useIsFloroInvalid(query: PointerTypes['$(theme).themes'], fuzzy?: boolean): boolean;

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
export function useWasAdded(query: PointerTypes['$(theme).themeColors.id<?>.variants.id<?>.variantDefinitions.id<?>'], fuzzy?: boolean): boolean;
export function useWasAdded(query: PointerTypes['$(theme).themeColors.id<?>.variants.id<?>.variantDefinitions'], fuzzy?: boolean): boolean;
export function useWasAdded(query: PointerTypes['$(palette).colorPalettes.id<?>.colorShades.id<?>'], fuzzy?: boolean): boolean;
export function useWasAdded(query: PointerTypes['$(theme).themeColors.id<?>.themeDefinitions.id<?>'], fuzzy?: boolean): boolean;
export function useWasAdded(query: PointerTypes['$(theme).themeColors.id<?>.variants.id<?>'], fuzzy?: boolean): boolean;
export function useWasAdded(query: PointerTypes['$(palette).colorPalettes.id<?>.colorShades'], fuzzy?: boolean): boolean;
export function useWasAdded(query: PointerTypes['$(theme).themeColors.id<?>.themeDefinitions'], fuzzy?: boolean): boolean;
export function useWasAdded(query: PointerTypes['$(theme).themeColors.id<?>.variants'], fuzzy?: boolean): boolean;
export function useWasAdded(query: PointerTypes['$(theme).themes.id<?>.backgroundColor'], fuzzy?: boolean): boolean;
export function useWasAdded(query: PointerTypes['$(palette).colorPalettes.id<?>'], fuzzy?: boolean): boolean;
export function useWasAdded(query: PointerTypes['$(palette).shades.id<?>'], fuzzy?: boolean): boolean;
export function useWasAdded(query: PointerTypes['$(theme).stateVariants.id<?>'], fuzzy?: boolean): boolean;
export function useWasAdded(query: PointerTypes['$(theme).themeColors.id<?>'], fuzzy?: boolean): boolean;
export function useWasAdded(query: PointerTypes['$(theme).themes.id<?>'], fuzzy?: boolean): boolean;
export function useWasAdded(query: PointerTypes['$(palette).colorPalettes'], fuzzy?: boolean): boolean;
export function useWasAdded(query: PointerTypes['$(palette).shades'], fuzzy?: boolean): boolean;
export function useWasAdded(query: PointerTypes['$(theme).stateVariants'], fuzzy?: boolean): boolean;
export function useWasAdded(query: PointerTypes['$(theme).themeColors'], fuzzy?: boolean): boolean;
export function useWasAdded(query: PointerTypes['$(theme).themes'], fuzzy?: boolean): boolean;

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
export function useWasRemoved(query: PointerTypes['$(theme).themeColors.id<?>.variants.id<?>.variantDefinitions.id<?>'], fuzzy?: boolean): boolean;
export function useWasRemoved(query: PointerTypes['$(theme).themeColors.id<?>.variants.id<?>.variantDefinitions'], fuzzy?: boolean): boolean;
export function useWasRemoved(query: PointerTypes['$(palette).colorPalettes.id<?>.colorShades.id<?>'], fuzzy?: boolean): boolean;
export function useWasRemoved(query: PointerTypes['$(theme).themeColors.id<?>.themeDefinitions.id<?>'], fuzzy?: boolean): boolean;
export function useWasRemoved(query: PointerTypes['$(theme).themeColors.id<?>.variants.id<?>'], fuzzy?: boolean): boolean;
export function useWasRemoved(query: PointerTypes['$(palette).colorPalettes.id<?>.colorShades'], fuzzy?: boolean): boolean;
export function useWasRemoved(query: PointerTypes['$(theme).themeColors.id<?>.themeDefinitions'], fuzzy?: boolean): boolean;
export function useWasRemoved(query: PointerTypes['$(theme).themeColors.id<?>.variants'], fuzzy?: boolean): boolean;
export function useWasRemoved(query: PointerTypes['$(theme).themes.id<?>.backgroundColor'], fuzzy?: boolean): boolean;
export function useWasRemoved(query: PointerTypes['$(palette).colorPalettes.id<?>'], fuzzy?: boolean): boolean;
export function useWasRemoved(query: PointerTypes['$(palette).shades.id<?>'], fuzzy?: boolean): boolean;
export function useWasRemoved(query: PointerTypes['$(theme).stateVariants.id<?>'], fuzzy?: boolean): boolean;
export function useWasRemoved(query: PointerTypes['$(theme).themeColors.id<?>'], fuzzy?: boolean): boolean;
export function useWasRemoved(query: PointerTypes['$(theme).themes.id<?>'], fuzzy?: boolean): boolean;
export function useWasRemoved(query: PointerTypes['$(palette).colorPalettes'], fuzzy?: boolean): boolean;
export function useWasRemoved(query: PointerTypes['$(palette).shades'], fuzzy?: boolean): boolean;
export function useWasRemoved(query: PointerTypes['$(theme).stateVariants'], fuzzy?: boolean): boolean;
export function useWasRemoved(query: PointerTypes['$(theme).themeColors'], fuzzy?: boolean): boolean;
export function useWasRemoved(query: PointerTypes['$(theme).themes'], fuzzy?: boolean): boolean;

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
export function useHasConflict(query: PointerTypes['$(theme).themeColors.id<?>.variants.id<?>.variantDefinitions.id<?>'], fuzzy?: boolean): boolean;
export function useHasConflict(query: PointerTypes['$(theme).themeColors.id<?>.variants.id<?>.variantDefinitions'], fuzzy?: boolean): boolean;
export function useHasConflict(query: PointerTypes['$(palette).colorPalettes.id<?>.colorShades.id<?>'], fuzzy?: boolean): boolean;
export function useHasConflict(query: PointerTypes['$(theme).themeColors.id<?>.themeDefinitions.id<?>'], fuzzy?: boolean): boolean;
export function useHasConflict(query: PointerTypes['$(theme).themeColors.id<?>.variants.id<?>'], fuzzy?: boolean): boolean;
export function useHasConflict(query: PointerTypes['$(palette).colorPalettes.id<?>.colorShades'], fuzzy?: boolean): boolean;
export function useHasConflict(query: PointerTypes['$(theme).themeColors.id<?>.themeDefinitions'], fuzzy?: boolean): boolean;
export function useHasConflict(query: PointerTypes['$(theme).themeColors.id<?>.variants'], fuzzy?: boolean): boolean;
export function useHasConflict(query: PointerTypes['$(theme).themes.id<?>.backgroundColor'], fuzzy?: boolean): boolean;
export function useHasConflict(query: PointerTypes['$(palette).colorPalettes.id<?>'], fuzzy?: boolean): boolean;
export function useHasConflict(query: PointerTypes['$(palette).shades.id<?>'], fuzzy?: boolean): boolean;
export function useHasConflict(query: PointerTypes['$(theme).stateVariants.id<?>'], fuzzy?: boolean): boolean;
export function useHasConflict(query: PointerTypes['$(theme).themeColors.id<?>'], fuzzy?: boolean): boolean;
export function useHasConflict(query: PointerTypes['$(theme).themes.id<?>'], fuzzy?: boolean): boolean;
export function useHasConflict(query: PointerTypes['$(palette).colorPalettes'], fuzzy?: boolean): boolean;
export function useHasConflict(query: PointerTypes['$(palette).shades'], fuzzy?: boolean): boolean;
export function useHasConflict(query: PointerTypes['$(theme).stateVariants'], fuzzy?: boolean): boolean;
export function useHasConflict(query: PointerTypes['$(theme).themeColors'], fuzzy?: boolean): boolean;
export function useHasConflict(query: PointerTypes['$(theme).themes'], fuzzy?: boolean): boolean;

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
export function useWasChanged(query: PointerTypes['$(theme).themeColors.id<?>.variants.id<?>.variantDefinitions.id<?>'], fuzzy?: boolean): boolean;
export function useWasChanged(query: PointerTypes['$(theme).themeColors.id<?>.variants.id<?>.variantDefinitions'], fuzzy?: boolean): boolean;
export function useWasChanged(query: PointerTypes['$(palette).colorPalettes.id<?>.colorShades.id<?>'], fuzzy?: boolean): boolean;
export function useWasChanged(query: PointerTypes['$(theme).themeColors.id<?>.themeDefinitions.id<?>'], fuzzy?: boolean): boolean;
export function useWasChanged(query: PointerTypes['$(theme).themeColors.id<?>.variants.id<?>'], fuzzy?: boolean): boolean;
export function useWasChanged(query: PointerTypes['$(palette).colorPalettes.id<?>.colorShades'], fuzzy?: boolean): boolean;
export function useWasChanged(query: PointerTypes['$(theme).themeColors.id<?>.themeDefinitions'], fuzzy?: boolean): boolean;
export function useWasChanged(query: PointerTypes['$(theme).themeColors.id<?>.variants'], fuzzy?: boolean): boolean;
export function useWasChanged(query: PointerTypes['$(theme).themes.id<?>.backgroundColor'], fuzzy?: boolean): boolean;
export function useWasChanged(query: PointerTypes['$(palette).colorPalettes.id<?>'], fuzzy?: boolean): boolean;
export function useWasChanged(query: PointerTypes['$(palette).shades.id<?>'], fuzzy?: boolean): boolean;
export function useWasChanged(query: PointerTypes['$(theme).stateVariants.id<?>'], fuzzy?: boolean): boolean;
export function useWasChanged(query: PointerTypes['$(theme).themeColors.id<?>'], fuzzy?: boolean): boolean;
export function useWasChanged(query: PointerTypes['$(theme).themes.id<?>'], fuzzy?: boolean): boolean;
export function useWasChanged(query: PointerTypes['$(palette).colorPalettes'], fuzzy?: boolean): boolean;
export function useWasChanged(query: PointerTypes['$(palette).shades'], fuzzy?: boolean): boolean;
export function useWasChanged(query: PointerTypes['$(theme).stateVariants'], fuzzy?: boolean): boolean;
export function useWasChanged(query: PointerTypes['$(theme).themeColors'], fuzzy?: boolean): boolean;
export function useWasChanged(query: PointerTypes['$(theme).themes'], fuzzy?: boolean): boolean;

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
export function useHasIndication(query: PointerTypes['$(theme).themeColors.id<?>.variants.id<?>.variantDefinitions.id<?>'], fuzzy?: boolean): boolean;
export function useHasIndication(query: PointerTypes['$(theme).themeColors.id<?>.variants.id<?>.variantDefinitions'], fuzzy?: boolean): boolean;
export function useHasIndication(query: PointerTypes['$(palette).colorPalettes.id<?>.colorShades.id<?>'], fuzzy?: boolean): boolean;
export function useHasIndication(query: PointerTypes['$(theme).themeColors.id<?>.themeDefinitions.id<?>'], fuzzy?: boolean): boolean;
export function useHasIndication(query: PointerTypes['$(theme).themeColors.id<?>.variants.id<?>'], fuzzy?: boolean): boolean;
export function useHasIndication(query: PointerTypes['$(palette).colorPalettes.id<?>.colorShades'], fuzzy?: boolean): boolean;
export function useHasIndication(query: PointerTypes['$(theme).themeColors.id<?>.themeDefinitions'], fuzzy?: boolean): boolean;
export function useHasIndication(query: PointerTypes['$(theme).themeColors.id<?>.variants'], fuzzy?: boolean): boolean;
export function useHasIndication(query: PointerTypes['$(theme).themes.id<?>.backgroundColor'], fuzzy?: boolean): boolean;
export function useHasIndication(query: PointerTypes['$(palette).colorPalettes.id<?>'], fuzzy?: boolean): boolean;
export function useHasIndication(query: PointerTypes['$(palette).shades.id<?>'], fuzzy?: boolean): boolean;
export function useHasIndication(query: PointerTypes['$(theme).stateVariants.id<?>'], fuzzy?: boolean): boolean;
export function useHasIndication(query: PointerTypes['$(theme).themeColors.id<?>'], fuzzy?: boolean): boolean;
export function useHasIndication(query: PointerTypes['$(theme).themes.id<?>'], fuzzy?: boolean): boolean;
export function useHasIndication(query: PointerTypes['$(palette).colorPalettes'], fuzzy?: boolean): boolean;
export function useHasIndication(query: PointerTypes['$(palette).shades'], fuzzy?: boolean): boolean;
export function useHasIndication(query: PointerTypes['$(theme).stateVariants'], fuzzy?: boolean): boolean;
export function useHasIndication(query: PointerTypes['$(theme).themeColors'], fuzzy?: boolean): boolean;
export function useHasIndication(query: PointerTypes['$(theme).themes'], fuzzy?: boolean): boolean;

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
