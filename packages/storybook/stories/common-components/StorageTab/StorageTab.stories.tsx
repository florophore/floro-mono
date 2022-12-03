import StorageTab from "./index";

export default {
  title: "floro-app/common-components/StorageTab",
  component: StorageTab,
  argTypes: {},
};

const Template = (args) => <div style={{maxWidth: 263}}><StorageTab {...args} /></div>

export const Primary: any = Template.bind({});
Primary.args = {
  diskSpaceLimitBytes: 10737418240,
  utilizedDiskSpaceBytes: 10737418240 * 0.25
};