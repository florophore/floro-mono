import UserSettingsTab from "./index";

export default {
  title: "floro-app/common-components/UserSettingsTab",
  component: UserSettingsTab,
  argTypes: {},
};

const Template = (args) => <div style={{maxWidth: 263}}><UserSettingsTab {...args} /></div>

export const Primary: any = Template.bind({});
Primary.args = {
};