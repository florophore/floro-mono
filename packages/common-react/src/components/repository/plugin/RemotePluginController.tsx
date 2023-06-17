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
import { RemoteCommitState } from "../remote/hooks/remote-state";



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

interface Props {
  pluginName: string;
  repository: Repository;
  remoteCommitState: RemoteCommitState;
  isExpanded: boolean;
  onSetIsExpanded: (isExpanded: boolean) => void;
}

const RemotePluginController = (props: Props) => {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [hasLoaded, setHasLoaded] = useState(false);
  const [hasSentFirstData, setHasSetFirstData] = useState(false);
  const [ackId, setAckId] = useState<string | null>(null);

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
    return props.remoteCommitState.schemaMap?.[props.pluginName];
  }, [
    props.remoteCommitState.schemaMap,
    props.pluginName,
  ]);

  const iframeUri = useMemo(() => {
    const pluginVersion = props?.repository?.branchState?.commitState?.pluginVersions?.find?.(pv => {
        return pv?.name == props.pluginName;
    })
    if (!pluginVersion) {
      return null;
    }
    return pluginVersion.entryUrl;
  }, [props?.repository?.branchState?.commitState?.pluginVersions, props.pluginName]);

  const applicationState = useMemo(() => {
    if (!manifest) {
      return {};
    }
    const keys = [manifest.name, ...Object.keys(manifest.imports)];
    const out = {};
    for (const plugin of keys) {
        out[plugin] = props.remoteCommitState?.renderedState?.store?.[plugin] ?? {};
    }
    return out;
  }, [manifest,
     props.remoteCommitState?.renderedState,
    ]);

  const apiStoreInvalidity = useMemo(() => {
    if (!manifest) {
      return {};
    }
    const keys = [manifest.name, ...Object.keys(manifest.imports)];
    const out = {};
    for (const plugin of keys) {
      out[plugin] = props.remoteCommitState?.invalidStates?.[plugin] ?? {};
    }
    return out;
  }, [
    manifest,
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
    for (const binaryRef of (props?.repository?.branchState?.commitState?.binaryRefs ?? [])) {
        if (binaryRef?.fileName && binaryRef?.url) {
            out[binaryRef?.fileName] = binaryRef?.url;
        }
    }
    return out;
  }, [
    manifest,
    props?.repository?.branchState?.commitState?.binaryRefs,
  ])

  const pluginState = useMemo(() => {
    return {
      changeset: [],
      applicationState,
      apiStoreInvalidity,
      conflictList: [],
      binaryUrls,
      compareFrom: "none",
      commandMode: "view",
      binaryMap
    };
  }, [
    applicationState,
    apiStoreInvalidity,
    binaryUrls,
    binaryMap
  ]);

  useEffect(() => {
    if (hasLoaded && !hasSentFirstData && iframeRef.current) {
      sendMessage(iframeRef.current, "load", pluginState);
      setHasSetFirstData(true);
    }
  }, [hasLoaded, hasSentFirstData, pluginState]);

  useEffect(() => {
    if (ackId) {
      if (iframeRef.current) {
        sendMessage(iframeRef.current, "ack", pluginState, ackId);
      }
      setAckId(null);
    }
  }, [ackId, pluginState]);

  useEffect(() => {
    if (iframeRef.current && hasLoaded && hasSentFirstData) {
        sendMessage(iframeRef.current, "update", pluginState);
    }
  }, [pluginState]);

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
        if (id && state.command == "save") {
            // do no update anything
          //updatePluginState.mutate({
          //  state: state?.data,
          //  id,
          //  pluginName: data?.pluginName,
          //});
        }
        delete incoming[data.id];
      }
    };
    window.addEventListener("message", onMessage, true);
    return () => {
      window.removeEventListener("message", onMessage, true);
    };
  }, [props.pluginName, onToggleVCSContainer]);

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