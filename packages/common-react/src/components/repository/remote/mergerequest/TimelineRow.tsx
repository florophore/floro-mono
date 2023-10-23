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
import MergeWhite from "@floro/common-assets/assets/images/repo_icons/merge.white.svg";

import ConversationLight from "@floro/common-assets/assets/images/icons/conversation.light.svg";
import ConversationDark from "@floro/common-assets/assets/images/icons/conversation.dark.svg";

import TrashLight from "@floro/common-assets/assets/images/icons/trash.light.darker.svg";
import TrashDark from "@floro/common-assets/assets/images/icons/trash.dark.svg";

import EditWhite from "@floro/common-assets/assets/images/icons/edit.dark.svg";
import EditGray from "@floro/common-assets/assets/images/icons/edit.light.svg";

import OrgMemberLight from "@floro/common-assets/assets/images/icons/members.light.svg";
import OrgMemberDark from "@floro/common-assets/assets/images/icons/members.dark.svg";

import CircleCheckMarkLight from "@floro/common-assets/assets/images/icons/teal_check_mark_circle.light.svg";
import RedXCircle from "@floro/common-assets/assets/images/icons/red_x_circle.dark.svg";

import en from "javascript-time-ago/locale/en";
import ColorPalette from "@floro/styles/ColorPalette";
import InitialProfileDefault from "@floro/storybook/stories/common-components/InitialProfileDefault";
import UserProfilePhoto from "@floro/storybook/stories/common-components/UserProfilePhoto";
import { useRepoLinkBase } from "../hooks/remote-hooks";
import { Link } from "react-router-dom";

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

const FullIcon = styled.img`
  height: 100%;
  width: 100%;
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

const MainUser = styled.span`
  cursor: pointer;
  &:hover {
    color: ${props => props.theme.colors.linkColor};
  }
