import { SourceCommitNode } from "floro/dist/src/sourcegraph";
import { Branch } from "floro/dist/src/repo";

export interface SourceCommitNodeWithGridDimensions extends SourceCommitNode {
  row: number;
  column: number;
  maxChainLength?: number;
  isInCurrentLineage?: boolean;
}

const getSubGraphWidth = (node: SourceCommitNode): number => {
  const childrenHeights = node?.children?.map?.(getSubGraphWidth) ?? [
    node.idx + 1,
  ];
  return Math.max(node.idx + 1, ...(childrenHeights ?? []));
};

const getSubGraphLeaves = (node: SourceCommitNode): Array<SourceCommitNode> => {
  if (!node.children || node.children?.length == 0) {
    return [node];
  }
  return node?.children.flatMap(getSubGraphLeaves);
};

export const getTopologicalBranchMap = (
  branches: Array<Branch>
): { [key: string]: string } => {
  return branches.reduce((acc, branch) => {
    return {
      ...acc,
      [branch.id]: branch.baseBranchId,
    };
  }, {});
};

export const getBranchMap = (
  branches: Array<Branch>
): { [key: string]: Branch } => {
  return branches.reduce((acc, branch) => {
    return {
      ...acc,
      [branch.id]: branch,
    };
  }, {});
};

const getBranchTopOrder = (
  branchId: string,
  branchMap: { [key: string]: string },
  out: Array<string> = []
): Array<string> => {
  if (!branchMap?.[branchId]) {
    return out;
  }
  return getBranchTopOrder(branchMap[branchId], branchMap, [
    ...out,
    branchMap[branchId],
  ]);
};

export const getPotentialBaseBranchesForSha = (
  sha: string|undefined|null,
  branches: Array<Branch>,
  pointerMap: { [sha: string]: SourceCommitNode } = {}
): Array<Branch> => {
  if (!sha) {
    return branches.filter?.(b => !b.lastCommit) ?? [];
  }
  let firstCommitWithBranchIds = pointerMap[sha];
  while(firstCommitWithBranchIds?.parent && firstCommitWithBranchIds?.branchIds?.length == 0) {
    firstCommitWithBranchIds = pointerMap[firstCommitWithBranchIds.parent];
  }

  const sourceCommit = pointerMap[firstCommitWithBranchIds?.sha as string];
  if (!sourceCommit) {
    return branches.filter?.(b => !b.lastCommit) ?? [];
  }
  const visitedBranches = new Set<string>([]);
  const branchMap = getBranchMap(branches);
  const topologicalBranchMap = getTopologicalBranchMap(branches);
  const order: {[key: string]: number} = {};
  let index = 0;
  for (const branchId of sourceCommit?.branchIds ?? []) {
    const upsteamBranches = [branchId, ...getBranchTopOrder(branchId, topologicalBranchMap)];
    for (let bId of upsteamBranches) {
      if (bId && !visitedBranches.has(bId)) {
        visitedBranches.add(bId);
        order[bId] = index++;
      }
    }
  }
  const out: Array<Branch> = [];
  for (let i = 0; i < Object.keys(order).length; ++i) {
    out.push();
  }
  for (const branchId in order) {
    out[order[branchId]] = branchMap[branchId];
  }
  return out;
}

const sortBranchIdsIntoTopologicalOrder = (
  branches: Array<Branch>,
  branchIds: Array<string>
): {[k: string]: number} => {
  const topologicalBranchMap = getTopologicalBranchMap(branches);
  const out: Array<{ branchId: string; length: number }> = [];
  for (const branchId of branchIds) {
    const subBranchIds = getBranchTopOrder(
      branchId,
      topologicalBranchMap
    ).filter((id) => {
      return branchIds.includes(id);
    });
    out.push({
      branchId,
      length: subBranchIds.length,
    });
  }
  return out.reduce((acc, v) => ({ ...acc, [v.branchId]: v.length }), {});
};

