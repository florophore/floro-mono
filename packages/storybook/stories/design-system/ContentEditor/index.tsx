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


function getSelectionRangeWithin(element) {
  var start = 0;
  var end = 0;
  var doc = element.ownerDocument || element.document;
  var win = doc.defaultView || doc.parentWindow;
  var sel;
  if (typeof win.getSelection != "undefined") {
    sel = win.getSelection();
    if (sel.rangeCount > 0) {
      var range = win.getSelection().getRangeAt(0);
      var preCaretRange = range.cloneRange();
      preCaretRange.selectNodeContents(element);
      preCaretRange.setEnd(range.startContainer, range.startOffset);
      start = preCaretRange.toString().length;
      preCaretRange.setEnd(range.endContainer, range.endOffset);
      end = preCaretRange.toString().length;
    }
  } else if ((sel = doc.selection) && sel.type != "Control") {
    var textRange = sel.createRange();
    var preCaretTextRange = doc.body.createTextRange();
    preCaretTextRange.moveToElementText(element);
    preCaretTextRange.setEndPoint("EndToStart", textRange);
    start = preCaretTextRange.text.length;
    preCaretTextRange.setEndPoint("EndToEnd", textRange);
    end = preCaretTextRange.text.length;
  }
  return { start: start, end: end };
}

export interface Props {
  maxHeight?: number;
  editorDoc: EditorDocument;
  content: string;
  onSetContent: (str: string) => void;
  lang?: string;
  placeholder?: string;
}

