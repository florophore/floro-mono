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

import StrikethroughUnSelectedLight from "@floro/common-assets/assets/images/rich_text_icons/strikethrough.unselect.light.svg";
import StrikethroughUnSelectedDark from "@floro/common-assets/assets/images/rich_text_icons/strikethrough.unselect.dark.svg";

import StrikethroughSelectedLight from "@floro/common-assets/assets/images/rich_text_icons/strikethrough.selected.light.svg";
import StrikethroughSelectedDark from "@floro/common-assets/assets/images/rich_text_icons/strikethrough.selected.light.svg";

import SuperscriptUnSelectedLight from "@floro/common-assets/assets/images/rich_text_icons/superscript.unselect.light.svg";
import SuperscriptUnSelectedDark from "@floro/common-assets/assets/images/rich_text_icons/superscript.unselect.dark.svg";

import SuperscriptSelectedLight from "@floro/common-assets/assets/images/rich_text_icons/superscript.selected.light.svg";
import SuperscriptSelectedDark from "@floro/common-assets/assets/images/rich_text_icons/superscript.selected.light.svg";

import SubscriptUnSelectedLight from "@floro/common-assets/assets/images/rich_text_icons/subscript.unselect.light.svg";
import SubscriptUnSelectedDark from "@floro/common-assets/assets/images/rich_text_icons/subscript.unselect.dark.svg";

import SubscriptSelectedLight from "@floro/common-assets/assets/images/rich_text_icons/subscript.selected.light.svg";
import SubscriptSelectedDark from "@floro/common-assets/assets/images/rich_text_icons/subscript.selected.light.svg";

import BulletedListUnSelectedLight from "@floro/common-assets/assets/images/rich_text_icons/bulletedlist.unselect.light.svg";
import BulletedListUnSelectedDark from "@floro/common-assets/assets/images/rich_text_icons/bulletedlist.unselect.dark.svg";

import BulletedListSelectedLight from "@floro/common-assets/assets/images/rich_text_icons/bulletedlist.selected.light.svg";
import BulletedListSelectedDark from "@floro/common-assets/assets/images/rich_text_icons/bulletedlist.selected.light.svg";

import NumberedListUnSelectedLight from "@floro/common-assets/assets/images/rich_text_icons/numberedlist.unselect.light.svg";
import NumberedListUnSelectedDark from "@floro/common-assets/assets/images/rich_text_icons/numberedlist.unselect.dark.svg";

import NumberedListSelectedLight from "@floro/common-assets/assets/images/rich_text_icons/numberedlist.selected.light.svg";
import NumberedListSelectedDark from "@floro/common-assets/assets/images/rich_text_icons/numberedlist.selected.dark.svg";
import * as linkify from 'linkifyjs';
import uEmojiParser from 'universal-emoji-parser'


import Cursor from "./editor/Cursor";
import Observer from "./editor/Observer";

const Container = styled.div`
  border-radius: 8px;
  display: block;
  position: static;
  box-sizing: border-box;
`;

const MainContainer = styled.div`
  border: 2px solid ${(props) => props.theme.colors.contrastTextLight};
  border-bottom-left-radius: 8px;
  border-bottom-right-radius: 8px;
  width: 100%;
  height: 100%;
  display: block;
  resize: vertical;
  box-sizing: border-box;
`;