const getTargetBranchId = (
  branches: Array<Branch>,
  branchIds: Array<string>
): string | null => {
  const topologicalBranchMap = getTopologicalBranchMap(branches);
  let longestTopOrder: [string, number] | null = null;
  let shortestTopOrder: [string, number] | null = null;
  for (const branchId of branchIds) {
    const topOrder = getBranchTopOrder(branchId, topologicalBranchMap);
    if (!longestTopOrder || !shortestTopOrder) {
      longestTopOrder = [branchId, topOrder.length];
      shortestTopOrder = [branchId, topOrder.length];
      continue;
    }
    if (topOrder.length > longestTopOrder[1]) {
      longestTopOrder = [branchId, topOrder.length];
      continue;
    }
    if (topOrder.length < shortestTopOrder[1]) {
      shortestTopOrder = [branchId, topOrder.length];
      continue;
    }
  }
  if (!longestTopOrder || !shortestTopOrder) {
    return null;
  }
  if (longestTopOrder[1] == shortestTopOrder[1]) {
    return null;
  }
  return shortestTopOrder[0];
};

const getTargetCommitLeaf = (
  rootNode: SourceCommitNode,
  pointerMap: {[k: string]: SourceCommitNodeWithGridDimensions},
  branches: Array<Branch>,
  branchRankMap: {[k: string]: number}
): SourceCommitNode => {
  const topBranch = getTargetBranchId(branches, rootNode?.branchIds ?? []);
  const topCommit = branches?.find(b => b.id == topBranch)?.lastCommit;
  if (topCommit && pointerMap[topCommit]) {
    return pointerMap[topCommit];
  }
  const leaves = getSubGraphLeaves(rootNode);
  return (
    leaves.sort((a, b) => {
      const scoreA = getNodeBranchRank(a, branchRankMap);
      const scoreB = getNodeBranchRank(b, branchRankMap);
      if (scoreA == scoreB) {
        if (a?.branchIds?.length == b?.branchIds?.length) {
          if (a.idx == b.idx) {
            if (new Date(a.timestamp) == new Date(b.timestamp)) {
              return 0;
            }
            return new Date(a.timestamp) > new Date(b.timestamp) ? -1 : 1;
          }
          return a.idx > b.idx ? -1 : 1;
        }
        return (a?.branchIds?.length  ?? 0) > (b?.branchIds?.length ?? 0) ? -1 : 1;
      }
      return scoreA > scoreB ? 1 : -1;
    })?.[0] ?? rootNode
  );
};

const buildPointerMap = (
  nodes: Array<SourceCommitNode>,
  pointerMap: { [sha: string]: SourceCommitNodeWithGridDimensions } = {}
) => {
  for (const node of nodes) {
    if (node.sha) {
      pointerMap[node.sha] = node as SourceCommitNodeWithGridDimensions;
    }
    buildPointerMap(node?.children ?? [], pointerMap);
  }
  return pointerMap;
};

const buildNullGrid = (
  rows: number,
  columns: number
): Array<Array<SourceCommitNodeWithGridDimensions | null>> => {
  const grid: Array<Array<SourceCommitNodeWithGridDimensions | null>> = [];
  for (let i = 0; i < rows; ++i) {
    grid.push([]);
    for (let j = 0; j < columns; ++j) {
      grid[i].push(null);
    }
  }
  return grid;
};

const getNodeBranchRank = (node: SourceCommitNode, branchRankMap: {[k: string]: number}) => {
  if (node?.branchIds?.length == 0) {
    return Number.MAX_SAFE_INTEGER;
  }
  let score = 0;
  for (const branchId of (node?.branchIds ?? [])) {
    score += branchRankMap?.[branchId] ?? 0;
  }
  return score;
}

