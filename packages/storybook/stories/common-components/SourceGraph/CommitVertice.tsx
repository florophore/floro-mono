import React, {
  useMemo,
  useCallback,
  useState,
  useEffect,
  useRef,
} from "react";
import { SourceCommitNodeWithGridDimensions } from "./grid";
import { useTheme } from "@emotion/react";
import { Branch } from "./grid";
import { useSvgSourceGraphPortal } from "./SVGPortalContext";
import { useSvgScale } from "./SVGScaleContext";
import CommitContent from "./CommitContent";
import { motion } from "framer-motion";
import TerminalBranch from "./TerminalBranch";
import { getColorForRow } from "./color-mod";

const RHO = (Math.PI * 3) / 16;
const THETA = Math.PI / 4;
const THETA_ANGLE_X = Math.cos(THETA);
const THETA_ANGLE_Y = -Math.sin(THETA);
const RHO_ANGLE_TOP_X = Math.cos(THETA + RHO);
const RHO_ANGLE_TOP_Y = -Math.sin(THETA + RHO);
const RHO_ANGLE_BOTTOM_X = Math.cos(THETA - RHO);
const RHO_ANGLE_BOTTOM_Y = -Math.sin(THETA - RHO);

const HERE_THETA = Math.PI /4;
const HERE_THETA_ANGLE_0_X = Math.cos(-HERE_THETA);
const HERE_THETA_ANGLE_0_Y = -Math.sin(-HERE_THETA);
const HERE_THETA_ANGLE_1_X = Math.cos(-(HERE_THETA * 3));
const HERE_THETA_ANGLE_1_Y = -Math.sin(-(HERE_THETA * 3));

const R = 24;
const S = 4;
const POLY_L = 20;
const HERE_POLY_L = 40;
const HERE_RECT_L = 30;

interface Props {
  vertice: SourceCommitNodeWithGridDimensions;
  grid: Array<Array<SourceCommitNodeWithGridDimensions | null>>;
  columnDistance: number;
  rowDistance: number;
  branchMap: { [key: string]: Branch };
  onChangeFocalPoint: (point: null | [number, number]) => void;
  currentSha?: string|null;
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
  htmlContentHeight?: number;
  currentBranchId?: string;
  filterBranches?: boolean;
  filteredBranches?: Array<Branch>;
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

  const theme = useTheme();
  const svgPortal = useSvgSourceGraphPortal();
  const htmlContainerRef = useRef<SVGGElement>(null);
  const svgContainerRef = useRef<SVGGElement>(null);

  const terminalBranches = useMemo(() => {
    const childrenBrancheSet = new Set<string>(
      props?.vertice?.children?.flatMap((c) => c?.branchIds ?? []) ?? []
    );
    let branches: Array<Branch> = [];
    for (const branchId of props.vertice.branchIds) {
      if (!childrenBrancheSet.has(branchId)) {
        const branch = props.branchMap[branchId];
        if (branch.lastCommit == props.vertice.sha) {
          branches.push(branch);
        }
      }
    }
    if (!props.filterBranches) {
      return branches;
    }
    const filteredBranchIds = new Set(props?.filteredBranches?.map?.(v => v?.id) ?? []);
    return branches?.filter(b => filteredBranchIds.has(b.id));
  }, [
    props.vertice?.sha,
    props.vertice?.branchIds,
    props?.vertice?.children,
    props?.grid,
    props.branchMap,
    props.filterBranches
  ]);

  const onSelectNode = useCallback(() => {
    props?.onSelectNode?.(props.vertice, terminalBranches);
  }, [props.onSelectNode, terminalBranches, props.vertice]);

  const [isHovering, setIsHovering] = useState(false);
  const [showHovered, setShowHovered] = useState(false);
  const [shouldStickHTML, setShouldStickHTML] = useState(false);

  const onClick = useCallback(() => {
    props.onChangeFocalPoint([x, y]);
    setShouldStickHTML(true);
    onSelectNode();
  }, [props.onChangeFocalPoint, x, y, onSelectNode]);

  useEffect(() => {
    if (shouldStickHTML) {
      const onUnstick = (event: Event) => {
        if (event.target) {
          if (
            event.target == svgContainerRef.current ||
            event.target == htmlContainerRef.current
          ) {
            return;
          }
          if (
            svgContainerRef.current &&
            svgContainerRef.current.contains(event.target as Node)
          ) {
            return;
          }
          if (
            htmlContainerRef.current &&
            htmlContainerRef.current.contains(event.target as Node)
          ) {
            return;
          }
        }
        setShouldStickHTML(false);
        setShowHovered(false);
      };
      document.addEventListener("click", onUnstick);
      return () => {
        document.removeEventListener("click", onUnstick);
      };
    }
  }, [shouldStickHTML]);

  const onMouseOver = useCallback(() => {
    setIsHovering(true);
    setShowHovered(true);
  }, []);

  const onMouseLeave = useCallback(() => {
    setIsHovering(false);
  }, []);

  const onHidePopup = useCallback(() => {
    setShouldStickHTML(false);
    setShowHovered(false);
  }, []);

