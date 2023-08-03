import React, {
  useMemo,
  useState,
  useCallback,
  useRef,
  useEffect,
} from "react";
import {
  Repository,
  useProposedMergeRequestRepositoryUpdatesSubscription,
  useCreateMergeRequestMutation,
  useUpdateMergeRequestMutation,
  useUpdateMergeRequestStatusMutation,
  useDeleteMergeRequestStatusMutation,
  useMergeMergeRequestMutation,
} from "@floro/graphql-schemas/src/generated/main-client-graphql";
import styled from "@emotion/styled";
import { useTheme } from "@emotion/react";

import CheckMarkWhite from "@floro/common-assets/assets/images/icons/check.dark.svg";
import XMarkWhite from "@floro/common-assets/assets/images/icons/x_cross.white.svg"
import MergeIconWhite from "@floro/common-assets/assets/images/repo_icons/merge.white.svg";
import BackArrowIconLight from "@floro/common-assets/assets/images/icons/back_arrow.light.svg";
import BackArrowIconDark from "@floro/common-assets/assets/images/icons/back_arrow.dark.svg";
import {
  ComparisonState,
  RemoteCommitState,
  useMergeRequestReviewPage,
} from "../hooks/remote-state";
import { useSearchParams } from "react-router-dom";
import SearchInput from "@floro/storybook/stories/design-system/SearchInput";
import { useRepoLinkBase } from "../hooks/remote-hooks";
import { useNavigate } from "react-router";
import ColorPalette from "@floro/styles/ColorPalette";
import Input from "@floro/storybook/stories/design-system/Input";
import Button from "@floro/storybook/stories/design-system/Button";
import RepoUndoReviewButton from "@floro/storybook/stories/repo-components/RepoUndoReviewButton";

import TrashIconWhite from "@floro/common-assets/assets/images/icons/trash.dark.svg";

import BranchIconLight from "@floro/common-assets/assets/images/icons/branch_icon.light.svg";
import BranchIconDark from "@floro/common-assets/assets/images/icons/branch_icon.dark.svg";

import MergeIconLight from "@floro/common-assets/assets/images/repo_icons/merge.gray.svg";
import MergeIconDark from "@floro/common-assets/assets/images/repo_icons/merge.white.svg";

import ResolveWhite from "@floro/common-assets/assets/images/repo_icons/resolve.white.svg";
import ResolveGray from "@floro/common-assets/assets/images/repo_icons/resolve.gray.svg";

import MergeWhite from "@floro/common-assets/assets/images/repo_icons/merge.white.svg";
import MergeGray from "@floro/common-assets/assets/images/repo_icons/merge.gray.svg";
import ResolveMediumGray from "@floro/common-assets/assets/images/repo_icons/resolve.medium_gray.svg";

import AbortWhite from "@floro/common-assets/assets/images/repo_icons/abort.white.svg";
import AbortGray from "@floro/common-assets/assets/images/repo_icons/abort.gray.svg";
import AbortMediumGray from "@floro/common-assets/assets/images/repo_icons/abort.medium_gray.svg";
import { useMergeRequestNavContext } from "../mergerequest/MergeRequestContext";
import ReviewSearch from "../mergerequest/review_search/ReviewSearch";
import ProposedMRHistoryDisplay from "../history/ProposedMRHistoryDisplay";
import Reviewers from "../mergerequest/Reviewers";
import CloseMergeRequestModal from "../mergerequest/modals/CloseMergeRequestModal";
import MergeMergeRequestModal from "../mergerequest/modals/MergeMergeRequestModal";

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
const ReviewCircle = styled.div`
  width: 24px;
  height: 24px;
  border-radius: 50%;
  margin-right: 15px;
  margin-left: 5px;
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

const SubTitleSpan = styled.span`
  font-size: 1.4rem;
  font-family: "MavenPro";
  font-weight: 500;
  color: ${(props) => props.theme.colors.contrastTextLight};
  white-space: nowrap;
`;

const ButtonRow = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;
  width: 100%;
  justify-content: space-between;
`;

const ClosedPill = styled.div`
  height: 24px;
  width: 100px;
  border-radius: 12px;
  background: ${(props) => props.theme.colors.pluginTitle};
  display: flex;
  justify-content: center;
  align-items: center;
`;

