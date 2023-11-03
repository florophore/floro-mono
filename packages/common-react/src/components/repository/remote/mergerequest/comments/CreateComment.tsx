import React, { useMemo, useCallback, useEffect, useRef } from "react";
import styled from "@emotion/styled";
import { useTheme } from "@emotion/react";
import {
  MergeRequest,
  Repository,
} from "@floro/graphql-schemas/src/generated/main-client-graphql";
import { useSession } from "../../../../../session/session-context";
import UserProfilePhoto from "@floro/storybook/stories/common-components/UserProfilePhoto";
import Button from "@floro/storybook/stories/design-system/Button";
import ColorPalette from "@floro/styles/ColorPalette";
import { useOfflinePhoto, useOfflinePhotoMap } from "../../../../../offline/OfflinePhotoContext";
import uEmojiParser from 'universal-emoji-parser'

const Container = styled.div`
  width: 100%;
  max-width: 870px;
  border: 2px solid ${(props) => props.theme.colors.contrastTextLight};
  padding: 16px 8px;
  border-radius: 8px;
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
  align-items: center;
  display: flex;
`;

const CommentTitle = styled.h3`
  font-family: "MavenPro";
  font-weight: 600;
  font-size: 1.4rem;
  color: ${(props) => props.theme.colors.pluginDisplayTitle};
  margin-left: 6px;
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

    color: ${(props) => props.theme.colors.contrastText};
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

  color: ${(props) => props.theme.colors.contrastText};
  font-size: 1.2rem;
  font-family: "MavenPro";
  font-weight: 400;
  outline: none;
  padding: 4px;
  background: none;
`;

interface Props {
  repository: Repository;
  mergeRequest: MergeRequest;
  maxHeight?: number;
  text: string;
  onChangeText: (value: string) => void;
  parentRef?: React.RefObject<HTMLElement>;
  isLoading: boolean;
  onCreate: () => void;
  extendTextarea?: boolean;
}

const CreateComment = (props: Props) => {
  const theme = useTheme();
  const { session, currentUser } = useSession();

  const growWrap = useRef<HTMLDivElement>(null);
  const growTextarea = useRef<HTMLTextAreaElement>(null);
  const offlinePhoto = useOfflinePhoto(currentUser?.profilePhoto ?? null);

  useEffect(() => {
    if (growWrap?.current) {
      growWrap.current.dataset.replicatedValue = props.text;
    }
  }, [props.text]);

  const onInput = useCallback(() => {
    if (growWrap?.current && growTextarea?.current) {
      growWrap.current.dataset.replicatedValue = growTextarea.current.value;
      if (props?.parentRef?.current) {
        props?.parentRef.current?.scrollTo({
          top: props?.parentRef?.current?.scrollHeight ?? 0,
          behavior: "smooth",
        });
      }
    }
  }, [props?.parentRef]);

  const onChange = useCallback(
    (event: React.ChangeEvent<HTMLTextAreaElement>) => {
      const emojifiedString = uEmojiParser.parse(event.target.value ?? "", {parseToUnicode: true, parseToHtml: false})
      props?.onChangeText?.(emojifiedString);
    },
    [props.onChangeText]
  );

  const onFocus = useCallback(() => {
    if (props?.parentRef?.current) {
      props?.parentRef.current?.scrollTo({
        top: props?.parentRef?.current?.scrollHeight ?? 0,
        behavior: "smooth",
      });
    }
  }, [props.parentRef]);

  const isDisabled = useMemo(() => {
    return !session?.user?.id;
  }, [session?.user?.id]);

  const isSendDisabled = useMemo(() => {
    if (isDisabled) {
      return true;
    }
    return props?.text?.trim()?.length == 0;
  }, [props.text, isDisabled]);

  const disabledColor = useMemo(() => {
    if (theme.name == "light") {
      return ColorPalette.lightGray;
    }
    return ColorPalette.mediumGray;
  }, [theme.name]);

  const disabledBorderColor = useMemo(() => {
    if (theme.name == "light") {
      return ColorPalette.gray;
    }
    return ColorPalette.gray;
  }, [theme.name]);

  return (
    <Container>
      <TopContainer>
        <LeftColumn>
          <div style={{ marginLeft: -8 }}>
            <UserProfilePhoto
              user={session?.user}
              offlinePhoto={offlinePhoto}
              size={40}
            />
          </div>
        </LeftColumn>
        <RightColumn>
          <CommentTitle>{"Create New Comment"}</CommentTitle>
        </RightColumn>
      </TopContainer>
      <CommentBox
        style={
          isDisabled
            ? {
                marginLeft: props.extendTextarea ? 0 : 56,
                background: disabledColor,
                borderColor: disabledBorderColor,
                cursor: "not-allowed",
              }
            : {
              marginLeft: props.extendTextarea ? 0 : 56
            }
        }
      >
        <GrowCommentContainer style={{ maxHeight: props?.maxHeight ?? 220 }}>
          <GrowWrap ref={growWrap}>
            <TextArea
              style={isDisabled ? { cursor: "not-allowed" } : {}}
              disabled={isDisabled}
              value={props.text}
              onChange={onChange}
              onFocus={onFocus}
              onInput={onInput}
              rows={1}
              ref={growTextarea}
              placeholder="write a new comment..."
            />
          </GrowWrap>
        </GrowCommentContainer>
        <Button
          onClick={props.onCreate}
          isLoading={props.isLoading}
          isDisabled={isSendDisabled}
          label={"send"}
          bg={"orange"}
          size={"small"}
        />
      </CommentBox>
    </Container>
  );
};

export default React.memo(CreateComment);
