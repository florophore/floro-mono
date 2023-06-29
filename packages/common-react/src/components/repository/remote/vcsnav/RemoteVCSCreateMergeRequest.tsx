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

import BackArrowIconLight from "@floro/common-assets/assets/images/icons/back_arrow.light.svg";
import BackArrowIconDark from "@floro/common-assets/assets/images/icons/back_arrow.dark.svg";
import { ComparisonState, RemoteCommitState } from "../hooks/remote-state";
import { useSearchParams } from "react-router-dom";
import SearchInput from "@floro/storybook/stories/design-system/SearchInput";
import { useRepoLinkBase } from "../hooks/remote-hooks";
import { useNavigate } from "react-router";
import ColorPalette from "@floro/styles/ColorPalette";
import Input from "@floro/storybook/stories/design-system/Input";
import Button from "@floro/storybook/stories/design-system/Button";

import BranchIconLight from "@floro/common-assets/assets/images/icons/branch_icon.light.svg";
import BranchIconDark from "@floro/common-assets/assets/images/icons/branch_icon.dark.svg";

import MergeIconLight from "@floro/common-assets/assets/images/repo_icons/merge.gray.svg";
import MergeIconDark from "@floro/common-assets/assets/images/repo_icons/merge.white.svg";

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
  top: 14px;
  transition: 500ms background-color;
`;

const LeftRow = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: flex-start;
  width: 188px;
`;

const RightRow = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: flex-start;
  width: 252px;
`;

const Icon = styled.img`
  width: 32px;
  height: 32px;
  margin-right: 12px;
`;

const LabelSpan = styled.span`
  font-size: 1.1rem;
  font-family: "MavenPro";
  font-weight: 600;
  color: ${(props) => props.theme.colors.contrastTextLight};
  white-space: nowrap;
