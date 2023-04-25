import React, { useMemo, useState, useCallback, useEffect, useRef } from "react";
import { Repository } from "@floro/graphql-schemas/src/generated/main-client-graphql";
import styled from "@emotion/styled";
import { useTheme } from "@emotion/react";
import Button from "@floro/storybook/stories/design-system/Button";
import { ApiResponse, SourceCommitNode } from "@floro/floro-lib/src/repo";
import { useLocalVCSNavContext } from "./LocalVCSContext";
import { useSourceGraphPortal } from "../../sourcegraph/SourceGraphUIContext";
import SourceGraph from "@floro/storybook/stories/common-components/SourceGraph";
import {
  SourceCommitNodeWithGridDimensions,
  Branch,
} from "@floro/storybook/stories/common-components/SourceGraph/grid";
import {
  useAmend,
  useAutoFix,
  useCanAmend,
  useCanAutoFix,
  useCanCherryPick,
  useCanMoveWIP,
  useCheckoutCommitSha,
  useCherryPick,
  useRevert,
  useSourceGraph,
  useUpdateBranch,
} from "../hooks/local-hooks";

import ColorPalette from "@floro/styles/ColorPalette";
import BackArrowIconLight from "@floro/common-assets/assets/images/icons/back_arrow.light.svg";
import BackArrowIconDark from "@floro/common-assets/assets/images/icons/back_arrow.dark.svg";
import RepoActionButton from "@floro/storybook/stories/repo-components/RepoActionButton";
import SGSelectShaModal from "../../sourcegraph/sourgraphmodals/SGSelectShaModal";
import TimeAgo from "javascript-time-ago";

import en from "javascript-time-ago/locale/en";
import ConfirmCheckoutShaModal from "../modals/ConfirmCheckoutShaModal";
import SGPlainModal from "../../sourcegraph/sourgraphmodals/SGPlainModal";

TimeAgo.addDefaultLocale(en);

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

const EmptySourceGraphContainer = styled.div`
  display: flex;
  height: 100%;
  width: 100%;
  flex-direction: center;
  justify-content: center;
  align-items: center;
`;

const EmptySourceGraphTextWrapper = styled.div`
  width: 50%;
  max-width: 450px;
  flex-direction: center;
  justify-content: center;
`;

const EmptySourceGraphText = styled.h3`
  font-weight: 600;
  font-size: 2rem;
  font-family: "MavenPro";
  text-align: center;
  color: ${(props) => props.theme.colors.contrastText};
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
`;

const SwitchText = styled.p`
  font-size: 1.2rem;
  font-family: "MavenPro";
  font-weight: 400;
  color: ${(props) => props.theme.colors.contrastText};
`;

const BlurbBox = styled.div`
  font-family: "MavenPro";
  font-weight: 600;
  font-size: 1.4rem;
  border: 1px solid ${(props) => props.theme.colors.blurbBorder};
  overflow-y: scroll;
  padding: 16px;
  border-radius: 8px;
  height: 184px;
  width: 100%;
`;

const BlurbText = styled.span`
  color: ${(props) => props.theme.colors.blurbBorder};
  font-family: "MavenPro";
  font-weight: 400;
  font-size: 1rem;
  white-space: pre-wrap;
  overflow-wrap: break-word;
  display: block;
`;

const TextRow = styled.div`
  display: block;
`;

const TimeTextRow = styled.div`
  display: flex;
  justify-content: flex-end;
  align-items: flex-end;
  width: 400px;
`;

const ElapseText = styled.p`
  padding: 0px 4px;
  margin: 0;
  font-size: 0.9rem;
  font-family: "MavenPro";
  font-weight: 600;
  color: ${(props) => props.theme.colors.repoBriefRowUpdateColor};
`;

const ElapseSince = styled.span`
  font-weight: 400;
`;

const Label = styled.span`
  display: inline;
  font-weight: 600;
  font-size: 1.2rem;
  font-family: "MavenPro";
  color: ${(props) => props.theme.colors.titleText};
`;

const Value = styled.span`
  display: inline;
  margin-left: 16px;
  font-weight: 500;
  font-size: 1rem;
  font-family: "MavenPro";
  color: ${(props) => props.theme.colors.contrastText};
`;

