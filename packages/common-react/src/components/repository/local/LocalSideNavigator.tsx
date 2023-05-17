import React, { useMemo } from "react";
import { Repository } from "@floro/graphql-schemas/src/generated/main-client-graphql";
import { Link, useLocation, useSearchParams } from "react-router-dom";
import {
  Plugin,
} from "@floro/graphql-schemas/build/generated/main-graphql";
import styled from "@emotion/styled";
import { useTheme } from "@emotion/react";
import ColorPalette from "@floro/styles/ColorPalette";
import PluginHomeSelectedLight from "@floro/common-assets/assets/images/icons/plugin_home.selected.light.svg";
import PluginHomeSelectedDark from "@floro/common-assets/assets/images/icons/plugin_home.selected.dark.svg";
import PluginHomeUnSelectedLight from "@floro/common-assets/assets/images/icons/plugin_home.unselected.light.svg";
import PluginHomeUnSelectedDark from "@floro/common-assets/assets/images/icons/plugin_home.unselected.dark.svg";
import PluginSettingsSelectedLight from "@floro/common-assets/assets/images/icons/plugin_settings.selected.light.svg";
import PluginSettingsSelectedDark from "@floro/common-assets/assets/images/icons/plugin_settings.selected.dark.svg";
import PluginSettingsUnSelectedLight from "@floro/common-assets/assets/images/icons/plugin_settings.unselected.light.svg";
import PluginSettingsUnSelectedDark from "@floro/common-assets/assets/images/icons/plugin_settings.unselected.dark.svg";
import { useCurrentRepoState, useRepoDevPlugins, useRepoManifestList } from "./hooks/local-hooks";
import { Manifest } from "@floro/floro-lib/src/plugins";
import { transformLocalManifestToPartialPlugin } from "./hooks/manifest-transforms";
import LocalSideOption from "./LocalSideOption";
import { useLocalVCSNavContext } from "./vcsnav/LocalVCSContext";

const Navigator = styled.nav`
  width: 72px;
  border-right: 1px solid ${ColorPalette.lightPurple};
  padding: 2px 0 0 0;
  margin: 0;
  position: relative;
  background: ${(props) => props.theme.background};
  z-index: 2;
`;

const NavOptionList = styled.div`
  z-index: 0;
  position: absolute;
  width: 72px;
  display: flex;
  flex-direction: column;
`;
const NavOption = styled.div`
  height: 72px;
  width: 72px;
  position: relative;
`;

const NavIcon = styled.img`
  width: 40px;
  height: 40px;
`;

const NavText = styled.p`
  margin-top: 4px;
  margin-bottom: 0px;
  padding: 0 2px;
  font-weight: 600;
  font-size: 0.8rem;
  font-family: "MavenPro";
  text-align: center;
  white-space: nowrap;
  text-align: center;
  white-space: nowrap;
  text-overflow: ellipsis;
  overflow-x: hidden;
  max-width: 68px;
`;

const NavIconWrapper = styled.div`
  height: 72px;
  width: 72px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  overflow-x: hidden;
  position: relative;
`;

const ChangeDot = styled.div`
  position: absolute;
  right: 10px;
  bottom: 20px;
  height: 16px;
  width: 16px;
  border: 2px solid ${ColorPalette.white};
  border-radius: 50%;
`;

const ConflictDot = styled.div`
  position: absolute;
  left: 10px;
  bottom: 20px;
  height: 16px;
  width: 16px;
  border: 2px solid ${ColorPalette.white};
  background: ${props => props.theme.colors.conflictBackground};
  border-radius: 50%;
`;

const NavHighlight = styled.div`
    position: absolute;
    z-index: 0;
    transition: height 300ms, width 300ms, border-radius 300ms, top 300ms, left 300ms, background-color 300ms;
`;

interface Props {
  repository: Repository;
  plugin: string;
}

