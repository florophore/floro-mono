import React, {
  useMemo,
  useEffect
} from "react";
import styled from "@emotion/styled";
import { useTheme } from "@emotion/react";
import {
  Notification, useClearNotificationMutation,
} from "@floro/graphql-schemas/src/generated/main-client-graphql";
import TimeAgo from "javascript-time-ago";

import UserProfilePhoto from "@floro/storybook/stories/common-components/UserProfilePhoto";
import ColorPalette from "@floro/styles/ColorPalette";

import { Link } from "react-router-dom";

import {
  getPlainText,
} from "@floro/storybook/stories/design-system/RichTextEditor/plaintext-hooks";

import StorageGray from "@floro/common-assets/assets/images/icons/database.lighter.svg";
import StorageWhite from "@floro/common-assets/assets/images/icons/database.dark.svg";

import FeedGray from "@floro/common-assets/assets/images/icons/subscribe.lighter.svg";
import FeedWhite from "@floro/common-assets/assets/images/icons/subscribe.dark.svg";

import BookmarkGray from "@floro/common-assets/assets/images/icons/bookmark.lighter.svg";
import BookmarkWhite from "@floro/common-assets/assets/images/icons/bookmark.dark.svg";

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
import { useSession } from "../../../../session/session-context";

const Container = styled.div`
  width: 100%;
  max-width: 870px;
  border: 2px solid ${(props) => props.theme.colors.contrastTextLight};
  padding: 16px 8px;
  border-radius: 8px;
  margin-bottom: 32px;
  position: relative;
`;

const NotificationCircle = styled.div`
  height: 24px;
  width: 24px;
  background: ${ColorPalette.lightRed};
  border: 2px solid ${props => props.theme.colors.contrastText};
  border-radius: 50%;
  position: absolute;
  top: -8px;
  right: -8px;
  display: flex;
  justify-content: center;
  align-items: center;
`;

const TopContainer = styled.div`
  display: flex;
  flex-direction: row;
  align-items: flex-start;
`;

const LeftColumn = styled.div`
  width: 56px;
  display: flex;
  justify-content: center;
`;

const RightColumn = styled.div`
  flex-grow: 1;
  display: flex;
  max-width: calc(100% - 60px);
`;

const CommentDisplayBox = styled.div`
  border: 2px solid transparent;
  padding: 0px 4px 0px 4px;
  border-radius: 8px;
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
`;

const CommentDisplayInnerContainer = styled.div`
  flex-grow: 1;
  width: 100%;
`;

const MetaDataRow = styled.div`
  flex-grow: 1;
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
`;

const DateTitle = styled.h3`
  font-family: "MavenPro";
  font-weight: 400;
  font-size: 1rem;
  color: ${(props) => props.theme.colors.contrastTextLight};
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

const ActionIcon = styled.img`
  height: 20px;
  width: 20px;
`;

const FullIcon = styled.img`
  height: 100%;
  width: 100%;
`;

const MainUser = styled.span`
  color: ${(props) => props.theme.colors.contrastText};
  cursor: pointer;
  &:hover {
    color: ${props => props.theme.colors.linkColor};
  }
`;

const Title = styled.h1`
  font-family: "MavenPro";
  font-weight: 500;
  font-size: 1.2rem;
  color: ${(props) => props.theme.colors.contrastTextLight};
  margin-top: 2px;
  line-height: 1.4;
