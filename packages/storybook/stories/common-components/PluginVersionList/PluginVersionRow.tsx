import React, { useMemo, useCallback } from "react";
import { PluginVersion } from "@floro/graphql-schemas/build/generated/main-graphql";
import styled from "@emotion/styled";
import { useTheme } from "@emotion/react";
import { Link } from "react-router-dom";
import TimeAgo from "javascript-time-ago";
import Button from "../../design-system/Button";
import CheckMarkLight from "@floro/common-assets/assets/images/icons/teal_check_mark_circle.light.svg";
import RedXLight from "@floro/common-assets/assets/images/icons/red_x_circle.light.svg";
import RedXDark from "@floro/common-assets/assets/images/icons/red_x_circle.dark.svg";

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
  linkPrefix: string;
  onClickReleaseVersion: (version: PluginVersion) => void;
}

const PluginVersionRow = (props: Props) => {
  const theme = useTheme();
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
    () => timeAgo.format(new Date(props.version.createdAt as string)),
    [timeAgo, props.version.createdAt]
  );

  const onClickRelease = useCallback(
    (event: React.MouseEvent<HTMLButtonElement>) => {
      event.preventDefault();
      event.stopPropagation();
      props.onClickReleaseVersion?.(props.version);
    },
    [props.onClickReleaseVersion, props.version]
  );

  const XMark = useMemo(() => {
    if (theme.name == "light") {
      return RedXLight;
    }
    return RedXDark;
  }, [theme.name]);

  const compatabilityInfo = useMemo(() => {
    if (!props.version.previousReleaseVersion) {
      return null;
    }
    if (!props.version.isBackwardsCompatible) {
      return (
        <CompatabilityRow>
          <Icon src={XMark} />
          <CompatabilityTextRow>
            <CompatabilityText>
              {props.version.previousReleaseVersion}
            </CompatabilityText>
            <CompatabilityText style={{ marginLeft: 12 }}>
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
            {props?.version?.previousReleaseVersion}
          </CompatabilityText>
          <CompatabilityText style={{ marginLeft: 12 }}>
            {"compatible"}
          </CompatabilityText>
        </CompatabilityTextRow>
      </CompatabilityRow>
    );
  }, [props.version, XMark]);

  const releaseInfo = useMemo(() => {
    if (props.isFirst && props.version.state == "unreleased") {
      return (
        <Button
          label={"release"}
          bg={"orange"}
          size={"extra-small"}
          isDisabled={!props.isSelected}
          onClick={onClickRelease}
        />
      );
    }
    if (props.version.state == "released") {
      return <ReleasedText>{"released"}</ReleasedText>;
    }
    return <UnReleasedText>{"unreleased"}</UnReleasedText>;
  }, [props.isFirst, props.version, props.isSelected]);

  return (
    <Link
      to={`${props.linkPrefix}/${
        props.version.name
      }/v/${props.version.version?.replaceAll(".", "-")}`}
    >
      <RowContainer style={{ backgroundColor, borderColor }}>
        <div style={{ flex: 1 }}>
          <VersionTitle>{props.version.version}</VersionTitle>
        </div>
        <div style={{ flex: 1.8, paddingLeft: 12, boxSizing: "border-box" }}>
          <ElapseTitle>{elapsedTime}</ElapseTitle>
        </div>
        <div style={{ flex: 2.5 }}>{compatabilityInfo}</div>
        <div
          style={{
            flex: 1.2,
            display: "flex",
            flexDirection: "row",
            justifyContent: "flex-end",
          }}
        >
          {releaseInfo}
        </div>
      </RowContainer>
    </Link>
  );
};

export default React.memo(PluginVersionRow);
