import React, { useMemo, useCallback, useState } from "react";
import {
  Plugin,
  PluginVersion,
} from "@floro/graphql-schemas/build/generated/main-graphql";
import styled from "@emotion/styled";
import { useTheme } from "@emotion/react";
import ColorPalette from "@floro/styles/ColorPalette";
import PluginDependencyList from "@floro/storybook/stories/common-components/PluginDependencyList";
import PluginVersionList from "@floro/storybook/stories/common-components/PluginVersionList";
import ReleasePluginModal from "./ReleasePluginModal";

const Container = styled.div`
  height: 100%;
  max-width: 100%;
  overflow-x: scroll;
  padding: 24px;
`;

const TopContainer = styled.div`
  display: flex;
  flex-direction: row;
  max-width: 528px;
  margin-bottom: 48px;
`;

const Icon = styled.img`
  width: 80px;
  height: 80px;
  margin-right: 24px;
`;

const TitleWrapper = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  flex-stretch: 1;
`;

const Title = styled.h1`
  font-family: "MavenPro";
  font-weight: 700;
  font-size: 2rem;
  color: ${(props) => props.theme.colors.pluginDisplayTitle};
`;

const SubTitleWrapper = styled.span`
  display: flex;
  flex-direction: column;
  justify-content: space-between;
`;

const SubTitle = styled.span`
  font-family: "MavenPro";
  font-weight: 500;
  font-size: 1rem;
  color: ${(props) => props.theme.colors.pluginDisplaySubTitle};
`;

const SectionContainer = styled.div`
  max-width: 528px;
  margin-bottom: 48px;
`;

const SectionTitle = styled.h3`
  font-family: "MavenPro";
  font-weight: 600;
  font-size: 1.4rem;
  color: ${(props) => props.theme.colors.pluginDisplayTitle};
  margin-bottom: 24px;
`;

const BlurbBox = styled.div`
  font-family: "MavenPro";
  font-weight: 600;
  font-size: 1.4rem;
  border: 1px solid ${(props) => props.theme.colors.blurbBorder};
  padding: 16px;
  border-radius: 8px;
  min-height: 184px;
`;

const BlurbText = styled.span`
  color: ${(props) => props.theme.colors.blurbBorder};
  font-family: "MavenPro";
  font-weight: 400;
  font-size: 1rem;
  white-space: pre-wrap;
  display: block;
`;

const IconBox = styled.div`
  border: 1px solid ${(props) => props.theme.colors.blurbBorder};
  border-radius: 8px;
  height: 152px;
  display: flex;
  flex-direction: row;
`;

const IconWrapper = styled.div`
  margin-top: 8px;
  flex-grow: 1;
  width: 100%;
  display: flex;
  flex-direction: row;
  justify-content: space-around;
  align-items: center;
`;

const ColoredIconWrapper = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
`;

const ColoredIcon = styled.img`
  width: 56px;
  height: 56px;
`;

const LightIconContainer = styled.div`
  flex: 1;
  height: 100%;
  background: ${ColorPalette.lightModeBG};
  box-sizing: border-box;
  padding: 16px;
  display: flex;
  flex-direction: column;
  border-bottom-left-radius: 8px;
  border-top-left-radius: 8px;
`;

const LightIconTitle = styled.h5`
  font-family: "MavenPro";
  font-weight: 600;
  font-size: 1.2rem;
  color: ${ColorPalette.mediumGray};
`;

const LightIconLabel = styled.h6`
  font-family: "MavenPro";
  font-weight: 500;
  font-size: 1rem;
  color: ${ColorPalette.mediumGray};
`;

const DarkIconContainer = styled.div`
  flex: 1;
  height: 100%;
  background: ${ColorPalette.darkModeBG};
  box-sizing: border-box;
  padding: 16px;
  display: flex;
  flex-direction: column;
  border-bottom-right-radius: 8px;
  border-top-right-radius: 8px;
`;

const DarkIconTitle = styled.h5`
  font-family: "MavenPro";
  font-weight: 600;
  font-size: 1.2rem;
  color: ${ColorPalette.white};
`;

const DarkIconLabel = styled.h6`
  font-family: "MavenPro";
  font-weight: 500;
  font-size: 1rem;
  color: ${ColorPalette.white};
`;

export interface Props {
  plugin: Plugin;
  pluginVersion?: PluginVersion;
  icons: { [key: string]: string };
  linkPrefix: string;
}

