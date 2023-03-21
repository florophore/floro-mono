import React, { useMemo, useCallback } from "react";
import styled from "@emotion/styled";
import { useTheme } from "@emotion/react";
import { ApiReponse } from "@floro/floro-lib/src/repo";
import {
  Repository,
  Plugin,
  PluginVersion,
} from "@floro/graphql-schemas/src/generated/main-client-graphql";
import PluginEditorRow from "./PluginEditorRow";
import PreviewPlugin from "./PreviewPlugin";

const PluginContainer = styled.div`
  padding: 16px;
`;

const DevelopmentPluginsContainer = styled.div`
  padding-left: 16px;
  padding-right: 16px;
  padding-top: 16px;
`;

const DevelopmentPluginsTitle = styled.h3`
  font-family: "MavenPro";
  font-weight: 600;
  font-size: 1.1rem;
  color: ${(props) => props.theme?.colors.contrastText};
`;

const DevelopmentPluginsList = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: flex-start;
  align-items: flex-start;
  padding-top: 24px;
  flex-wrap: wrap;
`;
const NoPluginsContainer = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100%;
  width: 100%;
  min-height: 184px;
`;

const NoPluginsText = styled.h3`
  font-family: "MavenPro";
  font-weight: 500;
  font-size: 1.7rem;
  color: ${(props) => props.theme.colors.blurbBorder};
`;

interface Props {
  repository: Repository;
  apiReponse: ApiReponse;
  plugins: Array<Plugin>;
  onChangePluginVersion?: (
    plugin?: Plugin,
    pluginVersion?: PluginVersion
  ) => void;
  developerPlugins: Array<Plugin>;
  suggestedPlugins: Array<Plugin>;
  isEditMode: boolean;
}

const PluginEditor = (props: Props) => {
  const theme = useTheme();
  const borderDivider = useMemo(() => {
    return `1px solid ${theme.colors.pluginBorderDivider}`;
  }, [theme]);

  const showTopDividerForDevelopmentPlugin = useMemo(() => {
    return (props.apiReponse.applicationState.plugins?.length ?? 0) > 0;
  }, [props.apiReponse.applicationState.plugins]);

  const suggestedPlugins = useMemo(() => {
    const seen = new Set(
      props.apiReponse?.applicationState?.plugins?.map?.((v) => v.key) ?? []
    );
    return props?.suggestedPlugins?.filter((sp) => !seen.has(sp?.name ?? ""));
  }, [props.apiReponse?.applicationState?.plugins, props?.suggestedPlugins]);

  const showTopDividerForSuggestedPlugin = useMemo(() => {
    return suggestedPlugins?.length > 0 && (
      props.apiReponse.applicationState.plugins?.length > 0 ||
      (props.developerPlugins?.length ?? 0) > 0
    );
  }, [props.apiReponse.applicationState.plugins, props.developerPlugins, suggestedPlugins]);

  return (
    <div>
      {(props.apiReponse?.applicationState?.plugins?.length ?? 0) > 0 && (
        <PluginContainer>
          {props.apiReponse.applicationState.plugins.map((pluginKV, index) => {
            return (
              <PluginEditorRow
                key={index}
                plugins={props.plugins}
                repository={props.repository}
                pluginName={pluginKV.key}
                pluginVersion={pluginKV.value}
                onChangePluginVersion={props.onChangePluginVersion}
                isEditMode={props.isEditMode}
              />
            );
          })}
        </PluginContainer>
      )}

      {(props.apiReponse?.applicationState?.plugins?.length ?? 0) == 0 &&
        // add suggested plugins length check here
        (props?.developerPlugins?.length ?? 0) == 0 && (
          <NoPluginsContainer>
            <NoPluginsText>{"No plugins installed"}</NoPluginsText>
          </NoPluginsContainer>
        )}
      {props.isEditMode && (
        <>
          {(props?.developerPlugins?.length ?? 0) > 0 && (
            <DevelopmentPluginsContainer
              style={{
                borderTop: showTopDividerForDevelopmentPlugin
                  ? borderDivider
                  : "none",
              }}
            >
              <DevelopmentPluginsTitle>
                {"development plugins"}
              </DevelopmentPluginsTitle>
              <DevelopmentPluginsList>
                {props.developerPlugins?.map((developerPlugin, index) => {
                  return (
                    <PreviewPlugin
                      developmentPlugin={developerPlugin}
                      onChangePluginVersion={props.onChangePluginVersion}
                      key={index}
                    />
                  );
                })}
              </DevelopmentPluginsList>
            </DevelopmentPluginsContainer>
          )}
          {(suggestedPlugins?.length ?? 0) > 0 && (
            <DevelopmentPluginsContainer
              style={{
                borderTop: showTopDividerForSuggestedPlugin
                  ? borderDivider
                  : "none",
              }}
            >
              <DevelopmentPluginsTitle>
                {"suggested plugins"}
              </DevelopmentPluginsTitle>
              <DevelopmentPluginsList>
                {suggestedPlugins?.map((developerPlugin, index) => {
                  return (
                    <PreviewPlugin
                      developmentPlugin={developerPlugin}
                      onChangePluginVersion={props.onChangePluginVersion}
                      key={index}
                    />
                  );
                })}
              </DevelopmentPluginsList>
            </DevelopmentPluginsContainer>
          )}
        </>
      )}
    </div>
  );
};

export default React.memo(PluginEditor);
