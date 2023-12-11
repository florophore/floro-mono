import React, { useMemo, useCallback, useEffect, useState } from "react";
import { PluginVersion, Repository, useMergeBranchMutation, useRepositoryUpdatesSubscription } from "@floro/graphql-schemas/src/generated/main-client-graphql";
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
  useRepoDevPlugins,
  useRepoManifestList,
  useClearPluginStorage,
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
import {
  useSearchParams,
} from "react-router-dom";
import { useCopyPasteContext } from "../../copypaste/CopyPasteContext";
import CopyPasteModal from "../../copypaste/copy_modal/CopyPasteModal";
import { Manifest } from "floro/dist/src/plugins";
import { transformLocalManifestToPartialPlugin } from "../hooks/manifest-transforms";
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

const ConflictInfoRow = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;
  width: 100%;
  justify-content: flex-end;
  margin-bottom: 16px;
`;

const NothingToMerge = styled.p`
  padding: 0;
  margin: 0;
  font-weight: 500;
  font-size: 1.1rem;
  font-family: "MavenPro";
  color: ${(props) => props.theme.colors.standardTextLight};
  font-style: italic;
`;

const MergeOkay = styled.p`
  padding: 0;
  margin: 0;
  font-weight: 500;
  font-size: 1.1rem;
  font-family: "MavenPro";
  color: ${(props) => props.theme.colors.addedText};
  font-style: italic;
`;

const ConflictError = styled.p`
  padding: 0;
  margin: 0;
  font-weight: 500;
  font-size: 1.1rem;
  font-family: "MavenPro";
  color: ${(props) => props.theme.colors.removedText};
  font-style: italic;
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

