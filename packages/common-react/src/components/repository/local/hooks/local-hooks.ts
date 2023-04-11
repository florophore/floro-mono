import { useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from "react-query";
import axios from "axios";
import { Repository } from "@floro/graphql-schemas/src/generated/main-client-graphql";
import { ApiReponse, SourceGraphResponse } from "@floro/floro-lib/src/repo";
import { Manifest } from "@floro/floro-lib/src/plugins";
import { useSession } from "../../../../session/session-context";

export const useCurrentRepoState = (repository: Repository) => {
  return useQuery(
    "repo-current:" + repository.id,
    async (): Promise<ApiReponse | null> => {
      try {
        if (!repository.id) {
          return null;
        }
        const result = await axios.get(
          `http://localhost:63403/repo/${repository.id}/current`
        );
        return result?.data ?? null;
      } catch (e) {
        return null;
      }
    }
  );
};

export const useSourceGraph = (repository: Repository) => {
  return useQuery(
    "repo-sourcegraph:" + repository.id,
    async (): Promise<SourceGraphResponse | null> => {
      try {
        if (!repository.id) {
          return null;
        }
        const result = await axios.get(
          `http://localhost:63403/repo/${repository.id}/sourcegraph`
        );
        return result?.data ?? null;
      } catch (e) {
        return null;
      }
    }
  );
};

export const useCanMoveWIP = (repository: Repository, sha?: string|null) => {
  return useQuery(
    "repo-can-switch:" + repository.id + ":branch:" + sha,
    async (): Promise<{canSwitch: boolean}> => {
      try {
        if (!repository.id) {
          return {canSwitch: false};
        }
        if (!sha) {
          return {canSwitch: true};
        }
        const result = await axios.get(
          `http://localhost:63403/repo/${repository.id}/sha/${sha}/canswitchwip`
        );
        return result?.data ?? null;
      } catch (e) {
        return {canSwitch: false};
      }
    }, {
      cacheTime: 0
    }
  );
};

export const useCurrentLicenses = () => {
  return useQuery("local-licenses:", async (): Promise<
    Array<{ value: string; label: string }>
  > => {
    try {
      const result = await axios.get(`http://localhost:63403/licenses`);
      return result?.data ?? ([] as Array<{ value: string; label: string }>);
    } catch (e) {
      return [] as Array<{ value: string; label: string }>;
    }
  });
};

export const useUpdateCurrentCommand = (repository: Repository) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (commandMode: "view" | "edit" | "compare") => {
      return axios.post<ApiReponse>(
        `http://localhost:63403/repo/${repository.id}/command`,
        {
          commandMode,
        }
      );
    },
    onSuccess: (result: { data?: ApiReponse }) => {
      queryClient.setQueryData(["repo-current:" + repository.id], result?.data);
    },
  });
};

export const useUpdateDescription = (repository: Repository) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (description: string) => {
      return axios.post<ApiReponse>(
        `http://localhost:63403/repo/${repository.id}/description`,
        {
          description,
        }
      );
    },
    onSuccess: (result: { data?: ApiReponse }) => {
      queryClient.setQueryData(["repo-current:" + repository.id], result?.data);
    },
  });
};

export const useUpdateLicenses = (repository: Repository) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (licenses: Array<{ key: string; value: string }>) => {
      return axios.post<ApiReponse>(
        `http://localhost:63403/repo/${repository.id}/licenses`,
        {
          licenses,
        }
      );
    },
    onSuccess: (result: { data?: ApiReponse }) => {
      queryClient.setQueryData(["repo-current:" + repository.id], result?.data);
    },
  });
};

export const useUpdatePlugins = (repository: Repository) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (plugins: Array<{ key: string; value: string }>) => {
      return axios.post<ApiReponse>(
        `http://localhost:63403/repo/${repository.id}/plugins`,
        {
          plugins,
        }
      );
    },
    onSuccess: (result: { data?: ApiReponse }) => {
      queryClient.setQueryData(["repo-current:" + repository.id], result?.data);
      queryClient.invalidateQueries(["manifest-list:" + repository.id]);
    },
  });
};

