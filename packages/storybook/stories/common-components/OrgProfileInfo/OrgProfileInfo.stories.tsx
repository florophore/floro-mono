import OrgProfileInfo from "./index";

export default {
  title: "floro-app/common-components/OrgProfileInfo",
  component: OrgProfileInfo,
  argTypes: {},
};

const Template = (args) => <OrgProfileInfo {...args}/>

export const Primary: any = Template.bind({});
Primary.args = {
  organization: {
    name: "floro",
    legalName: "Floro Inc.",
    handle: "floro",
    profilePhoto: {
      url: "https://bookface-images.s3.amazonaws.com/logos/6a27ce68a670cbdd98300c7bce357d5e553d54c1.png",
      thumbUrl: "https://bookface-images.s3.amazonaws.com/logos/6a27ce68a670cbdd98300c7bce357d5e553d54c1.png",
    }
  },
  isEdittable: true
};