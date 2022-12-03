import MemberSettingsTab from "./index";

export default {
  title: "floro-app/common-components/MemberSettingsTab",
  component: MemberSettingsTab,
  argTypes: {},
};

const Template = (args) => <div style={{maxWidth: 263}}><MemberSettingsTab {...args} /></div>

export const Primary: any = Template.bind({});
Primary.args = {
};