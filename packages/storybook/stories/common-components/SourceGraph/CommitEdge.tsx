import React, { useMemo } from "react";
import { Branch, Edge, SourceCommitNodeWithGridDimensions } from "./grid";
import { useTheme } from "@emotion/react";
import { motion } from "framer-motion";
import ColorPalette from "@floro/styles/ColorPalette";

interface Props {
  edge: Edge;
  highlightedBranchId?: string;
  currentSha?: string;
  branchMap: { [key: string]: Branch };
  pointerMap: { [key: string]: SourceCommitNodeWithGridDimensions };
}

const CommitEdge = (props: Props) => {
  const theme = useTheme();

  const highlightedBranch = useMemo(() => {
    if (!props.highlightedBranchId) {
      return null;
    }
    return props.branchMap[props.highlightedBranchId];
  }, [props.highlightedBranchId, props.branchMap])

  const highlightCommit = useMemo(() => {
    if (!highlightedBranch) {
      if (props.currentSha && props.edge.child.isInCurrentLineage) {
        const commit = props.pointerMap?.[props.currentSha];
        return commit ?? null;
      }
      return null;
    }
    const commit = props.pointerMap?.[highlightedBranch.lastCommit as string];
    return commit ?? null;
  }, [props.branchMap, props.edge.child.isInCurrentLineage, highlightedBranch, props.pointerMap, props.currentSha]);

  const highlightedRow = useMemo(() => {
    if (!highlightCommit) {
      return -1;
    }
    return highlightCommit?.row ?? -1;
  }, [highlightCommit]);

  const isSelected = useMemo(() => {
    return props.edge.child.isInCurrentLineage;
  }, [props.edge.child?.isInCurrentLineage]);

  const highlightColor = useMemo(() => {
    if (highlightedRow == -1) {
      return null;
    }
    if (highlightedRow % 5 == 0) {
      return theme.name == "light"
        ? ColorPalette.purple
        : ColorPalette.lightPurple;
    }
    if (highlightedRow % 5 == 1) {
      return theme.name == "light" ? ColorPalette.teal : ColorPalette.teal;
    }
    if (highlightedRow % 5 == 2) {
      return theme.name == "light" ? ColorPalette.orange : ColorPalette.orange;
    }

    if (highlightedRow % 5 == 3) {
      return theme.name == "light" ? ColorPalette.gray : ColorPalette.gray;
    }

    if (highlightedRow % 5 == 4) {
      return theme.name == "light" ? ColorPalette.red : ColorPalette.lightRed;
    }
  }, [theme.name, highlightedRow]);

  const isHighlighted = useMemo(() => {
    if (!props.highlightedBranchId) {
      if (props.edge.child.isInCurrentLineage) {
        return true;
      }
      return false;
    }
    return (
      props.edge.child.branchIds?.includes(props.highlightedBranchId) ?? false
    );

  }, [highlightedRow, props.edge.child.branchIds, props.edge.child.isInCurrentLineage]);

  const strokeWidth = useMemo(() => {
    if (isSelected) {
      return 10;
    }
    return 5;
  }, [isSelected, props.edge.child.isInCurrentLineage]);

  const stroke = useMemo(() => {
    if (highlightCommit && isHighlighted && highlightColor) {
      if (highlightCommit.branchIds.length == 0) {
        return theme.colors.sourceGraphNodeOutline;
      }
      return highlightColor;
    }
    if (props.edge.child.branchIds.length == 0) {
      if (isSelected) {
        return theme.colors.sourceGraphNodeOutline;
      }
      return theme.colors.sourceGraphNodeBranchlessOutline;
    }
    return theme.colors.sourceGraphNodeOutline;
  }, [theme, props.edge.child.branchIds, highlightColor, isHighlighted, isSelected, highlightCommit]);

  const strokeDashArray = useMemo(() => {
    if (props.edge.child.branchIds.length == 0) {
      if (props.edge.child.isInCurrentLineage) {
        return 15;
      }
      return 10;
    }
    return 0;
  }, [theme, props.edge.child.branchIds, props.edge.child.isInCurrentLineage]);
  return (
    <motion.path
      fill="transparent"
      stroke={stroke}
      strokeLinecap="round"
      strokeDasharray={`${strokeDashArray}`}
      d={`
        M${props.edge.start[0]},${props.edge.start[1]}
        C${props.edge.bezierStart[0]},${props.edge.bezierStart[1]}
         ${props.edge.bezierEnd[0]},${props.edge.bezierEnd[1]}
         ${props.edge.end[0]},${props.edge.end[1]}
      `}
      animate={{
        strokeWidth,
        stroke
      }}
      transition={{
        duration: 0.2,
        ease: "easeInOut",
      }}
    />
  );
};

export default React.memo(CommitEdge);
