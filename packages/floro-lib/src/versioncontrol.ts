import { Crypto } from "cryptojs";
import { StateDiff } from "./repo";
import mdiff from "mdiff";

export interface DiffElement {
  key: string;
  value: any;
}

export type Diff = {
  add: {
    [key: string]: DiffElement;
  };
  remove: {
    [key: string]: DiffElement;
  };
};

export type StringDiff = {
  add: {
    [key: number]: string;
  };
  remove: {
    [key: number]: string;
  };
};

export interface CommitData {
  sha?: string;
  diff: StateDiff;
  userId: string;
  authorUserId?: string;
  timestamp: string;
  parent: string | null;
  historicalParent: string | null;
  mergeBase?: string | null;
  mergeRevertSha?: string | null;
  idx: number;
  message: string;
}

const fastHash = (str) => {
  let hash = 0;
  let hash2 = 0;
  for (let i = 0; i < str.length; i++) {
    hash = hash * hash2 ^ ((hash << 5) - hash + str.charCodeAt(i));
    hash2 = (hash2 << 5) - hash + str.charCodeAt(i);
    hash |= 0;
    hash2 |= 0;
  }
  return hash.toString(36).padEnd(6) + hash2.toString(36).padEnd(6)
};

export const hashBinary = (bin: BinaryData) => {
  return Crypto.SHA256(bin);
};

export const hashString = (str: string) => {
  return fastHash(str);
};

export const getKVHashes = (obj: {
  key: string;
  value: {
    [key: string]: number | string | boolean | Array<number | string | boolean>;
  };
}): { keyHash: string; valueHash: string } => {
  const keyHash = fastHash(obj.key);
  const valueHash = fastHash(JSON.stringify(obj.value));
  return {
    keyHash,
    valueHash,
  };
};

export const getKVHash = (obj: { key: string; value: {[key: string]: number | string | boolean | Array<number | string | boolean>}|string }): string => {
  if (typeof obj.value == "string") {
    return fastHash(obj.key + obj.value);
  }
  return fastHash(obj.key + JSON.stringify(obj.value));
};

export const getRowHash = (obj: {
  key: string;
  value: {
    [key: string]: number | string | boolean | Array<number | string | boolean>;
  };
}): string => {
  return fastHash(obj.key + JSON.stringify(obj.value));
};

export const getDiffHash = (commitData: CommitData): string|null => {
  const diffString = JSON.stringify(commitData.diff);
  if (!commitData.userId) {
    return null;
  }
  if (!commitData.timestamp) {
    return null;
  }
  if (!commitData.message) {
    return null;
  }

  if (!commitData.parent && !commitData.historicalParent) {
    const str = `userId:${commitData.userId}/authorUserId:${
      commitData.authorUserId ?? commitData.userId
    }/timestamp:${commitData.timestamp}/message:${commitData.message}/idx:${
      commitData.idx
    }/mergeBase:${commitData?.mergeBase ?? "none"}/diff:${diffString}`;
    return Crypto.SHA256(str);
  }
  if (!commitData.parent) {
    const str = `userId:${commitData.userId}/authorUserId:${
      commitData.authorUserId ?? commitData.userId
    }/timestamp:${commitData.timestamp}/message:${
      commitData.message
    }/historicalParent:${commitData.historicalParent}/idx:${
      commitData.idx
    }/mergeBase:${commitData?.mergeBase ?? "none"}/diff:${diffString}`;
    return Crypto.SHA256(str);
  }
  if (!commitData.historicalParent) {
    const str = `userId:${commitData.userId}/authorUserId:${
      commitData.authorUserId ?? commitData.userId
    }/timestamp:${commitData.timestamp}/message:${commitData.message}/parent:${
      commitData.parent
    }/idx:${commitData.idx}/mergeBase:${
      commitData?.mergeBase ?? "none"
    }/diff:${diffString}`;
    return Crypto.SHA256(str);
  }
  const str = `userId:${commitData.userId}/authorUserId:${
    commitData.authorUserId ?? commitData.userId
  }/timestamp:${commitData.timestamp}/message:${commitData.message}/parent:${
    commitData.parent
  }/historicalParent:${commitData.historicalParent}/idx:${
    commitData.idx
  }/mergeBase:${commitData.mergeBase ?? "none"}/diff:${diffString}`;
  return Crypto.SHA256(str);
};

