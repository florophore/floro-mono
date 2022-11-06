import React, { useMemo } from "react";
import styled from "@emotion/styled";
import ColorPalette from "@floro/styles/ColorPalette";
import { useTheme } from "@emotion/react";

const Container = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
  user-select: none;
  width: 100%;
`;

const TextContainer = styled.div`
  flex: 1;
  display: flex;
  flex-direction: row;
  align-items: center;
  margin: 0;
  padding: 0;
`;

const ConnectionContainer = styled.div`
  width: 24px;
  height: 24px;
  display: flex;
  justify-content: center;
  align-items: center;
  margin-right: 8px;
`;

const ConnectionCircle = styled.div`
  height: 18px;
  width: 18px;
  border-radius: 9px;
  transition: background-color 500ms;
`;

const TextSpan = styled.span`
  font-size: 0.9rem;
  font-family: "MavenPro";
  font-weight: 600;
  color: ${(props) => props.theme.colors.followerTextColor};
`;

export interface Props {
  isConnected: boolean;
}

const ConnectionStatusTab = (props: Props): React.ReactElement => {
    const theme = useTheme();
  const circleColor = useMemo(
    () => (props.isConnected ? ColorPalette.teal : theme.name == 'light' ? ColorPalette.red : ColorPalette.lightRed),
    [props.isConnected, theme.name]
  );
  const connectionText = useMemo(
    () => (props.isConnected ? "Daemon running" : "Daemon disconnected"),
    [props.isConnected]
  );

  return (
    <Container>
      <ConnectionContainer>
        <ConnectionCircle style={{ background: circleColor }} />
      </ConnectionContainer>
      <TextContainer>
        <TextSpan>{connectionText}</TextSpan>
      </TextContainer>
    </Container>
  );
};

export default React.memo(ConnectionStatusTab);
