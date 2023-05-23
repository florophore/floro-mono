import React, { useState, useCallback, useEffect } from "react";
import { Repository } from "@floro/graphql-schemas/src/generated/main-client-graphql";
import styled from "@emotion/styled";
import CurrentInfo from "@floro/storybook/stories/repo-components/CurrentInfo";
import RepoActionButton from "@floro/storybook/stories/repo-components/RepoActionButton";
import { ApiResponse } from "floro/dist/src/repo";
import { useLocalVCSNavContext } from "./LocalVCSContext";
import {
  useAbortMerge,
  useChangeMergeDirection,
  useResolveMerge,
} from "../hooks/local-hooks";
import ConfirmDirectionChangeModal from "../modals/ConfirmDirectionChangeModal";

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

const LocalVCSCompareMergeMode = (props: Props) => {
  const { setSubAction } = useLocalVCSNavContext();
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const onShowBranches = useCallback(() => {
    setSubAction("branches");
  }, []);

  const onShowEditBranch = useCallback(() => {
    setSubAction("edit_branch");
  }, []);

  useEffect(() => {
    setSubAction(null);
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

  const updateDirection = useChangeMergeDirection(props.repository);
  const resolveMerge = useResolveMerge(props.repository);
  const abortMerge = useAbortMerge(props.repository);

  const onResolveMerge = useCallback(() => {
    resolveMerge.mutate();
  }, [resolveMerge]);

  const onAbortMerge = useCallback(() => {
    abortMerge.mutate();
  }, [abortMerge]);

  const onChangeToYours = useCallback(() => {
    if (props.apiResponse.isWIP) {
      setShowConfirmModal(true);
      return;
    }
    updateDirection.mutate({
      direction: "yours",
    });
  }, [updateDirection, props.apiResponse.isWIP]);

  const onChangeToTheirs = useCallback(() => {
    if (props.apiResponse.isWIP) {
      setShowConfirmModal(true);
      return;
    }
    updateDirection.mutate({
      direction: "theirs",
    });
  }, [updateDirection, props.apiResponse.isWIP]);

  const onHideModal = useCallback(() => {
    setShowConfirmModal(false);
  }, []);
  return (
    <>
      <ConfirmDirectionChangeModal
        onDismiss={onHideModal}
        repository={props.repository}
        direction={props.apiResponse.repoState.merge?.direction ?? "yours"}
        show={showConfirmModal}
      />
      <InnerContent>
        <TopContainer>
          <CurrentInfo
            respository={props.repository}
            showWIP
            isMerge
            showMergeButton
            isWIP={props.apiResponse.isWIP}
            branch={props.apiResponse.branch}
            baseBranch={props.apiResponse.baseBranch}
            lastCommit={props.apiResponse.lastCommit}
            mergeCommit={props.apiResponse.mergeCommit}
            mergeDirection={props.apiResponse.repoState?.merge?.direction}
            onShowBranches={onShowBranches}
            onShowEditBranch={onShowEditBranch}
            onSwitchToTheirs={onChangeToTheirs}
            onSwitchToYours={onChangeToYours}
            changeDirectionIsLoading={updateDirection.isLoading}
          />
        </TopContainer>
        <BottomContainer>
          <ButtonRow style={{ marginTop: 24 }}>
            <RepoActionButton
              onClick={onResolveMerge}
              isLoading={resolveMerge.isLoading}
              label={"resolve merge"}
              icon={"resolve"}
            />
            <RepoActionButton
              onClick={onAbortMerge}
              isLoading={abortMerge.isLoading}
              label={"abort merge"}
              icon={"abort"}
            />
          </ButtonRow>
        </BottomContainer>
      </InnerContent>
    </>
  );
};

export default React.memo(LocalVCSCompareMergeMode);