export const getLCS = (
  left: Array<string>,
  right: Array<string>
): Array<string> => {
  const diff = mdiff(left, right);
  const lcs = diff.getLcs();
  return lcs as Array<string>;
};

export const getDiff = (
  before: Array<DiffElement>,
  after: Array<DiffElement>
): Diff => {
  const past = before.map(getRowHash);
  const present = after.map(getRowHash);
  const longestSequence = getLCS(past, present);
  let removeIndex = 0;
  const diff = {
    add: {},
    remove: {},
  };
  for (let i = 0; i < past.length; ++i) {
    if (longestSequence[removeIndex] == past[i]) {
      removeIndex++;
    } else {
      diff.remove[i] = before[i];
    }
  }

  let addIndex = 0;
  for (let i = 0; i < present.length; ++i) {
    if (longestSequence[addIndex] == present[i]) {
      addIndex++;
    } else {
      diff.add[i] = after[i];
    }
  }
  return diff;
};

export const splitTextForDiff = (str: string): Array<string> => {
  let chars = str;
  const sentences = str.split(/[.!?。]/g).filter((v) => v != "");
  for (let i = 0; i < sentences.length; ++i) {
    sentences[i] =
      sentences[i] + (chars.substring?.(sentences[i].length)?.[0] ?? "");
    chars = chars.substring(sentences[i].length);
  }
  return sentences;
};

export const getArrayStringDiff = (past: Array<string>, present: Array<string>): StringDiff => {
  const longestSequence = getLCS(past, present);

  const diff = {
    add: {},
    remove: {},
  };

  for (let i = 0, removeIndex = 0; i < past.length; ++i) {
    if (longestSequence[removeIndex] == past[i]) {
      removeIndex++;
    } else {
      diff.remove[i] = past[i];
    }
  }

  for (let i = 0, addIndex = 0; i < present.length; ++i) {
    if (longestSequence[addIndex] == present[i]) {
      addIndex++;
    } else {
      diff.add[i] = present[i];
    }
  }
  return diff;
};

export const getTextDiff = (before: string, after: string): StringDiff => {
  const past = splitTextForDiff(before);
  const present = splitTextForDiff(after);
  return getArrayStringDiff(past, present);
};

export const applyDiff = <T extends DiffElement | string>(
  diffset: Diff | StringDiff,
  state: Array<T>
): Array<T> => {
  const assets: Array<T> = [...(state ?? [])];
  const addIndices = Object.keys(diffset.add).map((v) => parseInt(v));
  const removeIndices = Object.keys(diffset.remove).map((v) => parseInt(v));

  let offset = 0;
  for (const removeIndex of removeIndices) {
    const index = removeIndex - offset;
    assets.splice(index, 1);
    offset++;
  }

  for (const addIndex of addIndices) {
    const index = addIndex;
    assets.splice(index, 0, diffset.add[addIndex]);
  }
  return assets;
};

export const getMergeSequence = (
  origin: Array<string>,
  from: Array<string>,
  into: Array<string>,
  direction: "theirs" | "yours" = "yours"
): Array<string> => {
  if (from.length == 0 && into.length == 0) {
    return [];
  }
  const lcs = getGreatestCommonLCS(origin, from, into);
  if (lcs.length == 0) {
    return getMergeSubSequence(from, into, direction);
  }
  const originOffsets = getLCSBoundaryOffsets(origin, lcs);
  const originSequences = getLCSOffsetMergeSeqments(origin, originOffsets);
  const fromOffsets = getLCSBoundaryOffsets(from, lcs);
  const fromSequences = getLCSOffsetMergeSeqments(from, fromOffsets);
  const fromReconciledSequences = getReconciledSequence(
    originSequences,
    fromSequences
  );
  const intoOffsets = getLCSBoundaryOffsets(into, lcs);
  const intoSequences = getLCSOffsetMergeSeqments(into, intoOffsets);
  const intoReconciledSequences = getReconciledSequence(
    originSequences,
    intoSequences
  );

  const mergeSequences: Array<Array<string>> = [];
  let mergeIndex = 0;
  while (mergeIndex <= lcs.length) {
    if (
      sequencesAreEqual(
        fromReconciledSequences[mergeIndex],
        intoReconciledSequences[mergeIndex]
      )
    ) {
      mergeSequences.push(fromReconciledSequences[mergeIndex]);
    } else {
      mergeSequences.push(
        getMergeSubSequence(
          fromReconciledSequences[mergeIndex],
          intoReconciledSequences[mergeIndex],
          direction
        )
      );
    }
    if (mergeIndex != lcs.length) {
      mergeSequences.push([lcs[mergeIndex]]);
    }
    mergeIndex++;
  }
  const merge = mergeSequences.flatMap((v) => v);
  return merge;
};

