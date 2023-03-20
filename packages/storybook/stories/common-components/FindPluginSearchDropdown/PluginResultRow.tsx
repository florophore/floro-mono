import React, { useMemo, useCallback } from "react";
import styled from "@emotion/styled";
import SearchDropdown from "../../design-system/SearchDropdown";
import { Plugin } from "@floro/graphql-schemas/build/generated/main-graphql";
import DotsLoader from "../../design-system/DotsLoader";
import { useTheme } from "@emotion/react";
import PluginDefaultSelectedLight from '@floro/common-assets/assets/images/icons/plugin_default.selected.light.svg';
import PluginDefaultSelectedDark from '@floro/common-assets/assets/images/icons/plugin_default.selected.dark.svg';

const RowContainer = styled.div`
  flex: 1;
  display: flex;
  justify-content: space-between;
  align-items: center;
  height: 72px;
  width: 100%;
  border-radius: 10px;
  box-sizing: border-box;
  padding: 8px;
  cursor: pointer;
`;


const RowImage = styled.img`
    height: 56px;
    width: 56px;
`;

const RightSideInfo = styled.div`
    display: flex;
    height: 56px;
    flex-direction: column;
    align-items: flex-start;
    justify-content: center;
    flex-stretch: 1;
    flex-grow: 1;
    margin-left: 16px;
`;

const DisplayTitle = styled.h6`
  margin: 0;
  padding: 0;
  font-size: 1rem;
  font-family: "MavenPro";
  font-weight: 600;
  color: ${props => props.theme.colors.pluginDisplayTitle};
`;


const SubRow = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
  width: 100%;
`;

const SubText = styled.p`
  margin: 0;
  padding: 0;
  font-size: 0.85rem;
  font-family: "MavenPro";
  font-weight: 500;
  color: ${props => props.theme.colors.contrastText};
`;

export interface Props {
  plugin: Plugin;
  onHoverPlugin?: (plugin: Plugin) => void;
  onClickPlugin?: (plugin: Plugin) => void;
  isSelected?: boolean;
}

const PluginResultRow = (props: Props) => {
  const theme = useTheme();

  const backgroundColor = useMemo(() => {
    if (!props.isSelected) {
        return theme.background;
    }
    return theme.colors.searchHighlightedBackground;
  }, [props.isSelected, theme]);

  const icon = useMemo(() => {
    if (theme.name == "light") {
        return props.plugin.selectedLightIcon ?? PluginDefaultSelectedLight;
    }
    return props.plugin.selectedDarkIcon ?? PluginDefaultSelectedDark;
  }, [theme.name, props.plugin]);

  const usernameDisplay = useMemo(() => {
    if (props.plugin.ownerType == "user_plugin") {
        return "@" + props.plugin.user?.username;
    }
    return "@" + props.plugin.organization?.handle;

  }, [props.plugin]);

  const onClick = useCallback(() => {
    props.onClickPlugin?.(props.plugin);
  }, [props.onClickPlugin, props.plugin])

  const onMouseEnter = useCallback(() => {
    props.onHoverPlugin?.(props.plugin);
  }, [props.onHoverPlugin, props.plugin])

  return (
    <RowContainer style={{backgroundColor}} onClick={onClick} onMouseEnter={onMouseEnter}>
        <RowImage src={icon}/>
        <RightSideInfo>
            <DisplayTitle>{props.plugin.displayName}</DisplayTitle>
            <SubRow>
                <SubText>{props.plugin.name}</SubText>
                <SubText>{usernameDisplay}</SubText>
            </SubRow>
        </RightSideInfo>
    </RowContainer>
  );
};

export default React.memo(PluginResultRow);