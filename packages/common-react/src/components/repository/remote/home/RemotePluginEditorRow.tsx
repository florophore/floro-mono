import React, { useMemo, useCallback, useRef } from "react";
import {
  Repository,
  Plugin,
  useGetPluginQuery,
  PluginVersion,
} from "@floro/graphql-schemas/src/generated/main-client-graphql";
import styled from "@emotion/styled";
import { useTheme } from "@emotion/react";
import EditIconLight from "@floro/common-assets/assets/images/icons/edit.light.svg";
import EditIconDark from "@floro/common-assets/assets/images/icons/edit.dark.svg";
import semver from "semver";
import { useCanUpdatePluginInRepo } from "../../local/hooks/local-hooks";

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
  color: ${(props) => props.theme.colors.connectionTextColor};
`;

const UpdateText = styled.span`
  margin-top: 4px;
  font-family: "MavenPro";
  font-weight: 600;
  font-size: 0.8rem;
  color: ${(props) => props.theme.colors.standardText};
`;

const UpdateAvailableText = styled.span`
  margin-top: 4px;
  font-family: "MavenPro";
  font-weight: 600;
  font-size: 0.8rem;
  color: ${(props) => props.theme.colors.updateAvailableTextColor};
`;

const VersionNumber = styled.span`
  font-family: "MavenPro";
  font-weight: 500;
  font-size: 1rem;
  color: ${(props) => props.theme.colors.connectionTextColor};
`;

const EditIconContainer = styled.div`
  display: flex;
  width: 40px;
  height: 56px;
  flex-direction: row;
  justify-content: flex-end;
  align-items: center;
  cursor: pointer;
`;

const EditIcon = styled.img`
  height: 24px;
  width: 24px;
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

  const pluginVersion = useMemo((): Plugin => {
    return props.pluginVersions.find((p) => p.name == props.pluginName) as Plugin;
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

  return (
    <Row>
      <LeftSide>
        <Icon src={icon} ref={iconRef} onError={onIconError} />
      </LeftSide>
      <CenterInfo>
        <DisplayName
          style={{
            color: props.isCompareMode
              ? props.wasAdded
                ? theme.colors.addedText
                : props.wasRemoved
                ? theme.colors.removedText
                : theme.colors.connectionTextColor
              : theme.colors.connectionTextColor
          }}
        >
          {pluginVersion?.displayName}
        </DisplayName>
      </CenterInfo>
      <RightSide>
        <VersionNumber
          style={{
            color: props.isCompareMode
              ? props.wasAdded
                ? theme.colors.addedText
                : props.wasRemoved
                ? theme.colors.removedText
                : theme.colors.connectionTextColor
              : theme.colors.connectionTextColor
          }}
        >
          {props.pluginVersion}
        </VersionNumber>
      </RightSide>
    </Row>
  );
};

export default React.memo(RemotePluginEditorRow);