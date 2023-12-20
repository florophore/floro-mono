import React, {
  useMemo,
  useCallback,
  useState,
} from "react";
import { useTheme } from "@emotion/react";
import styled from "@emotion/styled";
import EditorDocument from "./editor/EditorDocument";

import ExtendLight from "@floro/common-assets/assets/images/rich_text_icons/extend.light.svg";
import ExtendDark from "@floro/common-assets/assets/images/rich_text_icons/extend.dark.svg";

import ContractLight from "@floro/common-assets/assets/images/rich_text_icons/contract.light.svg";
import ContractDark from "@floro/common-assets/assets/images/rich_text_icons/contract.dark.svg";
import ColorPalette from "@floro/styles/ColorPalette";
import Button from "../Button";

const Container = styled.div`
  border-radius: 8px;
  display: block;
  position: static;
  margin-top: 12px;
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
  onApply?: (content: string) => void;
}

const ApplyTextDocument = (props: Props) => {
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

  const onApply = useCallback(() => {
    props.onApply?.(props.content);

  }, [props.content, props.onApply])

  return (
    <>
      <Container lang={props.lang}>
        <StickyHeader
          style={{
            background: theme.name == 'light' ? ColorPalette.extraLightGray : ColorPalette.darkerGray,
          }}
        >
          <div
            style={{
              position: "relative",
              display: "flex",
              flexDirection: "row",
            }}
          >
          <div style={{ position: "relative", display: 'flex', flexDirection: 'row', marginRight: 12 }}>
            <DisabledTitle
            style={{
              color: theme.colors.contrastText
            }}
            >{'Translation Memory'}</DisabledTitle>
          </div>
            <div style={{width: 80}}>
              <Button label={"apply"} bg={"purple"} size={"extra-small"} onClick={onApply} />
            </div>
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
            background: theme.background,
          }}
        >
          <Wrapper>
            {props.content.length == 0 && (
              <div
                style={{
                  position: "absolute",
                  pointerEvents: "none",
                  userSelect: "none",
                  top: 0,
                  left: 0,
                  fontFamily: "MavenPro",
                  color: theme.colors.inputPlaceholderTextColor,
                }}
              >
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
                display: "inline-block",
                whiteSpace: "break-spaces",
                borderInline: `1px solid transparent`,
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
                  dangerouslySetInnerHTML={{ __html: props.content }}
                  style={{
                    width: "100%",
                    display: "inline-block",
                    outline: "none",
                    color: "transparent",
                    caretColor: theme.colors.contrastText,
                    borderInline: `1px solid transparent`,
                    whiteSpace: "pre-line",
                    position: "relative",
                    zIndex: 0
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

export default React.memo(ApplyTextDocument);