export const useUpdatePluginState = (pluginName: string, repository: Repository) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ state, id, pluginName: pluginNameToUpdate}: {state: unknown, id: string, pluginName: string}): Promise<{id: string, result: ApiReponse}> => {
      const result = await axios.post<ApiReponse>(
        `http://localhost:63403/repo/${repository.id}/plugin/${pluginName}/state`,
        {
          state,
          pluginName: pluginNameToUpdate
        }
      );
      return {
        id,
        result: result?.data
      }
    },
    onSuccess: ({result}) => {
      queryClient.setQueryData(["repo-current:" + repository.id], result);
    }
  });
};

export const useCreateBranch = (repository: Repository) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      branchName,
      branchHead,
      baseBranchId,
      switchBranchOnCreate
    }: {
      branchName: string;
      branchHead: string|null;
      baseBranchId?: string|null;
      switchBranchOnCreate: boolean;
    }): Promise<{ apiResponse: ApiReponse; sourceGraphResponse: SourceGraphResponse }> => {
      const result = await axios.post<{ apiResponse: ApiReponse; sourceGraphResponse: SourceGraphResponse }>(
        `http://localhost:63403/repo/${repository.id}/branch`,
        {
        branchName,
        branchHead,
        baseBranchId,
        switchBranchOnCreate
        }
      );
      return result?.data;
    },
    onSuccess: ({ apiResponse, sourceGraphResponse }) => {
      queryClient.setQueryData(["repo-current:" + repository.id], apiResponse);
      queryClient.setQueryData(["repo-sourcegraph:" + repository.id], sourceGraphResponse);
    },
  });
};

export const useSwitchBranch = (repository: Repository) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      branchId,
    }: {
      branchId: string|null;
    }): Promise<{ apiResponse: ApiReponse; sourceGraphResponse: SourceGraphResponse }> => {
      const result = await axios.post<{ apiResponse: ApiReponse; sourceGraphResponse: SourceGraphResponse }>(
        `http://localhost:63403/repo/${repository.id}/branch/switch`,
        {
        branchId,
        }
      );
      return result?.data;
    },
    onSuccess: ({ apiResponse, sourceGraphResponse }) => {
      queryClient.setQueryData(["repo-current:" + repository.id], apiResponse);
      queryClient.setQueryData(["repo-sourcegraph:" + repository.id], sourceGraphResponse);
    },
  });
};

export const useDeleteBranch = (repository: Repository) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      branchId,
    }: {
      branchId: string;
    }): Promise<{ apiResponse: ApiReponse; sourceGraphResponse: SourceGraphResponse }> => {
      if (!branchId) {
        throw new Error("branchId cannot be null");
      }
      const result = await axios.post<{ apiResponse: ApiReponse; sourceGraphResponse: SourceGraphResponse }>(
        `http://localhost:63403/repo/${repository.id}/branch/${branchId}/delete`,
        {
        branchId,
        }
      );
      return result?.data;
    },
    onSuccess: ({ apiResponse, sourceGraphResponse }) => {
      queryClient.setQueryData(["repo-current:" + repository.id], apiResponse);
      queryClient.setQueryData(["repo-sourcegraph:" + repository.id], sourceGraphResponse);
    },
  });
};

export interface PluginCompatability {
  pluginName: string;
  pluginVersion: string;
  isCompatible: boolean;
  dependencies: Array<{
    pluginName: string;
    pluginVersion: string;
    isCompatible: boolean;
  }>;
}
export const usePluginCompatabilityCheck = (
  repository: Repository,
  pluginName: string,
  pluginVersion: string
) => {
  return useQuery(
    "compatability-check:" +
      repository.id +
      ":plugin:" +
      pluginName +
      ":" +
      pluginVersion,
    async (): Promise<PluginCompatability | null> => {
      try {
        if (!repository.id) {
          return null;
        }
        const result = await axios.get(
          `http://localhost:63403/repo/${repository.id}/plugin/${pluginName}/${pluginVersion}/compatability`
        );
        return result?.data ?? null;
      } catch (e) {
        return null;
      }
    },
    {
      cacheTime: 0,
    }
  );
};
export interface PluginUninstallCheck {
  canUninstall: boolean;
  downstreamDeps: Array<string>;
  manifestList: Array<Manifest>;
}

