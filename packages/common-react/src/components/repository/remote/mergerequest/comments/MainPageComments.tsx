import React, {
  useMemo,
  useCallback,
  useState,
  useRef,
  useEffect,
} from "react";
import styled from "@emotion/styled";
import { useTheme } from "@emotion/react";
import {
  MergeRequest,
  PluginVersion,
  Repository,
  useCreateMergeRequestCommentMutation,
} from "@floro/graphql-schemas/src/generated/main-client-graphql";
import CreateComment from "./CreateComment";

import CommitMediumGray from "@floro/common-assets/assets/images/repo_icons/commit.medium_gray.svg";
import ConversationLight from "@floro/common-assets/assets/images/icons/conversation.light.svg";
import ConversationDark from "@floro/common-assets/assets/images/icons/conversation.dark.svg";
import HomeSelectedLight from "@floro/common-assets/assets/images/icons/plugin_home.selected.light.svg";
import HomeSelectedDark from "@floro/common-assets/assets/images/icons/plugin_home.selected.dark.svg";
import {
  useBeforeCommitState,
  useRemoteCommitState,
} from "../../hooks/remote-state";
import CommentDisplay from "./CommentDisplay";
import { MergeRequestComment } from "@floro/graphql-schemas/build/generated/main-client-graphql";

const ConversationTitle = styled.h2`
  font-family: "MavenPro";
  font-weight: 500;
  font-size: 2rem;
  color: ${(props) => props.theme.colors.pluginDisplayTitle};
`;

const BigSectionContainer = styled.div`
  max-width: 870px;
  margin-bottom: 48px;
`;

const ConversationRow = styled.div`
  max-width: 870px;
  margin-bottom: 24px;
  display: flex;
  flex-direction: row;
  align-items: center;
`

const ConversationRowIcon = styled.img`
  font-family: "MavenPro";
  font-weight: 600;
  height: 56px;
  width: 56px;
  color: ${(props) => props.theme.colors.pluginDisplayTitle};
  margin-right: 24px;
`;

const ConversationRowTitle = styled.h5`
  font-family: "MavenPro";
  font-weight: 600;
  font-size: 1.7rem;
  color: ${(props) => props.theme.colors.pluginDisplayTitle};
`;

interface Props {
  repository: Repository;
  container: React.RefObject<HTMLDivElement>;
}

