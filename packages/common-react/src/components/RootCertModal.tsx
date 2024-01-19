import React from "react";
import ReactDOM from "react-dom";
import usePortal from "../hooks/use-portal";
import CertModal from "@floro/storybook/stories/common-components/CertModal";

export interface Props {
  title: string;
  show: boolean;
  isApiKeysDisabled: boolean;
  page: 'cert'|'api-keys';
  onChangePage: (page: 'cert'|'api-keys') => void;
  onClose: () => void;
  children: React.ReactElement
}

const RootCertModal = (props: Props) => {
  const target = usePortal("modal-certs");
  return ReactDOM.createPortal(
    <CertModal
      show={props.show}
      title={props.title}
      isApiKeysDisabled={props.isApiKeysDisabled}
      page={props.page}
      onChangePage={props.onChangePage}
      children={props.children}
      onClose={props.onClose}
    />,
    target
  );
};

export default React.memo(RootCertModal);
