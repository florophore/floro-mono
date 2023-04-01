import React, {
  useState,
  useRef,
  useMemo,
  useEffect,
  useCallback,
} from "react";
import { ApiReponse } from "@floro/floro-lib/src/repo";
import { Repository } from "@floro/graphql-schemas/src/generated/main-client-graphql";
import { useUpdateCurrentCommand, useUpdatePluginState } from "../local/hooks/local-hooks";

interface Props {
  pluginName: string;
  apiResponse: ApiReponse;
  repository: Repository;
  isExpanded: boolean;
  onSetIsExpanded: (isExpanded: boolean) => void;
  onToggleCommandMode: () => void;
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
    if (!props.apiResponse.schemaMap?.[props.pluginName]) {
      return null;
    }
    return props.apiResponse.schemaMap?.[props.pluginName];
  }, [props.pluginName, props.apiResponse.schemaMap]);

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
      out[plugin] = props?.apiResponse?.applicationState?.store?.[plugin] ?? {};
    }
    return out;
  }, [manifest, props.apiResponse?.applicationState]);

  const apiStoreInvalidity = useMemo(() => {
    if (!manifest) {
      return {};
    }
    const keys = [manifest.name, ...Object.keys(manifest.imports)];
    const out = {};
    for (const plugin of keys) {
      out[plugin] = props?.apiResponse?.apiStoreInvalidity?.[plugin] ?? {};
    }
    return out;
  }, [manifest, props?.apiResponse?.apiStoreInvalidity]);

  const pluginState = useMemo(() => {
    return {
      applicationState,
      apiStoreInvalidity,
      commandMode: props?.apiResponse?.repoState?.commandMode ?? "view",
    };
  }, [applicationState, apiStoreInvalidity, props?.apiResponse?.repoState?.commandMode]);

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
    const onMessage = ({ data }: { data: Packet|"ready"|"toggle-vcs"|"toggle-command-mode" }) => {
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
          updatePluginState.mutate({ state: state?.data, id, pluginName: data?.pluginName });
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
    return <div>{"missing plugin"}</div>;
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
        ref={iframeRef}
        style={{
          width: "100%",
          height: "100%",
          border: 0,
        }}
        seamless
        src={"http://localhost:63403/plugins/palette/dev"}
      />
    </div>
  );
};

export default React.memo(LocalPluginController);
