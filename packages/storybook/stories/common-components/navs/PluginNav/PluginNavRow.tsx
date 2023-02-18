import React, { useMemo } from "react";
import styled from "@emotion/styled";
import PluginDefaultLight from "@floro/common-assets/assets/images/icons/plugin_default.unselected.light.svg";
import PluginDefaultDark from "@floro/common-assets/assets/images/icons/plugin_default.unselected.dark.svg";
import PluginDefaultSelectedLight from "@floro/common-assets/assets/images/icons/plugin_default.selected.light.svg";
import PluginDefaultSelectedDark from "@floro/common-assets/assets/images/icons/plugin_default.selected.dark.svg";
import { Plugin } from "@floro/graphql-schemas/build/generated/main-graphql";
import { useTheme } from "@emotion/react";
import { Link } from "react-router-dom";

const Container = styled.div`
  height: 64px;
  width: 100%;
  display: flex;
  flex-direction: row;
  align-items: center;
  padding: 16px;
  box-sizing: border-box;
  cursor: pointer;
  background: ${props => props.theme.background};
`;

const Icon = styled.img`
  height: 42px;
  width: 42px;
  display: inline-block;
`;

const DisplayName = styled.h6`
  display: inline-block;
  margin-left: 8px;
  font-size: 1.4rem;
  font-family: "MavenPro";
  font-weight: 600;
  text-overflow: ellipsis;
  white-space: nowrap;
  overflow-x: hidden;
  width: 100%;
`;

interface Props {
  plugin: Plugin;
  isSelected: boolean;
  icons: { [key: string]: string };
  linkPrefix: string;
}

const PluginNavRow = (props: Props) => {
  const theme = useTheme();

  const href = useMemo(() => {
    if (props.plugin.isPrivate) {
        if (props.plugin.lastReleasedPrivateVersion) {
            return `${props.linkPrefix}/${props.plugin.name}/v/${props.plugin.lastReleasedPrivateVersion.version?.replaceAll(".", "-")}`
        }
        if (props?.plugin?.versions?.[0]) {
            return `${props.linkPrefix}/${props.plugin.name}/v/${props?.plugin?.versions?.[0].version?.replaceAll(".", "-")}`
        }
    }

    if (!props.plugin.isPrivate) {
        if (props.plugin.lastReleasedPublicVersion) {
            return `${props.linkPrefix}/${props.plugin.name}/v/${props.plugin.lastReleasedPublicVersion.version?.replaceAll(".", "-")}`
        }
        if (props?.plugin?.versions?.[0]) {
            return `${props.linkPrefix}/${props.plugin.name}/v/${props?.plugin?.versions?.[0].version?.replaceAll(".", "-")}`
        }
    }
    return `${props.linkPrefix}/${props.plugin.name}`;
  }, [props.linkPrefix, props.plugin]);

  const icon = useMemo(() => {
    if (props.isSelected) {
      if (theme.name == "light") {
        return (
          props?.icons?.[props?.plugin?.selectedLightIcon as string] ??
          props.plugin?.selectedLightIcon ??
          PluginDefaultSelectedLight
        );
      }
      return (
        props?.icons?.[props?.plugin?.selectedDarkIcon as string] ??
        props.plugin?.selectedDarkIcon ??
        PluginDefaultSelectedDark
      );
    }
    if (theme.name == "light") {
      return (
        props?.icons?.[props?.plugin?.lightIcon as string] ??
        props.plugin?.lightIcon ??
        PluginDefaultLight
      );
    }
    return (
      props?.icons?.[props?.plugin?.darkIcon as string] ??
      props.plugin?.darkIcon ??
      PluginDefaultDark
    );
  }, [
    theme.name,
    props.plugin.darkIcon,
    props.plugin.lightIcon,
    props.plugin.selectedDarkIcon,
    props.plugin.selectedLightIcon,
    props.icons,
    props.isSelected,
  ]);

  const color = useMemo(() => {
    if (props.isSelected) {
      return theme.colors.selectedPluginRow;
    }
    return theme.colors.unselectedPluginRow;
  }, [props.isSelected, theme]);

  return (
    <Link to={href}>
        <Container>
        <Icon src={icon} />
        <DisplayName style={{ color }}>{props.plugin.displayName}</DisplayName>
        </Container>
    </Link>
  );
};

export default React.memo(PluginNavRow);