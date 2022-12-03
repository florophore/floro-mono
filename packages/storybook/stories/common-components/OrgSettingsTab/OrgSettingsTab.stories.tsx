import OrgSettingsTab from "./index";

export default {
  title: "floro-app/common-components/OrgSettingsTab",
  component: OrgSettingsTab,
  argTypes: {},
};

const Template = (args) => <div style={{maxWidth: 263}}><OrgSettingsTab {...args} /></div>

export const Primary: any = Template.bind({});
Primary.args = {
};