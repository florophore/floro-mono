import React from "react";
import ReactDOM from "react-dom";
import usePortal from "../hooks/use-portal";
import Modal from "@floro/storybook/stories/common-components/Modal";

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
  const target = usePortal("modal-root");
  return ReactDOM.createPortal(
    <Modal
      show={props.show}
      onDismiss={props?.onDismiss}
      headerChildren={props?.headerChildren}
      showExitIcon={props?.showExitIcon}
      disableBackgroundDismiss={props?.disableBackgroundDismiss}
      headerSize={props?.headerSize}
    >
      {props?.children}
    </Modal>,
    target
  );
};

export default React.memo(RootModal);
