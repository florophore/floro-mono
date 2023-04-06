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
import { Repository } from "@floro/graphql-schemas/src/generated/main-client-graphql";
import { ApiReponse } from "@floro/floro-lib/src/repo";
import { useRepoDevPlugins, useRepoManifestList } from "../local/hooks/local-hooks";
import { Manifest } from "@floro/floro-lib/src/plugins";
import { transformLocalManifestToPartialPlugin } from "../local/hooks/manifest-transforms";
import PluginEditor from "./plugin_editor/PluginEditor";

const Container = styled.div`
  height: 100%;
  max-width: 100%;
  overflow: scroll;
  padding: 24px 40px 48px 40px;
  user-select: text;

  ::-webkit-scrollbar {
    width: 4px;
    background: ${props => props.theme.background};
  }
  ::-webkit-scrollbar-thumb {
    background-color: rgba(155, 155, 155, 0.5);
    border-radius: 10px;
    border: ${props => props.theme.background};
  }
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

const BigSectionContainer = styled.div`
  max-width: 624px;
  margin-bottom: 48px;
`;

const SectionRow = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
  padding-right: 6px;
  height: 40px;
`;

const SectionTitleWrapper = styled.div`
  font-family: "MavenPro";
  font-weight: 600;
  font-size: 1.4rem;
  color: ${(props) => props.theme.colors.pluginDisplayTitle};
  display: flex;
  flex-direction: row;
  align-items: center;
`;

const SectionTitle = styled.h3`
  font-family: "MavenPro";
  font-weight: 600;
  font-size: 1.4rem;
  color: ${(props) => props.theme.colors.pluginDisplayTitle};
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

const NoLicenseContainer = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100%;
  width: 100%;
  min-height: 184px;
`;

const NoLicensesText = styled.h3`
  font-family: "MavenPro";
  font-weight: 500;
  font-size: 1.7rem;
  color: ${(props) => props.theme.colors.blurbBorder};
`;

const LicenseRow = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
  margin-top: 24px;
  margin-bottom: 24px;
  height: 32px;
`;

const LicenseTitle = styled.div`
  font-family: "MavenPro";
  font-weight: 500;
  font-size: 1.2rem;
  color: ${(props) => props.theme.colors.blurbBorder};
`;

interface Props {
  repository: Repository;
  apiResponse: ApiReponse;
}

const HomeRead = (props: Props) => {

  const repoManifestList = useRepoManifestList(props.repository);
  const devPluginsRequest = useRepoDevPlugins(props.repository);

  const manifestList = useMemo(() => {
    const devManifestList: Array<Manifest> = [];
    for (const pluginName in (devPluginsRequest?.data ?? {})) {
      const versions = devPluginsRequest?.data?.[pluginName] ?? {};
      for (const version in versions) {
        if (versions?.[version]?.manifest) {
          devManifestList.push(versions?.[version]?.manifest)
        }
      }
    }
    return [...(repoManifestList?.data ?? []), ...devManifestList];
  }, [repoManifestList?.data, devPluginsRequest]);

  const developerPlugins = useMemo(() => {
    if (!devPluginsRequest?.data) {
      return [];
    }
    const devPluginList: Array<Plugin> = [];
    for (const pluginName in devPluginsRequest?.data) {
      const versions = devPluginsRequest?.data[pluginName];
      if (Object.keys(versions)[0]) {
        const devPlugin = transformLocalManifestToPartialPlugin(
          pluginName,
          Object.keys(versions)[0],
          versions?.[Object.keys(versions)[0]]?.manifest,
          manifestList
        );
        devPluginList.push(devPlugin);
      }
    }
    return devPluginList;
  }, [manifestList, devPluginsRequest]);

  const installedPlugins = useMemo(() => {
    if (!manifestList) {
      return [];
    }
    return props.apiResponse.applicationState.plugins.map((pluginKV) => {
      const manifest = manifestList.find(
        (v) => v.name == pluginKV.key && v.version == pluginKV.value
      );
      if (!manifest) {
        return null;
      }
      return transformLocalManifestToPartialPlugin(
        pluginKV.key,
        pluginKV.value,
        manifest as Manifest,
        manifestList
      );
    })
    ?.filter(v => v != null) as Array<Plugin>;
  }, [manifestList, props.apiResponse.applicationState.plugins]);

  const description = useMemo((): string => {
    if ((props?.apiResponse?.applicationState?.description?.length ?? 0) == 0) {
      return "No description";
    }
    return props.apiResponse.applicationState.description.join(" ");
  }, [props?.apiResponse?.applicationState?.description]);

  const hasNoLicense = useMemo(() => {
    return (props?.apiResponse?.applicationState?.licenses?.length ?? 0) == 0;
  }, [props.apiResponse]);

  const hasNoPlugins = useMemo(() => {
    return (installedPlugins?.length ?? 0) == 0;
  }, [installedPlugins]);

  return (
    <Container>
      <BigSectionContainer>
        <SectionRow>
          <SectionTitleWrapper>
            <SectionTitle>{"Description"}</SectionTitle>
          </SectionTitleWrapper>
        </SectionRow>
        <BlurbBox>
          <BlurbText>{description}</BlurbText>
        </BlurbBox>
      </BigSectionContainer>
      <BigSectionContainer>
        <SectionRow>
          <SectionTitleWrapper>
            <SectionTitle>{"Licenses"}</SectionTitle>
          </SectionTitleWrapper>
        </SectionRow>
        <BlurbBox style={{ paddingTop: 0, paddingBottom: 0 }}>
          {hasNoLicense && (
            <NoLicenseContainer>
              <NoLicensesText>{"No licenses selected"}</NoLicensesText>
            </NoLicenseContainer>
          )}
          {props.apiResponse.applicationState.licenses.map((license, index) => {
            return (
              <LicenseRow key={index}>
                <LicenseTitle>{license.value}</LicenseTitle>
              </LicenseRow>
            );
          })}
        </BlurbBox>
      </BigSectionContainer>
      <BigSectionContainer>
        <SectionRow>
          <SectionTitleWrapper>
            <SectionTitle>{"Installed Plugins"}</SectionTitle>
          </SectionTitleWrapper>
        </SectionRow>
        <BlurbBox style={{ padding: 0}}>
          {hasNoPlugins && (
            <NoLicenseContainer>
              <NoLicensesText>{"No plugins installed"}</NoLicensesText>
            </NoLicenseContainer>
          )}
          {installedPlugins.length > 0 && (
            <PluginEditor
              repository={props.repository}
              apiReponse={props.apiResponse}
              plugins={installedPlugins}
              isEditMode={false}
              developerPlugins={developerPlugins}
              suggestedPlugins={[]}
            />
          )}
        </BlurbBox>
      </BigSectionContainer>
    </Container>
  );
};

export default React.memo(HomeRead);