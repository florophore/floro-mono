import React, {
  useState,
  useRef,
  useMemo,
  useEffect,
  useCallback,
} from "react";
import {useTheme} from "@emotion/react";
import { ApiResponse } from "floro/dist/src/repo";
import { Repository } from "@floro/graphql-schemas/src/generated/main-client-graphql";
import { useClearPluginStorageV2, useUpdatePluginState, useUpdatePluginStorageV2 } from "../local/hooks/local-hooks";
import { useLocalVCSNavContext } from "../local/vcsnav/LocalVCSContext";
import { useCopyPasteContext } from "../copypaste/CopyPasteContext";
import { useRootSchemaMap } from "../remote/hooks/remote-hooks";
import { usePluginMessage } from "../../../contexts/PluginMessageContext";

interface Props {
  pluginName: string;
  apiResponse: ApiResponse;
  storage: object;
  repository: Repository;
  isExpanded: boolean;
  onSetIsExpanded: (isExpanded: boolean) => void;
  onToggleCommandMode: () => void;
  onToggleCompareMode: () => void;
  onToggleBefore: () => void;
  onToggleAfter: () => void;
  onToggleBranches: () => void;
}

interface Packet {
  id: number;
  chunk: string;
  index: number;
  totalPackets: number;
  pluginName: string;
  command?: string;
}

const MAX_DATA_SIZE = 10_000;
const sendMessage = (
  iframe: HTMLIFrameElement,
  event: string,
  data: object,
  id?: number
) => {
  if (!id) {
    id = 0;
  }
  const dataString = JSON.stringify({ data, event });
  const totalPackets = Math.floor(dataString.length / MAX_DATA_SIZE);
  for (let i = 0; i < dataString.length; i += MAX_DATA_SIZE) {
    const chunk =
      i + MAX_DATA_SIZE > dataString.length
        ? dataString.substring(i)
        : dataString.substring(i, i + MAX_DATA_SIZE);
    setTimeout(() => {
      iframe.contentWindow?.postMessage(
        {
          id,
          chunk,
          index: i / MAX_DATA_SIZE,
          totalPackets,
        },
        "*"
      );
    }, 0);
  }
};

