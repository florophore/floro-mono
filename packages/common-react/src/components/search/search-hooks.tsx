import React, { useState, useCallback, useMemo, useEffect } from "react";
import { usePageSearchQueryLazyQuery } from "@floro/graphql-schemas/src/generated/main-client-graphql";
import debouncer from "lodash.debounce";
import { useIsOnline, useUserOrganizations } from "../../hooks/offline";
import { useLocalReposInfos } from "../../hooks/repos";
import { useSession } from "../../session/session-context";
import { Organization, Plugin, Repository, User } from "@floro/graphql-schemas/src/generated/main-client-graphql";
import { RepoInfo } from "floro/dist/src/repo";
import { useSaveOfflineIcon } from "../../offline/OfflineIconsContext";

export interface RepoSearchResult {
    id: string;
    name: string;
    ownerHandle: string;
}

export interface SearchResult {
    users: User[]
    plugins: Plugin[]
    organizations: Organization[]
    repositories: RepoSearchResult[];
}

export const usePageSearch = (query: string): [SearchResult, boolean] => {
 const { currentUser } = useSession();
  const organizations = useUserOrganizations();

 const userOrgIds = useMemo(() => {
    return currentUser?.organizations?.map(o => o?.id as string);
 }, [currentUser?.organizations])

  const [remoteSearch, { data, loading }] = usePageSearchQueryLazyQuery({
    nextFetchPolicy: "network-only",
  });

  const searchDebounced = useCallback(debouncer(remoteSearch, 300), [
    remoteSearch,
  ]);

  useEffect(() => {
    if (query?.trim() == "") {
        return;
    }
    searchDebounced({
      variables: {
        query,
      },
    });
  }, [query]);

  const isOnline = useIsOnline();
  const repoInfos = useLocalReposInfos();
  const saveIcon = useSaveOfflineIcon();

  const localPlugins = useMemo(() => {
    return [
      ...(currentUser?.publicPlugins ?? []),
      ...(currentUser?.privatePlugins ?? []),
      ...(organizations?.flatMap((organization) => {
        return [
          ...(organization?.publicPlugins ?? []),
          ...(organization?.privatePlugins ?? []),
        ];
      }) ?? []),
    ];
  }, [
    organizations,
    currentUser?.privatePlugins,
    currentUser?.publicPlugins,
  ]);

  useEffect(() => {
    localPlugins.forEach(plugin => {
        if (plugin?.lightIcon) {
          saveIcon(plugin?.lightIcon);
        }
        if (plugin?.darkIcon) {
          saveIcon(plugin?.darkIcon);
        }
        if (plugin?.selectedLightIcon) {
          saveIcon(plugin?.selectedLightIcon);
        }
        if (plugin?.selectedDarkIcon) {
          saveIcon(plugin?.selectedDarkIcon);
        }

        plugin?.versions?.forEach((version) => {
          if (version?.lightIcon) {
            saveIcon(version?.lightIcon);
          }
          if (version?.darkIcon) {
            saveIcon(version?.darkIcon);
          }
          if (version?.selectedLightIcon) {
            saveIcon(version?.selectedLightIcon);
          }
          if (version?.selectedDarkIcon) {
            saveIcon(version?.selectedDarkIcon);
          }
        });
    })
  }, [saveIcon, localPlugins])



  const localOrganizationResults = useMemo(() => {
    if ((query?.toLowerCase()?.trim() ?? "") == "") {
      return [];
    }
    return organizations.filter((o) => {
      if (query?.[0] == "@") {
        return ("@" + o?.handle?.toLowerCase())?.startsWith(query?.toLowerCase() ?? "");
      }
      return o?.name?.toLowerCase()?.startsWith(query?.toLowerCase() ?? "");
    });
  }, [organizations, query]);

  const localPluginResults = useMemo(() => {
    if ((query?.toLowerCase()?.trim() ?? "") == "") {
      return [];
    }
    return localPlugins.filter((lp) => {
      return lp?.name?.toLowerCase()?.startsWith(query?.toLowerCase() ?? "");
    });
  }, [localPlugins, query]);

  const enabledRepoInfos = useMemo(() => {
    return repoInfos.filter((repoInfo) => {
      if (repoInfo.isPrivate && repoInfo.repoType == "org_repo") {
        return userOrgIds?.includes(repoInfo.id);
      }
    });
  }, [userOrgIds, repoInfos]);

  const offlineRepoResults = useMemo((): Array<RepoSearchResult> => {
    return enabledRepoInfos?.filter?.((repoInfo): boolean => {
        if (query?.[0] == "@") {
            return false;
        }
        return repoInfo.name
          ?.toLowerCase()
          .startsWith(query?.toLowerCase() ?? "");
    })?.map((r: RepoInfo) => ({
        id: r.id as string,
        name: r.name as string,
        ownerHandle: r.ownerHandle as string,
    })) ?? [] as Array<RepoSearchResult>;
  }, [enabledRepoInfos, query]);

  const onlineRepoResults = useMemo(() => {
    if (data?.pageSearch?.__typename != "PageSearchSuccess") {
        return []
    }
    return data?.pageSearch?.repositories?.map((r): RepoSearchResult => {
        return {
          id: r?.id as string,
          name: r?.name as string,
          ownerHandle:
            r?.repoType == "org_repo"
              ? (r?.organization?.handle as string)
              : (r?.user?.username as string),
        };
    })
  }, [data?.pageSearch])

  const onlineResults = useMemo((): SearchResult => {
    if (data?.pageSearch?.__typename != "PageSearchSuccess") {
        return {
            users:[],
            organizations:[],
            plugins:[],
            repositories:[],
        } as SearchResult;
    }
    return {
        users: data?.pageSearch?.users,
        organizations: data?.pageSearch?.organizations,
        plugins: data?.pageSearch?.plugins,
        repositories: onlineRepoResults as Array<RepoSearchResult>,
    } as SearchResult;

  }, [data?.pageSearch, onlineRepoResults])

  const offlineResults = useMemo(() => {
    return {
        users: [] as Array<User>,
        organizations: localOrganizationResults.slice(0, 4),
        plugins: localPluginResults.slice(0, 4) as Array<Plugin>,
        repositories: offlineRepoResults.slice(0, 4) as Array<RepoSearchResult>,
    } as SearchResult;

  }, [localPluginResults, offlineRepoResults, localOrganizationResults])

  if (!isOnline || (!loading &&  data?.pageSearch?.__typename != "PageSearchSuccess")) {
    return [offlineResults, false];
  }
  return [onlineResults, loading];
};
