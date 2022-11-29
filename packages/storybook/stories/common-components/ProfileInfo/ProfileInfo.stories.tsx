import ProfileInfo from "./index";

export default {
  title: "floro-app/common-components/ProfileInfo",
  component: ProfileInfo,
  argTypes: {},
};

const Template = (args) => <ProfileInfo {...args}/>

export const Primary: any = Template.bind({});
Primary.args = {
  user: {
    firstName: "jamie",
    lastName: "sunderland",
    username: "jamiesunderland",
  },
  size: 64
};