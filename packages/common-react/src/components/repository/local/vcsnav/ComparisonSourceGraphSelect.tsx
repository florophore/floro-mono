import React, { useCallback } from "react";
import styled from "@emotion/styled";
import {
  ApiResponse,
  Branch,
} from "floro/dist/src/repo";
import {
  SourceCommitNode,
} from "floro/dist/src/sourcegraph";
import { ClientSourceGraph } from "../hooks/local-hooks";
import { SourceCommitNodeWithGridDimensions } from "@floro/storybook/stories/common-components/SourceGraph/grid";
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
  color: ${(props) => props.theme.colors.contrastText};
`;

interface Props {
  onUpdateComparisonSha: (sourceCommitNode: SourceCommitNode | null) => void;
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
      );
    },
    [props.sha, props.onUpdateComparisonSha, props.comparisonIsLoading]
  );

  return useSourceGraphPortal(
    ({ width, height, hasLoaded, onSourceGraphLoaded }) => {
      if ((props.sourceGraphResponse?.rootNodes?.length ?? 0) == 0) {
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
            rootNodes={props.sourceGraphResponse?.rootNodes ?? []}
            branches={props.sourceGraphResponse?.branches ?? []}
            height={height}
            width={width}
            currentSha={props.sha}
            onLoaded={onSourceGraphLoaded}
            renderPopup={renderPopup}
            currentBranchId={props?.apiResponse?.repoState?.branch ?? undefined}
            highlightedBranchId={
              props?.apiResponse?.repoState?.branch ?? undefined
            }
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
};

export default React.memo(ComparisonSourceGraphSelector);
