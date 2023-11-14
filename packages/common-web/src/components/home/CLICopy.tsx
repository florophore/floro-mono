import React, { useMemo, useState, useCallback, useEffect } from "react";
import styled from "@emotion/styled";
import { useTheme } from "@emotion/react";
import ColorPalette, { Opacity } from "@floro/styles/ColorPalette";
import { useIcon } from "../../floro_listener/FloroIconsProvider";
import { useRichText } from "../../floro_listener/hooks/locales";

const Container = styled.div`
  position: relative;
  background: ${(props) => props.theme.name == 'light' ? ColorPalette.lightGray : ColorPalette.mediumGray};
  border-radius: 8px;
  padding: 6px 8px;
  box-shadow: 0px 2px 8px 4px ${props => props.theme.colors.tooltipOuterShadowColor};
  transition: box-shadow 600ms;
  &:hover {
    box-shadow: 0px 2px 6px 2px ${props => props.theme.colors.tooltipOuterShadowColor};
  }
  overflow: hidden;
`;

const TopRow = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
`;

const Secret = styled.p`
  margin: 0;
  padding: 0;
  font-family: "MavenPro";
  color: ${(props) => props?.theme.colors.contrastText};
  margin-top: 3px;
  user-select: text;
  font-weight: 500;
  font-size: 1rem;
  white-space: nowrap;
  max-width: 440px;
  overflow-x: scroll;
  &::-webkit-scrollbar {
    height: 4px;
  }
  &::-webkit-scrollbar-track {
    background: transparent;
  }
  &::-webkit-scrollbar-thumb {
    background-color: rgba(155, 155, 155, 0.5);
    border-radius: 10px;
    border: transparent;
  }
`;

const CopyIcon = styled.img`
  height: 24px;
  width: 24px;
  margin-left: 8px;
  cursor: pointer;
`;

const CopyOverlay = styled.div`
  height: 100%;
  width: 100%;
  position: absolute;
  top: 0;
  left: 0;
  z-index: 1;
  pointer-events: none;
  display: flex;
  justify-content: center;
  align-items: center;
  transition: opacity 500ms;
`;

const CopyText = styled.span`
  font-family: "MavenPro";
  font-weight: 500;
  font-size: 1.4rem;
  color: ${ColorPalette.white};
  text-align: center;
  padding: 0;
  margin: 0 0 0 0;
`;

const CLICopy = (): React.ReactElement => {
  const theme = useTheme();
  const [clickedCopy, setClickedCopy] = useState(false);
  useEffect(() => {
    if (clickedCopy) {
      const timeout = setTimeout(() => {
        setClickedCopy(false);
      }, 700);
      return () => {
        clearTimeout(timeout);
      };
    }
  }, [clickedCopy]);

  const onClickCopy = useCallback(() => {
    const blob = new Blob(["npm install -g floro"], { type: "text/plain" });
    navigator.clipboard.write([
      new ClipboardItem({
        ["text/plain"]: blob,
      }),
    ]);
    setClickedCopy(true);
  }, []);

  const copyIcon = useIcon("front-page.copy");
  const copiedText = useRichText("components.copied");

  return (
    <Container>
      <CopyOverlay
        style={{
          opacity: clickedCopy ? 1 : 0,
          background:
            theme.name == "light"
              ? ColorPalette.mediumGray.substring(0, 7) + Opacity[50]
              : ColorPalette.black.substring(0, 7) + Opacity[80],
        }}
      >
        <CopyText>{copiedText}</CopyText>
      </CopyOverlay>
      <TopRow>
        <Secret><span style={{userSelect: "none"}}>{'$ '}</span><b>{"npm install -g floro"}</b></Secret>
        <CopyIcon src={copyIcon} onClick={onClickCopy} />
      </TopRow>
    </Container>
  );
};

export default React.memo(CLICopy);
