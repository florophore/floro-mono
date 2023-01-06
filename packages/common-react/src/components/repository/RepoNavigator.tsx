import React, { useMemo } from "react";
import { Repository } from "@floro/graphql-schemas/src/generated/main-client-graphql";
import { Link } from "react-router-dom";
import styled from "@emotion/styled";
import { css } from "@emotion/css";
import { useTheme } from "@emotion/react";
import ColorPalette from "@floro/styles/ColorPalette";
import { useSession } from "../../session/session-context";
import OrgProfilePhoto from "@floro/storybook/stories/common-components/OrgProfilePhoto";
import {
  useOfflinePhoto,
  useOfflinePhotoMap,
} from "../../offline/OfflinePhotoContext";
import { useUserOrganizations } from "../../hooks/offline";
import UserProfilePhoto from "@floro/storybook/stories/common-components/UserProfilePhoto";
import PluginDefaultSelected from "@floro/common-assets/assets/images/icons/plugin_default.selected.svg";
import PluginDefaultUnSelectedLight from "@floro/common-assets/assets/images/icons/plugin_default.unselected.light.svg";
import PluginDefaultUnSelectedDark from "@floro/common-assets/assets/images/icons/plugin_default.unselected.dark.svg";
import PluginHomeSelected from "@floro/common-assets/assets/images/icons/plugin_home.selected.svg";
import PluginHomeUnSelectedLight from "@floro/common-assets/assets/images/icons/plugin_home.unselected.light.svg";
import PluginHomeUnSelectedDark from "@floro/common-assets/assets/images/icons/plugin_home.unselected.dark.svg";
import PluginSettingsSelected from "@floro/common-assets/assets/images/icons/plugin_settings.selected.svg";
import PluginSettingsUnSelectedLight from "@floro/common-assets/assets/images/icons/plugin_settings.unselected.light.svg";
import PluginSettingsUnSelectedDark from "@floro/common-assets/assets/images/icons/plugin_settings.unselected.dark.svg";
import RepoSideNavigator from "./RepoSideNavigator";
import VersionControlPanel from "./VersionControlPanel";

const Container = styled.main`
  display: flex;
  flex-direction: row;
  height: 100%;
  flex: 1;
  overflow: hidden;
`;

const ContentContainer = styled.div`
  display: flex;
  flex-stretch: 1;
  flex: 1;
  flex-direction: column;
  height: 100%;
  max-height: 100%;
`;

const Navigator = styled.nav`
  width: 72px;
  border-right: 1px solid ${ColorPalette.lightPurple};
  padding: 0;
  margin: 0;
  position: relative;
  background: ${(props) => props.theme.background};
`;

const NavOptionHighlight = styled.div`
  z-index: 0;
  position: absolute;
  top: 0px;
  left: 0px;
  height: 72px;
  width: 72px;
`;

const DragFill = styled.div`
  flex: 1;
  height: 100%;
  -webkit-app-region: drag;
  cursor: drag;
`;

const NavOptionList = styled.div`
  z-index: 0;
  width: 72px;
  display: flex;
  flex-direction: column;
`;
const NavOption = styled.div`
  z-index: 0;
  height: 72px;
  width: 72px;
  display: flex;
  justify-content: center;
  align-items: center;
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
`;

interface Props {
  repository: Repository;
  plugin: string;
  children: React.ReactElement;
}

const RepoNavigator = (props: Props): React.ReactElement => {
  const theme = useTheme();

  return (
    <Container>
      <RepoSideNavigator repository={props.repository} plugin={props.plugin}/>
      <ContentContainer>{props.children}</ContentContainer>
      <VersionControlPanel repository={props.repository} />
    </Container>
  );
};

export default React.memo(RepoNavigator);
