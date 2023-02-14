import React, { useCallback, useState} from "react";
import PluginController from "@floro/storybook/stories/common-components/PluginController";
import RegisterPluginModal from "./RegisterPluginModal";
import { Plugin } from "@floro/graphql-schemas/src/generated/main-client-graphql";

interface Props {
  accountType: "user"|"org";
  plugins: Plugin[];
}

const PluginEditor = (props: Props) => {
  console.log("PROPS", props.plugins);
  const [showRegistry, setShowRegistery] = useState(false); 

  const onPressRegisterNewPlugin = useCallback(() => {
    setShowRegistery(true);
  }, []);

  const onCloseRegisterNewPluginModal = useCallback(() => {
    setShowRegistery(false);
  }, []);

  return (
    <>
      <PluginController
        plugins={[]}
        onPressRegisterNewPlugin={onPressRegisterNewPlugin}
      >
        <div style={{ width: "100%" }}>{"hello world test"}</div>
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