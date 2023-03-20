import React, { useMemo, useCallback, useEffect } from "react";
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
import { ApiReponse } from "@floro/floro-lib/src/repo";
import PluginDependencyList from "./PluginDependencyList";
import PluginVersionNavigator from "./PluginVersionNavigator";
import WarningLabel from "@floro/storybook/stories/design-system/WarningLabel";
import { Manifest } from "@floro/floro-lib/src/plugins";
import { transformLocalManifestToPartialPlugin } from "../../local/hooks/manifest-transforms";
import DownstreamDependentsList from "./DownstreamDependentsList";
import { useQueryClient } from "react-query";

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
  flex-grow: 1;
  justify-content: space-between;
  align-items: flex-end;
  flex-stretch: 1;
`;

const InstallVersionWrapper = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: flex-end;
  align-items: space-between;
  min-width: 320px;
`;

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
  apiReponse: ApiReponse;
  repository: Repository;
  onChangePluginVersion: (plugin: Plugin, pluginVersion: PluginVersion) => void;
  repoManifestList: Array<Manifest>;
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

  const pluginVersion = useMemo(() => {
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
  }, [fetchPluginRequest?.data, props.pluginVersion]);

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
      return p.key != pluginVersion.name && p.value != pluginVersion.version;
    });
    updatePlugins.mutate(nextPlugins);
  }, [props.apiReponse, props.repository, plugin, pluginVersion, updatePlugins, isInstalled]);

  return (
    <Container>
      <TopContainer>
        <VersionInfoContainer>
          <Icon src={icon} />
          <TitleWrapper>
            <Title>{pluginVersion?.displayName}</Title>
            <SubTitleWrapper>
              <SubTitle
                style={{ fontWeight: 700 }}
              >{`${pluginVersion?.name}`}</SubTitle>
              <SubTitle>{usernameDisplay}</SubTitle>
            </SubTitleWrapper>
          </TitleWrapper>
        </VersionInfoContainer>
        <InstallContainer>
          <InstallVersionWrapper>
            <SubTitle
              style={{ marginRight: 24 }}
            >{`version ${pluginVersion?.version}`}</SubTitle>
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
          <BlurbText>{pluginVersion?.description}</BlurbText>
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
        pluginVersion?.id &&
        (pluginVersion?.pluginDependencies?.length ?? 0) > 0 && (
          <PluginDependencyList
            pluginVersionId={pluginVersion.id}
            dependencies={pluginVersion?.pluginDependencies as PluginVersion[]}
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
        versions={(plugin?.versions ?? []) as PluginVersion[]}
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
