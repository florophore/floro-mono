import React, { useEffect, createContext, useMemo, useCallback, useState, useContext, useRef } from 'react';
import mdiff from "mdiff";

export type FileRef = `${string}.${string}`;

export type PartialDiffableQuery = `$(theme).themeColors.id<${string}>.variants.id<${QueryTypes['$(theme).stateVariants.id<?>']}>.variantDefinitions.id<${QueryTypes['$(theme).themes.id<?>']}>`|`$(icons).iconGroups.id<${string}>.icons.id<${string}>.appliedThemes.hexcode<${string}>`|`$(icons).iconGroups.id<${string}>.icons.id<${string}>.enabledVariants.id<${QueryTypes['$(theme).stateVariants.id<?>']}>`|`$(theme).themeColors.id<${string}>.variants.id<${QueryTypes['$(theme).stateVariants.id<?>']}>.variantDefinitions`|`$(icons).iconGroups.id<${string}>.icons.id<${string}>.appliedThemes`|`$(icons).iconGroups.id<${string}>.icons.id<${string}>.enabledVariants`|`$(theme).themeColors.id<${string}>.themeDefinitions.id<${QueryTypes['$(theme).themes.id<?>']}>`|`$(theme).themeColors.id<${string}>.variants.id<${QueryTypes['$(theme).stateVariants.id<?>']}>`|`$(palette).colorPalettes.id<${string}>.colorShades.id<${QueryTypes['$(palette).shades.id<?>']}>`|`$(icons).iconGroups.id<${string}>.icons.id<${string}>`|`$(theme).themeColors.id<${string}>.themeDefinitions`|`$(theme).themeColors.id<${string}>.variants`|`$(theme).themes.id<${string}>.backgroundColor`|`$(palette).colorPalettes.id<${string}>.colorShades`|`$(icons).iconGroups.id<${string}>.icons`|`$(theme).stateVariants.id<${string}>`|`$(theme).themeColors.id<${string}>`|`$(theme).themes.id<${string}>`|`$(palette).colorPalettes.id<${string}>`|`$(palette).shades.id<${string}>`|`$(icons).iconGroups.id<${string}>`|`$(theme).stateVariants`|`$(theme).themeColors`|`$(theme).themes`|`$(palette).colorPalettes`|`$(palette).shades`|`$(icons).iconGroups`;

export type DiffableQuery = `$(theme).themeColors.id<${string}>.variants.id<${QueryTypes['$(theme).stateVariants.id<?>']}>.variantDefinitions.id<${QueryTypes['$(theme).themes.id<?>']}>`|`$(icons).iconGroups.id<${string}>.icons.id<${string}>.appliedThemes.hexcode<${string}>`|`$(icons).iconGroups.id<${string}>.icons.id<${string}>.enabledVariants.id<${QueryTypes['$(theme).stateVariants.id<?>']}>`|`$(theme).themeColors.id<${string}>.themeDefinitions.id<${QueryTypes['$(theme).themes.id<?>']}>`|`$(theme).themeColors.id<${string}>.variants.id<${QueryTypes['$(theme).stateVariants.id<?>']}>`|`$(palette).colorPalettes.id<${string}>.colorShades.id<${QueryTypes['$(palette).shades.id<?>']}>`|`$(icons).iconGroups.id<${string}>.icons.id<${string}>`|`$(theme).themes.id<${string}>.backgroundColor`|`$(theme).stateVariants.id<${string}>`|`$(theme).themeColors.id<${string}>`|`$(theme).themes.id<${string}>`|`$(palette).colorPalettes.id<${string}>`|`$(palette).shades.id<${string}>`|`$(icons).iconGroups.id<${string}>`;

