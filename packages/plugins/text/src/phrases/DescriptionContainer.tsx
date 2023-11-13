import React, { useCallback, useEffect, useRef } from "react";
import styled from "@emotion/styled";
import { useTheme } from "@emotion/react";
import { useDiffColor } from "../diff";
import { PointerTypes } from "../floro-schema-api";

const TextAreaBlurbBox = styled.div`
  font-family: "MavenPro";
  font-weight: 600;
  font-size: 1.4rem;
  border: 1px solid ${(props) => props.theme.colors.blurbBorder};
  padding: 16px;
  border-radius: 8px;
  position: relative;
  display: grid;
  width: 100%;
  margin: 0;

  &::after {
    content: attr(data-value) " ";
    visibility: hidden;
    white-space: pre-wrap;
    font-weight: 400;
    font-size: 1rem;
    display: block;
    margin-top: -38px;
  }
`;

const BlurbPlaceholder = styled.span`
  color: ${(props) => props.theme.colors.contrastTextLight};
  position: absolute;
  top: 0;
  left: 0;
  font-family: "MavenPro";
  font-weight: 500;
  font-size: 1rem;
  left: 16px;
  top: 16px;
  pointer-events: none;
`;

const LabelContainer = styled.div`
  position: absolute;
  height: 32;
  top: -16px;
  left: 32px;
  background: ${(props) => props.theme.background};
  color: ${(props) => props.theme.colors.inputLabelTextColor};
  padding: 4px;
  display: inline-flex;
  justify-content: center;
  align-items: center;
`;

const LabelText = styled.span`
  font-family: "MavenPro";
  font-weight: 400;
  font-size: 1rem;
  transition: 500ms color;
  user-select: none;
`;

const LabelBorderEnd = styled.div`
  position: absolute;
  height: 2px;
  width: 2px;
  border-radius: 50%;
  top: 14.5px;
  transition: 500ms background-color;
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

    color: transparent;
    caret-color: ${(props) => props.theme.colors.contrastText};
    font-size: 1.4rem;
    font-family: "MavenPro";
    font-weight: 600;
    line-height: 1.5;
    pointer-events: none;
    outline: none;
    padding: 4px;
  }
`;


const BackgroundText = styled.div`
  content: attr(data-replicated-value) " ";
  white-space: pre-wrap;
  border: 0;

  font: inherit;
  /* Place on top of each other */
  grid-area: 1 / 1 / 2 / 2;
  padding: 0px;
  margin-right: 12px;

  color: transparent;
  caret-color: ${(props) => props.theme.colors.contrastText};
  font-size: 1.4rem;
  font-family: "MavenPro";
  font-weight: 600;
  line-height: 1.5;
  pointer-events: none;
  outline: none;
  padding: 4px;
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

  color: transparent;
  caret-color: ${(props) => props.theme.colors.contrastText};
  font-size: 1.4rem;
  font-family: "MavenPro";
  font-weight: 600;
  line-height: 1.5;
  outline: none;
  padding: 4px;
  background: none;
`;

const GrowCommentContainer = styled.div`
  flex-grow: 1;
  overflow: scroll;
`;

interface Props {
    description: string
    onUpdateDescription: (description: string) => void;
    isReadOnly: boolean;
    phraseRef: PointerTypes["$(text).phraseGroups.id<?>.phrases.id<?>"];
}

const DescriptionContainer = (props: Props) => {
  const theme = useTheme();
  const diffColor = useDiffColor(`${props.phraseRef}.description`, false, 'darker');

  const textareaContainer = useRef<HTMLDivElement>(null);
  const growWrap = useRef<HTMLDivElement>(null);
  const growTextarea = useRef<HTMLTextAreaElement>(null);

  const onChange = useCallback(
    (event: React.ChangeEvent<HTMLTextAreaElement>) => {
     props.onUpdateDescription((event?.target?.value ?? ""));
    },
    [props.onUpdateDescription]
  );

  const onInput = useCallback(() => {
    if (growWrap?.current && growTextarea?.current) {
      growWrap.current.dataset.replicatedValue = growTextarea.current.value;
    }
  }, []);

  useEffect(() => {
    if (growWrap?.current) {
      growWrap.current.dataset.replicatedValue = props.description;
    }
  }, [props.description]);

  return (
    <TextAreaBlurbBox
      style={{
        border: `2px solid ${diffColor ?? theme.colors.contrastTextLight}`,
        position: "relative",
      }}
      ref={textareaContainer}
    >
      <LabelContainer>
        <LabelBorderEnd
          style={{
            left: -1,
            background: diffColor ?? theme.colors.contrastTextLight,
          }}
        />
        <LabelText style={{ color: diffColor ?? theme.colors.contrastTextLight }}>
          {"phrase description"}
        </LabelText>
        <LabelBorderEnd
          style={{
            right: -1,
            background: diffColor ?? theme.colors.contrastTextLight,
          }}
        />
      </LabelContainer>
      <GrowCommentContainer style={{ maxHeight: 120 }}>
        <GrowWrap ref={growWrap}>
          <TextArea
            style={{
              fontWeight: 400,
              fontSize: "1.2rem",
              lineHeight: 1.5,
              color:
                (props.description?.length ?? 0) == 0
                  ? theme.colors.inputPlaceholderTextColor
                  : theme.colors.contrastText,
            }}
            value={props.description}
            onChange={onChange}
            onInput={onInput}
            rows={1}
            ref={growTextarea}
            placeholder="Write a description for this phrase"
            disabled={props.isReadOnly}
          />
          <BackgroundText>{props.description}</BackgroundText>
        </GrowWrap>
      </GrowCommentContainer>
    </TextAreaBlurbBox>
  );
};

export default React.memo(DescriptionContainer);
