import { useMemo } from "react";
import { Repository } from "@floro/graphql-schemas/src/generated/main-client-graphql";
import { useQuery } from "react-query";
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
} from "./polyfill-floro";
import { useRemoteKVState, useRemoteRenderedState } from "./remote-hooks";

export const useRemoteManifests = (repo: Repository): Array<Manifest> => {
  return useMemo(() => {
    if (!repo?.branchState?.commitState?.pluginVersions) {
      return [];
    }
    const manifests = repo?.branchState?.commitState?.pluginVersions?.map(
      (pluginVersion) => {
        return JSON.parse(pluginVersion?.manifest ?? "{}") as Manifest;
      },
      []
    );
    return topSortManifests(manifests);
  }, [repo?.branchState?.commitState?.pluginVersions]);
};

export const useInvalidStates = (
  datasource: DataSource,
  kvState: ApplicationKVState,
  isLoading: boolean,
  sha?: string
) => {
  return useQuery(
    "remote-repo--invalid-state:" + (sha ?? "none") + ":loading" + isLoading,
    async (): Promise<ApiStoreInvalidity|null> => {
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
  schemaMap: { [pluginName: string]: Manifest };
  isLoading: boolean;
  invalidStates: ApiStoreInvalidity;
  binaryMap: { [fileName: string]: string };
}

export const useRemoteCommitState = (repo: Repository): RemoteCommitState => {
  const renderedStateQuery = useRemoteRenderedState(repo);
  const kvStateQuery = useRemoteKVState(repo);
  const manifests = useRemoteManifests(repo);

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
      repo?.branchState?.commitState?.binaryRefs?.reduce?.((acc, binRef) => {
        if (binRef?.fileName) {
          return {
            [binRef.fileName]: binRef?.url as string,
            ...acc,
          };
        }
        return acc;
      }, {} as { [fileName: string]: string }) ?? {}
    );
  }, [repo?.branchState?.commitState?.binaryRefs]);

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
    repo?.branchState?.commitState?.sha as string
  );

  const invalidStates = useMemo((): ApiStoreInvalidity => {
    if (!invalidStatesQuery?.data) {
      return {};
    }
    return invalidStatesQuery?.data;
  }, [invalidStatesQuery?.data]);

  return {
    renderedState,
    schemaMap,
    isLoading,
    invalidStates,
    binaryMap,
  };
};
