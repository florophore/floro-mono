import React, { useMemo, useCallback, useState } from "react";
import styled from "@emotion/styled";
import { useTheme } from "@emotion/react";
import {
  CommitInfo,
  MergeRequest,
  MergeRequestEvent,
  Repository,
  ReviewerRequest,
  User,
} from "@floro/graphql-schemas/src/generated/main-client-graphql";
import { Manifest } from "floro/dist/src/plugins";
import { RemoteCommitState } from "../hooks/remote-state";
import TimeAgo from "javascript-time-ago";
import CommitWhite from "@floro/common-assets/assets/images/repo_icons/commit.white.svg";
import CommitGray from "@floro/common-assets/assets/images/repo_icons/commit.gray.svg";
import MergeRequestWhite from "@floro/common-assets/assets/images/repo_icons/merge_request.white.svg";
import MergeRequestGray from "@floro/common-assets/assets/images/repo_icons/merge_request.gray.svg";

import EditWhite from "@floro/common-assets/assets/images/icons/edit.dark.svg";
import EditGray from "@floro/common-assets/assets/images/icons/edit.light.svg";

import en from "javascript-time-ago/locale/en";
import ColorPalette from "@floro/styles/ColorPalette";
import InitialProfileDefault from "@floro/storybook/stories/common-components/InitialProfileDefault";
import UserProfilePhoto from "@floro/storybook/stories/common-components/UserProfilePhoto";

const Container = styled.div`
  width: 100%;
  display: flex;
  flex-direction: row;
`;

const LeftColumn = styled.div`
  display: flex;
  flex-direction: column;
`;

const TitleColumn = styled.div`
  display: flex;
  flex-direction: column;
`;

const RightColumn = styled.div`
  display: flex;
  flex-direction: row;
  margin-left: 24px;
  flex-grow: 1;
`;

const IconContainer = styled.div`
  height: 32px;
  width: 32px;
  background: ${(props) =>
    props.theme.name == "light"
      ? ColorPalette.lightGray
      : ColorPalette.mediumGray};
  border-radius: 50%;
  display: flex;
  justify-content: center;
  align-items: center;
`;

const Icon = styled.img`
  height: 20px;
  width: 20px;
`;

const Title = styled.h1`
  font-family: "MavenPro";
  font-weight: 500;
  font-size: 1.2rem;
  color: ${(props) => props.theme.colors.contrastTextLight};
  margin-top: 2px;
  line-height: 1.4;
`;

const Line = styled.div`
  width: 2px;
  flex-grow: 1;
  background: ${(props) => props.theme.colors.contrastTextLight};
  align-self: center;
  border-radius: 16px;
  margin-top: 8px;
  margin-bottom: 8px;
`;

const ProfilePic = styled.img`
  height: 32px;
  width: 32px;
  border-radius: 50%;
  margin-right: 12px;
`;

const upcaseFirst = (str: string) => {
  const rest = str.substring(1);
  return (str?.[0]?.toUpperCase() ?? "") + rest;
};

interface Props {
  repository: Repository;
  reviwerRequest: ReviewerRequest;
  mergeRequest: MergeRequest;
}

const ReviewerRow = (props: Props) => {

  return (
    <Container>
      <UserProfilePhoto user={props.reviwerRequest.requestedReviewerUser as User} size={36} offlinePhoto={null}/>

    </Container>
  )
}

export default React.memo(ReviewerRow);