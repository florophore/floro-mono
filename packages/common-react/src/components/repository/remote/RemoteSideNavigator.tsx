import React, { useMemo } from "react";
import { Repository } from "@floro/graphql-schemas/src/generated/main-client-graphql";
import { Link, useLocation, useSearchParams } from "react-router-dom";
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

const Navigator = styled.nav`
  width: 72px;
  border-right: 1px solid ${ColorPalette.lightPurple};
  padding: 0;
  margin: 0;
  position: relative;
  background: ${(props) => props.theme.background};
`;

const NavOptionList = styled.div`
  z-index: 0;
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

const NavHighlight = styled.div`
    position: absolute;
    z-index: 0;
    transition: height 300ms, width 300ms, border-radius 300ms, top 300ms, left 300ms, background-color 300ms;
`;

interface Props {
  repository: Repository;
  plugin: string;
}

const RepoSideNavigator = (props: Props): React.ReactElement => {
  const theme = useTheme();
  const location = useLocation();

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

  return (
    <Navigator>
      <NavOptionList>
        <NavOption>
          <Link
            to={location.pathname + "?plugin=home&from=remote"}
            style={{ textDecoration: "none", display: "contents"}}
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
          </Link>
        </NavOption>
        <NavOption>
          <Link
            to={location.pathname + "?plugin=settings&from=remote"}
            style={{ textDecoration: "none", display: "contents" }}
          >
            <NavIconWrapper>
              <NavIcon src={SettingsIcon} />
              <NavText
                style={{
                  color:
                    props.plugin == "settings"
                      ? theme.colors.pluginSelected
                      : theme.colors.pluginUnSelected,
                }}
              >
                {"settings"}
              </NavText>
            </NavIconWrapper>
          </Link>
        </NavOption>
      </NavOptionList>
    </Navigator>
  );
};

export default React.memo(RepoSideNavigator);