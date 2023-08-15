import { useMemo } from "react";
import { CommitState, Repository } from "@floro/graphql-schemas/src/generated/main-client-graphql";
import { Manifest } from "floro/dist/src/plugins";
import axios from "axios";
import { useQuery, useMutation, useQueryClient } from "react-query";
import { ApplicationKVState, DataSource, RenderedApplicationState, TypeStruct, getRootSchemaForPlugin, getRootSchemaMap } from "./polyfill-floro";

import { useParams } from "react-router-dom";
import { RepoPage } from "../../types";

export const useRemoteRenderedState = (commitState?: CommitState|null) => {
  return useQuery(
    "remote-repo-state:" + (commitState?.sha ?? "none"),
    async (): Promise<RenderedApplicationState|null> => {
      if (!commitState?.sha) {
        return null;
      }
      if (!commitState?.stateLink) {
        return null;
      }
      const state = await axios.get(commitState?.stateLink);
      return state?.data;
    },
    {
      cacheTime: 1800000,
    }
  );
};

export const useRemoteKVState = (commitState?: CommitState|null) => {
  return useQuery(
    "remote-repo-kv:" + (commitState?.sha ?? "none"),
    async (): Promise<ApplicationKVState|null> => {
      if (!commitState?.sha) {
        return null;
      }
      if (!commitState?.kvLink) {
        return null;
      }
      const state = await axios.get(commitState?.kvLink);
      return state?.data;
    },
    {
      cacheTime: 1800000,
    }
  );
};

export const useRepoLinkBase = (repository: Repository, page?: RepoPage) => {
  const params = useParams();
  const ownerHandle = params?.["ownerHandle"] ?? "";
  const repoName = params?.["repoName"] ?? "";
  const branchId = params?.["branchId"] ?? "";
  const mergeRequestId = params?.["mergeRequestId"] ?? "";
  const pageSuffix = useMemo(() => {
    if (page == "merge-request-create") {
      return "mergerequests/create/" + branchId;
    }
    if (page == "merge-request") {
      return "mergerequests/" + mergeRequestId;
    }
    return "";
  }, [page, branchId,mergeRequestId])
  const suffix = !page || page == "home" ? "" : `/${pageSuffix}`
  return useMemo(() => {
    if (!repository?.name) {
      return `/repo/@/${ownerHandle}/${repoName}${suffix}`;
    }
    if (repository.repoType == "user_repo") {
      return `/repo/@/${repository?.user?.username}/${repository?.name}${suffix}`;
    }
    return `/repo/@/${repository?.organization?.handle}/${repository?.name}${suffix}`;
  }, [repository, ownerHandle, suffix]);
};


export const useRootSchemaMap = (manifest: Manifest|null, schemaMap: {[name: string]: Manifest}) => {
  const datasource = useMemo(
    () =>
      ({
        getPluginManifest: async (pluginName: string) => {
          return schemaMap[pluginName];
        },
      } as DataSource),
    [schemaMap]
  );
  return useQuery(
    "root-schema-map:" + manifest?.name ?? "none" + ":" + manifest?.version ?? "none",
    async (): Promise<{ [key: string]: TypeStruct } | null> => {
      if (!manifest) {
        return {};
      }
      const result = await getRootSchemaMap(datasource, schemaMap, true);
      return result;
    },
    {
      cacheTime: !manifest ? 0 : 300000,
    }
  );
};