const LocalSideNavigator = (props: Props): React.ReactElement => {
  const theme = useTheme();
  const location = useLocation();
  const { compareFrom } = useLocalVCSNavContext();

  const { data: apiResponse } = useCurrentRepoState(props.repository);
  const repoManifestList = useRepoManifestList(props.repository);
  const devPluginsRequest = useRepoDevPlugins(props.repository);

  const apiManifestList = useMemo(() => {
    if (
      apiResponse?.repoState.commandMode == "compare" &&
      compareFrom == "before"
    ) {
      return apiResponse?.beforeManifests ?? [];
    }
    return repoManifestList?.data ?? [];
  }, [
    apiResponse?.repoState?.commandMode,
    apiResponse?.applicationState,
    apiResponse?.beforeState,
    compareFrom,
    repoManifestList
  ]);


  const manifestList = useMemo(() => {
    const devManifestList: Array<Manifest> = [];
    for (const pluginName in devPluginsRequest?.data ?? {}) {
      const versions = devPluginsRequest?.data?.[pluginName] ?? {};
      for (const version in versions) {
        if (versions?.[version]?.manifest) {
          devManifestList.push(versions?.[version]?.manifest);
        }
      }
    }
    return [...(apiManifestList ?? []), ...devManifestList];
  }, [apiManifestList, devPluginsRequest]);


  const plugins = useMemo(() => {
    if (
      apiResponse?.repoState.commandMode == "compare" &&
      compareFrom == "before"
    ) {
      return apiResponse?.beforeState?.plugins ?? [];
    }

    return apiResponse?.applicationState?.plugins ?? [];
  }, [
    apiResponse?.repoState?.commandMode,
    apiResponse?.applicationState,
    apiResponse?.beforeState,
    compareFrom,
  ]);

  const installedPlugins = useMemo(() => {
    if (!manifestList || !apiResponse) {
      return [];
    }
    return plugins
      .map((pluginKV) => {
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
      ?.filter((v) => v != null) as Array<Plugin>;
  }, [manifestList, plugins]);

  const HomeIcon = useMemo(() => {
    if (props.plugin?.toLowerCase() == "home") {
    return theme.name == "light"
      ? PluginHomeSelectedLight
      : PluginHomeSelectedDark;
    }
    return theme.name == "light"
      ? PluginHomeUnSelectedLight
      : PluginHomeUnSelectedDark;
  }, [props.plugin, theme.name]);

  const SettingsIcon = useMemo(() => {
    if (props.plugin?.toLowerCase() == "settings") {
    return theme.name == "light"
      ? PluginSettingsSelectedLight
      : PluginSettingsSelectedDark;
    }
    return theme.name == "light"
      ? PluginSettingsUnSelectedLight
      : PluginSettingsUnSelectedDark;
  }, [props.plugin, theme.name]);

  const apiStoreInvalidity = useMemo(() => {
    if (
      apiResponse?.repoState.commandMode == "compare" &&
      compareFrom == "before"
    ) {
      return apiResponse?.beforeApiStoreInvalidity ?? {};
    }

    return apiResponse?.apiStoreInvalidity ?? {};
  }, [
    apiResponse?.repoState?.commandMode,
    apiResponse?.apiStoreInvalidity,
    apiResponse?.beforeApiStoreInvalidity,
    compareFrom,
  ]);

  const invalidityMap = useMemo(() => {
    const out: { [key: string]: boolean} = {};
    for (const plugin in apiStoreInvalidity) {
      out[plugin] = (apiStoreInvalidity?.[plugin] ?? []).length > 0;
    }
    return out;
  }, [apiStoreInvalidity]);

    const homeHasAdditions = useMemo(() => {
      if (apiResponse?.repoState?.commandMode != "compare" || compareFrom != "after") {
        return false;
      }
      if ((apiResponse?.apiDiff?.description?.added?.length ?? 0) > 0) {
        return true;
      }
      if ((apiResponse?.apiDiff?.licenses?.added?.length ?? 0) > 0) {
        return true;
      }
      if ((apiResponse?.apiDiff?.plugins?.added?.length ?? 0) > 0) {
        return true;
      }
      return false;
    }, [
      compareFrom,
      apiResponse?.apiDiff,
      apiResponse?.repoState?.commandMode
    ]);

    const homeHasRemovals = useMemo(() => {
      if (apiResponse?.repoState?.commandMode != "compare" || compareFrom != "before") {
        return false;
      }
      if ((apiResponse?.apiDiff?.description?.removed?.length ?? 0) > 0) {
        return true;
      }
      if ((apiResponse?.apiDiff?.licenses?.removed?.length ?? 0) > 0) {
        return true;
      }
      if ((apiResponse?.apiDiff?.plugins?.removed?.length ?? 0) > 0) {
        return true;
      }
      return false;
    }, [
      compareFrom,
      apiResponse?.apiDiff,
      apiResponse?.repoState?.commandMode
    ]);

    const homeHasConflicts = useMemo(() => {
      if (!apiResponse?.repoState?.isInMergeConflict) {
        return false;
      }
      if ((apiResponse?.conflictResolution?.description?.length ?? 0) > 0) {
        return true;
      }
      if ((apiResponse?.conflictResolution?.licenses?.length ?? 0) > 0) {
        return true;
      }
      if ((apiResponse?.conflictResolution?.plugins?.length ?? 0) > 0) {
        return true;
      }
      return false;
    }, [
      apiResponse?.conflictResolution,
      apiResponse?.repoState?.isInMergeConflict
    ]);



  return (
    <Navigator>
      <NavOptionList>
        <NavOption>
          <Link
            to={location.pathname + "?plugin=home&from=local"}
            style={{ textDecoration: "none", display: "contents" }}
          >
            <NavIconWrapper>
              <NavIcon src={HomeIcon} />
              <NavText
                style={{
                  color:
                    props.plugin == "home"
                      ? theme.colors.pluginSelected
                      : theme.colors.pluginUnSelected,
                }}
              >
                {"home"}
              </NavText>
            </NavIconWrapper>
            {homeHasAdditions && (
              <ChangeDot
                style={{
                  background: theme.colors.addedBackground,
                }}
              />
            )}
            {homeHasRemovals && (
              <ChangeDot
                style={{
                  background: theme.colors.removedBackground,
                }}
              />
            )}
            {homeHasConflicts && <ConflictDot />}
          </Link>
        </NavOption>
        {installedPlugins.map((plugin, index) => {
          const isSelected = props.plugin == plugin.name;
          const isInvalid = invalidityMap[plugin?.name as string];
          return (
            <LocalSideOption
              locationPath={location.pathname}
              plugin={plugin}
              isSelected={isSelected}
              key={index}
              isInvalid={isInvalid}
              apiResponse={apiResponse}
            />
          );
        })}
      </NavOptionList>
    </Navigator>
  );
};

export default React.memo(LocalSideNavigator);