import CurrentInfo from "./index";

export default {
  title: "floro-app/repo-components/CurrentInfo",
  component: CurrentInfo,
  argTypes: {},
};

const Template = (args) => (
  <div style={{ width: 502, boxSizing: 'border-box', padding: 24, border: "1px solid black" }}>
    <CurrentInfo {...args} />
  </div>
);

export const Primary: any = Template.bind({});
Primary.args = {
};