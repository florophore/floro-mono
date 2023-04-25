import React, { useCallback, useEffect } from "react";
import { Repository } from "@floro/graphql-schemas/src/generated/main-client-graphql";
import styled from "@emotion/styled";
import CurrentInfo from "@floro/storybook/stories/repo-components/CurrentInfo";
import RepoActionButton from "@floro/storybook/stories/repo-components/RepoActionButton";
import Button from "@floro/storybook/stories/design-system/Button";
import { ApiResponse } from "@floro/floro-lib/src/repo";
import { useLocalVCSNavContext } from "./LocalVCSContext";
import { useUpdateCurrentCommand } from "../hooks/local-hooks";

const InnerContent = styled.div`
  display: flex;
  height: 100%;
  width: 100%;
  flex-direction: column;
  justify-content: space-between;
`;

const TopContainer = styled.div`
  display: flex;
  flex-direction: column;
  height: 100%;
  position: relative;
  align-items: center;
  padding: 16px;
`;

const BottomContainer = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: flex-end;
  height: 100%;
  position: relative;
  align-items: center;
  padding: 24px 16px;
`;

const ButtonRow = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;
  width: 100%;
  justify-content: space-between;
`;

interface Props {
  repository: Repository;
  apiResponse: ApiResponse;
}

const LocalVCSViewMode = (props: Props) => {
  const { setSubAction } = useLocalVCSNavContext();
  const onShowBranches = useCallback(() => {
    setSubAction("branches");
  }, []);

  const onShowEditBranch = useCallback(() => {
    setSubAction("edit_branch");
  }, []);

  const onShowSourceGraph = useCallback(() => {
    setSubAction("source_graph");
  }, []);

  useEffect(() => {
    const commandToggleListeners = (event: KeyboardEvent) => {
      if (event.metaKey && event.shiftKey && event.key == "b") {
        onShowBranches();
      }
    };
    window.addEventListener("keydown", commandToggleListeners);
    return () => {
      window.removeEventListener("keydown", commandToggleListeners);
    };
  }, []);

  const updateCommand = useUpdateCurrentCommand(props.repository);

  const updateToCompareMode = useCallback(() => {
    updateCommand.mutate("compare");
  }, [updateCommand]);
  return (
    <InnerContent>
      <TopContainer>
        <CurrentInfo
          respository={props.repository}
          showWIP
          isMerge
          mergeDirection={props.apiResponse?.repoState?.merge?.direction}
          mergeCommit={props.apiResponse.mergeCommit}
          showBranchButtons={!props.apiResponse?.repoState?.isInMergeConflict}
          isWIP={props.apiResponse.isWIP}
          branch={props.apiResponse.branch}
          baseBranch={props.apiResponse.baseBranch}
          lastCommit={props.apiResponse.lastCommit}
          onShowBranches={onShowBranches}
          onShowEditBranch={onShowEditBranch}
        />
        {!props.apiResponse?.repoState?.isInMergeConflict && (
          <>
            <ButtonRow style={{ marginTop: 24 }}>
              <RepoActionButton
                onClick={updateToCompareMode}
                isLoading={updateCommand.isLoading}
                label={"compare"}
                icon={"compare"}
              />
              <RepoActionButton
                label={"sha graph"}
                icon={"source-graph"}
                onClick={onShowSourceGraph}
              />
            </ButtonRow>
            <ButtonRow style={{ marginTop: 24 }}>
              <RepoActionButton
                label={"local repository settings"}
                icon={"settings"}
                size="large"
              />
            </ButtonRow>
          </>
        )}
        {props.apiResponse?.repoState?.isInMergeConflict && (
          <ButtonRow style={{ marginTop: 24 }}>
            <RepoActionButton
              size={"large"}
              onClick={updateToCompareMode}
              isLoading={updateCommand.isLoading}
              label={"manage merge conflict"}
              icon={"merge"}
            />
          </ButtonRow>
        )}
      </TopContainer>
      <BottomContainer>
        {!props.apiResponse?.repoState?.isInMergeConflict && (
          <ButtonRow>
            <Button label={"pull remote"} bg={"purple"} size={"extra-big"} />
          </ButtonRow>
        )}
      </BottomContainer>
    </InnerContent>
  );
};

export default React.memo(LocalVCSViewMode);
