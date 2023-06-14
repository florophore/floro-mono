import React, { useMemo } from "react";
import styled from "@emotion/styled";
import { useTheme } from "@emotion/react";
import { ApiResponse } from "floro/dist/src/repo";
import {
  Repository,
  Plugin,
  PluginVersion,
} from "@floro/graphql-schemas/src/generated/main-client-graphql";
import PluginEditorRow from "./PluginEditorRow";
import PreviewPlugin from "./PreviewPlugin";
import { useLocalVCSNavContext } from "../../local/vcsnav/LocalVCSContext";
import { RemoteCommitState } from "../../remote/hooks/remote-state";
import RemotePluginEditorRow from "./RemotePluginEditorRow";

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
}

const RemotePluginEditor = (props: Props) => {
  const theme = useTheme();

  const plugins = useMemo(() => {
    return props.remoteCommitState.renderedState.plugins ?? [];
  }, [
    props.remoteCommitState.renderedState.plugins,
  ]);
  return (
    <div>
      {(plugins?.length ?? 0) > 0 && (
        <PluginContainer>
          {plugins.map((pluginKV, index) => {
            return (
              <RemotePluginEditorRow
                key={index}
                repository={props.repository}
                pluginVersions={
                  (props.repository?.branchState?.commitState?.pluginVersions ??
                  []) as PluginVersion[]
                }
                pluginName={pluginKV.key}
                pluginVersion={pluginKV.value}
              />
            );
          })}
        </PluginContainer>
      )}
    </div>
  );
};

export default React.memo(RemotePluginEditor);