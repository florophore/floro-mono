import React, { useMemo, useCallback, useEffect, useRef, useState } from "react";
import styled from "@emotion/styled";
import { useTheme } from "@emotion/react";
import {
  MergeRequest,
  MergeRequestComment,
  Repository,
  useUpdateMergeRequestCommentMutation,
} from "@floro/graphql-schemas/src/generated/main-client-graphql";

import { useSession } from "../../../../../session/session-context";
import Button from "@floro/storybook/stories/design-system/Button";
import ColorPalette from "@floro/styles/ColorPalette";

import BackArrowIconLight from "@floro/common-assets/assets/images/icons/back_arrow.light.svg";
import BackArrowIconDark from "@floro/common-assets/assets/images/icons/back_arrow.dark.svg";

const Container = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;
  width: 100%;
`;

const LeftColumn = styled.div`
  width: 60px;
  display: flex;
  justify-content: center;
  align-self: flex-end;
`;

const CommentBox = styled.div`
  border: 2px solid ${(props) => props.theme.colors.contrastTextLight};
  padding: 8px;
  border-radius: 8px;
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
  width: 100%;
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

const EditBackIcon = styled.img`
  height: 36px;
  width: 36px;
  cursor: pointer;
  margin-bottom: 8px;
`;


interface Props {
  repository: Repository;
  mergeRequest: MergeRequest;
  comment: MergeRequestComment;
  maxHeight?: number;
  onHide: () => void;
}

const CommentDisplay = (props: Props) => {
  const theme = useTheme();
  const { session } = useSession();
  const [text, setText] = useState(props?.comment?.text ?? "");

  const growWrap = useRef<HTMLDivElement>(null);
  const growTextarea = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    setText(props?.comment?.text ?? "");
    if (growWrap?.current) {
        growWrap.current.dataset.replicatedValue = props?.comment?.text ?? "";
    }
  }, [props.comment?.text, growWrap?.current])

  const onInput = useCallback(() => {
    if (growWrap?.current && growTextarea?.current) {
        growWrap.current.dataset.replicatedValue = growTextarea.current.value;
    }
  }, []);

  const onChange = useCallback((event: React.ChangeEvent<HTMLTextAreaElement>) => {
    setText(event?.target?.value ?? "")
  }, [])

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

  const backIcon = useMemo(() => {
    if (theme.name == "light") {
      return BackArrowIconLight;
    }
    return BackArrowIconDark;
  }, [theme.name])

  const loaderColor = useMemo(() => {
    if (theme.name == "light") {
      return "mediumGray";
    }
    return "white";
  }, [theme.name])

  const showIcons = useMemo(() => {
    return false;
  }, []);


  const [edit, editMutation] = useUpdateMergeRequestCommentMutation();

  const onFinishEdit = useCallback(() => {
    if (isDisabled) {
      return;
    }
    if (!props?.repository?.id || !props?.mergeRequest?.id || !props?.comment?.id) {
      return;
    }
    edit({
      variables: {
        repositoryId: props?.repository?.id,
        mergeRequestId: props?.mergeRequest?.id,
        mergeRequestCommentId: props?.comment?.id,
        text
      }
    });
  }, [isDisabled, text, props?.repository, props?.mergeRequest, props?.comment]);

  useEffect(() => {
    if (editMutation?.data?.updateMergeRequestComment?.__typename == "UpdateMergeRequestCommentSuccess") {
      props?.onHide();
    }
  }, [editMutation?.data?.updateMergeRequestComment?.__typename, props?.onHide])


  return (
    <Container>
      <LeftColumn>
        <div style={{marginLeft: -8}}>
          <EditBackIcon onClick={props.onHide} src={backIcon}/>
        </div>
      </LeftColumn>
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
              placeholder="edit comment..."
            />
          </GrowWrap>
        </GrowCommentContainer>
        <Button
          onClick={onFinishEdit}
          isLoading={editMutation.loading}
          isDisabled={isSendDisabled}
          label={"edit"}
          bg={"orange"}
          size={"small"}
        />
      </CommentBox>
    </Container>
  );
};

export default React.memo(CommentDisplay);