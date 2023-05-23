import React, { useMemo } from "react";
import { Plugin, PluginVersion, Repository } from "@floro/graphql-schemas/src/generated/main-client-graphql";
import styled from "@emotion/styled";
import { useTheme } from "@emotion/react";
import WarningLabel from "@floro/storybook/stories/design-system/WarningLabel";
import WarningIconLight from '@floro/common-assets/assets/images/icons/warning.light.svg';
import WarningIconDark from '@floro/common-assets/assets/images/icons/warning.dark.svg';
import { usePluginManifestList } from "../../local/hooks/local-hooks";
import { Manifest } from "floro/dist/src/plugins";
import { transformLocalManifestToPartialPlugin } from "../../local/hooks/manifest-transforms";

const SectionContainer = styled.div`
  max-width: 528px;
  margin-bottom: 48px;
`;

const TopRow = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
`;

const SectionTitle = styled.h3`
  font-family: "MavenPro";
  font-weight: 600;
  font-size: 1.4rem;
  color: ${(props) => props.theme.colors.pluginDisplayTitle};
`;

const DependencyBox = styled.div`
  font-family: "MavenPro";
  font-weight: 600;
  font-size: 1.4rem;
  border: 1px solid ${(props) => props.theme.colors.blurbBorder};
  padding: 16px;
  border-radius: 8px;
`;

const Row = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
`;

const LeftSide = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;
`;

const RightSide = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;
`;

const Icon = styled.img`
  height: 56px;
  width: 56px;
  margin-right: 12px;
`;

const DependencyTitle = styled.h2`
  font-family: "MavenPro";
  font-weight: 500;
  font-size: 1.4rem;
  text-decoration: underline;
  color: ${(props) => props.theme.colors.pluginDisplayTitle};
  cursor: pointer;
`;

const VersionTitle = styled.h3`
  font-family: "MavenPro";
  font-weight: 500;
  font-size: 1.2rem;
  color: ${(props) => props.theme.colors.pluginDisplaySubTitle};
`;

const WarningImage = styled.img`
    margin-right: 12px
`;

const usePluginVersionDependecies = (repository: Repository, pluginVersion: PluginVersion): [Array<Plugin>, Array<PluginVersion>] => {
  const pluginManifestList = usePluginManifestList(
    repository,
    pluginVersion.name as string,
    pluginVersion.version as string
  );
  const manifests = useMemo((): Array<Manifest> => {
    if (pluginManifestList?.data) {
      return pluginManifestList?.data ?? [];
    }
    return [];
  }, [pluginManifestList?.data]);

  const currentManifest = useMemo(() => {
    return manifests.find(m => m.name == pluginVersion.name && m.version == pluginVersion.version);
  }, [pluginVersion, manifests]);

  return useMemo(() => {
    const depTuple = manifests.filter(m => {
      if (!currentManifest) {
        return false;
      }
      return currentManifest.imports[m.name] == m?.version;
    }).map((manifest) => {
      const plugin = transformLocalManifestToPartialPlugin(
        manifest.name,
        manifest.version,
        manifest,
        manifests
      );
      return [plugin, plugin.versions?.find(m => m?.version == manifest.version)] as [Plugin, PluginVersion];
    });
    const pluginsOut: Array<Plugin> = [];
    const pluginVersionsOut: Array<PluginVersion> = [];
    for (const entry of depTuple) {
      pluginsOut.push(entry[0]);
      pluginVersionsOut.push(entry[1]);
    }
    return [pluginsOut, pluginVersionsOut];
  }, [manifests, repository, pluginVersion]);
}

export interface Props {
  pluginVersion: PluginVersion;
  onChangePluginVersion: (plugin: Plugin, pluginVersion: PluginVersion) => void;
  dependencyComptability: Array<{
    isCompatible: boolean,
    pluginName: string,
    pluginVersion: string,
  }>;
  isInstalled: boolean;
  repository: Repository;
}


const PluginDependencyList = (props: Props) => {
  const theme = useTheme();
  const [pluginDependencies, pluginVersionDependecies] = usePluginVersionDependecies(
    props.repository,
    props.pluginVersion
  );

  const pluginDependenciesWithImages = useMemo(() => {
    return pluginVersionDependecies?.map((pd) => {
      if (!pd.id) {
        const remotePluginDep = props.pluginVersion.pluginDependencies?.find(v => v?.name == pd.name && v?.version == pd?.version);
        if (remotePluginDep) {
          return remotePluginDep;
        }
      }
      return pd;
    });

  }, [pluginVersionDependecies, props.pluginVersion]);

  const hasIncompatibility = useMemo(() => {
    return props.dependencyComptability?.reduce?.((hasIncompatibility, compatibilityCheck) => {
      if (hasIncompatibility) {
        return true;
      }
      if (!compatibilityCheck.isCompatible) {
        return true;
      }
      return false;
    }, false) ?? false;
  }, [props.dependencyComptability])

  const warningIcon = useMemo(() => {
    if (theme.name == 'dark') {
        return WarningIconDark;
    }
    return WarningIconLight;
  }, [theme.name]);

  const rows = useMemo(() => {
    return pluginDependenciesWithImages?.map((pluginVersion, index) => {
      const icon =
        theme.name == "light"
          ? pluginVersion.selectedLightIcon ?? ""
          : pluginVersion.selectedDarkIcon ?? "";

      const isCompatible =
        props.dependencyComptability?.find(
          (d) =>
            d.pluginName == pluginVersion.name &&
            d.pluginVersion == pluginVersion.version
        )?.isCompatible ?? true;
      return (
        <Row
          key={index}
          style={{
            marginBottom:
              index != (pluginVersionDependecies?.length ?? 0) - 1 ? 18 : 0,
          }}
          onClick={() => {
            const plugin = pluginDependencies?.find(
              (plugin: Plugin) => plugin.name == pluginVersion.name
            );
            const nextPluginVersion = (
              (plugin?.versions ?? []) as Array<PluginVersion>
            )?.find?.((pv: PluginVersion) => pv.version == pluginVersion.version);
            if (plugin && nextPluginVersion) {
              props.onChangePluginVersion(plugin, nextPluginVersion);
            }
          }}
        >
          <LeftSide>
            <Icon src={icon} />
            <DependencyTitle>{pluginVersion?.name}</DependencyTitle>
          </LeftSide>
          <RightSide>
            {!isCompatible &&
              <WarningImage src={warningIcon} style={{ height: 24 }} />
            }
            <VersionTitle>{pluginVersion?.version}</VersionTitle>
          </RightSide>
        </Row>
      );
    });
  }, [
    pluginDependenciesWithImages,
    theme.name,
    pluginDependencies,
    props.onChangePluginVersion,
    props.dependencyComptability,
    warningIcon
  ]);
  return (
    <SectionContainer>
      <TopRow>
        <SectionTitle>{"Dependencies"}</SectionTitle>
        {hasIncompatibility &&
          <WarningLabel label={"incompatible dependencies"} size={"small"}/>
        }
      </TopRow>
      <DependencyBox>{rows}</DependencyBox>
    </SectionContainer>
  );
};

export default React.memo(PluginDependencyList);