import React, {
  useMemo,
  useCallback,
} from "react";

import { Branch } from "./grid";
import { motion } from "framer-motion";

interface Props {
    branchStemX2: number;
    branchStemY2: number;
    index: number;
    terminalBranches: Array<Branch>;
    branch: Branch;
    fill?: string;
    onSelectBranch?: (branch: Branch) => void;
    onMouseOverBranch?: (branch: Branch) => void;
    onMouseOffBranch?: (branch: Branch) => void;
}

const TerminalBranch = ({
    branchStemX2,
    branchStemY2,
    index,
    terminalBranches,
    branch,
    fill,
    ...rest

}: Props) => {
    const onSelectBranch = useCallback(() => {
        rest.onSelectBranch?.(branch)
    }, [rest.onSelectBranch, branch])

    const onMouseOverBranch = useCallback(() => {
        rest.onMouseOverBranch?.(branch)
    }, [rest.onMouseOverBranch, branch]);

    const onMouseOffBranch = useCallback(() => {
        rest.onMouseOffBranch?.(branch)
    }, [rest.onMouseOffBranch, branch]);

    const x = useMemo(() => {
        return branchStemX2 + 16;
    }, [branchStemX2])
    const y = useMemo(() => {
      return branchStemY2 + 8 - 48 * (index - (terminalBranches.length - 1));
    }, [branchStemY2, index, terminalBranches.length]);
  return (
    <motion.text
      x={x}
      y={y}
      fill={fill}
      fontWeight={600}
      fontFamily="MavenPro"
      fontSize={32}
      style={{
        cursor: "pointer",
      }}
      onClick={onSelectBranch}
      onMouseEnter={onMouseOverBranch}
      onMouseLeave={onMouseOffBranch}
    >
      {`${branch.name}`}
    </motion.text>
  );
};

export default React.memo(TerminalBranch);
