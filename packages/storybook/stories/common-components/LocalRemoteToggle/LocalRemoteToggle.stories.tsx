import { useState } from "react";
import LocalRemoteToggle from "./index";

import ColorPalette from "@floro/styles/ColorPalette";

export default {
  title: "floro-app/common-components/LocalRemoteToggle",
  component: LocalRemoteToggle,
  argTypes: {},
};

const Template = (args) => {
  const [tab, setTab] = useState(args.tab);
  return (
    <div
      style={{
        maxWidth: 504,
      }}
    >
      <LocalRemoteToggle tab={tab} onChange={setTab} />
    </div>
  );
};

export const Primary: any = Template.bind({});
Primary.args = {
  tab: "local",
};