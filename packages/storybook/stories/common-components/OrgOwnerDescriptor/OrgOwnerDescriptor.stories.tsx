import OrgOwnerDescriptor from './index';

export default {
  title: 'floro-app/common-components/OwnerDescriptor',
  component: OrgOwnerDescriptor,
  argTypes: {},
};

const Template = (args) => <OrgOwnerDescriptor {...args} />;

export const Primary: any = Template.bind({});
Primary.args = {
    label: "owner",
    organization: {
      handle: "floro",
    }
};