export type SchemaTypes = {
  ['$(theme).themeColors.id<?>.variants.id<?>.variantDefinitions.id<?>']: {
    ['alpha']?: number;
    ['id']: QueryTypes['$(theme).themes.id<?>'];
    ['paletteColorShade']?: QueryTypes['$(palette).colorPalettes.id<?>.colorShades.id<?>'];
  };
  ['$(icons).iconGroups.id<?>.icons.id<?>.appliedThemes.hexcode<?>']: {
    ['hexcode']: string;
    ['themeDefinition']: QueryTypes['$(theme).themeColors.id<?>'];
  };
  ['$(icons).iconGroups.id<?>.icons.id<?>.enabledVariants.id<?>']: {
    ['enabled']: boolean;
    ['id']: QueryTypes['$(theme).stateVariants.id<?>'];
  };
  ['$(theme).themeColors.id<?>.variants.id<?>.variantDefinitions']: Array<{
    ['alpha']?: number;
    ['id']: QueryTypes['$(theme).themes.id<?>'];
    ['paletteColorShade']?: QueryTypes['$(palette).colorPalettes.id<?>.colorShades.id<?>'];
  }>;
  ['$(icons).iconGroups.id<?>.icons.id<?>.appliedThemes']: Array<{
    ['hexcode']: string;
    ['themeDefinition']: QueryTypes['$(theme).themeColors.id<?>'];
  }>;
  ['$(icons).iconGroups.id<?>.icons.id<?>.enabledVariants']: Array<{
    ['enabled']: boolean;
    ['id']: QueryTypes['$(theme).stateVariants.id<?>'];
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
  ['$(icons).iconGroups.id<?>.icons.id<?>']: {
    ['appliedThemes']: Array<{
      ['hexcode']: string;
      ['themeDefinition']: QueryTypes['$(theme).themeColors.id<?>'];
    }>;
    ['defaultIconTheme']: QueryTypes['$(theme).themes.id<?>'];
    ['enabledVariants']: Array<{
      ['enabled']: boolean;
      ['id']: QueryTypes['$(theme).stateVariants.id<?>'];
    }>;
    ['id']: string;
    ['name']: string;
    ['svg']: FileRef;
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
  ['$(icons).iconGroups.id<?>.icons']: Array<{
    ['appliedThemes']: Array<{
      ['hexcode']: string;
      ['themeDefinition']: QueryTypes['$(theme).themeColors.id<?>'];
    }>;
    ['defaultIconTheme']: QueryTypes['$(theme).themes.id<?>'];
    ['enabledVariants']: Array<{
      ['enabled']: boolean;
      ['id']: QueryTypes['$(theme).stateVariants.id<?>'];
    }>;
    ['id']: string;
    ['name']: string;
    ['svg']: FileRef;
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
  ['$(icons).iconGroups.id<?>']: {
    ['icons']: Array<{
      ['appliedThemes']: Array<{
        ['hexcode']: string;
        ['themeDefinition']: QueryTypes['$(theme).themeColors.id<?>'];
      }>;
      ['defaultIconTheme']: QueryTypes['$(theme).themes.id<?>'];
      ['enabledVariants']: Array<{
        ['enabled']: boolean;
        ['id']: QueryTypes['$(theme).stateVariants.id<?>'];
      }>;
      ['id']: string;
      ['name']: string;
      ['svg']: FileRef;
    }>;
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
  ['$(icons).iconGroups']: Array<{
    ['icons']: Array<{
      ['appliedThemes']: Array<{
        ['hexcode']: string;
        ['themeDefinition']: QueryTypes['$(theme).themeColors.id<?>'];
      }>;
      ['defaultIconTheme']: QueryTypes['$(theme).themes.id<?>'];
      ['enabledVariants']: Array<{
        ['enabled']: boolean;
        ['id']: QueryTypes['$(theme).stateVariants.id<?>'];
      }>;
      ['id']: string;
      ['name']: string;
      ['svg']: FileRef;
    }>;
    ['id']: string;
    ['name']: string;
  }>;
};


export type PointerTypes = {
  ['$(theme).themeColors.id<?>.variants.id<?>.variantDefinitions.id<?>']: `$(theme).themeColors.id<${string}>.variants.id<${QueryTypes['$(theme).stateVariants.id<?>']}>.variantDefinitions.id<${QueryTypes['$(theme).themes.id<?>']}>`;
  ['$(icons).iconGroups.id<?>.icons.id<?>.appliedThemes.hexcode<?>']: `$(icons).iconGroups.id<${string}>.icons.id<${string}>.appliedThemes.hexcode<${string}>`;
  ['$(icons).iconGroups.id<?>.icons.id<?>.enabledVariants.id<?>']: `$(icons).iconGroups.id<${string}>.icons.id<${string}>.enabledVariants.id<${QueryTypes['$(theme).stateVariants.id<?>']}>`;
  ['$(theme).themeColors.id<?>.variants.id<?>.variantDefinitions']: `$(theme).themeColors.id<${string}>.variants.id<${QueryTypes['$(theme).stateVariants.id<?>']}>.variantDefinitions`;
  ['$(icons).iconGroups.id<?>.icons.id<?>.appliedThemes']: `$(icons).iconGroups.id<${string}>.icons.id<${string}>.appliedThemes`;
  ['$(icons).iconGroups.id<?>.icons.id<?>.enabledVariants']: `$(icons).iconGroups.id<${string}>.icons.id<${string}>.enabledVariants`;
  ['$(theme).themeColors.id<?>.themeDefinitions.id<?>']: `$(theme).themeColors.id<${string}>.themeDefinitions.id<${QueryTypes['$(theme).themes.id<?>']}>`;
  ['$(theme).themeColors.id<?>.variants.id<?>']: `$(theme).themeColors.id<${string}>.variants.id<${QueryTypes['$(theme).stateVariants.id<?>']}>`;
  ['$(palette).colorPalettes.id<?>.colorShades.id<?>']: `$(palette).colorPalettes.id<${string}>.colorShades.id<${QueryTypes['$(palette).shades.id<?>']}>`;
  ['$(icons).iconGroups.id<?>.icons.id<?>']: `$(icons).iconGroups.id<${string}>.icons.id<${string}>`;
  ['$(theme).themeColors.id<?>.themeDefinitions']: `$(theme).themeColors.id<${string}>.themeDefinitions`;
  ['$(theme).themeColors.id<?>.variants']: `$(theme).themeColors.id<${string}>.variants`;
  ['$(theme).themes.id<?>.backgroundColor']: `$(theme).themes.id<${string}>.backgroundColor`;
  ['$(palette).colorPalettes.id<?>.colorShades']: `$(palette).colorPalettes.id<${string}>.colorShades`;
  ['$(icons).iconGroups.id<?>.icons']: `$(icons).iconGroups.id<${string}>.icons`;
  ['$(theme).stateVariants.id<?>']: `$(theme).stateVariants.id<${string}>`;
  ['$(theme).themeColors.id<?>']: `$(theme).themeColors.id<${string}>`;
  ['$(theme).themes.id<?>']: `$(theme).themes.id<${string}>`;
  ['$(palette).colorPalettes.id<?>']: `$(palette).colorPalettes.id<${string}>`;
  ['$(palette).shades.id<?>']: `$(palette).shades.id<${string}>`;
  ['$(icons).iconGroups.id<?>']: `$(icons).iconGroups.id<${string}>`;
  ['$(theme).stateVariants']: `$(theme).stateVariants`;
  ['$(theme).themeColors']: `$(theme).themeColors`;
  ['$(theme).themes']: `$(theme).themes`;
  ['$(palette).colorPalettes']: `$(palette).colorPalettes`;
  ['$(palette).shades']: `$(palette).shades`;
  ['$(icons).iconGroups']: `$(icons).iconGroups`;
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
  ['icons']: {
    ['iconGroups']: Array<{
      ['icons']: Array<{
        ['appliedThemes']: Array<{
          ['hexcode']: string;
          ['themeDefinition']: QueryTypes['$(theme).themeColors.id<?>'];
        }>;
        ['defaultIconTheme']: QueryTypes['$(theme).themes.id<?>'];
        ['enabledVariants']: Array<{
          ['enabled']: boolean;
          ['id']: QueryTypes['$(theme).stateVariants.id<?>'];
        }>;
        ['id']: string;
        ['name']: string;
        ['svg']: FileRef;
      }>;
      ['id']: string;
      ['name']: string;
    }>;
  };
};



type ValueOf<T> = T[keyof T];

interface Packet {
  id: number;
  chunk: string;
  index: number;
  totalPackets: number;
  pluginName: string;
}

interface PluginState {
  commandMode: "view" | "edit" | "compare";
  compareFrom: "none" | "before" | "after";
  themeName: "light" | "dark";
  applicationState: SchemaRoot | null;
  apiStoreInvalidity: {[key: string]: Array<string>};
  conflictList: Array<string>;
  changeset: Array<string>;
  binaryUrls: {
    upload: null|string,
    download: null|string,
    binaryToken: null|string,
  };
  binaryMap: {[key: string]: string};
  isCopyMode: boolean;
  copyList: Array<ValueOf<QueryTypes>>;
  rootSchemaMap: TypeStruct;
  clientStorage: object;
}

interface IFloroContext {
  commandMode: "view" | "edit" | "compare";
  compareFrom: "none" | "before" | "after";
  applicationState: SchemaRoot | null;
  currentPluginAppState: React.MutableRefObject<SchemaRoot|null>,
  changeset: Set<string>;
  apiStoreInvalidity: {[key: string]: Array<string>};
  apiStoreInvaliditySets: {[key: string]: Set<string>};
  conflictSet: Set<string>;
  hasLoaded: boolean;
  saveState: <T extends keyof SchemaRoot>(pluginName: T, state: SchemaRoot|null) => number | null;
  setPluginState: (state: PluginState) => void;
  saveCopyList: (copyList: Array<ValueOf<QueryTypes>>) => void;
  saveClientStorage: (_: object) => void;
  clearClientStorage: () => void;
  isCopyMode: boolean;
  copyList: Array<ValueOf<QueryTypes>>;
  pluginState: PluginState;
  clientStorage: object;
  lastEditKey: React.MutableRefObject<string|null>
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
  saveCopyList: (_copyList: Array<ValueOf<QueryTypes>>) => {},
  saveClientStorage: (_storage: object) => {},
  clearClientStorage: () => {},
  isCopyMode: false,
  copyList: [],
  pathKeys: [],
  rootSchemaMap: {},
  clientStorage: {},
  lastEditKey: { current: null},
  currentPluginAppState: { current: null},
  pluginState: {
    commandMode: "view",
    compareFrom: "none",
    themeName: "light",
    isCopyMode: false,
    copyList: [],
    pathKeys: [],
    applicationState: null,
    apiStoreInvalidity: {},
    conflictList: [],
    changeset: [],
    binaryUrls: {
      upload: null,
      download: null,
      binaryToken: null,
    },
    binaryMap: {},
    rootSchemaMap: {},
    clientStorage: {},
  },
} as IFloroContext);

export interface Props {
  children: React.ReactElement;
}

const MAX_DATA_SIZE = 10_000;
const sendMessagetoParent = (id: number, pluginName: string|null, command: string, data: object) => {
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
    themeName: "light",
    applicationState: null,
    apiStoreInvalidity: {},
    conflictList: [],
    changeset: [],
    binaryUrls: {
      upload: null,
      download: null,
      binaryToken: null,
    },
    binaryMap: {},
    isCopyMode: false,
    copyList: [],
    rootSchemaMap: {},
    clientStorage: {}
  });
  const currentPluginAppState = useRef<PluginState["applicationState"]>({...pluginState.applicationState} as PluginState["applicationState"]);
  const currentClientStorage = useRef<object>({...pluginState.clientStorage});
  const rootSchemaMap = useRef(pluginState.rootSchemaMap);
  const [hasLoaded, setHasLoaded] = useState(false);
  const ids = useRef<Set<number>>(new Set());
  const [copyList, setCopyList] = useState<Array<ValueOf<QueryTypes>>>([]);
  const updateTimeout = useRef<NodeJS.Timeout>();
  const lastEditKey = useRef<string|null>(null);
  const currentPluginState = useRef<PluginState>(pluginState);

  useEffect(() => {
    currentPluginState.current = pluginState;
  }, [pluginState])

  useEffect(() => {
    setCopyList(pluginState?.copyList);
  }, [pluginState?.isCopyMode])

  const incoming = useRef<{[id: number]: {
    data: Array<string>,
    counter: number
  }}>({});
  const updateCounter = useRef(1);

  const commandMode = useMemo(() => {
    return pluginState.commandMode;
  }, [pluginState.commandMode]);

  const commandModeRef = useRef(commandMode);

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
    <T extends keyof SchemaRoot>(pluginName: T, state: SchemaRoot|null): number | null => {
      if (commandMode != "edit") {
        return null;
      }
      if (state == null || state[pluginName] == null) {
        return null;
      }
      clearTimeout(updateTimeout.current);
      if (ids.current) {
        updateCounter.current += 2;
        const id = updateCounter.current;
        ids.current = new Set([...Array.from(ids.current), id]);
        setTimeout(() => {
          sendMessagetoParent(id, pluginName, "save", state[pluginName]);
        }, 0);
        return id;
      }
      return null;
    },
    [commandMode]
  );

  const saveCopyList = useCallback((copyList: Array<ValueOf<QueryTypes>>) => {
    if (!pluginState.isCopyMode) {
      return;
    }
    clearTimeout(updateTimeout.current);
    setCopyList(copyList);
    if (ids.current) {
      updateCounter.current += 2;
      const id = updateCounter.current;
      ids.current = new Set([...Array.from(ids.current), id]);
      setTimeout(() => {
        sendMessagetoParent(id, null, "update-copy", copyList);
      }, 0);
      return id;
    }
      return null;
  }, [pluginState.isCopyMode])


  const saveClientStorage = useCallback((clientStorage: object) => {
    clearTimeout(updateTimeout.current);
    if (ids.current) {
      updateCounter.current += 2;
      const id = updateCounter.current;
      ids.current = new Set([...Array.from(ids.current), id]);
      currentClientStorage.current = {...clientStorage};
      setTimeout(() => {
        sendMessagetoParent(id, null, "update-client-storage", clientStorage);
      }, 0);
      return id;
    }
    return null;
  }, [commandMode, pluginState]);


  const clearClientStorage = useCallback(() => {
    if (ids.current) {
      currentClientStorage.current = {};
      window.parent?.postMessage("clear-client-storage", "*");
      setPluginState({
        ...pluginState,
        clientStorage: {}
      })
    }
    return null;
  }, [pluginState]);

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
            rootSchemaMap.current = state.rootSchemaMap;
            setPluginState(state);
            currentPluginAppState.current = state.applicationState;
            commandModeRef.current = state.commandMode;
            setHasLoaded(true);
        }
        if (response.event == "ack" || response.event == "update") {
            clearTimeout(updateTimeout.current);
              const isStale = updateCounter?.current > data.id;
              const state: PluginState = response.data as PluginState;
              if (currentPluginAppState.current && state.applicationState) {
                const nextApplicationState = getNextApplicationState(
                  currentPluginAppState.current,
                  state.applicationState,
                  state.rootSchemaMap,
                  lastEditKey,
                  isStale
                );
                const didChangeStorage = JSON.stringify(state.clientStorage) !=
                    JSON.stringify(currentClientStorage.current);
                const nextClientStorage =
                  didChangeStorage
                    ? state.clientStorage
                    : { ...currentClientStorage.current };
                const nextState = {
                  ...state,
                  applicationState: nextApplicationState ? nextApplicationState : currentClientStorage.current as SchemaRoot,
                  clientStorage: nextClientStorage
                }
                rootSchemaMap.current = state.rootSchemaMap;
                currentPluginAppState.current = nextState.applicationState;
                currentClientStorage.current = {...nextClientStorage};
                commandModeRef.current = state.commandMode;
                if (nextState.applicationState) {
                  setPluginState(nextState);
                }
                updateTimeout.current = setTimeout(() => {
                  lastEditKey.current = null;
                }, 200);
              }
        }
        for (const id in incoming.current) {
          const idInt = parseInt(id);
          if (idInt < (updateCounter?.current ?? 0)) {
              delete incoming.current[data.id];
              ids.current.delete(idInt);
          }
        }
      }
      if (data.id > updateCounter.current) {
        updateCounter.current = data.id + 1;
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
        currentPluginAppState,
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
        clientStorage: pluginState.clientStorage,
        saveCopyList,
        saveClientStorage,
        clearClientStorage,
        isCopyMode: pluginState.isCopyMode,
        copyList,
        lastEditKey
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

export const useCopyApi = (pointer: ValueOf<QueryTypes>|null) => {
  const { copyList, saveCopyList, isCopyMode } = useFloroContext();
  const isCopied = useMemo(() => {
    if (!pointer) {
      return false;
    }
    return copyList.includes(pointer);
  }, [copyList, pointer]);

  const toggleCopy = useCallback(() => {
    if (!isCopyMode || !pointer) {
      return;
    }
    if (!isCopied) {
      const nextList = [...copyList, pointer];
      saveCopyList(nextList);
    } else {
      const nextList = copyList.filter(copiedPointer => copiedPointer != pointer);
      saveCopyList(nextList);
    }
  }, [isCopied, isCopyMode, copyList, pointer])
  return {
    isCopied,
    toggleCopy
  }
}

export const useClientStorageApi = <T,> (clientStorageKey: string): [T|null, (value: T|null) => void, () => void] => {
  const { clientStorage, saveClientStorage, pluginState, setPluginState, commandMode } = useFloroContext();

  const value = useMemo((): T|null => {
    return clientStorage?.[clientStorageKey] ?? null
  }, [clientStorageKey, clientStorage?.[clientStorageKey], commandMode]);
  const [getter, setter] = useState<T|null>(value);
  const timeout = useRef<NodeJS.Timeout>();
  useEffect(() => {
    clearTimeout(timeout?.current);
    timeout.current = setTimeout(() => {
      if (value != getter) {
        setter(value);
      }
    }, 300);
    return () => {
      clearTimeout(timeout.current);
    }
  }, [value])

  const set = useCallback((value: T|null) => {
    const next = {
      ...clientStorage,
      [clientStorageKey]: value
    };
    setter(value);
    saveClientStorage(next)
  }, [clientStorage, clientStorageKey, pluginState, commandMode, setPluginState, saveClientStorage]);

  const remove = useCallback(() => {
    const next = {
      ...clientStorage,
    };
    delete next[clientStorageKey];
    setter(null);
    saveClientStorage(next)
  }, [clientStorage, clientStorageKey, pluginState, commandMode, setPluginState, saveClientStorage]);

  return [getter, set, remove];
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


export type StringDiff = {
  add: {
    [key: number]: string;
  };
  remove: {
    [key: number]: string;
  };
};

export type Diff = {
  add: {
    [key: string]: DiffElement;
  };
  remove: {
    [key: string]: DiffElement;
  };
};

export interface DiffElement {
  key: string;
  value: any;
}

const fastHash = (str: string) => {
  let hash = 0;
  let hash2 = 0;
  for (let i = 0; i < str.length; i++) {
    hash = (hash * hash2) ^ ((hash << 5) - hash + str.charCodeAt(i));
    hash2 = (hash2 << 5) - hash + str.charCodeAt(i);
    hash |= 0;
    hash2 |= 0;
  }
  return hash.toString(36).padEnd(6) + hash2.toString(36).padEnd(6);
};

export const getLCS = (
  left: Array<string>,
  right: Array<string>
): Array<string> => {
  const diff = mdiff(left, right);
  const lcs = diff.getLcs();
  return lcs ?? [];
};

export const getArrayStringDiff = (
  past: Array<string>,
  present: Array<string>
): StringDiff => {
  const longestSequence = getLCS(past, present);

  let diff = {
    add: {},
    remove: {},
  };

  for (let i = 0, removeIndex = 0; i < past.length; ++i) {
    if (longestSequence[removeIndex] == past[i]) {
      removeIndex++;
    } else {
      diff.remove[i] = past[i];
    }
  }

  for (let i = 0, addIndex = 0; i < present.length; ++i) {
    if (longestSequence[addIndex] == present[i]) {
      addIndex++;
    } else {
      diff.add[i] = present[i];
    }
  }
  return diff;
};

export const getRowHash = (obj: {
  key: string;
  value: {
    [key: string]: number | string | boolean | Array<number | string | boolean>;
  };
}): string => {
  return fastHash(obj.key + JSON.stringify(obj.value));
};

export const getDiff = (
  before: Array<DiffElement>,
  after: Array<DiffElement>
): Diff => {
  const past = before.map(getRowHash);
  const present = after.map(getRowHash);
  const longestSequence = getLCS(past, present);
  let removeIndex = 0;
  let diff = {
    add: {},
    remove: {},
  };
  for (let i = 0; i < past.length; ++i) {
    if (longestSequence[removeIndex] == past[i]) {
      removeIndex++;
    } else {
      diff.remove[i] = before[i];
    }
  }

  let addIndex = 0;
  for (let i = 0; i < present.length; ++i) {
    if (longestSequence[addIndex] == present[i]) {
      addIndex++;
    } else {
      diff.add[i] = after[i];
    }
  }
  return diff;
};

export interface ManifestNode {
  type: string;
  isKey?: boolean;
  values?: string | TypeStruct;
  ref?: string;
  refKeyType?: string;
  refType?: string;
  nullable?: boolean;
  emptyable?: boolean;
  bounded?: boolean;
  manualOrdering?: boolean;
  onDelete?: "delete" | "nullify";
  default?: unknown|Array<unknown>;
}

export interface TypeStruct {
  [key: string]: ManifestNode | TypeStruct;
}

export interface Manifest {
  version: string;
  name: string;
  displayName: string;
  description?: string;
  codeDocsUrl?: string;
  codeRepoUrl?: string;
  managedCopy?: boolean;
  icon:
    | string
    | {
        light: string;
        dark: string;
        selected?:
          | string
          | {
              dark?: string;
              light?: string;
            };
      };
  imports: {
    [name: string]: string;
  };
  types: TypeStruct;
  store: TypeStruct;
  seed?: unknown;
}

const primitives = new Set(["int", "float", "boolean", "string", "file"]);

const writePathString = (
  pathParts: Array<DiffElement | string>
): string => {
  return pathParts
    .map((part) => {
      if (typeof part == "string") {
        return part;
      }
      return `${part.key}<${part.value}>`;
    })
    .join(".");
};

const generateKVFromStateWithRootSchema = (
  rootSchema: TypeStruct,
  pluginName: string,
  state: object
): Array<DiffElement> => {
  const flattenedState = flattenStateToSchemaPathKV(
    rootSchema as unknown as Manifest,
    state,
    [`$(${pluginName})`]
  );
  return (
    flattenedState?.map?.(({ key, value }) => {
      return {
        key: writePathString(key as unknown as Array<string | DiffElement>),
        value,
      };
    }) ?? []
  );
};

const generateKVState = (
  rootSchema: TypeStruct,
  state: object
) => {
  const out:Array<DiffElement> = [];
  for (const pluginName in rootSchema) {
    out.push(
      ...generateKVFromStateWithRootSchema(
        rootSchema[pluginName] as TypeStruct,
        pluginName,
        state[pluginName]
      )
    );
  }
  return out;
}

const getStateId = (schema: TypeStruct, state: object): string => {
  const hashPairs: Array<DiffElement> = [];
  const sortedProps = Object.keys(schema).sort();
  for (const prop of sortedProps) {
    if (!schema[prop].type) {
      hashPairs.push({
        key: prop,
        value: getStateId(schema[prop] as TypeStruct, state[prop]),
      });
    }
    if (primitives.has(schema[prop].type as string)) {
      hashPairs.push({
        key: prop,
        value: fastHash(`${state[prop]}`),
      });
    }
    if (schema[prop].type == "set" || schema[prop].type == "array") {
      hashPairs.push({
        key: prop,
        value: state[prop]?.reduce((s: string, element: object) => {
          if (
            typeof schema[prop].values == "string" &&
            primitives.has(schema[prop].values as string)
          ) {
            return fastHash(s + `${element}`);
          }
          return fastHash(
            s + getStateId(schema[prop].values as TypeStruct, element)
          );
        }, ""),
      });
    }
  }
  return fastHash(
    hashPairs.reduce((s, { key, value }) => {
      if (key == "(id)") {
        return s;
      }
      if (s == "") {
        return `${key}:${value}`;
      }
      return s + "/" + `${key}:${value}`;
    }, "")
  );
};

const flattenStateToSchemaPathKV = (
  schemaRoot: Manifest,
  state: object,
  traversalPath: Array<string | DiffElement>
): Array<{
  key: string | Array<string | DiffElement>;
  value: unknown;
}> => {
  const kv: Array<{
    key: string | Array<string | DiffElement>;
    value: unknown;
  }> = [];
  const sets: Array<string> = [];
  const arrays: Array<string> = [];
  const nestedStructures: Array<string> = [];
  const value = {};
  let primaryKey: null | DiffElement = null;
  const sortedProps = Object.keys(schemaRoot).sort();
  for (const prop of sortedProps) {
    if (schemaRoot[prop].isKey) {
      primaryKey = {
        key: prop,
        value: state[prop],
      };
    }

    if (
      schemaRoot[prop]?.type == "set" &&
      !primitives.has(schemaRoot[prop].values)
    ) {
      sets.push(prop);
      continue;
    }
    if (
      schemaRoot[prop]?.type == "array" &&
      !primitives.has(schemaRoot[prop].values)
    ) {
      arrays.push(prop);
      continue;
    }
    if (
      !primitives.has(schemaRoot[prop]?.type) &&
      !(
        (schemaRoot[prop]?.type == "array" ||
          schemaRoot[prop]?.type == "set") &&
        primitives.has(schemaRoot[prop]?.values)
      ) &&
      schemaRoot[prop]?.type != "ref"
    ) {
      nestedStructures.push(prop);
      continue;
    }
    value[prop] = state[prop];
  }

  kv.push({
    key: [...traversalPath, ...(primaryKey ? [primaryKey] : [])],
    value,
  });

  for (const prop of nestedStructures) {
    kv.push(
      ...flattenStateToSchemaPathKV(schemaRoot[prop], state[prop], [
        ...traversalPath,
        ...(primaryKey ? [primaryKey] : []),
        prop,
      ])
    );
  }
  for (const prop of arrays) {
    (state?.[prop] ?? []).forEach((element) => {
      const id = getStateId(schemaRoot[prop].values, element);
      kv.push(
        ...flattenStateToSchemaPathKV(
          schemaRoot[prop].values,
          { ...element, ["(id)"]: id },
          [
            ...traversalPath,
            ...(primaryKey ? [primaryKey] : []),
            prop
          ],
        )
      );
    });
  }
  for (const prop of sets) {
    (state?.[prop] ?? []).forEach((element) => {
      kv.push(
        ...flattenStateToSchemaPathKV(
          schemaRoot[prop].values,
          element,
          [
          ...traversalPath,
          ...(primaryKey ? [primaryKey] : []),
          prop,
        ])
      );
    });
  }
  return kv;
};

export const reIndexSchemaArrays = (kvs: Array<DiffElement>): Array<string> => {
  const out: Array<string> = [];
  const indexMap: {[path: string]: number} = {};
  for (const { key } of kvs) {
    const decodedPath = decodeSchemaPath(key);
    const parts: Array<string|DiffElement> = [];
    const indexStack: Array<number> = [];
    for (const part of decodedPath) {
      if (typeof part == "object" && part.key == "(id)") {
        const parentPathString = writePathString(parts);
        if (!indexMap[parentPathString]) {
          indexMap[parentPathString] = 0;
        } else {
          indexMap[parentPathString]++;
        }
        indexStack.push(indexMap[parentPathString])
      }
      parts.push(part);
    }
    let pathIdx = 0;
    const pathWithNumbers = decodedPath.map((part) => {
      if (typeof part == "object" && part.key == "(id)") {
        return indexStack[pathIdx++];
      }
      return part;
    });
    const arrayPath = writePathStringWithArrays(pathWithNumbers);
    out.push(arrayPath);
  }
  return out;
};

export const decodeSchemaPath = (
  pathString: string
): Array<DiffElement | string> => {
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

export const writePathStringWithArrays = (
  pathParts: Array<DiffElement | string | number>
): string => {
  return pathParts
    .map((part) => {
      if (typeof part == "string") {
        return part;
      }
      if (typeof part == "number") {
        return `[${part}]`;
      }
      return `${part.key}<${part.value}>`;
    })
    .join(".");
};

const getNextApplicationState = (currentApplicationState: {[key: string]: object}, nextApplicationState: {[key: string]: object}, rootSchemaMap: TypeStruct, lastEditKey: React.MutableRefObject<null|string>, isStale: boolean): SchemaRoot | null => {
  try {
    if (!currentApplicationState && !nextApplicationState) {
      return null;
    }
    if (!currentApplicationState) {
      return nextApplicationState as SchemaRoot;
    }
    if (!nextApplicationState) {
      return currentApplicationState as SchemaRoot;
    }
    const key = lastEditKey.current;
    const nextKV = generateKVState(rootSchemaMap, nextApplicationState);
    const currentKV = generateKVState(rootSchemaMap, currentApplicationState);
    if (key) {
      const nextReindexedKeys = reIndexSchemaArrays(nextKV);
      const currentReindexedKeys = reIndexSchemaArrays(currentKV);
      let nextKeyIndex = -1;
      for (let i = 0; i < nextReindexedKeys.length; ++i) {
        if (key.startsWith(nextReindexedKeys[i])) {
          nextKeyIndex = i;
        }
      }
      let currentKeyIndex = -1;
      for (let i = 0; i < currentReindexedKeys.length; ++i) {
        if (key.startsWith(currentReindexedKeys[i])) {
          currentKeyIndex = i;
        }
      }
      if (nextKeyIndex != -1 && currentKeyIndex != -1 && nextKeyIndex == currentKeyIndex){
        const currentKey = nextReindexedKeys[nextKeyIndex];
        const nextKey = currentReindexedKeys[currentKeyIndex];
        const object = getObjectInStateMap(currentApplicationState, currentKey + key.substring(currentKey.length));
        const nextObject = getObjectInStateMap(nextApplicationState, nextKey + key.substring(nextKey.length));
        let pastKeyCount = 0;
        let nextKeyCount = 0;
        let pastKeys = new Set<string>();
        for(let i = 0; i < currentReindexedKeys.length; ++i) {
          const k = currentReindexedKeys[i];
          pastKeys.add(k)
          pastKeyCount++;
        }
        let hasAllKeys = true;
        for(let i = 0; i < nextReindexedKeys.length; ++i) {
          const k = nextReindexedKeys[i];
          if (!pastKeys.has(k)) {
            hasAllKeys = false;
            break;
          }
          nextKeyCount++;
        }
        hasAllKeys = hasAllKeys && pastKeyCount == nextKeyCount;
        if (hasAllKeys && object && nextObject && JSON.stringify(object) != JSON.stringify(nextObject)) {
          if (isStale) {
            return currentApplicationState as SchemaRoot;
          }
          return updateObjectInStateMap(nextApplicationState, key, object) as SchemaRoot;
        }
        if (hasAllKeys && !isStale) {
          return currentApplicationState as SchemaRoot;
        }
      }
    }
    const diff = getDiff(currentKV, nextKV);
    if (Object.keys(diff.add).length == 0 && Object.keys(diff.remove).length == 0) {
      return currentApplicationState as SchemaRoot;
    }
    return nextApplicationState as SchemaRoot;
  } catch(e) {
    return nextApplicationState as SchemaRoot;
  }
}


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
  ['$(icons).iconGroups.id<?>']: `$(icons).iconGroups.id<${string}>`;
  ['$(icons).iconGroups.id<?>.icons.id<?>']: `$(icons).iconGroups.id<${string}>.icons.id<${string}>`;
  ['$(icons).iconGroups.id<?>.icons.id<?>.appliedThemes.hexcode<?>']: `$(icons).iconGroups.id<${string}>.icons.id<${string}>.appliedThemes.hexcode<${string}>`;
  ['$(icons).iconGroups.id<?>.icons.id<?>.enabledVariants.id<?>']: `$(icons).iconGroups.id<${string}>.icons.id<${string}>.enabledVariants.id<${QueryTypes['$(theme).stateVariants.id<?>']}>`;
};

export function makeQueryRef(query: '$(theme).themeColors.id<?>.variants.id<?>.variantDefinitions.id<?>', arg0: string, arg1: QueryTypes['$(theme).stateVariants.id<?>'], arg2: QueryTypes['$(theme).themes.id<?>']): QueryTypes['$(theme).themeColors.id<?>.variants.id<?>.variantDefinitions.id<?>'];
export function makeQueryRef(query: '$(icons).iconGroups.id<?>.icons.id<?>.appliedThemes.hexcode<?>', arg0: string, arg1: string, arg2: string): QueryTypes['$(icons).iconGroups.id<?>.icons.id<?>.appliedThemes.hexcode<?>'];
export function makeQueryRef(query: '$(icons).iconGroups.id<?>.icons.id<?>.enabledVariants.id<?>', arg0: string, arg1: string, arg2: QueryTypes['$(theme).stateVariants.id<?>']): QueryTypes['$(icons).iconGroups.id<?>.icons.id<?>.enabledVariants.id<?>'];
export function makeQueryRef(query: '$(theme).themeColors.id<?>.themeDefinitions.id<?>', arg0: string, arg1: QueryTypes['$(theme).themes.id<?>']): QueryTypes['$(theme).themeColors.id<?>.themeDefinitions.id<?>'];
export function makeQueryRef(query: '$(palette).colorPalettes.id<?>.colorShades.id<?>', arg0: string, arg1: QueryTypes['$(palette).shades.id<?>']): QueryTypes['$(palette).colorPalettes.id<?>.colorShades.id<?>'];
export function makeQueryRef(query: '$(theme).themeColors.id<?>.variants.id<?>', arg0: string, arg1: QueryTypes['$(theme).stateVariants.id<?>']): QueryTypes['$(theme).themeColors.id<?>.variants.id<?>'];
export function makeQueryRef(query: '$(icons).iconGroups.id<?>.icons.id<?>', arg0: string, arg1: string): QueryTypes['$(icons).iconGroups.id<?>.icons.id<?>'];
export function makeQueryRef(query: '$(palette).colorPalettes.id<?>', arg0: string): QueryTypes['$(palette).colorPalettes.id<?>'];
export function makeQueryRef(query: '$(theme).stateVariants.id<?>', arg0: string): QueryTypes['$(theme).stateVariants.id<?>'];
export function makeQueryRef(query: '$(theme).themeColors.id<?>', arg0: string): QueryTypes['$(theme).themeColors.id<?>'];
export function makeQueryRef(query: '$(icons).iconGroups.id<?>', arg0: string): QueryTypes['$(icons).iconGroups.id<?>'];
export function makeQueryRef(query: '$(palette).shades.id<?>', arg0: string): QueryTypes['$(palette).shades.id<?>'];
export function makeQueryRef(query: '$(theme).themes.id<?>', arg0: string): QueryTypes['$(theme).themes.id<?>'];
export function makeQueryRef(query: '$(theme).stateVariants.id<?>'|'$(theme).themeColors.id<?>'|'$(theme).themeColors.id<?>.themeDefinitions.id<?>'|'$(theme).themeColors.id<?>.variants.id<?>'|'$(theme).themeColors.id<?>.variants.id<?>.variantDefinitions.id<?>'|'$(theme).themes.id<?>'|'$(palette).colorPalettes.id<?>'|'$(palette).colorPalettes.id<?>.colorShades.id<?>'|'$(palette).shades.id<?>'|'$(icons).iconGroups.id<?>'|'$(icons).iconGroups.id<?>.icons.id<?>'|'$(icons).iconGroups.id<?>.icons.id<?>.appliedThemes.hexcode<?>'|'$(icons).iconGroups.id<?>.icons.id<?>.enabledVariants.id<?>', arg0: string, arg1?: QueryTypes['$(theme).themes.id<?>']|QueryTypes['$(theme).stateVariants.id<?>']|QueryTypes['$(palette).shades.id<?>']|string, arg2?: QueryTypes['$(theme).themes.id<?>']|string|QueryTypes['$(theme).stateVariants.id<?>']): QueryTypes['$(theme).stateVariants.id<?>']|QueryTypes['$(theme).themeColors.id<?>']|QueryTypes['$(theme).themeColors.id<?>.themeDefinitions.id<?>']|QueryTypes['$(theme).themeColors.id<?>.variants.id<?>']|QueryTypes['$(theme).themeColors.id<?>.variants.id<?>.variantDefinitions.id<?>']|QueryTypes['$(theme).themes.id<?>']|QueryTypes['$(palette).colorPalettes.id<?>']|QueryTypes['$(palette).colorPalettes.id<?>.colorShades.id<?>']|QueryTypes['$(palette).shades.id<?>']|QueryTypes['$(icons).iconGroups.id<?>']|QueryTypes['$(icons).iconGroups.id<?>.icons.id<?>']|QueryTypes['$(icons).iconGroups.id<?>.icons.id<?>.appliedThemes.hexcode<?>']|QueryTypes['$(icons).iconGroups.id<?>.icons.id<?>.enabledVariants.id<?>']|null {
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
  if ((arg0 != null && arg0 != undefined) && query == '$(icons).iconGroups.id<?>') {
    return `$(icons).iconGroups.id<${arg0 as string}>`;
  }
  if ((arg0 != null && arg0 != undefined) && (arg1 != null && arg1 != undefined) && query == '$(icons).iconGroups.id<?>.icons.id<?>') {
    return `$(icons).iconGroups.id<${arg0 as string}>.icons.id<${arg1 as string}>`;
  }
  if ((arg0 != null && arg0 != undefined) && (arg1 != null && arg1 != undefined) && (arg2 != null && arg2 != undefined) && query == '$(icons).iconGroups.id<?>.icons.id<?>.appliedThemes.hexcode<?>') {
    return `$(icons).iconGroups.id<${arg0 as string}>.icons.id<${arg1 as string}>.appliedThemes.hexcode<${arg2 as string}>`;
  }
  if ((arg0 != null && arg0 != undefined) && (arg1 != null && arg1 != undefined) && (arg2 != null && arg2 != undefined) && query == '$(icons).iconGroups.id<?>.icons.id<?>.enabledVariants.id<?>') {
    return `$(icons).iconGroups.id<${arg0 as string}>.icons.id<${arg1 as string}>.enabledVariants.id<${arg2 as QueryTypes['$(theme).stateVariants.id<?>']}>`;
  }
  return null;
};

export function useQueryRef(query: '$(theme).themeColors.id<?>.variants.id<?>.variantDefinitions.id<?>', arg0: string, arg1: QueryTypes['$(theme).stateVariants.id<?>'], arg2: QueryTypes['$(theme).themes.id<?>']): QueryTypes['$(theme).themeColors.id<?>.variants.id<?>.variantDefinitions.id<?>'];
export function useQueryRef(query: '$(icons).iconGroups.id<?>.icons.id<?>.appliedThemes.hexcode<?>', arg0: string, arg1: string, arg2: string): QueryTypes['$(icons).iconGroups.id<?>.icons.id<?>.appliedThemes.hexcode<?>'];
export function useQueryRef(query: '$(icons).iconGroups.id<?>.icons.id<?>.enabledVariants.id<?>', arg0: string, arg1: string, arg2: QueryTypes['$(theme).stateVariants.id<?>']): QueryTypes['$(icons).iconGroups.id<?>.icons.id<?>.enabledVariants.id<?>'];
export function useQueryRef(query: '$(theme).themeColors.id<?>.themeDefinitions.id<?>', arg0: string, arg1: QueryTypes['$(theme).themes.id<?>']): QueryTypes['$(theme).themeColors.id<?>.themeDefinitions.id<?>'];
export function useQueryRef(query: '$(palette).colorPalettes.id<?>.colorShades.id<?>', arg0: string, arg1: QueryTypes['$(palette).shades.id<?>']): QueryTypes['$(palette).colorPalettes.id<?>.colorShades.id<?>'];
export function useQueryRef(query: '$(theme).themeColors.id<?>.variants.id<?>', arg0: string, arg1: QueryTypes['$(theme).stateVariants.id<?>']): QueryTypes['$(theme).themeColors.id<?>.variants.id<?>'];
export function useQueryRef(query: '$(icons).iconGroups.id<?>.icons.id<?>', arg0: string, arg1: string): QueryTypes['$(icons).iconGroups.id<?>.icons.id<?>'];
export function useQueryRef(query: '$(palette).colorPalettes.id<?>', arg0: string): QueryTypes['$(palette).colorPalettes.id<?>'];
export function useQueryRef(query: '$(theme).stateVariants.id<?>', arg0: string): QueryTypes['$(theme).stateVariants.id<?>'];
export function useQueryRef(query: '$(theme).themeColors.id<?>', arg0: string): QueryTypes['$(theme).themeColors.id<?>'];
export function useQueryRef(query: '$(icons).iconGroups.id<?>', arg0: string): QueryTypes['$(icons).iconGroups.id<?>'];
export function useQueryRef(query: '$(palette).shades.id<?>', arg0: string): QueryTypes['$(palette).shades.id<?>'];
export function useQueryRef(query: '$(theme).themes.id<?>', arg0: string): QueryTypes['$(theme).themes.id<?>'];
export function useQueryRef(query: '$(theme).stateVariants.id<?>'|'$(theme).themeColors.id<?>'|'$(theme).themeColors.id<?>.themeDefinitions.id<?>'|'$(theme).themeColors.id<?>.variants.id<?>'|'$(theme).themeColors.id<?>.variants.id<?>.variantDefinitions.id<?>'|'$(theme).themes.id<?>'|'$(palette).colorPalettes.id<?>'|'$(palette).colorPalettes.id<?>.colorShades.id<?>'|'$(palette).shades.id<?>'|'$(icons).iconGroups.id<?>'|'$(icons).iconGroups.id<?>.icons.id<?>'|'$(icons).iconGroups.id<?>.icons.id<?>.appliedThemes.hexcode<?>'|'$(icons).iconGroups.id<?>.icons.id<?>.enabledVariants.id<?>', arg0: string, arg1?: QueryTypes['$(theme).themes.id<?>']|QueryTypes['$(theme).stateVariants.id<?>']|QueryTypes['$(palette).shades.id<?>']|string, arg2?: QueryTypes['$(theme).themes.id<?>']|string|QueryTypes['$(theme).stateVariants.id<?>']): QueryTypes['$(theme).stateVariants.id<?>']|QueryTypes['$(theme).themeColors.id<?>']|QueryTypes['$(theme).themeColors.id<?>.themeDefinitions.id<?>']|QueryTypes['$(theme).themeColors.id<?>.variants.id<?>']|QueryTypes['$(theme).themeColors.id<?>.variants.id<?>.variantDefinitions.id<?>']|QueryTypes['$(theme).themes.id<?>']|QueryTypes['$(palette).colorPalettes.id<?>']|QueryTypes['$(palette).colorPalettes.id<?>.colorShades.id<?>']|QueryTypes['$(palette).shades.id<?>']|QueryTypes['$(icons).iconGroups.id<?>']|QueryTypes['$(icons).iconGroups.id<?>.icons.id<?>']|QueryTypes['$(icons).iconGroups.id<?>.icons.id<?>.appliedThemes.hexcode<?>']|QueryTypes['$(icons).iconGroups.id<?>.icons.id<?>.enabledVariants.id<?>']|null {
  return useMemo(() => {
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
    if (query == '$(palette).colorPalettes.id<?>') {
      return makeQueryRef(query, arg0 as string);
    }
    if (query == '$(palette).colorPalettes.id<?>.colorShades.id<?>') {
      return makeQueryRef(query, arg0 as string, arg1 as QueryTypes['$(palette).shades.id<?>']);
    }
    if (query == '$(palette).shades.id<?>') {
      return makeQueryRef(query, arg0 as string);
    }
    if (query == '$(icons).iconGroups.id<?>') {
      return makeQueryRef(query, arg0 as string);
    }
    if (query == '$(icons).iconGroups.id<?>.icons.id<?>') {
      return makeQueryRef(query, arg0 as string, arg1 as string);
    }
    if (query == '$(icons).iconGroups.id<?>.icons.id<?>.appliedThemes.hexcode<?>') {
      return makeQueryRef(query, arg0 as string, arg1 as string, arg2 as string);
    }
    if (query == '$(icons).iconGroups.id<?>.icons.id<?>.enabledVariants.id<?>') {
      return makeQueryRef(query, arg0 as string, arg1 as string, arg2 as QueryTypes['$(theme).stateVariants.id<?>']);
    }
    return null;
  }, [query, arg0, arg1, arg2]);
};

export function extractQueryArgs(query?: QueryTypes['$(theme).themeColors.id<?>.variants.id<?>.variantDefinitions.id<?>']): [string, QueryTypes['$(theme).stateVariants.id<?>'], QueryTypes['$(theme).themes.id<?>']];
export function extractQueryArgs(query?: QueryTypes['$(icons).iconGroups.id<?>.icons.id<?>.appliedThemes.hexcode<?>']): [string, string, string];
export function extractQueryArgs(query?: QueryTypes['$(icons).iconGroups.id<?>.icons.id<?>.enabledVariants.id<?>']): [string, string, QueryTypes['$(theme).stateVariants.id<?>']];
export function extractQueryArgs(query?: QueryTypes['$(theme).themeColors.id<?>.themeDefinitions.id<?>']): [string, QueryTypes['$(theme).themes.id<?>']];
export function extractQueryArgs(query?: QueryTypes['$(palette).colorPalettes.id<?>.colorShades.id<?>']): [string, QueryTypes['$(palette).shades.id<?>']];
export function extractQueryArgs(query?: QueryTypes['$(theme).themeColors.id<?>.variants.id<?>']): [string, QueryTypes['$(theme).stateVariants.id<?>']];
export function extractQueryArgs(query?: QueryTypes['$(icons).iconGroups.id<?>.icons.id<?>']): [string, string];
export function extractQueryArgs(query?: QueryTypes['$(palette).colorPalettes.id<?>']): [string];
export function extractQueryArgs(query?: QueryTypes['$(theme).stateVariants.id<?>']): [string];
export function extractQueryArgs(query?: QueryTypes['$(theme).themeColors.id<?>']): [string];
export function extractQueryArgs(query?: QueryTypes['$(icons).iconGroups.id<?>']): [string];
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
export function useExtractQueryArgs(query?: QueryTypes['$(icons).iconGroups.id<?>.icons.id<?>.appliedThemes.hexcode<?>']): [string, string, string];
export function useExtractQueryArgs(query?: QueryTypes['$(icons).iconGroups.id<?>.icons.id<?>.enabledVariants.id<?>']): [string, string, QueryTypes['$(theme).stateVariants.id<?>']];
export function useExtractQueryArgs(query?: QueryTypes['$(theme).themeColors.id<?>.themeDefinitions.id<?>']): [string, QueryTypes['$(theme).themes.id<?>']];
export function useExtractQueryArgs(query?: QueryTypes['$(palette).colorPalettes.id<?>.colorShades.id<?>']): [string, QueryTypes['$(palette).shades.id<?>']];
export function useExtractQueryArgs(query?: QueryTypes['$(theme).themeColors.id<?>.variants.id<?>']): [string, QueryTypes['$(theme).stateVariants.id<?>']];
export function useExtractQueryArgs(query?: QueryTypes['$(icons).iconGroups.id<?>.icons.id<?>']): [string, string];
export function useExtractQueryArgs(query?: QueryTypes['$(palette).colorPalettes.id<?>']): [string];
export function useExtractQueryArgs(query?: QueryTypes['$(theme).stateVariants.id<?>']): [string];
export function useExtractQueryArgs(query?: QueryTypes['$(theme).themeColors.id<?>']): [string];
export function useExtractQueryArgs(query?: QueryTypes['$(icons).iconGroups.id<?>']): [string];
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

export function getPluginStore(plugin: 'theme'): SchemaRoot['theme'];
export function getPluginStore(plugin: 'palette'): SchemaRoot['palette'];
export function getPluginStore(plugin: 'icons'): SchemaRoot['icons'];
export function getPluginStore(plugin: 'theme'|'palette'|'icons'): SchemaRoot['theme']|SchemaRoot['palette']|SchemaRoot['icons'] {
  const ctx = useFloroContext();
  const root = ctx.applicationState;
  if (root == null) {
    return {} as SchemaRoot['theme']|SchemaRoot['palette']|SchemaRoot['icons'];
  }
  return root[plugin];
}

export function usePluginStore(plugin: 'theme'): SchemaRoot['theme'];
export function usePluginStore(plugin: 'palette'): SchemaRoot['palette'];
export function usePluginStore(plugin: 'icons'): SchemaRoot['icons'];
export function usePluginStore(plugin: 'theme'|'palette'|'icons'): SchemaRoot['theme']|SchemaRoot['palette']|SchemaRoot['icons'] {
  const ctx = useFloroContext();
  const root = ctx.applicationState;
  return useMemo(() => {
    if (root == null) {
      return {} as SchemaRoot['theme']|SchemaRoot['palette']|SchemaRoot['icons'];
    }
    return root[plugin];
  }, [root, plugin]);
}

export function getReferencedObject(root: SchemaRoot, query?: PointerTypes['$(theme).themeColors.id<?>.variants.id<?>.variantDefinitions.id<?>']): SchemaTypes['$(theme).themeColors.id<?>.variants.id<?>.variantDefinitions.id<?>'];
export function getReferencedObject(root: SchemaRoot, query?: PointerTypes['$(icons).iconGroups.id<?>.icons.id<?>.appliedThemes.hexcode<?>']): SchemaTypes['$(icons).iconGroups.id<?>.icons.id<?>.appliedThemes.hexcode<?>'];
export function getReferencedObject(root: SchemaRoot, query?: PointerTypes['$(icons).iconGroups.id<?>.icons.id<?>.enabledVariants.id<?>']): SchemaTypes['$(icons).iconGroups.id<?>.icons.id<?>.enabledVariants.id<?>'];
export function getReferencedObject(root: SchemaRoot, query?: PointerTypes['$(theme).themeColors.id<?>.variants.id<?>.variantDefinitions']): SchemaTypes['$(theme).themeColors.id<?>.variants.id<?>.variantDefinitions'];
export function getReferencedObject(root: SchemaRoot, query?: PointerTypes['$(icons).iconGroups.id<?>.icons.id<?>.appliedThemes']): SchemaTypes['$(icons).iconGroups.id<?>.icons.id<?>.appliedThemes'];
export function getReferencedObject(root: SchemaRoot, query?: PointerTypes['$(icons).iconGroups.id<?>.icons.id<?>.enabledVariants']): SchemaTypes['$(icons).iconGroups.id<?>.icons.id<?>.enabledVariants'];
export function getReferencedObject(root: SchemaRoot, query?: PointerTypes['$(theme).themeColors.id<?>.themeDefinitions.id<?>']): SchemaTypes['$(theme).themeColors.id<?>.themeDefinitions.id<?>'];
export function getReferencedObject(root: SchemaRoot, query?: PointerTypes['$(theme).themeColors.id<?>.variants.id<?>']): SchemaTypes['$(theme).themeColors.id<?>.variants.id<?>'];
export function getReferencedObject(root: SchemaRoot, query?: PointerTypes['$(palette).colorPalettes.id<?>.colorShades.id<?>']): SchemaTypes['$(palette).colorPalettes.id<?>.colorShades.id<?>'];
export function getReferencedObject(root: SchemaRoot, query?: PointerTypes['$(icons).iconGroups.id<?>.icons.id<?>']): SchemaTypes['$(icons).iconGroups.id<?>.icons.id<?>'];
export function getReferencedObject(root: SchemaRoot, query?: PointerTypes['$(theme).themeColors.id<?>.themeDefinitions']): SchemaTypes['$(theme).themeColors.id<?>.themeDefinitions'];
export function getReferencedObject(root: SchemaRoot, query?: PointerTypes['$(theme).themeColors.id<?>.variants']): SchemaTypes['$(theme).themeColors.id<?>.variants'];
export function getReferencedObject(root: SchemaRoot, query?: PointerTypes['$(theme).themes.id<?>.backgroundColor']): SchemaTypes['$(theme).themes.id<?>.backgroundColor'];
export function getReferencedObject(root: SchemaRoot, query?: PointerTypes['$(palette).colorPalettes.id<?>.colorShades']): SchemaTypes['$(palette).colorPalettes.id<?>.colorShades'];
export function getReferencedObject(root: SchemaRoot, query?: PointerTypes['$(icons).iconGroups.id<?>.icons']): SchemaTypes['$(icons).iconGroups.id<?>.icons'];
export function getReferencedObject(root: SchemaRoot, query?: PointerTypes['$(theme).stateVariants.id<?>']): SchemaTypes['$(theme).stateVariants.id<?>'];
export function getReferencedObject(root: SchemaRoot, query?: PointerTypes['$(theme).themeColors.id<?>']): SchemaTypes['$(theme).themeColors.id<?>'];
export function getReferencedObject(root: SchemaRoot, query?: PointerTypes['$(theme).themes.id<?>']): SchemaTypes['$(theme).themes.id<?>'];
export function getReferencedObject(root: SchemaRoot, query?: PointerTypes['$(palette).colorPalettes.id<?>']): SchemaTypes['$(palette).colorPalettes.id<?>'];
export function getReferencedObject(root: SchemaRoot, query?: PointerTypes['$(palette).shades.id<?>']): SchemaTypes['$(palette).shades.id<?>'];
export function getReferencedObject(root: SchemaRoot, query?: PointerTypes['$(icons).iconGroups.id<?>']): SchemaTypes['$(icons).iconGroups.id<?>'];
export function getReferencedObject(root: SchemaRoot, query?: PointerTypes['$(theme).stateVariants']): SchemaTypes['$(theme).stateVariants'];
export function getReferencedObject(root: SchemaRoot, query?: PointerTypes['$(theme).themeColors']): SchemaTypes['$(theme).themeColors'];
export function getReferencedObject(root: SchemaRoot, query?: PointerTypes['$(theme).themes']): SchemaTypes['$(theme).themes'];
export function getReferencedObject(root: SchemaRoot, query?: PointerTypes['$(palette).colorPalettes']): SchemaTypes['$(palette).colorPalettes'];
export function getReferencedObject(root: SchemaRoot, query?: PointerTypes['$(palette).shades']): SchemaTypes['$(palette).shades'];
export function getReferencedObject(root: SchemaRoot, query?: PointerTypes['$(icons).iconGroups']): SchemaTypes['$(icons).iconGroups'];

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
export function useReferencedObject(query?: PointerTypes['$(icons).iconGroups.id<?>.icons.id<?>.appliedThemes.hexcode<?>']): SchemaTypes['$(icons).iconGroups.id<?>.icons.id<?>.appliedThemes.hexcode<?>'];
export function useReferencedObject(query?: PointerTypes['$(icons).iconGroups.id<?>.icons.id<?>.enabledVariants.id<?>']): SchemaTypes['$(icons).iconGroups.id<?>.icons.id<?>.enabledVariants.id<?>'];
export function useReferencedObject(query?: PointerTypes['$(theme).themeColors.id<?>.variants.id<?>.variantDefinitions']): SchemaTypes['$(theme).themeColors.id<?>.variants.id<?>.variantDefinitions'];
export function useReferencedObject(query?: PointerTypes['$(icons).iconGroups.id<?>.icons.id<?>.appliedThemes']): SchemaTypes['$(icons).iconGroups.id<?>.icons.id<?>.appliedThemes'];
export function useReferencedObject(query?: PointerTypes['$(icons).iconGroups.id<?>.icons.id<?>.enabledVariants']): SchemaTypes['$(icons).iconGroups.id<?>.icons.id<?>.enabledVariants'];
export function useReferencedObject(query?: PointerTypes['$(theme).themeColors.id<?>.themeDefinitions.id<?>']): SchemaTypes['$(theme).themeColors.id<?>.themeDefinitions.id<?>'];
export function useReferencedObject(query?: PointerTypes['$(theme).themeColors.id<?>.variants.id<?>']): SchemaTypes['$(theme).themeColors.id<?>.variants.id<?>'];
export function useReferencedObject(query?: PointerTypes['$(palette).colorPalettes.id<?>.colorShades.id<?>']): SchemaTypes['$(palette).colorPalettes.id<?>.colorShades.id<?>'];
export function useReferencedObject(query?: PointerTypes['$(icons).iconGroups.id<?>.icons.id<?>']): SchemaTypes['$(icons).iconGroups.id<?>.icons.id<?>'];
export function useReferencedObject(query?: PointerTypes['$(theme).themeColors.id<?>.themeDefinitions']): SchemaTypes['$(theme).themeColors.id<?>.themeDefinitions'];
export function useReferencedObject(query?: PointerTypes['$(theme).themeColors.id<?>.variants']): SchemaTypes['$(theme).themeColors.id<?>.variants'];
export function useReferencedObject(query?: PointerTypes['$(theme).themes.id<?>.backgroundColor']): SchemaTypes['$(theme).themes.id<?>.backgroundColor'];
export function useReferencedObject(query?: PointerTypes['$(palette).colorPalettes.id<?>.colorShades']): SchemaTypes['$(palette).colorPalettes.id<?>.colorShades'];
export function useReferencedObject(query?: PointerTypes['$(icons).iconGroups.id<?>.icons']): SchemaTypes['$(icons).iconGroups.id<?>.icons'];
export function useReferencedObject(query?: PointerTypes['$(theme).stateVariants.id<?>']): SchemaTypes['$(theme).stateVariants.id<?>'];
export function useReferencedObject(query?: PointerTypes['$(theme).themeColors.id<?>']): SchemaTypes['$(theme).themeColors.id<?>'];
export function useReferencedObject(query?: PointerTypes['$(theme).themes.id<?>']): SchemaTypes['$(theme).themes.id<?>'];
export function useReferencedObject(query?: PointerTypes['$(palette).colorPalettes.id<?>']): SchemaTypes['$(palette).colorPalettes.id<?>'];
export function useReferencedObject(query?: PointerTypes['$(palette).shades.id<?>']): SchemaTypes['$(palette).shades.id<?>'];
export function useReferencedObject(query?: PointerTypes['$(icons).iconGroups.id<?>']): SchemaTypes['$(icons).iconGroups.id<?>'];
export function useReferencedObject(query?: PointerTypes['$(theme).stateVariants']): SchemaTypes['$(theme).stateVariants'];
export function useReferencedObject(query?: PointerTypes['$(theme).themeColors']): SchemaTypes['$(theme).themeColors'];
export function useReferencedObject(query?: PointerTypes['$(theme).themes']): SchemaTypes['$(theme).themes'];
export function useReferencedObject(query?: PointerTypes['$(palette).colorPalettes']): SchemaTypes['$(palette).colorPalettes'];
export function useReferencedObject(query?: PointerTypes['$(palette).shades']): SchemaTypes['$(palette).shades'];
export function useReferencedObject(query?: PointerTypes['$(icons).iconGroups']): SchemaTypes['$(icons).iconGroups'];

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

export function useFloroState(query: PointerTypes['$(theme).themeColors.id<?>.variants.id<?>.variantDefinitions.id<?>'], defaultData?: SchemaTypes['$(theme).themeColors.id<?>.variants.id<?>.variantDefinitions.id<?>']): [SchemaTypes['$(theme).themeColors.id<?>.variants.id<?>.variantDefinitions.id<?>']|null, (t: SchemaTypes['$(theme).themeColors.id<?>.variants.id<?>.variantDefinitions.id<?>'], doSave?: boolean) => void, () => void];
export function useFloroState(query: PointerTypes['$(icons).iconGroups.id<?>.icons.id<?>.appliedThemes.hexcode<?>'], defaultData?: SchemaTypes['$(icons).iconGroups.id<?>.icons.id<?>.appliedThemes.hexcode<?>']): [SchemaTypes['$(icons).iconGroups.id<?>.icons.id<?>.appliedThemes.hexcode<?>']|null, (t: SchemaTypes['$(icons).iconGroups.id<?>.icons.id<?>.appliedThemes.hexcode<?>'], doSave?: boolean) => void, () => void];
export function useFloroState(query: PointerTypes['$(icons).iconGroups.id<?>.icons.id<?>.enabledVariants.id<?>'], defaultData?: SchemaTypes['$(icons).iconGroups.id<?>.icons.id<?>.enabledVariants.id<?>']): [SchemaTypes['$(icons).iconGroups.id<?>.icons.id<?>.enabledVariants.id<?>']|null, (t: SchemaTypes['$(icons).iconGroups.id<?>.icons.id<?>.enabledVariants.id<?>'], doSave?: boolean) => void, () => void];
export function useFloroState(query: PointerTypes['$(theme).themeColors.id<?>.variants.id<?>.variantDefinitions'], defaultData?: SchemaTypes['$(theme).themeColors.id<?>.variants.id<?>.variantDefinitions']): [SchemaTypes['$(theme).themeColors.id<?>.variants.id<?>.variantDefinitions']|null, (t: SchemaTypes['$(theme).themeColors.id<?>.variants.id<?>.variantDefinitions'], doSave?: boolean) => void, () => void];
export function useFloroState(query: PointerTypes['$(icons).iconGroups.id<?>.icons.id<?>.appliedThemes'], defaultData?: SchemaTypes['$(icons).iconGroups.id<?>.icons.id<?>.appliedThemes']): [SchemaTypes['$(icons).iconGroups.id<?>.icons.id<?>.appliedThemes']|null, (t: SchemaTypes['$(icons).iconGroups.id<?>.icons.id<?>.appliedThemes'], doSave?: boolean) => void, () => void];
export function useFloroState(query: PointerTypes['$(icons).iconGroups.id<?>.icons.id<?>.enabledVariants'], defaultData?: SchemaTypes['$(icons).iconGroups.id<?>.icons.id<?>.enabledVariants']): [SchemaTypes['$(icons).iconGroups.id<?>.icons.id<?>.enabledVariants']|null, (t: SchemaTypes['$(icons).iconGroups.id<?>.icons.id<?>.enabledVariants'], doSave?: boolean) => void, () => void];
export function useFloroState(query: PointerTypes['$(theme).themeColors.id<?>.themeDefinitions.id<?>'], defaultData?: SchemaTypes['$(theme).themeColors.id<?>.themeDefinitions.id<?>']): [SchemaTypes['$(theme).themeColors.id<?>.themeDefinitions.id<?>']|null, (t: SchemaTypes['$(theme).themeColors.id<?>.themeDefinitions.id<?>'], doSave?: boolean) => void, () => void];
export function useFloroState(query: PointerTypes['$(theme).themeColors.id<?>.variants.id<?>'], defaultData?: SchemaTypes['$(theme).themeColors.id<?>.variants.id<?>']): [SchemaTypes['$(theme).themeColors.id<?>.variants.id<?>']|null, (t: SchemaTypes['$(theme).themeColors.id<?>.variants.id<?>'], doSave?: boolean) => void, () => void];
export function useFloroState(query: PointerTypes['$(palette).colorPalettes.id<?>.colorShades.id<?>'], defaultData?: SchemaTypes['$(palette).colorPalettes.id<?>.colorShades.id<?>']): [SchemaTypes['$(palette).colorPalettes.id<?>.colorShades.id<?>']|null, (t: SchemaTypes['$(palette).colorPalettes.id<?>.colorShades.id<?>'], doSave?: boolean) => void, () => void];
export function useFloroState(query: PointerTypes['$(icons).iconGroups.id<?>.icons.id<?>'], defaultData?: SchemaTypes['$(icons).iconGroups.id<?>.icons.id<?>']): [SchemaTypes['$(icons).iconGroups.id<?>.icons.id<?>']|null, (t: SchemaTypes['$(icons).iconGroups.id<?>.icons.id<?>'], doSave?: boolean) => void, () => void];
export function useFloroState(query: PointerTypes['$(theme).themeColors.id<?>.themeDefinitions'], defaultData?: SchemaTypes['$(theme).themeColors.id<?>.themeDefinitions']): [SchemaTypes['$(theme).themeColors.id<?>.themeDefinitions']|null, (t: SchemaTypes['$(theme).themeColors.id<?>.themeDefinitions'], doSave?: boolean) => void, () => void];
export function useFloroState(query: PointerTypes['$(theme).themeColors.id<?>.variants'], defaultData?: SchemaTypes['$(theme).themeColors.id<?>.variants']): [SchemaTypes['$(theme).themeColors.id<?>.variants']|null, (t: SchemaTypes['$(theme).themeColors.id<?>.variants'], doSave?: boolean) => void, () => void];
export function useFloroState(query: PointerTypes['$(theme).themes.id<?>.backgroundColor'], defaultData?: SchemaTypes['$(theme).themes.id<?>.backgroundColor']): [SchemaTypes['$(theme).themes.id<?>.backgroundColor']|null, (t: SchemaTypes['$(theme).themes.id<?>.backgroundColor'], doSave?: boolean) => void, () => void];
export function useFloroState(query: PointerTypes['$(palette).colorPalettes.id<?>.colorShades'], defaultData?: SchemaTypes['$(palette).colorPalettes.id<?>.colorShades']): [SchemaTypes['$(palette).colorPalettes.id<?>.colorShades']|null, (t: SchemaTypes['$(palette).colorPalettes.id<?>.colorShades'], doSave?: boolean) => void, () => void];
export function useFloroState(query: PointerTypes['$(icons).iconGroups.id<?>.icons'], defaultData?: SchemaTypes['$(icons).iconGroups.id<?>.icons']): [SchemaTypes['$(icons).iconGroups.id<?>.icons']|null, (t: SchemaTypes['$(icons).iconGroups.id<?>.icons'], doSave?: boolean) => void, () => void];
export function useFloroState(query: PointerTypes['$(theme).stateVariants.id<?>'], defaultData?: SchemaTypes['$(theme).stateVariants.id<?>']): [SchemaTypes['$(theme).stateVariants.id<?>']|null, (t: SchemaTypes['$(theme).stateVariants.id<?>'], doSave?: boolean) => void, () => void];
export function useFloroState(query: PointerTypes['$(theme).themeColors.id<?>'], defaultData?: SchemaTypes['$(theme).themeColors.id<?>']): [SchemaTypes['$(theme).themeColors.id<?>']|null, (t: SchemaTypes['$(theme).themeColors.id<?>'], doSave?: boolean) => void, () => void];
export function useFloroState(query: PointerTypes['$(theme).themes.id<?>'], defaultData?: SchemaTypes['$(theme).themes.id<?>']): [SchemaTypes['$(theme).themes.id<?>']|null, (t: SchemaTypes['$(theme).themes.id<?>'], doSave?: boolean) => void, () => void];
export function useFloroState(query: PointerTypes['$(palette).colorPalettes.id<?>'], defaultData?: SchemaTypes['$(palette).colorPalettes.id<?>']): [SchemaTypes['$(palette).colorPalettes.id<?>']|null, (t: SchemaTypes['$(palette).colorPalettes.id<?>'], doSave?: boolean) => void, () => void];
export function useFloroState(query: PointerTypes['$(palette).shades.id<?>'], defaultData?: SchemaTypes['$(palette).shades.id<?>']): [SchemaTypes['$(palette).shades.id<?>']|null, (t: SchemaTypes['$(palette).shades.id<?>'], doSave?: boolean) => void, () => void];
export function useFloroState(query: PointerTypes['$(icons).iconGroups.id<?>'], defaultData?: SchemaTypes['$(icons).iconGroups.id<?>']): [SchemaTypes['$(icons).iconGroups.id<?>']|null, (t: SchemaTypes['$(icons).iconGroups.id<?>'], doSave?: boolean) => void, () => void];
export function useFloroState(query: PointerTypes['$(theme).stateVariants'], defaultData?: SchemaTypes['$(theme).stateVariants']): [SchemaTypes['$(theme).stateVariants']|null, (t: SchemaTypes['$(theme).stateVariants'], doSave?: boolean) => void, () => void];
export function useFloroState(query: PointerTypes['$(theme).themeColors'], defaultData?: SchemaTypes['$(theme).themeColors']): [SchemaTypes['$(theme).themeColors']|null, (t: SchemaTypes['$(theme).themeColors'], doSave?: boolean) => void, () => void];
export function useFloroState(query: PointerTypes['$(theme).themes'], defaultData?: SchemaTypes['$(theme).themes']): [SchemaTypes['$(theme).themes']|null, (t: SchemaTypes['$(theme).themes'], doSave?: boolean) => void, () => void];
export function useFloroState(query: PointerTypes['$(palette).colorPalettes'], defaultData?: SchemaTypes['$(palette).colorPalettes']): [SchemaTypes['$(palette).colorPalettes']|null, (t: SchemaTypes['$(palette).colorPalettes'], doSave?: boolean) => void, () => void];
export function useFloroState(query: PointerTypes['$(palette).shades'], defaultData?: SchemaTypes['$(palette).shades']): [SchemaTypes['$(palette).shades']|null, (t: SchemaTypes['$(palette).shades'], doSave?: boolean) => void, () => void];
export function useFloroState(query: PointerTypes['$(icons).iconGroups'], defaultData?: SchemaTypes['$(icons).iconGroups']): [SchemaTypes['$(icons).iconGroups']|null, (t: SchemaTypes['$(icons).iconGroups'], doSave?: boolean) => void, () => void];

export function useFloroState<T>(query: string, defaultData?: T): [T|null, (t: T, doSave?: boolean) => void, () => void] {
  const ctx = useFloroContext();
  const pluginName = useMemo(() => getPluginNameFromQuery(query), [query]);

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
    if (ctx.applicationState && defaultData) {
      return defaultData;
    }
    return null;
  }, [ctx.applicationState, query, defaultData, ctx.hasLoaded]);

  const [getter, setter] = useState<T|null>(obj ?? defaultData ?? null);

  useEffect(() => {
    setter(obj);
  }, [obj])

  const save = useCallback(() => {
    if (ctx.currentPluginAppState.current && pluginName && getter && ctx.commandMode == "edit") {
      ctx.lastEditKey.current = query;
      const next = updateObjectInStateMap({...ctx.currentPluginAppState.current}, query, getter) as SchemaRoot
      ctx.setPluginState({
        ...ctx.pluginState,
        applicationState: next
      });
      ctx.currentPluginAppState.current = next;
      ctx.saveState(pluginName, ctx.applicationState);
    }
  }, [query, pluginName, obj, ctx.pluginState, ctx.commandMode, getter]);

  const set = useCallback((obj: T, doSave = true) => {
    if (ctx.currentPluginAppState.current && pluginName && obj && ctx.commandMode == "edit") {
      setter(obj);
      ctx.lastEditKey.current = query;
      if (doSave) {
        const next = updateObjectInStateMap({...ctx.currentPluginAppState.current}, query, obj) as SchemaRoot
        ctx.setPluginState({
          ...ctx.pluginState,
          applicationState: next
        });
        ctx.currentPluginAppState.current = next;
        ctx.saveState(pluginName, next);
      }
    }
  }, [query, ctx.saveState, ctx.setPluginState, obj, pluginName, ctx.pluginState, ctx.commandMode]);
  return [getter, set, save];
};

