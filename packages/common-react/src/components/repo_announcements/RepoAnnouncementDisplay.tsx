import React, { useMemo, useCallback, useEffect, useRef, useState } from "react";
import styled from "@emotion/styled";
import { useTheme } from "@emotion/react";
import {
  Organization,
  RepoAnnouncement,
  RepoAnnouncementReply,
  useCreateRepoAnnouncementReplyMutation,
  useDeleteRepoAnnouncementMutation,
  useRepoAnnouncementUpdatesSubscription,
  useUpdateRepoAnnouncementMutation,
  RepoAnnouncementFragmentDoc
} from "@floro/graphql-schemas/src/generated/main-client-graphql";
import TimeAgo from "javascript-time-ago";

import UserProfilePhoto from "@floro/storybook/stories/common-components/UserProfilePhoto";
import Button from "@floro/storybook/stories/design-system/Button";
import ColorPalette from "@floro/styles/ColorPalette";

import EditIconLight from "@floro/common-assets/assets/images/icons/edit.light.darker.svg";
import EditIconDark from "@floro/common-assets/assets/images/icons/edit.dark.svg";
import { Link } from "react-router-dom";

import TrashIconLight from "@floro/common-assets/assets/images/icons/trash.light.svg"
import TrashIconDark from "@floro/common-assets/assets/images/icons/trash.dark.svg";
import DotsLoader from "@floro/storybook/stories/design-system/DotsLoader";
import { useSession } from "../../session/session-context";
import OrgProfilePhoto from "@floro/storybook/stories/common-components/OrgProfilePhoto";
import RichTextEditor from "@floro/storybook/stories/design-system/RichTextEditor";
import { StaticLinkNode, TextRenderers, renderers, useRichText } from "@floro/storybook/stories/design-system/RichTextEditor/richtext-hooks";
import CommentReply from "./CommentReply";
import EditReply from "./EditReply";
import { useFragment } from "@apollo/client";
import { useOpenLink } from "../../links/OpenLinkContext";
import uEmojiParser from 'universal-emoji-parser'

const Container = styled.div`
  width: 100%;
  max-width: 870px;
  border: 2px solid ${(props) => props.theme.colors.contrastTextLight};
  padding: 16px 8px;
  border-radius: 8px;
  margin-bottom: 32px;
  user-select: text;
`;

const TopContainer = styled.div`
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

const CommentBox = styled.div`
  border: 2px solid ${(props) => props.theme.colors.contrastTextLight};
  padding: 8px;
  border-radius: 8px;
  margin-left: 56px;
  margin-top: 12px;
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
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
`

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

const Icon = styled.img`
  height: 20px;
  width: 20px;
  cursor: pointer;
`;

const DateTitle = styled.h3`
  font-family: "MavenPro";
  font-weight: 400;
  font-size: 1rem;
  color: ${(props) => props.theme.colors.contrastTextLight};
`;

const MainText = styled.div`
  font-family: "MavenPro";
  font-weight: 400;
  font-size: 1.2rem;
  color: ${(props) => props.theme.colors.contrastText};
  white-space: pre-wrap;
  margin-top: 16px;
  margin-bottom: 16px;
`;

const GrowCommentContainer = styled.div`
  flex-grow: 1;
  overflow: scroll;
`;

const GrowWrap = styled.div`
  display: grid;
  margin-bottom: 6px;
  &:after {
    content: attr(data-replicated-value) " ";
    white-space: pre-wrap;
    border: 0;

    font: inherit;
    /* Place on top of each other */
    grid-area: 1 / 1 / 2 / 2;
    padding: 0px;
    margin-right: 12px;

    color: ${props => props.theme.colors.contrastText};
    font-size: 1.2rem;
    font-family: "MavenPro";
    font-weight: 400;
    pointer-events: none;
    outline: none;
    padding: 4px;
  }
`;

const TextArea = styled.textarea`
  resize: none;
  overflow: hidden;
  font: inherit;

  border: 0;
  /* Place on top of each other */
  grid-area: 1 / 1 / 2 / 2;
  padding: 0px;
  margin-right: 12px;

  color: ${props => props.theme.colors.contrastText};
  font-size: 1.2rem;
  font-family: "MavenPro";
  font-weight: 400;
  outline: none;
  padding: 4px;
  background: none;
