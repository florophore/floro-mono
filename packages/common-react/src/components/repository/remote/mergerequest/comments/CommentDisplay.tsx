import React, { useMemo, useCallback, useEffect, useRef, useState } from "react";
import styled from "@emotion/styled";
import { useTheme } from "@emotion/react";
import {
  MergeRequest,
  MergeRequestComment,
  MergeRequestCommentReply,
  Repository,
  useCreateMergeRequestCommentReplyMutation,
  useDeleteMergeRequestCommentMutation,
} from "@floro/graphql-schemas/src/generated/main-client-graphql";
import TimeAgo from "javascript-time-ago";

import { useSession } from "../../../../../session/session-context";
import UserProfilePhoto from "@floro/storybook/stories/common-components/UserProfilePhoto";
import Button from "@floro/storybook/stories/design-system/Button";
import ColorPalette from "@floro/styles/ColorPalette";
import CommentReply from "./CommentReply";

import EditIconLight from "@floro/common-assets/assets/images/icons/edit.light.darker.svg";
import EditIconDark from "@floro/common-assets/assets/images/icons/edit.dark.svg";

import TrashIconLight from "@floro/common-assets/assets/images/icons/trash.light.svg"
import TrashIconDark from "@floro/common-assets/assets/images/icons/trash.dark.svg";
import DotsLoader from "@floro/storybook/stories/design-system/DotsLoader";
import EditComment from "./EditComment";
import EditReply from "./EditReply";

const Container = styled.div`
  width: 100%;
  max-width: 870px;
  border: 2px solid ${(props) => props.theme.colors.contrastTextLight};
  padding: 16px 8px;
  border-radius: 8px;
  margin-bottom: 36px;
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
  font-size: 1.4rem;
  color: ${(props) => props.theme.colors.contrastText};
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
const MainText = styled.p`
  font-family: "MavenPro";
  font-weight: 400;
  font-size: 1.2rem;
  color: ${(props) => props.theme.colors.contrastText};
  white-space: pre-wrap;
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

const upcaseFirst = (str: string) => {
  const rest = str.substring(1);
  return (str?.[0]?.toUpperCase() ?? "") + rest;
};


interface Props {
  repository: Repository;
  mergeRequest: MergeRequest;
  comment: MergeRequestComment;
  maxHeight?: number;
}