function insertNodeIntoGrid(
  grid: Array<Array<SourceCommitNodeWithGridDimensions | null>>,
  node: SourceCommitNodeWithGridDimensions,
  row: number,
  column: number,
  visitedNodes: Set<string>,
  targetNodes: Set<string>,
  gridMaxColSize: number,
  branchRankMap: {[k: string]: number}
) {
  ensureGridIsSafe(grid, row, gridMaxColSize);
  node.row = row;
  node.column = column;
  grid[row][column] = node;
  visitedNodes.add(node.sha as string);
  const childrenToTraverse =
    (node?.children as Array<SourceCommitNodeWithGridDimensions>)
      ?.filter?.((child) => {
        return !visitedNodes.has(child.sha as string);
      })
      ?.sort((a, b) => {
        const scoreA = getNodeBranchRank(a, branchRankMap);
        const scoreB = getNodeBranchRank(b, branchRankMap);
        if (scoreA == scoreB) {
          if (a?.branchIds?.length == b?.branchIds?.length) {
            if (a.maxChainLength == b.maxChainLength) {
              if (new Date(a.timestamp) == new Date(b.timestamp)) {
                return 0;
              }
              return new Date(a.timestamp) > new Date(b.timestamp) ? -1 : 1;
            }
            return (a?.maxChainLength ?? 0) > (b?.maxChainLength ?? 0) ? -1 : 1;
          }
          return (a?.branchIds?.length ?? 0) > (b?.branchIds?.length ?? 0) ? -1 : 1;
        }
        return scoreA > scoreB ? 1 : -1;
      }) ?? [];

  for (const child of childrenToTraverse as Array<SourceCommitNodeWithGridDimensions>) {
    const childColumn = column + 1;
    const childEndColumn = getSubGraphWidth(child);
    let childRow = row;
    while (
      !canInsertIntoRow(
        grid,
        childRow,
        childColumn,
        childEndColumn,
        gridMaxColSize
      )
    ) {
      childRow++;
    }

    if (
      childRow == node.row &&
      child?.branchIds?.length != node.branchIds?.length &&
      !targetNodes.has(child.sha as string)
    ) {
      if (child?.branchIds?.length != node.branchIds?.length) {
        childRow++;
      }
      while (
        !canInsertIntoRow(
          grid,
          childRow,
          childColumn,
          childEndColumn,
          gridMaxColSize
        )
      ) {
        childRow++;
      }
    }
    insertNodeIntoGrid(
      grid,
      child,
      childRow,
      childColumn,
      visitedNodes,
      targetNodes,
      gridMaxColSize,
      branchRankMap
    );
  }
}

function ensureGridIsSafe(
  grid: Array<Array<SourceCommitNodeWithGridDimensions | null>>,
  row: number,
  gridMaxColSize: number
) {
  if (!grid?.[row]) {
    for (let k = grid.length; k <= row; ++k) {
      grid.push([]);
      for (let col = 0; col < gridMaxColSize; ++col) {
        grid[k].push(null);
      }
    }
  }
}

function canInsertIntoRow(
  grid: Array<Array<SourceCommitNodeWithGridDimensions | null>>,
  row: number,
  columnStart: number,
  columnEnd: number,
  gridMaxColSize: number
) {
  ensureGridIsSafe(grid, row, gridMaxColSize);
  for (let col = columnStart; col < columnEnd; ++col) {
    if (grid[row][col] != null) {
      return false;
    }
  }
  return true;
}

const printDebugGrid = (
  grid: Array<Array<SourceCommitNodeWithGridDimensions | null>>,
  columnSize: number
) => {
  const debugGrid: Array<Array<string | null>> = buildNullGrid(
    grid.length,
    columnSize
  ) as unknown as Array<Array<string>>;
  for (let i = 0; i < grid.length; ++i) {
    for (let j = 0; j < grid[i].length; ++j) {
      debugGrid[i][j] = grid[i][j]?.sha ?? null;
    }
  }
  console.table(debugGrid);
};

const assignMaxSizeToRoot = (rootNode: SourceCommitNodeWithGridDimensions): SourceCommitNodeWithGridDimensions => {
  let maxSize = rootNode.idx;
  for (const child of rootNode?.children ?? []) {
    const c = assignMaxSizeToRoot(child as SourceCommitNodeWithGridDimensions);
    maxSize = Math.max(maxSize, c.maxChainLength ?? 0)

  }
  rootNode.maxChainLength = maxSize;
  return rootNode;
}

