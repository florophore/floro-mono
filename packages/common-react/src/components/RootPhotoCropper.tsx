import React from "react";
import ReactDOM from "react-dom";
import usePortal from "../hooks/use-portal";
import PhotoCropper, {
  CropArea,
} from "@floro/storybook/stories/common-components/PhotoCropper";

export interface Props {
  title: string;
  src: string;
  show: boolean;
  isLoading: boolean;
  isDisabled: boolean;
  onCancel: () => void;
  onSave: (croppedArea: CropArea) => void;
}

const RootPhotoCropper = (props: Props) => {
  const target = usePortal("modal-photo-cropper");
  return ReactDOM.createPortal(
    <PhotoCropper
      show={props.show}
      title={props.title}
      src={props.src}
      isLoading={props.isLoading}
      isDisabled={props.isDisabled}
      onCancel={props.onCancel}
      onSave={props.onSave}
    />,
    target
  );
};

export default React.memo(RootPhotoCropper);
