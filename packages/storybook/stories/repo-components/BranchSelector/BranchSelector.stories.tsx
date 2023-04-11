import BranchSelector from "./index";

export default {
  title: "floro-app/repo-components/BranchSelector",
  component: BranchSelector,
  argTypes: {},
};

const Template = (args) => <div style={{maxWidth: 263}}><BranchSelector {...args} /></div>

export const Primary: any = Template.bind({});
Primary.args = {
};