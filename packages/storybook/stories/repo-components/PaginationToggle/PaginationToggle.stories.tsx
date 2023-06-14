import PaginationToggle from "./index";

// More on default export: https://storybook.js.org/docs/react/writing-stories/introduction#default-export
export default {
  title: "floro-app/repo-components/PaginationToggle",
  component: PaginationToggle,
  // More on argTypes: https://storybook.js.org/docs/react/api/argtypes
  argTypes: {},
};

// More on component templates: https://storybook.js.org/docs/react/writing-stories/introduction#using-args
const Template = (args) => {
  return (
    <PaginationToggle {...args} />
  );
};

export const Primary: any = Template.bind({});
// More on args: https://storybook.js.org/docs/react/writing-stories/args
Primary.args = {
  newerDisabled: false,
  olderDisabled: false,
};