`;

const ValueSpan = styled.span`
  font-size: 1rem;
  font-family: "MavenPro";
  font-weight: 500;
  color: ${(props) => props.theme.colors.contrastText};
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
`;

export const getBranchIdFromName = (name: string): string => {
  return name
    .toLowerCase()
    .replaceAll(" ", "-")
    .replaceAll(/[[\]'"]/g, "");
};

interface Props {
  repository: Repository;
  remoteCommitState: RemoteCommitState;
  comparisonState: ComparisonState;
  plugin: string;
}

const RemoteCreateMergeRequest = (props: Props) => {
  const theme = useTheme();
  const navigate = useNavigate();

  const branchIcon = useMemo(() => {
    if (theme.name == "light") {
      return BranchIconLight;
    }
    return BranchIconDark;
  }, [theme.name]);

  const mergeIcon = useMemo(() => {
    if (theme.name == "light") {
      return MergeIconLight;
    }
    return MergeIconDark;
  }, [theme.name]);

  //useEffect(() => {
  //    setUrlSearchParams({
  //      query: searchText,
  //      plugin: props.plugin,
  //      branch: branch ?? props?.repository?.branchState?.branchId ?? "",
  //      from: "remote"
  //    });

  //}, [searchText, isFocused])

  const linkBase = useRepoLinkBase(props.repository);
  const homeLink = useMemo(() => {
    if (!props.repository?.branchState?.branchId) {
      return `${linkBase}?from=remote&plugin=${props?.plugin ?? "home"}`;
    }
    return `${linkBase}?from=remote&branch=${
      props.repository?.branchState?.branchId
    }&plugin=${props.plugin ?? "home"}`;
  }, [props.repository?.branchState, linkBase, props.plugin]);
  const textareaContainer = useRef<HTMLDivElement>(null);
  const textarea = useRef<HTMLTextAreaElement>(null);
  const [isMessageFocused, setIsMessageFocused] = useState(false);
  const [isTitleFocused, setIsTitleFocused] = useState(false);

  const [title, setTitle] = useState(
    props?.repository?.branchState?.proposedMergeRequest?.suggestedTitle ?? ""
  );

  const [description, setDescription] = useState(
    props?.repository?.branchState?.proposedMergeRequest
      ?.suggestedDescription ?? ""
  );


  useEffect(() => {
    if (title == "" && props?.repository?.branchState?.proposedMergeRequest?.suggestedTitle != "") {
      setTitle(props?.repository?.branchState?.proposedMergeRequest?.suggestedTitle ?? "");
    }
  }, [title, props?.repository?.branchState?.proposedMergeRequest?.suggestedTitle])

  useEffect(() => {
    if (description == "" && props?.repository?.branchState?.proposedMergeRequest?.suggestedDescription != "") {
      setDescription(props?.repository?.branchState?.proposedMergeRequest?.suggestedDescription ?? "");
    }
  }, [description, props?.repository?.branchState?.proposedMergeRequest?.suggestedDescription])

  const onFocusTitle = useCallback(() => {
    setIsTitleFocused(true);
  }, []);

  const onBlurTitle = useCallback(() => {
    setIsTitleFocused(false);
  }, []);
  const onFocusMessage = useCallback(() => {
    setIsMessageFocused(true);
  }, []);

  const onBlurMessage = useCallback(() => {
    setIsMessageFocused(false);
  }, []);

  const textareaBorderColor = useMemo(() => {
    if (!isMessageFocused) {
      return theme.colors.blurbBorder;
    }
    return ColorPalette.linkBlue;
  }, [theme, isMessageFocused]);

  const onGoBack = useCallback(() => {
    navigate(homeLink);
  }, [homeLink]);

  const backArrowIcon = useMemo(() => {
    if (theme.name == "light") {
      return BackArrowIconLight;
    }
    return BackArrowIconDark;
  }, [theme.name]);

  const onTextBoxChanged = useCallback(
    (event: React.ChangeEvent<HTMLTextAreaElement>): void => {
      setDescription(event.target.value);
    },
    []
  );

  const branch = useMemo(() => {
    return props.repository?.repoBranches?.find(
      (b) => b?.id == props.repository?.branchState?.branchId
    );
  }, [props.repository?.repoBranches, props.repository?.branchState?.branchId]);

  const baseBranch = useMemo(() => {
    if (!branch?.baseBranchId) {
      return null;
    }
    return props.repository?.repoBranches?.find(
      (b) => b?.id == branch?.baseBranchId
    );
  }, [props.repository?.repoBranches, branch]);

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
              {"Create Merge Request"}
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
          <Row style={{marginTop: 16, justifyContent: "flex-start"}}>
            <LeftRow>
              <Icon src={branchIcon} />
              <LabelSpan>{"From Branch:"}</LabelSpan>
            </LeftRow>
            <RightRow>
              {branch?.name && <ValueSpan>{branch?.name}</ValueSpan>}
              {!branch?.name && <ValueSpan>{"None"}</ValueSpan>}
            </RightRow>
          </Row>
          <Row style={{marginTop: 16, justifyContent: "flex-start"}}>
            <LeftRow>
              <Icon src={mergeIcon} />
              <LabelSpan>{"Merging Into:"}</LabelSpan>
            </LeftRow>
            <RightRow>
              {baseBranch?.name && <ValueSpan>{baseBranch?.name}</ValueSpan>}
              {!baseBranch?.name && <ValueSpan>{"None"}</ValueSpan>}
            </RightRow>
          </Row>
          <Row style={{marginTop: 16}}>
            <Input
              value={title}
              label={"title"}
              placeholder={"title"}
              onTextChanged={setTitle}
              widthSize="wide"
            />
          </Row>
          <Row>
            <TextAreaBlurbBox
              style={{
                border: `1px solid ${textareaBorderColor}`,
                position: "relative",
              }}
              ref={textareaContainer}
            >
              <LabelContainer>
                <LabelBorderEnd
                  style={{ left: -1, background: textareaBorderColor }}
                />
                <LabelText style={{ color: textareaBorderColor }}>
                  {"description"}
                </LabelText>
                <LabelBorderEnd style={{ right: -1 }} />
              </LabelContainer>
              {description == "" && (
                <BlurbPlaceholder>
                  {"Write a description from your merge request"}
                </BlurbPlaceholder>
              )}
              <BlurbTextArea
                ref={textarea}
                onFocus={onFocusMessage}
                onBlur={onBlurMessage}
                value={description}
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
              label={"create merge request"}
              bg={"orange"}
              size={"extra-big"}
            />
          </div>
        </BottomContainer>
      </InnerContent>
    </>
  );
};
export default React.memo(RemoteCreateMergeRequest);
