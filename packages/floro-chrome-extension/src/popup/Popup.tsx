import { useCallback, useMemo } from "react";
import useExtensionState from "../hooks/useExtensionState";
import { updateDebugMode, updateEditMode, updateState } from "../state/extensionState";
import styled from '@emotion/styled';
import Input from "@floro/storybook/stories/design-system/Input";
import Checkbox from "@floro/storybook/stories/design-system/Checkbox";
import ColorPalette from "@floro/styles/ColorPalette";
import { useTheme } from "@emotion/react";
import WarningLight from '@floro/common-assets/assets/images/icons/warning.light.svg';
import WarningDark from '@floro/common-assets/assets/images/icons/warning.dark.svg';

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

const NoEditsContainer = styled.div`
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

const WarningImg = styled.img`
  height: 32px;
  width: 32px;

`;
const EditsContainer = styled.div`
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
  align-items: center;
`;



const Popup = () => {
  const { authToken, isDaemonConnected, activeTabId, tabPopupState, tabMetaFiles, localeRepoIds } = useExtensionState();
  const theme = useTheme();
  const warningIcon = useMemo(() => {
    if (theme.name == 'light') {
      return WarningLight;
    }

    return WarningDark;
  }, [theme.name])

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

  const isFloroSite = useMemo(() => {
    return !!tabMetaFiles[activeTabId];
  }, [activeTabId, tabMetaFiles])

  const isEditMode = useMemo(() => {
    return tabPopupState?.[activeTabId]?.isEditMode ?? false;
  }, [activeTabId, tabPopupState])

  const onToggleEditMode = useCallback(() => {
    updateEditMode(!isEditMode);
  }, [isEditMode, updateEditMode])

  const isDebugMode = useMemo(() => {
    return tabPopupState?.[activeTabId]?.isDebugMode ?? false;
  }, [activeTabId, tabPopupState])

  const onToggleDebugMode = useCallback(() => {
    updateDebugMode(!isDebugMode);
  }, [isDebugMode, updateDebugMode])

  const missingAllRepos = useMemo(() => {
    const siteRepos = tabMetaFiles?.[activeTabId] ?? [];
    for (const repoId of siteRepos) {
      if (localeRepoIds?.includes(repoId)) {
        return false;
      }
    }
    return true;
  }, [activeTabId, tabMetaFiles, localeRepoIds]);

  const missingSomeRepos = useMemo(() => {
    const siteRepos = tabMetaFiles?.[activeTabId] ?? [];
    for (const repoId of siteRepos) {
      if (!localeRepoIds?.includes(repoId)) {
        return true;
      }
    }
    return false;
  }, [activeTabId, tabMetaFiles, localeRepoIds]);

  return (
    <Container>
      <Header>{"floro"}</Header>
      <Input
        value={authToken ?? ""}
        label={"local api key"}
        placeholder={"local api key"}
        onTextChanged={onUpdateKey}
      />
      <DaemonContainer>
        <InfoRow>
          <InfoTitle>{"floro server"}</InfoTitle>
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
      {!isFloroSite && (
        <NoEditsContainer
          style={{
            width: "100%",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <InfoRow>
            <InfoTitle>{"floro not configured on this site"}</InfoTitle>
          </InfoRow>
          <WarningImg src={warningIcon} style={{ marginRight: 6 }} />
        </NoEditsContainer>
      )}
      {isFloroSite && (
        <>
        {missingAllRepos && (
          <NoEditsContainer
            style={{
              width: "100%",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <InfoRow>
              <InfoTitle>{"missing locale repos"}</InfoTitle>
            </InfoRow>
            <WarningImg src={warningIcon} style={{ marginRight: 6 }} />
          </NoEditsContainer>
        )}
        {missingSomeRepos && !missingAllRepos && (
          <NoEditsContainer
            style={{
              width: "100%",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <InfoRow>
              <InfoTitle>{"missing some locale repos"}</InfoTitle>
            </InfoRow>
            <WarningImg src={warningIcon} style={{ marginRight: 6 }} />
          </NoEditsContainer>
        )}
        {!missingAllRepos && isFloroSite && (isDaemonConnected || isEditMode) && (
          <EditsContainer>
            <InfoRow>
              <InfoTitle>{"turn on floro edit mode"}</InfoTitle>
            </InfoRow>
            <div
              style={{
                marginRight: 6,
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
              }}
            >
              <Checkbox
                isChecked={isEditMode}
                onChange={onToggleEditMode}
              />
            </div>
          </EditsContainer>
        )}
        {!missingAllRepos && isEditMode && (
          <EditsContainer>
            <InfoRow>
              <InfoTitle>{"turn on floro debug mode"}</InfoTitle>
            </InfoRow>
            <div
              style={{
                marginRight: 6,
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
              }}
            >
              <Checkbox
                isChecked={isDebugMode}
                onChange={onToggleDebugMode}
              />
            </div>
          </EditsContainer>
        )}
        </>
      )}
    </Container>
  );
};

export default Popup;
