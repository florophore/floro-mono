import React, { useState, useMemo, useRef } from 'react';
import ContentEditor from './index';
import EditorDocument from './editor/EditorDocument';
import { useMergeBranchMutation } from '@floro/graphql-schemas/build/generated/main-client-graphql';
import Observer from './editor/Observer';
import SearchInput from '../SearchInput';
import PlainTextDocument from './PlainTextDocument';

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
    const [text, setText] = useState(`<ol><li><b>Addition</b> - We will {hello} add <b>{test}</b> and <i><u>{test2}</u> </i> a new Translation phrase floro and work in progress to our Localized Keys <i>"Logout"</i>, and provide English and Chinese Translations for the new phrase and floro that is a work in progress, nice floro</li></ol><b><u><strike><i><br /></i></strike></u></b>`)
    const [search, setSearch] = useState("ition - We will {hello} add {test} and {test2}  a new translation phrase floro and w")
    const observer = useMemo(() => {
      const observer = new Observer(['hello'], ['test'], ['test2'], ['work in progress', 'Floro'], ['stashing', 'popStash']);
      observer.setSearchString(search)
      return observer;
    }, [text, search]);
    console.log(text)
    const editor = useMemo(() => new EditorDocument(observer), [observer])
    const searchRef = useRef<HTMLInputElement>(null);
    return (
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          width: 600
        }}
      >
        <SearchInput ref={searchRef} value={search} onTextChanged={setSearch} placeholder={'search'}/>
        <div style={{height: 24}}>

        </div>
        <ContentEditor
          editorDoc={editor}
          content={text}
          onSetContent={function (str: string): void {
            editor.tree.updateRootFromHTML(str);
            setText(str);
          }}
          onSearch={() => {
            if (searchRef?.current) {
              searchRef?.current?.focus();
            }
          }}
          isDebugMode={args.isDebugMode}
        />
      </div>
    );
};

export const Primary: any = Template.bind({});
// More on args: https://storybook.js.org/docs/react/writing-stories/args
Primary.args = {
    disabled: false
};