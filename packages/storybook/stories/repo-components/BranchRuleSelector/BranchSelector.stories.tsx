import BranchRuleSelector from "./index";

export default {
  title: "floro-app/repo-components/BranchRuleSelector",
  component: BranchRuleSelector,
  argTypes: {},
};

const Template = (args) => <div style={{maxWidth: 263}}><BranchRuleSelector {...args} /></div>

export const Primary: any = Template.bind({});
Primary.args = {
};