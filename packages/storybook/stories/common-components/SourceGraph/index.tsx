import React, { useMemo, useState } from "react";
import styled from "@emotion/styled";
import {
  Branch,
  SourceCommitNode,
  SourceCommitNodeWithGridDimensions,
  getBranchMap,
  getEdges,
  getInitNode,
  getNodes,
  getVertices,
  mapSourceGraphRootsToGrid,
} from "./grid";
import ZoomableSVG from "./ZoomableSVG";
import CommitChart from "./CommitChart";

const Container = styled.div`
  position: relative;
`;

export interface Props {
  width: number;
  height: number;
  rootNodes: Array<SourceCommitNode>;
  branches: Array<Branch>;
  isDebug?: boolean;
  columnDistance?: number;
  rowDistance?: number;
  filterBranchlessNodes?: boolean;
  currentSha?: string;
  onLoaded?: () => void;
  onSelectNode?: (
    sourceCommit: SourceCommitNodeWithGridDimensions,
    terminalBranches: Array<Branch>
  ) => void;
  onSelectBranch?: (branch: Branch) => void;
  onMouseOverBranch?: (branch: Branch) => void;
  onMouseOffBranch?: (branch: Branch) => void;
  renderPopup?: (props: {
    onHidePopup?: () => void;
    sourceCommit?: SourceCommitNodeWithGridDimensions;
    terminalBranches?: Array<Branch>;
  }) => React.ReactElement | null;
  highlightedBranchId?: string;
  htmlContentHeight?: number;
}

const SourceGraph = (props: Props): React.ReactElement => {
  const columnDistance = useMemo(
    () => props?.columnDistance ?? 500,
    [props?.columnDistance]
  );

  const rowDistance = useMemo(
    () => props?.rowDistance ?? 300,
    [props?.rowDistance]
  );

  const nodes = useMemo(() => {
    return getNodes(props.rootNodes, props.filterBranchlessNodes ?? false);
  }, [props.rootNodes, props.filterBranchlessNodes]);

  const gridData = useMemo(
    () =>
      mapSourceGraphRootsToGrid(
        nodes,
        props.branches,
        props.currentSha,
        props.isDebug
      ),
    [nodes, props.branches, props.isDebug, props.currentSha]
  );

  const branchMap = useMemo(() => {
    return getBranchMap(props.branches);
  }, [props.branches]);

  const columns = gridData.gridColumnSize;
  const rows = gridData.gridRowSize;

  const edges = useMemo(
    () => getEdges(gridData.roots, columnDistance, rowDistance),
    [gridData.roots, columnDistance, rowDistance]
  );

  const vertices = useMemo(
    () => getVertices(gridData.roots, columnDistance, rowDistance),
    [gridData.roots, columnDistance, rowDistance]
  );

  const startingCoordinate = useMemo(() => {
    if (!props.currentSha && gridData?.grid.length == 0) {
      return null;
    }
    if (!props.currentSha) {
      return getInitNode(gridData?.grid);
    }
    const node = gridData?.pointerMap[props.currentSha];
    if (!node) {
      return null;
    }
    return node;
  }, [
    props.currentSha,
    gridData?.pointerMap,
    gridData.grid,
    columnDistance,
    rowDistance,
  ]);

  const startingCoordinates = useMemo(() => {
    if (!startingCoordinate) {
      return [0, 0];
    }
    return [
      (startingCoordinate?.column ?? 0) * columnDistance,
      (startingCoordinate?.row ?? 0) * rowDistance,
    ];
  }, [
    startingCoordinate?.column,
    startingCoordinate?.row,
    columnDistance,
    rowDistance,
  ]);

  const [focalPoint, setFocalPoint] = useState<null | [number, number]>(null);
  const debugCrossOverlay = useMemo(() => {
    if (props.isDebug) {
      return (
        <>
          <div
            style={{
              position: "absolute",
              top: 0,
              left: "50%",
              height: "100%",
              border: "1px solid red",
            }}
          ></div>
          <div
            style={{
              position: "absolute",
              left: 0,
              top: "50%",
              width: "100%",
              border: "1px solid red",
            }}
          ></div>
        </>
      );
    }
    return null;
  }, [props.isDebug]);

  const background = useMemo(() => {
    return props?.isDebug ? "blue" : "transparent";
  }, [props.isDebug]);

  return (
    <Container style={{ width: '100%', height: '100%', background }}>
      <ZoomableSVG
        width={props.width}
        height={props.height}
        columns={columns}
        rows={rows}
        columnDistance={columnDistance}
        rowDistance={rowDistance}
        startX={startingCoordinates[0]}
        startY={startingCoordinates[1]}
        isDebug={props.isDebug}
        focalPoint={focalPoint}
        onLoaded={props.onLoaded}
      >
        <CommitChart
          width={props.width}
          height={props.height}
          grid={gridData.grid}
          edges={edges}
          vertices={vertices}
          columns={columns}
          rows={rows}
          isDebug={props.isDebug}
          columnDistance={columnDistance}
          rowDistance={rowDistance}
          onChangeFocalPoint={setFocalPoint}
          branchMap={branchMap}
          pointerMap={gridData.pointerMap}
          renderPopup={props.renderPopup}
          currentSha={props.currentSha}
          onSelectBranch={props.onSelectBranch}
          onMouseOverBranch={props.onMouseOverBranch}
          onMouseOffBranch={props.onMouseOffBranch}
          highlightedBranchId={props.highlightedBranchId}
          htmlContentHeight={props.htmlContentHeight}
        />
      </ZoomableSVG>
      {debugCrossOverlay}
    </Container>
  );
};

export default React.memo(SourceGraph);
