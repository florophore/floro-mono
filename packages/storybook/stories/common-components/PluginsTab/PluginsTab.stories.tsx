import PluginsTab from "./index";

export default {
  title: "floro-app/common-components/PluginsTab",
  component: PluginsTab,
  argTypes: {},
};

const Template = (args) => <div style={{maxWidth: 263}}><PluginsTab {...args} /></div>

export const Primary: any = Template.bind({});
Primary.args = {
};