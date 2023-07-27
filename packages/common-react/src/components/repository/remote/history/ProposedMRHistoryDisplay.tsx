
import React, { useMemo, useCallback, useState, useEffect, useRef } from "react";
import {
  Plugin,
} from "@floro/graphql-schemas/build/generated/main-graphql";
import styled from "@emotion/styled";
import { useTheme } from "@emotion/react";
import { CommitInfo, Repository } from "@floro/graphql-schemas/src/generated/main-client-graphql";
import { Manifest } from "floro/dist/src/plugins";
import { RemoteCommitState } from "../hooks/remote-state";
import TimeAgo from "javascript-time-ago";
import { useSearchParams} from "react-router-dom";

import en from "javascript-time-ago/locale/en";
import HistoryDateGroup from "./HistoryDateGroup";
import PaginationToggle from "@floro/storybook/stories/repo-components/PaginationToggle";
import { useRepoLinkBase } from "../hooks/remote-hooks";
import { useNavigate } from "react-router";

const Container = styled.div`
  height: 100%;
  max-width: 100%;
  overflow: scroll;
  padding: 24px 40px 80px 40px;
  user-select: text;

  ::-webkit-scrollbar {
    width: 4px;
    background: ${props => props.theme.background};
  }
  ::-webkit-scrollbar-thumb {
    background-color: rgba(155, 155, 155, 0.5);
    border-radius: 10px;
    border: ${props => props.theme.background};
  }
`;

const Title = styled.h1`
  font-family: "MavenPro";
  font-weight: 700;
  font-size: 2rem;
  color: ${(props) => props.theme.colors.pluginDisplayTitle};
`;

const BlurbText = styled.span`
  color: ${(props) => props.theme.colors.blurbBorder};
  font-family: "MavenPro";
  font-weight: 400;
  font-size: 1rem;
  white-space: pre-wrap;
  display: block;
`;

const NoCommitsContainer = styled.div`
  display: flex;
  height: 100%;
  width: 100%;
  flex-direction: center;
  justify-content: center;
  align-items: center;
`;

const NoCommitsTextWrapper = styled.div`
  width: 50%;
  max-width: 450px;
  flex-direction: center;
  justify-content: center;
`;

const NoCommitsText = styled.h3`
  font-weight: 600;
  font-size: 2.5rem;
  font-family: "MavenPro";
  text-align: center;
  color: ${props => props.theme.colors.contrastText};
`;

const PAGINATION_SIZE = 10;

const useDatedCommitHistory = (commits: CommitInfo[]) => {
    return useMemo(() => {

    let out: {date: string, commits: Array<CommitInfo>}[] = [];
    let currentDate: string|null = null;
    let dateArr: Array<CommitInfo> = [];
    for (const commit of commits) {
        const commitDate = new Date(commit?.updatedAt ?? "").toLocaleDateString(
              "en-us",
              { year: "numeric", month: "short", day: "numeric" }
            );
        if (currentDate != commitDate) {
            currentDate = new Date(commit?.updatedAt ?? "").toLocaleDateString(
              "en-us",
              { year: "numeric", month: "short", day: "numeric" }
            );
            dateArr = [];
            out.push({
                date: currentDate,
                commits: dateArr
            });
        }
        dateArr.push(commit);
    }

    return out;
    }, [commits]);
}


interface Props {
  repository: Repository;
  remoteCommitState: RemoteCommitState;
  plugin?: string;
}

