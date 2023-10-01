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
import sanitizeHtml from 'sanitize-html';

import Cursor from "./editor/Cursor";

const Container = styled.div`
  border-radius: 8px;
  display: block;
  position: static;
  background: ${props => props.theme.background};
`;

const MainContainer = styled.div`
  border: 2px solid ${(props) => props.theme.colors.contrastTextLight};
  border-radius: 8px;
  width: 100%;
  display: block;
  overflow-x: scroll;
  max-width: 100%;

`;

const Wrapper = styled.div`
  position: relative;
  border-radius: 8px;
  font-size: 1.4rem;
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

const LinkEditor = (props: Props) => {
  const theme = useTheme();
  const contentEditorRef = useRef<HTMLDivElement>(null);
  const isFocused = useRef<boolean>(false);
  const lastPositon = useRef<number>(-1);

  const handleChange = useCallback(
    (event) => {
      const sanitizedValue = event.target.value == "<br>" ? "" : event.target.value;
      const sanitizizedString = sanitizeHtml(sanitizedValue, {
        allowedTags: [],
      });
      props.editorDoc.tree.updateRootFromHTML(sanitizizedString);
      props.onSetContent(sanitizizedString);
    },
    [props.editorDoc?.tree, props.onSetContent]
  );

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
      if (!isFocused?.current) {
        return;
      }
      e.stopPropagation();
      e.preventDefault();
      let paste = (e.clipboardData || window.Clipboard).getData('text');
      if (isFocused.current) {
        document.execCommand("insertText", false, paste.trim());
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

  const htmlContent = useMemo(() => {
    props.editorDoc.tree.updateRootFromHTML(props.content);
    return props.editorDoc.tree.getHtml();
  }, [props.content, props.editorDoc]);


  const plaintextContent = useMemo(() => {
    props.editorDoc.tree.updateRootFromHTML(props.content);
    return props.editorDoc.tree.rootNode.toUnescapedString();
  }, [props.content, props.editorDoc]);

  const onClickContainer = useCallback(() => {
    contentEditorRef.current?.focus();
  }, []);

  const onFocus = useCallback(() => {
    isFocused.current = true;
  }, [])

  const onBlur = useCallback(() => {
    isFocused.current = false;
  }, [])

  const [showEmojis, setShowEmojis] = useState(false);

  return (
    <>
      <Container lang={props.lang} onClick={onClickContainer}>
        <MainContainer
          style={{
            padding: 24,
            color: theme.colors.contrastText,
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
                  whiteSpace: "nowrap",
                  width: "100%",
                  display: "inline-block",
                  pointerEvents: "none",
                  userSelect: "none",
                  fontWeight: 400
                }}
                dangerouslySetInnerHTML={{ __html: htmlContent }}
                spellCheck
                lang={props.lang}
              ></div>
            </div>
            {plaintextContent.length == 0 && (
              <div style={{
                position: 'absolute',
                whiteSpace: 'nowrap',
                pointerEvents: 'none',
                userSelect: 'none',
                top: 0,
                left: 0,
                fontFamily: "MavenPro",
                color: theme.colors.inputPlaceholderTextColor
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
                  whiteSpace: 'nowrap',
                  caretColor: theme.colors.contrastText,
                  fontWeight: 400
                }}
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

export default React.memo(LinkEditor);
