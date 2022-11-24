import OwnerDescriptor from './index';

export default {
  title: 'floro-app/common-components/OwnerDescriptor',
  component: OwnerDescriptor,
  argTypes: {},
};

const Template = (args) => <OwnerDescriptor {...args} />;

export const Primary: any = Template.bind({});
Primary.args = {
    label: "owner",
    firstName: "jamie",
    lastName: "sunderland",
    username: "jamie.sunderland"
};