
import React, { useMemo, useRef, useCallback } from "react";
import { Repository } from "@floro/graphql-schemas/src/generated/main-client-graphql";
import { Link, useLocation, useSearchParams } from "react-router-dom";
import {
  Plugin,
  PluginVersion,
} from "@floro/graphql-schemas/build/generated/main-graphql";
import styled from "@emotion/styled";
import { useTheme } from "@emotion/react";
import ColorPalette from "@floro/styles/ColorPalette";
import WarningLight from "@floro/common-assets/assets/images/icons/warning.light.svg";
import WarningDark from "@floro/common-assets/assets/images/icons/warning.dark.svg";

import XCircleLight from "@floro/common-assets/assets/images/icons/red_x_circle.light.svg";
import XCircleDark from "@floro/common-assets/assets/images/icons/red_x_circle.dark.svg";
import { useQueryClient } from "react-query";
import { useCurrentRepoState, useRepoDevPlugins, useRepoManifestList } from "./hooks/local-hooks";
import { Manifest } from "@floro/floro-lib/src/plugins";
import { transformLocalManifestToPartialPlugin } from "./hooks/manifest-transforms";

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

const XCircleImage = styled.img`
  position: absolute;
  right: 6px;
  top: 0px;
  height: 20px;
  width: 20px;
  border: 2px solid ${ColorPalette.white};
  border-radius: 50%;
  background: ${props => props.theme.background};
`;

interface Props {
    isSelected: boolean;
    isInvalid: boolean;
    locationPath: string;
    plugin: Plugin;
}

const LocalSideOption = (props: Props): React.ReactElement => {

    const theme = useTheme();
    const icon = useMemo(
      () =>
        props.isSelected
          ? theme.name == "light"
            ? (props.plugin.selectedLightIcon as string)
            : (props.plugin.selectedDarkIcon as string)
          : theme.name == "light"
          ? (props.plugin.lightIcon as string)
          : (props.plugin.darkIcon as string),
      [props.plugin, theme.name]
    );

    const xCircle = useMemo(() => {
      if (theme.name == "light") {
        return WarningLight;
      }
      return WarningDark;
    }, [theme.name]);

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
            <NavOption>
              <Link
                to={props.locationPath + `?plugin=${props.plugin.name}&from=local`}
                style={{ textDecoration: "none", display: "contents" }}
              >
                <NavIconWrapper>
                  <NavIcon src={icon} ref={iconRef} onError={onIconError}/>
                  <NavText
                    style={{
                      color:
                        props.isSelected
                        ? theme.colors.pluginSelected
                        : theme.colors.pluginUnSelected,
                    }}
                  >
                    {props.plugin.displayName}
                  </NavText>
                </NavIconWrapper>
                {props.isInvalid &&
                  <XCircleImage src={xCircle}/>
                }
              </Link>
            </NavOption>
    );
}

export default React.memo(LocalSideOption);