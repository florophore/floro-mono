import { useCallback, useMemo } from "react";
import useExtensionState from "../hooks/useExtensionState";
import { updateState } from "../state/extensionState";
import styled from '@emotion/styled';
import Input from "@floro/storybook/stories/design-system/Input";
import ColorPalette from "@floro/styles/ColorPalette";
import { useTheme } from "@emotion/react";

const Container = styled.div`
  width: 500px;
  background: ${props => props.theme.background};
  padding: 24px;
  display: flex;
  flex-direction: column;
  border: red;
  align-items: center;
`;

const Header = styled.h1`
  color: ${props => props.theme.colors.titleText};
  text-align: center;
  width: 100%;
  font-size: 2rem;
  font-family: "MavenPro";
  font-weight: 600;
`;


const DaemonContainer = styled.div`
  margin-top: 24px;
  width: 100%;
  max-width: 430px;
  border: 2px solid ${(props) => props.theme.colors.contrastTextLight};
  padding: 16px 8px;
  border-radius: 8px;
  height: 56px;
  display: flex;
  flex-direction: row;
  justify-content: space-between;
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
  width: 40px;
  height: 40px;
  display: flex;
  justify-content: center;
  align-items: center;
  margin-left: 8px;
`;

const InfoRow = styled.div`
  display: flex;
  align-items: center;
  flex-direction: row;
`;

const InfoTitle = styled.h3`
  color: ${props => props.theme.colors.contrastTextLight};
  text-align: center;
  width: 100%;
  font-size: 1.4rem;
  font-family: "MavenPro";
  font-weight: 500;
`;

const ConnectionCircle = styled.div`
  height: 32px;
  width: 32px;
  border-radius: 16px;
  transition: background-color 500ms;
`;

const TextSpan = styled.span`
  font-size: 1.2rem;
  font-family: "MavenPro";
  font-weight: 600;
  color: ${(props) => props.theme.name == "light" ? ColorPalette.lightGray : ColorPalette.gray};
`;

const Popup = () => {
  const { authToken, isDaemonConnected } = useExtensionState();
  const theme = useTheme();

  const onUpdateKey = useCallback((authToken: string) => {
    updateState({
      authToken
    });
  }, []);

  const circleColor = useMemo(
    () => (isDaemonConnected ? ColorPalette.teal : theme.name == 'light' ? ColorPalette.red : ColorPalette.lightRed),
    [isDaemonConnected, theme.name]
  );
  const connectionText = useMemo(
    () => (isDaemonConnected ? "connected" : "disconnected"),
    [isDaemonConnected]);

  return (
    <Container>
      <Header >{"floro"}</Header>
      <Input value={authToken ?? ""} label={"locale api key"} placeholder={"locale api key"} onTextChanged={onUpdateKey}/>
      <DaemonContainer>
        <InfoRow>
          <InfoTitle>
            {'floro server'}
          </InfoTitle>
        </InfoRow>
        <InfoRow>
          <TextContainer>
            <TextSpan>{connectionText}</TextSpan>
          </TextContainer>
          <ConnectionContainer>
            <ConnectionCircle style={{ background: circleColor }} />
          </ConnectionContainer>
        </InfoRow>
      </DaemonContainer>
    </Container>
  );
};

export default Popup;