export const usePluginUninstallCheck = (
  repository: Repository,
  pluginName: string,
  pluginVersion: string
) => {
  return useQuery(
    "uninstall-check:" +
      repository.id +
      ":plugin:" +
      pluginName +
      ":" +
      pluginVersion,
    async (): Promise<PluginUninstallCheck | null> => {
      try {
        if (!repository.id) {
          return null;
        }
        const result = await axios.get(
          `http://localhost:63403/repo/${repository.id}/plugin/${pluginName}/${pluginVersion}/canuninstall`
        );
        return result?.data ?? null;
      } catch (e) {
        return null;
      }
    },
    {
      cacheTime: 0,
    }
  );
};

export const useRepoManifestList = (
  repository: Repository
) => {
  return useQuery(
    "manifest-list:" +
      repository.id,
    async (): Promise<Array<Manifest>> => {
      try {
        if (!repository.id) {
          return [];
        }
        const result = await axios.get(
          `http://localhost:63403/repo/${repository.id}/manifestlist`
        );
        return result?.data ?? [];
      } catch (e) {
        return [];
      }
    },
    {
      cacheTime: 0,
    }
  );
};

export const usePluginManifestList = (
  repository: Repository,
  pluginName: string,
  pluginVersion: string
) => {
  return useQuery(
    "manifest-list:" +
      repository.id +
      ":plugin:" +
      pluginName +
      ":" +
      pluginVersion,
    async (): Promise<Array<Manifest>> => {
      try {
        if (!repository.id) {
          return [];
        }
        const result = await axios.get(
          `http://localhost:63403/repo/${repository.id}/plugin/${pluginName}/${pluginVersion}/manifestlist`
        );
        return result?.data ?? [];
      } catch (e) {
        return [];
      }
    },
    {
      cacheTime: 0,
    }
  );
};

export const useCanUpdatePluginInRepo = (
  repository: Repository,
  pluginName: string,
  pluginVersion: string,
  pluginVersions: Array<string>
) => {
  return useQuery(
    "can-update-plugin:" +
      repository.id +
      ":plugin:" +
      pluginName +
      ":" +
      pluginVersion +
      ":" +
      pluginVersions.join("-"),
    async (): Promise<{ canUpdate: boolean;}> => {
      try {
        if (!repository.id) {
          return { canUpdate: false};
        }
        const result = await axios.post(
          `http://localhost:63403/repo/${repository.id}/plugin/${pluginName}/canupdate`,
          {
            versions: pluginVersions
          }
        );
        return result?.data ?? { canUpdate: false};
      } catch (e) {
        return { canUpdate: false};
      }
    },
    {
      cacheTime: 0,
    }
  );
};

export const usePossibleDevPlugins = (repository: Repository): Array<string> => {
  const { currentUser } = useSession();
  return useMemo(() => {
    if (repository.repoType == "user_repo") {
      return [
        ...(currentUser?.privatePlugins ?? []),
        ...(currentUser?.publicPlugins ?? []),
      ].map((p) => p?.name as string);
    }
    if (!repository?.organization?.id) {
      return [];
    }
    const organization = currentUser?.organizations?.find(
      (o) => o?.id == repository?.organization?.id
    );
    if (!organization) {
      return [];
    }
    return [
      ...(organization?.privatePlugins ?? []),
      ...(organization?.publicPlugins ?? []),
    ].map((p) => p?.name as string);
  }, [repository, currentUser]);
};

export const useRepoDevPlugins = (
  repository: Repository
) => {
  const pluginNames = usePossibleDevPlugins(repository);
  return useQuery(
    "dev-plugins:" +
      repository.id +
      ":" +
      pluginNames.join("-"),
    async (): Promise<{ [pluginName: string]: {[version: string]: { isCompatible: boolean, manifest: Manifest}}}> => {
      try {
        if (!repository.id) {
          return {};
        }
        const result = await axios.post(
          `http://localhost:63403/repo/${repository.id}/developmentplugins`,
          {
            pluginNames
          }
        );
        return result?.data ?? {};
      } catch (e) {
        return {};
      }
    },
    {
      cacheTime: 0,
    }
  );
};