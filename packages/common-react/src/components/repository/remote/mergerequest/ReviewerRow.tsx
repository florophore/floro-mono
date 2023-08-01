import React, { useMemo, useCallback, useState } from "react";
import styled from "@emotion/styled";
import { useTheme } from "@emotion/react";
import {
  MergeRequest,
  Repository,
  ReviewerRequest,
  User,
  useUpdateMergeRequestReviewersMutation,
} from "@floro/graphql-schemas/src/generated/main-client-graphql";

import ColorPalette from "@floro/styles/ColorPalette";
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
  margin-right: 8px;
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
  font-size: 1.05rem;
  color: ${(props) => props.theme.colors.warningTextColor};
  cursor: pointer;
  margin-top: 1px;
`;

const upcaseFirst = (str: string) => {
  const rest = str.substring(1);
  return (str?.[0]?.toUpperCase() ?? "") + rest;
};

interface Props {
  repository: Repository;
  reviewerRequest: ReviewerRequest;
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
    const user = props?.reviewerRequest?.requestedReviewerUser;
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
    props?.reviewerRequest?.requestedByUser?.id,
    props.repository?.id,
    props.mergeRequest?.id,
    updatedReviewersMutation.loading
  ]);

  const usernameDisplay = useMemo(() => {
    return "@" + props.reviewerRequest.requestedReviewerUser?.username;

  }, [props.reviewerRequest.requestedReviewerUser]);

  const firstName = useMemo(() => upcaseFirst(props.reviewerRequest.requestedReviewerUser?.firstName ?? ""), [props.reviewerRequest.requestedReviewerUser?.firstName]);
  const lastName = useMemo(() => upcaseFirst(props.reviewerRequest.requestedReviewerUser?.lastName ?? ""), [props.reviewerRequest.requestedReviewerUser?.lastName]);
  const reviewStatus = useMemo((): 'approved'|'blocked'|'pending' => {
    if (props.mergeRequest?.mergeRequestPermissions?.requireApprovalToMerge && props?.mergeRequest?.mergeRequestPermissions?.requireReapprovalOnPushToMerge) {
      const filteredReviewStatus = props?.mergeRequest?.reviewStatuses?.filter(rs => {
        return rs?.branchHeadShaAtUpdate == props?.mergeRequest?.branchState?.commitState?.sha;
      });
      const status =  filteredReviewStatus?.find(rs => rs?.user?.id == props?.reviewerRequest?.requestedReviewerUser?.id);
      if (!status) {
        return 'pending';
      }
      if(status.approvalStatus == "approved") {
        return 'approved';
      }
      if(status.approvalStatus == "blocked") {
        return 'blocked';
      }
      return 'pending';
    }

    const status = props?.mergeRequest?.reviewStatuses?.find(
      (rs) => rs?.user?.id == props?.reviewerRequest?.requestedReviewerUser?.id
    );
    if (!status) {
      return 'pending';
    }
    if(status.approvalStatus == "approved") {
      return 'approved';
    }
    if(status.approvalStatus == "blocked") {
      return 'blocked';
    }
    return 'pending';
  }, [props.reviewerRequest, props.mergeRequest?.reviewStatuses, props.mergeRequest?.mergeRequestPermissions, props?.mergeRequest?.branchState?.commitState?.sha])

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
    if (props?.reviewerRequest?.requestedByUser?.id == session?.user?.id) {
      return reviewStatus == 'pending';
    }
    if (props?.reviewerRequest?.requestedReviewerUser?.id == session?.user?.id) {
      return reviewStatus == 'pending';
    }
    return false;
  }, [props?.reviewerRequest, session?.user, reviewStatus]);

  return (
    <Container>
      <LeftRow>
        <UserProfilePhoto user={props.reviewerRequest.requestedReviewerUser as User} size={48} offlinePhoto={null}/>
        <LeftColumn style={{marginLeft: 16}}>
          <NameTitle>{userFullname}</NameTitle>
          <HandleTitle>{usernameDisplay}</HandleTitle>
        </LeftColumn>
      </LeftRow>
      <RightRow>
        <RightColumn>
          <StatusBlock>
            <StatusText>{reviewText}</StatusText>
            <StatusCircle style={{backgroundColor: reviewColor}}/>
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