import React, { useMemo, useCallback, useState } from "react";
import {
  Plugin,
  PluginVersion,
} from "@floro/graphql-schemas/build/generated/main-graphql";
import styled from "@emotion/styled";
import { useTheme } from "@emotion/react";
import ColorPalette from "@floro/styles/ColorPalette";
import PluginDependencyList from "@floro/storybook/stories/common-components/PluginDependencyList";
import RepositoryUsingPluginList from "@floro/storybook/stories/common-components/RepositoryUsingPluginList";
import PluginVersionList from "@floro/storybook/stories/common-components/PluginVersionList";
import ReleasePluginModal from "./ReleasePluginModal";
import JSONPretty from "react-json-pretty";
import { Organization } from "@floro/graphql-schemas/src/generated/main-client-graphql";
import LockLight from "@floro/common-assets/assets/images/icons/lock.medium_gray.svg";
import LockDark from "@floro/common-assets/assets/images/icons/lock.dark.svg";

const Container = styled.div`
  height: 100%;
  max-width: 100%;
  overflow-x: scroll;
  padding: 24px;
  user-select: text;
`;

const TopContainer = styled.div`
  display: flex;
  flex-direction: row;
  max-width: 528px;
  margin-bottom: 48px;
  justify-content: space-between;
`;

const TopWrap = styled.div`
  display: flex;
  flex-direction: row;
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

const BigSectionContainer = styled.div`
  max-width: 624px;
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

const PrivateIcon = styled.img`
  width: 32px;
  height: 32px;
`;

const PrivateText = styled.h5`
  font-family: "MavenPro";
  font-weight: 600;
  font-size: 1.2rem;
  font-style: italic;
  color: ${props => props.theme.colors.contrastText};
`;

export interface Props {
  plugin: Plugin;
  organization?: Organization;
  pluginVersion?: PluginVersion;
  icons: { [key: string]: string };
  linkPrefix: string;
  canRelease: boolean;
  isProfileMode?: boolean;
}

const PluginDetails = (props: Props) => {
  const theme = useTheme();
  const [releaseCandidate, setReleaseCandidate] =
    useState<PluginVersion | null>(null);
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

  const privateIcon = useMemo(() => {
    return theme.name == "light" ? LockLight : LockDark;
  }, [theme.name]);

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

  const manifest = useMemo(() => {
    const parsedManifest = JSON.parse(props?.pluginVersion?.manifest ?? "{}");
    if (parsedManifest["types"]) {
      return {
        types: parsedManifest["types"],
        store: parsedManifest["store"],
      };
    }
    return {
      store: parsedManifest["store"],
    };
  }, [props.pluginVersion?.manifest]);

  const manifestTypes = useMemo(() => {
    if (manifest["types"]) {
      return manifest["types"];
    }
    return null;
  }, [manifest]);

  const manifestStore = useMemo(() => {
    return manifest["store"];
  }, [manifest]);

  const hasTypes = useMemo(() => {
    return Object.keys(manifest?.types ?? {}).length > 0;
  }, [manifest]);

  const manifestTheme = useMemo(() => {
    if (theme.name == "dark") {
      return {
        main: `line-height:1.3;color:${ColorPalette.white};font-family:MavenPro;`,
        error: `line-height:1.3;color:${ColorPalette.white};font-family:MavenPro;`,
        key: `color:${ColorPalette.lightPurple};font-family:MavenPro;`,
        string: `color:${ColorPalette.orange};font-family:MavenPro;`,
        value: `color:${ColorPalette.orange};font-family:MavenPro;`,
        boolean: `color:${ColorPalette.teal};font-family:MavenPro;`,
      };
    }
    return {
      main: `line-height:1.3;color:${ColorPalette.lightPurple};font-family:MavenPro;`,
      error: `line-height:1.3;color:${ColorPalette.lightPurple};font-family:MavenPro;`,
      key: `color:${ColorPalette.purple};font-family:MavenPro;`,
      string: `color:${ColorPalette.orange};font-family:MavenPro;`,
      value: `color:${ColorPalette.orange};font-family:MavenPro;`,
      boolean: `color:${ColorPalette.teal};font-family:MavenPro;`,
    };
  }, [theme.name]);

  return (
    <Container>
      <TopContainer>
        <TopWrap>
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
        </TopWrap>
        {props.plugin.isPrivate && (
          <div style={{display: 'flex', justifyContent: 'flex-end', alignItems: 'flex-start'}}>
            <div style={{display: 'flex', alignItems: 'center'}}>
              <PrivateText style={{marginRight: 8}}>{'private'}</PrivateText>
              <PrivateIcon src={privateIcon}/>
            </div>
          </div>
        )}
      </TopContainer>
      <SectionContainer>
        <SectionTitle>{"Description"}</SectionTitle>
        <BlurbBox>
          <BlurbText>{props?.pluginVersion?.description}</BlurbText>
        </BlurbBox>
      </SectionContainer>
      {props.plugin?.repositoriesThatUsePlugin &&
        (props.plugin?.repositoriesThatUsePlugin?.length ?? 0) > 0 && (
          <RepositoryUsingPluginList
            icons={props.icons}
            plugin={props.plugin}
          />
        )}
      {!props.isProfileMode && (
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
      )}
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
        canRelease={props.canRelease}
        isProfileMode={props.isProfileMode}
      />
      {hasTypes && manifestTypes && (
        <BigSectionContainer>
          <SectionTitle>{"Schema Type Definitions"}</SectionTitle>
          <BlurbBox style={{ overflowX: "scroll" }}>
            <JSONPretty
              space="4"
              data={manifestTypes}
              theme={manifestTheme}
            ></JSONPretty>
          </BlurbBox>
        </BigSectionContainer>
      )}
      {manifestStore && (
        <BigSectionContainer>
          <SectionTitle>{"Store Schema"}</SectionTitle>
          <BlurbBox style={{ overflowX: "scroll" }}>
            <JSONPretty
              space="4"
              data={manifestStore}
              theme={manifestTheme}
            ></JSONPretty>
          </BlurbBox>
        </BigSectionContainer>
      )}
      <ReleasePluginModal
        plugin={props?.plugin}
        show={showModal}
        pluginVersion={releaseCandidate}
        onDismiss={onDismissModal}
      />
    </Container>
  );
};

export default React.memo(PluginDetails);
