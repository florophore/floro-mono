import React, { useCallback, useState, useMemo } from "react";
import PluginController from "@floro/storybook/stories/common-components/PluginController";
import PluginNoVersion from "@floro/storybook/stories/common-components/PluginNoVersion";
import PluginDetails from "./PluginDetails";
import RegisterPluginModal from "./RegisterPluginModal";
import {
  Organization,
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
  onPressOpenDocs?: () => void;
  canRelease: boolean;
  canRegister: boolean;
  isProfileMode?: boolean;
  organization?: Organization;
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
      if (props.isProfileMode) {
        return null;
      }
      return (
        <PluginNoVersion
          onPressOpenDocs={props.onPressOpenDocs}
          icons={icons}
          currentPlugin={props.currentPlugin}
          organization={props.organization}
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
        isProfileMode={props.isProfileMode}
        organization={props.organization}
      />
    );
  }, [props.currentPlugin, props.currentVersion, icons, props.isProfileMode, props?.organization]);

  return (
    <>
      <PluginController
        linkPrefix={props.linkPrefix}
        currentPlugin={props.currentPlugin}
        organization={props.organization}
        icons={icons}
        plugins={props.plugins}
        onPressRegisterNewPlugin={onPressRegisterNewPlugin}
        isProfileMode={props.isProfileMode}
        canRegister={props.canRegister}
      >
        <>{content}</>
      </PluginController>
      <RegisterPluginModal
        accountType={props.accountType}
        show={showRegistry}
        onDismiss={onCloseRegisterNewPluginModal}
        organization={props.organization}
      />
    </>
  );
};

export default React.memo(PluginEditor);
