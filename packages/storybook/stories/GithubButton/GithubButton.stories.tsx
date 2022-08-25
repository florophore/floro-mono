import GithubButton from './index';
import GithubWhiteBG from '../assets/github_white_bg.svg';

// More on default export: https://storybook.js.org/docs/react/writing-stories/introduction#default-export
export default {
  title: 'floro-app/GithubButton',
  component: GithubButton,
  // More on argTypes: https://storybook.js.org/docs/react/api/argtypes
  argTypes: {
    label: { control: 'text' },
  },
};

// More on component templates: https://storybook.js.org/docs/react/writing-stories/introduction#using-args
const Template = (args) => <GithubButton {...args} />;

export const Primary: any = Template.bind({});
// More on args: https://storybook.js.org/docs/react/writing-stories/args
Primary.args = {
  label: "Sign in with Github",
  isLoading: false,
  githubAsset: GithubWhiteBG,
};