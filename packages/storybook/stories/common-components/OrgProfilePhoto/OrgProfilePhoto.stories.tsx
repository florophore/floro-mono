
import OrgProfilePhoto from "./index";

export default {
  title: "floro-app/common-components/OrgProfilePhoto",
  component: OrgProfilePhoto,
  argTypes: {},
};

const Template = (args) => <OrgProfilePhoto {...args}/>

export const Primary: any = Template.bind({});
Primary.args = {
    organization: {
        name: "cheqout",
        profilePhoto: {
            url: "https://bookface-images.s3.amazonaws.com/logos/6a27ce68a670cbdd98300c7bce357d5e553d54c1.png"
        }
    },
  size: 64
};