const LocalVCSViewMode = (props: Props) => {
  const [showBillingModal, setShowBillingModal] = useState(false);
  const [showConfirmMergePullModal, setShowConfirmMergePullModal] =
    useState(false);
  const [showConfirmForcePull, setShowConfirmForcePull] = useState(false);
  const [showConfirmForcePush, setShowConfirmForcePush] = useState(false);
  const { isCopyEnabled, setShowCopyPaste, isSelectMode, setSelectedRepoInfo, setCopyInstructions, setIsSelectMode, copyInstructions } = useCopyPasteContext("local");
  const { setShowLocalSettings} = useLocalVCSNavContext();
  const clearStorageMutation =  useClearPluginStorage(props.plugin, props.repository);
  const onClearStorage = useCallback(() => {
    clearStorageMutation.mutate({});
  }, []);
  const onShowCopy = useCallback(() => {
    setShowCopyPaste(true);
  }, []);
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

  const { data: fetchInfo, isLoading: pushInfoLoading, refetch } = useFetchInfo(
    props.repository
  );

  const [searchParams] = useSearchParams();
  const branchId = searchParams.get('branch');
  const sha = searchParams.get('sha');
  const repoSubscription = useRepositoryUpdatesSubscription({
    variables: {
      repositoryId: props.repository.id,
      branchId,
      sha
    }
  });

  useEffect(() => {
    if (repoSubscription?.data) {
      refetch();
    }
  }, [repoSubscription?.data])

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
    if (fetchInfo?.hasConflict || fetchInfo?.remoteAhead) {
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


  useEffect(() => {
    if (pullMutation.isSuccess) {
      setShowConfirmForcePull(false);
      setShowConfirmMergePullModal(false);
    }
  }, [pullMutation.isSuccess])

  useEffect(() => {
    if (pushMutation.isSuccess) {
      setShowConfirmForcePush(false);
    }
  }, [pushMutation.isSuccess])

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

  const pushDisclaimer = useMemo(() => {
    if (pushInfoLoading || fetchInfo?.fetchFailed) {
      return null;
    }

    if (fetchInfo?.hasOpenMergeRequestConflict) {
      return (
        <ConflictInfoRow>
          <ConflictError>
            {
              "Base branch conflicts with the base branch of an open merge request. Either change the base branch or close the merge request."
            }
          </ConflictError>
        </ConflictInfoRow>
      );
    }
    if (fetchInfo?.baseBranchRequiresPush) {
      return (
          <ConflictInfoRow>
            <ConflictError>
              {
                "Push your base branch first in order to push your current branch."
              }
            </ConflictError>
          </ConflictInfoRow>
      );
    }


    if (!fetchInfo?.userHasPermissionToPush) {
      return (
          <ConflictInfoRow>
            <ConflictError>
              {
                "You do not have push permissions for this repository."
              }
            </ConflictError>
          </ConflictInfoRow>
      );
    }

    if (!fetchInfo?.userCanPush) {
      return (
          <ConflictInfoRow>
            <ConflictError>
              {
                "You cannot directly push this branch to the remote repository."
              }
            </ConflictError>
          </ConflictInfoRow>
      );
    }

    if (fetchInfo?.containsDevPlugins) {
      return (
          <ConflictInfoRow>
            <ConflictError>
              {
                "Point your branch head to a sha that does not have any references to development plugins in its commit history."
              }
            </ConflictError>
          </ConflictInfoRow>
      );
    }

    if (fetchInfo?.hasUnreleasedPlugins) {
      return (
        <ConflictInfoRow>
          <ConflictError>
            {
              "Point your branch head to a sha that does not have any references to unreleased plugins in its commit history. Alternatively, if possible, you can release the plugins and then push."
            }
          </ConflictError>
        </ConflictInfoRow>
      );
    }

    if (fetchInfo?.hasInvalidPlugins) {
      return (
        <ConflictInfoRow>
          <ConflictError>
            {
              "You cannot push invalid plugins. Invalid plugins may be plugins that this repository does not have permission to incorporate remotely or plugins that have not been registered remotely."
            }
          </ConflictError>
        </ConflictInfoRow>
      );
    }
    return null;

  }, [fetchInfo, fetchInfo?.fetchFailed, pushInfoLoading]);


  const repoManifestList = useRepoManifestList(props.repository, props.apiResponse);
  const devPluginsRequest = useRepoDevPlugins(props.repository);

  const apiManifestList = useMemo(() => {
    return repoManifestList?.data ?? [];
  }, [
    props.apiResponse?.applicationState,
    repoManifestList
  ]);

  const manifestList = useMemo(() => {
    const devManifestList: Array<Manifest> = [];
    for (const pluginName in devPluginsRequest?.data ?? {}) {
      const versions = devPluginsRequest?.data?.[pluginName] ?? {};
      for (const version in versions) {
        if (versions?.[version]?.manifest) {
          devManifestList.push(versions?.[version]?.manifest);
        }
      }
    }
    return [...(apiManifestList ?? []), ...devManifestList];
  }, [apiManifestList, devPluginsRequest]);


  const plugins = useMemo(() => {
    return props?.apiResponse?.applicationState?.plugins ?? [];
  }, [
    props?.apiResponse?.applicationState?.plugins,
  ]);

  const installedPluginVersions = useMemo(() => {
    if (!manifestList || !props?.apiResponse) {
      return [];
    }
    return plugins
      .map((pluginKV) => {
        const manifest = manifestList.find(
          (v) => v.name == pluginKV.key && v.version == pluginKV.value
        );
        if (!manifest) {
          return null;
        }
        return transformLocalManifestToPartialPlugin(
          pluginKV.key,
          pluginKV.value,
          manifest as Manifest,
          manifestList
        );
      })
      ?.filter((v) => v?.versions?.[0] != null)?.map(p => {
          const version = plugins.find(pv => pv.key == p?.name);
          return (
            p?.versions?.find?.((v) => v?.version == version?.value) ??
            (p?.versions?.[0] as PluginVersion)
          );
      }) as Array<PluginVersion>;
  }, [manifestList, plugins]);

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
    return installedPluginVersions.filter(p => p.name && !!copyInstructions[p.name]?.isManualCopy);
  }, [copyInstructions, installedPluginVersions]);

  const showClearStorage = useMemo(() => {
    if (!props?.apiResponse?.storageMap?.[props.plugin]) {
      return false;
    }
    return JSON.stringify(props?.apiResponse?.storageMap?.[props.plugin]) != JSON.stringify({});
  }, [props.apiResponse?.storageMap, props.plugin]);

  const onShowSettings = useCallback(() => {
    setShowLocalSettings(true);
  }, []);

  return (
    <>
      <CopyPasteModal
        client="local"
        pluginVersions={installedPluginVersions}
        fromRepository={props.repository}
        stateMap={props.apiResponse.applicationState.store}
      />
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
            isCopyMode={isSelectMode}
          />
          {!isSelectMode && (
            <>
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
                      isDisabled={
                        !isCopyEnabled || installedPluginVersions.length == 0
                      }
                      onClick={onShowCopy}
                    />
                    <RepoActionButton
                      label={"local settings"}
                      icon={"settings"}
                      titleTextSize="small"
                      onClick={onShowSettings}
                    />
                  </ButtonRow>
                  {showClearStorage && (
                    <ButtonRow style={{ marginTop: 24, justifyContent: "flex-end" }}>
                      <ClearStorageLink onClick={onClearStorage}>
                        {'clear plugin storage'}
                      </ClearStorageLink>
                    </ButtonRow>
                  )}
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
            </>
          )}
          {isSelectMode && (
            <>
                <Row style={{ marginBottom: 0 }}>
                  <SubTitleSpan>{"Copy Selectable Plugins"}</SubTitleSpan>
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
          {!isSelectMode && (
            <>
              <>{pushDisclaimer}</>
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
            </>
          )}
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
          isLoading={pullMutation.isLoading}
        />
        <ConfirmForcePushModal
          show={showConfirmForcePush}
          onDismiss={onCloseForcePush}
          onConfirm={onConfirmPush}
          repository={props.repository}
          isLoading={pushMutation.isLoading}
        />
      </InnerContent>
    </>
  );
};

export default React.memo(LocalVCSViewMode);
