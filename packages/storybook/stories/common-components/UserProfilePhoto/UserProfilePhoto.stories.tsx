
import UserProfilePhoto from "./index";

export default {
  title: "floro-app/common-components/UserProfilePhoto",
  component: UserProfilePhoto,
  argTypes: {},
};

const Template = (args) => <UserProfilePhoto {...args}/>

export const Primary: any = Template.bind({});
Primary.args = {
    user: {
        firstName: "jamie",
        lastName: "sunderland",
        username: "jamiesunderland",
        profilePhoto: {
            url: "https://images.squarespace-cdn.com/content/v1/58b4791ad2b857c893179e34/1537971642021-LHW76T7O8JG0M4GLTSTP/IMG_2818.jpg?format=500w"
        }
    },
  size: 64
};