export const canAutoMerge = (
  origin: Array<string>,
  from: Array<string>,
  into: Array<string>
): boolean => {
  if (from.length == 0 && into.length == 0) {
    return true;
  }
  const lcs = getGreatestCommonLCS(origin, from, into);
  if (lcs.length == 0) {
    return canAutoMergeSubSequence(from, into);
  }

  const originOffsets = getLCSBoundaryOffsets(origin, lcs);
  const originSequences = getLCSOffsetMergeSeqments(origin, originOffsets);
  const fromOffsets = getLCSBoundaryOffsets(from, lcs);
  const fromSequences = getLCSOffsetMergeSeqments(from, fromOffsets);
  const fromReconciledSequences = getReconciledSequence(
    originSequences,
    fromSequences
  );
  const intoOffsets = getLCSBoundaryOffsets(into, lcs);
  const intoSequences = getLCSOffsetMergeSeqments(into, intoOffsets);
  const intoReconciledSequences = getReconciledSequence(
    originSequences,
    intoSequences
  );
  let index = 0;
  if (lcs.length == 0) return false;
  while (index <= lcs.length) {
    if (
      fromReconciledSequences[index].length > 0 &&
      intoReconciledSequences[index].length > 0
    ) {
      if (
        !canAutoMergeSubSequence(
          fromReconciledSequences[index],
          intoReconciledSequences[index]
        )
      ) {
        return false;
      }
    }
    index++;
  }
  return true;
};

// yours prioritizes into (you) from (them)
const getMergeSubSequence = (
  from: Array<string>,
  into: Array<string>,
  direction: "theirs" | "yours" = "yours"
): Array<string> => {
  if (from.length == 0 && into.length == 0) {
    return [];
  }
  const lcs = getLCS(from, into);
  if (lcs.length == 0) {
    if (direction == "yours") {
      return [...from, ...into];
    } else {
      return [...into, ...from];
    }
  }

  const fromOffsets = getLCSBoundaryOffsets(from, lcs);
  const fromSequences = getLCSOffsetMergeSeqments(from, fromOffsets);

  const intoOffsets = getLCSBoundaryOffsets(into, lcs);
  const intoSequences = getLCSOffsetMergeSeqments(into, intoOffsets);

  const mergeSequences: Array<Array<string>> = [];
  let mergeIndex = 0;
  while (mergeIndex <= lcs.length) {
    if (direction == "yours") {
      mergeSequences.push(fromSequences[mergeIndex]);
      mergeSequences.push(intoSequences[mergeIndex]);
    } else {
      mergeSequences.push(intoSequences[mergeIndex]);
      mergeSequences.push(fromSequences[mergeIndex]);
    }
    if (mergeIndex != lcs.length) {
      mergeSequences.push([lcs[mergeIndex]]);
    }
    mergeIndex++;
  }
  const merge = mergeSequences.flatMap((v) => v);
  return merge;
};

const canAutoMergeSubSequence = (
  from: Array<string>,
  into: Array<string>
): boolean => {
  if (from.length == 0 && into.length == 0) {
    return true;
  }
  const lcs = getLCS(from, into);
  if (lcs.length == 0) {
    return false;
  }

  const fromOffsets = getLCSBoundaryOffsets(from, lcs);
  const fromSequences = getLCSOffsetMergeSeqments(from, fromOffsets);
  const intoOffsets = getLCSBoundaryOffsets(into, lcs);
  const intoSequences = getLCSOffsetMergeSeqments(into, intoOffsets);
  let index = 0;
  if (lcs.length == 0) return false;
  while (index <= lcs.length) {
    if (fromSequences[index].length > 0 && intoSequences[index].length > 0) {
      return false;
    }
    index++;
  }
  return true;
};