const ClosedTitle = styled.div`
  font-family: "MavenPro";
  font-weight: 600;
  font-size: 1rem;
  color: ${ColorPalette.white};
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
  plugin: string;
}

const RemoteVCSMergeRequest = (props: Props) => {
  const theme = useTheme();
  const navigate = useNavigate();
  const { isEditting, setIsEditting } = useMergeRequestNavContext();
  const [showCloseModal, setShowCloseModal] = useState(false);
  const [showMergeModal, setShowMergeModal] = useState(false);
  const [updateStatus, updateStatusMutation] = useUpdateMergeRequestStatusMutation();
  const [deleteStatus, deleteStatusMutation] = useDeleteMergeRequestStatusMutation();
  const [merge, mergeMutation] = useMergeMergeRequestMutation();

  const onClose = useCallback(() => {
    setShowCloseModal(true);
  }, []);

  const onHideClose = useCallback(() => {
    setShowCloseModal(false);
  }, []);

  const onCloseMergeModal = useCallback(() => {
    setShowMergeModal(true);
  }, []);

  const onHideMergeModal = useCallback(() => {
    setShowMergeModal(false);
  }, []);

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

  const nothingToPushIcon = useMemo(() => {
    if (theme.name == "light") {
      return MergeGray;
    }
    return MergeWhite;
  }, [theme.name]);

  const resolveIcon = useMemo(() => {
    if (theme.name == "light") {
      return ResolveGray;
    }
    return ResolveWhite;
  }, [theme.name]);

  const abortIcon = useMemo(() => {
    if (theme.name == "light") {
      return AbortGray;
    }
    return AbortWhite;
  }, [theme.name]);

  const reviewStatus = useMemo(() => {
    if (
      props?.repository?.mergeRequest?.mergeRequestPermissions
        ?.requireApprovalToMerge &&
      props?.repository?.mergeRequest?.mergeRequestPermissions
        ?.requireReapprovalOnPushToMerge
    ) {
      const reviews = props?.repository?.mergeRequest?.reviewStatuses?.filter(
        (rs) => {
          return (
            rs?.branchHeadShaAtUpdate ==
            props?.repository?.mergeRequest?.branchState?.commitState?.sha
          );
        }
      );
      const hasBlock = reviews?.find((r) => r?.approvalStatus == "blocked");
      if (hasBlock) {
        return "blocked";
      }
      const hasApproval = reviews?.find((r) => r?.approvalStatus == "approved");
      if (hasApproval) {
        return "approved";
      }
      return "pending";
    }
    const reviews = props?.repository?.mergeRequest?.reviewStatuses;
    const hasBlock = reviews?.find((r) => r?.approvalStatus == "blocked");
    if (hasBlock) {
      return "blocked";
    }
    const hasApproval = reviews?.find((r) => r?.approvalStatus == "approved");
    if (hasApproval) {
      return "approved";
    }
    return "pending";
  }, [
    props?.repository?.mergeRequest,
    props?.repository?.mergeRequest?.reviewStatuses,
    props?.repository?.mergeRequest?.branchState?.commitState,
    props?.repository?.mergeRequest?.mergeRequestPermissions,
  ]);

  const reviewStatusColor = useMemo(() => {
    if (reviewStatus == "blocked") {
      return theme.name == "light" ? ColorPalette.red : ColorPalette.lightRed;
    }
    if (reviewStatus == "approved") {
      return ColorPalette.teal;
    }

    return ColorPalette.gray;
  }, [reviewStatus, theme.name]);

  const closedReviewStatusColor = useMemo(() => {
    if (props?.repository?.mergeRequest?.wasClosedWithoutMerging) {
      return theme.name == "light" ? ColorPalette.red : ColorPalette.lightRed;
    }
    return ColorPalette.teal;
  }, [props?.repository?.mergeRequest?.wasClosedWithoutMerging, theme.name]);

  const closedReviewStatusText = useMemo(() => {
    if (props?.repository?.mergeRequest?.wasClosedWithoutMerging) {
      return 'closed';
    }
    return 'merged';
  }, [props?.repository?.mergeRequest?.wasClosedWithoutMerging, theme.name]);

  const reviewStatusText = useMemo(() => {
    if (reviewStatus == "blocked") {
      return "Blocked";
    }
    if (reviewStatus == "approved") {
      return "Approved";
    }
    if (!props?.repository?.mergeRequest?.isOpen) {
      return 'Unreviewed';
    }

    return "Pending Review";
  }, [reviewStatus, theme.name, props?.repository?.mergeRequest?.isOpen]);

  const linkBase = useRepoLinkBase(props.repository);
  const { reviewPage, setReviewPage } = useMergeRequestReviewPage();
  const backLink = useMemo(() => {
    const mrFilter = props?.repository?.mergeRequest?.isOpen ? "open" : "closed";
    if (!props.repository?.mergeRequest?.branchState?.branchId) {
      return `${linkBase}/mergerequests?from=remote&plugin=${
        props?.plugin ?? "home"
      }&filter_mr=${mrFilter}`;
    }
    return `${linkBase}/mergerequests?from=remote&branch=${
      props.repository?.mergeRequest?.branchState?.branchId
    }&plugin=${props.plugin ?? "home"}&filter_mr=${mrFilter}`;
  }, [props.repository?.mergeRequest?.branchState, linkBase, props.plugin, props?.repository?.mergeRequest?.isOpen]);
  const textareaContainer = useRef<HTMLDivElement>(null);
  const textarea = useRef<HTMLTextAreaElement>(null);
  const [isMessageFocused, setIsMessageFocused] = useState(false);

  const [title, setTitle] = useState(
    props?.repository?.mergeRequest?.title ?? ""
  );

  const [description, setDescription] = useState(
    props?.repository?.mergeRequest?.description ?? ""
  );

  useEffect(() => {
    if (title == "" && props?.repository?.mergeRequest?.title != "") {
      setTitle(props?.repository?.mergeRequest?.title ?? "");
    }
  }, [ props?.repository?.mergeRequest?.title]);

  useEffect(() => {
    if (
      description == "" &&
      props?.repository?.mergeRequest?.description != ""
    ) {
      setDescription(props?.repository?.mergeRequest?.description ?? "");
    }
  }, [props?.repository?.mergeRequest?.description]);

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
    if (isEditting) {
      setIsEditting(false);
      return;
    }
    if (reviewPage == "commits") {
      setReviewPage("none");
      return;
    }
    navigate(backLink);
  }, [backLink, reviewPage, isEditting]);

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
      (b) => b?.id == props.repository?.mergeRequest?.branchState?.branchId
    );
  }, [
    props.repository?.repoBranches,
    props.repository?.mergeRequest?.branchState?.branchId,
  ]);

  const [updateMergeRequest, updateMergeRequestRequest] =
    useUpdateMergeRequestMutation();

  const disableUpdate = useMemo(() => {
    if (
      !props?.repository?.mergeRequest?.mergeRequestPermissions?.canEditInfo
    ) {
      return false;
    }
    if (title?.trim() == "") {
      return true;
    }
    if (description?.trim() == "") {
      return true;
    }
    return false;
  }, [
    title,
    description,
    props?.repository?.mergeRequest?.mergeRequestPermissions?.canEditInfo,
  ]);

  const requireMergeWarning = useMemo(() => {
    if (props?.repository?.mergeRequest?.approvalStatus == "approved") {
      return false;
    }
    if (props?.repository?.isPrivate && props.repository?.repoType == "user_repo") {
      return false;
    }
    return true;
  }, [])

  const onMerge = useCallback(() => {
    if (requireMergeWarning) {
      setShowMergeModal(true);
      return;
    }

    if (!props.repository.id || !props?.repository?.mergeRequest?.id) {
      return;
    }
    merge({
      variables: {
        repositoryId: props?.repository?.id,
        mergeRequestId: props?.repository?.mergeRequest?.id,
      },
    });
  }, [requireMergeWarning, props.repository.id, props?.repository?.mergeRequest?.id]);

  const onApprove = useCallback(() => {
    if (!props?.repository?.id) {
      return false;
    }
    if (!props?.repository?.mergeRequest?.id) {
      return false;
    }
    updateStatus({
      variables: {
        repositoryId: props?.repository?.id,
        mergeRequestId: props?.repository?.mergeRequest.id,
        approvalStatus: "approved"
      }
    })
  }, [props?.repository?.mergeRequest?.id, props?.repository?.id]);

  const onBlock = useCallback(() => {
    if (!props?.repository?.id) {
      return false;
    }
    if (!props?.repository?.mergeRequest?.id) {
      return false;
    }
    updateStatus({
      variables: {
        repositoryId: props?.repository?.id,
        mergeRequestId: props?.repository?.mergeRequest.id,
        approvalStatus: "blocked"
      }
    })
  }, [props?.repository?.mergeRequest?.id, props?.repository?.id]);

  const onDeleteStatus = useCallback(() => {
    if (!props?.repository?.id) {
      return false;
    }
    if (!props?.repository?.mergeRequest?.id) {
      return false;
    }
    deleteStatus({
      variables: {
        repositoryId: props?.repository?.id,
        mergeRequestId: props?.repository?.mergeRequest.id,
      }
    })
  }, [props?.repository?.mergeRequest?.id, props?.repository?.id]);

  const onUpdate = useCallback(() => {
    if (disableUpdate) {
      return;
    }
    if (!props?.repository?.id) {
      return false;
    }
    if (!props?.repository?.mergeRequest?.id) {
      return false;
    }
    if (
      title == props?.repository?.mergeRequest.title &&
      description == props?.repository?.mergeRequest?.description
    ) {
      setIsEditting(false);
      return;
    }
    updateMergeRequest({
      variables: {
        repositoryId: props?.repository?.id,
        mergeRequestId: props?.repository?.mergeRequest.id,
        title,
        description,
      },
    });
  }, [
    disableUpdate,
    props?.repository?.id,
    props?.repository?.mergeRequest?.id,
    title,
    description,
  ]);

  useEffect(() => {
    if (
      updateMergeRequestRequest?.data?.updateMergeRequestInfo?.__typename ==
      "UpdateMergeRequestInfoSuccess"
    ) {
      setIsEditting(false);
    }
  }, [updateMergeRequestRequest?.data?.updateMergeRequestInfo]);

  return (
    <>
      {props?.repository?.mergeRequest && (
        <CloseMergeRequestModal
          repository={props.repository}
          mergeRequest={props?.repository.mergeRequest}
          show={showCloseModal}
          onDismiss={onHideClose}
        />
      )}
      {props?.repository?.mergeRequest && (
        <MergeMergeRequestModal
          repository={props.repository}
          mergeRequest={props?.repository.mergeRequest}
          show={showMergeModal}
          onDismiss={onHideMergeModal}
        />
      )}
      <InnerContent>
        <TopContainer>
          <TitleRow>
            <TitleSpan
              style={{
                paddingTop: 6,
              }}
            >
              {`Merge Request [${props?.repository?.mergeRequest?.mergeRequestCount}]`}
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
          {!isEditting && (
            <>
              <Row style={{ marginTop: 16, justifyContent: "flex-start" }}>
                <LeftRow>
                  <Icon src={branchIcon} />
                  <LabelSpan>{"From Branch:"}</LabelSpan>
                </LeftRow>
                <RightRow>
                  {props?.repository?.mergeRequest?.branchState?.branchName && (
                    <ValueSpan>
                      {props?.repository?.mergeRequest?.branchState?.branchName}
                    </ValueSpan>
                  )}
                  {!props?.repository?.mergeRequest?.branchState
                    ?.branchName && <ValueSpan>{"None"}</ValueSpan>}
                </RightRow>
              </Row>
              <Row style={{ marginTop: 16, justifyContent: "flex-start" }}>
                <LeftRow>
                  <Icon src={mergeIcon} />
                  <LabelSpan>{"Merging Into:"}</LabelSpan>
                </LeftRow>
                <RightRow>
                  {props?.repository?.mergeRequest?.branchState
                    ?.baseBranchName && (
                    <ValueSpan>
                      {
                        props?.repository?.mergeRequest?.branchState
                          ?.baseBranchName
                      }
                    </ValueSpan>
                  )}
                  {!props?.repository?.mergeRequest?.branchState
                    ?.baseBranchName && <ValueSpan>{"None"}</ValueSpan>}
                </RightRow>
              </Row>
              {props?.repository?.mergeRequest?.isOpen && (
                <>
                  {props?.repository?.mergeRequest?.isMerged && (
                    <Row
                      style={{ marginTop: 16, justifyContent: "flex-start" }}
                    >
                      <Icon src={nothingToPushIcon} />
                      <LabelSpan style={{ fontStyle: "italic" }}>
                        {"Nothing to Merge"}
                      </LabelSpan>
                    </Row>
                  )}
                  {!props?.repository?.mergeRequest?.isMerged &&
                    props.repository?.mergeRequest?.isConflictFree && (
                      <Row
                        style={{ marginTop: 16, justifyContent: "flex-start" }}
                      >
                        <Icon src={resolveIcon} />
                        <LabelSpan>{"No conflicts"}</LabelSpan>
                      </Row>
                    )}
                  {!props?.repository?.mergeRequest?.isMerged &&
                    !props.repository?.mergeRequest?.isConflictFree && (
                      <Row
                        style={{ marginTop: 16, justifyContent: "flex-start" }}
                      >
                        <Icon src={abortIcon} />
                        <LabelSpan>{"Has conflicts"}</LabelSpan>
                      </Row>
                    )}
                </>
              )}
              <Row style={{ marginTop: 16, justifyContent: "space-between" }}>
                <div
                  style={{
                    display: "flex",
                    flexDirection: "row",
                    justifyContent: "flex-start",
                    alignItems: "center",
                  }}
                >
                  <ReviewCircle style={{ background: reviewStatusColor }} />
                  <LabelSpan>{reviewStatusText}</LabelSpan>
                </div>
                {props?.repository?.mergeRequest?.isOpen && (
                  <ClosedPill style={{ background: ColorPalette.orange }}>
                    <ClosedTitle>{"open"}</ClosedTitle>
                  </ClosedPill>
                )}
                {!props?.repository?.mergeRequest?.isOpen && (
                  <ClosedPill style={{ background: closedReviewStatusColor }}>
                    <ClosedTitle>{closedReviewStatusText}</ClosedTitle>
                  </ClosedPill>
                )}
              </Row>
              {props.repository?.mergeRequest &&
                (props.repository?.mergeRequest?.isOpen ||
                  (props?.repository?.mergeRequest?.reviewerRequests?.length ??
                    0) > 0) && (
                  <>
                    <Row style={{ marginBottom: 0 }}>
                      <SubTitleSpan>{"Reviewers"}</SubTitleSpan>
                    </Row>
                    {props?.repository?.mergeRequest?.mergeRequestPermissions
                      ?.canEditReviewers &&
                      (props?.repository?.mergeRequest?.reviewerRequests
                        ?.length ?? 0) <= 2 && (
                        <ReviewSearch
                          repository={props.repository}
                          mergeRequest={props.repository?.mergeRequest}
                        />
                      )}
                    <Reviewers
                      repository={props.repository}
                      mergeRequest={props.repository.mergeRequest}
                    />
                  </>
                )}
            </>
          )}
          {isEditting && (
            <>
              <Row style={{ marginTop: 16 }}>
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
            </>
          )}
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
            {!isEditting && (
              <div
                style={{
                  display: "block",
                  flexDirection: "column",
                  width: "100%",
                }}
              >
                {props?.repository?.mergeRequest?.mergeRequestPermissions
                  ?.canReview && (
                  <>
                    {props?.repository?.mergeRequest?.mergeRequestPermissions
                      ?.hasApproved && (
                      <RepoUndoReviewButton
                        onClick={onDeleteStatus}
                        isLoading={deleteStatusMutation.loading}
                        isApproved={true}
                      />
                    )}
                    {props?.repository?.mergeRequest?.mergeRequestPermissions
                      ?.hasBlocked && (
                      <RepoUndoReviewButton
                        onClick={onDeleteStatus}
                        isLoading={deleteStatusMutation.loading}
                        isApproved={false}
                      />
                    )}
                    {!props?.repository?.mergeRequest?.mergeRequestPermissions
                      ?.hasApproved &&
                      !props?.repository?.mergeRequest?.mergeRequestPermissions
                        ?.hasBlocked && (
                        <ButtonRow>
                          <Button
                            isLoading={updateStatusMutation.loading}
                            onClick={onApprove}
                            label={
                              <div
                                style={{
                                  display: "flex",
                                  flexDirection: "row",
                                  justifyContent: "space-between",
                                  alignItems: "center",
                                  width: "100%",
                                  paddingLeft: 24,
                                  paddingRight: 36,
                                }}
                              >
                                <img
                                  style={{
                                    height: 32,
                                    width: 32,
                                    marginRight: 16,
                                  }}
                                  src={CheckMarkWhite}
                                />
                                <div
                                  style={{
                                    display: "flex",
                                    flexDirection: "row",
                                    justifyContent: "center",
                                    alignItems: "center",
                                    width: "100%",
                                    marginRight: 16,
                                  }}
                                >
                                  <span>{"approve"}</span>
                                </div>
                              </div>
                            }
                            bg={"teal"}
                            size={"extra-big"}
                          />
                          <div style={{ width: 48 }} />
                          <Button
                            isLoading={updateStatusMutation.loading}
                            onClick={onBlock}
                            label={
                              <div
                                style={{
                                  display: "flex",
                                  flexDirection: "row",
                                  justifyContent: "space-between",
                                  alignItems: "center",
                                  width: "100%",
                                  paddingLeft: 24,
                                  paddingRight: 36,
                                }}
                              >
                                <img
                                  style={{
                                    height: 28,
                                    width: 28,
                                    marginRight: 16,
                                  }}
                                  src={XMarkWhite}
                                />
                                <div
                                  style={{
                                    display: "flex",
                                    flexDirection: "row",
                                    justifyContent: "center",
                                    alignItems: "center",
                                    width: "100%",
                                    marginRight: 16,
                                  }}
                                >
                                  <span>{"block"}</span>
                                </div>
                              </div>
                            }
                            bg={"red"}
                            size={"extra-big"}
                          />
                        </ButtonRow>
                      )}
                  </>
                )}
                {props?.repository?.mergeRequest?.isOpen &&
                  !!props.repository?.mergeRequest?.mergeRequestPermissions
                    ?.canClose && (
                    <ButtonRow style={{ marginTop: 24 }}>
                      <Button
                        onClick={onClose}
                        label={
                          <div
                            style={{
                              display: "flex",
                              flexDirection: "row",
                              justifyContent: "space-between",
                              alignItems: "center",
                              width: "100%",
                              paddingLeft: 24,
                              paddingRight: 36,
                            }}
                          >
                            <img
                              style={{
                                height: 32,
                                width: 32,
                                marginRight: 16,
                              }}
                              src={TrashIconWhite}
                            />
                            <div
                              style={{
                                display: "flex",
                                flexDirection: "row",
                                justifyContent: "center",
                                alignItems: "center",
                                width: "100%",
                                marginRight: 16,
                              }}
                            >
                              <span>{"close merge request"}</span>
                            </div>
                          </div>
                        }
                        bg={"gray"}
                        size={"extra-big"}
                      />
                    </ButtonRow>
                  )}
                {props?.repository?.mergeRequest?.mergeRequestPermissions
                  ?.allowedToMerge &&
                  props?.repository?.mergeRequest?.isOpen &&
                  !!props.repository?.mergeRequest?.mergeRequestPermissions
                    ?.canClose && (
                    <ButtonRow style={{ marginTop: 24 }}>
                      <Button
                        onClick={onMerge}
                        isLoading={mergeMutation.loading}
                        label={
                          <div
                            style={{
                              display: "flex",
                              flexDirection: "row",
                              justifyContent: "space-between",
                              alignItems: "center",
                              width: "100%",
                              paddingLeft: 24,
                              paddingRight: 36,
                            }}
                          >
                            <img
                              style={{
                                height: 32,
                                width: 32,
                                marginRight: 16,
                              }}
                              src={MergeIconWhite}
                            />
                            <div
                              style={{
                                display: "flex",
                                flexDirection: "row",
                                justifyContent: "center",
                                alignItems: "center",
                                width: "100%",
                                marginRight: 16,
                              }}
                            >
                              <span>
                                {props?.repository?.mergeRequest?.isMerged
                                  ? "nothing to merge"
                                  : "merge branch & close"}
                              </span>
                            </div>
                          </div>
                        }
                        bg={"purple"}
                        size={"extra-big"}
                        isDisabled={
                          !props?.repository?.mergeRequest?.canMerge ||
                          !!props?.repository?.mergeRequest?.isMerged
                        }
                      />
                    </ButtonRow>
                  )}
              </div>
            )}
            {isEditting && (
              <Button
                onClick={onUpdate}
                isDisabled={disableUpdate}
                isLoading={updateMergeRequestRequest.loading}
                label={"edit merge request info"}
                bg={"orange"}
                size={"extra-big"}
              />
            )}
          </div>
        </BottomContainer>
      </InnerContent>
    </>
  );
};
export default React.memo(RemoteVCSMergeRequest);
