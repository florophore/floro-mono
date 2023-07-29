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
  useUpdateMergeRequestReviewersMutation,
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
import DotsLoader from "@floro/storybook/stories/design-system/DotsLoader";
import { useSession } from "../../../../session/session-context";

const Container = styled.div`
  width: 100%;
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  margin-top: 6px;
  margin-bottom: 6px;
  padding-left: 4px;
  padding-right: 4px;
`;

const LeftRow = styled.div`
  display: flex;
  flex-direction: row;
`;

const RightRow = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;
`;
const LeftColumn = styled.div`
  display: flex;
  flex-direction: column;
`;

const RightColumn = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  height: 100%;
  padding-top: 2px;
  padding-bottom: 2px;
`;

const NameTitle = styled.p`
  font-family: "MavenPro";
  font-weight: 600;
  font-size: 1.2rem;
  color: ${(props) => props.theme.colors.titleText};
  margin-top: 2px;
`;

const HandleTitle = styled.p`
  font-family: "MavenPro";
  font-weight: 500;
  font-size: 1rem;
  color: ${(props) => props.theme.colors.contrastText};
  margin-top: 2px;
`;

const StatusBlock = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;
  margin-top: 2px;
`;

const StatusCircle = styled.div`
    height: 20px;
    width: 20px;
    border-radius: 50%;
`;

const StatusText = styled.p`
  margin-left: 8px;
  font-family: "MavenPro";
  font-weight: 600;
  font-size: 1rem;
  color: ${(props) => props.theme.colors.contrastText};
`;

const DeleteBlock = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: flex-end;
  height: 20px;
`;

const RemoveText = styled.p`
  margin-left: 8px;
  font-family: "MavenPro";
  font-weight: 700;
  font-size: 1rem;
  color: ${(props) => props.theme.colors.warningTextColor};
  cursor: pointer;
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

  const theme = useTheme();
  const { session } = useSession();

  const reviewerIds = useMemo(() => {
    return props.mergeRequest?.reviewerRequests?.map((reviewerRequest) => {
      return reviewerRequest?.requestedReviewerUser?.id as string;
    }) ?? [];
  }, [props.mergeRequest?.reviewerRequests]);

  const [updatedReviewers, updatedReviewersMutation] =
    useUpdateMergeRequestReviewersMutation();

  const onRemoveUser = useCallback(() => {
    const user = props?.reviwerRequest?.requestedReviewerUser;
    if (updatedReviewersMutation.loading) {
      return;
    }
    if (!props?.repository?.id || !props?.mergeRequest?.id) {
      return;
    }
    if (!user?.id) {
        return;
    }
    if (!reviewerIds?.includes(user?.id)) {
        return;
    }
    const nextReviewerIds = reviewerIds.filter(id => id != user.id);
    updatedReviewers({
      variables: {
        repositoryId: props.repository.id,
        mergeRequestId: props?.mergeRequest?.id,
        reviewerIds: nextReviewerIds
      }
    })
  }, [reviewerIds,
    props?.reviwerRequest?.requestedByUser?.id,
    props.repository?.id,
    props.mergeRequest?.id,
    updatedReviewersMutation.loading
  ]);

  const usernameDisplay = useMemo(() => {
    return "@" + props.reviwerRequest.requestedReviewerUser?.username;

  }, [props.reviwerRequest.requestedReviewerUser]);

  const firstName = useMemo(() => upcaseFirst(props.reviwerRequest.requestedReviewerUser?.firstName ?? ""), [props.reviwerRequest.requestedReviewerUser?.firstName]);
  const lastName = useMemo(() => upcaseFirst(props.reviwerRequest.requestedReviewerUser?.lastName ?? ""), [props.reviwerRequest.requestedReviewerUser?.lastName]);
  const reviewStatus = useMemo((): 'approved'|'blocked'|'pending' => {
    return 'pending';
  }, [props.reviwerRequest, props.mergeRequest?.reviewStatuses])

  const reviewText = useMemo(() => {
    if (reviewStatus == 'approved') {
      return 'approved';
    }
    if (reviewStatus == 'blocked') {
      return 'blocked';
    }
    return 'pending';
  }, [reviewStatus])

  const reviewColor = useMemo(() => {
    if (reviewStatus == 'approved') {
      return ColorPalette.teal;
    }
    if (reviewStatus == 'blocked') {
      return theme.name == "light" ? ColorPalette.red : ColorPalette.lightRed;
    }
    return ColorPalette.gray;
  }, [reviewStatus, theme.name])

  const userFullname = useMemo(() => {
    return `${firstName} ${lastName}`;
  }, [firstName, lastName]);

  const showDeleteBlock = useMemo(() => {
    if (!session?.user) {
      return false;
    }
    if (props?.reviwerRequest?.requestedByUser?.id == session?.user?.id) {
      return true;
    }
    if (props?.reviwerRequest?.requestedReviewerUser?.id == session?.user?.id) {
      return true;
    }
    return false;
  }, [props?.reviwerRequest, session?.user]);

  return (
    <Container>
      <LeftRow>
        <UserProfilePhoto user={props.reviwerRequest.requestedReviewerUser as User} size={48} offlinePhoto={null}/>
        <LeftColumn style={{marginLeft: 16}}>
          <NameTitle>{userFullname}</NameTitle>
          <HandleTitle>{usernameDisplay}</HandleTitle>
        </LeftColumn>
      </LeftRow>
      <RightRow>
        <RightColumn>
          <StatusBlock>
            <StatusCircle style={{backgroundColor: reviewColor}}/>
            <StatusText>{reviewText}</StatusText>
          </StatusBlock>
          <DeleteBlock>
            {showDeleteBlock && (
              <>
                {!updatedReviewersMutation.loading && (
                  <RemoveText onClick={onRemoveUser}>{'remove'}</RemoveText>
                )}
                {updatedReviewersMutation.loading && (
                  <DotsLoader size="small" color="gray"/>
                )}
              </>
            )}
          </DeleteBlock>
        </RightColumn>
      </RightRow>
    </Container>
  )
}

export default React.memo(ReviewerRow);