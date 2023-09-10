import React, {
  useMemo,
  useCallback,
  useState,
  useRef,
  useEffect,
} from "react";
import { useTheme } from "@emotion/react";
import styled from "@emotion/styled";
import EditorDocument from "./editor/EditorDocument";
import ContentEditable from "react-contenteditable";
import EmojiPicker from 'emoji-picker-react';
import Button from "../Button";
import sanitizeHtml from 'sanitize-html';

import ExtendLight from "@floro/common-assets/assets/images/rich_text_icons/extend.light.svg";
import ExtendDark from "@floro/common-assets/assets/images/rich_text_icons/extend.dark.svg";

import ContractLight from "@floro/common-assets/assets/images/rich_text_icons/contract.light.svg";
import ContractDark from "@floro/common-assets/assets/images/rich_text_icons/contract.dark.svg";

import BoldUnSelectedLight from "@floro/common-assets/assets/images/rich_text_icons/bold.unselect.light.svg";
import BoldUnSelectedDark from "@floro/common-assets/assets/images/rich_text_icons/bold.unselect.dark.svg";

import BoldSelectedLight from "@floro/common-assets/assets/images/rich_text_icons/bold.selected.light.svg";
import BoldSelectedDark from "@floro/common-assets/assets/images/rich_text_icons/bold.selected.light.svg";

import ItalicUnSelectedLight from "@floro/common-assets/assets/images/rich_text_icons/italic.unselect.light.svg";
import ItalicUnSelectedDark from "@floro/common-assets/assets/images/rich_text_icons/italic.unselect.dark.svg";

import ItalicSelectedLight from "@floro/common-assets/assets/images/rich_text_icons/italic.selected.light.svg";
import ItalicSelectedDark from "@floro/common-assets/assets/images/rich_text_icons/italic.selected.light.svg";

import UnderlineUnSelectedLight from "@floro/common-assets/assets/images/rich_text_icons/underline.unselect.light.svg";
import UnderlineUnSelectedDark from "@floro/common-assets/assets/images/rich_text_icons/underline.unselect.dark.svg";

import UnderlineSelectedLight from "@floro/common-assets/assets/images/rich_text_icons/underline.selected.light.svg";
import UnderlineSelectedDark from "@floro/common-assets/assets/images/rich_text_icons/underline.selected.light.svg";
import Cursor from "./editor/Cursor";
import ColorPalette from "@floro/styles/ColorPalette";

const Container = styled.div`
  border-radius: 8px;
  display: block;
  position: static;
`;

const MainContainer = styled.div`
  border: 2px solid ${(props) => props.theme.colors.contrastTextLight};
  border-bottom-left-radius: 8px;
  border-bottom-right-radius: 8px;
  width: 100%;
  height: 100%;
  display: block;
  resize: vertical;
`;

const Wrapper = styled.div`
  position: relative;
  border-radius: 8px;
  font-size: 1.4rem;
`;

const StickyHeader = styled.div`
    height: 56px;
    width: 100%;
    border-top-right-radius: 8px;
    border-top-left-radius: 8px;
    border-top: 2px solid ${(props) => props.theme.colors.contrastTextLight};
    border-left: 2px solid ${(props) => props.theme.colors.contrastTextLight};
    border-right: 2px solid ${(props) => props.theme.colors.contrastTextLight};
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 16px;
    box-shadow: 0px 2px 2px 2px
      ${(props) => props.theme.shadows.versionControlSideBarShadow};
`;

const HeaderIcon = styled.img`
    height: 32px;
    width: 32px;
`;

const DisabledTitle = styled.p`
  font-family: "MavenPro";
  font-weight: 500;
  font-size: 1.4rem;
  font-style: italic;
  user-select: none;
  cursor: pointer;
  margin: 0;
  padding: 0;
`;

export interface Props {
  maxHeight?: number;
  editorDoc: EditorDocument;
  content: string;
  lang?: string;
  isSource?: boolean;
}

const PlainTextDocument = (props: Props) => {
  const theme = useTheme();

  const htmlContent = useMemo(() => {
    props.editorDoc.tree.updateRootFromHTML(props.content);
    return props.editorDoc.tree.getHtml();
  }, [props.content, props.editorDoc]);

  const [showExtend, setShowExtend] = useState(true);

  const stickyStyles = useMemo((): any => {
    if (showExtend) {
      return {
        minHeight: 120, overflowY: 'initial', height: '100%'
      }
    }
    return {
      minHeight: 120, height: 120, maxHeight: 800, overflowY: 'scroll'
    }

  }, [showExtend])

  const onToggleExtend = useCallback(() => {
    setShowExtend(!showExtend);
  }, [showExtend])

  const extendIcon = useMemo(() => {
    if (theme.name == 'light') {
      return ExtendLight;
    }
    return ExtendDark;
  }, [theme.name])

  const contractIcon = useMemo(() => {
    if (theme.name == 'light') {
      return ContractLight;
    }
    return ContractDark;
  }, [theme.name]);

  return (
    <>
      <Container lang={props.lang}>
        <StickyHeader style={{
          background: props.isSource ? theme.name == 'light' ? ColorPalette.beigeLight : ColorPalette.lightOrange : 'transparent'
        }}>
          <div style={{ position: "relative", display: 'flex', flexDirection: 'row' }}>
            <DisabledTitle
              style={{
                color: props.isSource ? theme.name == 'light' ? ColorPalette.gray : ColorPalette.darkGray : ColorPalette.gray

              }}

            >{props.isSource ? 'Source Non-Editable' : 'Non-Editable'}</DisabledTitle>
          </div>
          <div>
            {showExtend && (
              <HeaderIcon
                style={{ cursor: "pointer" }}
                src={contractIcon}
                onClick={onToggleExtend}
              />
            )}
            {!showExtend && (
              <HeaderIcon
                style={{ cursor: "pointer" }}
                src={extendIcon}
                onClick={onToggleExtend}
              />
            )}
          </div>
        </StickyHeader>
        <MainContainer
          style={{
            padding: 24,
            color: theme.colors.contrastText,
            ...stickyStyles,
            background: theme.background
          }}
        >
          <Wrapper>
            {props.content.length == 0 && (
              <div style={{
                position: 'absolute',
                pointerEvents: 'none',
                userSelect: 'none',
                top: 0,
                left: 0,
                fontFamily: "MavenPro",
                color: theme.colors.inputPlaceholderTextColor,
              }}>
                {"Empty"}
              </div>
            )}
            <div
              style={{
                pointerEvents: "none",
                userSelect: "none",
                fontFamily: "MavenPro",
                top: 0,
                position: "absolute",
                zIndex: 0,
              }}
            >
              <div
                style={{
                  whiteSpace: "pre-line",
                  width: "100%",
                  display: "inline-block",
                  pointerEvents: "none",
                  userSelect: "none",
                }}
                dangerouslySetInnerHTML={{ __html: htmlContent }}
                spellCheck
                lang={props.lang}
              ></div>
            </div>
            {
            <div style={{ fontFamily: "MavenPro" }}>
              <div
                dangerouslySetInnerHTML={{__html: props.content}}
                style={{
                  width: "100%",
                  display: "inline-block",
                  outline: "none",
                  color: "transparent",
                  caretColor: theme.colors.contrastText,
                }}
                spellCheck
                lang={props.lang}
              />
            </div>
            }
          </Wrapper>
        </MainContainer>
      </Container>
    </>
  );
};

export default React.memo(PlainTextDocument);
