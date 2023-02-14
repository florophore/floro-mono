import PluginController from "./index";

export default {
  title: "floro-app/common-components/PluginController",
  component: PluginController,
  argTypes: {},
};

const Template = (args) => <div style={{width: '100%', height: 800, border: '1px solid lightgray'}}><PluginController {...args} /></div>

export const Primary: any = Template.bind({});
Primary.args = {
};