const getGreatestCommonLCS = (
  origin: Array<string>,
  from: Array<string>,
  into: Array<string>
) => {
  const fromLCS = getLCS(origin, from);
  const intoLCS = getLCS(origin, into);
  return getLCS(fromLCS, intoLCS);
};

const sequencesAreEqual = (a: Array<string>, b: Array<string>) => {
  if (a.length != b.length) {
    return false;
  }
  for (let i = 0; i < a.length; ++i) {
    if (a[i] != b[i]) return false;
  }
  return true;
};

/**
 * This is a kind of unintuitive function since it assumes
 * the inputs were derived in a certain way
 * Consider the following
 *
 * EXAMPLE 1 (NO CONFLICT)
 *
 * MAIN BRANCH:    (commit: A, value: [D, E, N, F]) ---> (commit: B, value: [D, T, E, N, P, F])
 *                                                 \
 * FEATURE BRANCH:                                   ---> (commit: X, value: [DF])
 *
 * TO MERGE B into X, we have to find the greatest longest common subsequence (GLCS) amonst all 3 commits
 * which is
 * GLCS: [D,F]
 *
 * SINCE the GLCS is [D, F], we know the merge segments for each commit are
 * A: {[], [E, N], []}
 * B: {[], [T, E, N, P], []}
 * C: {[], [], []}
 *
 * Any sequences that are the same between the origin and sequence, must have been removed by the counter
 * commit of the merge. Therefore we erase the sequence if the sequences are equal.
 *
 * B IS reconciled to the following: {[], [T, P], []}
 * C IS reconciled to the following: {[], [], []}
 *
 * SINCE [E, N] are present in commit B but not commit C, we know C had to have deleted E and N,
 * therefore we can safely splice out [E, N] from [T, E, N, P] in the merge by taking the LCS
 * of the origin against the respective sequence and finding the offsets. we then ignore the offsets
 * which effectively removes the values deleted by the merge-INTO (C) commit.
 *
 * To further clarify consider a case with merge conflicts
 * ______________________________________________________________________________________________________
 *
 *  EXAMPLE 2 (CONFLICT)
 *
 * MAIN BRANCH:    (commit: A, value: [D, E, N, F]) ---> (commit: B, value: [D, T, E, N, P, F])
 *                                                 \
 * FEATURE BRANCH:                                   ---> (commit: X, value: [DXF])
 *
 * TO MERGE B into X, we have to find the greatest longest common subsequence (GLCS) amonst all 3 commits
 * which is
 * GLCS: [D,F]
 *
 * SINCE the GLCS is [D, F], we know the merge segments for each commit are
 * A: {[], [E, N], []}
 * B: {[], [T, E, N, P], []}
 * C: {[], [X], []}
 *
 * B IS reconciled to the following: {[], [T, P], []} (when yours, not theirs, otherwise {[], [P, T], []})
 * C IS reconciled to the following: {[], [X], []}
 *
 * Because B and C both have uncommon values at IDX (1), this results in merge coflict where both values are concatenated
 * to [T, P, X], (if yours)
 */

const getReconciledSequence = (
  originSequences: Array<Array<string>>,
  sequences: Array<Array<string>>
): Array<Array<string>> => {
  const out: Array<Array<string>> = [];
  for (let i = 0; i < sequences.length; ++i) {
    if (sequencesAreEqual(originSequences[i], sequences[i])) {
      out.push([]);
    } else {
      const subLCS = getLCS(originSequences[i], sequences[i]);
      const offsets = getLCSBoundaryOffsets(sequences[i], subLCS);
      let offsetIndex = 0;
      const next: Array<string> = [];
      for (let j = 0; j < sequences[i].length; ++j) {
        if (j != offsets[offsetIndex]) {
          next.push(sequences[i][j]);
        } else {
          offsetIndex++;
        }
      }
      out.push(next);
    }
  }
  return out;
};

