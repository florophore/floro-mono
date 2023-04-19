import React, { useMemo, useCallback, useEffect } from "react";
import { PluginVersion } from "@floro/graphql-schemas/build/generated/main-graphql";
import styled from "@emotion/styled";
import { useTheme } from "@emotion/react";
import { Link } from "react-router-dom";
import TimeAgo from "javascript-time-ago";
import Button from "@floro/storybook/stories/design-system/Button";
import CheckMarkLight from "@floro/common-assets/assets/images/icons/teal_check_mark_circle.light.svg";
import RedXLight from "@floro/common-assets/assets/images/icons/red_x_circle.light.svg";
import RedXDark from "@floro/common-assets/assets/images/icons/red_x_circle.dark.svg";
import { Repository } from "@floro/graphql-schemas/src/generated/main-client-graphql";
import { usePluginCompatabilityCheck } from "../../local/hooks/local-hooks";
import DotsLoader from "@floro/storybook/stories/design-system/DotsLoader";
import { ApiResponse } from "@floro/floro-lib/src/repo";

const RowContainer = styled.div`
  width: 100%;
  margin: 0;
  padding: 0;
  height: 42px;
  border-width: 2px;
  border-style: solid;
  border-radius: 8px;
  box-sizing: border-box;
  padding: 0 8px;
  display: flex;
  flex-direction: row;
  align-items: center;
  cursor: pointer;
`;

const VersionTitle = styled.span`
  font-family: "MavenPro";
  font-weight: 500;
  font-size: 1.4rem;
  color: ${(props) => props.theme.colors.blurbText};
`;

const ElapseTitle = styled.span`
  font-family: "MavenPro";
  font-weight: 400;
  font-size: 1.2rem;
  color: ${(props) => props.theme.colors.blurbText};
`;

const CompatabilityRow = styled.span`
  display: flex;
  flex-direction: row;
  align-items: center;
  width: 100%;
`;

const Icon = styled.img`
  width: 20px;
  height: 20px;
  margin-right: 12px;
`;

const CompatabilityTextRow = styled.span`
  display: flex;
  flex-direction: row;
  align-items: center;
  flex-grow: 1;
`;

const CompatabilityText = styled.span`
  font-family: "MavenPro";
  font-weight: 500;
  font-size: 1.2rem;
  color: ${(props) => props.theme.colors.blurbText};
`;

const ReleasedText = styled.span`
  font-family: "MavenPro";
  font-weight: 500;
  font-size: 1rem;
  color: ${(props) => props.theme.colors.releasedText};
`;

const UnReleasedText = styled.span`
  font-family: "MavenPro";
  font-weight: 500;
  font-size: 1rem;
  color: ${(props) => props.theme.colors.unreleasedText};
`;

export interface Props {
  version: PluginVersion;
  isEven: boolean;
  isSelected: boolean;
  isFirst: boolean;
  canRelease: boolean;
  linkPrefix: string;
  onClickReleaseVersion: (version: PluginVersion) => void;
  repository: Repository;
  apiResponse: ApiResponse;
}

const PluginVersionNavigatorRow = (props: Props) => {
  const compatabilityCheck = usePluginCompatabilityCheck(
    props.repository,
    props.version.name ?? "",
    props.version.version ?? ""
  );

  useEffect(() => {
    compatabilityCheck.refetch();
  }, [props.apiResponse.applicationState.plugins])

  const theme = useTheme();
  const loaderColor = useMemo(() => {
    if (theme.name == "light") {
      return "purple";
    }
    return "lightPurple";
  }, [theme.name]);
  const timeAgo = useMemo(() => new TimeAgo("en-US"), []);
  const backgroundColor = useMemo(() => {
    if (props.isEven) {
      return theme.colors.evenBackground;
    }
    return theme.colors.oddBackground;
  }, [theme, props.isEven]);

  const borderColor = useMemo(() => {
    if (props.isSelected) {
      return theme.colors.highlightedRowBorder;
    }
    return backgroundColor;
  }, [backgroundColor, theme, props.isSelected]);

  const elapsedTime = useMemo(
    () => {
      if (props.version.createdAt) {
        return timeAgo.format(new Date(props.version.createdAt as string));
      }
      return "";
    },
    [timeAgo, props.version.createdAt]
  );

  const isInstalledVersion = useMemo(() => {
    for (const plugin of props.apiResponse.applicationState.plugins) {
      if (
        plugin.key == props.version.name &&
        plugin.value == props.version.version
      ) {
        return true;
      }
    }
    return false;
  }, [props.apiResponse.applicationState.plugins, props.version]);

  const onClickRelease = useCallback(
    () => props.onClickReleaseVersion?.(props.version),
    [props.onClickReleaseVersion, props.version]
  );

  const XMark = useMemo(() => {
    if (theme.name == "light") {
      return RedXLight;
    }
    return RedXDark;
  }, [theme.name]);

  const compatabilityInfo = useMemo(() => {
    if (compatabilityCheck.isLoading) {
      return (
        <CompatabilityRow>
          <DotsLoader color={loaderColor} size={"small"}/>
        </CompatabilityRow>
      )
    }

    if (!compatabilityCheck.data?.isCompatible) {
      return (
        <CompatabilityRow>
          <Icon src={XMark} />
          <CompatabilityTextRow>
            <CompatabilityText>
              {"incompatible"}
            </CompatabilityText>
          </CompatabilityTextRow>
        </CompatabilityRow>

      );
    }

    return (
      <CompatabilityRow>
        <Icon src={CheckMarkLight} />
        <CompatabilityTextRow>
          <CompatabilityText>
            {"compatible"}
          </CompatabilityText>
        </CompatabilityTextRow>
      </CompatabilityRow>
    );
  }, [props.version, XMark, loaderColor, compatabilityCheck.isLoading, compatabilityCheck.data?.isCompatible, isInstalledVersion]);

  const releaseInfo = useMemo(() => {
    if (props.version.state == "unreleased") {
      return <UnReleasedText>{"unreleased"}</UnReleasedText>;
     }

    return <UnReleasedText>{""}</UnReleasedText>;
  }, [props.isFirst, props.version, props.isSelected]);

  const installInfo = useMemo(() => {
    if (isInstalledVersion) {
      return <ReleasedText>{"installed"}</ReleasedText>;
    }

    return <ReleasedText>{""}</ReleasedText>;
  }, [isInstalledVersion]);

  return (
    <RowContainer onClick={onClickRelease} style={{ backgroundColor, borderColor }}>
      <div style={{ flex: 1.8 }}>
        <VersionTitle>{props.version.version}</VersionTitle>
      </div>
      <div style={{ flex: 2.5, paddingLeft: 12, boxSizing: "border-box" }}>
        <ElapseTitle>{elapsedTime}</ElapseTitle>
      </div>
      <div style={{
          minWidth: 160,
          display: "flex",
          flexDirection: "row",
          justifyContent: "flex-start",
         }}>{compatabilityInfo}</div>
      <div
        style={{
          flex: 1,
          display: "flex",
          flexDirection: "row",
          justifyContent: "flex-end",
        }}
      >
        {releaseInfo}
      </div>
      <div
        style={{
          flex: 1.2,
          display: "flex",
          flexDirection: "row",
          justifyContent: "flex-end",
        }}
      >
        {installInfo}
      </div>
    </RowContainer>
  );
};

export default React.memo(PluginVersionNavigatorRow);