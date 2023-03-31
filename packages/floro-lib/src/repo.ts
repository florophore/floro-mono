import { Manifest } from "./plugins";
import { Diff, StringDiff } from "./versioncontrol";

export interface RepoState {
  branch: string | null;
  commit: string | null;
  isInMergeConflict: boolean;
  merge: null | {
    fromSha: string;
    intoSha: string;
    originSha: string;
    direction: "yours" | "theirs";
  };
  commandMode: "view" | "edit" | "compare";
  comparison: null | {
    against: "last"|"branch"|"sha"|"merge";
    branch: string | null;
    commit: string | null;
  };
}

export interface RepoSetting {
  mainBranch: string;
}

export interface RawStore {
  [name: string]: Array<{ key: string; value: string }>;
}

export interface ApplicationKVState {
  description: Array<string>;
  licenses: Array<{ key: string; value: string }>;
  plugins: Array<{ key: string; value: string }>;
  store: RawStore;
  binaries: Array<string>;
}

export interface RenderedApplicationState {
  description: Array<string>;
  licenses: Array<{ key: string; value: string }>;
  plugins: Array<{ key: string; value: string }>;
  store: { [key: string]: object };
  binaries: Array<string>;
}

export interface TokenizedState {
  description: Array<string>;
  licenses: Array<string>;
  plugins: Array<string>;
  store: { [key: string]: Array<string> };
  binaries: Array<string>;
}

export interface StoreStateDiff {
  [pluginName: string]: Diff;
}

export interface StateDiff {
  plugins: Diff;
  binaries: StringDiff;
  store: StoreStateDiff;
  licenses: Diff;
  description: StringDiff;
}

export interface Branch {
  id: string;
  name: string;
  lastCommit: null | string;
  baseBranchId: null | string;
  createdBy: string;
  createdAt: string;
}

export interface BranchMeta {
  branchId: string;
  lastLocalCommit: string | null;
  lastRemoteCommit: string | null;
}

export interface BranchesMetaState {
  userBranches: Array<BranchMeta>;
  allBranches: Array<BranchMeta>;
}

export interface CommitHistory {
  sha: null | string;
  parent: null | string;
  historicalParent: null | string;
  mergeBase: null | string;
  idx: number;
  message: string;
}

export interface CheckpointMap {
  [sha: string]: ApplicationKVState;
}

export interface ApiDiff {
  description: {
    added: Array<number>;
    removed: Array<number>;
  };
  licenses: {
    added: Array<number>;
    removed: Array<number>;
  };
  plugins: {
    added: Array<number>;
    removed: Array<number>;
  };
  store: {
    [key: string]: {
      added: Array<string>;
      removed: Array<string>;
    }
  };
}

export interface ApiStoreInvalidity {
  [key: string]: Array<string>;
}

export interface ApiReponse {
  repoState: RepoState;
  applicationState: RenderedApplicationState;
  schemaMap: {[key: string]: Manifest};
  beforeState?: RenderedApplicationState;
  apiDiff?: ApiDiff;
  apiStoreInvalidity?: ApiStoreInvalidity;
}

export const EMPTY_COMMIT_STATE: ApplicationKVState = {
  description: [],
  licenses: [],
  plugins: [],
  store: {},
  binaries: [],
};

export const EMPTY_RENDERED_APPLICATION_STATE: RenderedApplicationState = {
  description: [],
  licenses: [],
  plugins: [],
  store: {},
  binaries: [],
};

export const EMPTY_COMMIT_DIFF: StateDiff = {
  description: { add: {}, remove: {} },
  licenses: { add: {}, remove: {} },
  plugins: { add: {}, remove: {} },
  store: {},
  binaries: { add: {}, remove: {} },
};
