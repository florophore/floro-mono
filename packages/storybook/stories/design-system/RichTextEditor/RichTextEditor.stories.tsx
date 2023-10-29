import React, { useState, useMemo } from 'react';
import RichTextEditor from './index';
import EditorDocument from './editor/EditorDocument';
import Observer from './editor/Observer';

// More on default export: https://storybook.js.org/docs/react/writing-stories/introduction#default-export
export default {
  title: 'floro-app/design-system/RichTextEditor',
  component: RichTextEditor,
  // More on argTypes: https://storybook.js.org/docs/react/api/argtypes
  argTypes: {
  },
};

// More on component templates: https://storybook.js.org/docs/react/writing-stories/introduction#using-args
const Template = (args) => {
    const [text, setText] = useState("")
    return (
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          width: 600
        }}
      >
        <RichTextEditor
          content={text}
          onSetContent={function (str: string): void {
            //editor.tree.updateRootFromHTML(str);
            setText(str);
          }}
          isDebugMode
        />
      </div>
    );
};

export const Primary: any = Template.bind({});
// More on args: https://storybook.js.org/docs/react/writing-stories/args
Primary.args = {
    disabled: false
};