import React, {
  useState,
  useRef,
  useMemo,
  useEffect,
  useCallback,
} from "react";
import { ApiResponse } from "floro/dist/src/repo";
import { Repository } from "@floro/graphql-schemas/src/generated/main-client-graphql";
import { useUpdatePluginState } from "../local/hooks/local-hooks";
import { useLocalVCSNavContext } from "../local/vcsnav/LocalVCSContext";
import { ComparisonState, RemoteCommitState, useBeforeCommitState, useMainCommitState, useRemoteCompareFrom, useViewMode } from "../remote/hooks/remote-state";
import { RepoPage } from "../types";
import { useCopyPasteContext } from "../copypaste/CopyPasteContext";
import { useRootSchemaMap } from "../remote/hooks/remote-hooks";



interface Packet {
  id: number;
  chunk: string;
  index: number;
  totalPackets: number;
  pluginName: string;
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

interface Props {
  pluginName: string;
  repository: Repository;
  remoteCommitState: RemoteCommitState;
  comparisonState: ComparisonState;
  isExpanded: boolean;
  onSetIsExpanded: (isExpanded: boolean) => void;
  page: RepoPage;
}

const RemotePluginController = (props: Props) => {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [hasLoaded, setHasLoaded] = useState(false);
  const [hasSentFirstData, setHasSetFirstData] = useState(false);
  const [ackId, setAckId] = useState<string | null>(null);
  const { isSelectMode, copyInstructions, setCopyInstructions } = useCopyPasteContext("remote");
  const updateCounter = useRef(0);

  const { compareFrom } = useRemoteCompareFrom();
  const beforeCommitState = useBeforeCommitState(props.repository, props.page);
  const viewMode = useViewMode(props.page);

  const onToggleVCSContainer = useCallback(() => {
    props.onSetIsExpanded(!props.isExpanded);
  }, [props.isExpanded, props.onSetIsExpanded]);

  useEffect(() => {
    setHasLoaded(false);
  }, [props.pluginName]);

  const manifest = useMemo(() => {

    if (viewMode == "compare" && compareFrom == "before") {
      if (!props.comparisonState.beforeRemoteCommitState.schemaMap?.[props.pluginName]) {
        return null;
      }
      return props.comparisonState.beforeRemoteCommitState.schemaMap?.[props.pluginName];
    }
    if (!props.remoteCommitState.schemaMap?.[props.pluginName]) {
      return null;
    }
    return props.remoteCommitState.schemaMap?.[props.pluginName];
  }, [
    viewMode,
    compareFrom,
    props.comparisonState.beforeRemoteCommitState.schemaMap,
    props.remoteCommitState.schemaMap,
    props.pluginName,
  ]);

  const schemaMap = useMemo(() => {
    if (viewMode == "compare" && compareFrom == "before") {
      return props.comparisonState.beforeRemoteCommitState.schemaMap;
    }
    return props.remoteCommitState.schemaMap;
  }, [
    viewMode,
    compareFrom,
    props.comparisonState.beforeRemoteCommitState.schemaMap,
    props.remoteCommitState.schemaMap,
  ]);


  const rootSchemaMapRequest = useRootSchemaMap(manifest, schemaMap)

  const commitState = useMainCommitState(props.page, props.repository);

  const isCopyMode = useMemo(() => {
    if (!manifest?.managedCopy) {
      return false;
    }
    if (!isSelectMode) {
      return false;
    }
    if (!manifest.name || !copyInstructions[manifest.name].isManualCopy) {
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

    if (viewMode == "compare" && compareFrom == "before") {
      const pluginVersion =
        beforeCommitState?.pluginVersions?.find?.(
          (pv) => {
            return pv?.name == props.pluginName;
          }
        );
      if (!pluginVersion) {
        return null;
      }
      return pluginVersion.entryUrl;
    }
    const pluginVersion =
      commitState?.pluginVersions?.find?.(
        (pv) => {
          return pv?.name == props.pluginName;
        }
      );
    if (!pluginVersion) {
      return null;
    }
    return pluginVersion.entryUrl;
  }, [
    viewMode,
    compareFrom,
    commitState?.pluginVersions,
    beforeCommitState?.pluginVersions,
    props.pluginName,
  ]);

  const applicationState = useMemo(() => {
    if (!manifest) {
      return {};
    }
    const keys = [manifest.name, ...Object.keys(manifest.imports)];
    const out = {};
    for (const plugin of keys) {

      if (viewMode == "compare" && compareFrom == "before") {
        out[plugin] = props.comparisonState.beforeRemoteCommitState?.renderedState?.store?.[plugin] ?? {};
      } else {
        out[plugin] =
          props.remoteCommitState?.renderedState?.store?.[plugin] ?? {};
      }
    }
    return out;
  }, [
    manifest,
    viewMode,
    compareFrom,
    props.comparisonState.beforeRemoteCommitState?.renderedState,
    props.remoteCommitState?.renderedState,
  ]);

  const apiStoreInvalidity = useMemo(() => {
    if (!manifest) {
      return {};
    }
    const keys = [manifest.name, ...Object.keys(manifest.imports)];
    const out = {};
    for (const plugin of keys) {
      if (viewMode == "compare" && compareFrom == "before") {
        out[plugin] = props.comparisonState?.beforeRemoteCommitState?.invalidStates?.[plugin] ?? {};
      } else {
        out[plugin] = props.remoteCommitState?.invalidStates?.[plugin] ?? {};
      }
    }
    return out;
  }, [
    manifest,
    viewMode,
    compareFrom,
    props.comparisonState.beforeRemoteCommitState?.invalidStates,
    props.remoteCommitState?.invalidStates,
  ]);

  const binaryUrls = useMemo(() => {
    return {
      upload: null,
      download: null,
      binaryToken: null
    }
  }, []);


  const binaryMap = useMemo(() => {
    const out: {[key: string]: string} = {};
    if (viewMode == "compare" && compareFrom == "before") {
      for (const binaryRef of (beforeCommitState?.binaryRefs ?? [])) {
          if (binaryRef?.fileName && binaryRef?.url) {
              out[binaryRef?.fileName] = binaryRef?.url;
          }
      }
    } else {

      for (const binaryRef of (commitState?.binaryRefs ?? [])) {
          if (binaryRef?.fileName && binaryRef?.url) {
              out[binaryRef?.fileName] = binaryRef?.url;
          }
      }
    }
    return out;
  }, [
    manifest,
    viewMode,
    compareFrom,
    commitState?.binaryRefs,
    beforeCommitState?.binaryRefs
  ]);
  const changeset = useMemo(() => {
    if (viewMode != "compare" || !manifest) {
      return []
    }
    const out: Array<string> = [];
    const keys = [manifest.name, ...Object.keys(manifest.imports)];
    for (const plugin of keys) {
      if (compareFrom == "before"
      ) {
        out.push(
          ...(props?.comparisonState?.apiDiff?.store?.[plugin]?.removed ?? [])
        );
      } else {
        out.push(
          ...(props?.comparisonState?.apiDiff?.store?.[plugin]?.added ?? [])
        );
      }
    }
    return out;
  }, [
    manifest,
    viewMode,
    props?.comparisonState?.apiDiff,
    compareFrom,
  ])

  const pluginState = useMemo(() => {
    return {
      changeset,
      applicationState,
      apiStoreInvalidity,
      conflictList: [],
      binaryUrls,
      compareFrom: viewMode == "view" ? "none" :  compareFrom,
      commandMode: viewMode,
      binaryMap,
      isCopyMode,
      copyList,
      rootSchemaMap: rootSchemaMapRequest?.data,
      clientStorage: {}
    };
  }, [
    applicationState,
    apiStoreInvalidity,
    binaryUrls,
    binaryMap,
    changeset,
    compareFrom,
    viewMode,
    isCopyMode,
    copyList,
    rootSchemaMapRequest?.data
  ]);

  useEffect(() => {
    if (hasLoaded && !hasSentFirstData && iframeRef.current) {
      updateCounter.current += 2;
      sendMessage(iframeRef.current, "load", pluginState);
      setHasSetFirstData(true);
    }
  }, [hasLoaded, hasSentFirstData, pluginState]);

  useEffect(() => {
    if (ackId) {
      if (iframeRef.current) {
        updateCounter.current += 2;
        sendMessage(iframeRef.current, "ack", pluginState, updateCounter.current);
      }
      setAckId(null);
    }
  }, [ackId, pluginState]);

  useEffect(() => {
    if (iframeRef.current && hasLoaded && hasSentFirstData) {
        updateCounter.current += 2;
        sendMessage(iframeRef.current, "update", pluginState);
    }
  }, [pluginState]);

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
  }, [isCopyMode, copyInstructions, manifest?.name])

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
      if (data == "clear-client-storage") {
        return;
      }
      //if (data == "toggle-command-mode") {
      //  props.onToggleCommandMode();
      //  return;
      //}

