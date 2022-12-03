
import MembersInfoTab from "./index";

export default {
  title: "floro-app/common-components/MembersInfoTab",
  component: MembersInfoTab,
  argTypes: {},
};

const Template = (args) => <div style={{maxWidth: 263}}><MembersInfoTab {...args} /></div>

export const Primary: any = Template.bind({});
Primary.args = {
  membersCount: 0,
  invitedCount: 0,
};