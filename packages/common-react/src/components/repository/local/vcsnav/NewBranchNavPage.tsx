import React, {
  useMemo,
  useState,
  useCallback,
  useRef,
  useEffect,
} from "react";
import { Repository } from "@floro/graphql-schemas/src/generated/main-client-graphql";
import { Link, useSearchParams } from "react-router-dom";
import styled from "@emotion/styled";
import { css } from "@emotion/css";
import { useTheme } from "@emotion/react";
import ColorPalette from "@floro/styles/ColorPalette";
import { useSession } from "../../../../session/session-context";
import CurrentInfo from "@floro/storybook/stories/repo-components/CurrentInfo";
import CommitSelector from "@floro/storybook/stories/repo-components/CommitSelector";
import {
  useOfflinePhoto,
  useOfflinePhotoMap,
} from "../../../../offline/OfflinePhotoContext";
import { useUserOrganizations } from "../../../../hooks/offline";
import AdjustExtend from "@floro/common-assets/assets/images/icons/adjust.extend.svg";
import AdjustShrink from "@floro/common-assets/assets/images/icons/adjust.shrink.svg";
import LaptopWhite from "@floro/common-assets/assets/images/icons/laptop.white.svg";
import GlobeWhite from "@floro/common-assets/assets/images/icons/globe.white.svg";
import Button from "@floro/storybook/stories/design-system/Button";
import LocalRemoteToggle from "@floro/storybook/stories/common-components/LocalRemoteToggle";
import { useQuery, useMutation, useQueryClient } from "react-query";
import axios from "axios";
import { useDaemonIsConnected } from "../../../../pubsub/socket";
import { ApiReponse } from "@floro/floro-lib/src/repo";
import { useLocalVCSNavContext } from "./LocalVCSContext";
import { useSourceGraphPortal } from "../../sourcegraph/SourceGraphUIContext";
import SourceGraph from "@floro/storybook/stories/common-components/SourceGraph";
import {
  SOURCE_HISTORY,
  BRANCHES,
} from "@floro/storybook/stories/common-components/SourceGraph/mocks";
import { SourceCommitNodeWithGridDimensions, Branch, mapSourceGraphRootsToGrid, getPotentialBaseBranchesForSha } from "@floro/storybook/stories/common-components/SourceGraph/grid";
import BranchSelector from "@floro/storybook/stories/repo-components/BranchSelector";
import { useCanMoveWIP, useCreateBranch, useSourceGraph } from "../hooks/local-hooks";

import BackArrowIconLight from "@floro/common-assets/assets/images/icons/back_arrow.light.svg";
import BackArrowIconDark from "@floro/common-assets/assets/images/icons/back_arrow.dark.svg";
import Input from "@floro/storybook/stories/design-system/Input";
import Checkbox from "@floro/storybook/stories/design-system/Checkbox";
import { getColorForRow } from "@floro/storybook/stories/common-components/SourceGraph/color-mod";

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
  apiResponse: ApiReponse;
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

  const branchHeadColor = useMemo(() => {
    if (!branchHead) {
      return null;
    }
    const sourceCommit = gridData.pointerMap[branchHead];
    if (!sourceCommit) {
      return null;
    }
    return getColorForRow(theme, sourceCommit.row);
  }, [gridData.pointerMap, branchHead, theme]);

  const baseBranches = useMemo(() => {
    return getPotentialBaseBranchesForSha(
      branchHead,
      sourceGraphResponse?.branches ?? [],
      sourceGraphResponse?.pointers ?? {},
    );
  }, [branchHead, sourceGraphResponse?.branches, sourceGraphResponse?.pointers]);

  const [baseBranch, setBaseBranch] = useState<Branch | null>(
    props.apiResponse?.branch ?? null
  );

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
      if (event.metaKey && event.shiftKey && event.key == "Backspace") {
        onGoBack();
      }
    };
    window.addEventListener("keydown", commandToggleListeners);
    return () => {
      window.removeEventListener("keydown", commandToggleListeners);
    };
  }, []);

  const renderPopup = useCallback(({ sourceCommit }: {
    sourceCommit?: SourceCommitNodeWithGridDimensions;
  }): React.ReactElement | null => {
    return (
      <div>
        <p
          style={{
            padding: 0,
            margin: 0,
            color: ColorPalette.lightPurple,
          }}
        >
          {"SHA: " + sourceCommit?.sha}
        </p>
      </div>
    );
  }, [
  ]);

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
            rootNodes={SOURCE_HISTORY}
            branches={BRANCHES}
            height={height}
            width={width}
            currentSha={"C"}
            onLoaded={onSourceGraphLoaded}
            renderPopup={renderPopup}
          />
        </div>
      );
    },
    [
      renderPopup,
      sourceGraphLoading,
      sourceGraphResponse
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
