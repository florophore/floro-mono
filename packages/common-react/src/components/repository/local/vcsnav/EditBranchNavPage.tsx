import React, {
  useMemo,
  useState,
  useCallback,
  useEffect,
} from "react";
import { Repository } from "@floro/graphql-schemas/src/generated/main-client-graphql";
import styled from "@emotion/styled";
import { useTheme } from "@emotion/react";
import Button from "@floro/storybook/stories/design-system/Button";
import { ApiResponse } from "floro/dist/src/repo";
import { useLocalVCSNavContext } from "./LocalVCSContext";
import { useSourceGraphPortal } from "../../sourcegraph/SourceGraphUIContext";
import SourceGraph from "@floro/storybook/stories/common-components/SourceGraph";
import {
  SourceCommitNodeWithGridDimensions,
  mapSourceGraphRootsToGrid,
  getPotentialBaseBranchesForSha,
} from "@floro/storybook/stories/common-components/SourceGraph/grid";
import { Branch } from "floro/dist/src/repo";
import BranchSelector from "@floro/storybook/stories/repo-components/BranchSelector";
import SelectedShaDisplay from "@floro/storybook/stories/repo-components/SelectedShaDisplay";
import {
  useCanMoveWIP,
  useSourceGraph,
  useUpdateBranch,
} from "../hooks/local-hooks";

import BackArrowIconLight from "@floro/common-assets/assets/images/icons/back_arrow.light.svg";
import BackArrowIconDark from "@floro/common-assets/assets/images/icons/back_arrow.dark.svg";
import Input from "@floro/storybook/stories/design-system/Input";
import { getColorForRow } from "@floro/storybook/stories/common-components/SourceGraph/color-mod";
import SGPlainModal from "../../sourcegraph/sourgraphmodals/SGPlainModal";
import SGSwitchHeadModal from "../../sourcegraph/sourgraphmodals/SGSwitchHeadModal";
import RepoActionButton from "@floro/storybook/stories/repo-components/RepoActionButton";

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
  margin-top: 24px;
