
import React, { useMemo } from "react";
import ApplyTextDocument from "@floro/storybook/stories/design-system/ContentEditor/ApplyTextDocument";

import Observer from "@floro/storybook/stories/design-system/ContentEditor/editor/Observer";
import EditorDocument from "@floro/storybook/stories/design-system/ContentEditor/editor/EditorDocument";


interface Props {
  translation: string;
  observer: Observer;
  onApply?: (richText: string) => void;
  lang: string;
}

const TranslationMemory = (props: Props) => {
  const editorDoc = useMemo(() => {
    return new EditorDocument(props.observer, props.lang?.toLowerCase() ?? "en");
  }, [props.lang, props.observer]);

  return (
    <div>
      <ApplyTextDocument
        lang={props.lang}
        content={props.translation}
        editorDoc={editorDoc}
        onApply={props.onApply}
      />
    </div>
  );
};

export default React.memo(TranslationMemory);
