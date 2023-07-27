import { useMemo, useCallback } from "react";
import {
  CommitState,
  Repository,
} from "@floro/graphql-schemas/src/generated/main-client-graphql";
import { useQuery } from "react-query";
import { useSearchParams} from "react-router-dom";
import {
  Manifest,
  manifestListToSchemaMap,
  ApiStoreInvalidity,
  ApplicationKVState,
  EMPTY_COMMIT_STATE,
  EMPTY_RENDERED_APPLICATION_STATE,
  RenderedApplicationState,
  getInvalidStates,
  topSortManifests,
  DataSource,
  getStateDiffFromCommitStates,
  ApiDiff,
  getApiDiff,
  EMPTY_COMMIT_DIFF,
} from "./polyfill-floro";
import { useRemoteKVState, useRemoteRenderedState } from "./remote-hooks";
import { RepoPage } from "../../types";

export const useRemoteManifests = (
  commitState?: CommitState | null
): Array<Manifest> => {
  return useMemo(() => {
    if (!commitState?.pluginVersions) {
      return [];
    }
    const manifests = commitState?.pluginVersions?.map((pluginVersion) => {
      return JSON.parse(pluginVersion?.manifest ?? "{}") as Manifest;
    }, []);
    return topSortManifests(manifests);
  }, [commitState?.pluginVersions]);
};

export const useInvalidStates = (
  datasource: DataSource,
  kvState: ApplicationKVState,
  isLoading: boolean,
  sha?: string
) => {
  return useQuery(
    "remote-repo-invalid-state:" + (sha ?? "none") + ":loading" + isLoading,
    async (): Promise<ApiStoreInvalidity | null> => {
      if (!sha) {
        return {};
      }
      if (isLoading) {
        return null;
      }
      if (!datasource) {
        return null;
      }
      if (!kvState) {
        return null;
      }
      return await getInvalidStates(datasource, kvState);
    }
  );
};

export interface RemoteCommitState {
  renderedState: RenderedApplicationState;
  kvState: ApplicationKVState;
  schemaMap: { [pluginName: string]: Manifest };
  isLoading: boolean;
  invalidStates: ApiStoreInvalidity;
  binaryMap: { [fileName: string]: string };
}

export const useRemoteCommitState = (
  commitState?: CommitState | null
): RemoteCommitState => {
  const renderedStateQuery = useRemoteRenderedState(commitState);
  const kvStateQuery = useRemoteKVState(commitState);
  const manifests = useRemoteManifests(commitState);

  const renderedState = useMemo(() => {
    return renderedStateQuery?.data ?? EMPTY_RENDERED_APPLICATION_STATE;
  }, [renderedStateQuery?.data]);

  const kvState = useMemo(() => {
    return kvStateQuery?.data ?? EMPTY_COMMIT_STATE;
  }, [kvStateQuery?.data]);

  const isLoading = useMemo(
    () => kvStateQuery?.isLoading || renderedStateQuery?.isLoading,
    [kvStateQuery?.isLoading, renderedStateQuery?.isLoading]
  );

  const schemaMap = useMemo(
    () => manifestListToSchemaMap(manifests),
    [manifests]
  );

  const binaryMap = useMemo((): { [fileName: string]: string } => {
    return (
      commitState?.binaryRefs?.reduce?.((acc, binRef) => {
        if (binRef?.fileName) {
          return {
            [binRef.fileName]: binRef?.url as string,
            ...acc,
          };
        }
        return acc;
      }, {} as { [fileName: string]: string }) ?? {}
    );
  }, [commitState?.binaryRefs]);

  const datasource = useMemo(
    () =>
      ({
        getPluginManifest: async (pluginName: string) => {
          return schemaMap[pluginName];
        },
        checkBinary: async (fileName: string) => {
          return !!binaryMap[fileName];
        },
      } as DataSource),
    [schemaMap, binaryMap]
  );
  const invalidStatesQuery = useInvalidStates(
    datasource,
    kvState,
    isLoading,
    commitState?.sha as string
  );

  const invalidStates = useMemo((): ApiStoreInvalidity => {
    if (!invalidStatesQuery?.data) {
      return {};
    }
    return invalidStatesQuery?.data;
  }, [invalidStatesQuery?.data]);

  return {
    renderedState,
    kvState,
    schemaMap,
    isLoading,
    invalidStates,
    binaryMap,
  };
};

