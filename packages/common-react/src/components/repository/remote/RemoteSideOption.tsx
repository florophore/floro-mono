import React, { useMemo, useRef, useCallback } from "react";
import { Link } from "react-router-dom";
import {
  Plugin,
} from "@floro/graphql-schemas/build/generated/main-graphql";
import styled from "@emotion/styled";
import { useTheme } from "@emotion/react";
import ColorPalette from "@floro/styles/ColorPalette";
import WarningLight from "@floro/common-assets/assets/images/icons/warning.light.svg";
import WarningDark from "@floro/common-assets/assets/images/icons/warning.dark.svg";

import { ApiResponse } from "floro/dist/src/repo";
import { PluginVersion } from "@floro/graphql-schemas/src/generated/main-client-graphql";
//import { useLocalVCSNavContext } from "./vcsnav/LocalVCSContext";

const NavOption = styled.div`
  height: 72px;
  width: 72px;
  position: relative;
  padding-top: 2px;
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
  background: ${(props) => props.theme.background};
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

interface Props {
  isSelected: boolean;
  isInvalid: boolean;
  locationPath: string;
  pluginVersion: PluginVersion;
}

const RemoteSideOption = (props: Props): React.ReactElement => {
  const theme = useTheme();
  const icon = useMemo(
    () =>
      props.isSelected
        ? theme.name == "light"
          ? (props.pluginVersion.selectedLightIcon as string)
          : (props.pluginVersion.selectedDarkIcon as string)
        : theme.name == "light"
        ? (props.pluginVersion.lightIcon as string)
        : (props.pluginVersion.darkIcon as string),
    [props.pluginVersion, theme.name, props.isSelected]
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
        to={props.locationPath + `&plugin=${props.pluginVersion.name}`}
        style={{ textDecoration: "none", display: "contents" }}
      >
        <NavIconWrapper>
          <NavIcon src={icon} ref={iconRef} onError={onIconError} />
          <NavText
            style={{
              color: props.isSelected
                ? theme.colors.pluginSelected
                : theme.colors.pluginUnSelected,
            }}
          >
            {props.pluginVersion.displayName}
          </NavText>
        </NavIconWrapper>
        {props.isInvalid && <XCircleImage src={xCircle} />}
        {false && (
          <ChangeDot
            style={{
              background: theme.colors.addedBackground,
            }}
          />
        )}
        {false && (
          <ChangeDot
            style={{
              background: theme.colors.removedBackground,
            }}
          />
        )}
        {false && <ConflictDot/>}
      </Link>
    </NavOption>
  );
};

export default React.memo(RemoteSideOption);