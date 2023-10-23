import React, { useMemo, useCallback, useEffect, useRef } from "react";
import styled from "@emotion/styled";
import { useTheme } from "@emotion/react";
import Button from "@floro/storybook/stories/design-system/Button";
import {
  usePluginCompatabilityCheck,
  usePluginUninstallCheck,
  useUpdatePlugins,
} from "../../local/hooks/local-hooks";
import {
  Plugin,
  PluginVersion,
  Repository,
  useGetPluginQuery,
} from "@floro/graphql-schemas/src/generated/main-client-graphql";
import { ApiResponse } from "floro/dist/src/repo";
import PluginDependencyList from "./PluginDependencyList";
import PluginVersionNavigator from "./PluginVersionNavigator";
import WarningLabel from "@floro/storybook/stories/design-system/WarningLabel";
import { Manifest } from "floro/dist/src/plugins";
import { sortPluginVersions, transformLocalManifestToPartialPlugin } from "../../local/hooks/manifest-transforms";
import DownstreamDependentsList from "./DownstreamDependentsList";
import { Link } from "react-router-dom";

import WarningLight from "@floro/common-assets/assets/images/icons/warning.light.svg";
import WarningDark from "@floro/common-assets/assets/images/icons/warning.dark.svg";

const Container = styled.div`
  display: block;
  display: flex;
  flex-direction: column;
  padding: 0px 24px 24px 24px;
  position: relative;
`;

const TopContainer = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  max-width: 100%;
  margin-bottom: 48px;
  position: sticky;
  top: 0;
  padding-top: 24px;
  padding-bottom: 24px;
  background: ${(props) => props.theme.background};
  border-bottom: 1px solid ${(props) => props.theme.colors.contrastText};
`;

const VersionInfoContainer = styled.div`
  display: flex;
  flex-direction: row;
`;

const InstallContainer = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  align-items: flex-end;
`;
// flex-grow: 1;

const InstallVersionWrapper = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  align-items: space-between;
  width: 100%;
  min-width: 320px;
`;
//min-width: 342px;

const InstallerRow = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: flex-end;
  align-items: center;
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
  display: flex;
  align-items: center;
  font-family: "MavenPro";
  font-weight: 500;
  font-size: 1rem;
  color: ${(props) => props.theme.colors.pluginDisplaySubTitle};
  &:hover {
    color: ${(props) => props.theme.colors.linkColor};
  }
`;

