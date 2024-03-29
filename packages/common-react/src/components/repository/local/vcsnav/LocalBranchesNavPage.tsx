import React, {
  useMemo,
  useState,
  useCallback,
  useEffect,
} from "react";
import { Repository } from "@floro/graphql-schemas/src/generated/main-client-graphql";
import styled from "@emotion/styled";
import CurrentInfo from "@floro/storybook/stories/repo-components/CurrentInfo";
import Button from "@floro/storybook/stories/design-system/Button";
import { ApiResponse } from "floro/dist/src/repo";
import { useLocalVCSNavContext } from "./LocalVCSContext";
import { useSourceGraphPortal } from "../../sourcegraph/SourceGraphUIContext";
import SourceGraph from "@floro/storybook/stories/common-components/SourceGraph";
import { SourceCommitNodeWithGridDimensions } from "@floro/storybook/stories/common-components/SourceGraph/grid";
import { Branch } from "floro/dist/src/repo";
import BranchSelector from "@floro/storybook/stories/repo-components/BranchSelector";
import { useCanMoveWIP, useDeleteBranch, useIsBranchProtected, useSourceGraph, useSwitchBranch } from "../hooks/local-hooks";
import SGPlainModal from "../../sourcegraph/sourgraphmodals/SGPlainModal";
import Checkbox from "@floro/storybook/stories/design-system/Checkbox";

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

const WarningText = styled.p`
    font-size: 1.1rem;
    font-family: "MavenPro";
    font-weight: 500;
    color: ${props => props.theme.colors.warningTextColor};
`;

const OnlyDisplayMyBranchesText = styled.p`
    font-size: 1.2rem;
    font-family: "MavenPro";
    font-weight: 500;
    margin-left: 16px;
    color: ${props => props.theme.colors.connectionTextColor};
`;

interface Props {
  repository: Repository;
  apiResponse: ApiResponse;
}

