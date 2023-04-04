import React, { useMemo } from "react";
import { Edge } from "./grid";
import { useTheme } from "@emotion/react";

interface Props {
  edge: Edge;
}

const CommitEdge = (props: Props) => {
  const theme = useTheme()
  const stroke = useMemo(() => {
    if (props.edge.child.branchIds.length == 0) {
        return theme.colors.sourceGraphNodeBranchlessOutline;
    }
    return theme.colors.sourceGraphNodeOutline;
  }, [theme, props.edge.child.branchIds])

  const strokeDashArray = useMemo(() => {
    if (props.edge.child.branchIds.length == 0) {
        return 10;
    }
    return 0
  }, [theme, props.edge.child.branchIds])
  return (
    <path
      fill="transparent"
      stroke={`${stroke}`}
      strokeLinecap="round"
      strokeDasharray={`${strokeDashArray}`}
      strokeWidth="5"
      d={`
        M${props.edge.start[0]},${props.edge.start[1]}
        C${props.edge.bezierStart[0]},${props.edge.bezierStart[1]}
         ${props.edge.bezierEnd[0]},${props.edge.bezierEnd[1]}
         ${props.edge.end[0]},${props.edge.end[1]}
      `}
    />
  );
};

export default React.memo(CommitEdge);