const ButtonRow = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;
  width: 100%;
  justify-content: space-between;
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
  return name
    .toLowerCase()
    .replaceAll(" ", "-")
    .replaceAll(/[[\]'"]/g, "");
};

interface Props {
  repository: Repository;
  apiResponse: ApiResponse;
}

const SourceGraphNav = (props: Props) => {
  const theme = useTheme();
  const { setSubAction } = useLocalVCSNavContext();

  const [showAmend, setShowAmend] = useState(false);

  const editBranchMutation = useUpdateBranch(props.repository);

  const [selectedSha, setSelectedSha] = useState(
    props.apiResponse?.repoState?.commit
  );

  const textareaContainer = useRef<HTMLDivElement>(null);
  const textarea = useRef<HTMLTextAreaElement>(null);

  const { data: canMoveWIPQuery } = useCanMoveWIP(
    props.repository,
    selectedSha ?? null
  );

  const { data: sourceGraphResponse, isLoading: sourceGraphLoading } =
    useSourceGraph(props.repository);

  const checkoutCommitShaMutation = useCheckoutCommitSha(props.repository);

  const canCherryPickQuery = useCanCherryPick(props.repository, selectedSha);
  const canAmendQuery = useCanAmend(props.repository, selectedSha);
  const canAutoFixQuery = useCanAutoFix(props.repository, selectedSha);

  const cherryPickMutation = useCherryPick(props.repository);
  const revertMutation = useRevert(props.repository);
  const autofixMutation = useAutoFix(props.repository);
  const amendMutation = useAmend(props.repository);

  const selectedCommit = useMemo(() => {
    return sourceGraphResponse?.pointers[selectedSha as string];
  }, [selectedSha, sourceGraphResponse]);

  const [amendMessage, setAmendMessage] = useState(selectedCommit?.message ?? "")

  useEffect(() => {
    setAmendMessage(selectedCommit?.message ?? "");
  }, [selectedCommit?.message]);

  useEffect(() => {
    if (cherryPickMutation.isSuccess) {
      setSubAction(null);
    }
  }, [cherryPickMutation]);

  useEffect(() => {
    if (revertMutation.isSuccess) {
      setSubAction(null);
    }
  }, [revertMutation]);

  useEffect(() => {
    if (autofixMutation.isSuccess) {
      setSubAction(null);
    }
  }, [autofixMutation]);

  useEffect(() => {
    if (amendMutation.isSuccess) {
      setShowAmend(false);
      if (props.apiResponse.lastCommit?.sha) {
        setSelectedSha(props.apiResponse.lastCommit?.sha);
      }
    }
  }, [amendMutation]);

  const selectedShaIsAncestor = useMemo(() => {
    if (!selectedSha) {
      return false;
    }
    const toSha = props?.apiResponse?.lastCommit?.sha;
    if (!toSha) {
      return true;
    }
    if (selectedSha == toSha) {
      return true;
    }
    let current: SourceCommitNode | undefined =
      sourceGraphResponse?.pointers[toSha];
    if (!current) {
      return false;
    }
    while (current?.parent) {
      current = sourceGraphResponse?.pointers[current.parent];
      if (current?.sha == selectedSha) {
        return true;
      }
    }
    return false;
  }, [
    selectedSha,
    props?.apiResponse?.lastCommit?.sha,
    sourceGraphResponse?.pointers,
  ]);

  const timeAgo = useMemo(() => new TimeAgo("en-US"), []);
  const [showConfirmCheckoutModal, setShowConfirmCheckoutModal] =
    useState(false);

  const onShowConfirmCheckoutModal = useCallback(() => {
    setShowConfirmCheckoutModal(true);
  }, []);

  const onHideConfirmCheckoutModal = useCallback(() => {
    setShowConfirmCheckoutModal(false);
  }, []);

  const onGoBack = useCallback(() => {
    if (showAmend) {
        setShowAmend(false);
        return;
    }
    setSubAction(null);
  }, [showAmend]);

  useEffect(() => {
    if (editBranchMutation.isSuccess) {
      onGoBack();
    }
  }, [editBranchMutation]);

  const backArrowIcon = useMemo(() => {
    if (theme.name == "light") {
      return BackArrowIconLight;
    }
    return BackArrowIconDark;
  }, [theme.name]);

  const onSelectSha = useCallback(
    (sourceCommit: SourceCommitNodeWithGridDimensions | null) => {
      if (sourceCommit) {
        setSelectedSha(sourceCommit.sha);
      }
    },
    []
  );

  const onSelectBranch = useCallback(
    (branch: Branch | null) => {
      if (branch?.lastCommit) {
        setSelectedSha(branch?.lastCommit);
      }
    },
    []
  );

  const onSelectAmend = useCallback(() => {
    setShowAmend(true);
  }, []);

  const canCheckOutSha = useMemo(() => {
    if (props.apiResponse.repoState.commit == selectedSha) {
      return false;
    }
    if (!props.apiResponse.repoState.commit) {
      return false;
    }

    if (!selectedSha) {
      return false;
    }
    if (!props.apiResponse.isWIP) {
      return true;
    }
    return canMoveWIPQuery?.canSwitch;
  }, [
    props.apiResponse.repoState.commit,
    selectedSha,
    canMoveWIPQuery,
    props.apiResponse.isWIP,
  ]);

  const showModalOnCheckout = useMemo(() => {
    if (props.apiResponse.isWIP && props.apiResponse.branch?.id) {
      return true;
    }
    return false;
  }, [props.apiResponse.isWIP, props.apiResponse.branch?.id]);

  const onClickCheckoutCommit = useCallback(() => {
    if (!selectedSha) {
      return;
    }
    if (showModalOnCheckout) {
      onShowConfirmCheckoutModal();
      return;
    }
    checkoutCommitShaMutation.mutate({
      sha: selectedSha,
    });
  }, [
    showModalOnCheckout,
    onShowConfirmCheckoutModal,
    checkoutCommitShaMutation,
    selectedSha,
  ]);

  const onCherryPick = useCallback(() => {
    if (!canCherryPickQuery.data?.canCherryPick || !selectedSha) {
      return;
    }
    cherryPickMutation.mutate({
      sha: selectedSha,
    });
  }, [selectedSha, canCherryPickQuery.data?.canCherryPick, cherryPickMutation]);

  const onRevert = useCallback(() => {
    if (props.apiResponse.isWIP || !selectedSha) {
      return;
    }
    revertMutation.mutate({
      sha: selectedSha,
    });
  }, [selectedSha, props.apiResponse.isWIP, revertMutation]);

  const onAutoFix = useCallback(() => {
    if (!canAutoFixQuery.data?.canAutoFix || !selectedSha) {
      return;
    }
    autofixMutation.mutate({
      sha: selectedSha,
    });
  }, [selectedSha, canAutoFixQuery.data?.canAutoFix, autofixMutation]);


  const onAmend = useCallback(() => {
    if (!canAmendQuery.data?.canAmend || !selectedSha) {
      return;
    }
    if (selectedCommit?.message == amendMessage) {
      return;
    }
    amendMutation.mutate({
      sha: selectedSha,
      message: amendMessage
    });
  }, [selectedSha, canAmendQuery.data?.canAmend, autofixMutation, selectedCommit?.message, amendMessage]);

  const elapsedTime = useMemo(() => {
    if (!selectedCommit?.timestamp) {
      return "";
    }
    return timeAgo.format(new Date(selectedCommit?.timestamp as string));
  }, [timeAgo, selectedCommit]);

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

  const [isMessageFocused, setIsMessageFocused] = useState(false);
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

  const onTextBoxChanged = useCallback(
    (event: React.ChangeEvent<HTMLTextAreaElement>): void => {
      setAmendMessage(event.target.value);
    },
    []);

  const renderPopup = useCallback(
    ({
      sourceCommit,
      onHidePopup,
      terminalBranches,
    }: {
      sourceCommit?: SourceCommitNodeWithGridDimensions;
      onHidePopup?: () => void;
      terminalBranches?: Array<Branch>;
    }): React.ReactElement | null => {
        if (showAmend) {
          return (
            <SGPlainModal
              sourceCommit={sourceCommit}
              onHidePopup={onHidePopup}
              terminalBranches={terminalBranches}
            />
          );
        }
      return (
        <SGSelectShaModal
          sourceCommit={sourceCommit}
          onHidePopup={onHidePopup}
          terminalBranches={terminalBranches}
          onSelectHead={onSelectSha}
        />
      );
    },
    [showAmend, onSelectSha]
  );

  const sgPortal = useSourceGraphPortal(
    ({ width, height, hasLoaded, onSourceGraphLoaded }) => {
      if (sourceGraphLoading && !hasLoaded) {
        return <div />;
      }
      if ((sourceGraphResponse?.rootNodes?.length ?? 0) == 0) {
        return (
          <EmptySourceGraphContainer>
            <EmptySourceGraphTextWrapper>
              <EmptySourceGraphText>
                {"Nothing committed to repository yet."}
              </EmptySourceGraphText>
            </EmptySourceGraphTextWrapper>
          </EmptySourceGraphContainer>
        );
      }
      return (
        <div
          style={{
            height: "100%",
            visibility: hasLoaded ? "visible" : "hidden",
          }}
        >
          <SourceGraph
            rootNodes={sourceGraphResponse?.rootNodes ?? []}
            branches={sourceGraphResponse?.branches ?? []}
            height={height}
            width={width}
            onLoaded={onSourceGraphLoaded}
            renderPopup={renderPopup}
            currentBranchId={props?.apiResponse?.branch?.id ?? undefined}
            highlightedBranchId={props?.apiResponse?.branch?.id}
            htmlContentHeight={160}
            currentSha={selectedSha}
            onSelectBranch={onSelectBranch}
          />
        </div>
      );
    },
    [
      renderPopup,
      sourceGraphLoading,
      sourceGraphResponse,
      props?.apiResponse?.repoState?.commit,
      props?.apiResponse?.repoState?.branch,
      props?.apiResponse?.branch?.id,
      selectedSha,
      onSelectBranch,
    ]
  );
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
              {showAmend ? "Amend Sha Message" : "Sha Graph"}
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
          <div
            style={{
              width: "100%",
              display: "flex",
              flexDirection: "column",
              justifyContent: "flex-start",
              marginTop: 16,
            }}
          >
            <Row style={{ marginBottom: 16, width: "100%" }}>
              <TextRow>
                <Label>{"Commit:"}</Label>
                <Value>{selectedCommit?.sha?.substring(0, 8)}</Value>
              </TextRow>
              <TimeTextRow
                style={{
                  justifyContent: "flex-end",
                }}
              >
                <ElapseText>
                  {"Committed "}
                  <ElapseSince>{elapsedTime}</ElapseSince>
                </ElapseText>
              </TimeTextRow>
            </Row>
            {!showAmend && (
              <BlurbBox>
                <BlurbText>{selectedCommit?.message}</BlurbText>
              </BlurbBox>
            )}
            {showAmend && (
                <TextAreaBlurbBox
                style={{
                    border: `1px solid ${textareaBorderColor}`,
                }}
                ref={textareaContainer}
                >
                {amendMessage == "" && (
                    <BlurbPlaceholder>
                    {"What changes did you make? (be descriptive)"}
                    </BlurbPlaceholder>
                )}
                <BlurbTextArea
                    ref={textarea}
                    onFocus={onFocusMessage}
                    onBlur={onBlurMessage}
                    value={amendMessage}
                    onChange={onTextBoxChanged}
                />
                </TextAreaBlurbBox>
            )}
          </div>
          {!showAmend && (
            <>
              <ButtonRow style={{ marginTop: 24 }}>
                <RepoActionButton
                  isDisabled={props.apiResponse.isWIP || !selectedShaIsAncestor}
                  label={"revert sha"}
                  icon={"revert"}
                  onClick={onRevert}
                  isLoading={revertMutation?.isLoading}
                />
                <RepoActionButton
                  label={"fix forward"}
                  icon={"auto-fix"}
                  isDisabled={!canAutoFixQuery.data?.canAutoFix}
                  onClick={onAutoFix}
                  isLoading={autofixMutation?.isLoading}
                />
              </ButtonRow>
              <ButtonRow style={{ marginTop: 24 }}>
                <RepoActionButton
                  isDisabled={!canCherryPickQuery.data?.canCherryPick}
                  label={"cherry pick"}
                  icon={"cherry-pick"}
                  onClick={onCherryPick}
                  isLoading={cherryPickMutation?.isLoading}
                />
                <RepoActionButton
                  label={"amend sha"}
                  icon={"amend"}
                  isDisabled={!canAmendQuery.data?.canAmend}
                  onClick={onSelectAmend}
                />
              </ButtonRow>
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
            <>
                {!showAmend && (
                    <Button
                    isDisabled={!canCheckOutSha}
                    label={"checkout commit"}
                    bg={"purple"}
                    size={"extra-big"}
                    onClick={onClickCheckoutCommit}
                    isLoading={checkoutCommitShaMutation.isLoading}
                    />
                )}

                {showAmend && (
                    <Button
                      isDisabled={!canAmendQuery?.data?.canAmend || selectedCommit?.message == amendMessage}
                      label={"amend commit"}
                      bg={"orange"}
                      size={"extra-big"}
                      onClick={onAmend}
                      isLoading={amendMutation.isLoading}
                    />
                )}
            </>
          </div>
        </BottomContainer>
      </InnerContent>
      {sgPortal}
      <ConfirmCheckoutShaModal
        show={showConfirmCheckoutModal}
        onDismiss={onHideConfirmCheckoutModal}
        repository={props.repository}
        apiReponse={props.apiResponse}
        selectedSha={selectedSha}
      />
    </>
  );
};
export default React.memo(SourceGraphNav);
