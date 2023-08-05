import React, {
  useMemo,
  useState,
  useCallback,
  useRef,
  useEffect,
} from "react";
import { RepoBranch, Repository, useIgnoreBranchMutation } from "@floro/graphql-schemas/src/generated/main-client-graphql";
import { Link, useSearchParams } from "react-router-dom";
import styled from "@emotion/styled";
import { css } from "@emotion/css";
import { useTheme } from "@emotion/react";
import ColorPalette from "@floro/styles/ColorPalette";
import { useSession } from "../../../../session/session-context";
import {
  useOfflinePhoto,
  useOfflinePhotoMap,
} from "../../../../offline/OfflinePhotoContext";
import { useUserOrganizations } from "../../../../hooks/offline";
import AdjustExtend from "@floro/common-assets/assets/images/icons/adjust.extend.svg";
import AdjustShrink from "@floro/common-assets/assets/images/icons/adjust.shrink.svg";
import LaptopWhite from "@floro/common-assets/assets/images/icons/laptop.white.svg";
import GlobeWhite from "@floro/common-assets/assets/images/icons/globe.white.svg";
import Button from "@floro/storybook/stories/design-system/Button";
import LocalRemoteToggle from "@floro/storybook/stories/common-components/LocalRemoteToggle";
import { useQuery, useMutation, useQueryClient } from "react-query";
import axios from "axios";
import { useDaemonIsConnected } from "../../../../pubsub/socket";
import {
  useCloneRepo,
  useCloneState,
  useRepoExistsLocally,
} from "../../local/hooks/local-hooks";
import { RemoteCommitState } from "../hooks/remote-state";
import RemoteCurrentInfo from "@floro/storybook/stories/repo-components/RemoteCurrentInfo";
import { useRepoLinkBase } from "../hooks/remote-hooks";
import { useNavigate } from "react-router-dom";
import { Branch } from "floro/dist/src/repo";
import RepoActionButton from "@floro/storybook/stories/repo-components/RepoActionButton";
import CopyFromIcon from "@floro/common-assets/assets/images/icons/copy.dark.svg";
import CreateMergeRequest from '@floro/storybook/stories/repo-components/CreateMergeRequest';
import { link } from "fs";
import { RepoPage } from "../../types";

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
  remoteCommitState: RemoteCommitState;
  plugin: string;
  page: RepoPage;
}

const RemoteVCSNavHome = (props: Props) => {
  const { data: repoExistsLocally, isLoading } = useRepoExistsLocally(
    props.repository
  );
  const [ignoreBranch, ignoreBranchRequest] = useIgnoreBranchMutation();
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
      return `${linkBase}/mergerequests?from=remote&plugin=${props?.plugin ?? "home"}&sha=${
        props.repository?.branchState?.commitState?.sha
      }`;
    }
    return `${linkBase}/mergerequests?from=remote&plugin=${props?.plugin ?? "home"}`;
  }, [linkBase, props.plugin]);

  const onClickMergeRequests = useCallback(() => {
    navigate(mergeRequestsLink);
  }, [mergeRequestsLink, navigate])

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

  const onIgnore = useCallback((branch: RepoBranch) => {
    if (ignoreBranchRequest.loading || !props.repository?.id || !branch?.id) {
      return;
    }
    ignoreBranch({
      variables: {
        repositoryId: props.repository.id,
        branchId: branch.id,
      }
    })
  }, [ignoreBranchRequest.loading, props.repository])

  const onCreateMergeRequest = useCallback((branch: RepoBranch) => {
    navigate(linkBase + "/mergerequests/create/" + branch.id + "?from=remote");
  }, [linkBase, navigate]);

  const onGoToSettings = useCallback(() => {
    navigate(linkBase + "/settings?from=remote&plugin=" + (props?.plugin ?? "home"));
  }, [linkBase, navigate, props.plugin]);

  const showMRNotifcation = useMemo(() => {
    if (props?.repository?.openUserBranchesWithoutMergeRequestsCount == undefined) {
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

  return (
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
        />
        <ButtonRow style={{ marginTop: 24 }}>
          <RepoActionButton
            onClick={onClickMergeRequests}
            showNotification={showMRNotifcation}
            notificationCount={props?.repository?.openUserBranchesWithoutMergeRequestsCount ?? 0}
            showSecondaryNotification={showMRSecondaryNotifcation}
            secondaryNotificationCount={props?.repository?.openUserMergeRequestsCount ?? 0}
            label={"merge requests"}
            icon={"merge-request"}
            size="large"
          />
        </ButtonRow>
        <ButtonRow style={{ marginTop: 24 }}>
          <RepoActionButton
            label={"copy from repository"}
            icon={"copy"}
            titleTextSize="small"
          />
          <RepoActionButton
            onClick={onGoToSettings}
            isDisabled={!props?.repository?.repoPermissions?.canChangeSettings}
            label={"remote settings"}
            icon={"settings"}
            titleTextSize="small"
          />
        </ButtonRow>
        {props?.repository?.openUserBranchesWithoutMergeRequests?.[0] && (
          <ButtonRow style={{ marginTop: 24 }}>
            <CreateMergeRequest
              onIgnore={onIgnore}
              onCreate={onCreateMergeRequest}
              homeLink={branchlessLink}
              branch={props.repository.openUserBranchesWithoutMergeRequests[0]}
              ignoreLoading={ignoreBranchRequest.loading}
            />
          </ButtonRow>
        )}
      </TopContainer>
      <BottomContainer>

        <ButtonRow>
          <Button
            label="merge branch"
            bg={"purple"}
            size={"extra-big"}
            isDisabled={true}
          />
          <div style={{width: 48}}></div>
          <Button
            label="delete branch"
            bg={"red"}
            size={"extra-big"}
            isDisabled={true}
          />
        </ButtonRow>
        {(cloneState?.state != "none" || !repoExistsLocally) &&
          !isLoading &&
          !cloneStateLoading && (
            <ButtonRow style={{marginTop: 24}}>
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
      </BottomContainer>
    </InnerContent>
  );
};

export default React.memo(RemoteVCSNavHome);
