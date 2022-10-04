import SubPageLoader from './index';

export default {
  title: 'floro-app/common-components/SubPageLoader',
  component: SubPageLoader,
  argTypes: {},
};

const Template = (args) => <SubPageLoader {...args} />;

export const Primary: any = Template.bind({});
Primary.args = {};