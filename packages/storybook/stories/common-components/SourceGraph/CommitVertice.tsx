import React, { useMemo, useCallback } from "react";
import { SourceCommitNodeWithGridDimensions } from "./grid";
import { useTheme } from "@emotion/react";
import ColorPalette from "@floro/styles/ColorPalette";
import { Branch } from "./grid";

const RHO = Math.PI * 3/16;
const THETA = Math.PI / 4;
const THETA_ANGLE_X = Math.cos(THETA);
const THETA_ANGLE_Y = -Math.sin(THETA);
const RHO_ANGLE_TOP_X = Math.cos(THETA + RHO);
const RHO_ANGLE_TOP_Y = -Math.sin(THETA + RHO);
const RHO_ANGLE_BOTTOM_X = Math.cos(THETA - RHO);
const RHO_ANGLE_BOTTOM_Y = -Math.sin(THETA - RHO);
const R = 24;
const S = 4;
const POLY_L = 20;

interface Props {
  vertice: SourceCommitNodeWithGridDimensions;
  grid: Array<Array<SourceCommitNodeWithGridDimensions | null>>;
  columnDistance: number;
  rowDistance: number;
  branchMap: { [key: string]: Branch };
  onChangeFocalPoint: (point: null | [number, number]) => void;
}

const CommitVertice = (props: Props) => {
  const x = useMemo(
    () => props.columnDistance * props.vertice.column,
    [props.columnDistance, props.vertice]
  );
  const y = useMemo(
    () => props.rowDistance * props.vertice.row,
    [props.rowDistance, props.vertice]
  );

  const onClick = useCallback(() => {
    props.onChangeFocalPoint([x, y]);
  }, [props.onChangeFocalPoint, x, y]);

  const theme = useTheme();

  const terminalBranches = useMemo(() => {
    // can performance optimize by checking if right cell is empty
    if (!!props?.grid?.[props.vertice.row]?.[props.vertice.column + 1]) {
      return [];
    }
    const childrenBrancheSet = new Set<string>(
      props?.vertice?.children?.flatMap((c) => c?.branchIds ?? []) ?? []
    );
    let branches: Array<string> = [];
    for (const branchId of props.vertice.branchIds) {
      if (!childrenBrancheSet.has(branchId)) {
        if (!branches.includes(branchId)) {
          branches.push(branchId);
        }
      }
    }
    return branches;
  }, [props.vertice?.branchIds, props?.vertice?.children, props?.grid]);

  const fill = useMemo(() => {
    if (props.vertice.branchIds.length == 0) {
      return theme.background;
    }
    if (props.vertice.row % 5 == 0) {
      return theme.name == "light"
        ? ColorPalette.purple
        : ColorPalette.lightPurple;
    }
    if (props.vertice.row % 5 == 1) {
      return theme.name == "light" ? ColorPalette.teal : ColorPalette.teal;
    }
    if (props.vertice.row % 5 == 2) {
      return theme.name == "light" ? ColorPalette.orange : ColorPalette.orange;
    }

    if (props.vertice.row % 5 == 3) {
      return theme.name == "light" ? ColorPalette.gray : ColorPalette.gray;
    }

    if (props.vertice.row % 5 == 4) {
      return theme.name == "light" ? ColorPalette.red : ColorPalette.lightRed;
    }
  }, [theme.name, props.vertice.row, props.vertice.branchIds]);

  const stroke = useMemo(() => {
    if (props.vertice.branchIds.length == 0) {
      return theme.colors.sourceGraphNodeBranchlessOutline;
    }
    return theme.colors.sourceGraphNodeOutline;
  }, [theme, props.vertice.branchIds]);


  // STEM MATH;
  const branchStemRadius = props.rowDistance/3;
  const branchStemX1 = x + R * THETA_ANGLE_X;
  const branchStemY1 = y + R * THETA_ANGLE_Y;
  const branchStemX2 = x + (R + branchStemRadius) * THETA_ANGLE_X;
  const branchStemY2 = y + (R + branchStemRadius) * THETA_ANGLE_Y;
  const halfBranchWidth = Math.abs(branchStemX2 - branchStemX1)/2;
  const halfBranchHeight = Math.abs(branchStemY2 - branchStemY1)/2;
  const branchStemXHalf = branchStemX1 + halfBranchWidth;
  const branchStemYQuarterHeight = branchStemY2 + halfBranchHeight/2;
  const branchStemBezierStart = [branchStemXHalf, branchStemYQuarterHeight];
  const branchStemBezierEnd = [branchStemXHalf, branchStemY2];

  const polyP0x = x + (R) * THETA_ANGLE_X + 1;
  const polyP0y = y + (R) * THETA_ANGLE_Y - 2;
  const polyP1x = polyP0x + (RHO_ANGLE_TOP_X * POLY_L);
  const polyP1y = polyP0y + (RHO_ANGLE_TOP_Y * POLY_L);
  const polyP2x = polyP0x + (RHO_ANGLE_BOTTOM_X * POLY_L);
  const polyP2y = polyP0y + (RHO_ANGLE_BOTTOM_Y * POLY_L);


  return (
    <>
      {terminalBranches?.length > 0 && (
        <>
          <path
            fill="transparent"
            stroke={`${fill}`}
            strokeLinecap="round"
            strokeDasharray={`${8}`}
            strokeWidth={`${S}`}
            d={`
                    M${branchStemX1},${branchStemY1}
                    C${branchStemBezierStart[0]},${branchStemBezierStart[1]}
                    ${branchStemBezierEnd[0]},${branchStemBezierEnd[1]}
                    ${branchStemX2},${branchStemY2}
                `}
          />
          <polygon
            strokeLinejoin="round"
            transform={`rotate(-14, ${polyP0x}, ${polyP0y})`}
            fill={`${fill}`}
            stroke={`${fill}`}
            strokeWidth={"2"}
            points={`
                    ${polyP0x},${polyP0y}
                    ${polyP1x},${polyP1y}
                    ${polyP2x},${polyP2y}
                `}
          />
        </>
      )}
      <circle
        style={{ cursor: "pointer" }}
        r={`${R}`}
        cx={x}
        cy={y}
        onClick={onClick}
        fill={`${fill}`}
        stroke={`${stroke}`}
        strokeWidth={`${S}`}
      />
      {terminalBranches?.map((branchId, index) => {
        // get branch name
        return (
          <React.Fragment key={index}>
            <text
              x={branchStemX2 + 16}
              y={
                branchStemY2 + 8 - 48 * (index - (terminalBranches.length - 1))
              }
              fill={fill}
              fontWeight={600}
              fontFamily="MavenPro"
              fontSize={32}
              style={{
                cursor: 'pointer'
              }}
            >
              {`${props.branchMap[branchId].name}`}
            </text>
          </React.Fragment>
        );

      })}
    </>
  );
};

export default React.memo(CommitVertice);
