
import React, { useMemo, useCallback, useState, useEffect } from "react";
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

const HistoryDisplay = (props: Props) => {

  const [searchParams] = useSearchParams();
  const searchQuery = searchParams.get("query");

  const theme = useTheme();

  const isSearching = useMemo(() => {
    return (searchQuery?.trim()?.length ?? 0) > 0;
  }, [searchQuery]);

  const foundCommits = useMemo(() => {
    if (isSearching) {
      return props.repository?.branchState?.commitSearch;
    }
    return props.repository?.branchState?.commits;
  }, [isSearching, props.repository?.branchState?.commits, props.repository?.branchState?.commitSearch]);

  const [commits, setCommits] = useState(foundCommits ?? []);


  const linkBase = useRepoLinkBase(props.repository);
  const homeLink = useMemo(() => {
    if (!props.repository?.branchState?.branchId) {
      return `${linkBase}?from=remote&plugin=${props?.plugin ?? "home"}`;
    }
    return `${linkBase}?from=remote&branch=${
      props.repository?.branchState?.branchId
    }&plugin=${props.plugin ?? "home"}`;
  }, [props.repository?.branchState, linkBase, props.plugin]);

  const historyLink = useMemo(() => {
    if (!props.repository?.branchState?.branchId) {
      return `${linkBase}/history?from=remote&plugin=${props?.plugin ?? "home"}&query=${searchQuery ?? ""}`;
    }
    return `${linkBase}/history?from=remote&branch=${
      props.repository?.branchState?.branchId
    }&plugin=${props.plugin ?? "home"}&query=${searchQuery ?? ""}`;
  }, [props.repository?.branchState, linkBase, props.plugin, searchQuery]);

  const navigate = useNavigate();

  useEffect(() => {
    if (foundCommits) {
      setCommits(foundCommits);
    }
  }, [foundCommits]);

  const datedCommitHistory = useDatedCommitHistory(
    (commits ?? []) as Array<CommitInfo>
  );

  const showNewer = useMemo(() => {
    if (isSearching) {
      return false;
    }
    if (!props.repository?.branchState?.commits?.[0]) {
      return false;
    }

    return (
      props.repository?.branchState?.commits[0]?.sha !=
      props.repository?.branchState?.commitState?.sha
    );
  }, [props.repository?.branchState?.commits, isSearching]);

  const showOlder = useMemo(() => {
    if (isSearching) {
      return false;
    }
    const commitsLength = props?.repository?.branchState?.commits?.length ?? 0;
    if (commitsLength <= 1) {
      return false;
    }
    const lastCommit = props?.repository?.branchState?.commits?.[commitsLength -  1];
    if (!lastCommit) {
      return false;
    }
    return lastCommit.idx != 0;
  }, [props.repository?.branchState?.commits, isSearching]);

  const newerIdx = useMemo(() => {
    if (!showNewer) {
      return null;
    }
    return Math.min(
      (props.repository?.branchState?.commits?.[0]?.idx ?? 0) + PAGINATION_SIZE,
      (props.repository?.branchState?.commitsSize ?? 0) - 1
    );
  }, [showNewer, props.repository?.branchState?.commits?.[0], props.repository?.branchState?.commitsSize])

  const olderIdx = useMemo(() => {
    if (!showOlder) {
      return null;
    }

    const commitsLength = props?.repository?.branchState?.commits?.length ?? 0;
    const lastCommit = props?.repository?.branchState?.commits?.[commitsLength -  1];
    return Math.max(
      (lastCommit?.idx ?? 0) - 1,
      0
    );
  }, [showOlder, props.repository?.branchState?.commits?.[0], props.repository?.branchState?.commitsSize])

  const onShowOlder = useCallback(() => {
    if (!showOlder) {
      return;
    }
    navigate(historyLink + "&idx=" + olderIdx);
  }, [showOlder, olderIdx, historyLink]);

  const onShowNewer = useCallback(() => {
    if (!showNewer) {
      return;
    }
    if (!newerIdx) {
      return;
    }
    navigate(historyLink + "&idx=" + newerIdx);
  }, [showNewer, newerIdx, historyLink]);

  const index = searchParams.get('idx');

  const onSelect = useCallback((sha: string, idx: number) => {
    if (!index) {
      navigate(historyLink + "&sha=" + sha);
    } else {
      navigate(historyLink + "&sha=" + sha + "&idx=" + index);
    }
  }, [historyLink, index]);

  if (!isSearching && props.repository?.branchState?.commitsSize == 0) {
    return (
        <Container>
        <NoCommitsContainer>
            <NoCommitsTextWrapper>
            <NoCommitsText>{`no commits in branch history`}</NoCommitsText>
            </NoCommitsTextWrapper>
        </NoCommitsContainer>
        </Container>
    );
  }

  if (isSearching && commits?.length == 0) {
    return (
        <Container>
        <NoCommitsContainer>
            <NoCommitsTextWrapper>
            <NoCommitsText>{`no results`}</NoCommitsText>
            </NoCommitsTextWrapper>
        </NoCommitsContainer>
        </Container>
    );
  }

  return (
    <Container>
      {datedCommitHistory?.map((datedCommitGroup, index) => {
        return (
          <HistoryDateGroup
            repository={props.repository}
            remoteCommitState={props.remoteCommitState}
            datedCommitGroup={datedCommitGroup}
            key={index}
            homeLink={homeLink}
            onSelect={onSelect}
          />
        );
      })}
      {((showNewer || showOlder) && (props?.repository?.branchState?.commitsSize ?? 0) > PAGINATION_SIZE) && (
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

export default React.memo(HistoryDisplay);