const ContentEditor = (props: Props) => {
  const theme = useTheme();
  const contentEditorRef = useRef<HTMLDivElement>(null);
  const [isBold, setIsBold] = useState(false);
  const [isItalic, setIsItalic] = useState(false);
  const [isUnderlined, setIsUnderlined] = useState(false);
  const isFocused = useRef<boolean>(false);
  const lastPositon = useRef<number>(-1);
  const emojiPosition = useRef<number>(0);

  const handleChange = useCallback(
    (event) => {
      const sanitizedValue = event.target.value == "<br>" ? "" : event.target.value;
      const sanitizizedString = sanitizeHtml(sanitizedValue, {
        allowedTags: [ 'b', 'i', 'u', 'br' ],
      });
      props.editorDoc.tree.updateRootFromHTML(sanitizizedString);
      props.onSetContent(sanitizizedString);
    },
    [props.editorDoc?.tree, props.onSetContent]
  );

  const onDelayedKeyDown = useCallback(() => {
    const timeout = setTimeout(() => {
      if (isFocused.current) {
        const isBold = document.queryCommandState("bold")
        setIsBold(isBold);
        const isItalic = document.queryCommandState("italic")
        setIsItalic(isItalic);
        const isUnderlined = document.queryCommandState("underline")
        setIsUnderlined(isUnderlined);
      }
    }, 0)
    return () => {
      clearTimeout(timeout);
    }
  }, [])

  useEffect(() => {
    const onChanged = (cursor: Cursor) => {
      lastPositon.current = cursor.position;
    }
    props.editorDoc.cursor.addEventListener("changed", onChanged)
    return () => {
      props.editorDoc.cursor.removeEventListener("changed", onChanged)
    }
  }, [props.editorDoc.cursor])

  useEffect(() => {
    const onPaste = (e) => {
      e.stopPropagation();
      e.preventDefault();
      let paste = (e.clipboardData || window.Clipboard).getData('text/html');
      const sanitizizedString = sanitizeHtml(paste, {
        allowedTags: [ 'b', 'i', 'u', 'br' ],
      });
      if (isFocused.current) {
        document.execCommand("insertHtml", false, sanitizizedString);
      }
    };
    const onUpdate = () => {
      if (contentEditorRef.current) {
        const selectionRange = getSelectionRangeWithin(
          contentEditorRef.current
        );
        props.editorDoc.cursor.updatePosition(selectionRange);
      }
    };

    window.addEventListener("keyup", onUpdate);
    window.addEventListener("mouseup", onUpdate);
    window.addEventListener("mousedown", onUpdate);
    window.addEventListener("paste", onPaste);
    return () => {
      window.removeEventListener("keyup", onUpdate);
      window.removeEventListener("mouseup", onUpdate);
      window.removeEventListener("mousedown", onUpdate);
      window.removeEventListener("paste", onPaste);
    };
  }, [contentEditorRef?.current, isFocused]);

  useEffect(() => {
    props.editorDoc.cursor.addEventListener('changed', onDelayedKeyDown);
    return () => {
      props.editorDoc.cursor.removeEventListener('changed', onDelayedKeyDown);
    };
  }, [props.editorDoc.cursor, onDelayedKeyDown])

  const htmlContent = useMemo(() => {
    props.editorDoc.tree.updateRootFromHTML(props.content);
    return props.editorDoc.tree.getHtml();
  }, [props.content, props.editorDoc]);

  const plainTextContent = useMemo(() => {
    return props.editorDoc.tree.rootNode.toUnescapedString();
  }, [htmlContent, props.editorDoc]);

  const onClickContainer = useCallback(() => {
    contentEditorRef.current?.focus();
  }, []);

  const [showExtend, setShowExtend] = useState(true);

  const stickyStyles = useMemo((): any => {
    if (showExtend) {
      return {
        minHeight: 120, overflowY: 'initial', height: '100%'
      }
    }
    return {
      minHeight: 120, height: 200, maxHeight: 800, overflowY: 'scroll'
    }

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

  const boldIcon = useMemo(() => {
    if (isBold) {
      return theme.name == 'light' ? BoldSelectedLight : BoldSelectedDark;
    }
    return theme.name == 'light' ? BoldUnSelectedLight : BoldUnSelectedDark;
  }, [isBold, theme.name])

  const italicIcon = useMemo(() => {
    if (isItalic) {
      return theme.name == 'light' ? ItalicSelectedLight : ItalicSelectedDark;
    }
    return theme.name == 'light' ? ItalicUnSelectedLight : ItalicUnSelectedDark;
  }, [isItalic, theme.name])


  const underlineIcon = useMemo(() => {
    if (isUnderlined) {
      return theme.name == 'light' ? UnderlineSelectedLight : UnderlineSelectedDark;
    }
    return theme.name == 'light' ? UnderlineUnSelectedLight : UnderlineUnSelectedDark;
  }, [isUnderlined, theme.name])

  const onToggleExtend = useCallback(() => {
    setShowExtend(!showExtend);
  }, [showExtend])

  const onFocus = useCallback(() => {
    isFocused.current = true;
    onDelayedKeyDown();
  }, [onDelayedKeyDown])

  const onBlur = useCallback(() => {
    isFocused.current = false;
  }, [onDelayedKeyDown])

  const onBold = useCallback(() => {
    if (contentEditorRef.current) {
      if (!isFocused.current) {
        contentEditorRef.current.focus();
      }
      document.execCommand("bold");
      contentEditorRef.current.focus();
    }
  }, []);

  const onItalic = useCallback(() => {
    if (contentEditorRef.current) {
      if (!isFocused.current) {
        contentEditorRef.current.focus();
      }
      document.execCommand("italic");
      contentEditorRef.current.focus();
    }
  }, []);

  const onUnderline = useCallback(() => {
    if (contentEditorRef.current) {
      if (!isFocused.current) {
        contentEditorRef.current.focus();
      }
      document.execCommand("underline");
      contentEditorRef.current.focus();
    }
  }, []);

  const [showEmojis, setShowEmojis] = useState(false);

  return (
    <>
      <Container lang={props.lang} onClick={onClickContainer}>
        <StickyHeader>
          <div style={{ position: "relative", display: 'flex', flexDirection: 'row', alignItems: 'center' }}>
            <HeaderIcon
              style={{ cursor: "pointer", marginRight: 8 }}
              src={boldIcon}
              onClick={onBold}
            />
            <HeaderIcon
              style={{ cursor: "pointer", marginRight: 8 }}
              src={italicIcon}
              onClick={onItalic}
            />
            <HeaderIcon
              style={{ cursor: "pointer", marginRight: 8 }}
              src={underlineIcon}
              onClick={onUnderline}
            />
            <div
              onMouseDown={(event) => {
                event?.preventDefault();
                event?.stopPropagation();
                if (showEmojis) {
                  //setCaratTo(contentEditorRef.current, emojiPosition.current);
                  setShowEmojis(false);
                  contentEditorRef.current?.focus();
                  return;
                }
                const selectionRange = getSelectionRangeWithin(
                  contentEditorRef.current
                );
                emojiPosition.current = selectionRange.end;
                setShowEmojis(true);
                //setCaratTo(contentEditorRef.current, emojiPosition.current);
              }}
              style={{
                cursor: "pointer",
                marginRight: 8,
                height: 32,
                width: 32,
                fontSize: 24,
                paddingRight: 1,
                borderRadius: 4,
                paddingTop: 0,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                background: showEmojis ? theme.colors.titleText : 'transparent'
              }}
            >
              {"😝"}
            </div>
            {showEmojis && (

            <div onClick={(event) => {
              event.preventDefault();
              event.stopPropagation();

            }} style={{ position: "absolute", left: 170, top: 0, zIndex:1 }}>
              <EmojiPicker
                searchDisabled
                theme={theme.name as any}
                autoFocusSearch={false}
                onEmojiClick={(t) => {
                  if (contentEditorRef.current) {
                    //setCaratTo(contentEditorRef.current, emojiPosition.current);
                    document.execCommand("insertText", false, t.emoji);
                    //contentEditorRef.current.focus();
                    //setCaratTo(contentEditorRef.current, emojiPosition.current + 1);
                  }
                  setShowEmojis(false);
                }}
              />
            </div>
            )}
          </div>
          <div style={{ position: "relative", display: 'flex', flexDirection: 'row', alignItems: 'center' }}>
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
          onClick={() => {
            if (showEmojis) {
              setShowEmojis(false);
            }
          }}
        >
          <Wrapper>
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
            {plainTextContent.length == 0 && (
              <div style={{
                position: 'absolute',
                pointerEvents: 'none',
                userSelect: 'none',
                top: 0,
                left: 0,
                fontFamily: "MavenPro",
                color: theme.colors.inputPlaceholderTextColor,
              }}>
                {props.placeholder}
              </div>
            )}
            <div style={{ fontFamily: "MavenPro" }}>
              <ContentEditable
                onChange={handleChange}
                innerRef={contentEditorRef}
                html={props.content}
                style={{
                  width: "100%",
                  display: "inline-block",
                  outline: "none",
                  color: "transparent",
                  caretColor: theme.colors.contrastText,
                }}
                onKeyDown={onDelayedKeyDown}
                onClick={onDelayedKeyDown}
                onFocus={onFocus}
                onBlur={onBlur}
                spellCheck
                lang={props.lang}
              />
            </div>
          </Wrapper>
        </MainContainer>
      </Container>
    </>
  );
};

export default React.memo(ContentEditor);
