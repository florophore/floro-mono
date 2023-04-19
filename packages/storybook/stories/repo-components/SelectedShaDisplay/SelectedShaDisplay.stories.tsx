import ColorPalette from "@floro/styles/ColorPalette";
import SelectedShaDisplay from "./index";

export default {
  title: "floro-app/repo-components/SelectedShaDisplay",
  component: SelectedShaDisplay,
  argTypes: {},
};

const Template = (args) => <div style={{maxWidth: 263}}><SelectedShaDisplay {...args} /></div>

export const Primary: any = Template.bind({});
Primary.args = {
    label: "branch head",
    shaBackground: ColorPalette.purple,
    sha: 'b944f387fe3a67ba003',
    message: "My last commit, this message is kinda long"
};