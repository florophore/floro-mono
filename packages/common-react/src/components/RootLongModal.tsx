import React from "react";
import ReactDOM from "react-dom";
import usePortal from "../hooks/use-portal";
import LongModal from "@floro/storybook/stories/common-components/LongModal";

export interface Props {
  show?: boolean;
  onDismiss?: () => void;
  children?: React.ReactElement | React.ReactElement[];
  disableBackgroundDismiss?: boolean;
  showExitIcon?: boolean;
  headerChildren?: React.ReactElement | React.ReactElement[];
  headerSize?: "small"|"normal";
}

const RootModal = (props: Props) => {
  const target = usePortal("long-modal-root");
  return ReactDOM.createPortal(
    <LongModal
      show={props.show}
      onDismiss={props?.onDismiss}
      headerChildren={props?.headerChildren}
      showExitIcon={props?.showExitIcon}
      disableBackgroundDismiss={props?.disableBackgroundDismiss}
      headerSize={props?.headerSize}
    >
      {props?.children}
    </LongModal>,
    target
  );
};

export default React.memo(RootModal);
