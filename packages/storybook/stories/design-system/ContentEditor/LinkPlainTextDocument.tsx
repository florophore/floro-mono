import React, {
  useMemo,
} from "react";
import { useTheme } from "@emotion/react";
import styled from "@emotion/styled";
import EditorDocument from "./editor/EditorDocument";

import ColorPalette from "@floro/styles/ColorPalette";

const Container = styled.div`
  border-radius: 8px;
  display: block;
  position: static;
  background: ${props => props.theme.background};
`;

const MainContainer = styled.div`
  border: 2px solid ${(props) => props.theme.colors.contrastTextLight};
  border-bottom-left-radius: 8px;
  border-bottom-right-radius: 8px;
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

const StickyHeader = styled.div`
    height: 56px;
    width: 100%;
    border-top-right-radius: 8px;
    border-top-left-radius: 8px;
    border-top: 2px solid ${(props) => props.theme.colors.contrastTextLight};
    border-left: 2px solid ${(props) => props.theme.colors.contrastTextLight};
    border-right: 2px solid ${(props) => props.theme.colors.contrastTextLight};
    background: ${props => props.theme.background};
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 16px;
    box-shadow: 0px 2px 2px 2px
      ${(props) => props.theme.shadows.versionControlSideBarShadow};
`;

const DisabledTitle = styled.p`
  font-family: "MavenPro";
  font-weight: 500;
  font-size: 1.4rem;
  color: ${ColorPalette.gray};
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

const LinkPlainTextDocument = (props: Props) => {
  const theme = useTheme();

  const htmlContent = useMemo(() => {
    props.editorDoc.tree.updateRootFromHTML(props.content);
    return props.editorDoc.tree.getHtml();
  }, [props.content, props.editorDoc]);

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
        </StickyHeader>
        <MainContainer
          style={{
            padding: 24,
            color: theme.colors.contrastText,
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
                  whiteSpace: "nowrap",
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

export default React.memo(LinkPlainTextDocument);
