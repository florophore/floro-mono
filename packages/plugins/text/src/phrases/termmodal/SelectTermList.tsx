import React, { useRef } from "react";
import styled from "@emotion/styled";
import { useTheme } from "@emotion/react";
import Checkbox from "@floro/storybook/stories/design-system/Checkbox";

const TextAreaBlurbBox = styled.div`
  font-family: "MavenPro";
  font-weight: 600;
  font-size: 1.4rem;
  border: 1px solid ${(props) => props.theme.colors.blurbBorder};
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
  z-index: 2;
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
  z-index: 2;
`;

const Text = styled.span`
  font-family: "MavenPro";
  font-weight: 400;
  font-size: 1.2rem;
  color: ${(props) => props.theme.colors.contrastText};
`;

interface Props {
  label: string;
  potentialTerms: string[];
  selectedTerms: string[];
  onSelectTerm: (term: string) => void;
  onUnSelectTerm: (term: string) => void;
}

const SelectTermList = (props: Props) => {
  const theme = useTheme();

  const textareaContainer = useRef<HTMLDivElement>(null);

  return (
    <TextAreaBlurbBox
      style={{
        border: `2px solid ${theme.colors.contrastTextLight}`,
        position: "relative",
      }}
      ref={textareaContainer}
    >
      <LabelContainer>
        <LabelBorderEnd
          style={{
            left: -1,
            background: theme.colors.contrastTextLight,
          }}
        />
        <LabelText style={{ color: theme.colors.contrastTextLight }}>
          {props.label}
        </LabelText>
        <LabelBorderEnd
          style={{
            right: -1,
            background: theme.colors.contrastTextLight,
          }}
        />
      </LabelContainer>
      <div
        style={{
          maxHeight: "400px",
          overflowY: "scroll",
          paddingTop: 16,
          paddingBottom: 16,
        }}
      >
        {props.potentialTerms.map((potentialTerm, index) => {
          const isChecked = props.selectedTerms.includes(potentialTerm);
          return (
            <div
              key={index}
              style={{
                display: "flex",
                margin: "16px",
                flexDirection: "row",
              }}
            >
              <Checkbox
                isChecked={isChecked}
                onChange={() => {
                  if (isChecked) {
                    props.onUnSelectTerm(potentialTerm);
                  } else {
                    props.onSelectTerm(potentialTerm);
                  }
                }}
              />
              <div style={{ marginLeft: 12 }}>
                <Text>{potentialTerm}</Text>
              </div>
            </div>
          );
        })}
      </div>
    </TextAreaBlurbBox>
  );
};

export default React.memo(SelectTermList);