const VersionSubTitle = styled.span`
  display: flex;
  align-items: center;
  font-family: "MavenPro";
  font-weight: 600;
  font-size: 1.1rem;
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

interface Props {
  plugin: Plugin;
  pluginVersion: PluginVersion;
  show?: boolean;
  onDismiss?: () => void;
  apiReponse: ApiResponse;
  repository: Repository;
  onChangePluginVersion: (plugin: Plugin, pluginVersion: PluginVersion) => void;
  repoManifestList: Array<Manifest>;
  developerPlugins: Array<Plugin>;
}

const PluginInstaller = (props: Props) => {
  const theme = useTheme();
  const icon = useMemo((): string => {
    if (theme.name == "light") {
      return props.pluginVersion.selectedLightIcon as string;
    }
    return props.pluginVersion.selectedDarkIcon as string;
  }, [props.pluginVersion, theme.name]);

  const fetchPluginRequest = useGetPluginQuery({
    variables: {
      pluginName: props?.plugin?.name ?? "",
      repositoryId: props.repository.id as string
    },
    fetchPolicy: 'cache-and-network'
  });

  const plugin = useMemo(() => {
    if (
      fetchPluginRequest?.data?.getPlugin?.__typename == "FetchPluginResult"
    ) {
      return fetchPluginRequest?.data?.getPlugin?.plugin as Plugin;
    }
    return props.plugin;
  }, [fetchPluginRequest?.data, props.plugin]);

  const developerPlugin = useMemo(() => {
    if (
      props?.developerPlugins
    ) {
      return props?.developerPlugins?.find(v => v.name == props.plugin.name) as Plugin;
    }
    return props.plugin;
  }, [props?.developerPlugins, props.plugin]);

  const developerPluginVersions = useMemo(() => {
    if (developerPlugin) {
      return (
        developerPlugin?.versions?.filter?.((v) =>
          v?.version?.startsWith("dev")
        ) ?? ([] as Array<PluginVersion>)
      );
    }
    return [];
  }, [developerPlugin]);

  const pluginVersion = useMemo(() => {
    if (developerPlugin && props.pluginVersion?.version?.startsWith("dev")) {
      return (
        developerPluginVersions?.find?.((v) => {
          return v?.version == props.pluginVersion.version;
        }) ?? props.pluginVersion
      );
    }
    if (
      fetchPluginRequest?.data?.getPlugin?.__typename == "FetchPluginResult"
    ) {
      return (
        fetchPluginRequest?.data?.getPlugin?.plugin?.versions?.find?.((v) => {
          return v?.version == props.pluginVersion.version;
        }) ?? pluginVersion
      );
    }
    return props.pluginVersion;
  }, [
    fetchPluginRequest?.data,
    props.pluginVersion,
    developerPlugin,
    developerPluginVersions,
    props.developerPlugins,
  ]);

  const isInstalled = useMemo(() => {
    for (const { key, value } of props?.apiReponse?.applicationState?.plugins ??
      []) {
      if (pluginVersion.name == key && pluginVersion.version == value) {
        return true;
      }
    }
    return false;
  }, [props?.apiReponse?.applicationState?.plugins, pluginVersion]);

  const usernameDisplay = useMemo(() => {
    if (!plugin?.ownerType) {
      return "";
    }
    if (plugin?.ownerType == "user_plugin") {
      return "@" + plugin?.user?.username;
    }
    return "@" + plugin?.organization?.handle;
  }, [plugin]);

  const ownerLink = useMemo(() => {
    if (!plugin?.ownerType) {
      return "";
    }
    if (plugin?.ownerType == "user_plugin") {
      return "/user/@/" + plugin?.user?.username;
    }
    return "/org/@/" + plugin?.organization?.handle;
  }, [plugin]);

  const compatabilityCheck = usePluginCompatabilityCheck(
    props.repository,
    plugin.name ?? "",
    pluginVersion?.version ?? ""
  );

  const uninstallCheck = usePluginUninstallCheck(
    props.repository,
    plugin?.name ?? "",
    pluginVersion?.version ?? ""
  );

  const downstreamManifests = useMemo((): Array<Manifest> => {
    if (!isInstalled) {
      return [];
    }
    if (
      uninstallCheck?.data?.downstreamDeps &&
      props.repoManifestList &&
      props.apiReponse.applicationState.plugins
    ) {
      return props.apiReponse.applicationState.plugins
        ?.filter?.((v) => {
          return uninstallCheck?.data?.downstreamDeps.includes(v.key as string);
        })
        ?.map?.((plugin) => {
          const manifest = props.repoManifestList.find((manifest) => {
            return (
              manifest.name == plugin.key && manifest.version == plugin.value
            );
          });
          return (manifest as Manifest) ?? null;
        })
        .filter((v) => v != null);
    }
    return [];
  }, [
    uninstallCheck,
    props.apiReponse.applicationState.plugins,
    props.repoManifestList,
    isInstalled
  ]);

  const downstreamPlugins = useMemo((): Array<Plugin> => {
    return downstreamManifests.map((manifest) => {
      return transformLocalManifestToPartialPlugin(
        manifest.name,
        manifest.version,
        manifest,
        props.repoManifestList
      );
    });
  }, [downstreamManifests, props.repoManifestList]);

  const downstreamPluginVersions = useMemo((): Array<[Plugin, PluginVersion]> => {
    return downstreamPlugins
      ?.map((plugin) => {
        const pluginKV = props.apiReponse.applicationState.plugins.find(p => p.key == plugin.name);
        const pluginVersion = plugin?.versions?.find?.(v => v?.version == pluginKV?.value);
        return [plugin, pluginVersion];
      }) as Array<[Plugin, PluginVersion]>;
  }, [downstreamPlugins, props.apiReponse.applicationState.plugins]);

  const versions = useMemo(() => {
    const mixedVersions: Array<PluginVersion> = [
      ...((plugin?.versions?.filter((v) => !!v) as Array<PluginVersion>) ?? []),
    ];
    const mixedVersionSet = new Set(mixedVersions.map((v) => v?.version));
    for (const developmentPluginVersion of developerPluginVersions) {
      if (developmentPluginVersion && !mixedVersionSet.has(developmentPluginVersion?.version)) {
        mixedVersions.push(developmentPluginVersion);
        mixedVersionSet.add(developmentPluginVersion?.version);
      }
    }
    return sortPluginVersions(mixedVersions);
  }, [plugin.versions, developerPluginVersions])

  const onClickReleaseVersion = useCallback(
    (pluginVersion: PluginVersion) => {
      props.onChangePluginVersion(plugin, pluginVersion);
    },
    [props.onChangePluginVersion, plugin]
  );

  const updatePlugins = useUpdatePlugins(props.repository);

  const onInstallPlugin = useCallback(() => {
    const hasPlugin = props.apiReponse.applicationState.plugins?.reduce(
      (hasPlugin, existingPlugin) => {
        if (hasPlugin) {
          return true;
        }
        if (existingPlugin.key == pluginVersion.name) {
          return true;
        }
        return false;
      },
      false
    );
    if (hasPlugin) {
      const nextPlugins = props.apiReponse.applicationState.plugins.map(
        (plugin): { key: string; value: string } => {
          if (plugin?.key == pluginVersion?.name) {
            return {
              key: pluginVersion.name as string,
              value: pluginVersion.version as string,
            };
          }
          return plugin;
        }
      );
      updatePlugins.mutate(
        nextPlugins as Array<{ key: string; value: string }>
      );
    } else {
      updatePlugins.mutate([
        ...props.apiReponse.applicationState.plugins,
        {
          key: pluginVersion.name as string,
          value: pluginVersion.version as string,
        },
      ]);
    }
  }, [props.apiReponse, props.repository, plugin, pluginVersion, updatePlugins]);

  const onUninstallPlugin = useCallback(() => {
    if (!isInstalled) {
      return;
    }
    const nextPlugins = props.apiReponse.applicationState.plugins?.filter(p => {
      if(p.key == pluginVersion.name && p.value == pluginVersion.version) {
        return false;
      }
      return true;
    });
    updatePlugins.mutate(nextPlugins);
  }, [props.apiReponse, props.repository, plugin, pluginVersion, updatePlugins, isInstalled]);

  const iconRef = useRef<HTMLImageElement>(null);
  const onIconError = useCallback(() => {
    if (iconRef.current) {
      if (theme.name == "light") {
        iconRef.current.src = WarningLight;
        return;
      }
      iconRef.current.src = WarningDark;
    }
  }, [theme.name]);

  return (
    <Container>
      <TopContainer>
        <VersionInfoContainer>
          <Icon src={icon} onError={onIconError} ref={iconRef}/>
          <TitleWrapper>
            <Title>{pluginVersion?.displayName}</Title>
            <SubTitleWrapper>
              <Link to={`${ownerLink}/plugins/${pluginVersion?.name}`}>
                <SubTitle
                  style={{ fontWeight: 700 }}
                >{`${pluginVersion?.name}`}</SubTitle>
              </Link>
              <Link to={ownerLink}>
                <SubTitle>{usernameDisplay}</SubTitle>
              </Link>
            </SubTitleWrapper>
          </TitleWrapper>
        </VersionInfoContainer>
        <InstallContainer>
          <InstallVersionWrapper>
            <VersionSubTitle
              style={{ marginRight: 24 }}
            >{`version ${pluginVersion?.version}`}</VersionSubTitle>
            {!isInstalled && (
              <Button
                onClick={onInstallPlugin}
                isLoading={updatePlugins.isLoading}
                isDisabled={
                  compatabilityCheck.isLoading ||
                  !compatabilityCheck?.data?.isCompatible
                }
                label={"install plugin"}
                bg={"orange"}
                size={"medium"}
              />
            )}
            {isInstalled && (
              <Button
                onClick={onUninstallPlugin}
                isLoading={updatePlugins.isLoading}
                isDisabled={!uninstallCheck?.data?.canUninstall}
                label={"uninstall plugin"}
                bg={"gray"}
                size={"medium"}
              />
            )}
          </InstallVersionWrapper>
          {!isInstalled &&
            !compatabilityCheck.isLoading &&
            !(compatabilityCheck.data?.isCompatible ?? true) && (
              <WarningLabel
                label={"incompatible with repo plugins"}
                size={"small"}
              />
            )}
          {isInstalled &&
            !uninstallCheck.isLoading &&
            !(uninstallCheck.data?.canUninstall ?? true) && (
              <WarningLabel
                label={"repo has downstream dependents"}
                size={"small"}
              />
            )}
        </InstallContainer>
      </TopContainer>
      <SectionContainer>
        <SectionTitle>{"Description"}</SectionTitle>
        <BlurbBox>
          <BlurbText>{pluginVersion?.description ?? "No description provided"}</BlurbText>
        </BlurbBox>
      </SectionContainer>

      {downstreamPluginVersions.length > 0 && (
        <DownstreamDependentsList
          repository={props.repository}
          dependents={downstreamPluginVersions}
          pluginVersion={pluginVersion}
          onChangePluginVersion={props.onChangePluginVersion}
        />
      )}
      {pluginVersion?.pluginDependencies &&
        (pluginVersion?.pluginDependencies?.length ?? 0) > 0 && (
          <PluginDependencyList
            onChangePluginVersion={props.onChangePluginVersion}
            dependencyComptability={
              compatabilityCheck?.data?.dependencies ?? []
            }
            isInstalled={isInstalled}
            repository={props.repository}
            pluginVersion={props.pluginVersion}
          />
        )}
      <PluginVersionNavigator
        onClickReleaseVersion={onClickReleaseVersion}
        versions={versions}
        currentVersion={pluginVersion as PluginVersion}
        linkPrefix={""}
        canRelease={false}
        repository={props.repository}
        isCompatible={
          !compatabilityCheck.isLoading &&
          (compatabilityCheck.data?.isCompatible ?? true)
        }
        apiResponse={props.apiReponse}
      />
    </Container>
  );
};

export default React.memo(PluginInstaller);
