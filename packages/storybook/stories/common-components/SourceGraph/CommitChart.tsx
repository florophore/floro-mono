import React from "react";
import styled from "@emotion/styled";
import {
  Branch,
  Edge,
  SourceCommitNodeWithGridDimensions,
} from "./grid";
import DebugGraph from "./DebugGraph";
import CommitVertice from "./CommitVertice";
import CommitEdge from "./CommitEdge";

const Container = styled.div`
  position: relative;
`;

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
  grid: Array<Array<SourceCommitNodeWithGridDimensions|null>>;
  branchMap: { [key: string]: Branch };
  onChangeFocalPoint: (point: null | [number, number]) => void;
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
  onChangeFocalPoint,
}: Props) => {
  return (
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
      {edges.map((edge: Edge, index) => {
        return (
          <CommitEdge edge={edge} key={index}/>
        );
      })}
      {vertices?.map(
        (vertice: SourceCommitNodeWithGridDimensions) => {
          return (
            <CommitVertice
              grid={grid}
              key={vertice?.sha as string}
              vertice={vertice}
              branchMap={branchMap}
              columnDistance={columnDistance}
              rowDistance={rowDistance}
              onChangeFocalPoint={onChangeFocalPoint}
            />
          );
        }
      )}
    </g>
  );
};

export default React.memo(CommitChart);