const CommentDisplay = (props: Props) => {
  const theme = useTheme();
  const { session } = useSession();
  const [text, setText] = useState("");

  const growWrap = useRef<HTMLDivElement>(null);
  const growTextarea = useRef<HTMLTextAreaElement>(null);

  const firstName = useMemo(() => upcaseFirst(props.comment?.user?.firstName ?? ""), [props.comment?.user?.firstName]);
  const lastName = useMemo(() => upcaseFirst(props.comment?.user?.lastName ?? ""), [props.comment?.user?.lastName]);
  const [showEditComment, setShowEditComment] = useState<boolean>(false);
  const [showEditReply, setShowEditReply] = useState<boolean>(false);
  const [edittingReply, setEdittingReply] = useState<MergeRequestCommentReply|null>(null);

  const onEditComment = useCallback(() => {
    setShowEditComment(true);
  }, [])

  const onHideEditComment = useCallback(() => {
    setShowEditComment(false);
  }, [])

  const onEditReply = useCallback((reply: MergeRequestCommentReply) => {
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
    return session?.user?.id == props.comment?.user?.id;
  }, [showEditComment, showEditReply, session, props.comment]);

  const [reply, replyMutation] = useCreateMergeRequestCommentReplyMutation();
  const [deleteComment, deleteCommentMutation] = useDeleteMergeRequestCommentMutation();

  const userFullname = useMemo(() => {
    return `${firstName} ${lastName}`;
  }, [firstName, lastName]);

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
    setText(event?.target?.value ?? "")
  }, [])

  const timeAgo = useMemo(() => new TimeAgo("en-US"), []);

  const elapsedTime = useMemo(() => {
    if (!props.comment?.createdAt) {
      return "";
    }
    return timeAgo.format(new Date(props.comment?.createdAt as string));
  }, [timeAgo, props.comment?.createdAt]);

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
    if (!props?.repository?.id || !props?.mergeRequest?.id || !props?.comment?.id) {
      return;
    }
    reply({
      variables: {
        repositoryId: props?.repository?.id,
        mergeRequestId: props?.mergeRequest?.id,
        mergeRequestCommentId: props?.comment?.id,
        text
      }
    });
  }, [isDisabled, text, props?.repository, props?.mergeRequest, props?.comment]);

  const onDelete = useCallback(() => {
    if (!props?.repository?.id || !props?.mergeRequest?.id || !props?.comment?.id) {
      return;
    }
    deleteComment({
      variables: {
        repositoryId: props?.repository?.id,
        mergeRequestId: props?.mergeRequest?.id,
        mergeRequestCommentId: props?.comment?.id,
      }
    });
  }, [isDisabled,  props?.repository, props?.mergeRequest, props?.comment]);

  useEffect(() => {
    if (replyMutation?.data?.createMergeRequestCommentReply?.__typename == "CreateMergeRequestCommentReplySuccess") {
      setText("");
      replyMutation.reset();
    }
  }, [replyMutation?.data?.createMergeRequestCommentReply?.__typename])

  return (
    <Container>
      <TopContainer>
        <LeftColumn>
          <div style={{ marginLeft: -8 }}>
            <UserProfilePhoto
              user={props?.comment?.user}
              offlinePhoto={null}
              size={40}
            />
          </div>
        </LeftColumn>
        <RightColumn style={{ flexGrow: 1 }}>
          <CommentDisplayBox style={{ flexGrow: 1 }}>
            <CommentDisplayInnerContainer>
              <MetaDataRow>
                <MetaDataControlRow>
                  <AuthorTitle>{userFullname}</AuthorTitle>
                  {session?.user?.id == props.comment?.user?.id &&
                    !showEditReply && (
                      <>
                        {showCommentControls && !deleteCommentMutation.loading && (
                          <MetaDataIconRow style={{ marginLeft: 12 }}>
                            <Icon onClick={onEditComment} src={editIcon} />
                            <Icon
                              onClick={onDelete}
                              style={{ marginLeft: 12 }}
                              src={trashIcon}
                            />
                          </MetaDataIconRow>
                        )}
                        {deleteCommentMutation.loading && (
                          <MetaDataIconRow style={{ marginLeft: 12 }}>
                            <DotsLoader size="small" color={loaderColor} />
                          </MetaDataIconRow>
                        )}
                        {showEditComment && !deleteCommentMutation.loading && (
                          <MetaDataIconRow style={{ marginLeft: 12 }}>
                            <EdittingText>{"editting"}</EdittingText>
                          </MetaDataIconRow>
                        )}
                      </>
                    )}
                </MetaDataControlRow>
                <DateTitle>{elapsedTime}</DateTitle>
              </MetaDataRow>
              <MainText>{props.comment.text}</MainText>
            </CommentDisplayInnerContainer>
          </CommentDisplayBox>
        </RightColumn>
      </TopContainer>
      {props?.comment?.replies?.map((reply, index) => {
        return (
          <CommentReply
            key={index}
            reply={reply as MergeRequestCommentReply}
            comment={props.comment as MergeRequestComment}
            mergeRequest={props.mergeRequest as MergeRequest}
            repository={props.repository}
            isEdittingReply={showEditReply && edittingReply?.id == reply?.id}
            isInEditMode={showEditReply || showEditComment}
            onEditReply={onEditReply}
            onHideEdit={onHideEditReply}
          />
        );
      })}
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
                placeholder="reply to comment..."
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
      {showEditComment && (
        <EditComment
          onHide={onHideEditComment}
          comment={props.comment}
          repository={props.repository}
          mergeRequest={props.mergeRequest}
        />
      )}
      {showEditReply && edittingReply && (
        <EditReply
          onHide={onHideEditReply}
          reply={edittingReply}
          comment={props.comment}
          repository={props.repository}
          mergeRequest={props.mergeRequest}
        />
      )}
    </Container>
  );
};

export default React.memo(CommentDisplay);
