import React, { useMemo, useCallback } from "react";
import styled from "@emotion/styled";
import { useTheme } from "@emotion/react";
import {
  MergeRequest,
  MergeRequestComment,
  MergeRequestCommentReply,
  RepoAnnouncement,
  RepoAnnouncementReply,
  Repository,
  useDeleteMergeRequestCommentReplyMutation,
  useDeleteRepoAnnouncementReplyMutation,
} from "@floro/graphql-schemas/src/generated/main-client-graphql";
import { Manifest } from "floro/dist/src/plugins";
import TimeAgo from "javascript-time-ago";
import CommitWhite from "@floro/common-assets/assets/images/repo_icons/commit.white.svg";

import UserProfilePhoto from "@floro/storybook/stories/common-components/UserProfilePhoto";
import ColorPalette from "@floro/styles/ColorPalette";

import EditIconLight from "@floro/common-assets/assets/images/icons/edit.light.darker.svg";
import EditIconDark from "@floro/common-assets/assets/images/icons/edit.dark.svg";

import TrashIconLight from "@floro/common-assets/assets/images/icons/trash.light.svg";
import TrashIconDark from "@floro/common-assets/assets/images/icons/trash.dark.svg";
import DotsLoader from "@floro/storybook/stories/design-system/DotsLoader";
import { Link } from "react-router-dom";
import { useSession } from "../../session/session-context";
import Linkify from "linkify-react";
import { useOpenLink } from "../../links/OpenLinkContext";


const TopContainer = styled.div`
  margin-top: 12px;
  margin-bottom: 12px;
  display: flex;
  flex-direction: row;
`;

const LeftColumn = styled.div`
  width: 56px;
  display: flex;
  justify-content: center;
`;

const RightColumn = styled.div`
  flex-grow: 1;
  display: flex;
`;

const CommentDisplayBox = styled.div`
  border: 2px solid ${(props) => props.theme.colors.inputBorderColor};
  background: ${(props) =>
    props.theme.name == "light"
      ? ColorPalette.lightGray
      : ColorPalette.mediumGray};
  padding: 0px 4px 4px 4px;
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
  height: 40px;
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
`;

const MetaDataControlRow = styled.div`
  display: flex;
  height: 40px;
  flex-direction: row;
  align-items: center;
`;

const MetaDataIconRow = styled.div`
  display: flex;
  height: 40px;
  flex-direction: row;
  align-items: center;
`;

const EdittingText = styled.span`
  font-family: "MavenPro";
  font-weight: 500;
  font-size: 1rem;
  font-style: italic;
  color: ${(props) => props.theme.colors.contrastTextLight};
`;

const AuthorTitle = styled.h3`
  font-family: "MavenPro";
  font-weight: 600;
  font-size: 1.2rem;
  color: ${(props) => props.theme.colors.contrastText};
  &:hover {
    color: ${(props) => props.theme.colors.linkColor};
  }
`;

const DateTitle = styled.h3`
  font-family: "MavenPro";
  font-weight: 400;
  font-size: 1rem;
  color: ${(props) => props.theme.colors.contrastTextLight};
`;
const MainText = styled.p`
  font-family: "MavenPro";
  font-weight: 400;
  font-size: 1.2rem;
  color: ${(props) => props.theme.colors.contrastText};
  white-space: pre-wrap;
`;

const Icon = styled.img`
  height: 20px;
  width: 20px;
  cursor: pointer;
`;

const upcaseFirst = (str: string) => {
  const rest = str.substring(1);
  return (str?.[0]?.toUpperCase() ?? "") + rest;
};

interface Props {
  repoAnnouncement: RepoAnnouncement;
  reply: RepoAnnouncementReply;
  isEdittingReply: boolean;
  isInEditMode: boolean;
  onEditReply: (reply: RepoAnnouncementReply) => void;
  onHideEdit: () => void;
}

