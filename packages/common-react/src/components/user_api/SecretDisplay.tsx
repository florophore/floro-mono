import React, { useMemo, useState, useCallback, useEffect } from "react";
import styled from "@emotion/styled";
import { useTheme } from "@emotion/react";
import UserProfilePhoto from "@floro/storybook/stories/common-components/UserProfilePhoto";
import {
  Organization,
  OrganizationMember,
} from "@floro/graphql-schemas/src/generated/main-client-graphql";
import ColorPalette, { Opacity } from "@floro/styles/ColorPalette";
import TimeAgo from "javascript-time-ago";
import Button from "@floro/storybook/stories/design-system/Button";
import { ApiKey } from "floro/dist/src/apikeys";
import CopyLight from "@floro/common-assets/assets/images/repo_icons/copy.gray.svg";
import CopyDark from "@floro/common-assets/assets/images/icons/copy.dark.svg";

const Container = styled.div`
  position: relative;
  background: ${(props) => props.theme.background};
  border-radius: 8px;
  border: 2px solid ${(props) => props.theme.colors.inputBorderColor};
  padding: 6px 8px;
  width: 520px;
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
  color: ${(props) => props?.theme.colors.contrastTextLight};
  user-select: text;
  font-weight: 500;
  font-size: 1rem;
`;

const CopyIcon = styled.img`
    height: 24px;
    width: 24px;
    margin-left: 8px;
    cursor: pointer;
`;

const ButtonRow = styled.div`
  display: flex;
  justify-content: space-between;
  margin-top: 24px;
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

const CopyText = styled.p`
  font-family: "MavenPro";
  font-weight: 500;
  font-size: 1.4rem;
  color: ${ColorPalette.white};
  text-align: center;
  padding: 0;
  margin: 0 0 0 0;
`;



export interface Props {
  secret: string;
}

const SecretDisplay = (props: Props): React.ReactElement => {
  const theme = useTheme();
  const [clickedCopy, setClickedCopy] = useState(false);
  useEffect(() => {
    if (clickedCopy) {
      const timeout = setTimeout(() => {
        setClickedCopy(false);
      }, 700);
      return () => {
        clearTimeout(timeout);
      }
    }
  }, [clickedCopy])

  const onClickCopy = useCallback(() => {
    const blob = new Blob([props.secret], { type: "text/plain" });
    navigator.clipboard.write([
      new ClipboardItem({
        ["text/plain"]: blob,
      }),
    ]);
    setClickedCopy(true);
  }, [props.secret]);

  const copyIcon = useMemo(() => {
    if (theme.name == "light") {
      return CopyLight;
    }
    return CopyDark;
  }, [theme.name]);

  return (
    <Container>

          <CopyOverlay style={{
            opacity: clickedCopy ? 1 : 0,
            background: theme.name == "light" ? ColorPalette.mediumGray.substring(0, 7) + Opacity[50] : ColorPalette.black.substring(0, 7) + Opacity[80]
          }}>
            <CopyText>{'copied!'}</CopyText>
          </CopyOverlay>
        <TopRow>
            <Secret>{props.secret}</Secret>
            <CopyIcon src={copyIcon} onClick={onClickCopy}/>
        </TopRow>
    </Container>
  );
};

export default React.memo(SecretDisplay);