import { Manifest } from "@floro/floro-lib/src/plugins";
import { ApiResponse } from "@floro/floro-lib/src/repo";
import { Repository, Plugin, PluginVersion } from "@floro/graphql-schemas/src/generated/main-client-graphql";
import React from "react";
import ReactDOM from "react-dom";
import usePortal from "../hooks/use-portal";
import AddPluginsModal from "./repository/home/plugin_modal/AddPluginsModal";

export interface Props {
  onDismiss: () => void;
  show: boolean;
  apiReponse: ApiResponse;
  repository: Repository;
  repoManifestList: Array<Manifest>;
  onChangePluginVersion: (plugin?: Plugin, pluginVersion?: PluginVersion) => void;
  selectedPlugin?: Plugin;
  selectedPluginVersion?: PluginVersion;
  developerPlugin: Array<Plugin>;
  suggestedPlugin: Array<Plugin>;
}

const RootFindPluginModal = (props: Props) => {
  const target = usePortal("modal-plugin-finder");
  return ReactDOM.createPortal(
    <AddPluginsModal
      show={props.show}
      onDismiss={props.onDismiss}
      apiReponse={props.apiReponse}
      repository={props.repository}
      repoManifestList={props.repoManifestList}
      onChangePluginVersion={props.onChangePluginVersion}
      selectedPlugin={props.selectedPlugin}
      selectedPluginVersion={props.selectedPluginVersion}
      developerPlugin={props.developerPlugin}
      suggestedPlugin={props.suggestedPlugin}
    />,
    target
  );
};

export default React.memo(RootFindPluginModal);