export const useDiff = (
  beforeRemoteState: RemoteCommitState,
  afterRemoteState: RemoteCommitState,
  mode: "view" | "compare"
): ApiDiff => {
  const diff = useMemo(() => {
    if (mode == "view") {
      return EMPTY_COMMIT_DIFF;
    }
    return getStateDiffFromCommitStates(
      beforeRemoteState?.kvState,
      afterRemoteState.kvState
    );
  }, [beforeRemoteState?.kvState, afterRemoteState.kvState, mode]);

  return useMemo(() => {
    if (mode == "view") {
      return {
        description: {
          added: [],
          removed: [],
        },
        licenses: {
          added: [],
          removed: [],
        },
        plugins: {
          added: [],
          removed: [],
        },
        store: {},
      };
    }
    return  getApiDiff(
      beforeRemoteState?.kvState,
      afterRemoteState.kvState,
      diff
    );
  }, [diff, beforeRemoteState?.kvState, afterRemoteState.kvState, mode]);
};
export const useBeforeCommitState = (
  repository: Repository,
  page: RepoPage
): CommitState|null => {
  return useMemo(() => {
    if (page == "merge-request-create") {
      return repository?.branchState?.proposedMergeRequest?.divergenceState ?? null;
    }
    if (page == "merge-request") {
      return repository?.mergeRequest?.divergenceState ?? null;
    }
    return null;
  }, [page]);
};

export const useViewMode = (
  page: RepoPage
): "view" | "compare" => {
  return useMemo(() => {
    if (page == "merge-request-create") {
      return "compare";
    }
    if (page == "merge-request") {
      return "compare";
    }
    return "view";
  }, [page]);
};

export interface ComparisonState {
  apiDiff: ApiDiff;
  beforeRemoteCommitState: RemoteCommitState;
}

export const useMainCommitState = (
  page: RepoPage,
  repository: Repository
): CommitState | null => {
  return useMemo(() => {
    if (page == "merge-request") {
      return repository?.mergeRequest?.branchState?.commitState ?? null;
    }
    return repository?.branchState?.commitState ?? null;
  }, [
    page,
    repository?.branchState?.commitState,
    repository?.mergeRequest?.branchState?.commitState,
  ]);
};

export const useMainRemoteState = (
  page: RepoPage,
  repository: Repository,
): RemoteCommitState => {
  const commitState = useMainCommitState(page, repository);
  return useRemoteCommitState(commitState);
}

export const useComparisonState = (
  page: RepoPage,
  repository: Repository,
  remoteCommitState: RemoteCommitState
): ComparisonState => {
  const mode = useViewMode(page);
  const beforeCommitState = useMemo(() => {
    if (page == "merge-request-create") {
      return repository?.branchState?.proposedMergeRequest?.divergenceState;
    }
    if (page == "merge-request") {
      return repository?.mergeRequest?.divergenceState;
    }
    return null;
  }, [
    mode,
    page,
    repository?.branchState?.proposedMergeRequest?.divergenceState,
    repository?.mergeRequest?.divergenceState,
  ]);

  const beforeRemoteCommitState = useRemoteCommitState(beforeCommitState);
  const apiDiff = useDiff(beforeRemoteCommitState, remoteCommitState, mode);
  return {
    beforeRemoteCommitState,
    apiDiff
  };
}

export const useMergeRequestReviewPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const reviewPageRaw = searchParams.get("review_page");
  const plugin = searchParams.get("plugin") ?? "home";
  const reviewPage = useMemo(() => {
    if (reviewPageRaw == "commits") {
      return "commits";
    }
    if (reviewPageRaw == "changes") {
      return "changes";
    }
    return "none";
  }, [reviewPageRaw]);
  const setReviewPage = useCallback(
    (reviewPage: "commits" | "changes" | "none") => {
      if (reviewPage == "none") {
        setSearchParams({
          plugin
        });
        return;
      }
      setSearchParams({
        review_page: reviewPage,
        plugin
      });
    },
    [searchParams, plugin]
  );
  return { reviewPage, setReviewPage };
};

;

export const useRemoteCompareFrom = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const compareFromRaw = searchParams.get("compare_from");
  const plugin = searchParams.get("plugin") ?? "home";
  const reviewPageRaw = searchParams.get("review_page");
  const compareFrom = useMemo(() => {
    if (compareFromRaw == "before") {
      return "before";
    }
    return "after";
  }, [compareFromRaw]);
  const setCompareFrom = useCallback(
    (compareFrom: "before" | "after") => {
      if (reviewPageRaw) {
        setSearchParams({
          plugin,
          compare_from: compareFrom,
          review_page: reviewPageRaw
        });
        return;
      }
      setSearchParams({
        plugin,
        compare_from: compareFrom,
      });
    },
    [searchParams, plugin, reviewPageRaw]
  );
  return { compareFrom, setCompareFrom };
};


export const useMergeRequestsFilter = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const plugin = searchParams.get("plugin") ?? "home";
  const filterMRRaw = searchParams.get("filter_mr") ?? "open";
  const filterMR = useMemo(() => {
    if (filterMRRaw == "closed") {
      return "closed";
    }
    return "open";
  }, [filterMRRaw]);
  const setFilterMR = useCallback(
    (filterMR: "open" | "closed") => {
      setSearchParams({
        plugin,
        filter_mr: filterMR,
      });
    },
    [searchParams, plugin]
  );
  return { filterMR, setFilterMR };
};