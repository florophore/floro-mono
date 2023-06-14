export const manifestListToSchemaMap = (
  manifestList: Array<Manifest>
): { [pluginName: string]: Manifest } => {
  return manifestList.reduce((acc, manifest) => {
    return {
      ...acc,
      [manifest.name]: manifest,
    };
  }, {});
};
export const getPluginManifests = async (
  datasource: DataSource,
  pluginList: Array<PluginElement>,
  disableDownloads = false
): Promise<Array<Manifest>> => {
  const manifests = await Promise.all(
    pluginList?.map?.(({ key: pluginName, value: pluginVersion }) => {
      return datasource?.getPluginManifest?.(pluginName, pluginVersion, disableDownloads);
    }) ?? []
  );
  return manifests?.filter((manifest?: Manifest | null) => {
    if (manifest == null) {
      return false;
    }
    return true;
  }) as Array<Manifest>;
};


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
  username: string;
  authorUserId?: string;
  authorUsername?: string;
  timestamp: string;
  parent: string | null;
  historicalParent: string | null;
  mergeBase?: string | null;
  mergeRevertSha?: string | null;
  revertFromSha?: string | null;
  revertToSha?: string | null;
  idx: number;
  message: string;
}

export interface SourceCommitNode extends CommitHistory {
    children?: Array<SourceCommitNode>;
    message: string;
    userId: string;
    authorUserId: string;
    timestamp: string;
    isBranchHead?: boolean;
    isInBranchLineage?: boolean;
    isInUserBranchLineage?: boolean;
    isCurrent?: boolean;
    isUserBranch?: boolean;
    branchIds?: Array<string>;
}
export interface PluginElement {
  key: string;
  value: string;
}

export interface ManifestNode {
  type: string;
  isKey?: boolean;
  values?: string | TypeStruct;
  ref?: string;
  refKeyType?: string;
  refType?: string;
  nullable?: boolean;
  emptyable?: boolean;
  bounded?: boolean;
  manualOrdering?: boolean;
  onDelete?: "delete" | "nullify";
  default?: unknown|Array<unknown>;
}

export interface TypeStruct {
  [key: string]: ManifestNode | TypeStruct;
}

export interface Manifest {
  version: string;
  name: string;
  displayName: string;
  description?: string;
  codeDocsUrl?: string;
  codeRepoUrl?: string;
  managedCopy?: boolean;
  icon:
    | string
    | {
        light: string;
        dark: string;
        selected?:
          | string
          | {
              dark?: string;
              light?: string;
            };
      };
  imports: {
    [name: string]: string;
  };
  types: TypeStruct;
  store: TypeStruct;
  seed?: unknown;
}

export interface CopyInstructions {
  [pluginName: string]: {
    isManualCopy: boolean;
    manualCopyList: Array<string>;
    copyPriority: "yours"|"theirs"; // if not manual copy, this should be set by user, otherwise theirs
    referencePriority: "yours"|"theirs"; // this should always be set by user
  }
};

export interface FetchInfo {
  canPushBranch: boolean;
  canPull: boolean;
  userHasPermissionToPush: boolean;
  branchPushDisabled: boolean;
  hasConflict: boolean;
  accountInGoodStanding: boolean;
  nothingToPush: boolean;
  nothingToPull: boolean;
  containsDevPlugins: boolean;
  baseBranchRequiresPush: boolean;
  remoteBranch?: Branch;
  pullCanMergeWip: boolean;
  fetchFailed: boolean;
  commits: Array<CommitExchange>;
  branches: Array<Branch>;
}

export interface BranchRuleSettings {
  branchId: string;
  branchName: string;
  directPushingDisabled: boolean;
  requiresApprovalToMerge: boolean;
  automaticallyDeletesMergedFeatureBranches: boolean;
  canCreateMergeRequests: boolean;
  canMergeWithApproval: boolean;
  canMergeMergeRequests: boolean;
  canApproveMergeRequests: boolean;
  canRevert: boolean;
  canAutofix: boolean;
}

export interface RemoteSettings {
  defaultBranchId: string;
  canPushBranches: boolean;
  canDeleteBranches: boolean;
  canChangeSettings: boolean;
  accountInGoodStanding: boolean;
  branchRules: Array<BranchRuleSettings>;
}

export interface CommitExchange {
  sha: string;
  idx: number;
  parent: string;
  saved?: boolean;
}

export interface CloneFile {
  state: "in_progress" | "done" | "paused";
  downloadedCommits: number;
  totalCommits: number;
  lastCommitIndex: number | null;
  branches: Array<Branch>;
  commits: Array<CommitExchange>;
  settings: RemoteSettings;
}

