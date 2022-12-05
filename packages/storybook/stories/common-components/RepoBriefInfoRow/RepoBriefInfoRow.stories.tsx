
import RepoBriefInfoRow from "./index";

export default {
  title: "floro-app/common-components/RepoBriefInfoRow",
  component: RepoBriefInfoRow,
  argTypes: {},
};

const Template = (args) => <div style={{maxWidth: 263}}><RepoBriefInfoRow {...args} /></div>

export const Primary: any = Template.bind({});
Primary.args = {
  repo: {
    name: "test-repository",
    isPrivate: false,
    lastRepoUpdateAt: "Sun Dec 04 2022 21:54:25 GMT-0800 (Pacific Standard Time)"
  },
};