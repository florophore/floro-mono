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
import { SourceCommitNodeWithGridDimensions, mapSourceGraphRootsToGrid, getPotentialBaseBranchesForSha } from "@floro/storybook/stories/common-components/SourceGraph/grid";
import BranchSelector from "@floro/storybook/stories/repo-components/BranchSelector";
import SelectedShaDisplay from "@floro/storybook/stories/repo-components/SelectedShaDisplay";
import { useCanMoveWIP, useCreateBranch, useSourceGraph } from "../hooks/local-hooks";

import BackArrowIconLight from "@floro/common-assets/assets/images/icons/back_arrow.light.svg";
import BackArrowIconDark from "@floro/common-assets/assets/images/icons/back_arrow.dark.svg";
import Input from "@floro/storybook/stories/design-system/Input";
import Checkbox from "@floro/storybook/stories/design-system/Checkbox";
import { getColorForRow } from "@floro/storybook/stories/common-components/SourceGraph/color-mod";
import SGSwitchHeadModal from "../../sourcegraph/sourgraphmodals/SGSwitchHeadModal";
import { Branch } from "floro/dist/src/repo";

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
  color: ${props => props.theme.colors.contrastText};
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

const SwitchText = styled.p`
    font-size: 1.2rem;
    font-family: "MavenPro";
    font-weight: 400;
    color: ${props => props.theme.colors.contrastText};
`;


