import HeroView from './index';

export default {
  title: 'floro-app/common-components/HeroView',
  component: HeroView,
  argTypes: {},
};

const Template = (args) => <HeroView {...args} />;

export const Primary: any = Template.bind({});
Primary.args = {
    title: "hero title"
};