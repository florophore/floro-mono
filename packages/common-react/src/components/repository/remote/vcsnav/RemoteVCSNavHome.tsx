import React, {
  useMemo,
  useState,
  useCallback,
  useRef,
  useEffect,
} from "react";
import {
  PluginVersion,
  RepoBranch,
  Repository,
  useIgnoreBranchMutation,
} from "@floro/graphql-schemas/src/generated/main-client-graphql";
import styled from "@emotion/styled";
import Button from "@floro/storybook/stories/design-system/Button";
import { useDaemonIsConnected } from "../../../../pubsub/socket";
import {
  useCloneRepo,
  useCloneState,
  useRepoExistsLocally,
} from "../../local/hooks/local-hooks";
import { RemoteCommitState, useMainCommitState } from "../hooks/remote-state";
import RemoteCurrentInfo from "@floro/storybook/stories/repo-components/RemoteCurrentInfo";
import { useRepoLinkBase } from "../hooks/remote-hooks";
import { useNavigate } from "react-router-dom";
import { Branch } from "floro/dist/src/repo";
import RepoActionButton from "@floro/storybook/stories/repo-components/RepoActionButton";
import CreateMergeRequest from "@floro/storybook/stories/repo-components/CreateMergeRequest";
import { RepoPage } from "../../types";
import DeleteBranchModal from "../modals/DeleteBranchModal";
import MergeBranchModal from "../modals/MergeBranchModal";
import { useCopyPasteContext } from "../../copypaste/CopyPasteContext";
import CopyPasteModal from "../../copypaste/copy_modal/CopyPasteModal";
import PluginSelectRow from "../../home/plugin_editor/PluginSelectRow";

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

const Row = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;
  width: 100%;
  justify-content: space-between;
  margin-top: 24px;
`;

const SubTitleSpan = styled.span`
  font-size: 1.4rem;
  font-family: "MavenPro";
  font-weight: 500;
  color: ${(props) => props.theme.colors.contrastTextLight};
  white-space: nowrap;
