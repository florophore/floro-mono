import ConnectionStatusTab from "./index";

export default {
  title: "floro-app/common-components/ConnectionStatusTab",
  component: ConnectionStatusTab,
  argTypes: {},
};

const Template = (args) => <div style={{maxWidth: 263}}><ConnectionStatusTab {...args} /></div>

export const Primary: any = Template.bind({});
Primary.args = {
  isConnected: true,
};