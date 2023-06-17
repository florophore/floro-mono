import React, { useCallback, useEffect, useState } from "react";
import { Repository } from "@floro/graphql-schemas/src/generated/main-client-graphql";
import styled from "@emotion/styled";
import CurrentInfo from "@floro/storybook/stories/repo-components/CurrentInfo";
import RepoActionButton from "@floro/storybook/stories/repo-components/RepoActionButton";
import Button from "@floro/storybook/stories/design-system/Button";
import { ApiResponse } from "floro/dist/src/repo";
import { useLocalVCSNavContext } from "./LocalVCSContext";
import {
  useFetchInfo,
  usePullBranch,
  usePushBranch,
  useUpdateCurrentCommand,
} from "../hooks/local-hooks";
import {
  usePullButtonEnabled,
  usePullButtonSubTitle,
  usePushButtonEnabled,
  usePushButtonSubTitle,
} from "../hooks/push-pull-state";
import UpdateBillingModal from "../modals/UpdateBillingModal";
import ConfirmMergeWIPModal from "../modals/ConfirmMergeWIPModal";
import ConfirmForcePullModal from "../modals/ConfirmForcePullModal";
import ConfirmForcePushModal from "../modals/ConfirmForcePushModal";
import CopyFromIcon from "@floro/common-assets/assets/images/icons/copy.dark.svg";

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
  const [showBillingModal, setShowBillingModal] = useState(false);
  const [showConfirmMergePullModal, setShowConfirmMergePullModal] =
    useState(false);
  const [showConfirmForcePull, setShowConfirmForcePull] = useState(false);
  const [showConfirmForcePush, setShowConfirmForcePush] = useState(false);
  const { setSubAction } = useLocalVCSNavContext();
  const onCloseBillingModal = useCallback(() => {
    setShowBillingModal(false);
  }, []);

  const onCloseConfirmMergePullModal = useCallback(() => {
    setShowConfirmMergePullModal(false);
  }, []);

  const onCloseForcePull = useCallback(() => {
    setShowConfirmForcePull(false);
  }, []);

  const onCloseForcePush = useCallback(() => {
    setShowConfirmForcePush(false);
  }, []);

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

  const { data: fetchInfo, isLoading: pushInfoLoading } = useFetchInfo(
    props.repository
  );

  const isPushEnabled = usePushButtonEnabled(fetchInfo, pushInfoLoading);
  const isPullEnabled = usePullButtonEnabled(fetchInfo, pushInfoLoading);
  const pushSubTitle = usePushButtonSubTitle(
    fetchInfo,
    pushInfoLoading,
    props.apiResponse.repoState
  );
  const pullSubTitle = usePullButtonSubTitle(
    fetchInfo,
    props.apiResponse.isWIP ?? false,
    pushInfoLoading,
    props.apiResponse.repoState
  );

  const pushMutation = usePushBranch(props.repository);
  const pullMutation = usePullBranch(props.repository);

  const onPush = useCallback(() => {
    if (!fetchInfo?.canPushBranch) {
      return;
    }
    if (fetchInfo?.hasConflict) {
      setShowConfirmForcePush(true);
      return;
    }
    if (!fetchInfo?.accountInGoodStanding) {
      setShowBillingModal(true);
      return;
    }
    pushMutation.mutate();
  }, [
    fetchInfo?.accountInGoodStanding,
    fetchInfo?.canPushBranch,
    fetchInfo?.hasConflict,
  ]);

  const onConfirmPull = useCallback(() => {
    if (!fetchInfo?.canPull) {
      return;
    }
    pullMutation.mutate();
  }, [fetchInfo?.canPull]);

  const onConfirmPush = useCallback(() => {
    if (!fetchInfo?.canPushBranch) {
      return;
    }
    pushMutation.mutate();
  }, [fetchInfo?.canPushBranch]);

  const onPull = useCallback(() => {
    if (!fetchInfo?.canPull) {
      return;
    }
    if (fetchInfo?.hasConflict) {
      setShowConfirmForcePull(true);
      return;
    }
    if (fetchInfo?.pullCanMergeWip && props.apiResponse.isWIP) {
      setShowConfirmMergePullModal(true);
      return;
    }
    pullMutation.mutate();
  }, [
    fetchInfo?.hasConflict,
    fetchInfo?.pullCanMergeWip,
    fetchInfo?.canPull,
    fetchInfo?.hasConflict,
    props.apiResponse.isWIP,
  ]);

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
          isEditBranchDisabled={
            fetchInfo?.branchPushDisabled || pushInfoLoading
          }
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
                label={"copy from repository"}
                icon={"copy"}
                titleTextSize="small"
              />
              <RepoActionButton
                label={"local settings"}
                icon={"settings"}
                titleTextSize="small"
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
            <RepoActionButton
              label={"pull remote"}
              icon={"pull"}
              subTitle={pullSubTitle ?? ""}
              isDisabled={!isPullEnabled}
              isLoading={pushInfoLoading || pullMutation.isLoading}
              onClick={onPull}
            />
            <RepoActionButton
              label={"push local"}
              icon={"push"}
              subTitle={pushSubTitle ?? ""}
              isDisabled={!isPushEnabled}
              isLoading={pushInfoLoading || pushMutation.isLoading}
              onClick={onPush}
            />
          </ButtonRow>
        )}
      </BottomContainer>
      <UpdateBillingModal
        show={showBillingModal}
        onDismiss={onCloseBillingModal}
        repository={props.repository}
      />
      <ConfirmMergeWIPModal
        show={showConfirmMergePullModal}
        onDismiss={onCloseConfirmMergePullModal}
        onConfirm={onConfirmPull}
        repository={props.repository}
      />
      <ConfirmForcePullModal
        show={showConfirmForcePull}
        onDismiss={onCloseForcePull}
        onConfirm={onConfirmPull}
        repository={props.repository}
      />
      <ConfirmForcePushModal
        show={showConfirmForcePush}
        onDismiss={onCloseForcePush}
        onConfirm={onConfirmPush}
        repository={props.repository}
      />
    </InnerContent>
  );
};

export default React.memo(LocalVCSViewMode);
