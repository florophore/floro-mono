
import OrgFollowerTab from "./index";

export default {
  title: "floro-app/common-components/OrgFollowerTab",
  component: OrgFollowerTab,
  argTypes: {},
};

const Template = (args) => <div style={{maxWidth: 263}}><OrgFollowerTab {...args} /></div>

export const Primary: any = Template.bind({});
Primary.args = {
  followerCount: 0,
  isFollowing: false
};