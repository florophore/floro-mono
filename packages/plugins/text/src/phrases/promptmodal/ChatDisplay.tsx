import React, { useRef, useMemo, useEffect } from "react";
import styled from "@emotion/styled";
import { useTheme } from "@emotion/react";
import ColorPalette from "@floro/styles/ColorPalette";
import Button from "@floro/storybook/stories/design-system/Button";
import DotsLoader from "@floro/storybook/stories/design-system/DotsLoader";
import SimpleSourceDisplay from "./SimpleSourceDisplay";
import WarningLabel from "@floro/storybook/stories/design-system/WarningLabel";

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

const LabelText = styled.span`
  font-family: "MavenPro";
  font-weight: 400;
  font-size: 1rem;
  transition: 500ms color;
  user-select: none;
`;


const PlaceholderText = styled.p`
  font-family: "MavenPro";
  font-weight: 500;
  font-size: 1.44rem;
  user-select: none;
  padding: 16px;
  color: ${props => props.theme.colors.contrastTextLight};
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
  overflow-y: scroll;
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

const PillContainer = styled.div`
  height: 48px;
  background: ${(props) => props.theme.name == 'light' ? ColorPalette.lightGray : ColorPalette.mediumGray};
  margin-left: 8px;
  margin-right: 8px;
  border-radius: 24px;
  padding: 4px 16px 4px 16px;
  display: flex;
  flex-direction: row;
  align-items: center;
  width: 120px;
  justify-content: center;
  position: relative;
`;

const UserPrompt = styled.div`
  min-height: 48px;
  background: ${(props) => props.theme.colors.titleText};
  color: ${ColorPalette.white};
  margin-left: 8px;
  margin-right: 8px;
  border-radius: 24px;
  padding: 16px;
  display: flex;
  flex-direction: row;
  flex-wrap: wrap;
  align-items: center;
  justify-content: center;
  position: relative;
  font-family: "MavenPro";
  font-weight: 500;
  font-size: 1.44rem;
`;

const GPTReply = styled.div`
  min-height: 48px;
  background: ${(props) => props.theme.name == 'light' ? ColorPalette.lightGray : ColorPalette.mediumGray};
  color: ${ColorPalette.white};
  margin-left: 8px;
  margin-right: 8px;
  border-radius: 24px;
  padding: 16px;
  display: flex;
  flex-direction: column;
  flex-wrap: wrap;
  justify-content: center;
  position: relative;
  font-family: "MavenPro";
  font-weight: 500;
  font-size: 1.44rem;
`;

interface Props {
  maxHeight?: number;
  isLoading?: boolean;
  isError?: boolean;
  isEmpty?: boolean;
  pendingPrompt?: string;
  messages: Array<{
    includeSource: boolean;
    prompt: string;
    promptResponse: string;
  }>;
  onApply: (index: number) => void;
}

const ChatDisplay = (props: Props) => {
  const theme = useTheme();

  const textareaContainer = useRef<HTMLDivElement>(null);
  const growContainer = useRef<HTMLDivElement>(null);

  const showPlaceholder = useMemo(() => {
    if (props.messages.length > 0) {
      return false;
    }
    return !props.isLoading && !props.isError;
  }, [props.messages, props.isError, props.isLoading])

  useEffect(() => {
    if (props?.pendingPrompt) {
      growContainer.current?.scrollTo({behavior: "smooth", top: growContainer?.current?.scrollHeight ?? 0})
    }

  }, [props?.pendingPrompt])
  return (
    <TextAreaBlurbBox
      style={{
        border: `2px solid ${theme.colors.contrastTextLight}`,
        position: "relative",
        minHeight: 300
      }}
      ref={textareaContainer}
    >
      <GrowCommentContainer ref={growContainer} style={{ maxHeight: props.maxHeight ?? 120 }}>
        {showPlaceholder && (
          <PlaceholderText>
            {props?.isEmpty ? 'Prompt Chat GPT to create prose for you' : 'Prompt ChatGPT for edits and changes you would like to make to the target document.'}
          </PlaceholderText>
        )}
        {props.messages.map((message, index) => {
          return (
            <React.Fragment key={index}>
              <div style={{
                display: 'flex',
                flexDirection: 'row',
                width: '100%',
                justifyContent: 'flex-end',
                padding: '18px 12px'
              }}>
                <UserPrompt>
                  {message.prompt}
                </UserPrompt>
              </div>
              <div style={{
                display: 'flex',
                flexDirection: 'row',
                width: '100%',
                justifyContent: 'flex-start',
                padding: '18px 12px'
              }}>
                <GPTReply>
                  <SimpleSourceDisplay value={message.promptResponse}/>
                  <div style={{
                    display: 'block',
                    width: 160,
                    marginTop: 24,
                    alignSelf: 'flex-end'
                  }}>
                    <Button onClick={() => {
                      props.onApply(index);
                    }} label={"apply edits"} bg={"purple"} size={"medium"} />

                  </div>
                </GPTReply>
              </div>

            </React.Fragment>
          )
        })}
        {(props.isLoading || props.isError) && (
          <div style={{
            display: 'flex',
            flexDirection: 'row',
            width: '100%',
            justifyContent: 'flex-end',
            padding: '18px 12px'
          }}>
            <UserPrompt>
              {props.pendingPrompt}
            </UserPrompt>
          </div>
        )}
        {props.isLoading && (
          <div style={{
            display: 'flex',
            flexDirection: 'row',
            width: '100%',
            justifyContent: 'flex-start',
            padding: '18px 12px'
          }}>
            <PillContainer>
              <DotsLoader color={theme.name == 'light' ? "gray" : "lightGray"} size={"medium"}/>
            </PillContainer>
          </div>
        )}
        {props.isError && (
          <div style={{
            display: 'flex',
            flexDirection: 'row',
            width: '100%',
            justifyContent: 'flex-start',
            padding: '18px 12px'
          }}>
            <WarningLabel label={"Something went wrong. Please make sure your API key is correct"} size={"large"}/>
          </div>
        )}
      </GrowCommentContainer>
    </TextAreaBlurbBox>
  );
};

export default React.memo(ChatDisplay);