      //if (data == "toggle-compare-mode") {
      //  props.onToggleCompareMode();
      //  return;
      //}

      //if (data == "toggle-before") {
      //  props.onToggleBefore();
      //  return;
      //}

      //if (data == "toggle-after") {
      //  props.onToggleAfter();
      //  return;
      //}

      //if (data == "toggle-branches") {
      //  props.onToggleBranches();
      //  return;
      //}

      if (typeof data == "string") {
        return;
      }
      if (!incoming[data.id]) {
        incoming[data.id] = {
          counter: 0,
          data: new Array(data.totalPackets + 1),
        };
      }
      incoming[data.id].data[data.index] = data.chunk;
      incoming[data.id].counter++;
      if (incoming[data.id].counter == data.totalPackets + 1) {
        const state: { command: string; data: unknown } = JSON.parse(
          incoming[data.id].data.join("")
        );
        const id = data.id;
        if (updateCounter.current < id) {
          updateCounter.current = id +1;
        }
        if (id && state.command == "update-copy") {
          if (isCopyMode) {
            onUpdateCopyInstructions(state.data as Array<string>)
          }
        }
        delete incoming[data.id];
      }
    };
    window.addEventListener("message", onMessage, true);
    return () => {
      window.removeEventListener("message", onMessage, true);
    };
  }, [props.pluginName, onToggleVCSContainer, isCopyMode, onUpdateCopyInstructions]);

  if (!iframeUri) {
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
        sandbox="allow-scripts"
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

export default React.memo(RemotePluginController);