export const mapSourceGraphRootsToGrid = (
  rootNodes: Array<SourceCommitNode>,
  branches: Array<Branch>,
  currentSha?: string|null,
  isDebug = false
): {
  roots: Array<SourceCommitNodeWithGridDimensions>;
  pointerMap: { [sha: string]: SourceCommitNodeWithGridDimensions };
  grid: Array<Array<SourceCommitNodeWithGridDimensions | null>>,
  gridRowSize: number;
  gridColumnSize: number;
} => {
  if (rootNodes?.length == 0) {
    return {
      roots: [],
      pointerMap: {},
      grid: [],
      gridRowSize: 0,
      gridColumnSize: 0,
    };
  }
  const pointerMap = buildPointerMap(rootNodes);
  const orderedRootNodes = rootNodes.sort((a, b) => {
    if (a?.branchIds?.length == b?.branchIds?.length) {
      if (new Date(a.timestamp) == new Date(b.timestamp)) {
        return 0;
      }
      return new Date(a.timestamp) > new Date(b.timestamp) ? -1 : 1;
    }
    return (a?.branchIds?.length ?? 0) > (b?.branchIds?.length ?? 0) ? -1 : 1;
  });

  const subgraphs: Array<SourceCommitNode> = [];

  let columnSize = 0;
  for (let n = 0; n < orderedRootNodes.length; ++n) {
    const rootNode = orderedRootNodes[n];
    const numberColumns = getSubGraphWidth(rootNode);
    columnSize = Math.max(columnSize, numberColumns);
    subgraphs.push(rootNode);
  }

  const grid: Array<Array<SourceCommitNodeWithGridDimensions | null>> = [];
  const roots: Array<SourceCommitNodeWithGridDimensions> = [];
  const visitedNodes: Set<string> = new Set();
  const targetSetMap: Array<Set<string>> = [];
  for (let n = 0; n < subgraphs.length; ++n) {
    const subgraph = assignMaxSizeToRoot(subgraphs[n] as SourceCommitNodeWithGridDimensions);
    const branchRankMap = sortBranchIdsIntoTopologicalOrder(
      branches,
      subgraph?.branchIds ?? []
    );
    let current: SourceCommitNode | SourceCommitNodeWithGridDimensions | null =
      getTargetCommitLeaf(subgraph, pointerMap, branches, branchRankMap);
    targetSetMap.push(new Set());
    while (current) {
      // consider removing
      if (current.sha && current?.parent) {
        targetSetMap[n].add(current.sha);
      }

      if (current?.parent) {
        current = pointerMap[current.parent];
      } else {
        roots.push(current as SourceCommitNodeWithGridDimensions);
        current = null;
      }
    }
    insertNodeIntoGrid(
      grid,
      roots[n] as SourceCommitNodeWithGridDimensions,
      grid.length,
      roots[n].idx,
      visitedNodes,
      targetSetMap[n],
      columnSize,
      branchRankMap
    );
  }
  if (isDebug) {
    printDebugGrid(
      grid,
      columnSize
    );
  }
  return {
    roots: getNodesWithCurrentLineage(roots, pointerMap, currentSha),
    grid,
    pointerMap,
    gridRowSize: grid.length,
    gridColumnSize: columnSize,
  };
};

export interface Edge {
  start: [number, number];
  end: [number, number];
  bezierStart: [number, number];
  bezierEnd: [number, number];
  parent: SourceCommitNodeWithGridDimensions;
  child: SourceCommitNodeWithGridDimensions;
}

export const getEdges = (
  rootNodes: Array<SourceCommitNodeWithGridDimensions>,
  columnDistance: number,
  rowDistance: number
): Array<Edge> => {
  return rootNodes.flatMap((node): Array<Edge> => {
    return getEdgesForNode(node, columnDistance, rowDistance);
  });
};