const MergeRequestComments = (props: Props) => {
  const theme = useTheme();
  const [commentText, setCommentText] = useState("");

  const [createComment, createCommentMutation] =
    useCreateMergeRequestCommentMutation();

  const remoteCommitState = useRemoteCommitState(
    props.repository?.mergeRequest?.branchState?.commitState
  );
  const beforeCommitState = useBeforeCommitState(
    props.repository,
    "merge-request"
  );
  const beforeRemoteCommitState = useRemoteCommitState(beforeCommitState);

  const presentPluginOrder = useMemo(() => {
    const out: Array<string> = [];
    for (const plugin of remoteCommitState?.renderedState?.plugins) {
      if (!out.includes(plugin.key)) {
        out.push(plugin.key);
      }
    }

    for (const plugin of beforeRemoteCommitState?.renderedState?.plugins) {
      if (!out.includes(plugin.key)) {
        out.push(plugin.key);
      }
    }
    for (const pluginVersion of props?.repository?.mergeRequest
      ?.commentPluginVersions ?? []) {
      if (pluginVersion?.name && !out.includes(pluginVersion?.name)) {
        out.push(pluginVersion?.name);
      }
    }
    return out;
  }, [
    remoteCommitState?.renderedState?.plugins,
    beforeRemoteCommitState?.renderedState?.plugins,
    props?.repository?.mergeRequest?.commentPluginVersions,
  ]);

  const pluginDisplayMap = useMemo(() => {
    const pluginMap: { [name: string]: PluginVersion } = {};
    for (const key of presentPluginOrder) {
      const pluginVersion =
        props.repository?.mergeRequest?.branchState?.commitState?.pluginVersions?.find(
          (v) => v?.name == key
        ) ??
        props.repository?.mergeRequest?.divergenceState?.pluginVersions?.find(
          (v) => v?.name == key
        ) ??
        (props?.repository?.mergeRequest?.commentPluginVersions?.find(
          (v) => v?.name == key
        ) as PluginVersion);
      pluginMap[key] = pluginVersion;
    }
    return pluginMap;
  }, [
    presentPluginOrder,
    props.repository?.mergeRequest?.branchState?.commitState?.pluginVersions,
    props.repository?.mergeRequest?.divergenceState?.pluginVersions,
    props?.repository?.mergeRequest?.commentPluginVersions,
  ]);

  const conversationIcon = useMemo(() => {
    if (theme.name == "light") {
      return ConversationLight;
    }

    return ConversationDark;
  }, [theme.name]);

  const homeIcon = useMemo(() => {
    if (theme.name == "light") {
      return HomeSelectedLight;
    }

    return HomeSelectedDark;
  }, [theme.name]);

  const homeComments = useMemo(() => {
    return (
      props?.repository?.mergeRequest?.comments?.filter(
        (c) => c?.pluginName == "home"
      ) ?? []
    );
  }, [props?.repository?.mergeRequest?.comments]);

  const noPluginComments = useMemo(() => {
    return (
      props?.repository?.mergeRequest?.comments?.filter(
        (c) => !c?.pluginName
      ) ?? []
    );
  }, [props?.repository?.mergeRequest?.comments]);

  const pluginComments = useMemo(() => {
    return (
      props?.repository?.mergeRequest?.comments?.filter(
        (c) => !!c?.pluginName && c?.pluginName != "home"
      ) ?? []
    );

  }, [props?.repository?.mergeRequest?.comments])

  const pluginCommentMatrix = useMemo(() => {
    return presentPluginOrder?.map(pluginName => {
      const pluginVersion = pluginDisplayMap[pluginName];
      const displayName = pluginVersion.displayName;
      const icon = theme.name == "light" ? pluginVersion.selectedLightIcon ?? pluginVersion?.lightIcon :  pluginVersion.selectedDarkIcon ?? pluginVersion?.darkIcon;
      const comments = pluginComments.filter(c => c?.pluginName == pluginName);
      return {
        displayName,
        icon,
        comments
      }
    })?.filter(p => p.comments.length > 0);
  }, [pluginComments, pluginDisplayMap, presentPluginOrder, theme.name])

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
      },
    });
  }, [commentText, props?.repository?.id, props?.repository?.mergeRequest?.id]);

  useEffect(() => {
    if (
      createCommentMutation?.data?.createMergeRequestComment?.__typename ==
      "CreateMergeRequestCommentSuccess"
    ) {
      setCommentText("");
      createCommentMutation.reset();
    }
  }, [createCommentMutation?.data?.createMergeRequestComment?.__typename]);

  return (
    <BigSectionContainer style={{ marginBottom: 80 }}>
      <div></div>
      <ConversationTitle style={{ marginBottom: 24 }}>
        {"Conversation"}
      </ConversationTitle>
      {homeComments?.length > 0 && (
        <>
          <ConversationRow>
            <ConversationRowIcon src={homeIcon}/>
            <ConversationRowTitle>{'Home'}</ConversationRowTitle>
          </ConversationRow>
          <div>
            {homeComments?.map((comment, index) => {
              return (
                <CommentDisplay
                  repository={props.repository}
                  mergeRequest={props.repository.mergeRequest as MergeRequest}
                  comment={comment as MergeRequestComment}
                  key={index}
                />
              );
            })}
          </div>
        </>
      )}
      {pluginCommentMatrix?.map((plugin, index) => {
        return (
          <div key={index}>
            <ConversationRow>
              <ConversationRowIcon src={plugin.icon as string}/>
              <ConversationRowTitle>{plugin.displayName}</ConversationRowTitle>
            </ConversationRow>
            <div>
              {plugin.comments?.map((comment, innerIndex) => {
                return (
                  <CommentDisplay
                    repository={props.repository}
                    mergeRequest={props.repository.mergeRequest as MergeRequest}
                    comment={comment as MergeRequestComment}
                    key={innerIndex}
                  />
                );
              })}
            </div>
          </div>
        )
      })}
      <ConversationRow>
        <ConversationRowIcon src={conversationIcon}/>
        <ConversationRowTitle>{'Review Conversation'}</ConversationRowTitle>
      </ConversationRow>
      <div>
        {noPluginComments?.map((comment, index) => {
          return (
            <CommentDisplay
              repository={props.repository}
              mergeRequest={props.repository.mergeRequest as MergeRequest}
              comment={comment as MergeRequestComment}
              key={index}
            />
          );
        })}

      </div>
      {props?.repository?.mergeRequest && (
        <CreateComment
          onCreate={onCreate}
          text={commentText}
          onChangeText={setCommentText}
          mergeRequest={props.repository.mergeRequest}
          repository={props.repository}
          parentRef={props.container}
          isLoading={createCommentMutation.loading}
        />
      )}
    </BigSectionContainer>
  );
};

export default React.memo(MergeRequestComments);
