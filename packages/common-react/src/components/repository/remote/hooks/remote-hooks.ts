import { useMemo } from "react";
import { Repository } from "@floro/graphql-schemas/src/generated/main-client-graphql";
import { Manifest } from "floro/dist/src/plugins";
import axios from "axios";
import { useQuery, useMutation, useQueryClient } from "react-query";
import { ApplicationKVState, RenderedApplicationState } from "./polyfill-floro";

import { useParams } from "react-router-dom";

export const useRemoteRenderedState = (repo: Repository) => {
  return useQuery(
    "remote-repo-state:" + (repo?.branchState?.commitState?.sha ?? "none"),
    async (): Promise<RenderedApplicationState|null> => {
      if (!repo?.branchState?.commitState?.sha) {
        return null;
      }
      if (!repo?.branchState?.commitState?.stateLink) {
        return null;
      }
      const state = await axios.get(repo?.branchState?.commitState?.stateLink);
      return state?.data;
    },
    {
      cacheTime: 3000,
    }
  );
};

export const useRemoteKVState = (repo: Repository) => {
  return useQuery(
    "remote-repo-kv:" + (repo?.branchState?.commitState?.sha ?? "none"),
    async (): Promise<ApplicationKVState|null> => {
      if (!repo?.branchState?.commitState?.sha) {
        return null;
      }
      if (!repo?.branchState?.commitState?.kvLink) {
        return null;
      }
      const state = await axios.get(repo?.branchState?.commitState?.kvLink);
      return state?.data;
    },
    {
      cacheTime: 3000,
    }
  );
};

export const useRepoLinkBase = (repository: Repository, page?: string) => {
  const params = useParams();
  const ownerHandle = params?.["ownerHandle"] ?? "";
  const repoName = params?.["repoName"] ?? "";
  const suffix = !page || page == "home" ? "" : `/${page}`
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