export const BRANCH_NAME_REGEX = /^[-_ ()[\]'"|a-zA-Z0-9]{3,100}$/;
export const ILLEGAL_BRANCH_NAMES = new Set(["none", "main"]);

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
  const [branchName, setBranchName] = useState("");
  const [branchHead, setBranchHead] = useState<string | null>(
    props.apiResponse?.lastCommit?.sha ?? null
  );

  const createBranchMutation = useCreateBranch(props.repository);

  const { data: canMoveWIPQuery } = useCanMoveWIP(props.repository, branchHead ?? null);
  const [switchBranchOnCreate, setSwitchBranchOnCreate] = useState(true);

  const { data: sourceGraphResponse, isLoading: sourceGraphLoading } = useSourceGraph(props.repository);

  const branchNameIsValid = useMemo(() => {
    if (!branchName) {
      return false;
    }
    if(BRANCH_NAME_REGEX.test(branchName) && !ILLEGAL_BRANCH_NAMES.has(branchName.toLowerCase())) {
      const takenBranches = new Set(
        sourceGraphResponse?.branches?.map(b => b.id)
      )
      const branchId = getBranchIdFromName(branchName);
      return !takenBranches.has(branchId);
    }
    return false;
  }, [branchName, sourceGraphResponse?.branches]);

  const branchNameInputIsValid = useMemo(() => {
    if (branchName == "") {
      return true;
    }
    return branchNameIsValid;
  }, [branchNameIsValid, branchName]);

  const isCreateDisabled = useMemo(() => {
    if (!branchNameIsValid || branchName == "") {
      return true;
    }
    if (!canMoveWIPQuery?.canSwitch && switchBranchOnCreate) {
      return true;
    }
    return false;
  }, [canMoveWIPQuery?.canSwitch, switchBranchOnCreate, branchNameIsValid, branchName]);

  const gridData = useMemo(
    () =>
      mapSourceGraphRootsToGrid(
        sourceGraphResponse?.rootNodes ?? [],
        sourceGraphResponse?.branches ?? [],
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
      return 'transparent';
    }
    const sourceCommit = gridData.pointerMap[branchHead];
    if (!sourceCommit) {
      return 'transparent';
    }
    if (sourceCommit?.branchIds?.length == 0) {
      return 'transparent';
    }
    return getColorForRow(theme, sourceCommit.row);
  }, [gridData.pointerMap, branchHead, theme]);

  const baseBranches = useMemo(() => {
    const potentialBranches = getPotentialBaseBranchesForSha(
      branchHead,
      sourceGraphResponse?.branches ?? [],
      sourceGraphResponse?.pointers ?? {},
    );
    return potentialBranches;
  }, [branchHead, sourceGraphResponse?.branches, sourceGraphResponse?.pointers]);


  const [baseBranch, setBaseBranch] = useState<Branch | null>(
    props.apiResponse?.branch ?? null
  );

  useEffect(() => {
    setBaseBranch(baseBranches?.[0] ?? null);
  }, [branchHead])

  const onClickBaseBranch = useCallback((branch) => {
    const hasBranch = !!baseBranches?.find(b => b.id == branch.id);
    if (hasBranch) {
      setBaseBranch(branch);
    }
  }, [baseBranches]);

  const onGoBack = useCallback(() => {
    setSubAction("branches");
  }, []);

  useEffect(() => {
    if (createBranchMutation.isSuccess) {
      onGoBack();
    }
  }, [createBranchMutation]);

  const onSubmitCreateBranch = useCallback(() => {
    if (isCreateDisabled) {
      return;
    }
    createBranchMutation.mutate({
      baseBranchId: baseBranch?.id ?? null,
      branchName,
      branchHead,
      switchBranchOnCreate
    });
  }, [createBranchMutation.mutate, branchHead, branchName, switchBranchOnCreate, baseBranch, isCreateDisabled])

  const backArrowIcon = useMemo(() => {
    if (theme.name == "light") {
      return BackArrowIconLight;
    }
    return BackArrowIconDark;
  }, [theme.name]);

  useEffect(() => {
    const commandToggleListeners = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.shiftKey && event.key?.toLowerCase() == "backspace") {
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

  const onSetBranchHead = useCallback((sourceCommit: SourceCommitNodeWithGridDimensions|null) => {
    setBranchHead(sourceCommit?.sha ?? null);
  }, []);

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
      return (
        <SGSwitchHeadModal
          sourceCommit={sourceCommit}
          onHidePopup={onHidePopup}
          terminalBranches={terminalBranches}
          onSwitchHead={onSetBranchHead}
          currentSha={branchHead}
        />
      );
    },
    [branchHead]
  );

  const sgPortal = useSourceGraphPortal(
    ({ width, height, hasLoaded, onSourceGraphLoaded }) => {
      if (sourceGraphLoading && !hasLoaded) {
        return <div/>;
      }
      if ((sourceGraphResponse?.rootNodes?.length ?? 0) == 0) {
        return (
          <EmptySourceGraphContainer>
            <EmptySourceGraphTextWrapper>
              <EmptySourceGraphText>
                {'Nothing committed to repository yet.'}
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
            htmlContentHeight={240}
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
      baseBranches,
      branchHead
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
              {"New Branch"}
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
          {gridData?.roots?.length > 0 && (
            <Row>
              <SelectedShaDisplay
                widthSize={"wide"}
                label={"branch head"}
                sha={branchHeadSourceCommit?.sha}
                message={branchHeadSourceCommit?.message}
                shaBackground={branchHeadColor}
                button={<Button label={"no head"} bg={"gray"} size={"small"} onClick={onUnsetBranchHead} />}
              />
            </Row>
          )}
          <Row>
            <BranchSelector
              size="wide"
              branches={baseBranches ?? []}
              branch={baseBranch}
              onChangeBranch={setBaseBranch}
              label={"base branch"}
              placeholder={"select base branch"}
              allowNone
            />
          </Row>
          <Row>
            <SwitchText
              style={{
                color: canMoveWIPQuery?.canSwitch
                  ? theme.colors.contrastText
                  : theme.colors.warningTextColor,
              }}
            >
              {"switch to new branch upon create"}
            </SwitchText>
            <Checkbox
              isChecked={switchBranchOnCreate && !!canMoveWIPQuery?.canSwitch}
              onChange={setSwitchBranchOnCreate}
            />
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
              isDisabled={isCreateDisabled}
              label={"create branch"}
              bg={"orange"}
              size={"extra-big"}
              isLoading={createBranchMutation.isLoading}
              onClick={onSubmitCreateBranch}
            />
          </div>
        </BottomContainer>
      </InnerContent>
      {sgPortal}
    </>
  );
};
export default React.memo(NewBranchNavPage);
