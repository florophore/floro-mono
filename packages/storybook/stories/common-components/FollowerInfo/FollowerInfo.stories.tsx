
import FollowerInfo from "./index";

export default {
  title: "floro-app/common-components/FollowerInfo",
  component: FollowerInfo,
  argTypes: {},
};

const Template = (args) => <div style={{maxWidth: 263}}><FollowerInfo {...args} /></div>

export const Primary: any = Template.bind({});
Primary.args = {
  followerCount: 0,
  followingCount: 0,
  username: "test"
};