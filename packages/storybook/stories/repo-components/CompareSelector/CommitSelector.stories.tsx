import CompareSelector from "./index";

export default {
  title: "floro-app/repo-components/CompareSelector",
  component: CompareSelector,
  argTypes: {},
};

const Template = (args) => <div style={{maxWidth: 263}}><CompareSelector {...args} /></div>

export const Primary: any = Template.bind({});
Primary.args = {
};