`;

const Wrapper = styled.div`
  position: relative;
  border-radius: 8px;
  font-size: 1.4rem;

  sup {
    line-height: 0;
  }
  sub {
    line-height: 0;
  }
  ol {
    padding-top: 0;
    padding-bottom: 0;
    margin-top: 0;
    margin-bottom: 0;
    list-style: decimal;
    padding-left: 40px;
  }
  ul {
    padding-top: 12px;
    padding-bottom: 0;
    margin-top: 0;
    margin-bottom: 0;
    list-style: disc;
    padding-left: 40px;
  }
  span.sup {
    font-size: smaller;
    vertical-align: super;
    line-height: 0;
  }
  span.sub {
    font-size: smaller;
    vertical-align: sub;
    line-height: 0;
  }

  li {
    line-height: 1.5;
    .sup {
      line-height: 0;
      vertical-align: super;
    }
    .sub {
      line-height: 0;
      vertical-align: sub;
    }
  }
`;

interface Props {
  repoAnnouncement: RepoAnnouncement;
  maxHeight?: number;
  onDelete?: (repoAnnouncement: RepoAnnouncement) => void;
}

const RepoAnnouncementDisplay = (props: Props) => {

  const repoAnnouncementDoc = useFragment({
    fragment: RepoAnnouncementFragmentDoc,
    fragmentName: 'RepoAnnouncement',
    from: {
      id: props?.repoAnnouncement?.id,
      __typename: 'RepoAnnouncement'
    }
  });

  const repoAnnouncement = useMemo(
    () => repoAnnouncementDoc?.data as RepoAnnouncement,
    [repoAnnouncementDoc?.data]
  );


  const theme = useTheme();
  const { session } = useSession();
  const [text, setText] = useState("");
  const [editText, setEditText] = useState(repoAnnouncement?.text ?? "");

  const growWrap = useRef<HTMLDivElement>(null);
  const growTextarea = useRef<HTMLTextAreaElement>(null);

  const [showEditComment, setShowEditComment] = useState<boolean>(false);
  const [showEditReply, setShowEditReply] = useState<boolean>(false);
  const [edittingReply, setEdittingReply] = useState<RepoAnnouncementReply|null>(null);

  const openLink = useOpenLink();

  const renderLinkNode = useCallback((
    node: StaticLinkNode,
    renderers: TextRenderers
  ): React.ReactElement => {

    const onClickLink = (e: React.MouseEvent<HTMLAnchorElement>) => {
        e.preventDefault();
        openLink(node.href);
    }

    let children = renderers.renderStaticNodes(node.children, renderers);
    const lineBreaks = node.content.split("\n");
    const breakContent = lineBreaks.map((c, i) => (
        <React.Fragment key={i}>
        {c}
        {lineBreaks.length -1 != i && (
            <br/>
        )}
        </React.Fragment>
    ));
    let content = (
        <>
        {breakContent}
        {children}
        </>
    );
    if (node.styles.isBold) {
        content = <b>{content}</b>;
    }
    if (node.styles.isItalic) {
        content = <i>{content}</i>;
    }
    if (node.styles.isUnderlined) {
        content = <u>{content}</u>;
    }
    if (node.styles.isStrikethrough) {
        content = <s>{content}</s>;
    }
    if (node.styles.isSuperscript) {
        content = <sup>{content}</sup>;
    }
    if (node.styles.isSubscript) {
        content = <sub>{content}</sub>;
    }
    return (
      <a style={{color: theme.colors.linkColor}} href={node.href} onClick={onClickLink}>
        {content}
        {children}
      </a>
    );
  }, [theme.colors, openLink]);

  const textRenderers = useMemo(() => {
    return {
        ...renderers,
        renderLinkNode
    }
  }, [renderers, renderLinkNode])

  const richText = useRichText(repoAnnouncement.text ?? "", textRenderers)

  useRepoAnnouncementUpdatesSubscription({
    variables: {
        repoAnnouncementId: repoAnnouncement.id
    }
  });

  const [ updateAnnouncement, updateAnnouncementRequest] = useUpdateRepoAnnouncementMutation();
  const [ deleteAnnouncement, deleteAnnouncementRequest] = useDeleteRepoAnnouncementMutation();

  const onUpdate = useCallback(() => {
    if (!repoAnnouncement.id || !repoAnnouncement.repository?.id) {
      return;
    }
    updateAnnouncement({
      variables: {
        repositoryId: repoAnnouncement.repository.id,
        repoAnnouncementId: repoAnnouncement.id,
        text: editText,
      },
    });
  }, [editText]);

  useEffect(() => {
    if (updateAnnouncementRequest?.data?.updateRepoAnnouncementComment?.__typename == "UpdateRepoAnnouncementSuccess") {
        setShowEditComment(false);
    }

  }, [updateAnnouncementRequest?.data])

  const onEditComment = useCallback(() => {
    setShowEditComment(true);
    setEditText(repoAnnouncement?.text ?? "")
  }, [repoAnnouncement.text])

  const onHideEditComment = useCallback(() => {
    setShowEditComment(false);
    setEditText(repoAnnouncement?.text ?? "")
  }, [repoAnnouncement.text])

  const onEditReply = useCallback((reply: RepoAnnouncementReply) => {
    setShowEditReply(true);
    setEdittingReply(reply);
  }, []);

  const onHideEditReply = useCallback(() => {
    setShowEditReply(false);
    setEdittingReply(null);
  }, []);

  const showCommentControls = useMemo(() => {
    if (showEditComment || showEditReply) {
      return false;
    }
    return repoAnnouncement?.repository?.repoPermissions?.canWriteAnnouncements;
  }, [showEditComment, showEditReply, session, repoAnnouncement]);

  const [reply, replyMutation] = useCreateRepoAnnouncementReplyMutation();

  const handle = useMemo(() => {
    if (repoAnnouncement?.repository?.repoType == "user_repo") {
        return repoAnnouncement?.user?.username;
    }
    return repoAnnouncement?.organization?.handle;

  }, [repoAnnouncement?.repository?.repoType])


  const displayNameLink = useMemo(() => {
    return `@${handle}/${repoAnnouncement?.repository?.name}`;
  }, [repoAnnouncement?.repository?.name, handle]);

  const linkHref = useMemo(() => {
    return `/repo/@/${handle}/${repoAnnouncement?.repository?.name}`;
  }, [repoAnnouncement?.repository?.name, handle]);

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

  useEffect(() => {

    if (growWrap?.current) {
      growWrap.current.dataset.replicatedValue = text;
    }
  }, [text])

  const onInput = useCallback(() => {
    if (growWrap?.current && growTextarea?.current) {
        growWrap.current.dataset.replicatedValue = growTextarea.current.value;
    }
  }, []);

  const onChange = useCallback((event: React.ChangeEvent<HTMLTextAreaElement>) => {
    const emojifiedString = uEmojiParser.parse(event.target.value ?? "", {parseToUnicode: true, parseToHtml: false})
    setText(emojifiedString);
  }, [])

  const timeAgo = useMemo(() => new TimeAgo("en-US"), []);

  const elapsedTime = useMemo(() => {
    if (!repoAnnouncement?.createdAt) {
      return "";
    }
    return timeAgo.format(new Date(repoAnnouncement?.createdAt as string));
  }, [timeAgo, repoAnnouncement?.createdAt]);

  const isDisabled = useMemo(() => {
    return !session?.user?.id;
  }, [session?.user?.id]);

  const isSendDisabled = useMemo(() => {
    if (isDisabled) {
      return true;
    }
    return text?.trim()?.length == 0;
  }, [text, isDisabled]);

  const disabledColor = useMemo(() => {
    if (theme.name == "light") {
      return ColorPalette.lightGray;
    }
    return ColorPalette.mediumGray;
  }, [theme.name])

  const disabledBorderColor = useMemo(() => {
    if (theme.name == "light") {
      return ColorPalette.gray;
    }
    return ColorPalette.gray;
  }, [theme.name])

  const loaderColor = useMemo(() => {
    if (theme.name == "light") {
      return "mediumGray";
    }
    return "white";
  }, [theme.name])

  const onReply = useCallback(() => {
    if (isDisabled) {
      return;
    }
    if (!repoAnnouncement?.repository?.id || !repoAnnouncement?.id) {
      return;
    }
    reply({
      variables: {
        repositoryId: repoAnnouncement?.repository?.id,
        repoAnnouncementId: repoAnnouncement?.id,
        text
      }
    });
  }, [isDisabled, text, repoAnnouncement?.repository, repoAnnouncement]);

  const onDelete = useCallback(() => {
    if (!repoAnnouncement?.repository?.id || !repoAnnouncement?.id) {
      return;
    }
    deleteAnnouncement({
      variables: {
        repositoryId: repoAnnouncement?.repository?.id,
        repoAnnouncementId: repoAnnouncement?.id,
      }
    });
  }, [isDisabled, repoAnnouncement?.repository?.id, repoAnnouncement?.id]);

  useEffect(() => {
    if (replyMutation?.data?.createRepoAnnouncementReplyComment?.__typename == "CreateRepoAnnouncementReplySuccess") {
      setText("");
      replyMutation.reset();
    }
  }, [replyMutation?.data?.createRepoAnnouncementReplyComment?.__typename])

  useEffect(() => {
    if (deleteAnnouncementRequest?.data?.deleteRepoAnnouncementComment?.__typename == "DeleteRepoAnnouncementSuccess") {
      deleteAnnouncementRequest.reset();
      props?.onDelete?.(repoAnnouncement);
    }
  }, [deleteAnnouncementRequest?.data?.deleteRepoAnnouncementComment?.__typename, props?.onDelete])

  return (
    <Container>
      <TopContainer>
        <LeftColumn>
          <div style={{ marginLeft: -8 }}>
            {repoAnnouncement.repository?.repoType == "user_repo" && (
              <UserProfilePhoto
                user={repoAnnouncement?.user}
                offlinePhoto={null}
                size={40}
              />
            )}
            {repoAnnouncement.repository?.repoType == "org_repo" && (
              <OrgProfilePhoto
                organization={repoAnnouncement?.organization as Organization}
                offlinePhoto={null}
                size={40}
              />
            )}
          </div>
        </LeftColumn>
        <RightColumn style={{ flexGrow: 1 }}>
          <CommentDisplayBox style={{ flexGrow: 1 }}>
            <CommentDisplayInnerContainer>
              <MetaDataRow>
                <MetaDataControlRow style={{ marginRight: 12 }}>
                  <Link to={linkHref}>
                    <AuthorTitle>{displayNameLink}</AuthorTitle>
                  </Link>
                  {!!session?.user?.id && !showEditReply && (
                    <>
                      {showCommentControls && !deleteAnnouncementRequest.loading && (
                        <MetaDataIconRow style={{ marginLeft: 12 }}>
                          <Icon onClick={onEditComment} src={editIcon} />
                          <Icon
                            onClick={onDelete}
                            style={{ marginLeft: 12 }}
                            src={trashIcon}
                          />
                        </MetaDataIconRow>
                      )}
                      {deleteAnnouncementRequest.loading && (
                        <MetaDataIconRow style={{ marginLeft: 12 }}>
                          <DotsLoader size="small" color={loaderColor} />
                        </MetaDataIconRow>
                      )}
                      {showEditComment && !deleteAnnouncementRequest.loading && (
                        <MetaDataIconRow style={{ marginLeft: 12 }}>
                          <EdittingText>{"editting"}</EdittingText>
                        </MetaDataIconRow>
                      )}
                    </>
                  )}
                </MetaDataControlRow>
                <DateTitle>{elapsedTime}</DateTitle>
              </MetaDataRow>
              {!showEditComment && (
                <MainText>
                  <Wrapper>{richText}</Wrapper>
                </MainText>
              )}
            </CommentDisplayInnerContainer>
          </CommentDisplayBox>
        </RightColumn>
      </TopContainer>
      {showEditComment && (
        <div style={{ marginTop: 24 }}>
          <RichTextEditor content={editText} onSetContent={setEditText} />
          <div
            style={{
              display: "flex",
              flexDirection: "row",
              justifyContent: "space-between",
              alignItems: "center",
              marginTop: 24,
            }}
          >
            <Button
              size="small"
              textSize="small"
              label={"cancel editting"}
              bg={"gray"}
              onClick={onHideEditComment}
            />
            <Button
              size="small"
              textSize="small"
              label={"done editting"}
              bg={"orange"}
              onClick={onUpdate}
              isDisabled={editText.trim() == ""}
              isLoading={updateAnnouncementRequest.loading}
            />
          </div>
        </div>
      )}
      {!showEditComment && (
        <>
          {repoAnnouncement?.replies?.map((reply, index) => {
            return (
              <CommentReply
                key={index}
                reply={reply as RepoAnnouncementReply}
                repoAnnouncement={repoAnnouncement as RepoAnnouncement}
                isEdittingReply={showEditReply && edittingReply?.id == reply?.id}
                isInEditMode={showEditReply || showEditComment}
                onEditReply={onEditReply}
                onHideEdit={onHideEditReply}
              />
            );
          })}
        </>
      )}
      {!showEditComment && !showEditReply && (
        <CommentBox
          style={
            isDisabled
              ? {
                  background: disabledColor,
                  borderColor: disabledBorderColor,
                  cursor: "not-allowed",
                }
              : {}
          }
        >
          <GrowCommentContainer style={{ maxHeight: props?.maxHeight ?? 220 }}>
            <GrowWrap ref={growWrap}>
              <TextArea
                style={isDisabled ? { cursor: "not-allowed" } : {}}
                disabled={isDisabled}
                value={text}
                onChange={onChange}
                onInput={onInput}
                rows={1}
                ref={growTextarea}
                placeholder="reply to announcement..."
              />
            </GrowWrap>
          </GrowCommentContainer>
          <Button
            onClick={onReply}
            isLoading={replyMutation.loading}
            isDisabled={isSendDisabled}
            label={"reply"}
            bg={"orange"}
            size={"small"}
          />
        </CommentBox>
      )}
      {showEditReply && edittingReply && (
        <EditReply
          onHide={onHideEditReply}
          reply={edittingReply}
          repoAnnouncement={repoAnnouncement}
        />
      )}
    </Container>
  );
};

export default React.memo(RepoAnnouncementDisplay);