const LocalBranchesNavPage = (props: Props) => {
  const { setSubAction } = useLocalVCSNavContext();

  const { data: sourceGraphResponse, isLoading: sourceGraphLoading } = useSourceGraph(props.repository);
  const [onlyShowMyBranches, setOnlyShowMyBranches] = useState(true);
  const [selectedBranch, setSelectedBranch] = useState<Branch|null>(props.apiResponse?.branch ?? null);

  const onToggleOnlyShowMyBranches = useCallback(() => {
    setOnlyShowMyBranches(!onlyShowMyBranches);
  }, [onlyShowMyBranches]);

  const { data: isBranchProtected, isLoading: isBranchProtectedLoading } =
    useIsBranchProtected(props.repository, selectedBranch?.id);

  const switchBranchMutation = useSwitchBranch(props.repository);
  const deleteBranchMutation = useDeleteBranch(props.repository);

  const { data: canMoveWIPQuery } = useCanMoveWIP(props.repository, selectedBranch?.lastCommit ?? null);

  const filteredBranches = useMemo(() => {
    if (onlyShowMyBranches && props?.apiResponse?.checkedOutBranchIds) {
      return sourceGraphResponse?.branches?.filter(b => {
        return props.apiResponse.checkedOutBranchIds?.includes(b.id);
      });
    }
    return sourceGraphResponse?.branches;
  }, [onlyShowMyBranches, sourceGraphResponse?.branches, props?.apiResponse?.checkedOutBranchIds])

  const selectedBaseBranch = useMemo(() => {
    if (!selectedBranch?.baseBranchId) {
      return null;
    }
    return filteredBranches?.find(b => b.id == selectedBranch?.baseBranchId) ?? null;
  }, [filteredBranches, selectedBranch])

  const { data: canMoveToBaseBranchWIPQuery } = useCanMoveWIP(
    props.repository,
    selectedBaseBranch?.lastCommit ?? null
  );

  useEffect(() => {
    const selectedBranchExists = !!filteredBranches?.find(b => b.id == selectedBranch?.id);
    if (selectedBranch?.id != props?.apiResponse?.branch?.id && !selectedBranchExists && props.apiResponse.branch) {
      setSelectedBranch(props.apiResponse.branch);
    }
  }, [selectedBranch, props.apiResponse.branch, filteredBranches])

  const onGoBack = useCallback(() => {
    setSubAction(null);
  }, []);

  const onShowNewBranch = useCallback(() => {
      setSubAction("new_branch");
  }, []);

  const onSwitchBranches = useCallback(() => {
    switchBranchMutation.mutate({
      branchId: selectedBranch?.id ?? null
    });
  }, [switchBranchMutation.mutate, selectedBranch])

  const onChangeBranch = useCallback((branch: Branch|null) => {
    if (branch) {
      setSelectedBranch(branch)
    }
  }, [])

  const onChangeBranchIdFromGraph = useCallback((id: string) => {
    const branch = filteredBranches?.find(v => v.id == id);
    if (branch) {
      setSelectedBranch(branch)
    }
  }, [filteredBranches])

  const onDeleteBranch = useCallback(() => {
    if (!selectedBranch?.id) {
      return;
    }
    deleteBranchMutation.mutate({
      branchId: selectedBranch.id
    });
  }, [deleteBranchMutation.mutate, selectedBranch?.id]);

  useEffect(() => {
    const commandToggleListeners = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.shiftKey && (event.key?.toLowerCase() == "b" || event.key?.toLowerCase() == "backspace")) {
        onGoBack();
      }

      if ((event.metaKey || event.ctrlKey) && event.shiftKey && event.key?.toLowerCase() == "n") {
        onShowNewBranch();
      }
    };
    window.addEventListener("keydown", commandToggleListeners);
    return () => {
      window.removeEventListener("keydown", commandToggleListeners);
    };
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
        <SGPlainModal
          sourceCommit={sourceCommit}
          onHidePopup={onHidePopup}
          terminalBranches={terminalBranches}
        />
      );
    },
    []
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
            branches={filteredBranches ?? []}
            height={height}
            width={width}
            currentSha={props?.apiResponse?.repoState?.commit ?? null}
            onLoaded={onSourceGraphLoaded}
            renderPopup={renderPopup}
            highlightedBranchId={selectedBranch?.id}
            onSelectBranch={onChangeBranch}
            currentBranchId={props?.apiResponse?.repoState?.branch ?? undefined}
            filterBranchlessNodes
            filteredBranchIds={filteredBranches?.map(b => b.id)}
            htmlContentHeight={200}
          />
        </div>
      );
    },
    [
      renderPopup,
      sourceGraphLoading,
      sourceGraphResponse,
      filteredBranches,
      props?.apiResponse?.repoState?.commit,
      props?.apiResponse?.repoState?.branch,
      selectedBranch,
    ]
  );
  return (
    <>
      <InnerContent>
        <TopContainer>
          <CurrentInfo
            respository={props.repository}
            showWIP
            showBackButton
            isWIP={props.apiResponse.isWIP}
            branch={props.apiResponse.branch}
            baseBranch={props.apiResponse.baseBranch}
            lastCommit={props.apiResponse.lastCommit}
            onGoBack={onGoBack}
          />
          <div
            style={{
              marginTop: 16,
              width: "100%",
              display: "flex",
              flexDirection: "row",
              justifyContent: "center",
            }}
          >
            <BranchSelector
              size="wide"
              branches={filteredBranches ?? []}
              branch={selectedBranch}
              onChangeBranch={onChangeBranch}
            />
          </div>
          <div
            style={{
              marginTop: 16,
              width: "100%",
              display: "flex",
              flexDirection: "row",
              alignItems: "center",
            }}
          >
            <Checkbox isChecked={onlyShowMyBranches} onChange={onToggleOnlyShowMyBranches}/>
            <OnlyDisplayMyBranchesText>{'Only display my checked out branches'}</OnlyDisplayMyBranchesText>
          </div>
          <div
            style={{
              marginTop: 24,
              width: "100%",
              display: "flex",
              flexDirection: "row",
              justifyContent: "space-between",
            }}
          >
            <div
              style={{
                maxWidth: 260,
              }}
            >
              {selectedBranch?.id &&
                !props.apiResponse?.repoState?.branch &&
                !canMoveWIPQuery?.canSwitch &&
                !sourceGraphLoading &&
                !switchBranchMutation?.isLoading &&
                selectedBranch?.id != props.apiResponse?.repoState?.branch && (
                  <WarningText>
                    {`In order to switch to ${selectedBranch?.name}, first commit, stash, discard, or edit your current changes so no conflict exists.`}
                  </WarningText>
                )}
            </div>
            <Button
              isDisabled={
                isBranchProtectedLoading || isBranchProtected ||
                (selectedBranch?.id == props.apiResponse.repoState.branch &&
                !canMoveToBaseBranchWIPQuery?.canSwitch)
              }
              label={"delete local branch"}
              bg={"gray"}
              size={"medium"}
              textSize="small"
              onClick={onDeleteBranch}
              isLoading={deleteBranchMutation.isLoading}
            />
          </div>
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
              style={{ width: "100%" }}
              label={"switch branch"}
              bg={"purple"}
              size={"extra-big"}
              isDisabled={
                !canMoveWIPQuery?.canSwitch ||
                (props?.apiResponse?.branch?.id ?? null) ==
                  (selectedBranch?.id ?? null)
              }
              onClick={onSwitchBranches}
              isLoading={switchBranchMutation.isLoading}
            />
          </div>
          <div
            style={{
              marginTop: 24,
              width: "100%",
              display: "flex",
              flexDirection: "row",
              justifyContent: "center",
            }}
          >
            <Button
              label={"new branch"}
              bg={"orange"}
              size={"extra-big"}
              onClick={onShowNewBranch}
            />
          </div>
        </BottomContainer>
      </InnerContent>
      {sgPortal}
    </>
  );
};

export default React.memo(LocalBranchesNavPage);
