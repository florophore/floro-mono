import React, {
  useMemo,
  useRef,
  useCallback
} from "react";
import styled from "@emotion/styled";
import {
  CommitInfo,
  MergeRequest,
  Repository,
} from "@floro/graphql-schemas/src/generated/main-client-graphql";
import {
  useMergeRequestsFilter,
} from "../hooks/remote-state";
import { useSearchParams } from "react-router-dom";

import MergeRequestHistoryRow from "./MergeRequestHistoryRow";
import PaginationToggle from "@floro/storybook/stories/repo-components/PaginationToggle";

const Container = styled.div`
  height: 100%;
  max-width: 100%;
  overflow: scroll;
  padding: 24px 40px 80px 24px;
  user-select: text;

  ::-webkit-scrollbar {
    width: 4px;
    background: ${(props) => props.theme.background};
  }
  ::-webkit-scrollbar-thumb {
    background-color: rgba(155, 155, 155, 0.5);
    border-radius: 10px;
    border: ${(props) => props.theme.background};
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

const NoMRContainer = styled.div`
  display: flex;
  height: 100%;
  width: 100%;
  flex-direction: center;
  justify-content: center;
  align-items: center;
`;

const NoMRTextWrapper = styled.div`
  width: 50%;
  max-width: 450px;
  flex-direction: center;
  justify-content: center;
`;

const NoMRText = styled.h3`
  font-weight: 600;
  font-size: 2.5rem;
  font-family: "MavenPro";
  text-align: center;
  color: ${(props) => props.theme.colors.contrastText};
`;
const TitleSpan = styled.span`
  font-size: 1.7rem;
  font-family: "MavenPro";
  font-weight: 600;
  color: ${(props) => props.theme.colors.titleText};
  white-space: nowrap;
`;

const PAGINATION_SIZE = 10;

const useDatedCommitHistory = (commits: CommitInfo[]) => {
  return useMemo(() => {
    let out: { date: string; commits: Array<CommitInfo> }[] = [];
    let currentDate: string | null = null;
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
          commits: dateArr,
        });
      }
      dateArr.push(commit);
    }

    return out;
  }, [commits]);
};

interface Props {
  repository: Repository;
  plugin?: string;
}

const MergeRequestHistoryDisplay = (props: Props) => {
  const container = useRef<HTMLDivElement>(null);
  const { filterMR } = useMergeRequestsFilter();
  const [searchParams, setSearchParams] = useSearchParams();
  const searchQuery = searchParams.get('query');
  const hasSearch = useMemo(() => {
    return searchQuery && searchQuery?.trim() != "";
  }, [searchQuery]);
  const mergeRequests = useMemo((): Array<MergeRequest> => {
    if (filterMR == "open") {
      return (props.repository?.openMergeRequests?.mergeRequests ??
        []) as Array<MergeRequest>;
    }
    return (props.repository?.closedMergeRequests?.mergeRequests ??
      []) as Array<MergeRequest>;
  }, [
    filterMR,
    props.repository?.openMergeRequests,
    props?.repository?.closedMergeRequests,
  ]);

  const paginatation = useMemo(() => {
    if (filterMR == "open") {
      return props.repository?.openMergeRequests;
    }
    return props.repository?.closedMergeRequests;
  }, [
    filterMR,
    props.repository?.openMergeRequests,
    props.repository?.closedMergeRequests,
  ]);

  const showPaginator = useMemo(() => {
    if (paginatation?.nextId || paginatation?.lastId) {
      return true;
    }
    return false;
  }, [paginatation?.lastId, paginatation?.nextId]);

  const onNext = useCallback(() => {
    if (!paginatation?.nextId) {
      return;
    }
    setSearchParams({
      id: paginatation?.nextId,
      filter_mr: filterMR,

    });
  }, [paginatation?.nextId, filterMR]);

  const onNewer = useCallback(() => {
    if (!paginatation?.lastId) {
      return;
    }
    setSearchParams({
      id: paginatation?.lastId,
      filter_mr: filterMR
    });

  }, [paginatation?.lastId, filterMR]);

  const hasNone = useMemo(() => {
    return mergeRequests?.length == 0;
  }, [mergeRequests]);

  const noneText = useMemo(() => {
    if (hasSearch) {
      if (filterMR == "open") {
        return "No open merge request found for query: " + searchQuery;
      }
      return "No closed merge request found for query: " + searchQuery;
    }
    if (filterMR == "open") {
      return "No open merge requests to display";
    }
    return "No closed merge requests to display";
  }, [hasNone, filterMR, hasSearch, searchQuery]);

  if (hasNone) {
    return (
      <Container>
        <NoMRContainer>
          <NoMRTextWrapper>
            <NoMRText>{noneText}</NoMRText>
          </NoMRTextWrapper>
        </NoMRContainer>
      </Container>
    );
  }

  return (
  <Container ref={container}>
    <Title>{'Merge Requests'}</Title>
    <div>
      {mergeRequests?.map((mergeRequest, index) => {
        return (
          <MergeRequestHistoryRow
            key={index}
            repository={props.repository}
            mergeRequest={mergeRequest}
            homeLink={""}
          />
        );
      })}
    </div>
    {showPaginator && (
      <div
        style={{
          marginTop: 24,
          marginBottom: 48,
          width: "100%",
          display: "flex",
          justifyContent: "center",
        }}
      >
        <PaginationToggle
          onNewer={onNewer}
          onOlder={onNext}
          newerDisabled={!paginatation?.lastId}
          olderDisabled={!paginatation?.nextId}
        />
      </div>
    )}
  </Container>
  );
};

export default React.memo(MergeRequestHistoryDisplay);