export const getEdgesForNode = (
  parent: SourceCommitNodeWithGridDimensions,
  columnDistance: number,
  rowDistance: number
): Array<Edge> => {
  return (
    parent.children?.flatMap?.((c): Array<Edge> => {
      const child = c as unknown as SourceCommitNodeWithGridDimensions;
      const start: [number, number] = [
        parent.column * columnDistance,
        parent.row * rowDistance,
      ];
      const end: [number, number] = [
        child.column * columnDistance,
        child.row * rowDistance,
      ];
      const bezierStart: [number, number] = [
        columnDistance *
          (parent.column + Math.abs(parent.column - child.column) / 2),
        parent.row * rowDistance,
      ];
      const bezierEnd: [number, number] = [
        columnDistance *
          (parent.column + Math.abs(parent.column - child.column) / 2),
        child.row * rowDistance,
      ];
      const edge: Edge = {
        start,
        end,
        bezierStart,
        bezierEnd,
        parent,
        child,
      };
      return [edge, ...getEdgesForNode(child, columnDistance, rowDistance)];
    }) ?? ([] as Array<Edge>)
  );
};

export const getVertices = (
  rootNodes: Array<SourceCommitNodeWithGridDimensions>,
  columnDistance: number,
  rowDistance: number
) => {
  return rootNodes.flatMap(
    (node): Array<SourceCommitNodeWithGridDimensions> => {
      return getVerticesForNode(node, columnDistance, rowDistance);
    }
  );
};

export const getVerticesForNode = (
  node: SourceCommitNodeWithGridDimensions,
  columnDistance: number,
  rowDistance: number
): Array<SourceCommitNodeWithGridDimensions> => {
  const nodeOnGrid = node as unknown as SourceCommitNodeWithGridDimensions;
  return [
    node,
    ...getVertices(
      (nodeOnGrid?.children ??
        []) as unknown as Array<SourceCommitNodeWithGridDimensions>,
      columnDistance,
      rowDistance
    ),
  ];
};

export const getInitNode = (
  grid: Array<Array<SourceCommitNodeWithGridDimensions | null>>
): SourceCommitNodeWithGridDimensions | null => {
  let i = 0;
  while (i < grid[0].length) {
    if (!grid[0][i + 1]) {
      return grid[0][i];
    }
    i++;
  }
  return null;
};

const filterNode = (node: SourceCommitNode, filterBranchlessNodes: boolean) => {
  if (filterBranchlessNodes && (node?.branchIds?.length ?? 0) == 0) {
    return null;
  }
  const children = getNodes(node.children ?? [], filterBranchlessNodes);
  return {
    ...node,
    children
  }
}

export const getNodes = (
  rootNodes: Array<SourceCommitNode>,
  filterBranchlessNodes = false
) => {
  return rootNodes?.map(node => {
    return filterNode(node, filterBranchlessNodes);
  })?.filter(n => n != null);
}

export const getNodesWithCurrentLineage = (
  rootNodes: Array<SourceCommitNodeWithGridDimensions>,
  pointerMap: { [sha: string]: SourceCommitNodeWithGridDimensions },
  currentSha?: string|null
) => {
  resetLineage(rootNodes, pointerMap);
  if (!currentSha) {
    return rootNodes;
  }
  let current: SourceCommitNodeWithGridDimensions|undefined|null = pointerMap[currentSha];
  if (!current) {
    return rootNodes;
  }
  while(current) {
    current.isInCurrentLineage = true;
    if (!current?.parent) {
      current = null
    } else {
      current = pointerMap[current?.parent];
    }
  }
  return rootNodes;
}


export const resetLineage = (
  nodes: Array<SourceCommitNodeWithGridDimensions>,
  pointerMap: { [sha: string]: SourceCommitNodeWithGridDimensions }
) => {
  for (const node of nodes) {
    if (node.sha && pointerMap[node.sha]) {
      pointerMap[node.sha].isInCurrentLineage = false
    }
    resetLineage(
      (node?.children ?? []) as Array<SourceCommitNodeWithGridDimensions>,
      pointerMap
    );
  }
};