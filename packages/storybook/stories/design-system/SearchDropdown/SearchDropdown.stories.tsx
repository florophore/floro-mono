import SearchDropdown from "./index";

export default {
  title: "floro-app/design-system/SearchDropdown",
  component: SearchDropdown,
  argTypes: {},
};

const Template = (args) => <div style={{maxWidth: 263}}><SearchDropdown {...args} /></div>

export const Primary: any = Template.bind({});
Primary.args = {
};