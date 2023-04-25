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
  plugins: Array<Plugin>;
  pluginName: string;
  pluginVersion: string;
  onChangePluginVersion?: (
    plugin?: Plugin,
    pluginVersion?: PluginVersion
  ) => void;
  isEditMode: boolean;
  isCompareMode?: boolean;
  wasAdded?: boolean;
  wasRemoved?: boolean;
  isConflict?: boolean;
}

const PluginEditorRow = (props: Props) => {
  const theme = useTheme();

  const remotePluginRequest = useGetPluginQuery({
    variables: {
      pluginName: props.pluginName,
    },
  });

  const remotePlugin = useMemo(() => {
    if (
      remotePluginRequest?.data?.getPlugin?.__typename == "FetchPluginResult"
    ) {
      return remotePluginRequest?.data?.getPlugin?.plugin;
    }
    return null;
  }, [remotePluginRequest?.data]);

  const plugin = useMemo((): Plugin => {
    return props.plugins.find((p) => p.name == props.pluginName) as Plugin;
  }, [props.plugins, props.pluginName]);

  const pluginVersion = useMemo(() => {
    return plugin?.versions?.find?.((pv) => pv?.version == props.pluginVersion);
  }, [plugin, props.pluginVersion]);

  const potentialUpdateVersions =
    useMemo(() => {
      if (!remotePlugin) {
        return [];
      }
      if (pluginVersion?.version?.startsWith("dev")) {
        return [];
      }
      return (
        remotePlugin?.versions?.filter?.((v) => {
          if (v?.state != "released") {
            return false;
          }
          if (!v?.version || !pluginVersion?.version) {
            return false;
          }
          return semver.gt(v.version, pluginVersion?.version);
        }) ?? []
      );
    }, [remotePlugin, pluginVersion]) ?? [];

  const canUpdateRequest = useCanUpdatePluginInRepo(
    props.repository,
    pluginVersion?.name as string,
    pluginVersion?.version as string,
    potentialUpdateVersions.map((v) => v?.version as string)
  );

  const icon = useMemo(() => {
    if (theme.name == "light") {
      return pluginVersion?.selectedLightIcon as string;
    }

    return pluginVersion?.selectedDarkIcon as string;
  }, [pluginVersion, theme.name]);

  const editIcon = useMemo(() => {
    if (theme.name == "light") {
      return EditIconLight;
    }
    return EditIconDark;
  }, [theme.name]);

  const onClickEditIcon = useCallback(() => {
    if (!props.isEditMode) {
      return;
    }
    props?.onChangePluginVersion?.(plugin, pluginVersion as PluginVersion);
  }, [props.onChangePluginVersion, plugin, pluginVersion, props.isEditMode]);

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
                : props.isConflict
                  ? theme.colors.conflictText
                  : theme.colors.connectionTextColor
              : props.isConflict
                ? theme.colors.conflictText
                : theme.colors.connectionTextColor
          }}
        >
          {pluginVersion?.displayName}
        </DisplayName>
        {!canUpdateRequest.error && !props.isCompareMode && (
          <>
            {!canUpdateRequest?.data?.canUpdate && (
              <UpdateText>
                {"(up to date)"}
              </UpdateText>
            )}
            {potentialUpdateVersions.length > 0 &&
              canUpdateRequest?.data?.canUpdate && (
                <UpdateAvailableText>
                  {"(update available)"}
                </UpdateAvailableText>
              )}
          </>
        )}
      </CenterInfo>
      <RightSide>
        <VersionNumber
          style={{
            color: props.isCompareMode
              ? props.wasAdded
                ? theme.colors.addedText
                : props.wasRemoved
                ? theme.colors.removedText
                : props.isConflict
                  ? theme.colors.conflictText
                  : theme.colors.connectionTextColor
              : props.isConflict
                ? theme.colors.conflictText
                : theme.colors.connectionTextColor
          }}
        >
          {pluginVersion?.version}
        </VersionNumber>
        <EditIconContainer onClick={onClickEditIcon}>
          {props.isEditMode && <EditIcon src={editIcon} />}
        </EditIconContainer>
      </RightSide>
    </Row>
  );
};

export default React.memo(PluginEditorRow);