const CommentReply = (props: Props) => {
  const theme = useTheme();
  const { session } = useSession();
  const openLink = useOpenLink();

  const firstName = useMemo(
    () => upcaseFirst(props.reply?.user?.firstName ?? ""),
    [props.reply?.user?.firstName]
  );
  const lastName = useMemo(
    () => upcaseFirst(props.reply?.user?.lastName ?? ""),
    [props.reply?.user?.lastName]
  );
  const [deleteReply, deleteReplyMutation] =
    useDeleteRepoAnnouncementReplyMutation();

  const onEdit = useCallback(() => {
    props.onEditReply(props.reply);
  }, [props.reply, props.onEditReply]);

  const onDelete = useCallback(() => {
    if (
      !props?.repoAnnouncement?.repository?.id ||
      !props?.repoAnnouncement?.id ||
      !props?.reply?.id
    ) {
      return;
    }
    deleteReply({
      variables: {
        repositoryId: props?.repoAnnouncement.repository?.id,
        repoAnnouncementId: props?.repoAnnouncement?.id,
        repoAnnouncementReplyId: props?.reply?.id,
      },
    });
  }, [
    props?.repoAnnouncement.repository,
    props?.repoAnnouncement,
    !props?.reply?.id,
  ]);

  const userFullname = useMemo(() => {
    return `${firstName} ${lastName}`;
  }, [firstName, lastName]);

  const timeAgo = useMemo(() => new TimeAgo("en-US"), []);

  const loaderColor = useMemo(() => {
    if (theme.name == "light") {
      return "mediumGray";
    }
    return "white";
  }, [theme.name]);

  const showIcons = useMemo(() => {
    return false;
  }, []);

  const elapsedTime = useMemo(() => {
    if (!props.reply?.createdAt) {
      return "";
    }
    return timeAgo.format(new Date(props.reply?.createdAt as string));
  }, [timeAgo, props.reply?.createdAt]);

  const trashIcon = useMemo(() => {
    if (theme.name == "light") {
      return TrashIconLight;
    }
    return TrashIconDark;
  }, [theme.name]);

  const editIcon = useMemo(() => {
    if (theme.name == "light") {
      return EditIconLight;
    }
    return EditIconDark;
  }, [theme.name]);

  const renderLink = useCallback(({ attributes, content }) => {
    const { href, ...props } = attributes;
    const onClick= (e) => {
      e.preventDefault();
      openLink(href);
    }
    return <a style={{color: theme.colors.linkColor}} onClick={onClick} {...props}>{content}</a>;
  }, [openLink]);


  return (
    <TopContainer>
      <LeftColumn>
        <div style={{ marginLeft: -8 }}>
          <UserProfilePhoto
            user={props.reply?.user}
            offlinePhoto={null}
            size={40}
          />
        </div>
      </LeftColumn>
      <RightColumn style={{ flexGrow: 1 }}>
        <CommentDisplayBox style={{ flexGrow: 1 }}>
          <CommentDisplayInnerContainer>
            <MetaDataRow>
              <MetaDataControlRow style={{ marginRight: 12 }}>
                <Link to={`/user/@/${props.reply.user?.username}`}>
                  <AuthorTitle>{userFullname}</AuthorTitle>
                </Link>
                {session?.user?.id == props.reply?.user?.id && (
                  <>
                    {!props.isInEditMode && !deleteReplyMutation.loading && (
                      <MetaDataIconRow style={{ marginLeft: 12 }}>
                        <Icon onClick={onEdit} src={editIcon} />
                        <Icon
                          onClick={onDelete}
                          style={{ marginLeft: 12 }}
                          src={trashIcon}
                        />
                      </MetaDataIconRow>
                    )}
                    {deleteReplyMutation.loading && (
                      <MetaDataIconRow style={{ marginLeft: 12 }}>
                        <DotsLoader size="small" color={loaderColor} />
                      </MetaDataIconRow>
                    )}
                    {props.isEdittingReply && !deleteReplyMutation.loading && (
                      <MetaDataIconRow style={{ marginLeft: 12 }}>
                        <EdittingText>{"editting"}</EdittingText>
                      </MetaDataIconRow>
                    )}
                  </>
                )}
              </MetaDataControlRow>
              <DateTitle>{elapsedTime}</DateTitle>
            </MetaDataRow>
            <MainText>
              <Linkify options={{render: renderLink}}>{props.reply.text}</Linkify>
            </MainText>
          </CommentDisplayInnerContainer>
        </CommentDisplayBox>
      </RightColumn>
    </TopContainer>
  );
};

export default React.memo(CommentReply);
