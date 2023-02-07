import { Diff, TextDiff } from "./versioncontrol";

export interface RawStore {
  [name: string]: Array<{ key: string; value: string }>;
}

export interface CommitState {
  description: Array<string>;
  licenses: Array<{ key: string; value: string }>;
  plugins: Array<{ key: string; value: string }>;
  store: RawStore;
  binaries: Array<{ key: string; value: string }>;
}

export interface StoreStateDiff {
  [pluginName: string]: Diff;
}

export interface StateDiff {
  plugins: Diff;
  binaries: Diff;
  store: StoreStateDiff;
  licenses: Diff;
  description: TextDiff;
}

export interface State {
  diff: StateDiff;
  branch: string | null;
  commit: string | null;
}

export interface Branch {
  name: string,
  firstCommit: null | string;
  lastCommit: null | string;
  createdBy: string;
  createdAt: string;
}

export interface CommitHistory {
  sha: null|string;
  message: string;
} 

const EMPTY_COMMIT_STATE: CommitState = {
  description: [],
  licenses: [],
  plugins: [],
  store: {},
  binaries: [],
};

const EMPTY_COMMIT_DIFF: StateDiff = {
  description: { add: {}, remove: {} },
  licenses: { add: {}, remove: {} },
  plugins: { add: {}, remove: {} },
  store: {},
  binaries: { add: {}, remove: {} },
};

const EMPTY_COMMIT_DIFF_STRING = JSON.stringify(EMPTY_COMMIT_DIFF);

