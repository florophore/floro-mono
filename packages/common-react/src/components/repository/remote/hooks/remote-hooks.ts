import { useMemo } from "react";
import { CommitState, Repository } from "@floro/graphql-schemas/src/generated/main-client-graphql";
import { Manifest } from "floro/dist/src/plugins";
import axios from "axios";
import { useQuery, useMutation, useQueryClient } from "react-query";
import { ApplicationKVState, RenderedApplicationState } from "./polyfill-floro";

import { useParams } from "react-router-dom";

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

export const useRepoLinkBase = (repository: Repository, page?: string) => {
  const params = useParams();
  const ownerHandle = params?.["ownerHandle"] ?? "";
  const repoName = params?.["repoName"] ?? "";
  const branchId = params?.["branchId"] ?? "";
  const pageSuffix = useMemo(() => {
    if (page == "merge-request-create") {
      return "mergerequests/create/" + branchId;
    }
    return page;
  }, [page, branchId])
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