export interface Comparison {
  against: "wip" | "branch" | "sha" | "merge";
  comparisonDirection: "forward" | "backward";
  branch: string | null;
  commit: string | null;
}

export interface RepoState {
  branch: string | null;
  commit: string | null;
  isInMergeConflict: boolean;
  merge: null | {
    fromSha: string;
    intoSha: string;
    originSha: string;
    direction: "yours" | "theirs";
    conflictList: ConflictList;
    mergeState: ApplicationKVState;
  };
  commandMode: "view" | "edit" | "compare";
  comparison: null | Comparison;
}

export interface RepoSetting {
  mainBranch: string;
}

export interface RawStore {
  [name: string]: Array<{
    key: string;
    value: {
      key: string;
      value:
        | {
            [key: string]:
              | number
              | string
              | boolean
              | Array<number | string | boolean>;
          }
        | string;
    };
  }>;
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
  createdByUsername: string;
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
  revertFromSha: null | string;
  revertToSha: null | string;
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
    };
  };
}

export interface ApiStoreInvalidity {
  [key: string]: Array<string>;
}

export interface ConflictList {
  description: Array<number>;
  licenses: Array<number>;
  plugins: Array<number>;
  store: {
    [key: string]: Array<{
      key: string;
      index: number;
    }>;
  };
}

export interface ApiResponse {
  repoState: RepoState;
  applicationState: RenderedApplicationState;
  schemaMap: { [key: string]: Manifest };
  beforeState?: RenderedApplicationState;
  beforeApiStoreInvalidity?: ApiStoreInvalidity;
  beforeManifests?: Array<Manifest>;
  beforeSchemaMap?: { [pluginName: string]: Manifest };
  apiDiff?: ApiDiff;
  apiStoreInvalidity?: ApiStoreInvalidity;
  isWIP?: boolean;
  branch?: Branch;
  baseBranch?: Branch;
  lastCommit?: CommitData;
  mergeCommit?: CommitData;
  canPopStashedChanges?: boolean;
  stashSize?: number;
  conflictResolution?: ConflictList;
  checkedOutBranchIds: Array<string>;
}

export interface SourceGraphResponse {
  commits: Array<SourceCommitNode>;
  branches: Array<Branch>;
  branchesMetaState: BranchesMetaState;
  repoState?: RepoState;
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

export interface DataSource {
  /* PLUGINS */
  getPluginManifest?: (
    pluginName: string,
    pluginVersion: string,
    disableDownloads?: boolean
  ) => Promise<Manifest>;
  pluginManifestExists?: (
    pluginName: string,
    pluginVersion: string
  ) => Promise<boolean>;
  /* REPOS */
  readRepos?(): Promise<Array<string>>;
  repoExists?(repoId?: string): Promise<boolean>;
  readRepoSettings?: (repoId: string) => Promise<RepoSetting>;
  readCurrentRepoState?: (repoId: string) => Promise<RepoState>;
  saveCurrentRepoState?: (
    repoId: string,
    state: RepoState
  ) => Promise<RepoState>;

  readCommitHistory?: (repoId: string, sha: string) => Promise<Array<CommitHistory>>;

  readBranch?: (repoId: string, branchId: string) => Promise<Branch>;
  readBranches?: (repoId: string) => Promise<Array<Branch>>;
  deleteBranch?: (repoId: string, branchId: string) => Promise<boolean>;
  saveBranch?: (
    repoId: string,
    branchId: string,
    branchData: Branch
  ) => Promise<Branch>;

  saveCommit?: (
    repoId: string,
    sha: string,
    commitData: CommitData
  ) => Promise<CommitData>;
  commitExists?: (repoId: string, sha: string) => Promise<boolean>;
  readCommit?: (repoId: string, sha: string) => Promise<CommitData>;
  readCheckpoint?(repoId: string, sha: string): Promise<ApplicationKVState|null>;
  readCommitApplicationState?(repoId: string, sha: string): Promise<ApplicationKVState>;

  readCommits?: (repoId: string) => Promise<Array<SourceCommitNode>>;

  saveCheckpoint?(
    repoId: string,
    sha: string,
    commitState: ApplicationKVState
  ): Promise<ApplicationKVState|null>;

  readHotCheckpoint?(repoId: string): Promise<[string, ApplicationKVState]|null>;

  saveHotCheckpoint?(
    repoId: string,
    sha: string,
    commitState: ApplicationKVState
  ): Promise<[string, ApplicationKVState]|null>;

  deleteHotCheckpoint?(repoId: string): Promise<boolean>;

  readRenderedState?(repoId: string): Promise<RenderedApplicationState>;

  saveRenderedState?(
    repoId: string,
    commitState: RenderedApplicationState
  ): Promise<RenderedApplicationState>;

