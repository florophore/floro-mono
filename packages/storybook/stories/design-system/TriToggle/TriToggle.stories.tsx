import { useState } from "react";
import TriToggle from "./index";

// More on default export: https://storybook.js.org/docs/react/writing-stories/introduction#default-export
export default {
  title: "floro-app/design-system/TriToggle",
  component: TriToggle,
  // More on argTypes: https://storybook.js.org/docs/react/api/argtypes
  argTypes: {},
};

// More on component templates: https://storybook.js.org/docs/react/writing-stories/introduction#using-args
const Template = (args) => {
  const [value, setValue] = useState("all");
  return (
    <TriToggle {...args} onChange={(value) => setValue(value)} value={value} />
  );
};

export const Primary: any = Template.bind({});
// More on args: https://storybook.js.org/docs/react/writing-stories/args
Primary.args = {
  leftOption: {
    value: "all",
    label: "all",
  },
  midOption: {
    value: "staging",
    label: "staging",
  },
  rightOption: {
    value: "released",
    label: "released",
  },
};
