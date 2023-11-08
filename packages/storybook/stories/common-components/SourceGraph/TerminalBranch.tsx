import React, {
  useMemo,
  useCallback,
} from "react";

import { motion } from "framer-motion";
import { Branch } from "floro/dist/src/repo";

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
    isCurrentBranch?: boolean;
}

const TerminalBranch = ({
    branchStemX2,
    branchStemY2,
    index,
    terminalBranches,
    branch,
    fill,
    isCurrentBranch = false,
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
      return branchStemY2 + 48 * (index - (terminalBranches.length - 1));
    }, [branchStemY2, index, terminalBranches.length]);
  return (
    <motion.text
      x={x}
      y={y}
      fill={fill}
      fontWeight={600}
      fontFamily="MavenPro"
      fontSize={isCurrentBranch ? 36 : 32}
      textDecoration={isCurrentBranch ? "underline" : "none"}
      style={{
        cursor: "pointer",
      }}
      onClick={onSelectBranch}
      onMouseEnter={onMouseOverBranch}
      onMouseLeave={onMouseOffBranch}
    >
      {`${branch.name.length > 20 ? branch.name.substring(0, 20) + "...": branch.name}`}
    </motion.text>
  );
};

export default React.memo(TerminalBranch);
