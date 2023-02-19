import React, { useCallback, useState, useMemo } from "react";
import PluginController from "@floro/storybook/stories/common-components/PluginController";
import PluginNoVersion from "@floro/storybook/stories/common-components/PluginNoVersion";
import PluginDetails from "./PluginDetails";
import RegisterPluginModal from "./RegisterPluginModal";
import {
  Plugin,
  PluginVersion,
} from "@floro/graphql-schemas/src/generated/main-client-graphql";
import { useOfflineIconMap } from "../../offline/OfflineIconsContext";

interface Props {
  accountType: "user" | "org";
  plugins: Plugin[];
  linkPrefix: string;
  currentPlugin?: Plugin | null;
  currentVersion?: PluginVersion | null;
  onPressOpenDocs: () => void;
  canRelease: boolean;
}

const PluginEditor = (props: Props) => {
  const [showRegistry, setShowRegistery] = useState(false);

  const icons = useOfflineIconMap();

  const onPressRegisterNewPlugin = useCallback(() => {
    setShowRegistery(true);
  }, []);

  const onCloseRegisterNewPluginModal = useCallback(() => {
    setShowRegistery(false);
  }, []);

  const content = useMemo(() => {
    if (!props.currentVersion || !props.currentPlugin) {
      return (
        <PluginNoVersion
          onPressOpenDocs={props.onPressOpenDocs}
          icons={icons}
          currentPlugin={props.currentPlugin}
        />
      );
    }
    return (
      <PluginDetails
        plugin={props.currentPlugin}
        pluginVersion={props.currentVersion}
        linkPrefix={props.linkPrefix}
        icons={icons}
        canRelease={props.canRelease}
      />
    );
  }, [props.currentPlugin, props.currentVersion, icons]);

  return (
    <>
      <PluginController
        linkPrefix={props.linkPrefix}
        currentPlugin={props.currentPlugin}
        icons={icons}
        plugins={props.plugins}
        onPressRegisterNewPlugin={onPressRegisterNewPlugin}
      >
        <>{content}</>
      </PluginController>
      <RegisterPluginModal
        accountType={props.accountType}
        show={showRegistry}
        onDismiss={onCloseRegisterNewPluginModal}
      />
    </>
  );
};

export default React.memo(PluginEditor);