/***
 * Considering following:
 * idx        0 1 2 3 4 5 6 7
 * sequence = A F C Z Z C Z Z
 * lcs =      A C Z Z
 *
 * we get the matching graph
 * where 1 denotes a match and 0 is a mismatch
 *
 *       0 1 2 3 4 5 6 7
 *       | | | | | | | |
 *       A F C Z Z C Z Z
 *  0-A  1 0 0 0 0 0 0 0
 *  1-C  0 0 1 0 0 1 0 0
 *  2-Z  0 0 0 1 1 0 1 1
 *  3-Z  0 0 0 1 1 0 1 1
 *
 * by tracing the longest diagonal sequence of 1's
 * from the lower right to upper left, we can get
 * the max consecutive subsequences length for each sequence character
 *
 *       0 1 2 3 4 5 6 7
 *       | | | | | | | |
 *       A F C Z Z C Z Z
 *  0-A  1 0 0 0 0 0 0 0
 *  1-C  0 0 3 0 0 3 0 0
 *  2-Z  0 0 0 2 1 0 2 1
 *  3-Z  0 0 0 1 1 0 1 1
 *
 * finally we get the LCS boundary index by looking first for the
 * maximum value on each row, then selecting the rightmost value
 * for example. Row 0: the max value is 1 and it's rightmost location is index 0
 *
 *  IDX  0 1 2 3 4 5 6 7
 *  ROW  | | | | | | | |
 *       A F C Z Z C Z Z
 *  0-A  1 0 0 0 0 0 0 0 -> MAX: 1, RIGHTMOST IDX of (1): 0
 *  1-C  0 0 3 0 0 3 0 0 -> MAX: 3, RIGHTMOST IDX of (3): 5
 *  2-Z  0 0 0 2 1 0 2 1 -> MAX: 2, RIGHTMOST IDX of (2): 6
 *  3-Z  0 0 0 1 1 0 1 1 -> MAX: 1, RIGHTMOST IDX of (1): 7
 *
 * The LCS Boundary Offsets are therefore [0, 5, 6, 7]
 * Which corresponds with                 [A, C, Z, Z]
 *
 * DP BFS here is way faster and more intuitive than recursive approach
 * O(M*N*min(M, N))
 */
const getLCSBoundaryOffsets = (
  sequence: Array<string>,
  lcs: Array<string>
): Array<number> => {
  const graph: Array<Array<number>> = [];
  for (let i = 0; i < lcs.length; ++i) {
    graph.push([]);
    for (let j = 0; j < sequence.length; ++j) {
      if (lcs[i] == sequence[j]) {
        graph[i].push(1);
        let backtrace = 0;
        while (
          i - backtrace > 0 &&
          j - backtrace > 0 &&
          graph[i - backtrace - 1][j - backtrace - 1] > 0
        ) {
          graph[i - backtrace - 1][j - backtrace - 1]++;
          backtrace++;
        }
      } else {
        graph[i].push(0);
      }
    }
  }
  const out: Array<number> = [];
  for (let i = 0; i < graph.length; ++i) {
    const max = Math.max(...graph[i]);
    for (let j = sequence.length - 1; j >= 0; --j) {
      if (graph[i][j] == max) {
        out.push(j);
        break;
      }
    }
  }
  return out;
};

/***
 * Considering following:
 * idx        0 1 2 3 4 5 6 7
 * sequence = A F C Z Z C Z Z
 * lcs =      A C Z Z
 * offsets = [0, 5, 6, 7] (see above)
 *  getLCSOffsetMergeSeqments produces following merge segments from offsets
 *
 * sequence:   A     F   C   Z   Z     C      Z      Z
 *             |     |   |   |   |     |      |      |
 * indices:    0     1   2   3   4     5      6      7
 *             |     |   |   |   |     |      |      |
 * offsets:    0     |   |   |   |     5      6      7
 *             |     |   |   |   |     |      |      |
 *             |     F   C   Z   Z     |      |      |
 *             A     *   *   *   *     C      Z      Z
 * segs:  { [] -   [ F,  C , Z , Z ]   -  []  -  []  -  [] }
 *
 * output is following,
 * [[], [ F,  C , Z , Z ], [], [], []]
 */
const getLCSOffsetMergeSeqments = (
  sequence: Array<string>,
  offsets: Array<number>
): Array<Array<string>> => {
  const out: Array<Array<string>> = [];
  if (offsets.length == 0) return out;
  out.push(sequence.slice(0, offsets[0]));
  for (let i = 0; i < offsets.length; ++i) {
    if (i == offsets.length - 1) {
      out.push(sequence.slice(offsets[i] + 1));
    } else {
      out.push(sequence.slice(offsets[i] + 1, offsets[i + 1]));
    }
  }
  return out;
};
