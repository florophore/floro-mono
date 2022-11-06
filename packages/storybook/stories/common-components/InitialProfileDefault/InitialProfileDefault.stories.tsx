import InitialProfileDefault from "./index";

export default {
  title: "floro-app/common-components/InitialProfileDefault",
  component: InitialProfileDefault,
  argTypes: {},
};

const Template = (args) => <InitialProfileDefault {...args}/>

export const Primary: any = Template.bind({});
Primary.args = {
  firstName: "jamie",
  lastName: "sunderland",
  size: 64
};