`;

const clampText = (str: string, size: number = 100) => {
    if (str.length > size) {
        return `${str.substring(0, size)}...`;
    }
    return str;
}

const upcaseFirst = (str: string) => {
  const rest = str.substring(1);
  return (str?.[0]?.toUpperCase() ?? "") + rest;
};

interface Props {
  notification: Notification;
}

const NotificationDisplay = (props: Props) => {
  const theme = useTheme();
  const { session } = useSession();

  const [clearNotificationMutation] = useClearNotificationMutation();

  useEffect(() => {
    let clearNotification = false;
    if (props.notification.eventName == "REPO_SUBSCRIPTION_CREATED") {
      clearNotification = true;
    }
    if (props.notification.eventName == "REPO_BOOKMARK_CREATED") {
      clearNotification = true;
    }
    if (props.notification.eventName == "ORG_INVITATION_CREATED") {
      clearNotification = true;
    }
    if (props.notification.eventName == "REPOSITORY_WRITE_ACCESS_GRANTED") {
      clearNotification = true;
    }

    if (clearNotification && !!props.notification?.id) {
      clearNotificationMutation({
        variables: {
          notificationId: props.notification.id
        }
      })
    }
  }, [props.notification]);

  const icon = useMemo(() => {
    if (props.notification.eventName == "REPO_ANNOUNCEMENT_REPLY_CREATED") {
      if (theme.name == "light") {
        return ConversationLight;
      }
      return ConversationDark;
    }

    if (props.notification.eventName == "REPO_SUBSCRIPTION_CREATED") {
      if (theme.name == "light") {
        return FeedGray;
      }
      return FeedWhite;
    }

    if (props.notification.eventName == "REPO_BOOKMARK_CREATED") {
      if (theme.name == "light") {
        return BookmarkGray;
      }
      return BookmarkWhite;
    }

    if (props.notification.eventName == "ORG_INVITATION_CREATED") {
      if (theme.name == "light") {
        return OrgMemberLight;
      }
      return OrgMemberDark;
    }

    if (props.notification.eventName == "REPOSITORY_WRITE_ACCESS_GRANTED") {
      if (theme.name == "light") {
        return StorageGray;
      }
      return StorageWhite;
    }

    if (props.notification.eventName == "MERGE_REQUEST_BRANCH_UPDATED") {
      if (theme.name == "light") {
        return CommitGray;
      }
      return CommitWhite;
    }

    if (props.notification.eventName == "REVIEWER_ADDED") {
      if (theme.name == "light") {
        return MergeRequestGray;
      }
      return MergeRequestWhite;
    }

    if (
      props.notification.eventName == "REVIEW_STATUS_ADDED" &&
      props?.notification?.reviewStatus?.approvalStatus == "approved"
    ) {
      return CircleCheckMarkLight;
    }
    if (
      props.notification.eventName == "REVIEW_STATUS_ADDED" &&
      props?.notification?.reviewStatus?.approvalStatus == "blocked"
    ) {
      return RedXCircle;
    }

    if (
      props.notification.eventName == "REVIEW_STATUS_CHANGED" &&
      props?.notification?.reviewStatus?.approvalStatus == "approved"
    ) {
      return CircleCheckMarkLight;
    }
    if (
      props.notification.eventName == "REVIEW_STATUS_CHANGED" &&
      props?.notification?.reviewStatus?.approvalStatus == "blocked"
    ) {
      return RedXCircle;
    }

    if (props.notification.eventName == "UPDATED_MERGE_REQUEST_INFO") {
      if (theme.name == "light") {
        return EditGray;
      }
      return EditWhite;
    }

    if (props?.notification?.eventName == "MERGE_REQUEST_CLOSED") {
      return TrashDark;
    }

    if (props?.notification?.eventName == "MERGE_REQUEST_MERGED") {
      return MergeWhite;
    }

    if (props.notification.eventName == "MERGE_REQUEST_COMMENT_ADDED") {
      if (theme.name == "light") {
        return ConversationLight;
      }
      return ConversationDark;
    }

    if (props.notification.eventName == "MERGE_REQUEST_COMMENT_REPLY_ADDED") {
      if (theme.name == "light") {
        return ConversationLight;
      }
      return ConversationDark;
    }

    return null;
  }, [theme.name, props.notification, props.notification.eventName]);

  const showFullIcon = useMemo(() => {
    if (props.notification.eventName == "REVIEW_STATUS_ADDED") {
      return true;
    }
    if (props.notification.eventName == "REVIEW_STATUS_CHANGED") {
      return true;
    }
    return false;
  }, [props.notification.eventName]);

  const timeAgo = useMemo(() => new TimeAgo("en-US"), []);

  const elapsedTime = useMemo(() => {
    if (!props.notification?.createdAt) {
      return "";
    }
    return timeAgo.format(new Date(props.notification?.createdAt as string));
  }, [timeAgo, props.notification?.createdAt]);

  const iconContainerBackground = useMemo(() => {
    if (props?.notification?.eventName == "MERGE_REQUEST_MERGED") {
      return theme.name == "light" ? ColorPalette.purple : ColorPalette.purple;
    }

    if (props?.notification?.eventName == "MERGE_REQUEST_CLOSED") {
      return theme.name == "light" ? ColorPalette.red : ColorPalette.lightRed;
    }

    return theme.name == "light"
      ? ColorPalette.lightGray
      : ColorPalette.mediumGray;
  }, [props?.notification?.eventName, theme?.name, session]);

  const firstName = useMemo(() => upcaseFirst(props.notification.performedByUser?.firstName ?? ""), [props.notification.performedByUser?.firstName]);
  const lastName = useMemo(() => upcaseFirst(props.notification.performedByUser?.lastName ?? ""), [props.notification.performedByUser?.lastName]);

  const userFullname = useMemo(() => {
    return (
      <Link to={`/user/@/${props.notification.performedByUser?.username}`}>
        <MainUser>
          {`${firstName} ${lastName}`}
        </MainUser>
      </Link>
    )
  }, [firstName, lastName, props.notification.performedByUser?.username]);

  const action = useMemo(() => {
    const repoName =
      props.notification?.repository?.repoType == "user_repo"
        ? `@${props?.notification?.repository?.user?.username}/${props?.notification?.repository?.name}`
        : `@${props?.notification?.repository?.organization?.handle}/${props?.notification?.repository?.name}`;
    const repoLink =
      props.notification?.repository?.repoType == "user_repo"
        ? `/repo/@/${props?.notification?.repository?.user?.username}/${props?.notification?.repository?.name}`
        : `/repo/@/${props?.notification?.repository?.organization?.handle}/${props?.notification?.repository?.name}`;
    const mergeRequestLink = `${repoLink}/mergerequests/${props?.notification?.mergeRequest?.id}`;
    const announcementLink = `${repoLink}/announcements/${props?.notification?.repoAnnouncement?.id}`;
    const orgLink = `/org/@/${props?.notification?.organization?.handle}`;
    const mergeRequestTitle = clampText(props?.notification?.mergeRequest?.title ?? "");
    const mergeRequestName = `[${props?.notification?.mergeRequest?.mergeRequestCount}] ${mergeRequestTitle}`

    if (props.notification.eventName == "REPO_ANNOUNCEMENT_REPLY_CREATED") {
        const plainText = getPlainText(props?.notification?.repoAnnouncement?.text ?? "");
        const clampedText = clampText(plainText);
        const repliedClampedText = clampText(props?.notification?.repoAnnouncementReply?.text ?? "");
        if (session?.user?.id == props?.notification?.repoAnnouncement?.createdByUser?.id) {
          return (
            <span>
              {"replied "}
              <i style={{color: theme.colors.contrastText}}>{repliedClampedText}</i>
              {" to your announcement "}
              <Link to={announcementLink}>
                <b style={{ color: theme.colors.linkColor }}>{clampedText}</b>
              </Link>
              {" for repository "}
              <Link to={repoLink}>
                <b style={{ color: theme.colors.linkColor }}>{repoName}</b>
              </Link>
            </span>
          );
        }
        return (
          <span>
            {"replied "}
            <i style={{color: theme.colors.contrastText}}>{repliedClampedText}</i>
            {" to announcement "}
            <Link to={announcementLink}>
              <b style={{ color: theme.colors.linkColor }}>{clampedText}</b>
            </Link>
            {" for repository "}
            <Link to={repoLink}>
              <b style={{ color: theme.colors.linkColor }}>{repoName}</b>
            </Link>
          </span>
        );
    }
    if (props.notification.eventName == "REPO_SUBSCRIPTION_CREATED") {
        return (
          <span>
            {"subscribed to your repository "}
            <Link to={repoLink}>
              <b style={{ color: theme.colors.linkColor }}>{repoName}</b>
            </Link>
          </span>
        );
    }

    if (props.notification.eventName == "REPO_BOOKMARK_CREATED") {
        return (
          <span>
            {"bookmarked your repository "}
            <Link to={repoLink}>
              <b style={{ color: theme.colors.linkColor }}>{repoName}</b>
            </Link>
          </span>
        );
    }

    if (props.notification.eventName == "ORG_INVITATION_CREATED") {
        return (
          <span>
            {"invited you to join "}
            <Link to={orgLink}>
              <b style={{ color: theme.colors.linkColor }}>{props.notification?.organization?.name}</b>
            </Link>
          </span>
        );
    }

    if (props.notification.eventName == "REPOSITORY_WRITE_ACCESS_GRANTED") {
        return (
          <span>
            {"granted you write access to the repository "}
            <Link to={repoLink}>
              <b style={{ color: theme.colors.linkColor }}>{repoName}</b>
            </Link>
          </span>
        );
    }

    if (props.notification.eventName == "MERGE_REQUEST_BRANCH_UPDATED") {
        return (
          <span>
            {"updated merge request "}
            <Link to={mergeRequestLink}>
              <b style={{ color: theme.colors.linkColor }}>{mergeRequestName}</b>
            </Link>
            {" for repository "}
            <Link to={repoLink}>
              <b style={{ color: theme.colors.linkColor }}>{repoName}</b>
            </Link>
          </span>
        );
    }

    if (props.notification.eventName == "REVIEWER_ADDED") {
        return (
          <span>
            {"added you as a reviewer to merge request "}
            <Link to={mergeRequestLink}>
              <b style={{ color: theme.colors.linkColor }}>{mergeRequestName}</b>
            </Link>
            {" for repository "}
            <Link to={repoLink}>
              <b style={{ color: theme.colors.linkColor }}>{repoName}</b>
            </Link>
          </span>
        );
    }

    if (
      props.notification.eventName == "REVIEW_STATUS_ADDED" &&
      props?.notification?.reviewStatus?.approvalStatus == "approved"
    ) {
        return (
          <span>
            {"approved merge request "}
            <Link to={mergeRequestLink}>
              <b style={{ color: theme.colors.linkColor }}>{mergeRequestName}</b>
            </Link>
            {" for repository "}
            <Link to={repoLink}>
              <b style={{ color: theme.colors.linkColor }}>{repoName}</b>
            </Link>
          </span>
        );
    }
    if (
      props.notification.eventName == "REVIEW_STATUS_ADDED" &&
      props?.notification?.reviewStatus?.approvalStatus == "blocked"
    ) {
        return (
          <span>
            {"blocked merge request "}
            <Link to={mergeRequestLink}>
              <b style={{ color: theme.colors.linkColor }}>{mergeRequestName}</b>
            </Link>
            {" for repository "}
            <Link to={repoLink}>
              <b style={{ color: theme.colors.linkColor }}>{repoName}</b>
            </Link>
          </span>
        );
    }

    if (
      props.notification.eventName == "REVIEW_STATUS_CHANGED" &&
      props?.notification?.reviewStatus?.approvalStatus == "approved"
    ) {
        return (
          <span>
            {"updated review to approved for merge request "}
            <Link to={mergeRequestLink}>
              <b style={{ color: theme.colors.linkColor }}>{mergeRequestName}</b>
            </Link>
            {" for repository "}
            <Link to={repoLink}>
              <b style={{ color: theme.colors.linkColor }}>{repoName}</b>
            </Link>
          </span>
        );
    }
    if (
      props.notification.eventName == "REVIEW_STATUS_CHANGED" &&
      props?.notification?.reviewStatus?.approvalStatus == "blocked"
    ) {
        return (
          <span>
            {"updated review to blocked for merge request "}
            <Link to={mergeRequestLink}>
              <b style={{ color: theme.colors.linkColor }}>{mergeRequestName}</b>
            </Link>
            {" for repository "}
            <Link to={repoLink}>
              <b style={{ color: theme.colors.linkColor }}>{repoName}</b>
            </Link>
          </span>
        );
    }

    if (props?.notification?.eventName == "MERGE_REQUEST_CLOSED") {
        return (
          <span>
            {"closed merge request "}
            <Link to={mergeRequestLink}>
              <b style={{ color: theme.colors.linkColor }}>{mergeRequestName}</b>
            </Link>
            {" for repository "}
            <Link to={repoLink}>
              <b style={{ color: theme.colors.linkColor }}>{repoName}</b>
            </Link>
          </span>
        );
    }

    if (props?.notification?.eventName == "MERGE_REQUEST_MERGED") {
        return (
          <span>
            {"merged merge request "}
            <Link to={mergeRequestLink}>
              <b style={{ color: theme.colors.linkColor }}>{mergeRequestName}</b>
            </Link>
            {" for repository "}
            <Link to={repoLink}>
              <b style={{ color: theme.colors.linkColor }}>{repoName}</b>
            </Link>
          </span>
        );
    }

    if (props.notification.eventName == "MERGE_REQUEST_COMMENT_ADDED") {
        const clampedText = clampText(props?.notification?.mergeRequestComment?.text ?? "");
        return (
          <span>
            {"commented on merge request "}
            <Link to={mergeRequestLink}>
              <b style={{ color: theme.colors.linkColor }}>{mergeRequestName}</b>
            </Link>
            <i style={{color: theme.colors.contrastText}}>{" " + clampedText}</i>
            {" for repository "}
            <Link to={repoLink}>
              <b style={{ color: theme.colors.linkColor }}>{repoName}</b>
            </Link>
          </span>
        );
    }

    if (props.notification.eventName == "MERGE_REQUEST_COMMENT_REPLY_ADDED") {
        const clampedText = clampText(props?.notification?.mergeRequestComment?.text ?? "");
        const repliedClampedText = clampText(props?.notification?.mergeRequestCommentReply?.text ?? "");
        return (
          <span>
            {"replied "}
            <i style={{color: theme.colors.contrastText}}>{repliedClampedText}</i>
            {"to your comment"}
            <i style={{color: theme.colors.contrastText}}>{" " + clampedText}</i>
            {"on merge request "}
            <Link to={mergeRequestLink}>
              <b style={{ color: theme.colors.linkColor }}>{mergeRequestName}</b>
            </Link>
            {" for repository "}
            <Link to={repoLink}>
              <b style={{ color: theme.colors.linkColor }}>{repoName}</b>
            </Link>
          </span>
        );
    }
    return null;
  }, [theme, props.notification]);

  const sentence = useMemo(() => {
    return <span>{userFullname} {action}</span>;
  }, [userFullname, action]);

  return (
    <Container>
      <TopContainer>
        <LeftColumn>
          <div style={{ marginLeft: 0 }}>
            <UserProfilePhoto
              user={props?.notification?.performedByUser}
              offlinePhoto={null}
              size={40}
            />
          </div>
        </LeftColumn>
        <RightColumn style={{ flexGrow: 1, paddingTop: 4 }}>
          <CommentDisplayBox style={{ flexGrow: 1 }}>
            <CommentDisplayInnerContainer>
              <MetaDataRow>
                <div style={{ display: 'flex', flexDirection: 'row', maxWidth: 'calc(100% - 120px)'}}>
                    <div>
                        <IconContainer style={{ background: iconContainerBackground, marginRight: 8 }}>
                        {!showFullIcon && icon && <ActionIcon src={icon} />}
                        {showFullIcon && icon && <FullIcon src={icon} />}
                    </IconContainer>
                    </div>
                    <Title style={{}}>
                        {sentence}
                    </Title>
                </div>
                <DateTitle style={{alignSelf: 'flex-start'}}>{elapsedTime}</DateTitle>
              </MetaDataRow>
            </CommentDisplayInnerContainer>
          </CommentDisplayBox>
        </RightColumn>
      </TopContainer>
      {!props.notification.hasBeenChecked && (
        <NotificationCircle/>
      )}
    </Container>
  );
};

export default React.memo(NotificationDisplay);
