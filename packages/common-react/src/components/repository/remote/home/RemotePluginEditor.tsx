import React, { useMemo } from "react";
import styled from "@emotion/styled";
import { useTheme } from "@emotion/react";
import { ApiResponse } from "floro/dist/src/repo";
import {
  Repository,
  Plugin,
  PluginVersion,
} from "@floro/graphql-schemas/src/generated/main-client-graphql";
import PluginEditorRow from "../../home/plugin_editor/PluginEditorRow";
import PreviewPlugin from "../../home/plugin_editor/PreviewPlugin";
import { useLocalVCSNavContext } from "../../local/vcsnav/LocalVCSContext";
import { ComparisonState, RemoteCommitState, useBeforeCommitState, useMainCommitState, useRemoteCompareFrom, useViewMode } from "../hooks/remote-state";
import RemotePluginEditorRow from "./RemotePluginEditorRow";
import { RepoPage } from "../../types";

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
  remoteCommitState: RemoteCommitState;
  comparisonState: ComparisonState;
  page: RepoPage;
}

const RemotePluginEditor = (props: Props) => {
  const theme = useTheme();

  const { compareFrom } = useRemoteCompareFrom();
  const beforeCommitState = useBeforeCommitState(props.repository, props.page);
  const viewMode = useViewMode(props.page);

  const plugins = useMemo(() => {
    if (
      viewMode == "compare" &&
      compareFrom == "before"
    ) {
      return props.comparisonState?.beforeRemoteCommitState.renderedState?.plugins ?? [];
    }
    return props.remoteCommitState.renderedState.plugins ?? [];
  }, [
    viewMode,
    compareFrom,
    props.remoteCommitState.renderedState.plugins,
    props.comparisonState?.beforeRemoteCommitState.renderedState.plugins,
  ]);

  const pluginChanges = useMemo(() => {
    if (viewMode == "compare") {
      if (compareFrom == "before") {
        return new Set(props?.comparisonState?.apiDiff?.plugins?.removed);
      }
      return new Set(props?.comparisonState?.apiDiff?.plugins?.added);
    }

    return new Set<number>();
  }, [
    props?.comparisonState?.apiDiff?.plugins?.added,
    props?.comparisonState?.apiDiff?.plugins?.removed,
    viewMode,
    compareFrom,
  ]);

  const commitState = useMainCommitState(props.page, props.repository);

  const pluginVersions = useMemo(() => {
    if (
      viewMode == "compare" &&
      compareFrom == "before"
    ) {
      return (beforeCommitState?.pluginVersions ?? []) as PluginVersion[];
    }
    return (commitState?.pluginVersions ?? []) as PluginVersion[];
  }, [
    viewMode,
    compareFrom,
    commitState?.pluginVersions,
    beforeCommitState?.pluginVersions,

  ])
  return (
    <div>
      {(plugins?.length ?? 0) > 0 && (
        <PluginContainer>
          {plugins.map((pluginKV, index) => {
            return (
              <RemotePluginEditorRow
                key={index}
                repository={props.repository}
                pluginVersions={pluginVersions}
                pluginName={pluginKV.key}
                pluginVersion={pluginKV.value}
                isCompareMode={viewMode == "compare"}
                wasAdded={compareFrom == "after" && pluginChanges.has(index)}
                wasRemoved={compareFrom == "before" && pluginChanges.has(index)}
              />
            );
          })}
        </PluginContainer>
      )}
    </div>
  );
};

export default React.memo(RemotePluginEditor);