import React, { useMemo, useCallback, useState } from "react";
import styled from "@emotion/styled";
import { useTheme } from "@emotion/react";
import {
  CommitInfo,
  MergeRequest,
  MergeRequestEvent,
  Repository,
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
  max-width: 870px;
  display: flex;
  flex-direction: row;
  min-height: 32px;
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
  background: ${props => props.theme.name == "light" ? ColorPalette.lightGray : ColorPalette.mediumGray};
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
  event: MergeRequestEvent;
  mergeRequest: MergeRequest;
  isLast: boolean;
}

const TimelineRow = (props: Props) => {
  const theme = useTheme();

  const icon = useMemo(() => {
    if (props.event.eventName == "CREATE_MERGE_REQUEST") {
        if (theme.name == "light") {
        return MergeRequestGray;
        }
        return MergeRequestWhite;
    }
    if (props.event.eventName == "UPDATED_MERGE_REQUEST_INFO") {
        if (theme.name == "light") {
        return EditGray;
        }
        return EditWhite;
    }
    if (theme.name == "light") {
      return CommitGray;
    }
    return CommitWhite;
  }, [theme.name, props.event.eventName]);

  const firstName = useMemo(() => upcaseFirst(props.event.performedByUser?.firstName ?? ""), [props.event.performedByUser?.firstName]);
  const lastName = useMemo(() => upcaseFirst(props.event.performedByUser?.lastName ?? ""), [props.event.performedByUser?.lastName]);

  const userFullname = useMemo(() => {
    return `${firstName} ${lastName}`;
  }, [firstName, lastName]);

  const action = useMemo(() => {
    if (props.event.eventName == "CREATE_MERGE_REQUEST") {
      return (
        <span>
          {'created merge request '}
          <b>
            {`[${props.mergeRequest.mergeRequestCount}] "${props.mergeRequest.title}"`}
          </b>
          {' for branch '}
          <b>
            {`${props.mergeRequest?.branchState?.name}`}
          </b>
        </span>
      )
    }
    if (props.event.eventName == "BRANCH_UDPATED") {
      return (
        <span>
          {'updated '}
          <b>
            {`${props.mergeRequest?.branchState?.name}`}
          </b>
          {' to commit '}
          <b>
            {`(${props.event.branchHeadShaAtEvent?.substring(0, 6)})`}
          </b>
        </span>
      )

    }
    if (props.event.eventName == "UPDATED_MERGE_REQUEST_INFO") {
        const changedTitle = props?.event?.addedTitle != props?.event?.removedTitle;
        const changedDescription = props?.event?.addedDescription != props?.event?.removedDescription;
        if (changedTitle && changedDescription) {
          return (
            <span>
              {'changed title from '}
              <b style={{textDecoration: 'line-through'}}>
                {props?.event?.removedTitle}
              </b>
              {' and changed description from '}
              <b style={{textDecoration: 'line-through'}}>
                {props?.event?.removedDescription}
              </b>
            </span>
          );
        }
        if (changedTitle) {
          return (
            <span>
              {'changed title from '}
              <b style={{textDecoration: 'line-through'}}>
                {props?.event?.removedTitle}
              </b>
            </span>
          );
        }
        if (changedDescription) {
          return (
            <span>
              {'changed description from '}
              <b style={{textDecoration: 'line-through'}}>
                {props?.event?.removedDescription}
              </b>
            </span>
          );
        }
        return "updated merge request title & description"
    }

    if (props.event.eventName == "ADDED_REVIEWER") {
        const reviwerFullName = `${upcaseFirst(props?.event?.reviewerRequest?.requestedReviewerUser?.firstName ?? "")} ${upcaseFirst(props?.event?.reviewerRequest?.requestedReviewerUser?.lastName ?? "")}`
        return (
          <span>
            {'added '}
            <b>
              {reviwerFullName}
            </b>
            {' as a reviewer'}
          </span>

        );
    }
    return props.event.eventName;
  }, [props.event, props.mergeRequest?.branchState?.name]);

  const timeAgo = useMemo(() => new TimeAgo("en-US"), []);

  const elapsedTime = useMemo(() => {
    if (!props.event?.createdAt) {
      return "";
    }
    return timeAgo.format(new Date(props.event?.createdAt as string));
  }, [timeAgo, props.event?.createdAt]);

  const sentence = useMemo(() => {
    return <span>{userFullname} {action} {elapsedTime}</span>;
  }, [userFullname, action, elapsedTime]);

  return (
    <Container>
      <LeftColumn>
        <IconContainer>
          <Icon src={icon} />
        </IconContainer>
        {!props.isLast && <Line />}
      </LeftColumn>
      <RightColumn>
        <div style={{marginRight: 12}}>
          <UserProfilePhoto
            user={props.event?.performedByUser as User}
            size={36}
            offlinePhoto={null}
          />
        </div>
        <TitleColumn style={{ marginBottom: 24 }}>
          <Title style={{ marginBottom: 12, marginTop: 4 }}>{sentence}</Title>
        </TitleColumn>
      </RightColumn>
    </Container>
  );
};

export default React.memo(TimelineRow);
