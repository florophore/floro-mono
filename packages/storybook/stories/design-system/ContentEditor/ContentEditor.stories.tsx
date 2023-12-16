import React, { useState, useMemo } from 'react';
import ContentEditor from './index';
import EditorDocument from './editor/EditorDocument';
import { useMergeBranchMutation } from '@floro/graphql-schemas/build/generated/main-client-graphql';
import Observer from './editor/Observer';
import SearchInput from '../SearchInput';

// More on default export: https://storybook.js.org/docs/react/writing-stories/introduction#default-export
export default {
  title: 'floro-app/design-system/ContentEditor',
  component: ContentEditor,
  // More on argTypes: https://storybook.js.org/docs/react/api/argtypes
  argTypes: {
  },
};

// More on component templates: https://storybook.js.org/docs/react/writing-stories/introduction#using-args
const Template = (args) => {
    const [text, setText] = useState("Testing. Just as you have men {hello} the <i>option</i> of creating a ")
    const [search, setSearch] = useState("Just as you have men {hello} the option of creating")
    const observer = useMemo(() => {
      const observer = new Observer(['hello', 'world'], ['link'], ['cond'], ['men']);
      observer.setSearchString(search)
      return observer;
    }, [text, search]);
    const editor = useMemo(() => new EditorDocument(observer), [observer])
    return (
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          width: 600
        }}
      >
        <SearchInput value={search} onTextChanged={setSearch} placeholder={'search'}/>
        <div style={{height: 24}}>

        </div>
        <ContentEditor
          editorDoc={editor}
          content={text}
          onSetContent={function (str: string): void {
            editor.tree.updateRootFromHTML(str);
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