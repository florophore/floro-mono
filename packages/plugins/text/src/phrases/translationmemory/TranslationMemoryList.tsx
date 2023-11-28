import React, { useMemo, useCallback, useState } from "react";
import { useTheme } from "@emotion/react";
import styled from "@emotion/styled";

import Observer from "@floro/storybook/stories/design-system/ContentEditor/editor/Observer";
import TranslationMemory from "./TranslationMemory";

const Container = styled.div`
`;

const RowTitle = styled.h1`
  font-family: "MavenPro";
  font-weight: 400;
  font-size: 1.4rem;
  color: ${(props) => props.theme.colors.contrastText};
  padding: 0;
  margin: 0;
`;

interface Props {
  memories: Array<string>;
  observer: Observer;
  onApply?: (richText: string) => void;
  lang: string;
}

const TranslationMemoryList = (props: Props) => {
  const theme = useTheme();
  const [showAll, setShowAll] = useState(false);

  const translations = useMemo(() => {
    if (!showAll) {
        return [props.memories[0]];
    }
    return props.memories;

  }, [showAll, props.memories]);

  const showText = useMemo(() => {
    if (!showAll) {
        if (props.memories.length == 2) {
            return `show one other translation`;
        }
        return `show ${props.memories.length - 1} other translations`;
    }
    if (props.memories.length == 2) {
        return `hide other translation`;
    }
    return `hide other translations`;
  }, [props.memories, showAll])

  const onToggleShowAll = useCallback(() => {
    setShowAll(!showAll);
  }, [showAll]);


  return (
    <>
      <RowTitle
        style={{
          marginTop: 12,
          fontWeight: 600,
          display: "flex",
          flexDirection: "row",
          alignItems: "center",
        }}
      >
        <span style={{ color: theme.colors.contrastText }}>
            {'Translation Memory'}
        </span>
      </RowTitle>
      <Container>
        {translations.map((translation, index) => {
          return (
            <TranslationMemory
              key={index}
              onApply={props.onApply}
              lang={props.lang}
              observer={props.observer}
              translation={translation}
            />
          );
        })}
      </Container>
      {(props?.memories.length ?? 0) > 1 && (
        <RowTitle
            style={{
            marginTop: 12,
            fontWeight: 600,
            display: "flex",
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "flex-end"
            }}
        >
            <span onClick={onToggleShowAll} style={{ color: theme.colors.linkColor, cursor: 'pointer' }}>
                {showText}
            </span>
        </RowTitle>
      )}
    </>
  );
};

export default React.memo(TranslationMemoryList);
