
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
  max-width: 468px;
  display: flex;
  flex-direction: column;
  width: 100%;
  margin-top: 12px;
`;

interface Props {
  repository: Repository;
  mergeRequest: MergeRequest;
}

const Reviewers = (props: Props) => {
  const reviewerRequests = useMemo(() => {
    return (props.mergeRequest?.reviewerRequests ?? []) as Array<ReviewerRequest>;
  }, [props.mergeRequest?.reviewerRequests]);
  return (
    <Container>
      {reviewerRequests?.map((reviewerRequest: ReviewerRequest, index) => {
        return (
          <ReviewerRow
            key={index}
            repository={props.repository}
            reviewerRequest={reviewerRequest}
            mergeRequest={props?.mergeRequest}
          />
        );
      })}
    </Container>
  );
};

export default React.memo(Reviewers);