const ProposedMRHistoryDisplay = (props: Props) => {

  const [searchParams] = useSearchParams();
  const container = useRef<HTMLDivElement>(null);
  const idxString = searchParams.get('idx');
  const idx = useMemo(() => {
    try {
      if (!idxString) {
        return null;
      }
      const idxInt = parseInt(idxString);
      if (Number.isNaN(idxInt)) {
        return null
      }
      return idxInt;
    } catch(e) {
      return null;
    }
  }, [idxString]);

  const theme = useTheme();

  const commits = useMemo(() => {
    return props?.repository?.branchState?.proposedMergeRequest?.pendingCommits ?? []
  }, [props?.repository?.branchState?.proposedMergeRequest?.pendingCommits]);

  const linkBase = useRepoLinkBase(props.repository);
  const homeLink = useMemo(() => {
    if (!props.repository?.branchState?.branchId) {
      return `${linkBase}?from=remote&plugin=${props?.plugin ?? "home"}`;
    }
    return `${linkBase}?from=remote&branch=${
      props.repository?.branchState?.branchId
    }&plugin=${props.plugin ?? "home"}`;
  }, [props.repository?.branchState, linkBase, props.plugin]);

  const commitsLink = useMemo(() => {
    return `${linkBase}/mergerequests/create/${
      props.repository?.branchState?.branchId
    }?from=remote&plugin=${props.plugin ?? "home"}&review_page=commits`;
  }, [props.repository?.branchState, linkBase, props.plugin]);

  const navigate = useNavigate();

  const datedCommitHistory = useDatedCommitHistory(
    (commits ?? []) as Array<CommitInfo>
  );

  const showNewer = useMemo(() => {
    return !!idx;
  }, [
    idx,
  ]);

  const showOlder = useMemo(() => {
    return (idx ?? 0) + 10 < (props.repository?.branchState?.proposedMergeRequest?.pendingCommitsCount ?? 0);
  }, [props.repository?.branchState?.proposedMergeRequest?.pendingCommitsCount, idx]);

  const newerIdx = useMemo(() => {
    if (!showNewer) {
      return null;
    }
    return Math.max(
      (idx ?? 0) - PAGINATION_SIZE,
      0
    );
  }, [
    showNewer,
    idx
  ]);

  const olderIdx = useMemo(() => {
    if (!showOlder) {
      return null;
    }
    return Math.min(
      (idx ?? 0) + 10,
      props.repository?.branchState?.proposedMergeRequest?.pendingCommitsCount ?? 0
    );
  }, [showOlder, props.repository?.branchState?.proposedMergeRequest?.pendingCommitsCount, idx])

  const onShowOlder = useCallback(() => {
    if (!showOlder) {
      return;
    }
    navigate(commitsLink + "&idx=" + olderIdx);
  }, [showOlder, olderIdx, commitsLink]);

  const onShowNewer = useCallback(() => {
    if (!showNewer) {
      return;
    }
    navigate(commitsLink + "&idx=" + newerIdx ?? 0);
  }, [showNewer, newerIdx, commitsLink]);

  const index = searchParams.get('idx');

  useEffect(() => {
    container?.current?.scrollTo({ top: 0, behavior: "smooth"})
  }, [index])

  if (props.repository?.branchState?.proposedMergeRequest?.pendingCommitsCount == 0) {
    return (
        <Container>
        <NoCommitsContainer>
            <NoCommitsTextWrapper>
            <NoCommitsText>{`no commits to merge`}</NoCommitsText>
            </NoCommitsTextWrapper>
        </NoCommitsContainer>
        </Container>
    );
  }

  return (
    <Container ref={container}>
      {datedCommitHistory?.map((datedCommitGroup, index) => {
        return (
          <HistoryDateGroup
            repository={props.repository}
            remoteCommitState={props.remoteCommitState}
            datedCommitGroup={datedCommitGroup}
            key={index}
            homeLink={homeLink}
            hideSelect
          />
        );
      })}
      {((showNewer || showOlder) && (props?.repository?.branchState?.proposedMergeRequest?.pendingCommitsCount ?? 0) > PAGINATION_SIZE) && (
        <div
          style={{
            marginTop: 24,
            marginBottom: 48,
            maxWidth: 814,
            display: "flex",
            marginLeft: 56,
            justifyContent: "center",
          }}
        >
          <PaginationToggle
            onNewer={onShowNewer}
            onOlder={onShowOlder}
            newerDisabled={!showNewer}
            olderDisabled={!showOlder}
          />
        </div>
      )}
    </Container>
  );
};

export default React.memo(ProposedMRHistoryDisplay);