export function useIsFloroInvalid(query: PointerTypes['$(theme).themeColors.id<?>.variants.id<?>.variantDefinitions.id<?>'], fuzzy?: boolean): boolean;
export function useIsFloroInvalid(query: PointerTypes['$(icons).iconGroups.id<?>.icons.id<?>.appliedThemes.hexcode<?>'], fuzzy?: boolean): boolean;
export function useIsFloroInvalid(query: PointerTypes['$(icons).iconGroups.id<?>.icons.id<?>.enabledVariants.id<?>'], fuzzy?: boolean): boolean;
export function useIsFloroInvalid(query: PointerTypes['$(theme).themeColors.id<?>.variants.id<?>.variantDefinitions'], fuzzy?: boolean): boolean;
export function useIsFloroInvalid(query: PointerTypes['$(icons).iconGroups.id<?>.icons.id<?>.appliedThemes'], fuzzy?: boolean): boolean;
export function useIsFloroInvalid(query: PointerTypes['$(icons).iconGroups.id<?>.icons.id<?>.enabledVariants'], fuzzy?: boolean): boolean;
export function useIsFloroInvalid(query: PointerTypes['$(theme).themeColors.id<?>.themeDefinitions.id<?>'], fuzzy?: boolean): boolean;
export function useIsFloroInvalid(query: PointerTypes['$(theme).themeColors.id<?>.variants.id<?>'], fuzzy?: boolean): boolean;
export function useIsFloroInvalid(query: PointerTypes['$(palette).colorPalettes.id<?>.colorShades.id<?>'], fuzzy?: boolean): boolean;
export function useIsFloroInvalid(query: PointerTypes['$(icons).iconGroups.id<?>.icons.id<?>'], fuzzy?: boolean): boolean;
export function useIsFloroInvalid(query: PointerTypes['$(theme).themeColors.id<?>.themeDefinitions'], fuzzy?: boolean): boolean;
export function useIsFloroInvalid(query: PointerTypes['$(theme).themeColors.id<?>.variants'], fuzzy?: boolean): boolean;
export function useIsFloroInvalid(query: PointerTypes['$(theme).themes.id<?>.backgroundColor'], fuzzy?: boolean): boolean;
export function useIsFloroInvalid(query: PointerTypes['$(palette).colorPalettes.id<?>.colorShades'], fuzzy?: boolean): boolean;
export function useIsFloroInvalid(query: PointerTypes['$(icons).iconGroups.id<?>.icons'], fuzzy?: boolean): boolean;
export function useIsFloroInvalid(query: PointerTypes['$(theme).stateVariants.id<?>'], fuzzy?: boolean): boolean;
export function useIsFloroInvalid(query: PointerTypes['$(theme).themeColors.id<?>'], fuzzy?: boolean): boolean;
export function useIsFloroInvalid(query: PointerTypes['$(theme).themes.id<?>'], fuzzy?: boolean): boolean;
export function useIsFloroInvalid(query: PointerTypes['$(palette).colorPalettes.id<?>'], fuzzy?: boolean): boolean;
export function useIsFloroInvalid(query: PointerTypes['$(palette).shades.id<?>'], fuzzy?: boolean): boolean;
export function useIsFloroInvalid(query: PointerTypes['$(icons).iconGroups.id<?>'], fuzzy?: boolean): boolean;
export function useIsFloroInvalid(query: PointerTypes['$(theme).stateVariants'], fuzzy?: boolean): boolean;
export function useIsFloroInvalid(query: PointerTypes['$(theme).themeColors'], fuzzy?: boolean): boolean;
export function useIsFloroInvalid(query: PointerTypes['$(theme).themes'], fuzzy?: boolean): boolean;
export function useIsFloroInvalid(query: PointerTypes['$(palette).colorPalettes'], fuzzy?: boolean): boolean;
export function useIsFloroInvalid(query: PointerTypes['$(palette).shades'], fuzzy?: boolean): boolean;
export function useIsFloroInvalid(query: PointerTypes['$(icons).iconGroups'], fuzzy?: boolean): boolean;

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
export function useWasAdded(query: PointerTypes['$(icons).iconGroups.id<?>.icons.id<?>.appliedThemes.hexcode<?>'], fuzzy?: boolean): boolean;
export function useWasAdded(query: PointerTypes['$(icons).iconGroups.id<?>.icons.id<?>.enabledVariants.id<?>'], fuzzy?: boolean): boolean;
export function useWasAdded(query: PointerTypes['$(theme).themeColors.id<?>.variants.id<?>.variantDefinitions'], fuzzy?: boolean): boolean;
export function useWasAdded(query: PointerTypes['$(icons).iconGroups.id<?>.icons.id<?>.appliedThemes'], fuzzy?: boolean): boolean;
export function useWasAdded(query: PointerTypes['$(icons).iconGroups.id<?>.icons.id<?>.enabledVariants'], fuzzy?: boolean): boolean;
export function useWasAdded(query: PointerTypes['$(theme).themeColors.id<?>.themeDefinitions.id<?>'], fuzzy?: boolean): boolean;
export function useWasAdded(query: PointerTypes['$(theme).themeColors.id<?>.variants.id<?>'], fuzzy?: boolean): boolean;
export function useWasAdded(query: PointerTypes['$(palette).colorPalettes.id<?>.colorShades.id<?>'], fuzzy?: boolean): boolean;
export function useWasAdded(query: PointerTypes['$(icons).iconGroups.id<?>.icons.id<?>'], fuzzy?: boolean): boolean;
export function useWasAdded(query: PointerTypes['$(theme).themeColors.id<?>.themeDefinitions'], fuzzy?: boolean): boolean;
export function useWasAdded(query: PointerTypes['$(theme).themeColors.id<?>.variants'], fuzzy?: boolean): boolean;
export function useWasAdded(query: PointerTypes['$(theme).themes.id<?>.backgroundColor'], fuzzy?: boolean): boolean;
export function useWasAdded(query: PointerTypes['$(palette).colorPalettes.id<?>.colorShades'], fuzzy?: boolean): boolean;
export function useWasAdded(query: PointerTypes['$(icons).iconGroups.id<?>.icons'], fuzzy?: boolean): boolean;
export function useWasAdded(query: PointerTypes['$(theme).stateVariants.id<?>'], fuzzy?: boolean): boolean;
export function useWasAdded(query: PointerTypes['$(theme).themeColors.id<?>'], fuzzy?: boolean): boolean;
export function useWasAdded(query: PointerTypes['$(theme).themes.id<?>'], fuzzy?: boolean): boolean;
export function useWasAdded(query: PointerTypes['$(palette).colorPalettes.id<?>'], fuzzy?: boolean): boolean;
export function useWasAdded(query: PointerTypes['$(palette).shades.id<?>'], fuzzy?: boolean): boolean;
export function useWasAdded(query: PointerTypes['$(icons).iconGroups.id<?>'], fuzzy?: boolean): boolean;
export function useWasAdded(query: PointerTypes['$(theme).stateVariants'], fuzzy?: boolean): boolean;
export function useWasAdded(query: PointerTypes['$(theme).themeColors'], fuzzy?: boolean): boolean;
export function useWasAdded(query: PointerTypes['$(theme).themes'], fuzzy?: boolean): boolean;
export function useWasAdded(query: PointerTypes['$(palette).colorPalettes'], fuzzy?: boolean): boolean;
export function useWasAdded(query: PointerTypes['$(palette).shades'], fuzzy?: boolean): boolean;
export function useWasAdded(query: PointerTypes['$(icons).iconGroups'], fuzzy?: boolean): boolean;

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
export function useWasRemoved(query: PointerTypes['$(icons).iconGroups.id<?>.icons.id<?>.appliedThemes.hexcode<?>'], fuzzy?: boolean): boolean;
export function useWasRemoved(query: PointerTypes['$(icons).iconGroups.id<?>.icons.id<?>.enabledVariants.id<?>'], fuzzy?: boolean): boolean;
export function useWasRemoved(query: PointerTypes['$(theme).themeColors.id<?>.variants.id<?>.variantDefinitions'], fuzzy?: boolean): boolean;
export function useWasRemoved(query: PointerTypes['$(icons).iconGroups.id<?>.icons.id<?>.appliedThemes'], fuzzy?: boolean): boolean;
export function useWasRemoved(query: PointerTypes['$(icons).iconGroups.id<?>.icons.id<?>.enabledVariants'], fuzzy?: boolean): boolean;
export function useWasRemoved(query: PointerTypes['$(theme).themeColors.id<?>.themeDefinitions.id<?>'], fuzzy?: boolean): boolean;
export function useWasRemoved(query: PointerTypes['$(theme).themeColors.id<?>.variants.id<?>'], fuzzy?: boolean): boolean;
export function useWasRemoved(query: PointerTypes['$(palette).colorPalettes.id<?>.colorShades.id<?>'], fuzzy?: boolean): boolean;
export function useWasRemoved(query: PointerTypes['$(icons).iconGroups.id<?>.icons.id<?>'], fuzzy?: boolean): boolean;
export function useWasRemoved(query: PointerTypes['$(theme).themeColors.id<?>.themeDefinitions'], fuzzy?: boolean): boolean;
export function useWasRemoved(query: PointerTypes['$(theme).themeColors.id<?>.variants'], fuzzy?: boolean): boolean;
export function useWasRemoved(query: PointerTypes['$(theme).themes.id<?>.backgroundColor'], fuzzy?: boolean): boolean;
export function useWasRemoved(query: PointerTypes['$(palette).colorPalettes.id<?>.colorShades'], fuzzy?: boolean): boolean;
export function useWasRemoved(query: PointerTypes['$(icons).iconGroups.id<?>.icons'], fuzzy?: boolean): boolean;
export function useWasRemoved(query: PointerTypes['$(theme).stateVariants.id<?>'], fuzzy?: boolean): boolean;
export function useWasRemoved(query: PointerTypes['$(theme).themeColors.id<?>'], fuzzy?: boolean): boolean;
export function useWasRemoved(query: PointerTypes['$(theme).themes.id<?>'], fuzzy?: boolean): boolean;
export function useWasRemoved(query: PointerTypes['$(palette).colorPalettes.id<?>'], fuzzy?: boolean): boolean;
export function useWasRemoved(query: PointerTypes['$(palette).shades.id<?>'], fuzzy?: boolean): boolean;
export function useWasRemoved(query: PointerTypes['$(icons).iconGroups.id<?>'], fuzzy?: boolean): boolean;
export function useWasRemoved(query: PointerTypes['$(theme).stateVariants'], fuzzy?: boolean): boolean;
export function useWasRemoved(query: PointerTypes['$(theme).themeColors'], fuzzy?: boolean): boolean;
export function useWasRemoved(query: PointerTypes['$(theme).themes'], fuzzy?: boolean): boolean;
export function useWasRemoved(query: PointerTypes['$(palette).colorPalettes'], fuzzy?: boolean): boolean;
export function useWasRemoved(query: PointerTypes['$(palette).shades'], fuzzy?: boolean): boolean;
export function useWasRemoved(query: PointerTypes['$(icons).iconGroups'], fuzzy?: boolean): boolean;

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
export function useHasConflict(query: PointerTypes['$(icons).iconGroups.id<?>.icons.id<?>.appliedThemes.hexcode<?>'], fuzzy?: boolean): boolean;
export function useHasConflict(query: PointerTypes['$(icons).iconGroups.id<?>.icons.id<?>.enabledVariants.id<?>'], fuzzy?: boolean): boolean;
export function useHasConflict(query: PointerTypes['$(theme).themeColors.id<?>.variants.id<?>.variantDefinitions'], fuzzy?: boolean): boolean;
export function useHasConflict(query: PointerTypes['$(icons).iconGroups.id<?>.icons.id<?>.appliedThemes'], fuzzy?: boolean): boolean;
export function useHasConflict(query: PointerTypes['$(icons).iconGroups.id<?>.icons.id<?>.enabledVariants'], fuzzy?: boolean): boolean;
export function useHasConflict(query: PointerTypes['$(theme).themeColors.id<?>.themeDefinitions.id<?>'], fuzzy?: boolean): boolean;
export function useHasConflict(query: PointerTypes['$(theme).themeColors.id<?>.variants.id<?>'], fuzzy?: boolean): boolean;
export function useHasConflict(query: PointerTypes['$(palette).colorPalettes.id<?>.colorShades.id<?>'], fuzzy?: boolean): boolean;
export function useHasConflict(query: PointerTypes['$(icons).iconGroups.id<?>.icons.id<?>'], fuzzy?: boolean): boolean;
export function useHasConflict(query: PointerTypes['$(theme).themeColors.id<?>.themeDefinitions'], fuzzy?: boolean): boolean;
export function useHasConflict(query: PointerTypes['$(theme).themeColors.id<?>.variants'], fuzzy?: boolean): boolean;
export function useHasConflict(query: PointerTypes['$(theme).themes.id<?>.backgroundColor'], fuzzy?: boolean): boolean;
export function useHasConflict(query: PointerTypes['$(palette).colorPalettes.id<?>.colorShades'], fuzzy?: boolean): boolean;
export function useHasConflict(query: PointerTypes['$(icons).iconGroups.id<?>.icons'], fuzzy?: boolean): boolean;
export function useHasConflict(query: PointerTypes['$(theme).stateVariants.id<?>'], fuzzy?: boolean): boolean;
export function useHasConflict(query: PointerTypes['$(theme).themeColors.id<?>'], fuzzy?: boolean): boolean;
export function useHasConflict(query: PointerTypes['$(theme).themes.id<?>'], fuzzy?: boolean): boolean;
export function useHasConflict(query: PointerTypes['$(palette).colorPalettes.id<?>'], fuzzy?: boolean): boolean;
export function useHasConflict(query: PointerTypes['$(palette).shades.id<?>'], fuzzy?: boolean): boolean;
export function useHasConflict(query: PointerTypes['$(icons).iconGroups.id<?>'], fuzzy?: boolean): boolean;
export function useHasConflict(query: PointerTypes['$(theme).stateVariants'], fuzzy?: boolean): boolean;
export function useHasConflict(query: PointerTypes['$(theme).themeColors'], fuzzy?: boolean): boolean;
export function useHasConflict(query: PointerTypes['$(theme).themes'], fuzzy?: boolean): boolean;
export function useHasConflict(query: PointerTypes['$(palette).colorPalettes'], fuzzy?: boolean): boolean;
export function useHasConflict(query: PointerTypes['$(palette).shades'], fuzzy?: boolean): boolean;
export function useHasConflict(query: PointerTypes['$(icons).iconGroups'], fuzzy?: boolean): boolean;

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
export function useWasChanged(query: PointerTypes['$(icons).iconGroups.id<?>.icons.id<?>.appliedThemes.hexcode<?>'], fuzzy?: boolean): boolean;
export function useWasChanged(query: PointerTypes['$(icons).iconGroups.id<?>.icons.id<?>.enabledVariants.id<?>'], fuzzy?: boolean): boolean;
export function useWasChanged(query: PointerTypes['$(theme).themeColors.id<?>.variants.id<?>.variantDefinitions'], fuzzy?: boolean): boolean;
export function useWasChanged(query: PointerTypes['$(icons).iconGroups.id<?>.icons.id<?>.appliedThemes'], fuzzy?: boolean): boolean;
export function useWasChanged(query: PointerTypes['$(icons).iconGroups.id<?>.icons.id<?>.enabledVariants'], fuzzy?: boolean): boolean;
export function useWasChanged(query: PointerTypes['$(theme).themeColors.id<?>.themeDefinitions.id<?>'], fuzzy?: boolean): boolean;
export function useWasChanged(query: PointerTypes['$(theme).themeColors.id<?>.variants.id<?>'], fuzzy?: boolean): boolean;
export function useWasChanged(query: PointerTypes['$(palette).colorPalettes.id<?>.colorShades.id<?>'], fuzzy?: boolean): boolean;
export function useWasChanged(query: PointerTypes['$(icons).iconGroups.id<?>.icons.id<?>'], fuzzy?: boolean): boolean;
export function useWasChanged(query: PointerTypes['$(theme).themeColors.id<?>.themeDefinitions'], fuzzy?: boolean): boolean;
export function useWasChanged(query: PointerTypes['$(theme).themeColors.id<?>.variants'], fuzzy?: boolean): boolean;
export function useWasChanged(query: PointerTypes['$(theme).themes.id<?>.backgroundColor'], fuzzy?: boolean): boolean;
export function useWasChanged(query: PointerTypes['$(palette).colorPalettes.id<?>.colorShades'], fuzzy?: boolean): boolean;
export function useWasChanged(query: PointerTypes['$(icons).iconGroups.id<?>.icons'], fuzzy?: boolean): boolean;
export function useWasChanged(query: PointerTypes['$(theme).stateVariants.id<?>'], fuzzy?: boolean): boolean;
export function useWasChanged(query: PointerTypes['$(theme).themeColors.id<?>'], fuzzy?: boolean): boolean;
export function useWasChanged(query: PointerTypes['$(theme).themes.id<?>'], fuzzy?: boolean): boolean;
export function useWasChanged(query: PointerTypes['$(palette).colorPalettes.id<?>'], fuzzy?: boolean): boolean;
export function useWasChanged(query: PointerTypes['$(palette).shades.id<?>'], fuzzy?: boolean): boolean;
export function useWasChanged(query: PointerTypes['$(icons).iconGroups.id<?>'], fuzzy?: boolean): boolean;
export function useWasChanged(query: PointerTypes['$(theme).stateVariants'], fuzzy?: boolean): boolean;
export function useWasChanged(query: PointerTypes['$(theme).themeColors'], fuzzy?: boolean): boolean;
export function useWasChanged(query: PointerTypes['$(theme).themes'], fuzzy?: boolean): boolean;
export function useWasChanged(query: PointerTypes['$(palette).colorPalettes'], fuzzy?: boolean): boolean;
export function useWasChanged(query: PointerTypes['$(palette).shades'], fuzzy?: boolean): boolean;
export function useWasChanged(query: PointerTypes['$(icons).iconGroups'], fuzzy?: boolean): boolean;

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
export function useHasIndication(query: PointerTypes['$(icons).iconGroups.id<?>.icons.id<?>.appliedThemes.hexcode<?>'], fuzzy?: boolean): boolean;
export function useHasIndication(query: PointerTypes['$(icons).iconGroups.id<?>.icons.id<?>.enabledVariants.id<?>'], fuzzy?: boolean): boolean;
export function useHasIndication(query: PointerTypes['$(theme).themeColors.id<?>.variants.id<?>.variantDefinitions'], fuzzy?: boolean): boolean;
export function useHasIndication(query: PointerTypes['$(icons).iconGroups.id<?>.icons.id<?>.appliedThemes'], fuzzy?: boolean): boolean;
export function useHasIndication(query: PointerTypes['$(icons).iconGroups.id<?>.icons.id<?>.enabledVariants'], fuzzy?: boolean): boolean;
export function useHasIndication(query: PointerTypes['$(theme).themeColors.id<?>.themeDefinitions.id<?>'], fuzzy?: boolean): boolean;
export function useHasIndication(query: PointerTypes['$(theme).themeColors.id<?>.variants.id<?>'], fuzzy?: boolean): boolean;
export function useHasIndication(query: PointerTypes['$(palette).colorPalettes.id<?>.colorShades.id<?>'], fuzzy?: boolean): boolean;
export function useHasIndication(query: PointerTypes['$(icons).iconGroups.id<?>.icons.id<?>'], fuzzy?: boolean): boolean;
export function useHasIndication(query: PointerTypes['$(theme).themeColors.id<?>.themeDefinitions'], fuzzy?: boolean): boolean;
export function useHasIndication(query: PointerTypes['$(theme).themeColors.id<?>.variants'], fuzzy?: boolean): boolean;
export function useHasIndication(query: PointerTypes['$(theme).themes.id<?>.backgroundColor'], fuzzy?: boolean): boolean;
export function useHasIndication(query: PointerTypes['$(palette).colorPalettes.id<?>.colorShades'], fuzzy?: boolean): boolean;
export function useHasIndication(query: PointerTypes['$(icons).iconGroups.id<?>.icons'], fuzzy?: boolean): boolean;
export function useHasIndication(query: PointerTypes['$(theme).stateVariants.id<?>'], fuzzy?: boolean): boolean;
export function useHasIndication(query: PointerTypes['$(theme).themeColors.id<?>'], fuzzy?: boolean): boolean;
export function useHasIndication(query: PointerTypes['$(theme).themes.id<?>'], fuzzy?: boolean): boolean;
export function useHasIndication(query: PointerTypes['$(palette).colorPalettes.id<?>'], fuzzy?: boolean): boolean;
export function useHasIndication(query: PointerTypes['$(palette).shades.id<?>'], fuzzy?: boolean): boolean;
export function useHasIndication(query: PointerTypes['$(icons).iconGroups.id<?>'], fuzzy?: boolean): boolean;
export function useHasIndication(query: PointerTypes['$(theme).stateVariants'], fuzzy?: boolean): boolean;
export function useHasIndication(query: PointerTypes['$(theme).themeColors'], fuzzy?: boolean): boolean;
export function useHasIndication(query: PointerTypes['$(theme).themes'], fuzzy?: boolean): boolean;
export function useHasIndication(query: PointerTypes['$(palette).colorPalettes'], fuzzy?: boolean): boolean;
export function useHasIndication(query: PointerTypes['$(palette).shades'], fuzzy?: boolean): boolean;
export function useHasIndication(query: PointerTypes['$(icons).iconGroups'], fuzzy?: boolean): boolean;

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
      if (!pluginState.binaryUrls.upload || !pluginState.binaryUrls.binaryToken) {
        return;
      }
      setStatus("in_progress");
      setProgress(0);
      setUploadObject(
        startUploadFile(file, pluginState.binaryUrls.upload + (!pluginState.binaryUrls?.binaryToken ? "" : "?token=" + pluginState.binaryUrls?.binaryToken), onProgress)
      );
    },
    [status, pluginState.binaryUrls.upload, pluginState.binaryUrls?.binaryToken, onProgress]
  );

  const uploadBlob = useCallback(
    (data: BlobPart[], type: MimeTypes) => {
      if (status == "in_progress") {
        return;
      }
      if (!pluginState.binaryUrls.upload || !pluginState.binaryUrls.binaryToken) {
        return;
      }
      setUploadObject(
        startUploadBlob(data, type, pluginState.binaryUrls.upload + (!pluginState.binaryUrls?.binaryToken ? "" : "?token=" + pluginState.binaryUrls?.binaryToken), onProgress)
      );
      setStatus("in_progress");
      setProgress(0);
    },
    [status, pluginState.binaryUrls.upload, pluginState.binaryUrls.binaryToken, onProgress]
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
    return useMemo(() => {
      if (!fileRef) {
        return null;
      }
      if (pluginState.binaryMap[fileRef]) {
        return (
          pluginState.binaryMap[fileRef] +
          (!pluginState.binaryUrls?.binaryToken ? "" : "?token=" + pluginState.binaryUrls?.binaryToken)
        );
      }
      return `${pluginState.binaryUrls.download}/${fileRef}` + (!pluginState.binaryUrls?.binaryToken ? "" : "?token=" + pluginState.binaryUrls?.binaryToken);
    }, [
      fileRef,
      pluginState.binaryMap?.[fileRef ?? ""],
      pluginState.binaryUrls?.binaryToken,
      pluginState.binaryUrls.download,
    ]);
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
