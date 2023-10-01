
import React, { useMemo } from "react";
import ApplyTextDocument from "@floro/storybook/stories/design-system/ContentEditor/ApplyTextDocument";
import { useTheme } from "@emotion/react";
import styled from "@emotion/styled";

import Observer from "@floro/storybook/stories/design-system/ContentEditor/editor/Observer";
import EditorDocument from "@floro/storybook/stories/design-system/ContentEditor/editor/EditorDocument";

const RowTitle = styled.h1`
  font-family: "MavenPro";
  font-weight: 400;
  font-size: 1.4rem;
  color: ${(props) => props.theme.colors.contrastText};
  padding: 0;
  margin: 0;
`;

const TermContainer = styled.div`
  display: flex;
  flex-direction: row;
  flex-wrap: wrap;
  width: 100%;
  margin-bottom: 12px;
`;

const TermWrapper = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;
  padding-top: 12px;
  margin-right: 12px;
`;

const TermSpan = styled.span`
  font-family: "MavenPro";
  font-weight: 700;
  font-size: 1.4rem;
  color: ${(props) => props.theme.colors.linkColor};
  text-decoration: underline;
  margin-right: 8px;
  margin-top: -2px;
  cursor: pointer;
`;

const TermIcon = styled.img`
  height: 24px;
  width: 24px;
`;

interface Props {
  translation: string;
  observer: Observer;
  onApply?: (richText: string) => void;
  lang: string;
}

const TranslationMemory = (props: Props) => {
  const theme = useTheme();

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
