import React, {
  useState,
  useRef,
  useMemo,
  useEffect,
  useCallback,
} from "react";
import { ApiResponse } from "@floro/floro-lib/src/repo";
import { Repository } from "@floro/graphql-schemas/src/generated/main-client-graphql";
import { useUpdatePluginState } from "../local/hooks/local-hooks";
import { useLocalVCSNavContext } from "../local/vcsnav/LocalVCSContext";

interface Props {
  pluginName: string;
  apiResponse: ApiResponse;
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
  id: string;
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
  id?: string
) => {
  if (!id) {
    id = Math.random().toString(16).substring(2);
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
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [hasLoaded, setHasLoaded] = useState(false);
  const [hasSentFirstData, setHasSetFirstData] = useState(false);
  const [ackId, setAckId] = useState<string | null>(null);
  const { compareFrom } = useLocalVCSNavContext();

  const updatePluginState = useUpdatePluginState(
    props.pluginName,
    props.repository
  );
  const onToggleVCSContainer = useCallback(() => {
    props.onSetIsExpanded(!props.isExpanded);
  }, [props.isExpanded, props.onSetIsExpanded]);

  useEffect(() => {
    setHasLoaded(false);
  }, [props.pluginName]);

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
      }
    }
    return {
      upload: null,
      download: "http://localhost:63403/binary",
    }
  }, [
    props?.apiResponse?.repoState?.commandMode,
    props?.apiResponse?.repoState?.comparison,
  ]);

  const pluginState = useMemo(() => {
    return {
      changeset,
      applicationState,
      apiStoreInvalidity,
      conflictList,
      binaryUrls,
      compareFrom: props?.apiResponse?.repoState?.commandMode == "compare" ? compareFrom : "none",
      commandMode: props?.apiResponse?.repoState?.commandMode ?? "view",
    };
  }, [
    changeset,
    applicationState,
    apiStoreInvalidity,
    conflictList,
    binaryUrls,
    props?.apiResponse?.repoState?.commandMode,
    props?.apiResponse?.repoState?.comparison,
  ]);

  useEffect(() => {
    if (hasLoaded && !hasSentFirstData && iframeRef.current) {
      sendMessage(iframeRef.current, "load", pluginState);
      setHasSetFirstData(true);
    }
  }, [hasLoaded, hasSentFirstData, pluginState,
    props?.apiResponse?.repoState?.comparison,
  ]);

  useEffect(() => {
    if (ackId) {
      if (iframeRef.current) {
        sendMessage(iframeRef.current, "ack", pluginState, ackId);
      }
      setAckId(null);
    }
  }, [ackId, pluginState,

    props?.apiResponse?.repoState?.comparison,

  ]);

  useEffect(() => {
    if (iframeRef.current && hasLoaded && hasSentFirstData) {
        sendMessage(iframeRef.current, "update", pluginState);
    }
  }, [pluginState,
    props?.apiResponse?.repoState?.comparison,
  ]);

  useEffect(() => {
    if (updatePluginState?.data?.id) {
      setAckId(updatePluginState?.data?.id);
    }
  }, [updatePluginState?.data?.id]);

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
        | "toggle-branches";
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
        if (id && state.command == "save") {
          updatePluginState.mutate({
            state: state?.data,
            id,
            pluginName: data?.pluginName,
          });
        }
        delete incoming[data.id];
      }
    };
    window.addEventListener("message", onMessage, true);
    return () => {
      window.removeEventListener("message", onMessage, true);
    };
  }, [props.pluginName, onToggleVCSContainer, props.onToggleCommandMode]);

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

export default React.memo(LocalPluginController);
