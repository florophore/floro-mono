
import React, { useMemo, useCallback, useState } from "react";
import styled from "@emotion/styled";
import { useTheme } from "@emotion/react";
import {
  CommitInfo,
  MergeRequest,
  MergeRequestEvent,
  Repository,
  ReviewerRequest,
} from "@floro/graphql-schemas/src/generated/main-client-graphql";
import { Manifest } from "floro/dist/src/plugins";
import { RemoteCommitState } from "../hooks/remote-state";
import TimeAgo from "javascript-time-ago";
import CommitWhite from "@floro/common-assets/assets/images/repo_icons/commit.white.svg";
import CommitGray from "@floro/common-assets/assets/images/repo_icons/commit.gray.svg";
import CommitMediumGray from "@floro/common-assets/assets/images/repo_icons/commit.medium_gray.svg";

import en from "javascript-time-ago/locale/en";
import TimelineRow from "./TimelineRow";
import ReviewerRow from "./ReviewerRow";

const Container = styled.div`
  max-width: 400px;
  display: flex;
  flex-direction: column;
`;
const FakeContainer = styled.div`
  max-width: 400px;
  display: flex;
  flex-direction: row;
`;

const LeftColumn = styled.div`
    display: flex;
    flex-direction: column;
`;

const RightColumn = styled.div`
    display: flex;
    flex-direction: column;
    margin-left: 24px;
    flex-grow: 1;
`;

const Line = styled.div`
    width: 2px;
    flex-grow: 1;
    background: ${props => props.theme.colors.contrastTextLight};
    align-self: center;
    border-radius: 16px;
    margin-top: 8px;
    margin-bottom: 8px;
`;



interface Props {
  repository: Repository;
  mergeRequest: MergeRequest;
}

const Reviewers = (props: Props) => {
  const reviewerRequests = useMemo(() => {
    return (props.mergeRequest?.reviewerRequests ?? []) as Array<ReviewerRequest>;
  }, [props.mergeRequest?.reviewerRequests]);
  console.log("YO", props.mergeRequest)
  return (
    <Container>
      {reviewerRequests?.map((reviewerRequest: ReviewerRequest, index) => {
        return (
          <ReviewerRow
            key={index}
            repository={props.repository}
            reviwerRequest={reviewerRequest}
            mergeRequest={props?.mergeRequest}
          />
        );
      })}
    </Container>
  );
};

export default React.memo(Reviewers);