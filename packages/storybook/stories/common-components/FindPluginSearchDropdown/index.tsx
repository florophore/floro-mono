import React, { useMemo } from "react";
import styled from "@emotion/styled";
import SearchDropdown from "../../design-system/SearchDropdown";
import { Plugin } from "@floro/graphql-schemas/build/generated/main-graphql";
import DotsLoader from "../../design-system/DotsLoader";
import { useTheme } from "@emotion/react";
import PluginResultRow from "./PluginResultRow";

const NoResultsContainer = styled.div`
  flex: 1;
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100%;
`;

const NoResultsText = styled.p`
  font-size: 1.2rem;
  font-family: "MavenPro";
  font-weight: 500;
  margin-top: 12px;
  margin-bottom: 12px;
  color: ${(props) => props.theme.colors.standardText};
`;

const LoadingContainer = styled.div`
  flex: 1;
  max-height: 60px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  height: 100%;
  min-height: 46.5px;
`;

export interface Props {
  plugins: Plugin[];
  isLoading: boolean;
  onHoverPlugin?: (plugin: Plugin) => void;
  onClickPlugin?: (plugin: Plugin) => void;
  selectedPlugin?: Plugin;
}

const FindPluginSearchDropdown = (props: Props) => {
  const theme = useTheme();
  const loaderColor = useMemo(() => {
    if (theme.name == "light") {
      return "purple";
    }
    return "lightPurple";
  }, [theme.name]);
  return (
    <SearchDropdown>
      <>
        {!props.isLoading && (props?.plugins?.length ?? 0) == 0 && (
          <NoResultsContainer>
            <NoResultsText>{"no plugins found..."}</NoResultsText>
          </NoResultsContainer>
        )}
        {props.plugins.map((plugin: Plugin, index: number) => {
            return (
              <PluginResultRow
                key={index}
                plugin={plugin}
                isSelected={props?.selectedPlugin?.id == plugin?.id}
                onHoverPlugin={props.onHoverPlugin}
                onClickPlugin={props.onClickPlugin}
              />
            );
        })}
        {props.isLoading && (
          <LoadingContainer>
            <DotsLoader color={loaderColor} size={"small"} />
          </LoadingContainer>
        )}
      </>
    </SearchDropdown>
  );
};

export default React.memo(FindPluginSearchDropdown);
