import CommitSelector from "./index";

export default {
  title: "floro-app/common-components/CommitSelector",
  component: CommitSelector,
  argTypes: {},
};

const Template = (args) => <div style={{maxWidth: 263}}><CommitSelector {...args} /></div>

export const Primary: any = Template.bind({});
Primary.args = {
};