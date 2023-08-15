import React, { useState, useCallback, useEffect, useMemo } from "react";
import { Repository } from "@floro/graphql-schemas/src/generated/main-client-graphql";
import styled from "@emotion/styled";
import CurrentInfo from "@floro/storybook/stories/repo-components/CurrentInfo";
import RepoActionButton from "@floro/storybook/stories/repo-components/RepoActionButton";
import { ApiResponse } from "floro/dist/src/repo";
import { useLocalVCSNavContext } from "./LocalVCSContext";
import {
  useClearPluginStorage,
  usePopStashedChanges,
  useStashChanges,
  useUpdateCurrentCommand,
} from "../hooks/local-hooks";
import ConfirmDiscardChangesModal from "../modals/ConfirmDiscardChangesModal";

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

const ClearStorageLink = styled.span`
  font-size: 1.2rem;
  font-family: "MavenPro";
  font-weight: 600;
  color: ${(props) => props.theme.colors.linkColor};
  text-decoration: underline;
  cursor: pointer;
`;

interface Props {
  repository: Repository;
  apiResponse: ApiResponse;
  plugin: string;
}

const LocalVCSEditMode = (props: Props) => {
  const { setSubAction } = useLocalVCSNavContext();
  const [showDiscard, setShowDiscard] = useState(false);

  const clearStorageMutation =  useClearPluginStorage(props.plugin, props.repository);
  const onClearStorage = useCallback(() => {
    clearStorageMutation.mutate({});
  }, []);

  const onShowDiscard = useCallback(() => {
    setShowDiscard(true);
  }, []);

  const onCloseDiscard = useCallback(() => {
    setShowDiscard(false);
  }, []);

  const onShowBranches = useCallback(() => {
    setSubAction("branches");
  }, []);

  const onShowEditBranch = useCallback(() => {
    setSubAction("edit_branch");
  }, []);

  const updateCommand = useUpdateCurrentCommand(props.repository);
  const stashChangesMutation = useStashChanges(props.repository);
  const popStashedChangesMutation = usePopStashedChanges(props.repository);

  const onStashChanges = useCallback(() => {
    stashChangesMutation.mutate();
  }, [stashChangesMutation]);

  const onPopStashedChanges = useCallback(() => {
    popStashedChangesMutation.mutate();
  }, [popStashedChangesMutation]);

  const updateToViewMode = useCallback(() => {
    updateCommand.mutate("view");
  }, [updateCommand]);

  const updateToCompareMode = useCallback(() => {
    updateCommand.mutate("compare");
  }, [updateCommand]);

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

  const showClearStorage = useMemo(() => {
    if (!props.plugin || !props?.apiResponse?.storageMap?.[props.plugin]) {
      return false;
    }
    return JSON.stringify(props?.apiResponse?.storageMap?.[props.plugin]) != JSON.stringify({});
  }, [props.apiResponse?.storageMap, props.plugin])

  return (
    <InnerContent>
      <TopContainer>
        <CurrentInfo
          respository={props.repository}
          showWIP
          showBackButton
          isMerge
          mergeDirection={props.apiResponse?.repoState?.merge?.direction}
          mergeCommit={props.apiResponse.mergeCommit}
          branch={props.apiResponse.branch}
          baseBranch={props.apiResponse.baseBranch}
          lastCommit={props.apiResponse.lastCommit}
          isWIP={props.apiResponse.isWIP}
          onGoBack={updateToViewMode}
          onShowBranches={onShowBranches}
          onShowEditBranch={onShowEditBranch}
          showBranchButtons={!props.apiResponse?.repoState?.isInMergeConflict}
        />

        {!props.apiResponse?.repoState?.isInMergeConflict && (
          <ButtonRow style={{ marginTop: 24 }}>
            <RepoActionButton
              label={"compare"}
              icon={"compare"}
              onClick={updateToCompareMode}
            />
            <RepoActionButton
              label={"sha graph"}
              icon={"source-graph"}
              onClick={onShowSourceGraph}
            />
          </ButtonRow>
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
        {showClearStorage && (
          <ButtonRow style={{ marginTop: 24, justifyContent: "flex-end" }}>
            <ClearStorageLink onClick={onClearStorage}>
              {'clear plugin storage'}
            </ClearStorageLink>
          </ButtonRow>
        )}
      </TopContainer>
      <BottomContainer>
        <>
          <ButtonRow>
            <RepoActionButton
              isDisabled={!props.apiResponse?.canPopStashedChanges}
              label={"pop stash"}
              icon={"stash-pop"}
              isLoading={popStashedChangesMutation.isLoading}
              onClick={onPopStashedChanges}
            />
            <RepoActionButton
              isDisabled={!props.apiResponse?.isWIP}
              label={
                (props.apiResponse?.stashSize ?? 0) > 0
                  ? `stash (${props.apiResponse?.stashSize})`
                  : "stash"
              }
              icon={"stash"}
              isLoading={stashChangesMutation.isLoading}
              onClick={onStashChanges}
            />
          </ButtonRow>
          <ButtonRow style={{ marginTop: 24 }}>
            <RepoActionButton
              isDisabled={!props.apiResponse?.isWIP}
              size={"large"}
              label={"discard current changes"}
              icon={"discard"}
              onClick={onShowDiscard}
            />
          </ButtonRow>
        </>
      </BottomContainer>
      <ConfirmDiscardChangesModal
        show={showDiscard}
        onDismiss={onCloseDiscard}
        repository={props.repository}
      />
    </InnerContent>
  );
};

export default React.memo(LocalVCSEditMode);
