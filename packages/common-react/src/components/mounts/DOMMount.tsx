import React from "react";

export interface Props {
  children: React.ReactElement;
}
const DOMMount = (props: Props) => {
  return (
    <>
      {props?.children}
      <div id="modal-root" />
    </>
  );
};

export default React.memo(DOMMount);
