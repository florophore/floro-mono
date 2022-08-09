import React from 'react';

import Button from './Button';

// More on default export: https://storybook.js.org/docs/react/writing-stories/introduction#default-export
export default {
  title: 'Example/Button',
  component: Button,
  // More on argTypes: https://storybook.js.org/docs/react/api/argtypes
  argTypes: {
    backgroundColor: { control: 'color' },
  },
};

// More on component templates: https://storybook.js.org/docs/react/writing-stories/introduction#using-args
const Template = (args) => <Button {...args} />;

export const Primary: any = Template.bind({});
// More on args: https://storybook.js.org/docs/react/writing-stories/args
Primary.args = {
  primary: true,
  label: 'Button',
};

export const Secondary: any = Template.bind({});
Secondary.args = {
  label: 'Button',
};

export const Large: any = Template.bind({});
Large.args = {
  primary: true,
  size: 'large',
  label: 'Button',
};

export const Small: any = Template.bind({});
Small.args = {
  size: 'small',
  label: 'Button',
};
