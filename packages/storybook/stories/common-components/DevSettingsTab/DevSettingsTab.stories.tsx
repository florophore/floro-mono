import DevSettingsTab from "./index";

export default {
  title: "floro-app/common-components/DevSettingsTab",
  component: DevSettingsTab,
  argTypes: {},
};

const Template = (args) => <div style={{maxWidth: 263}}><DevSettingsTab {...args} /></div>

export const Primary: any = Template.bind({});
Primary.args = {
};