`;

export const BRANCH_NAME_REGEX = /^[-_ ()[\]'"|a-zA-Z0-9]{3,100}$/;
export const ILLEGAL_BRANCH_NAMES = new Set(["none"]);

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

const EditBranchNavPage = (props: Props) => {
  const theme = useTheme();
  const { setSubAction } = useLocalVCSNavContext();
  const [branchName, setBranchName] = useState(
    props?.apiResponse?.branch?.name ?? ""
  );
  const [branchHead, setBranchHead] = useState<string | null>(
    props.apiResponse?.branch?.lastCommit ?? null
  );

  const [showSurgery, setShowSurgery] = useState(false);

  const editBranchMutation = useUpdateBranch(props.repository);

  const { data: canMoveWIPQuery } = useCanMoveWIP(
    props.repository,
    branchHead ?? null
  );

  const { data: sourceGraphResponse, isLoading: sourceGraphLoading } =
    useSourceGraph(props.repository);

  const branchNameIsValid = useMemo(() => {
    if (!branchName) {
      return false;
    }
    if (
      BRANCH_NAME_REGEX.test(branchName) &&
      !ILLEGAL_BRANCH_NAMES.has(branchName.toLowerCase())
    ) {
      const takenBranches = new Set(
        sourceGraphResponse?.branches
          ?.filter((v) => v.id != props.apiResponse?.repoState?.branch)
          ?.map((b) => b.id)
      );
      const branchId = getBranchIdFromName(branchName);
      return !takenBranches.has(branchId);
    }
    return false;
  }, [
    branchName,
    sourceGraphResponse?.branches,
    props.apiResponse?.repoState?.branch,
  ]);

  const branchNameInputIsValid = useMemo(() => {
    if (branchName == "") {
      return true;
    }
    return branchNameIsValid;
  }, [branchNameIsValid, branchName]);

  const gridData = useMemo(
    () =>
      mapSourceGraphRootsToGrid(
        sourceGraphResponse?.rootNodes ?? [],
        sourceGraphResponse?.branches ?? []
      ),
    [sourceGraphResponse?.rootNodes, sourceGraphResponse?.branches]
  );

  const branchHeadSourceCommit = useMemo(() => {
    if (!branchHead || !gridData?.pointerMap) {
      return null;
    }
    return gridData?.pointerMap?.[branchHead];
  }, [branchHead, gridData?.pointerMap]);

  const branchHeadColor = useMemo(() => {
    if (!branchHead) {
      return "transparent";
    }
    const sourceCommit = gridData.pointerMap[branchHead];
    if (!sourceCommit) {
      return "transparent";
    }
    if (sourceCommit?.branchIds?.length == 0) {
      return "transparent";
    }
    return getColorForRow(theme, sourceCommit.row);
  }, [gridData.pointerMap, branchHead, theme]);

  const baseBranches = useMemo(() => {
    const potentialBranches = getPotentialBaseBranchesForSha(
      branchHead,
      sourceGraphResponse?.branches ?? [],
      sourceGraphResponse?.pointers ?? {}
    );
    return potentialBranches?.filter(
      (v) => v.id != props?.apiResponse?.branch?.id
    );
  }, [
    branchHead,
    sourceGraphResponse?.branches,
    sourceGraphResponse?.pointers,
  ]);

  const [baseBranch, setBaseBranch] = useState<Branch | null>(
    props?.apiResponse?.baseBranch ?? null
  );

  const [hasLoaded, setHasLoaded] = useState(false);
  useEffect(() => {
    if (!hasLoaded) {
      setHasLoaded(true);
      return;
    }
    setBaseBranch(baseBranches?.[0] ?? null);
  }, [baseBranches]);

  const isSameAsOriginal = useMemo(() => {
    if (props.apiResponse?.branch?.name != branchName) {
      return false;
    }

    if (props.apiResponse?.branch?.lastCommit != branchHead) {
      return false;
    }

    if (props.apiResponse?.baseBranch?.id != baseBranch?.id) {
      return false;
    }
    return true;
  }, [
    props.apiResponse?.branch?.name,
    props.apiResponse?.branch?.lastCommit,
    props.apiResponse?.baseBranch,
    branchHead,
    branchName,
    baseBranch?.id,
  ]);

  const isEditDisabled = useMemo(() => {
    if (isSameAsOriginal) {
      return true;
    }
    if (!branchNameIsValid || branchName == "") {
      return true;
    }
    return false;
  }, [
    canMoveWIPQuery?.canSwitch,
    branchNameIsValid,
    branchName,
    isSameAsOriginal,
  ]);

  const onClickBaseBranch = useCallback(
    (branch) => {
      const hasBranch = !!baseBranches?.find((b) => b.id == branch.id);
      if (hasBranch) {
        setBaseBranch(branch);
      }
    },
    [baseBranches]
  );

  const onGoBack = useCallback(() => {
    setSubAction(null);
  }, []);

  useEffect(() => {
    if (editBranchMutation.isSuccess) {
      onGoBack();
    }
  }, [editBranchMutation]);

  const onSubmitCreateBranch = useCallback(() => {
    if (isEditDisabled) {
      return;
    }
    editBranchMutation.mutate({
      baseBranchId: baseBranch?.id ?? null,
      branchName,
      branchHead,
    });
  }, [
    editBranchMutation.mutate,
    branchHead,
    branchName,
    baseBranch,
    isEditDisabled,
  ]);

  const backArrowIcon = useMemo(() => {
    if (theme.name == "light") {
      return BackArrowIconLight;
    }
    return BackArrowIconDark;
  }, [theme.name]);

  const onShowSurgery = useCallback(() => {
    setShowSurgery(true);
  }, []);

  const onHideSurgery = useCallback(() => {
    setShowSurgery(false);
  }, []);

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

  const onUnsetBranchHead = useCallback(() => {
    setBranchHead(null);
  }, []);

  const onSetBranchHead = useCallback(
    (sourceCommit: SourceCommitNodeWithGridDimensions | null) => {
      setBranchHead(sourceCommit?.sha ?? null);
    },
    []
  );

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
      if (showSurgery) {
        return (
          <SGSwitchHeadModal
            sourceCommit={sourceCommit}
            onHidePopup={onHidePopup}
            terminalBranches={terminalBranches}
            onSwitchHead={onSetBranchHead}
            currentSha={branchHead}
          />
        );
      }
      return (
        <SGPlainModal
          sourceCommit={sourceCommit}
          onHidePopup={onHidePopup}
          terminalBranches={terminalBranches}
        />
      );
    },
    [branchHead, showSurgery]
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
            currentSha={branchHead}
            onLoaded={onSourceGraphLoaded}
            renderPopup={renderPopup}
            currentBranchId={baseBranch?.id ?? undefined}
            highlightedBranchId={baseBranch?.id}
            onSelectBranch={onClickBaseBranch}
            filterBranches
            filteredBranches={baseBranches}
            htmlContentHeight={showSurgery ? 160 : 120}
            disableZoomToHighlightedBranchOnLoad
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
      baseBranch?.id,
      branchHead,
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
              {"Edit Branch"}
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
            <Input
              value={branchName}
              label={"branch name"}
              placeholder={"branch name"}
              onTextChanged={setBranchName}
              widthSize="wide"
              isValid={branchNameInputIsValid}
            />
          </Row>
          {showSurgery && (
            <>
              {gridData?.roots?.length > 0 && (
                <Row>
                  <SelectedShaDisplay
                    widthSize={"wide"}
                    label={"branch head"}
                    sha={branchHeadSourceCommit?.sha}
                    message={branchHeadSourceCommit?.message}
                    shaBackground={branchHeadColor}
                    button={
                      <Button
                        label={"no head"}
                        bg={"gray"}
                        size={"small"}
                        onClick={onUnsetBranchHead}
                      />
                    }
                  />
                </Row>
              )}
              <Row>
                <BranchSelector
                  size="wide"
                  branches={baseBranches ?? []}
                  branch={baseBranch ?? null}
                  onChangeBranch={setBaseBranch}
                  label={"base branch"}
                  placeholder={"select base branch"}
                  allowNone
                />
              </Row>
            </>
          )}

          <Row style={{ paddingTop: 12 }}>
            {!showSurgery && (
              <RepoActionButton
                size={"large"}
                label={"perform surgery"}
                icon={"surgery"}
                onClick={onShowSurgery}
              />
            )}
            {showSurgery && (
              <RepoActionButton
                size={"large"}
                label={"hide surgery options"}
                icon={"surgery"}
                onClick={onHideSurgery}
              />
            )}
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
              isDisabled={isEditDisabled}
              label={"edit branch"}
              bg={"orange"}
              size={"extra-big"}
              onClick={onSubmitCreateBranch}
              isLoading={editBranchMutation.isLoading}
            />
          </div>
        </BottomContainer>
      </InnerContent>
      {sgPortal}
    </>
  );
};
export default React.memo(EditBranchNavPage);