  readStash?(
    repoId: string,
    repoState: RepoState
  ): Promise<Array<ApplicationKVState>>;

  saveStash?(
    repoId: string,
    repoState: RepoState,
    stashState: Array<ApplicationKVState>
  ): Promise<Array<ApplicationKVState>>;

  readBranchesMetaState?(repoId: string): Promise<BranchesMetaState>;

  saveBranchesMetaState?(
    repoId: string,
    branchesMetaState: BranchesMetaState
  ): Promise<BranchesMetaState>;

  checkBinary?(binaryId: string): Promise<boolean>;
  writeBinary?(
    binaryId: string,
    content:
      | string
      | NodeJS.ArrayBufferView
      | Iterable<string | NodeJS.ArrayBufferView>
      | AsyncIterable<string | NodeJS.ArrayBufferView>
  ): Promise<boolean>;

  checkCloneFile?: (repoId: string) => Promise<boolean>;
  readCloneFile?: (repoId: string) => Promise<CloneFile>;
  saveCloneFile?: (repoId: string, cloneFile: CloneFile) => Promise<CloneFile>;
  deleteCloneFile?: (repoId: string) => Promise<boolean>;


  saveRemoteSettings?: (repoId: string, settings: RemoteSettings) => Promise<RemoteSettings>;
  readRemoteSettings?: (repoId: string) => Promise<RemoteSettings>;

