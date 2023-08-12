import { useEffect } from 'react';
import { Organization, Repository } from "@floro/graphql-schemas/src/generated/main-client-graphql";
import { useMemo } from "react";
import { useQuery, useQueryClient } from "react-query";
import { useDaemonIsConnected } from "../pubsub/socket";
import { useSession } from "../session/session-context";
import { useIsOnline } from "./offline";
import axios from 'axios';
import { RepoInfo } from 'floro/dist/src/repo';

export const useCurrentUserRepos = () => {
  const { currentUser } = useSession();
  const privateRepositories = useMemo(() => {
    return currentUser?.privateRepositories ?? [];
  }, [currentUser?.privateRepositories]);
  const publicRepositories = useMemo(() => {
    return currentUser?.publicRepositories ?? [];
  }, [currentUser?.publicRepositories]);
  const repositories = useMemo(() => {
    return [...privateRepositories, ...publicRepositories].sort(
      (repoA, repoB) => {
        if (!repoA?.lastRepoUpdateAt && !repoB?.lastRepoUpdateAt) {
          return 0;
        }
        if (!repoA?.lastRepoUpdateAt) {
          return 1;
        }
        if (!repoB?.lastRepoUpdateAt) {
          return -1;
        }
        if (repoA.lastRepoUpdateAt == repoB.lastRepoUpdateAt) {
          return 0;
        }
        if (repoA.lastRepoUpdateAt > repoB.lastRepoUpdateAt) {
          return -1;
        }
        return 1;
      }
    );
  }, [privateRepositories, publicRepositories]);
  return useMemo(
    () => ({
      privateRepositories,
      publicRepositories,
      repositories,
    }),
    [privateRepositories, publicRepositories, repositories]
  );
};
export const useOrgRepos = (org?: Organization) => {
  const privateRepositories = useMemo(() => {
    return org?.privateRepositories ?? [];
  }, [org?.privateRepositories]);
  const publicRepositories = useMemo(() => {
    return org?.publicRepositories ?? [];
  }, [org?.publicRepositories]);
  const repositories = useMemo(() => {
    return [...privateRepositories, ...publicRepositories].sort(
      (repoA, repoB) => {
        if (!repoA?.lastRepoUpdateAt && !repoB?.lastRepoUpdateAt) {
          return 0;
        }
        if (!repoA?.lastRepoUpdateAt) {
          return 1;
        }
        if (!repoB?.lastRepoUpdateAt) {
          return -1;
        }
        if (repoA.lastRepoUpdateAt == repoB.lastRepoUpdateAt) {
          return 0;
        }
        if (repoA.lastRepoUpdateAt > repoB.lastRepoUpdateAt) {
          return -1;
        }
        return 1;
      }
    );
  }, [privateRepositories, publicRepositories]);
  return useMemo(
    () => ({
      privateRepositories,
      publicRepositories,
      repositories,
    }),
    [privateRepositories, publicRepositories, repositories]
  );
};

export const useLocalRepos = () => {
  const daemonIsRunning = useDaemonIsConnected();
  const queryClient = useQueryClient();
  useEffect(() => {
    queryClient.refetchQueries({queryKey: ["local-repos"]});
  }, [daemonIsRunning]);

  const response = useQuery("local-repos", async () => {
    try {
      const response =  await axios.get("http://localhost:63403/repos")
      return response?.data?.repos ?? [];
    } catch(e) {
      return []
    }
  });
  return response?.data ?? [];
}

export const useLocalReposInfos = (): Array<RepoInfo> => {
  const daemonIsRunning = useDaemonIsConnected();
  const queryClient = useQueryClient();
  useEffect(() => {
    queryClient.refetchQueries({queryKey: ["local-repos-info"]});
  }, [daemonIsRunning]);

  const response = useQuery("local-repos-info", async (): Promise<Array<RepoInfo>> => {
    try {
      const response =  await axios.get("http://localhost:63403/repos/info")
      return response?.data?.repoInfos ?? [];
    } catch(e) {
      return []
    }
  });
  return response?.data ?? [];
}