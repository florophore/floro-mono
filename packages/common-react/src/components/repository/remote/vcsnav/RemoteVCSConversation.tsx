import React, {
  useMemo,
  useState,
  useCallback,
  useRef,
  useEffect,
} from "react";
import {
  MergeRequest,
  MergeRequestComment,
  ProtectedBranchRule,
  Repository,
  useCreateMergeRequestCommentMutation,
} from "@floro/graphql-schemas/src/generated/main-client-graphql";
import styled from "@emotion/styled";
import { useTheme } from "@emotion/react";
import ColorPalette from "@floro/styles/ColorPalette";
import Button from "@floro/storybook/stories/design-system/Button";

import { Link } from "react-router-dom";
import BackArrowIconLight from "@floro/common-assets/assets/images/icons/back_arrow.light.svg";
import BackArrowIconDark from "@floro/common-assets/assets/images/icons/back_arrow.dark.svg";
import {
  useMergeRequestReviewPage,
  useRemoteCompareFrom,
} from "../hooks/remote-state";
import { useRepoLinkBase } from "../hooks/remote-hooks";
import { useNavigate } from "react-router";
import CreateComment from "../mergerequest/comments/CreateComment";
import CommentDisplay from "../mergerequest/comments/CommentDisplay";

const InnerContent = styled.div`
  display: flex;
  height: 100%;
  width: 100%;
  flex-direction: column;
  justify-content: space-between;
`;

const TopContainer = styled.div`
  display: flex;
  flex-direction: column;
  position: relative;
  align-items: center;
  padding: 16px;
`;

const BottomContainer = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: flex-end;
  position: relative;
  align-items: center;
  padding: 24px 16px;
`;

const TitleSpan = styled.span`
  font-size: 1.7rem;
  font-family: "MavenPro";
  font-weight: 600;
  color: ${(props) => props.theme.colors.titleText};
  white-space: nowrap;
`;

const TitleRow = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;
  width: 100%;
  justify-content: space-between;
`;

const GoBackIcon = styled.img`
  width: 32px;
  height: 32px;
  cursor: pointer;
`;


const TopGradient = styled.div`
  width: 100%;
  position: absolute;
  top: 0;
  height: 16px;
  pointer-event: none;
  background: linear-gradient(
    ${(props) => props.theme.gradients.backgroundFullOpacity},
    ${(props) => props.theme.gradients.backgroundNoOpacity}
  );
`;

const BottomGradient = styled.div`
  width: 100%;
  position: absolute;
  bottom: 0px;
  height: 16px;
  pointer-event: none;
  background: linear-gradient(
    ${(props) => props.theme.gradients.backgroundNoOpacity},
    ${(props) => props.theme.gradients.backgroundFullOpacity}
  );
`;

const NoCommentsWrapper = styled.div`
  width: 100%;
  padding: 24px;
`;

const NoCommentsSpan = styled.span`
  font-size: 1.7rem;
  font-family: "MavenPro";
  font-weight: 500;
  color: ${(props) => props.theme.colors.contrastText};
  white-space: nowrap;
`;

const ConversationWraper = styled.div`
  width: 100%;
  position: relative;
  flex-grow: 1;
  overflow: hidden;
`;

const CommentsWrapper = styled.div`
  width: 100%;
  max-height: 100%;
  padding: 24px 16px;
  overflow-y: scroll;
  height: 100%;
  position: absolute;
  top: 0;
  left: 0;
`;