`;

interface Props {
  repository: Repository;
  remoteCommitState: RemoteCommitState;
  plugin: string;
  page: RepoPage;
}

const RemoteVCSNavHome = (props: Props) => {
  const { data: repoExistsLocally, isLoading } = useRepoExistsLocally(
    props.repository
  );
  const [ignoreBranch, ignoreBranchRequest] = useIgnoreBranchMutation();
  const { isSelectMode, isCopyEnabled, setShowCopyPaste, setIsSelectMode, setCopyInstructions, setSelectedRepoInfo, copyInstructions } = useCopyPasteContext("remote");
  const onShowCopy = useCallback(() => {
    setShowCopyPaste(true);
  }, []);
  const navigate = useNavigate();
  const cloneRepoMutation = useCloneRepo(props.repository);
  const isDaemonConnected = useDaemonIsConnected();
  const cloneRepo = useCallback(() => {
    cloneRepoMutation.mutate();
  }, [props.repository?.id]);

  const { data: cloneState, isLoading: cloneStateLoading } = useCloneState(
    props.repository
  );

  const linkBase = useRepoLinkBase(props.repository);
  const homeLink = useMemo(() => {
    if (props.repository?.branchState?.commitState?.sha) {
      return `${linkBase}?from=remote&plugin=${props?.plugin ?? "home"}&sha=${
        props.repository?.branchState?.commitState?.sha
      }`;
    }
    return `${linkBase}?from=remote&plugin=${props?.plugin ?? "home"}`;
  }, [
    linkBase,
    props.plugin,
    props.repository?.branchState?.branchId,
    props.repository?.branchState?.commitState?.sha,
  ]);

  const homeLinkWithoutSha = useMemo(() => {
    return `${linkBase}?from=remote&plugin=${props?.plugin ?? "home"}`;
  }, [
    linkBase,
    props.plugin,
    props.repository?.branchState?.branchId,
    props.repository?.branchState?.commitState?.sha,
  ]);

  const mergeRequestsLink = useMemo(() => {
    if (props.repository?.branchState?.commitState?.sha) {
      return `${linkBase}/mergerequests?from=remote&plugin=${
        props?.plugin ?? "home"
      }&sha=${props.repository?.branchState?.commitState?.sha}`;
    }
    return `${linkBase}/mergerequests?from=remote&plugin=${
      props?.plugin ?? "home"
    }`;
  }, [linkBase, props.plugin]);

  const onClickMergeRequests = useCallback(() => {
    navigate(mergeRequestsLink);
  }, [mergeRequestsLink, navigate]);

  const branchlessLink = useMemo(() => {
    return `${linkBase}?from=remote&plugin=${props?.plugin ?? "home"}`;
  }, [linkBase, props.plugin]);

  const defaultBranchLink = useMemo(() => {
    return `${linkBase}?from=remote&plugin=${props?.plugin ?? "home"}&branch=${
      props.repository?.branchState?.defaultBranchId
    }`;
  }, [linkBase, props.plugin, props.repository?.branchState?.defaultBranchId]);

  const branchHeadLink = useMemo(() => {
    return `${linkBase}?from=remote&plugin=${props?.plugin ?? "home"}&branch=${
      props.repository?.branchState?.branchId
    }`;
  }, [linkBase, props.plugin, props.repository?.branchState?.branchId]);

  const openMergeRequestLink = useMemo(() => {
    return `${linkBase}/mergerequests/${
      props?.repository?.branchState?.openMergeRequest?.id
    }?from=remote&plugin=${props?.plugin ?? "home"}`;
  }, [
    linkBase,
    props.plugin,
    props.repository?.branchState?.openMergeRequest?.id,
  ]);

  const onChangeBranch = useCallback(
    (branch: RepoBranch | null) => {
      if (branch?.id) {
        navigate(homeLinkWithoutSha + "&branch=" + branch?.id);
      }
    },
    [linkBase, homeLinkWithoutSha]
  );

  const onGoToDefaultBranch = useCallback(() => {
    navigate(defaultBranchLink);
  }, [defaultBranchLink]);

  const onIgnore = useCallback(
    (branch: RepoBranch) => {
      if (ignoreBranchRequest.loading || !props.repository?.id || !branch?.id) {
        return;
      }
      ignoreBranch({
        variables: {
          repositoryId: props.repository.id,
          branchId: branch.id,
        },
      });
    },
    [ignoreBranchRequest.loading, props.repository]
  );

  const onCreateMergeRequest = useCallback(
    (branch: RepoBranch) => {
      navigate(
        linkBase + "/mergerequests/create/" + branch.id + "?from=remote"
      );
    },
    [linkBase, navigate]
  );

  const onGoToSettings = useCallback(() => {
    navigate(
      linkBase + "/settings?from=remote&plugin=" + (props?.plugin ?? "home")
    );
  }, [linkBase, navigate, props.plugin]);

  const showMRNotifcation = useMemo(() => {
    if (
      props?.repository?.openUserBranchesWithoutMergeRequestsCount == undefined
    ) {
      return false;
    }
    return props?.repository?.openUserBranchesWithoutMergeRequestsCount > 0;
  }, [props?.repository?.openUserBranchesWithoutMergeRequestsCount]);

  const showMRSecondaryNotifcation = useMemo(() => {
    if (props?.repository?.openUserMergeRequestsCount == undefined) {
      return false;
    }
    return props?.repository?.openUserMergeRequestsCount > 0;
  }, [props?.repository?.openUserMergeRequestsCount]);

  const [showDeleteBranch, setShowDeleteBranch] = useState(false);

  const onShowDeleteBranch = useCallback(() => {
    setShowDeleteBranch(true);
  }, []);

  const onHideDeleteBranch = useCallback(() => {
    setShowDeleteBranch(false);
  }, []);

  const [showMergeBranch, setShowMergeBranch] = useState(false);

  const onShowMergeBranch = useCallback(() => {
    setShowMergeBranch(true);
  }, []);

  const onHideMergeBranch = useCallback(() => {
    setShowMergeBranch(false);
  }, []);

  const branch = useMemo(() => {
    return props?.repository?.repoBranches?.find(
      (b) => b?.id == props?.repository?.branchState?.branchId
    );
  }, [props?.repository?.branchState, props?.repository?.repoBranches]);

  const baseBranch = useMemo(() => {
    if (!branch?.baseBranchId) {
      return null;
    }
    return props?.repository?.repoBranches?.find(
      (b) => b?.id == branch?.baseBranchId
    );
  }, [branch, props?.repository?.repoBranches]);

  const onDeleteBranchSuccess = useCallback(() => {
    setShowDeleteBranch(false);
    navigate(branchlessLink);
  }, [branchlessLink]);

  const onMergeBranchSuccess = useCallback(() => {
    setShowMergeBranch(false);
    navigate(`${branchlessLink}&branch=${baseBranch?.id}`);
  }, [branchlessLink, baseBranch?.id]);

  const commitState = useMainCommitState(props.page, props.repository);
  const pluginVersionList = useMemo(() => {
    const pluginList: Array<PluginVersion> = [];
    for (const { key: pluginName } of props?.remoteCommitState?.renderedState
      ?.plugins ?? []) {
      const pv = commitState?.pluginVersions?.find(
        (v) => v?.name == pluginName
      );
      if (pv) {
        pluginList.push(pv);
      }
    }
    return pluginList;
  }, [props?.remoteCommitState?.renderedState, commitState?.pluginVersions]);

  const onFinishCopyPaste = useCallback(() => {
    setShowCopyPaste(true);
    setIsSelectMode(false);
  }, []);

  const onCancelCopyPaste = useCallback(() => {
    setIsSelectMode(false);
    setCopyInstructions({});
    setSelectedRepoInfo(null);
  }, []);

  const selectablePluginVersions = useMemo(() => {
    return pluginVersionList.filter(p => p.name && !!copyInstructions[p.name]?.isManualCopy);
  }, [copyInstructions, pluginVersionList]);

  return (
    <>
      <CopyPasteModal
        client="remote"
        pluginVersions={pluginVersionList}
        fromRepository={props.repository}
        stateMap={props.remoteCommitState.renderedState.store}
      />
      {branch && baseBranch && (
        <MergeBranchModal
          show={showMergeBranch}
          branch={branch as Branch}
          baseBranch={baseBranch as Branch}
          repository={props.repository}
          onDismiss={onHideMergeBranch}
          onSuccess={onMergeBranchSuccess}
        />
      )}
      <DeleteBranchModal
        show={showDeleteBranch}
        branch={branch as Branch}
        repository={props.repository}
        onDismiss={onHideDeleteBranch}
        onSuccess={onDeleteBranchSuccess}
      />
      <InnerContent>
        <TopContainer>
          <RemoteCurrentInfo
            repository={props.repository}
            remoteCommitState={props.remoteCommitState}
            onChangeBranch={onChangeBranch}
            defaultBranchLink={defaultBranchLink}
            currentHeadLink={branchHeadLink}
            showBackButton={
              props?.repository?.branchState?.branchId !=
              props?.repository?.branchState?.defaultBranchId
            }
            onGoBack={onGoToDefaultBranch}
            showMergeRequest={
              !!props?.repository?.branchState?.hasOpenMergeRequest
            }
            mergeRequest={
              props?.repository?.branchState?.openMergeRequest ?? undefined
            }
            mergeRequestLink={openMergeRequestLink}
            isOffBranch={
              props?.repository?.branchState?.commitState?.isOffBranch ?? false
            }
            isMerged={props?.repository?.branchState?.isMerged ?? false}
            isConflictFree={
              props?.repository?.branchState?.isConflictFree ?? false
            }
            isCopyMode={isSelectMode}
          />
          {!isSelectMode && (
            <>
              <ButtonRow style={{ marginTop: 24 }}>
                <RepoActionButton
                  onClick={onClickMergeRequests}
                  showNotification={showMRNotifcation}
                  notificationCount={
                    props?.repository
                      ?.openUserBranchesWithoutMergeRequestsCount ?? 0
                  }
                  showSecondaryNotification={showMRSecondaryNotifcation}
                  secondaryNotificationCount={
                    props?.repository?.openUserMergeRequestsCount ?? 0
                  }
                  label={"merge requests"}
                  icon={"merge-request"}
                  size="large"
                />
              </ButtonRow>
              {props?.repository?.repoPermissions?.canChangeSettings && (
                <ButtonRow style={{ marginTop: 24 }}>
                  <RepoActionButton
                    label={"copy from repository"}
                    icon={"copy"}
                    titleTextSize="small"
                    isDisabled={!isCopyEnabled || pluginVersionList.length == 0}
                    onClick={onShowCopy}
                  />
                  <RepoActionButton
                    onClick={onGoToSettings}
                    isDisabled={
                      !props?.repository?.repoPermissions?.canChangeSettings
                    }
                    label={"remote settings"}
                    icon={"settings"}
                    titleTextSize="small"
                  />
                </ButtonRow>
              )}
              {!props?.repository?.repoPermissions?.canChangeSettings && (
                <ButtonRow style={{ marginTop: 24 }}>
                  <RepoActionButton
                    label={"copy from repository"}
                    icon={"copy"}
                    size="large"
                    isDisabled={!isCopyEnabled || pluginVersionList.length == 0}
                    onClick={onShowCopy}
                  />
                </ButtonRow>
              )}
              {props?.repository?.openUserBranchesWithoutMergeRequests?.[0] && (
                <ButtonRow style={{ marginTop: 24 }}>
                  <CreateMergeRequest
                    onIgnore={onIgnore}
                    onCreate={onCreateMergeRequest}
                    homeLink={branchlessLink}
                    branch={
                      props.repository.openUserBranchesWithoutMergeRequests[0]
                    }
                    ignoreLoading={ignoreBranchRequest.loading}
                  />
                </ButtonRow>
              )}
            </>
          )}

          {isSelectMode && (
            <>
                <Row style={{ marginBottom: 0 }}>
                  <SubTitleSpan>{"Selectable Plugins"}</SubTitleSpan>
                </Row>
                <div style={{width: "100%", marginTop: 12}}>
                  {selectablePluginVersions?.map((pluginVersion, index) => {
                    return (
                      <PluginSelectRow
                        pluginVersion={pluginVersion}
                        repository={props.repository}
                        key={index}
                      />
                    );
                  })}
                </div>
            </>
          )}
        </TopContainer>
        <BottomContainer>
          {isSelectMode && (
            <>
              <ButtonRow style={{marginBottom: 16}}>
                <RepoActionButton
                  label={"cancel copy and paste"}
                  icon={"copy-cancel"}
                  size={"large"}
                  onClick={onCancelCopyPaste}
                />
              </ButtonRow>
              <ButtonRow>
                <RepoActionButton
                  label={"finish copy and paste"}
                  icon={"copy-check"}
                  size={"large"}
                  onClick={onFinishCopyPaste}
                />
              </ButtonRow>
            </>
          )}
          {!isSelectMode && (
            <>
            {props?.repository?.branchState?.showMergeAndDeleteOptions &&
              !props?.repository?.branchState?.commitState?.isOffBranch && (
                <ButtonRow>
                  <Button
                    label="merge branch"
                    bg={"purple"}
                    size={"extra-big"}
                    isDisabled={!props?.repository?.branchState?.canMergeDirectly}
                    onClick={onShowMergeBranch}
                  />
                  <div style={{ width: 48 }}></div>
                  <Button
                    label="delete branch"
                    bg={"red"}
                    size={"extra-big"}
                    isDisabled={
                      !(
                        props?.repository?.branchState?.canDelete &&
                        props?.repository?.branchState?.branchHead ==
                          props?.repository?.branchState?.commitState?.sha
                      )
                    }
                    onClick={onShowDeleteBranch}
                  />
                </ButtonRow>
              )}
            {(cloneState?.state != "none" || !repoExistsLocally) &&
              !isLoading &&
              !cloneStateLoading && (
                <ButtonRow style={{ marginTop: 24 }}>
                  <Button
                    label="clone repository"
                    bg={"orange"}
                    size={"extra-big"}
                    onClick={cloneRepo}
                    isLoading={cloneRepoMutation.isLoading}
                    isDisabled={!isDaemonConnected}
                  />
                </ButtonRow>
              )}
            </>
          )}
        </BottomContainer>
      </InnerContent>
    </>
  );
};

export default React.memo(RemoteVCSNavHome);
