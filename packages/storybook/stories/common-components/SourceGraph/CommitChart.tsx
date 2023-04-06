import React, { useRef, useEffect, useState } from "react";
import { Branch, Edge, SourceCommitNodeWithGridDimensions } from "./grid";
import DebugGraph from "./DebugGraph";
import CommitVertice from "./CommitVertice";
import CommitEdge from "./CommitEdge";
import SVGPortalProvider from "./SVGPortalContext";

interface Props {
  width: number;
  height: number;
  isDebug?: boolean;
  columns: number;
  rows: number;
  columnDistance: number;
  rowDistance: number;
  edges: Array<Edge>;
  vertices: Array<SourceCommitNodeWithGridDimensions>;
  grid: Array<Array<SourceCommitNodeWithGridDimensions | null>>;
  branchMap: { [key: string]: Branch };
  pointerMap: { [key: string]: SourceCommitNodeWithGridDimensions };
  onChangeFocalPoint: (point: null | [number, number]) => void;
  currentSha?: string;
  onSelectNode?: (sourceCommit: SourceCommitNodeWithGridDimensions, terminalBranches: Array<Branch>) => void;
  onSelectBranch?: (branch: Branch) => void;
  onMouseOverBranch?: (branch: Branch) => void;
  onMouseOffBranch?: (branch: Branch) => void;
  renderPopup?: (props?: {
    onHidePopup?: () => void,
    sourceCommit?: SourceCommitNodeWithGridDimensions,
    terminalBranches?: Array<Branch>,
  }) => React.ReactElement|null;
  highlightedBranchId?: string;
  selectedBranchId?: string;
}

const CommitChart = ({
  width,
  height,
  isDebug = false,
  columns,
  rows,
  columnDistance,
  rowDistance,
  edges,
  vertices,
  grid,
  branchMap,
  pointerMap,
  onChangeFocalPoint,
  renderPopup,
  currentSha,
  highlightedBranchId,
  selectedBranchId,
  onSelectBranch,
  onMouseOverBranch,
  onMouseOffBranch
}: Props) => {
  const portalRef = useRef<SVGGElement>(null);
  const [portal, setPortal] = useState<SVGGElement|null>(null);

  useEffect(() => {
    if (portalRef.current) {
      setPortal(portalRef.current);
    }
  }, [portalRef.current]);

  return (
    <SVGPortalProvider portal={portal}>
      <g transform={`translate(${width / 2},${height / 2})`}>
        {isDebug && (
          <>
            <rect
              x={-30}
              y={-30}
              width={columnDistance * (columns - 1) + 60}
              height={rowDistance * (rows - 1) + 60}
              fill="white"
            />
            <DebugGraph
              columns={columns}
              rows={rows}
              columnDistance={columnDistance}
              rowDistance={rowDistance}
            />
          </>
        )}
        {edges.map((edge: Edge) => {
          return (
            <CommitEdge
              edge={edge}
              key={`${edge.parent.sha}-${edge.child.sha}`}
              highlightedBranchId={highlightedBranchId}
              currentSha={currentSha}
              branchMap={branchMap}
              pointerMap={pointerMap}
            />
          );
        })}
        {vertices?.map((vertice: SourceCommitNodeWithGridDimensions) => {
          return (
            <CommitVertice
              grid={grid}
              key={vertice?.sha as string}
              vertice={vertice}
              branchMap={branchMap}
              columnDistance={columnDistance}
              rowDistance={rowDistance}
              onChangeFocalPoint={onChangeFocalPoint}
              renderPopup={renderPopup}
              currentSha={currentSha}
              onSelectBranch={onSelectBranch}
              onMouseOverBranch={onMouseOverBranch}
              onMouseOffBranch={onMouseOffBranch}
            />
          );
        })}
        <g style={{outline: 'none'}} ref={portalRef}></g>
      </g>
    </SVGPortalProvider>
  );
};

export default React.memo(CommitChart);
