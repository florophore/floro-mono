import { useState } from "react";
import Modal from "./index";

export default {
  title: "floro-app/common-components/Modal",
  component: Modal,
  argTypes: {},
};

const Template = (args) => {
  const [show, setShow] = useState(args?.show);

  return (
    <div style={{ position: "relative" }}>
      <div style={{ padding: 24 }}>
        <h1>Testing background</h1>
        <button onClick={() => setShow(true)}>show</button>
      </div>
      <Modal
        headerSize={args.headerSize}
        onDismiss={() => setShow(false)}
        show={show}
        disableBackgroundDismiss={args.disableBackgroundDismiss}
      ></Modal>
    </div>
  );
};

export const Primary: any = Template.bind({});
Primary.args = {
  disableBackgroundDismiss: false,
};
