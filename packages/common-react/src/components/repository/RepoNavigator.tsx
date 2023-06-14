import React, { useMemo, useState, useCallback } from "react";
import { Repository } from "@floro/graphql-schemas/src/generated/main-client-graphql";
import styled from "@emotion/styled";
import RepoSideNavigator from "./RepoSideNavigator";
import VersionControlPanel from "./VersionControlPanel";
import { useLocalVCSNavContext } from "./local/vcsnav/LocalVCSContext";
import { useSourceGraphIsShown } from "./ui-state-hook";
import { RemoteCommitState } from "./remote/hooks/remote-state";

const Container = styled.main`
  display: flex;
  flex-direction: row;
  height: 100%;
  flex: 1;
  overflow: hidden;
`;

const ContentContainer = styled.div`
  display: flex;
  flex-stretch: 1;
  flex: 1;
  flex-direction: column;
  height: 100%;
  max-height: 100%;
`;

const Content = styled.div`
  max-height: 100%;
  flex: 1;
`;

interface Props {
  repository: Repository;
  plugin: string;
  children: React.ReactElement;
  isExpanded: boolean;
  onSetIsExpanded: (isExpanded: boolean) => void;
  remoteCommitState: RemoteCommitState;
  from: "local"|"remote";
  page:
    | "history"
    | "home"
    | "settings"
    | "branch-rules"
    | "merge-requests"
    | "merge-request"
    | "merge-request-review";
}

const RepoNavigator = (props: Props): React.ReactElement => {
  const sourceMapIsShown = useSourceGraphIsShown();
  const hideSideNav = useMemo(() => {
    if (props.from == "remote") {
      if (props.page == "history") {
        return true;
      }

      return false;
    }
    if (sourceMapIsShown) {
      return true;
    }
    return false;
  }, [sourceMapIsShown, props.from, props.page])
  return (
    <Container>
      {!hideSideNav && (
        <RepoSideNavigator
          repository={props.repository}
          plugin={props.plugin}
          remoteCommitState={props.remoteCommitState}
          page={props.page}
        />
      )}
      <ContentContainer>
        <Content>{props.children}</Content>
      </ContentContainer>
      <VersionControlPanel
        isExpanded={props.isExpanded}
        onSetIsExpanded={props.onSetIsExpanded}
        repository={props.repository}
        remoteCommitState={props.remoteCommitState}
        page={props.page}
        plugin={props.plugin}
      />
    </Container>
  );
};

export default React.memo(RepoNavigator);
