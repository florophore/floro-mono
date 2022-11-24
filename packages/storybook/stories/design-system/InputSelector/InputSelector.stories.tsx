
import { useState } from 'react';
import InputSelector from './index';

// More on default export: https://storybook.js.org/docs/react/writing-stories/introduction#default-export
export default {
  title: 'floro-app/design-system/InputSelector',
  component: InputSelector,
  // More on argTypes: https://storybook.js.org/docs/react/api/argtypes
  argTypes: {
  },
};

// More on component templates: https://storybook.js.org/docs/react/writing-stories/introduction#using-args
const Template = (args) => {

    const options = [
        {
            value: "apache",
            label: "Apache License 2.0"
        },
        {
            value: "gnu",
            label: "GNU General Public License v3.0"
        },
        {
            value: "mit",
            label: "MIT License"
        },
        {
            value: "bsd2",
            label: "BSD 2-Clause \"Simplified\" License"
        },

        {
            value: "bsd2",
            label: "BSD 3-Clause \"New\" or \"Revised\" License"
        },
        {
            value: "boost",
            label: "Boost Software License"
        },
        {
            value: "creative_commons",
            label: "Creative Commons Zero v1.0 Universal"
        },
    ]
    return (
      <div style={{display: 'flex', flexDirection: 'column', boxSizing: 'border-box'}}>
        <InputSelector {...args} options={options} />
      </div>
    );
};

export const Primary: any = Template.bind({});
// More on args: https://storybook.js.org/docs/react/writing-stories/args
Primary.args = {
    label: "license",
    placeholder: "select a license",
    isDropdown: true
};