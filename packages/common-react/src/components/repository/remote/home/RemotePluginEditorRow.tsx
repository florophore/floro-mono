import React, { useMemo, useCallback, useRef } from "react";
import {
  Repository,
  PluginVersion,
} from "@floro/graphql-schemas/src/generated/main-client-graphql";
import styled from "@emotion/styled";
import { useTheme } from "@emotion/react";
import { Link } from "react-router-dom";

import WarningLight from "@floro/common-assets/assets/images/icons/warning.light.svg";
import WarningDark from "@floro/common-assets/assets/images/icons/warning.dark.svg";

const Row = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
  height: 72px;
`;

const LeftSide = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;
`;

const CenterInfo = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: flex-start;
  flex: 5;
  height: 56px;
`;

const RightSide = styled.div`
  flex: 2.5;
  display: flex;
  flex-direction: row;
  justify-content: flex-end;
  align-items: center;
  height: 56px;
`;

const Icon = styled.img`
  height: 56px;
  width: 56px;
  margin-right: 48px;
`;

const DisplayName = styled.span`
  font-family: "MavenPro";
  font-weight: 600;
  font-size: 1.2rem;
  text-decoration: underline;
  color: ${(props) => props.theme.colors.connectionTextColor};
  &:hover {
    color: ${(props) => props.theme.colors.linkColor} !important;
  }
`;

const VersionNumber = styled.span`
  font-family: "MavenPro";
  font-weight: 500;
  font-size: 1rem;
  color: ${(props) => props.theme.colors.connectionTextColor};
  &:hover {
    color: ${(props) => props.theme.colors.linkColor} !important;
  }
`;

interface Props {
  repository: Repository;
  pluginVersions: Array<PluginVersion>;
  pluginName: string;
  pluginVersion: string;
  isCompareMode?: boolean;
  wasAdded?: boolean;
  wasRemoved?: boolean;
}

const RemotePluginEditorRow = (props: Props) => {
  const theme = useTheme();

  const pluginVersion = useMemo((): PluginVersion => {
    return props.pluginVersions.find(
      (p) => p.name == props.pluginName
    ) as PluginVersion;
  }, [props.pluginVersions, props.pluginName]);

  const icon = useMemo(() => {
    if (theme.name == "light") {
      return pluginVersion?.selectedLightIcon as string;
    }
    return pluginVersion?.selectedDarkIcon as string;
  }, [pluginVersion, theme.name]);

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

  const link = useMemo(() => {
    if (pluginVersion.ownerType == "user_plugin") {
      return `/user/@/${pluginVersion.user?.username}/plugins/${pluginVersion.name}/v/${pluginVersion.version}`;
    }
    return `/org/@/${pluginVersion.organization?.handle}/plugins/${pluginVersion.name}/v/${pluginVersion.version}`;
  }, [pluginVersion]);

  return (
    <Row>
      <LeftSide>
        <Icon src={icon} ref={iconRef} onError={onIconError} />
      </LeftSide>
      <CenterInfo>
        <Link to={link}>
          <DisplayName
            style={{
              color: props.isCompareMode
                ? props.wasAdded
                  ? theme.colors.addedText
                  : props.wasRemoved
                  ? theme.colors.removedText
                  : theme.colors.connectionTextColor
                : theme.colors.connectionTextColor,
            }}
          >
            {pluginVersion?.displayName}
          </DisplayName>
        </Link>
      </CenterInfo>
      <RightSide>
        <Link to={link}>
          <VersionNumber
            style={{
              color: props.isCompareMode
                ? props.wasAdded
                  ? theme.colors.addedText
                  : props.wasRemoved
                  ? theme.colors.removedText
                  : theme.colors.connectionTextColor
                : theme.colors.connectionTextColor,
            }}
          >
            {props.pluginVersion}
          </VersionNumber>
        </Link>
      </RightSide>
    </Row>
  );
};

export default React.memo(RemotePluginEditorRow);
