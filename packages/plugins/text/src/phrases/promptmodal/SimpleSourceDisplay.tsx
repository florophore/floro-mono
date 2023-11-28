import React, { useRef } from "react";
import styled from "@emotion/styled";
import { useTheme } from "@emotion/react";

const Container = styled.div`
  background: ${props => props.theme.background};
  border-radius: 8px;
  border: 1px solid ${(props) => props.theme.colors.contrastText};
`

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
`;

const PromptResponseTitle = styled.p`
  font-family: "MavenPro";
  font-weight: 400;
  font-size: 1.44rem;
  user-select: none;
  color: ${(props) => props.theme.colors.contrastText};
  margin-bottom: 12px;
`;

const LabelBorderEnd = styled.div`
  position: absolute;
  height: 2px;
  width: 2px;
  border-radius: 50%;
  top: 14.5px;
  transition: 500ms background-color;
`;

const GrowCommentContainer = styled.div`
  flex-grow: 1;
  overflow: scroll;
`;

const Wrapper = styled.div`
  ol {
    padding-top: 0;
    padding-bottom: 0;
    margin-top: 0;
    margin-bottom: 0;
  }
  ul {
    padding-top: 12px;
    padding-bottom: 0;
    margin-top: 0;
    margin-bottom: 0;
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
`


interface Props {
    value: string
}

const SourceDisplay = (props: Props) => {
  const theme = useTheme();

  return (
    <div>
      <PromptResponseTitle>{'GPT Edits:'}</PromptResponseTitle>
      <Container>
        <Wrapper dangerouslySetInnerHTML={{__html: props.value}} style={{padding: 16, color: theme.colors.contrastText}}/>
      </Container>
    </div>
  );
};

export default React.memo(SourceDisplay);
