import React, { useMemo, useCallback } from "react";
import {
  Plugin
} from "@floro/graphql-schemas/src/generated/main-client-graphql";
import styled from "@emotion/styled";
import { useTheme } from "@emotion/react";
import { useSearchParams } from "react-router-dom";
import ColorPalette from "@floro/styles/ColorPalette";
import { useOfflineIcon } from "../../offline/OfflineIconsContext";

const Row = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
  height: 72px;
  width: 100%;
  border-radius: 8px;
  padding: 0 8px;
  cursor: pointer;
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
  margin-right: 24px;
`;

const DisplayName = styled.span`
  font-family: "MavenPro";
  font-weight: 600;
  font-size: 1.4rem;
  color: ${props => props.theme.colors.contrastText};
`;

interface Props {
  plugin: Plugin;
  isSelected?: boolean;
}

const PluginSearchResultRow = (props: Props) => {
  const theme = useTheme();

  const lightIcon = useOfflineIcon(props.plugin?.selectedLightIcon ?? undefined);
  const darkIcon = useOfflineIcon(props.plugin?.selectedDarkIcon ?? undefined);
  const icon = useMemo(() => {
    if (theme.name == "light") {
      return lightIcon as string;
    }

    return darkIcon as string;
  }, [props.plugin, theme.name, lightIcon, darkIcon]);

  return (
    <Row style={{
        background: props.isSelected ? theme.colors.highlightedOptionBackgroundColor : theme.background
    }}>
      <LeftSide>
        <Icon src={icon} />
      </LeftSide>
      <CenterInfo>
        <DisplayName
          style={{
            color: props.isSelected
              ? theme.colors.linkColor
              : theme.colors.contrastText,
          }}
        >
          {props.plugin?.displayName}
        </DisplayName>
      </CenterInfo>
      <RightSide></RightSide>
    </Row>
  );
};

export default React.memo(PluginSearchResultRow);