const PluginDetails = (props: Props) => {
  const theme = useTheme();
  const [releaseCandidate, setReleaseCandidate] = useState<PluginVersion|null>(null)
  const [showModal, setShowModal] = useState<boolean>(false);
  const icon = useMemo(() => {
    if (theme.name == "light") {
      return (
        props.icons?.[props.pluginVersion?.selectedLightIcon as string] ??
        props.pluginVersion?.selectedLightIcon
      );
    }
    return (
      props.icons?.[props.pluginVersion?.selectedDarkIcon as string] ??
      props.pluginVersion?.selectedDarkIcon
    );
  }, [
    theme.name,
    props.icons,
    props.pluginVersion?.selectedDarkIcon,
    props.pluginVersion?.selectedLightIcon,
  ]);

  const lightIcon = useMemo(() => {
    return (
      props.icons?.[props.pluginVersion?.lightIcon as string] ??
      props.pluginVersion?.lightIcon
    );
  }, [props.pluginVersion?.lightIcon]);

  const darkIcon = useMemo(() => {
    return (
      props.icons?.[props.pluginVersion?.darkIcon as string] ??
      props.pluginVersion?.darkIcon
    );
  }, [props.pluginVersion?.darkIcon]);

  const selectedLightIcon = useMemo(() => {
    return (
      props.icons?.[props.pluginVersion?.selectedLightIcon as string] ??
      props.pluginVersion?.selectedLightIcon
    );
  }, [props.pluginVersion?.selectedLightIcon]);

  const selectedDarkIcon = useMemo(() => {
    return (
      props.icons?.[props.pluginVersion?.selectedDarkIcon as string] ??
      props.pluginVersion?.selectedDarkIcon
    );
  }, [props.pluginVersion?.selectedDarkIcon]);

  const onClickReleaseVersion = useCallback((version) => {
    setReleaseCandidate(version);
    setShowModal(true);
  }, []);

  const onDismissModal = useCallback(() => {
    setShowModal(false);
  }, []);

  return (
    <Container>
      <TopContainer>
        <Icon src={icon} />
        <TitleWrapper>
          <Title>{props.pluginVersion?.displayName}</Title>
          <SubTitleWrapper>
            <SubTitle
              style={{ fontWeight: 700 }}
            >{`${props.pluginVersion?.name}`}</SubTitle>
            <SubTitle>{`version ${props.pluginVersion?.version}`}</SubTitle>
          </SubTitleWrapper>
        </TitleWrapper>
      </TopContainer>
      <SectionContainer>
        <SectionTitle>{"Description"}</SectionTitle>
        <BlurbBox>
          <BlurbText>{props?.pluginVersion?.description}</BlurbText>
        </BlurbBox>
      </SectionContainer>
      <SectionContainer>
        <SectionTitle>{"Plugin Icons"}</SectionTitle>
        <IconBox>
          <LightIconContainer>
            <LightIconTitle>{"Light Mode"}</LightIconTitle>
            <IconWrapper>
              <ColoredIconWrapper>
                <ColoredIcon src={lightIcon} />
                <LightIconLabel>{"Regular"}</LightIconLabel>
              </ColoredIconWrapper>
              <ColoredIconWrapper>
                <ColoredIcon src={selectedLightIcon} />
                <LightIconLabel>{"Selected"}</LightIconLabel>
              </ColoredIconWrapper>
            </IconWrapper>
          </LightIconContainer>
          <DarkIconContainer>
            <DarkIconTitle>{"Dark Mode"}</DarkIconTitle>
            <IconWrapper>
              <ColoredIconWrapper>
                <ColoredIcon src={darkIcon} />
                <DarkIconLabel>{"Regular"}</DarkIconLabel>
              </ColoredIconWrapper>
              <ColoredIconWrapper>
                <ColoredIcon src={selectedDarkIcon} />
                <DarkIconLabel>{"Selected"}</DarkIconLabel>
              </ColoredIconWrapper>
            </IconWrapper>
          </DarkIconContainer>
        </IconBox>
      </SectionContainer>
      {props.pluginVersion?.pluginDependencies &&
        (props.pluginVersion?.pluginDependencies?.length ?? 0) > 0 && (
          <PluginDependencyList
            icons={props.icons}
            dependencies={
              props.pluginVersion?.pluginDependencies as PluginVersion[]
            }
          />
        )}
      <PluginVersionList
        versions={(props.plugin?.versions ?? []) as PluginVersion[]}
        currentVersion={props.pluginVersion as PluginVersion}
        icons={props.icons}
        linkPrefix={props.linkPrefix}
        onClickReleaseVersion={onClickReleaseVersion}
      />
      <ReleasePluginModal show={showModal} pluginVersion={releaseCandidate} onDismiss={onDismissModal}/>
    </Container>
  );
};

export default React.memo(PluginDetails);