export const getBranchIdFromName = (name: string): string => {
  return name
    .toLowerCase()
    .replaceAll(" ", "-")
    .replaceAll(/[[\]'"]/g, "");
};

interface Props {
  repository: Repository;
  plugin: string;
}

const RemoteVCSConversation = (props: Props) => {
  const theme = useTheme();
  const { setReviewPage } = useMergeRequestReviewPage();
  const { compareFrom } = useRemoteCompareFrom();
  const onGoBack = useCallback(() => {
    setReviewPage("none");
  }, []);

  const pluginVersionId = useMemo(() => {
    if (props?.plugin == "home") {
      return undefined;
    }
    if (compareFrom == "after") {
      return (
        props?.repository?.mergeRequest?.branchState?.commitState?.pluginVersions?.find(
          (pv) => pv?.name == props?.plugin
        )?.id ??
        props?.repository?.mergeRequest?.divergenceState?.pluginVersions?.find(
          (pv) => pv?.name == props?.plugin
        )?.id
      );
    }
    return (
      props?.repository?.mergeRequest?.divergenceState?.pluginVersions?.find(
        (pv) => pv?.name == props?.plugin
      )?.id ??
      props?.repository?.mergeRequest?.branchState?.commitState?.pluginVersions?.find(
        (pv) => pv?.name == props?.plugin
      )?.id
    );
  }, [
    compareFrom,
    props?.plugin,
    props?.repository?.mergeRequest?.branchState?.commitState?.pluginVersions,
    props?.repository?.mergeRequest?.divergenceState?.pluginVersions,
  ]);

  const [commentText, setCommentText] = useState("");

  const [createComment, createCommentMutation] =
    useCreateMergeRequestCommentMutation();

  const onCreate = useCallback(() => {
    if (!props?.repository?.id || !props?.repository?.mergeRequest?.id) {
      return;
    }
    if (commentText?.trim() == "") {
      return;
    }
    createComment({
      variables: {
        text: commentText,
        repositoryId: props?.repository.id,
        mergeRequestId: props?.repository.mergeRequest.id,
        pluginName: props.plugin,
        pluginVersionId,
      },
    });
  }, [
    commentText,
    pluginVersionId,
    props?.plugin,
    props?.repository?.id,
    props?.repository?.mergeRequest?.id,
  ]);

  useEffect(() => {
    if (createCommentMutation?.data?.createMergeRequestComment?.__typename == "CreateMergeRequestCommentSuccess") {
        setCommentText("");
        createCommentMutation.reset();
    }

  }, [createCommentMutation?.data?.createMergeRequestComment?.__typename])

  const backArrowIcon = useMemo(() => {
    if (theme.name == "light") {
      return BackArrowIconLight;
    }
    return BackArrowIconDark;
  }, [theme.name]);

  const comments = useMemo(() => {
    const filteredComments =
      props?.repository?.mergeRequest?.comments?.filter(
        (c) => c?.pluginName == props.plugin
      ) ?? [];
    filteredComments.reverse();
    return filteredComments;
  }, [props.plugin, props?.repository?.mergeRequest?.comments]);

  return (
    <>
      <InnerContent>
        <TopContainer>
          <TitleRow>
            <TitleSpan
              style={{
                paddingTop: 6,
              }}
            >
              {"Conversation"}
            </TitleSpan>
            <div
              style={{
                paddingRight: 10,
                paddingTop: 14,
              }}
            >
              <GoBackIcon src={backArrowIcon} onClick={onGoBack} />
            </div>
          </TitleRow>
        </TopContainer>
        <ConversationWraper>
          {comments?.length == 0 && (
            <NoCommentsWrapper>
              <NoCommentsSpan>
                {"No comments added yet for plugin"}
              </NoCommentsSpan>
            </NoCommentsWrapper>
          )}
          <CommentsWrapper>
            {comments?.map((comment, index) => {
              return (
                <CommentDisplay
                  repository={props.repository}
                  mergeRequest={props.repository.mergeRequest as MergeRequest}
                  comment={comment as MergeRequestComment}
                  key={index}
                />
              );
            })}
          </CommentsWrapper>
          <TopGradient />
          <BottomGradient />
        </ConversationWraper>
        <BottomContainer>
          <div
            style={{
              width: "100%",
              display: "flex",
              flexDirection: "column",
              justifyContent: "flex-end",
            }}
          >
            {props?.repository?.mergeRequest && (
              <CreateComment
                onCreate={onCreate}
                text={commentText}
                onChangeText={setCommentText}
                mergeRequest={props.repository.mergeRequest}
                repository={props.repository}
                isLoading={createCommentMutation.loading}
              />
            )}
          </div>
        </BottomContainer>
      </InnerContent>
    </>
  );
};
export default React.memo(RemoteVCSConversation);