`;

const BoldLink = styled.b`
  cursor: pointer;
  &:hover {
    color: ${props => props.theme.colors.linkColor};
  }
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

  const linkBase = useRepoLinkBase(props.repository, "home");
  const homeLink = useMemo(() => {
    return linkBase + "?from=remote"
  }, [linkBase]);

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

    if (props.event.eventName == "ADDED_COMMENT") {
      if (theme.name == "light") {
        return ConversationLight;
      }
      return ConversationDark;
    }

    if (props.event.eventName == "ADDED_COMMENT_REPLY") {
      if (theme.name == "light") {
        return ConversationLight;
      }
      return ConversationDark;
    }

    if (props.event.eventName == "UPDATED_COMMENT") {
      if (theme.name == "light") {
        return ConversationLight;
      }
      return ConversationDark;
    }

    if (props.event.eventName == "UPDATED_COMMENT_REPLY") {
      if (theme.name == "light") {
        return ConversationLight;
      }
      return ConversationDark;
    }

    if (props.event.eventName == "DELETED_COMMENT") {
      if (theme.name == "light") {
        return TrashLight;
      }
      return TrashDark;
    }

    if (props.event.eventName == "DELETED_COMMENT_REPLY") {
      if (theme.name == "light") {
        return TrashLight;
      }
      return TrashDark;
    }

    if (props.event.eventName == "ADDED_REVIEWER") {
      if (theme.name == "light") {
        return OrgMemberLight;
      }
      return OrgMemberDark;
    }

    if (props.event.eventName == "ADDED_REVIEW_STATUS" && props?.event?.subeventName == "approved") {
      return CircleCheckMarkLight;
    }
    if (props.event.eventName == "ADDED_REVIEW_STATUS" && props?.event?.subeventName == "blocked") {
      return RedXCircle;
    }

    if (props?.event?.eventName == "DELETED_REVIEW_STATUS") {
      if (theme.name == "light") {
        return TrashLight;
      }
      return TrashDark;
    }

    if (props?.event?.eventName == "CLOSED_MERGE_REQUEST") {
      return TrashDark;
    }

    if (props?.event?.eventName == "MERGED_MERGE_REQUEST") {
      return MergeWhite;
    }

    if (theme.name == "light") {
      return CommitGray;
    }
    return CommitWhite;
  }, [theme.name, props.event.eventName]);


  const showFullIcon = useMemo(() => {
    if (props.event.eventName == "ADDED_REVIEW_STATUS") {
      return true;
    }
    return false;
  }, [props.event]);

  const firstName = useMemo(() => upcaseFirst(props.event.performedByUser?.firstName ?? ""), [props.event.performedByUser?.firstName]);
  const lastName = useMemo(() => upcaseFirst(props.event.performedByUser?.lastName ?? ""), [props.event.performedByUser?.lastName]);

  const userFullname = useMemo(() => {
    return (
      <Link to={`/user/@/${props.event.performedByUser?.username}`}>
        <MainUser>
          {`${firstName} ${lastName}`}
        </MainUser>
      </Link>
    )
  }, [firstName, lastName, props.event.performedByUser?.username]);

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
          {' '}
          <Link to={homeLink + "&sha=" + props.event.branchHeadShaAtEvent}>
            <b style={{color: theme.colors.linkColor}}>
              {`(${props.event.branchHeadShaAtEvent?.substring(0, 6)})`}
            </b>
          </Link>
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
          <Link to={homeLink + "&sha=" + props.event.branchHeadShaAtEvent}>
            <b style={{color: theme.colors.linkColor}}>
              {`(${props.event.branchHeadShaAtEvent?.substring(0, 6)})`}
            </b>
          </Link>
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
            <Link to={`/user/@/${props?.event?.reviewerRequest?.requestedReviewerUser?.username}`}>
              <BoldLink>
                {reviwerFullName}
              </BoldLink>
            </Link>
            {' as a reviewer'}
          </span>
        );
    }

    if (props.event.eventName == "ADDED_REVIEW_STATUS" && props?.event?.subeventName == "approved") {
        return (
          <span>
            <b>
              {'Approved'}
            </b>
            {' merge request for '}
            <Link to={homeLink + "&sha=" + props.event.branchHeadShaAtEvent}>
              <b style={{color: theme.colors.linkColor}}>
              {`(${props.event.branchHeadShaAtEvent?.substring(0, 6)})`}
              </b>
            </Link>
          </span>
        );
    }

    if (props.event.eventName == "ADDED_REVIEW_STATUS" && props?.event?.subeventName == "blocked") {
        return (
          <span>
            <b>
              {'Blocked'}
            </b>
            {' merge request for '}
            <Link to={homeLink + "&sha=" + props.event.branchHeadShaAtEvent}>
              <b style={{color: theme.colors.linkColor}}>
              {`(${props.event.branchHeadShaAtEvent?.substring(0, 6)})`}
              </b>
            </Link>
          </span>
        );
    }
    if (props.event.eventName == 'DELETED_REVIEW_STATUS') {
        return (
          <span>
            {'removed review for '}
            <Link to={homeLink + "&sha=" + props.event.branchHeadShaAtEvent}>
              <b style={{color: theme.colors.linkColor}}>
              {`(${props.event.branchHeadShaAtEvent?.substring(0, 6)})`}
              </b>
            </Link>
          </span>
        );

    }

    if (props.event.eventName == 'CLOSED_MERGE_REQUEST') {
        return (
          <span>
            {`closed merge request [${props?.mergeRequest?.mergeRequestCount}] `}
          </span>
        );
    }

    if (props.event.eventName == 'MERGED_MERGE_REQUEST') {
        return (
          <span>
            {'merged '}
            <Link to={homeLink + "&sha=" + props.event.branchHeadShaAtEvent}>
              <b style={{color: theme.colors.linkColor}}>
                {`(${props.event.branchHeadShaAtEvent?.substring(0, 6)})`}
              </b>
            </Link>
            {' into '}
            <b>
              {`${props.mergeRequest?.branchState?.baseBranchName} `}
            </b>
            <Link to={homeLink + "&sha=" + props.event.mergeSha}>
              <b style={{color: theme.colors.linkColor}}>
              {`(${props.event.mergeSha?.substring(0, 6)})`}
              </b>
            </Link>
            {` and closed merge request [${props?.mergeRequest?.mergeRequestCount}] `}
          </span>
        );
    }

    if (props.event.eventName == "ADDED_COMMENT") {
      return "added a comment"
    }
    if (props.event.eventName == "ADDED_COMMENT_REPLY") {
      return "replied to a comment"
    }

    if (props.event.eventName == "UPDATED_COMMENT") {
      return "updated their comment"
    }

    if (props.event.eventName == "UPDATED_COMMENT_REPLY") {
      return "updated their reply"
    }

    if (props.event.eventName == "DELETED_COMMENT") {
      return "deleted their comment"
    }

    if (props.event.eventName == "DELETED_COMMENT_REPLY") {
      return "deleted their reply"
    }
    return props.event.eventName;
  }, [props.event, props.mergeRequest?.branchState?.name, theme]);

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

  const iconContainerBackground = useMemo(() => {
    if (props?.event?.eventName == "MERGED_MERGE_REQUEST") {
      return theme.name == "light" ? ColorPalette.purple: ColorPalette.purple;
    }

    if (props?.event?.eventName == "CLOSED_MERGE_REQUEST") {
      return theme.name == "light" ? ColorPalette.red: ColorPalette.lightRed;
    }

    return theme.name == "light" ? ColorPalette.lightGray : ColorPalette.mediumGray
  }, [props?.event?.eventName, theme?.name])

  return (
    <Container>
      <LeftColumn>
        <IconContainer style={{background: iconContainerBackground}}>
          {!showFullIcon && (
            <Icon src={icon} />
          )}
          {showFullIcon && (
            <FullIcon src={icon} />
          )}
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
