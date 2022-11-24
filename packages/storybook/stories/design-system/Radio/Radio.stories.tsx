
import React, { useState } from 'react';
import Radio from './index';

// More on default export: https://storybook.js.org/docs/react/writing-stories/introduction#default-export
export default {
  title: 'floro-app/design-system/Radio',
  component: Radio,
  // More on argTypes: https://storybook.js.org/docs/react/api/argtypes
  argTypes: {
  },
};

// More on component templates: https://storybook.js.org/docs/react/writing-stories/introduction#using-args
const Template = (args) => {
    const [isChecked, setIsChecked] = useState(false);
    return (
      <div style={{display: 'flex', flexDirection: 'column', boxSizing: 'border-box'}}>
        <Radio {...args} isChecked={isChecked} onChange={setIsChecked} />
      </div>
    );
};

export const Primary: any = Template.bind({});
// More on args: https://storybook.js.org/docs/react/writing-stories/args
Primary.args = {
    disabled: false
};