import React, {
  useMemo,
  useState,
  useCallback,
  useRef,
  useEffect,
} from "react";
import { getColorForRow } from "@floro/storybook/stories/common-components/SourceGraph/color-mod";
import { Repository } from "@floro/graphql-schemas/src/generated/main-client-graphql";
import { Link, useSearchParams } from "react-router-dom";
import styled from "@emotion/styled";
import { css } from "@emotion/css";
import { useTheme } from "@emotion/react";
import ColorPalette from "@floro/styles/ColorPalette";
import { useSession } from "../../../../session/session-context";
import CurrentInfo from "@floro/storybook/stories/repo-components/CurrentInfo";
import RepoActionButton from "@floro/storybook/stories/repo-components/RepoActionButton";
import CompareSelector from "@floro/storybook/stories/repo-components/CompareSelector";
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
import { ApiResponse, Branch, SourceCommitNode, SourceGraphResponse } from "@floro/floro-lib/src/repo";
import { useLocalVCSNavContext } from "./LocalVCSContext";
import { ClientSourceGraph, useSourceGraph, useUpdateComparison, useUpdateCurrentCommand } from "../hooks/local-hooks";
import BranchSelector from "@floro/storybook/stories/repo-components/BranchSelector";
import { SourceCommitNodeWithGridDimensions, mapSourceGraphRootsToGrid } from "@floro/storybook/stories/common-components/SourceGraph/grid";
import SelectedShaDisplay from "@floro/storybook/stories/repo-components/SelectedShaDisplay";
import SGPlainModal from "../../sourcegraph/sourgraphmodals/SGPlainModal";
import { useSourceGraphPortal } from "../../sourcegraph/SourceGraphUIContext";
import SourceGraph from "@floro/storybook/stories/common-components/SourceGraph";
import SGSelectShaModal from "../../sourcegraph/sourgraphmodals/SGSelectShaModal";

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

interface Props {
    onUpdateComparisonSha: (sourceCommitNode: SourceCommitNode|null) => void;
    comparisonIsLoading: boolean;
    sourceGraphLoading: boolean;
    sourceGraphResponse: ClientSourceGraph;
    apiResponse: ApiResponse;
    sha: string;
}

const ComparisonSourceGraphSelector = (props: Props) => {

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
            <SGSelectShaModal
                sourceCommit={sourceCommit}
                onHidePopup={onHidePopup}
                terminalBranches={terminalBranches}
                onSelectHead={props.onUpdateComparisonSha}
                isLoading={props.comparisonIsLoading}
            />
        )
    },
    [
        props.sha,
        props.onUpdateComparisonSha,
        props.comparisonIsLoading
    ]
  );

  return useSourceGraphPortal(
    ({ width, height, hasLoaded, onSourceGraphLoaded }) => {
      if ((props.sourceGraphResponse?.rootNodes?.length ?? 0) == 0) {
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
            rootNodes={props.sourceGraphResponse?.rootNodes ?? []}
            branches={props.sourceGraphResponse?.branches ?? []}
            height={height}
            width={width}
            currentSha={props.sha}
            onLoaded={onSourceGraphLoaded}
            renderPopup={renderPopup}
            currentBranchId={props?.apiResponse?.repoState?.branch ?? undefined}
            highlightedBranchId={props?.apiResponse?.repoState?.branch ?? undefined}
            htmlContentHeight={160}
          />
        </div>
      );
    },
    [
      renderPopup,
      props.sourceGraphLoading,
      props.sourceGraphResponse?.rootNodes,
      props.sourceGraphResponse?.branches,
      props.sha,
      props?.apiResponse?.repoState?.branch,
      props?.apiResponse?.repoState?.comparison?.commit,

    ]
  );
}

export default React.memo(ComparisonSourceGraphSelector);