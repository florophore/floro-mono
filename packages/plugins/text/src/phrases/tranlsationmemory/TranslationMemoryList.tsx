import React, { useMemo, useCallback, useState, useEffect } from "react";
import {
  PointerTypes,
  SchemaTypes,
  makeQueryRef,
  useClientStorageApi,
  useExtractQueryArgs,
  useFloroContext,
  useFloroState,
  useReferencedObject,
} from "../../floro-schema-api";
import { Reorder, useDragControls } from "framer-motion";
import { useTheme } from "@emotion/react";
import styled from "@emotion/styled";

import DraggerLight from "@floro/common-assets/assets/images/icons/dragger.light.svg";
import DraggerDark from "@floro/common-assets/assets/images/icons/dragger.dark.svg";
import InputSelector from "@floro/storybook/stories/design-system/InputSelector";
import ColorPalette from "@floro/styles/ColorPalette";

import TrashLight from "@floro/common-assets/assets/images/icons/trash.light.darker.svg";
import TrashDark from "@floro/common-assets/assets/images/icons/trash.dark.svg";

import EditLight from "@floro/common-assets/assets/images/icons/edit.light.svg";
import EditDark from "@floro/common-assets/assets/images/icons/edit.dark.svg";
import Checkbox from "@floro/storybook/stories/design-system/Checkbox";
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
