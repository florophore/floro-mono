import BillingTab from "./index";

export default {
  title: "floro-app/common-components/BillingTab",
  component: BillingTab,
  argTypes: {},
};

const Template = (args) => <div style={{maxWidth: 263}}><BillingTab {...args} /></div>

export const Primary: any = Template.bind({});
Primary.args = {
};