  useEffect(() => {
    if (!isHovering) {
      const timeout = setTimeout(() => {
        setShowHovered(false);
      }, 100);
      return () => clearTimeout(timeout);
    }
  }, [isHovering]);

  const nodeHtml = useMemo(() => {
    if (!props?.renderPopup) {
      return null;
    }
    return (
      props.renderPopup({
        terminalBranches,
        sourceCommit: props.vertice,
        onHidePopup,
      }) ?? null
    );
  }, [terminalBranches, props.vertice, onHidePopup, props?.renderPopup]);

  const showHTMLNode = useMemo(() => {
    return !!nodeHtml && (showHovered || shouldStickHTML);
  }, [showHovered, shouldStickHTML, props.renderPopup, nodeHtml]);

  const fill = useMemo(() => {
    if (props.vertice.branchIds.length == 0) {
      return theme.background;
    }
    return getColorForRow(theme, props.vertice.row);
  }, [theme.name, props.vertice.row, props.vertice.branchIds]);

  const selectedFill = useMemo(() => {
    if (props.vertice.branchIds.length == 0) {
      return theme.colors.sourceGraphNodeOutline;
    }
    return fill;
  }, [fill, theme, props.vertice.row, props.vertice.branchIds]);

  const stroke = useMemo(() => {
    if (props.vertice.branchIds.length == 0) {
      if (
        props.currentSha == props.vertice.sha ||
        props.vertice.isInCurrentLineage
      ) {
        return theme.colors.sourceGraphNodeOutline;
      }

      return theme.colors.sourceGraphNodeBranchlessOutline;
    }
    return theme.colors.sourceGraphNodeOutline;
  }, [
    theme,
    props.vertice.branchIds,
    props.currentSha,
    props.vertice.isInCurrentLineage,
  ]);

  const scale = useSvgScale();
  const invScale = 1 / scale;
  const isSelected = useMemo(() => {
    if (props?.currentSha) {
      return props?.currentSha == props.vertice.sha;
    }
    return false;
  }, [props.vertice, props.currentSha]);

  // DETERMINES OFFSETS FOR STEM/POLYGON/HTML if isSelected Node
  const selectedOffset = isSelected ? R * 2 - S : 4;

  // BRANCH STEM MATH;
  const branchStemRadius = props.rowDistance / 3;
  const branchStemX1 = x + (R + S + selectedOffset) * THETA_ANGLE_X;
  const branchStemY1 = y + (R + S + selectedOffset) * THETA_ANGLE_Y;
  const branchStemX2 =
    x + (R + branchStemRadius + selectedOffset) * THETA_ANGLE_X;
  const branchStemY2 =
    y + (R + branchStemRadius + selectedOffset) * THETA_ANGLE_Y;
  const halfBranchWidth = Math.abs(branchStemX2 - branchStemX1) / 2;
  const halfBranchHeight = Math.abs(branchStemY2 - branchStemY1) / 2;
  const branchStemXHalf = branchStemX1 + halfBranchWidth;
  const branchStemYQuarterHeight = branchStemY2 + halfBranchHeight / 2;
  const branchStemBezierStart = [branchStemXHalf, branchStemYQuarterHeight];
  const branchStemBezierEnd = [branchStemXHalf, branchStemY2];

  // TRIANGLE POLYGON MATH;
  const polyP0x = x + (R + selectedOffset) * THETA_ANGLE_X + 0.75;
  const polyP0y = y + (R + selectedOffset) * THETA_ANGLE_Y + 1.5;
  const polyP1x = polyP0x + RHO_ANGLE_TOP_X * POLY_L;
  const polyP1y = polyP0y + RHO_ANGLE_TOP_Y * POLY_L;
  const polyP2x = polyP0x + RHO_ANGLE_BOTTOM_X * POLY_L;
  const polyP2y = polyP0y + RHO_ANGLE_BOTTOM_Y * POLY_L;

  // CURRENT POLYGON
  // TRIANGLE POLYGON MATH;
  const herePolyP0x = x;
  const herePolyP0y = y + (R + selectedOffset);
  const herePolyP1x = herePolyP0x + HERE_THETA_ANGLE_0_X * HERE_POLY_L;
  const herePolyP1y = herePolyP0y + HERE_THETA_ANGLE_0_Y * HERE_POLY_L;
  const herePolyP2x = herePolyP0x + HERE_THETA_ANGLE_1_X * HERE_POLY_L;
  const herePolyP2y = herePolyP0y + HERE_THETA_ANGLE_1_Y * HERE_POLY_L;
  const hereTrinagleD = Math.abs(herePolyP1x - herePolyP2x);
  const hereRectOffset = hereTrinagleD/3;
  const hereP1Tx = herePolyP1x - hereRectOffset;
  const hereP1Ty = herePolyP1y;
  const hereP1TBx = hereP1Tx;
  const hereP1TBy = hereP1Ty + HERE_RECT_L;
  const hereP2Tx = herePolyP2x + hereRectOffset;
  const hereP2Ty = herePolyP2y;
  const hereP2TBx = hereP2Tx;
  const hereP2TBy = hereP2Ty + HERE_RECT_L;

