import React, { useMemo, useCallback } from "react";
import styled from "@emotion/styled";
import { useTheme } from "@emotion/react";
import { ApiResponse } from "floro/dist/src/repo";
import {
  Plugin,
  PluginVersion,
} from "@floro/graphql-schemas/src/generated/main-client-graphql";
import PreviewPlugin from "./../plugin_editor/PreviewPlugin";
import PreviewPluginRow from "./../plugin_editor/PreviewPluginRow";

const SuggestedPluginsContainer = styled.div`
  padding: 16px;
`;

const SuggestedPluginsTitle = styled.h3`
  font-family: "MavenPro";
  font-weight: 600;
  font-size: 1.4rem;
  color: ${(props) => props.theme?.colors.suggestedPluginBannerColor};
  margin-top: 16px;
`;

const SuggestedPluginsList = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: flex-start;
  align-items: flex-start;
  flex-wrap: wrap;
  border: 1px solid ${(props) => props.theme.colors.blurbBorder};
  padding: 24px 0px 0px 0px;
  border-radius: 8px;
  max-width: 624px;
  margin-top: 24px;
`;

const DevelopmentPluginsList = styled.div`
  border: 1px solid ${(props) => props.theme.colors.blurbBorder};
  padding: 16px;
  border-radius: 8px;
  max-width: 624px;
  margin-top: 24px;
`;

interface Props {
  apiReponse: ApiResponse;
  onChangePluginVersion?: (
    plugin?: Plugin,
    pluginVersion?: PluginVersion
  ) => void;
  developerPlugins: Array<Plugin>;
  suggestedPlugins: Array<Plugin>;
}

const PluginSearchSplashScreen = (props: Props) => {
  return (
    <div>
      {props.suggestedPlugins.length > 0 &&
        <SuggestedPluginsContainer>
            <SuggestedPluginsTitle>{"Suggested Plugins"}</SuggestedPluginsTitle>
            <SuggestedPluginsList>
            {props.suggestedPlugins?.map((suggestedPlugin, index) => {
                return (
                <PreviewPlugin
                    developmentPlugin={suggestedPlugin}
                    onChangePluginVersion={props.onChangePluginVersion}
                    key={index}
                />
                );
            })}
            </SuggestedPluginsList>
        </SuggestedPluginsContainer>
      }
      {props.developerPlugins?.length > 0 && (
        <SuggestedPluginsContainer>
          <SuggestedPluginsTitle>{"Development Plugins"}</SuggestedPluginsTitle>
          <DevelopmentPluginsList>
            {props.developerPlugins?.map((suggestedPlugin, index) => {
              return (
                <PreviewPluginRow
                  plugin={suggestedPlugin}
                  onChangePluginVersion={props.onChangePluginVersion}
                  key={index}
                  isEven={index % 2 == 0}
                />
              );
            })}
          </DevelopmentPluginsList>
        </SuggestedPluginsContainer>
      )}
    </div>
  );
};

export default React.memo(PluginSearchSplashScreen);
