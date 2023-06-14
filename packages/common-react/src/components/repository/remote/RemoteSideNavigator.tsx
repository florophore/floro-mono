import React, { useMemo } from "react";
import { PluginVersion, Repository } from "@floro/graphql-schemas/src/generated/main-client-graphql";
import { Link, useLocation, useSearchParams } from "react-router-dom";
import styled from "@emotion/styled";
import { useTheme } from "@emotion/react";
import ColorPalette from "@floro/styles/ColorPalette";
import PluginHomeSelectedLight from "@floro/common-assets/assets/images/icons/plugin_home.selected.light.svg";
import PluginHomeSelectedDark from "@floro/common-assets/assets/images/icons/plugin_home.selected.dark.svg";
import PluginHomeUnSelectedLight from "@floro/common-assets/assets/images/icons/plugin_home.unselected.light.svg";
import PluginHomeUnSelectedDark from "@floro/common-assets/assets/images/icons/plugin_home.unselected.dark.svg";
import { RemoteCommitState, useRemoteManifests } from "./hooks/remote-state";
import RemoteSideOption from "./RemoteSideOption";
import { Manifest } from "./hooks/polyfill-floro";
import { useRepoLinkBase } from "./hooks/remote-hooks";

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
  remoteCommitState: RemoteCommitState;
  page:
    | "history"
    | "home"
    | "settings"
    | "branch-rules"
    | "merge-requests"
    | "merge-request"
    | "merge-request-review";
}

const RepoSideNavigator = (props: Props): React.ReactElement => {
  const theme = useTheme();
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

  const pluginVersionList = useMemo(() => {
    const pluginList: Array<PluginVersion> = [];
    for (const { key: pluginName } of props?.remoteCommitState?.renderedState?.plugins ?? []) {
      const pv = props.repository.branchState?.commitState?.pluginVersions?.find(v => v?.name == pluginName);
      if (pv) {
        pluginList.push(pv);
      }
    }
    return pluginList;
  }, [props?.remoteCommitState?.renderedState, props?.repository?.branchState?.commitState?.pluginVersions]);

  const invalidityMap = useMemo(() => {
    const out: { [key: string]: boolean} = {};
    for (const plugin in props?.remoteCommitState?.invalidStates) {
      out[plugin] = (props?.remoteCommitState?.invalidStates?.[plugin] ?? []).length > 0;
    }
    return out;
  }, [props?.remoteCommitState?.invalidStates]);

  const linkBase = useRepoLinkBase(props.repository, props.page);
  const mainLink = useMemo(() => {
    if (props.repository?.branchState?.commitState?.sha) {
      return `${linkBase}?from=remote&sha=${
        props.repository?.branchState?.commitState?.sha
      }&branch=${props.repository?.branchState?.branchId}`;
    }
    return `${linkBase}?from=remote&branch=${
      props.repository?.branchState?.branchId
    }`;
  }, [linkBase, props.plugin, props.repository?.branchState?.branchId, props.repository?.branchState?.commitState?.sha]);

  return (
    <Navigator>
      <NavOptionList>
        <NavOption>
          <Link
            to={mainLink + "&plugin=home"}
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
        {pluginVersionList?.map((pluginVersion, index) => {

          const isSelected = props.plugin == pluginVersion?.name ?? '';
          const isInvalid = invalidityMap[pluginVersion?.name as string];
          if (!pluginVersion) {
            return <React.Fragment key={index}/>
          }
          return (
            <RemoteSideOption
              locationPath={mainLink}
              pluginVersion={pluginVersion}
              isSelected={isSelected}
              key={index}
              isInvalid={isInvalid}
            />
          )
        })}
      </NavOptionList>
    </Navigator>
  );
};

export default React.memo(RepoSideNavigator);