  // HTML CONTAINER MATH
  const htmlHeight = useMemo(
    () => props.htmlContentHeight ?? props.rowDistance * 0.4,
    [props.htmlContentHeight]
  );

  const htmlWidth = props.columnDistance * 0.75;

  return (
    <>
      <g ref={svgContainerRef}>
        {terminalBranches?.length > 0 && (
          <>
            <motion.path
              fill="transparent"
              stroke={`${fill}`}
              strokeLinecap="round"
              strokeDasharray={`${6}`}
              strokeWidth={`${S}`}
              d={`
                      M${branchStemX1},${branchStemY1}
                      C${branchStemBezierStart[0]},${branchStemBezierStart[1]}
                      ${branchStemBezierEnd[0]},${branchStemBezierEnd[1]}
                      ${branchStemX2},${branchStemY2}
                  `}
              animate={{
                d: `
                      M${branchStemX1},${branchStemY1}
                      C${branchStemBezierStart[0]},${branchStemBezierStart[1]}
                      ${branchStemBezierEnd[0]},${branchStemBezierEnd[1]}
                      ${branchStemX2},${branchStemY2}
                  `,
              }}
              transition={{
                duration: 0.2,
                ease: "easeInOut",
              }}
            />
            <motion.polygon
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
              animate={{
                points: `
                      ${polyP0x},${polyP0y}
                      ${polyP1x},${polyP1y}
                      ${polyP2x},${polyP2y}
                  `,
              }}
              transition={{
                duration: 0.2,
                ease: "easeInOut",
              }}
            />
          </>
        )}
        {isSelected && (
          <motion.circle
            style={{ cursor: "pointer" }}
            r={`${R * 2.5}`}
            cx={x}
            cy={y}
            onClick={onClick}
            fill={theme.background}
            stroke={`${selectedFill}`}
            strokeWidth={`${S * 2}`}
            transition={{
              duration: 0.2,
              ease: "easeInOut",
            }}
            initial={{
              r: R,
            }}
            animate={{
              r: R * 2.5,
            }}
          />
        )}
        <circle
          onMouseEnter={onMouseOver}
          onMouseLeave={onMouseLeave}
          style={{ cursor: "pointer" }}
          r={`${R}`}
          cx={x}
          cy={y}
          onClick={onClick}
          fill={`${fill}`}
          stroke={`${stroke}`}
          strokeWidth={`${S}`}
        />
        {props.vertice.isCurrent && (
          <motion.polygon
            strokeLinejoin="round"
            style={{ cursor: "pointer" }}
            strokeWidth={`${S}`}
            fill={`${theme.colors.removedText}`}
            stroke={`${stroke}`}
            points={`
                    ${herePolyP0x},${herePolyP0y}
                    ${herePolyP1x},${herePolyP1y}
                    ${hereP1Tx},${hereP1Ty}
                    ${hereP1TBx},${hereP1TBy}
                    ${hereP2TBx},${hereP2TBy}
                    ${hereP2Tx},${hereP2Ty}
                    ${herePolyP2x},${herePolyP2y}
                `}
              animate={{
                points: `
                    ${herePolyP0x},${herePolyP0y}
                    ${herePolyP1x},${herePolyP1y}
                    ${hereP1Tx},${hereP1Ty}
                    ${hereP1TBx},${hereP1TBy}
                    ${hereP2TBx},${hereP2TBy}
                    ${hereP2Tx},${hereP2Ty}
                    ${herePolyP2x},${herePolyP2y}
                  `,
              }}
              transition={{
                duration: 0.2,
                ease: "easeInOut",
              }}
          />
        )}
        {terminalBranches?.map((branch, index) => {
          return (
            <React.Fragment key={index}>
              <TerminalBranch
                branchStemX2={branchStemX2}
                branchStemY2={branchStemY2}
                index={index}
                terminalBranches={terminalBranches}
                branch={branch}
                fill={fill}
                onSelectBranch={props.onSelectBranch}
                onMouseOffBranch={props.onMouseOffBranch}
                onMouseOverBranch={props.onMouseOverBranch}
                isCurrentBranch={props.currentBranchId == branch.id}
              />
            </React.Fragment>
          );
        })}
      </g>
      {showHTMLNode &&
        nodeHtml &&
        svgPortal(
          <g
            ref={htmlContainerRef}
            onMouseEnter={onMouseOver}
            onMouseLeave={onMouseLeave}
          >
            <g
              style={{ cursor: "default" }}
              transform={`translate(${(x - (htmlWidth * invScale) / 2) * 1},${
                y + (R + selectedOffset + (isSelected ? -4 : -2))
              })scale(${invScale})`}
            >
              <foreignObject
                style={{ outline: "none" }}
                width={`${htmlWidth}`}
                height={`${htmlHeight}`}
              >
                <CommitContent>{nodeHtml}</CommitContent>
              </foreignObject>
            </g>
          </g>
        )}
    </>
  );
};

export default React.memo(CommitVertice);
