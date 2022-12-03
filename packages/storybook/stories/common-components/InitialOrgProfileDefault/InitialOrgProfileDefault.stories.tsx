import InitialOrgProfileDefault from "./index";

export default {
  title: "floro-app/common-components/InitialOrgProfileDefault",
  component: InitialOrgProfileDefault,
  argTypes: {},
};

const Template = (args) => <InitialOrgProfileDefault {...args}/>

export const Primary: any = Template.bind({});
Primary.args = {
  name: "floro",
  size: 64
};