  saveLocalSettings?: (repoId: string, settings: RemoteSettings) => Promise<RemoteSettings>;
  readLocalSettings?: (repoId: string) => Promise<RemoteSettings>;
}

export const getUpstreamDepsInSchemaMap = (
  schemaMap: { [key: string]: Manifest },
  pluginName: string
): Array<string> => {
  const current = schemaMap[pluginName];
  if (Object.keys(current?.imports ?? {}).length == 0) {
    return [];
  }
  const deps = Object.keys(current.imports);
  for (const dep of deps) {
    const upstreamDeps = getUpstreamDepsInSchemaMap(schemaMap, dep);
    deps.push(...upstreamDeps);
  }
  return deps;
};

export const topSortManifests = (manifests: Array<Manifest>) => {
  const lexicallySortedManifests = manifests.sort((a, b) => {
    if (a.name == b.name) return 0;
    return a.name > b.name ? 1 : -1;
  });
  const visited = new Set();
  const manifestMap = manifestListToSchemaMap(lexicallySortedManifests);
  const out: Array<Manifest> = [];
  for (const manifest of lexicallySortedManifests) {
    if (visited.has(manifest.name)) {
      continue;
    }
    const upstreamDeps = getUpstreamDepsInSchemaMap(
      manifestMap,
      manifest.name
    ).map((pluginName) => manifestMap[pluginName]);
    const depsToAdd = topSortManifests(upstreamDeps);
    for (const upstreamDep of depsToAdd) {
      if (!visited.has(upstreamDep.name)) {
        visited.add(upstreamDep.name);
        out.push(upstreamDep);
      }
    }
    visited.add(manifest.name);
    out.push(manifest);
  }
  return out;
};

const primitives = new Set(["int", "float", "boolean", "string", "file"]);

export const decodeSchemaPath = (
  pathString: string
): Array<DiffElement | string> => {
  return splitPath(pathString).map((part) => {
    if (/^(.+)<(.+)>$/.test(part) && getCounterArrowBalanance(part) == 0) {
      const { key, value } = extractKeyValueFromRefString(part);
      return {
        key,
        value,
      };
    }
    return part;
  });
};

const getCounterArrowBalanance = (str: string): number => {
  let counter = 0;
  for (let i = 0; i < str.length; ++i) {
    if (str[i] == "<") counter++;
    if (str[i] == ">") counter--;
  }
  return counter;
};

const extractKeyValueFromRefString = (
  str: string
): { key: string; value: string } => {
  let key = "";
  let i = 0;
  while (str[i] != "<") {
    key += str[i++];
  }
  let value = "";
  let counter = 1;
  i++;
  while (i < str.length) {
    if (str[i] == "<") counter++;
    if (str[i] == ">") counter--;
    if (counter >= 1) {
      value += str[i];
    }
    i++;
  }
  return {
    key,
    value,
  };
};



const splitPath = (str: string): Array<string> => {
  const out: Array<string> = [];
  let arrowBalance = 0;
  let curr = "";
  for (let i = 0; i <= str.length; ++i) {
    if (i == str.length) {
      out.push(curr);
      continue;
    }
    if (arrowBalance == 0 && str[i] == ".") {
      out.push(curr);
      curr = "";
      continue;
    }
    if (str[i] == "<") {
      arrowBalance++;
    }
    if (str[i] == ">") {
      arrowBalance--;
    }
    curr += str[i];
  }
  return out;
};

export const writePathString = (
  pathParts: Array<DiffElement | string>
): string => {
  return pathParts
    .map((part) => {
      if (typeof part == "string") {
        return part;
      }
      return `${part.key}<${part.value}>`;
    })
    .join(".");
};
export const writePathStringWithArrays = (
  pathParts: Array<DiffElement | string | number>
): string => {
  return pathParts
    .map((part) => {
      if (typeof part == "string") {
        return part;
      }
      if (typeof part == "number") {
        return `[${part}]`;
      }
      return `${part.key}<${part.value}>`;
    })
    .join(".");
};

export const reIndexSchemaArrays = (kvs: Array<DiffElement>): Array<string> => {
  const out: Array<string> = [];
  const listStack: Array<string> = [];
  let indexStack: Array<number> = [];
  for (const { key } of kvs) {
    const decodedPath = decodeSchemaPath(key);
    const lastPart = decodedPath[decodedPath.length - 1];
    if (typeof lastPart == "object" && lastPart.key == "(id)") {
      const parentPath = decodedPath.slice(0, -1);
      const parentPathString = writePathString(parentPath);
      const peek = listStack?.[listStack.length - 1];
      if (peek != parentPathString) {
        if (!peek || key.startsWith(peek)) {
          listStack.push(parentPathString);
          indexStack.push(0);
        } else {
          while (
            listStack.length > 0 &&
            !key.startsWith(listStack[listStack.length - 1])
          ) {
            listStack.pop();
            indexStack.pop();
          }
          indexStack[indexStack.length - 1]++;
        }
      } else {
        const currIndex = indexStack.pop() ?? 0;
        indexStack.push(currIndex + 1);
      }
      let pathIdx = 0;
      const pathWithNumbers = decodedPath.map((part) => {
        if (typeof part == "object" && part.key == "(id)") {
          return indexStack[pathIdx++];
        }
        return part;
      });
      const arrayPath = writePathStringWithArrays(pathWithNumbers);
      out.push(arrayPath);
    } else {
      out.push(key);
    }
  }
  return out;
};

const getSchemaAtPath = (
  rootSchema: Manifest | TypeStruct,
  path: string
): object | null => {
  try {
    const [, ...decodedPath] = decodeSchemaPath(path);
    let currentSchema = rootSchema;
    for (const part of decodedPath) {
      if (typeof part == "string" && currentSchema?.[part]?.type == "set") {
        currentSchema = currentSchema[part].values;
        continue;
      }
      if (typeof part == "string" && currentSchema?.[part]?.type == "array") {
        currentSchema = currentSchema[part].values;
        continue;
      }
      if (typeof part == "string") {
        currentSchema = currentSchema[part];
        continue;
      }
    }
    return currentSchema;
  } catch (e) {
    return null;
  }
};

export const getInvalidRootStates = async (
  datasource: DataSource,
  schemaMap: { [key: string]: Manifest },
  kvs: Array<DiffElement>,
  pluginName: string
) => {
  const out: Array<string> = [];
  const rootSchemaMap = (await getRootSchemaMap(datasource, schemaMap)) ?? {};
  const { key, value } = kvs?.[0] ?? {};
  if (!key) {
    return out;
  }
  const subSchema = getSchemaAtPath(rootSchemaMap[pluginName], key);

  for (const prop in subSchema) {
    if (subSchema[prop]?.type == "array" || subSchema[prop]?.type == "set") {
      if (subSchema[prop]?.emptyable === false) {
        let containsList = false;
        for (let j  = 1; j < kvs.length; ++j) {
          const { key: nextKey } = kvs[j];
          if (nextKey.startsWith(key + "." + prop)) {
            containsList = true;
            break;
          }
          if (!nextKey.startsWith(key)) {
            break;
          }
        }
        if (!containsList) {
          out.push(key + "." + prop);
        }
      }
      continue;
    }
    if (
      subSchema[prop]?.type &&
      (!subSchema[prop]?.nullable || subSchema[prop]?.isKey) &&
      (value[prop] == null ||
        ((subSchema[prop]?.type == "string" ||
          subSchema[prop]?.type == "file") &&
          value[prop] == ""))
    ) {
      out.push(key + "." + prop);
      continue;
    }

    if (subSchema[prop]?.type == "file") {
      const exists = await datasource.checkBinary?.(value[prop]);
      if (!exists) {
        out.push(key + "." + prop);
        continue;
      }
    }
  }
  return out;
}

export const getRootSchemaMap = async (
  datasource: DataSource,
  schemaMap: {
    [key: string]: Manifest;
  },
  disableDownloads = false
): Promise<{ [key: string]: TypeStruct } | null> => {
  // need to top sort
  const rootSchemaMap = {};
  for (const pluginName in schemaMap) {
    const manifest = schemaMap[pluginName];
    const upsteamDeps = await getUpstreamDependencyManifests(
      datasource,
      manifest,
      disableDownloads
    );
    const subSchemaMap = manifestListToSchemaMap(upsteamDeps as Manifest[]);
    rootSchemaMap[pluginName] = getRootSchemaForPlugin(
      subSchemaMap,
      pluginName
    );
  }
  return traverseSchemaMapForRefKeyTypes(rootSchemaMap, rootSchemaMap);
};

export const hasPluginManifest = (
  manifest: Manifest,
  manifests: Array<Manifest>
): boolean => {
  for (const { name, version } of manifests) {
    if (name === manifest.name && version === manifest.version) {
      return true;
    }
  }
  return false;
};

export const getUpstreamDependencyManifests = async (
  datasource: DataSource,
  manifest: Manifest,
  disableDownloads = false,
  memo: { [key: string]: Array<Manifest> } = {},
): Promise<Array<Manifest> | null> => {
  if (memo[manifest.name + "-" + manifest.version]) {
    return memo[manifest.name + "-" + manifest.version];
  }

  const deps: Array<Manifest> = [manifest];
  for (const dependentPluginName in manifest.imports) {
    const dependentManifest = await datasource?.getPluginManifest?.(
      dependentPluginName,
      manifest.imports[dependentPluginName],
      disableDownloads
    );
    if (!dependentManifest) {
      return null;
    }
    const subDeps = await getUpstreamDependencyManifests(
      datasource,
      dependentManifest,
      disableDownloads,
      memo
    );
    if (subDeps == null) {
      return null;
    }
    for (const dep of subDeps) {
      if (!hasPluginManifest(dep, deps)) {
        deps.push(dep);
      }
    }
  }
  memo[manifest.name + "-" + manifest.version] = deps;
  return deps;
};

const getKeyType = (
  keyPath: string,
  rootSchemaMap: { [key: string]: TypeStruct }
): string | null => {
  const [pluginWrapper, ...path] = splitPath(keyPath);
  let current: null | TypeStruct | ManifestNode = null;
  const typeGroup = /^\$\((.+)\)$/.exec(pluginWrapper as string)?.[1] ?? null;
  if (typeGroup && rootSchemaMap[typeGroup]) {
    current = rootSchemaMap[typeGroup];
  }
  if (current != null) {
    for (const part of path) {
      if (current && current[part]) {
        current = current[part];
      }
    }
    if (typeof current == "object") {
      for (const prop in current) {
        if (current[prop]?.isKey) {
          if (
            typeof current[prop].type == "string" &&
            (primitives.has(current[prop].type) || current[prop].type == "ref")
          ) {
            return current[prop].type;
          } else {
            return null;
          }
        }
      }
    }
  }
  return null;
};

const traverseSchemaMapForRefKeyTypes = (
  schemaMap: { [key: string]: TypeStruct | ManifestNode },
  rootSchemaMap: { [key: string]: TypeStruct }
): { [key: string]: TypeStruct } => {
  const out = {};
  for (const prop in schemaMap) {
    if (
      (schemaMap?.[prop] as ManifestNode)?.type == "ref" &&
      schemaMap?.[prop]?.refKeyType == "<?>"
    ) {
      const next = { ...schemaMap[prop] };
      const refKeyType = getKeyType(
        schemaMap?.[prop]?.refType as string,
        rootSchemaMap
      );
      if (refKeyType) {
        next.refKeyType = refKeyType;
      }
      out[prop] = next;
      continue;
    }
    if (typeof schemaMap[prop] == "object" && !Array.isArray(schemaMap[prop])) {
      const next = traverseSchemaMapForRefKeyTypes(
        schemaMap[prop] as TypeStruct,
        rootSchemaMap
      );
      out[prop] = next;
      continue;
    }
    out[prop] = schemaMap[prop];
  }
  return out;
};

export const getExpandedTypesForPlugin = (
  schemaMap: { [key: string]: Manifest },
  pluginName: string
): TypeStruct => {
  const upstreamDeps = getUpstreamDepsInSchemaMap(schemaMap, pluginName);
  const schemaWithTypes = [...upstreamDeps, pluginName].reduce(
    (acc, pluginName) => {
      return {
        ...acc,
        ...drawSchemaTypesFromImports(schemaMap, pluginName, acc),
      };
    },
    {}
  );
  return Object.keys(schemaWithTypes).reduce((acc, type) => {
    return {
      ...acc,
      [type]: iterateSchemaTypes(acc[type], type, schemaWithTypes),
    };
  }, schemaWithTypes);
};

const iterateSchemaTypes = (
  types: Manifest["types"],
  pluginName: string,
  importedTypes = {}
): object => {
  const out = {};
  for (const prop in types) {
    out[prop] = {};
    if (types[prop]?.type === "set" || types[prop]?.type === "array") {
      out[prop].type = types[prop]?.type;
      out[prop].emptyable = types[prop]?.emptyable === undefined ? true : types[prop].emptyable;
      if (types[prop].hasOwnProperty("default")) {
        out[prop].default = types[prop]?.default;
      }
      if (
        typeof types[prop].values == "string" &&
        primitives.has(types[prop].values as string)
      ) {
        out[prop].values = types[prop].values;
        continue;
      }
      if (
        typeof types[prop].values == "string" &&
        (types[prop].values as string).split(".").length == 1
      ) {
        out[prop].values = `${pluginName}.${types[prop].values}`;
        if (types[prop]?.type === "set") {
          out[prop].bounded = types[prop]?.bounded ?? false;
          out[prop].manualOrdering = types[prop]?.manualOrdering ?? false;
        }
        continue;
      }
      if (
        typeof types[prop].values == "string" &&
        typeof importedTypes[types[prop].values as string] == "object"
      ) {
        out[prop].values = iterateSchemaTypes(
          importedTypes[types[prop].values as string] as TypeStruct,
          pluginName,
          importedTypes
        );
        if (types[prop]?.type === "set") {
          out[prop].bounded = types[prop]?.bounded ?? false;
          out[prop].manualOrdering = types[prop]?.manualOrdering ?? false;
        }
        continue;
      }
      if (typeof types[prop].values == "object") {
        out[prop].values = iterateSchemaTypes(
          types[prop].values as TypeStruct,
          pluginName,
          importedTypes
        );
        if (types[prop]?.type === "set") {
          out[prop].bounded = types[prop]?.bounded ?? false;
          out[prop].manualOrdering = types[prop]?.manualOrdering ?? false;
        }
        continue;
      }
    }
    if (/^ref<(.+)>$/.test(types[prop].type as string)) {
      out[prop] = { ...types[prop] };
      const typeGroup = /^ref<(.+)>$/.exec(
        types[prop].type as string
      )?.[1] as string;
      const splitGroup = typeGroup.split(".");
      if (splitGroup?.length == 1) {
        out[prop].type = `ref<${pluginName}.${typeGroup}>`;
      } else {
        if (splitGroup[0] == "$") {
          out[prop].type = `ref<${[`$(${pluginName})`, ...splitGroup.slice(1)].join(".")}>`;
        } else {
          out[prop].type = types[prop].type;
        }
      }
      continue;
    }
    if (primitives.has(types[prop]?.type as string)) {
      out[prop] = types[prop];
      continue;
    }

    if (
      typeof types[prop].type == "string" &&
      importedTypes[types[prop]?.type as string]
    ) {
      out[prop] = iterateSchemaTypes(
        importedTypes[types[prop]?.type as string],
        pluginName,
        importedTypes
      );
      continue;
    }

    if (
      typeof types[prop].type == "string" &&
      importedTypes[pluginName + "." + types[prop]?.type]
    ) {
      out[prop] = iterateSchemaTypes(
        importedTypes[pluginName + "." + types[prop]?.type],
        pluginName,
        importedTypes
      );
      continue;
    }

    if (!types[prop]?.type) {
      out[prop] = iterateSchemaTypes(
        types[prop] as TypeStruct,
        pluginName,
        importedTypes
      );
    }
  }
  return out;
};

const drawSchemaTypesFromImports = (
  schema: { [key: string]: Manifest },
  pluginName: string,
  importedTypes = {}
): TypeStruct => {
  const types = Object.keys(schema[pluginName].types).reduce((types, key) => {
    if (key.startsWith(`${pluginName}.`)) {
      return {
        ...types,
        [key]: iterateSchemaTypes(
          schema[pluginName].types[key] as TypeStruct,
          pluginName,
          { ...importedTypes, ...schema[pluginName].types }
        ),
      };
    }
    return {
      ...types,
      [`${pluginName}.${key}`]: iterateSchemaTypes(
        schema[pluginName].types[key] as TypeStruct,
        pluginName,
        { ...importedTypes, ...schema[pluginName].types }
      ),
    };
  }, {});

  return Object.keys(schema[pluginName].imports).reduce(
    (acc, importPluginName) => {
      const importTypes = drawSchemaTypesFromImports(
        schema,
        importPluginName,
        importedTypes
      );
      return {
        ...acc,
        ...importTypes,
      };
    },
    types
  );
};

export const getRootSchemaForPlugin = (
  schemaMap: { [key: string]: Manifest },
  pluginName: string
): TypeStruct => {
  const schemaWithTypes = getExpandedTypesForPlugin(schemaMap, pluginName);
  const schemaWithStores = iterateSchemaTypes(
    schemaMap[pluginName].store,
    pluginName,
    schemaWithTypes
  );

  return constructRootSchema(
    {
      types: schemaWithTypes,
    } as Manifest,
    schemaWithStores as TypeStruct,
    pluginName
  );
};

const constructRootSchema = (
  schema: Manifest,
  struct: TypeStruct,
  pluginName: string
): TypeStruct => {
  const out = {};
  const sortedStructedProps = Object.keys(struct).sort();
  for (const prop of sortedStructedProps) {
    out[prop] = {};
    if (struct[prop]?.type == "set") {
      if (
        typeof struct[prop]?.values == "string" &&
        primitives.has(struct[prop]?.values as string)
      ) {
        out[prop].type = struct[prop].type;
        out[prop].emptyable = struct[prop]?.emptyable === undefined ? true : struct[prop]?.emptyable;
        out[prop].values = struct[prop].values;
        if (struct[prop].hasOwnProperty("default")) {
          out[prop].default = struct[prop].default;
        }
        continue;
      }

      if (
        typeof struct[prop]?.values == "string" &&
        schema.types[struct[prop]?.values as string]
      ) {
        out[prop].type = struct[prop].type;
        out[prop].emptyable = struct[prop]?.emptyable === undefined ? true : struct[prop]?.emptyable;
        out[prop].bounded = struct[prop]?.bounded ?? false;
        out[prop].manualOrdering = struct[prop]?.manualOrdering ?? false;
        out[prop].values = constructRootSchema(
          schema,
          schema.types[struct[prop]?.values as string] as TypeStruct,
          pluginName
        );
        continue;
      }
      if (typeof struct[prop]?.values != "string") {
        out[prop].type = struct[prop].type;
        out[prop].emptyable = struct[prop]?.emptyable === undefined ? true : struct[prop]?.emptyable;
        out[prop].bounded = struct[prop]?.bounded ?? false;
        out[prop].manualOrdering = struct[prop]?.manualOrdering ?? false;
        out[prop].values = constructRootSchema(
          schema,
          (struct[prop]?.values ?? {}) as TypeStruct,
          pluginName
        );
        continue;
      }
    }
    if (struct[prop]?.type == "array") {
      if (
        typeof struct[prop]?.values == "string" &&
        primitives.has(struct[prop]?.values as string)
      ) {
        out[prop].type = struct[prop].type;
        out[prop].emptyable = struct[prop]?.emptyable === undefined ? true : struct[prop]?.emptyable;
        out[prop].values = struct[prop].values;
        if (struct[prop].hasOwnProperty("default")) {
          out[prop].default = struct[prop].default;
        }
        continue;
      }

      if (
        typeof struct[prop]?.values == "string" &&
        schema.types[struct[prop]?.values as string]
      ) {
        out[prop].type = struct[prop].type;
        out[prop].emptyable = struct[prop]?.emptyable === undefined ? true : struct[prop]?.emptyable;
        out[prop].values = constructRootSchema(
          schema,
          {
            ...(schema.types[struct[prop]?.values as string] as TypeStruct),
            ["(id)"]: {
              type: "string",
              isKey: true,
            },
          },
          pluginName
        );
        continue;
      }

      if (typeof struct[prop]?.values != "string") {
        out[prop].type = struct[prop].type;
        out[prop].emptyable = struct[prop]?.emptyable === undefined ? true : struct[prop]?.emptyable;
        out[prop].values = constructRootSchema(
          schema,
          {
            ...((struct[prop]?.values ?? {}) as TypeStruct),
            ["(id)"]: {
              type: "string",
              isKey: true,
            },
          },
          pluginName
        );
        continue;
      }
    }
    if (primitives.has(struct[prop]?.type as string)) {
      out[prop] = struct[prop];
      continue;
    }
    if (/^ref<(.+)>$/.test(struct[prop].type as string)) {
      const typeName = /^ref<(.+)>$/.exec(
        struct[prop].type as string
      )?.[1] as string;
      if (primitives.has(typeName)) {
        out[prop] = struct[prop];
        out[prop].type = "ref";
        out[prop].refType = typeName;
        out[prop].refKeyType = typeName;
        out[prop].onDelete = struct[prop]?.onDelete ?? "delete";
        out[prop].nullable = struct[prop]?.nullable ?? false;
        if (struct[prop]?.hasOwnProperty("default")) {
          out[prop].default = struct[prop]?.default;
        }
      } else {
        if ((typeName ?? "")?.startsWith("$")) {
          out[prop].type = "ref";
          out[prop].refType = typeName.startsWith("$.")
            ? typeName.replace("$.", `$(${pluginName}).`)
            : typeName;
          out[prop].refType = typeName;
          out[prop].refKeyType = "<?>";
          out[prop].onDelete = struct[prop]?.onDelete ?? "delete";
          out[prop].nullable = struct[prop]?.nullable ?? false;
          if (struct[prop]?.hasOwnProperty("default")) {
            out[prop].default = struct[prop]?.default;
          }
          if (struct[prop].isKey) {
            out[prop].isKey = true;
          }
          continue;
        }
        if (!schema.types[typeName]) {
          const message = "Invalid reference type: " + typeName;
          throw new Error(message);
        }
        const type = schema.types[typeName];
        let key: null | TypeStruct = null;
        for (const p in type) {
          if (key) continue;
          if (type[p]?.isKey) {
            key = type[p];
          }
        }
        if (!key) {
          const message =
            "Invalid reference type: " +
            typeName +
            ". " +
            typeName +
            " has no key";
          throw new Error(message);
        }
        out[prop].type = "ref";
        out[prop].refType = typeName;
        out[prop].refKeyType = key.type;
        out[prop].onDelete = struct[prop]?.onDelete ?? "delete";
        out[prop].nullable = struct[prop]?.nullable ?? false;
        if (struct[prop]?.hasOwnProperty("default")) {
          out[prop].default = struct[prop]?.default;
        }
        if (struct[prop].isKey) {
          out[prop].isKey = true;
        }
        continue;
      }
    }
    if (schema.types[struct[prop].type as string]) {
      out[prop] = constructRootSchema(
        schema,
        schema.types[struct[prop].type as string] as TypeStruct,
        pluginName
      );
      continue;
    }
    if (!struct[prop]?.type) {
      out[prop] = constructRootSchema(
        schema,
        struct[prop] as TypeStruct,
        pluginName
      );
      continue;
    }
  }

  return out;
};

export const getInvalidStates = async (
  datasource: DataSource,
  appKvState: ApplicationKVState
): Promise<ApiStoreInvalidity> => {
  const manifests = await getPluginManifests(datasource, appKvState.plugins);
  const schemaMap = manifestListToSchemaMap(manifests);
  const store = {};
  for (let pluginName in appKvState.store) {
    const invalidStateIndices = await getPluginInvalidStateIndices(
      datasource,
      schemaMap,
      appKvState.store[pluginName],
      pluginName
    );
    const indexedKvs = reIndexSchemaArrays(
      appKvState?.store?.[pluginName] ?? []
    );

    const invalidRootStates = await getInvalidRootStates(
      datasource,
      schemaMap,
      appKvState.store[pluginName],
      pluginName
    );
    const invalidStates = [
      ...invalidRootStates,
      ...invalidStateIndices.map((i) => indexedKvs[i]),
    ];
    store[pluginName] = invalidStates;
  }
  return store;
};

export const getPluginInvalidStateIndices = async (
  datasource: DataSource,
  schemaMap: { [key: string]: Manifest },
  kvs: Array<DiffElement>,
  pluginName: string
): Promise<Array<number>> => {
  const out: Array<number> = [];
  const rootSchemaMap = (await getRootSchemaMap(datasource, schemaMap)) ?? {};
  for (let i = 1; i < kvs.length; ++i) {
    const { key, value } = kvs[i]
    const subSchema = getSchemaAtPath(rootSchemaMap[pluginName], key);
    for (const prop in subSchema) {
      if (subSchema[prop]?.type == "array" || subSchema[prop]?.type == "set") {
        if (subSchema[prop]?.emptyable === false) {
          let containsList = false;
          for (let j  = i + 1; j < kvs.length; ++j) {
            const { key: nextKey } = kvs[j];
            if (nextKey.startsWith(key + "." + prop)) {
              containsList = true;
              break;
            }
            if (!nextKey.startsWith(key)) {
              break;
            }
          }
          if (!containsList) {
            out.push(i);
          }
        }
        continue;
      }
      if (
        subSchema[prop]?.type &&
        (!subSchema[prop]?.nullable || subSchema[prop]?.isKey) &&
        (value[prop] == null ||
          ((subSchema[prop]?.type == "string" ||
            subSchema[prop]?.type == "file") &&
            value[prop] == ""))
      ) {
        out.push(i);
        continue;
      }

      if (subSchema[prop]?.type == "file") {
        const exists = await datasource?.checkBinary?.(value[prop]);
        if (!exists) {
          out.push(i);
          continue;
        }
      }
    }
  }
  return out;
};