const Wrapper = styled.div`
  position: relative;
  border-radius: 8px;
  font-size: 1.4rem;

  sup {
    line-height: 0;
  }
  sub {
    line-height: 0;
  }
  ol {
    padding-top: 0;
    padding-bottom: 0;
    margin-top: 0;
    margin-bottom: 0;
    list-style: decimal;
    padding-left: 40px;
  }
  ul {
    padding-top: 12px;
    padding-bottom: 0;
    margin-top: 0;
    margin-bottom: 0;
    list-style: disc;
    padding-left: 40px;
  }
  span.sup {
    font-size: smaller;
    vertical-align: super;
    line-height: 0;
  }
  span.sub {
    font-size: smaller;
    vertical-align: sub;
    line-height: 0;
  }

  li {
    line-height: 1.5;
    .sup {
      line-height: 0;
      vertical-align: super;
    }
    .sub {
      line-height: 0;
      vertical-align: sub;
    }
  }

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
    box-sizing: border-box;
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

export const findUrls = (text: string): Array<string> => {
  const observer = new Observer();
  const editorDoc = new EditorDocument(observer);
    editorDoc.tree.updateRootFromHTML(text);
  const plainText= editorDoc.tree.rootNode.toUnescapedString();
  const values = new Set(linkify
    .find(plainText)
    .filter((v) => v.type == "url")
    .map((v) => v.value));

	return Array.from(values);
};

export interface Props {
  maxHeight?: number;
  content: string;
  onSetContent: (str: string) => void;
  lang?: string;
  placeholder?: string;
  isDebugMode?: boolean;
}


const RichTextEditor = (props: Props) => {
  const theme = useTheme();
  const contentEditorRef = useRef<HTMLDivElement>(null);
  const [isBold, setIsBold] = useState(false);
  const [isItalic, setIsItalic] = useState(false);
  const [isUnderlined, setIsUnderlined] = useState(false);
  const [isStrikethrough, setIsStrikethrough] = useState(false);
  const [isSuperscript, setIsSuperscript] = useState(false);
  const [isSubscript, setIsSubscript] = useState(false);
  const [isOrderedList, setIsOrderedList] = useState(false);
  const [isUnOrderedList, setIsUnOrderedList] = useState(false);
  const isFocused = useRef<boolean>(false);
  const lastPositon = useRef<number>(-1);
  const emojiPosition = useRef<number>(0);

  const mentionedLinks = useMemo(() => {
    return findUrls(props.content ?? "");
  }, [props.content])
  const observer = useMemo(() => new Observer(mentionedLinks), [mentionedLinks]);
  const editorDoc = useMemo(() => new EditorDocument(observer), [observer])
  //const plainText = useMemo(() => {
  //  editorDoc.tree.rootNode.toUnsafeString();

  //}, [props.content, editorDoc])

  const onSetContent = useCallback((text: string) => {
    editorDoc.tree.updateRootFromHTML(text);
    props.onSetContent(text);
  }, [props.onSetContent, editorDoc])

  const handleChange = useCallback(
    (event) => {
      const emojifiedString = uEmojiParser.parse(event.target.value ?? "", {parseToUnicode: true, parseToHtml: false})
      const sanitizedValue = emojifiedString == "<br>" ? "" : emojifiedString;
      const sanitizizedString = sanitizeHtml(sanitizedValue, {
        allowedTags: [ 'b', 'i', 'u', 'br', 'sup', 's', 'strike', 'sub', 'ul', 'ol', 'li' ],
      });
      editorDoc.tree.updateRootFromHTML(sanitizizedString);
      onSetContent(sanitizizedString);
    },
    [editorDoc?.tree, onSetContent]
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
        const isStrikethrough = document.queryCommandState("strikeThrough");
        setIsStrikethrough(isStrikethrough);
        const isSuperscript = document.queryCommandState("superscript");
        setIsSuperscript(isSuperscript);
        const isSubscript = document.queryCommandState("subscript");
        setIsSubscript(isSubscript);
        const isOrderedList = document.queryCommandState("insertOrderedList");
        setIsOrderedList(isOrderedList);
        const isUnOrderedList = document.queryCommandState("insertUnorderedList")
        setIsUnOrderedList(isUnOrderedList);
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
    editorDoc.cursor.addEventListener("changed", onChanged)
    return () => {
      editorDoc.cursor.removeEventListener("changed", onChanged)
    }
  }, [editorDoc.cursor])

  useEffect(() => {
    const onPaste = (e) => {
      if (!isFocused?.current) {
        return;
      }
      e.stopPropagation();
      e.preventDefault();
      let paste = (e.clipboardData || window.Clipboard).getData('text/html');
      const sanitizizedString = sanitizeHtml(paste, {
        allowedTags: [ 'b', 'i', 'u', 'br', 'sup', 's', 'strike', 'sub'],
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
        editorDoc.cursor.updatePosition(selectionRange);
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
    editorDoc.cursor.addEventListener('changed', onDelayedKeyDown);
    return () => {
      editorDoc.cursor.removeEventListener('changed', onDelayedKeyDown);
    };
  }, [editorDoc.cursor, onDelayedKeyDown])

  const htmlContent = useMemo(() => {
    editorDoc.tree.updateRootFromHTML(props.content);
    return editorDoc.tree.getHtml();
  }, [props.content, editorDoc]);

  const plainTextContent = useMemo(() => {
    return editorDoc.tree.rootNode.toUnescapedString();
  }, [htmlContent, editorDoc]);

  const onClickContainer = useCallback(() => {
    contentEditorRef.current?.focus();
  }, []);

  const [showExtend, setShowExtend] = useState(false);

  const stickyStyles = useMemo((): any => {
    if (showExtend) {
      return {
        minHeight: 320, overflowY: 'initial', height: '100%'
      }
    }
    return {
      minHeight: 320, height: 320, maxHeight: 560, overflowY: 'scroll'
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

  const strikeThroughIcon = useMemo(() => {
    if (isStrikethrough) {
      return theme.name == 'light' ? StrikethroughSelectedLight : StrikethroughSelectedDark;
    }
    return theme.name == 'light' ? StrikethroughUnSelectedLight : StrikethroughUnSelectedDark;
  }, [isStrikethrough, theme.name])

  const superscriptIcon = useMemo(() => {
    if (isSuperscript) {
      return theme.name == 'light' ? SuperscriptSelectedLight : SuperscriptSelectedDark;
    }
    return theme.name == 'light' ? SuperscriptUnSelectedLight : SuperscriptUnSelectedDark;
  }, [isSuperscript, theme.name])

  const subscriptIcon = useMemo(() => {
    if (isSubscript) {
      return theme.name == 'light' ? SubscriptSelectedLight : SubscriptSelectedDark;
    }
    return theme.name == 'light' ? SubscriptUnSelectedLight : SubscriptUnSelectedDark;
  }, [isSubscript, theme.name])

  const orderedListIcon = useMemo(() => {
    if (isOrderedList) {
      return theme.name == 'light' ? NumberedListSelectedLight : NumberedListSelectedDark;
    }
    return theme.name == 'light' ? NumberedListUnSelectedLight : NumberedListUnSelectedDark;
  }, [isOrderedList, theme.name])

  const unOrderedListIcon = useMemo(() => {
    if (isUnOrderedList) {
      return theme.name == 'light' ? BulletedListSelectedLight : BulletedListSelectedDark;
    }
    return theme.name == 'light' ? BulletedListUnSelectedLight : BulletedListUnSelectedDark;
  }, [isUnOrderedList, theme.name])

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

  const onStrikeThrough = useCallback(() => {
    if (contentEditorRef.current) {
      if (!isFocused.current) {
        contentEditorRef.current.focus();
      }
      document.execCommand("strikeThrough");
      contentEditorRef.current.focus();
    }
  }, []);

  const onSuperscript = useCallback(() => {
    if (contentEditorRef.current) {
      if (!isFocused.current) {
        contentEditorRef.current.focus();
      }
      document.execCommand("superscript");
      contentEditorRef.current.focus();
    }
  }, []);

  const onSubscript = useCallback(() => {
    if (contentEditorRef.current) {
      if (!isFocused.current) {
        contentEditorRef.current.focus();
      }
      document.execCommand("subscript");
      contentEditorRef.current.focus();
    }
  }, []);


  const onUnorderedList = useCallback(() => {
    if (contentEditorRef.current) {
      if (!isFocused.current) {
        contentEditorRef.current.focus();
      }
      document.execCommand("insertUnorderedList");
      contentEditorRef.current.focus();
    }
  }, [editorDoc?.tree, onSetContent]);

  const onOrderedList = useCallback(() => {
    if (contentEditorRef.current) {
      if (!isFocused.current) {
        contentEditorRef.current.focus();
      }
      document.execCommand("insertOrderedList");
      contentEditorRef.current.focus();
    }
  }, [editorDoc?.tree, onSetContent]);

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
              style={{ cursor: "pointer", marginRight: 24 }}
              src={underlineIcon}
              onClick={onUnderline}
            />

            <HeaderIcon
              style={{ cursor: "pointer", marginRight: 8 }}
              src={strikeThroughIcon}
              onClick={onStrikeThrough}
            />
            <HeaderIcon
              style={{ cursor: "pointer", marginRight: 8 }}
              src={superscriptIcon}
              onClick={onSuperscript}
            />
            <HeaderIcon
              style={{ cursor: "pointer", marginRight: 24 }}
              src={subscriptIcon}
              onClick={onSubscript}
            />

            <HeaderIcon
              style={{ cursor: "pointer", marginRight: 8 }}
              src={unOrderedListIcon}
              onClick={onUnorderedList}
            />
            <HeaderIcon
              style={{ cursor: "pointer", marginRight: 24 }}
              src={orderedListIcon}
              onClick={onOrderedList}
            />

            <div
              onMouseDown={(event) => {
                event?.preventDefault();
                event?.stopPropagation();
                if (showEmojis) {
                  setShowEmojis(false);
                  contentEditorRef.current?.focus();
                  return;
                }
                const selectionRange = getSelectionRangeWithin(
                  contentEditorRef.current
                );
                emojiPosition.current = selectionRange.end;
                setShowEmojis(true);
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

            }} style={{ position: "absolute", left: 100, top: 0, zIndex:1 }}>
              <EmojiPicker
                searchDisabled
                theme={theme.name as any}
                autoFocusSearch={false}
                onEmojiClick={(t) => {
                  if (contentEditorRef.current) {
                    document.execCommand("insertText", false, t.emoji);
                  }
                  setShowEmojis(false);
                }}
              />
            </div>
            )}
          </div>
          {false && (
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
          )}
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
                display: "inline-block",
                whiteSpace: "break-spaces",
                borderInline: `1px solid transparent`,
                zIndex: 0,
                wordWrap: "break-word",
                width: '100%'
              }}
            >
              <div
                style={{
                  whiteSpace: "pre-wrap",
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
                  color: props.isDebugMode ? "red" : "transparent",
                  //color: "transparent",
                  caretColor: theme.colors.contrastText,
                  borderInline: `1px solid transparent`,
                  whiteSpace: "pre-wrap",
                  position: "relative",
                  zIndex: 0
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

export default React.memo(RichTextEditor);