const LocalPluginController = (props: Props) => {
  const theme = useTheme();
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [hasLoaded, setHasLoaded] = useState(false);
  const [hasSentFirstData, setHasSetFirstData] = useState(false);
  const [ackId, setAckId] = useState<number | null>(null);
  const { compareFrom, isStashing } = useLocalVCSNavContext();
  const { isSelectMode, copyInstructions, setCopyInstructions } = useCopyPasteContext("local");
  const updateCounter = useRef(0);
  const clientUpdateCounter = useRef(1);

  const { lastPluginMessage, clearLastPluginMessage} = usePluginMessage();

  const updatePluginState = useUpdatePluginState(
    props.pluginName,
    props.repository,
    clientUpdateCounter
  );

  const updatePluginClientStorage = useUpdatePluginStorageV2(
    props.pluginName,
    props.repository,
    clientUpdateCounter
  );

  const clearStorageMutation =  useClearPluginStorageV2(props.pluginName, props.repository);
  const onClearStorage = useCallback(() => {
    clearStorageMutation.mutate({});
  }, []);
  const onToggleVCSContainer = useCallback(() => {
    props.onSetIsExpanded(!props.isExpanded);
  }, [props.isExpanded, props.onSetIsExpanded]);

  useEffect(() => {
    setHasLoaded(false);
  }, [props.pluginName, props.repository.id]);

  const manifest = useMemo(() => {
    if (props.apiResponse.repoState.commandMode == "compare" && compareFrom == "before") {
      if (!props.apiResponse.beforeSchemaMap?.[props.pluginName]) {
        return null;
      }
      return props.apiResponse.beforeSchemaMap?.[props.pluginName];
    }
    if (!props.apiResponse.schemaMap?.[props.pluginName]) {
      return null;
    }
    return props.apiResponse.schemaMap?.[props.pluginName];
  }, [
    compareFrom,
    props.apiResponse.repoState.commandMode,
    props.pluginName,
    props.apiResponse.schemaMap,
  ]);

  const schemaMap = useMemo(() => {
    if (!manifest) {
      return {};
    }
    const keys = [manifest.name, ...Object.keys(manifest.imports)];
    const out = {};
    for (const key of keys) {
      out[key] = props.apiResponse.schemaMap[key];
    }
    return out;
  }, [props.apiResponse.schemaMap, manifest])

  const isCopyMode = useMemo(() => {
    if (!manifest?.managedCopy) {
      return false;
    }
    if (!isSelectMode) {
      return false;
    }
    if (!manifest.name || !copyInstructions?.[manifest.name]?.isManualCopy) {
      return false;
    }
    return true;
  }, [manifest, isSelectMode, copyInstructions]);

  const copyList = useMemo(() => {
    if (!isCopyMode) {
      return [];
    }
    if (!manifest?.name) {
      return [];
    }
    return copyInstructions[manifest.name].manualCopyList;
  }, [isCopyMode, copyInstructions, manifest])

  const iframeUri = useMemo(() => {
    if (!manifest) {
      return null;
    }
    return `http://localhost:63403/plugins/${manifest.name}/${manifest?.version}`;
  }, [manifest]);

  const applicationState = useMemo(() => {
    if (!manifest) {
      return {};
    }
    const keys = [manifest.name, ...Object.keys(manifest.imports)];
    const out = {};
    for (const plugin of keys) {
      if (props.apiResponse.repoState.commandMode == "compare" && compareFrom == "before") {
        out[plugin] = props?.apiResponse?.beforeState?.store?.[plugin] ?? {};
      } else {
        out[plugin] = props?.apiResponse?.applicationState?.store?.[plugin] ?? {};
      }
    }
    return out;
  }, [manifest,
     compareFrom,
     props.apiResponse.repoState.commandMode,
     props.apiResponse?.applicationState,
     props.apiResponse?.beforeState,
    ]);

  const apiStoreInvalidity = useMemo(() => {
    if (!manifest) {
      return {};
    }
    const keys = [manifest.name, ...Object.keys(manifest.imports)];
    const out = {};
    for (const plugin of keys) {
      if (
        props.apiResponse.repoState.commandMode == "compare" &&
        compareFrom == "before"
      ) {
        out[plugin] =
          props?.apiResponse?.beforeApiStoreInvalidity?.[plugin] ?? {};
      } else {
        out[plugin] = props?.apiResponse?.apiStoreInvalidity?.[plugin] ?? {};
      }
    }
    return out;
  }, [
    manifest,
    props?.apiResponse?.apiStoreInvalidity,
    compareFrom,
    props.apiResponse?.beforeApiStoreInvalidity,
  ]);

  const changeset = useMemo(() => {
    if (props.apiResponse.repoState.commandMode != "compare" || !manifest) {
      return []
    }
    const out: Array<string> = [];
    const keys = [manifest.name, ...Object.keys(manifest.imports)];
    for (const plugin of keys) {
      if (compareFrom == "before"
      ) {
        out.push(
          ...(props?.apiResponse?.apiDiff?.store?.[plugin]?.removed ?? [])
        );
      } else {
        out.push(
          ...(props?.apiResponse?.apiDiff?.store?.[plugin]?.added ?? [])
        );
      }
    }
    return out;
  }, [
    manifest,
    props?.apiResponse?.apiStoreInvalidity,
    props?.apiResponse?.repoState?.comparison?.comparisonDirection,
    compareFrom,
    props.apiResponse?.beforeApiStoreInvalidity,
    props?.apiResponse?.repoState?.comparison,
  ])

  const rootSchemaMapRequest = useRootSchemaMap(manifest, schemaMap)

  const conflictList = useMemo(() => {
    if (!props?.apiResponse?.repoState?.isInMergeConflict) {
      return [];
    }
    return (props?.apiResponse?.conflictResolution?.store[props?.pluginName ?? ""] ?? [])?.map(v => v.key) ?? [];
  }, [

    props?.apiResponse?.repoState?.isInMergeConflict,
    props?.apiResponse?.conflictResolution,
    props?.pluginName,
  ]);

  const binaryUrls = useMemo(() => {
    if (props?.apiResponse?.repoState?.commandMode == "edit") {
      return {
        upload: "http://localhost:63403/binary/upload",
        download: "http://localhost:63403/binary",
        binaryToken: props?.apiResponse?.binaryToken,
      }
    }
    return {
      upload: null,
      download: "http://localhost:63403/binary",
      binaryToken: props?.apiResponse?.binaryToken,
    }
  }, [
    props?.apiResponse?.binaryToken,
    props?.apiResponse?.repoState?.commandMode,
    props?.apiResponse?.repoState?.comparison,
  ]);

  const binaryMap = useMemo(() => {
    const out: {[key: string]: string} = {};
    if (
      props.apiResponse.repoState.commandMode == "compare" &&
      compareFrom == "before"
    ) {
      for (const binary of (props?.apiResponse?.beforeState?.binaries ?? [])) {
        out[binary] = "http://localhost:63403/binary/" + binary;
      }
    } else {
      for (const binary of (props?.apiResponse?.applicationState?.binaries ?? [])) {
        out[binary] = "http://localhost:63403/binary/" + binary;
      }
    }
    return out;
  }, [
    manifest,
    props.apiResponse.repoState.commandMode,
    props?.apiResponse?.applicationState?.binaries,
    props?.apiResponse?.beforeState?.binaries,
    compareFrom,
  ]);
  const clientStorage = useMemo(() => {
    if (!manifest?.name) {
      return {};
    }
    return props.storage?.[manifest?.name] ?? {};
  }, [manifest?.name, props.storage]);

  const pluginState = useMemo(() => {
    return {
      changeset,
      applicationState,
      apiStoreInvalidity,
      conflictList,
      binaryUrls,
      compareFrom: props?.apiResponse?.repoState?.commandMode == "compare" ? compareFrom : "none",
      commandMode: props?.apiResponse?.repoState?.commandMode ?? "view",
      binaryMap,
      isCopyMode,
      copyList,
      rootSchemaMap: rootSchemaMapRequest?.data,
      clientStorage,
      themeName: theme.name
    };
  }, [
    changeset,
    applicationState,
    apiStoreInvalidity,
    conflictList,
    binaryUrls,
    props?.apiResponse?.repoState?.commandMode,
    props?.apiResponse?.repoState?.comparison,
    binaryMap,
    isCopyMode,
    copyList,
    rootSchemaMapRequest?.data,
    clientStorage,
    theme.name
  ]);

  useEffect(() => {
    if (hasLoaded && !hasSentFirstData && iframeRef.current) {
      updateCounter.current += 2;
      sendMessage(iframeRef.current, "load", pluginState, updateCounter.current);
      setHasSetFirstData(true);
    }
  }, [hasLoaded, hasSentFirstData, pluginState,
    props?.apiResponse?.repoState?.comparison,
  ]);

  useEffect(() => {
    if (lastPluginMessage && hasLoaded) {
      const timeout = setTimeout(() => {
        if (iframeRef.current) {
          sendMessage(iframeRef.current, "external:message", lastPluginMessage);
          clearLastPluginMessage();
        }
      }, 300);
      // see if this fixes leak
      return () => {
        clearTimeout(timeout);
      }
    }
  }, [lastPluginMessage, hasLoaded]);

  const isStashingRef = useRef(isStashing);

  useEffect(() => {
    if (ackId) {
      if (iframeRef.current) {
        if (ackId == clientUpdateCounter.current) {
          updateCounter.current += 2;
          sendMessage(
            iframeRef.current,
            "ack",
            pluginState,
            updateCounter.current
          );
          setAckId(null);
        }
      }
    } else {
      if (iframeRef.current) {
        if (isStashing && isStashing != isStashingRef.current) {
          updateCounter.current += 2;
          sendMessage(
            iframeRef.current,
            "ack",
            pluginState,
            updateCounter.current
          );
        }
        isStashingRef.current = isStashing;
      }
    }
  }, [
    ackId,
    pluginState,
    updatePluginState.data?.id,
    props?.apiResponse?.repoState?.comparison,
    isStashing,
  ]);

  useEffect(() => {
    if (iframeRef.current && hasLoaded && hasSentFirstData) {
        updateCounter.current += 2;
        sendMessage(iframeRef.current, "update", pluginState, updateCounter.current);
    }
  }, [
    pluginState,
    props?.apiResponse?.repoState?.comparison,
    hasLoaded && hasSentFirstData,
    isCopyMode
  ]);

  useEffect(() => {
    if (updatePluginState?.data?.id) {
      setAckId(updatePluginState?.data?.id);
    }
  }, [updatePluginState?.data?.id]);

  const onUpdateCopyInstructions = useCallback((manualCopyList: Array<string>) => {
    if (!isCopyMode || !manifest?.name || !Array.isArray(manualCopyList)) {
      return;
    }
    const copyInstruction = copyInstructions[manifest.name];
    const nextCopyInstructions = {
      ...copyInstructions,
      [manifest.name]: {
        ...copyInstruction,
        manualCopyList
      }
    };
    setCopyInstructions(nextCopyInstructions);
  }, [isCopyMode, copyInstructions, manifest?.name]);

  const debounceTimeout = useRef<{
    [pluginName: string]: NodeJS.Timeout
  }>({});
  // this avoids self DDOS-ing
  const onUpdateState = useCallback(
    (stateData, id, pluginName) => {
      if (debounceTimeout.current?.[pluginName] !== null || debounceTimeout.current?.[pluginName] !== undefined) {
        clearTimeout(debounceTimeout.current?.[pluginName]);
      }
      debounceTimeout.current[pluginName] = setTimeout(() => {
        updatePluginState.mutate({
          state: stateData,
          id,
          pluginName,
        });
      }, 300);
    },
    []
  );

  useEffect(() => {
    const incoming = {};
    const onMessage = ({
      data,
    }: {
      data:
        | Packet
        | "ready"
        | "toggle-vcs"
        | "toggle-command-mode"
        | "toggle-before"
        | "toggle-after"
        | "toggle-compare-mode"
        | "toggle-branches"
        | "clear-client-storage";
    }) => {
      if (data == "ready") {
        setHasLoaded(true);
        return;
      }
      if (data == "toggle-vcs") {
        onToggleVCSContainer();
        return;
      }
      if (data == "toggle-command-mode") {
        props.onToggleCommandMode();
        return;
      }

      if (data == "toggle-compare-mode") {
        props.onToggleCompareMode();
        return;
      }

      if (data == "toggle-before") {
        props.onToggleBefore();
        return;
      }

      if (data == "toggle-after") {
        props.onToggleAfter();
        return;
      }

      if (data == "toggle-branches") {
        props.onToggleBranches();
        return;
      }
      if (data == "clear-client-storage") {
        onClearStorage();
        return;
      }

      if (typeof data == "string") {
        return;
      }
      if (data.command == "abort") {
        if (data.id != undefined && incoming[data.id]) {
          delete incoming[data.id];
        }
        return;
      }
      if (!incoming[data.id]) {
        incoming[data.id] = {
          counter: 0,
          data: new Array(data.totalPackets + 1),
          command: data.command
        };
      }
      incoming[data.id].data[data.index] = data.chunk;
      incoming[data.id].counter++;
      if (incoming[data.id].counter == data.totalPackets + 1) {
        const state: { command: string; data: unknown } = JSON.parse(
          incoming[data.id].data.join("")
        );
        const id = data.id;
        if (id && state.command == "save") {
          if (updateCounter.current < id) {
            updateCounter.current = id +1;
          }
          clientUpdateCounter.current = id;
          if (props.apiResponse.repoState?.commandMode == "edit") {
            onUpdateState(state?.data, id, data?.pluginName);
          }
        }
        if (id && state.command == "update-copy") {
          if (updateCounter.current < id) {
            updateCounter.current = id +1;
          }
          clientUpdateCounter.current = id;
          if (isCopyMode) {
            onUpdateCopyInstructions(state.data as Array<string>)
          }
        }
        if (id && state.command == "update-client-storage") {
          if (updateCounter.current < id) {
            updateCounter.current = id +1;
          }
          clientUpdateCounter.current = id;
          updatePluginClientStorage.mutate({
            storage: state.data as object,
            id
          })
        }
        delete incoming[data.id];
      }
    };
    window.addEventListener("message", onMessage, true);
    return () => {
      window.removeEventListener("message", onMessage, true);
    };
  }, [props.pluginName, onToggleVCSContainer, props.onToggleCommandMode, isCopyMode, props.apiResponse.repoState?.commandMode, onUpdateCopyInstructions]);

  if (!iframeUri || !pluginState.rootSchemaMap?.[props.pluginName]) {
    return null;
  }
  return (
    <div
      style={{
        width: "100%",
        height: "100%",
        overflow: "hidden",
      }}
    >
      <iframe
        sandbox="allow-scripts allow-downloads"
        allow="clipboard-read *; clipboard-write *;"
        ref={iframeRef}
        style={{
          width: "100%",
          height: "100%",
          border: 0,
        }}
        seamless
        src={iframeUri}
      />
    </div>
  );
};

export default React.memo(LocalPluginController);
