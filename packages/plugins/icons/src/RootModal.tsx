import React from "react";
import ReactDOM from "react-dom";
import usePortal from "./use-portal";
import IconModal from "./IconModal";

export interface Props {
  show?: boolean;
  onDismiss?: () => void;
  children?: React.ReactElement | React.ReactElement[];
  headerChildren?: React.ReactElement | React.ReactElement[];
  title: string;
  left?: React.ReactElement | React.ReactElement[];
}

const RootModal = (props: Props) => {
  const target = usePortal("modal-root");
  return ReactDOM.createPortal(
    <IconModal
      left={props.left}
      show={props?.show ?? false}
      onDismiss={props?.onDismiss}
      title={props.title}
    >
      {props?.children}
    </IconModal>,
    target
  );
};

export default React.memo(RootModal);