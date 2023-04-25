import React, {
  useMemo,
  useState,
  useCallback,
  useRef,
  useEffect,
} from "react";
import { Repository } from "@floro/graphql-schemas/src/generated/main-client-graphql";
import styled from "@emotion/styled";
import { useTheme } from "@emotion/react";
import ColorPalette from "@floro/styles/ColorPalette";
import Button from "@floro/storybook/stories/design-system/Button";
import { ApiResponse } from "@floro/floro-lib/src/repo";
import { useLocalVCSNavContext } from "./LocalVCSContext";
import {  useCommitChanges } from "../hooks/local-hooks";

import BackArrowIconLight from "@floro/common-assets/assets/images/icons/back_arrow.light.svg";
import BackArrowIconDark from "@floro/common-assets/assets/images/icons/back_arrow.dark.svg";

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
  height: 100%;
  position: relative;
  align-items: center;
  padding: 16px;
`;

const BottomContainer = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: flex-end;
  height: 100%;
  position: relative;
  align-items: center;
  padding: 24px 16px;
`;

const TitleSpan = styled.span`
    font-size: 1.7rem;
    font-family: "MavenPro";
    font-weight: 600;
    color: ${props => props.theme.colors.titleText};
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

const Row = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;
  width: 100%;
  justify-content: space-between;
  margin-top: 24px;
`;

const TextAreaBlurbBox = styled.div`
  font-family: "MavenPro";
  font-weight: 600;
  font-size: 1.4rem;
  border: 1px solid ${(props) => props.theme.colors.blurbBorder};
  padding: 16px;
  border-radius: 8px;
  min-height: 184px;
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

const BlurbTextArea = styled.textarea`
  color: ${(props) => props.theme.colors.blurbBorder};
  font-family: "MavenPro";
  font-weight: 400;
  font-size: 1rem;
  white-space: pre-wrap;
  resize: none;
  background: none;
  width: 100%;
  padding: 0;
  height: 184px;
  outline: none;
  border: none;
  margin: 0;
  resize: none;
  background: none;
  appearance: none;
`;

const BlurbPlaceholder = styled.span`
  color: ${(props) => props.theme.colors.blurbBorder};
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

export const getBranchIdFromName = (name: string): string => {
  return name.toLowerCase().replaceAll(" ", "-").replaceAll(/[[\]'"]/g, "");
};

interface Props {
  repository: Repository;
  apiResponse: ApiResponse;
}

const NewBranchNavPage = (props: Props) => {

  const theme = useTheme();
  const { setSubAction } = useLocalVCSNavContext();
  const textareaContainer = useRef<HTMLDivElement>(null);
  const textarea = useRef<HTMLTextAreaElement>(null);

  const [isMessageFocused, setIsMessageFocused] = useState(false);

  const [message, setMessage] = useState("");

  const commitMutation = useCommitChanges(props.repository);

  const textareaBorderColor = useMemo(() => {
    if (!isMessageFocused) {
      return theme.colors.blurbBorder;
    }
    return ColorPalette.linkBlue;
  }, [theme, isMessageFocused]);

  const onGoBack = useCallback(() => {
    setSubAction(null);
  }, []);

  const backArrowIcon = useMemo(() => {
    if (theme.name == "light") {
      return BackArrowIconLight;
    }
    return BackArrowIconDark;
  }, [theme.name]);

  useEffect(() => {
    const commandToggleListeners = (event: KeyboardEvent) => {
      if (event.metaKey && event.shiftKey && event.key == "Backspace") {
        onGoBack();
      }
    };
    window.addEventListener("keydown", commandToggleListeners);
    return () => {
      window.removeEventListener("keydown", commandToggleListeners);
    };
  }, []);
  const onFocusMessage = useCallback(() => {
    setIsMessageFocused(true);
  }, []);
  const onBlurMessage = useCallback(() => {
    setIsMessageFocused(false);
  }, []);

  const onTextBoxChanged = useCallback(
    (event: React.ChangeEvent<HTMLTextAreaElement>): void => {
      setMessage(event.target.value);
    },
    []
  );

  const onCommit = useCallback(() => {
    commitMutation.mutate({
      message
    });
  }, [message]);

  const canCommit = useMemo(() => {
    if (!props.apiResponse.isWIP) {
      return false;
    }
    return (message?.length ?? 0) > 0;
  }, [message, props.apiResponse.isWIP]);

  useEffect(() => {
    if (commitMutation.isSuccess) {
      onGoBack();
    }
  }, [commitMutation.isSuccess])

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
              {"Commit Changes"}
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
          <Row>
            <TextAreaBlurbBox
              style={{
                border: `1px solid ${textareaBorderColor}`,
              }}
              ref={textareaContainer}
            >
              {message == "" && (
                <BlurbPlaceholder>
                  {"What changes did you make? (be descriptive)"}
                </BlurbPlaceholder>
              )}
              <BlurbTextArea
                ref={textarea}
                onFocus={onFocusMessage}
                onBlur={onBlurMessage}
                value={message}
                onChange={onTextBoxChanged}
              />
            </TextAreaBlurbBox>
          </Row>
        </TopContainer>
        <BottomContainer>
          <div
            style={{
              width: "100%",
              display: "flex",
              flexDirection: "row",
              justifyContent: "center",
            }}
          >
            <Button
              isDisabled={!canCommit}
              label={"commit changes"}
              bg={"orange"}
              size={"extra-big"}
              onClick={onCommit}
              isLoading={commitMutation.isLoading}
            />
          </div>
        </BottomContainer>
      </InnerContent>
    </>
  );
};
export default React.memo(NewBranchNavPage);
