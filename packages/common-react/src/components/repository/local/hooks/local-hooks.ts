import { useMemo, useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from "react-query";
import axios from "axios";
import { Repository, useExchangeSessionMutation } from "@floro/graphql-schemas/src/generated/main-client-graphql";
import { ApiResponse, Branch, BranchesMetaState, CloneFile, FetchInfo, RemoteSettings, RepoInfo, SourceGraphResponse } from "floro/dist/src/repo";
import { SourceCommitNode } from "floro/dist/src/sourcegraph";
import { CopyInstructions, Manifest, PluginElement } from "floro/dist/src/plugins";
import { useSession } from "../../../../session/session-context";
import { SourceGraph } from './SourceGraph';
import { useSocketEvent } from '../../../../pubsub/socket';
import { Settings } from 'http2';


export interface ClientSourceGraph {
  pointers: { [sha: string]: SourceCommitNode };
  rootNodes: Array<SourceCommitNode>;
  branches: Array<Branch>;
  branchesMetaState: BranchesMetaState;
}

export const useCurrentRepoState = (repository: Repository|RepoInfo) => {
  return useQuery(
    "repo-current:" + repository.id,
    async (): Promise<ApiResponse | null> => {
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
    async (): Promise<ClientSourceGraph | null> => {
      try {
        if (!repository.id) {
          return null;
        }
        const result = await axios.get<SourceGraphResponse>(
          `http://localhost:63403/repo/${repository.id}/sourcegraph`
        );
        if (result?.data) {
          const sourcegraph = new SourceGraph(
            result?.data?.commits ?? [] as Array<SourceCommitNode>,
            result?.data?.branchesMetaState ?? [],
            result?.data?.repoState,
          )
          return {
            pointers: sourcegraph.getPointers(),
            rootNodes: sourcegraph.getGraph(),
            branches: result?.data?.branches,
            branchesMetaState: result?.data?.branchesMetaState,
          }
        }
        return null;
      } catch (e) {
        return null;
      }
    }
  );
};

export const useCanMoveWIP = (repository: Repository, sha?: string|null) => {
  return useQuery(
    "repo-can-switch:" + repository.id + ":sha:" + sha,
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

export const useCanAutoMerge = (repository: Repository, sha?: string|null) => {
  return useQuery(
    "repo-can-automerge:" + repository.id + ":sha:" + sha,
    async (): Promise<{canAutoMergeOnTopOfCurrentState: boolean, canAutoMergeOnUnStagedState: boolean, isMerged: boolean}> => {
      try {
        if (!repository.id) {
          return {canAutoMergeOnTopOfCurrentState: false, canAutoMergeOnUnStagedState: false, isMerged: false};
        }
        if (!sha) {
          return {canAutoMergeOnTopOfCurrentState: false, canAutoMergeOnUnStagedState: false, isMerged: false};
        }
        const result = await axios.get(
          `http://localhost:63403/repo/${repository.id}/sha/${sha}/canautomerge`
        );
        return result?.data ?? null;
      } catch (e) {
        return {canAutoMergeOnTopOfCurrentState: false, canAutoMergeOnUnStagedState: false, isMerged: false};
      }
    }, {
      cacheTime: 0
    }
  );
};

export const useCanCherryPick = (repository: Repository, sha?: string|null) => {
  return useQuery(
    "repo-can-cherrypick:" + repository.id + ":sha:" + sha,
    async (): Promise<{canCherryPick: boolean}> => {
      try {
        if (!repository.id) {
          return {canCherryPick: false};
        }
        if (!sha) {
          return {canCherryPick: false};
        }
        const result = await axios.get(
          `http://localhost:63403/repo/${repository.id}/sha/${sha}/cancherrypick`
        );
        return result?.data ?? null;
      } catch (e) {
        return {canCherryPick: false};
      }
    }, {
      cacheTime: 0
    }
  );
};


export const useCanAmend = (repository: Repository, sha?: string|null) => {
  return useQuery(
    "repo-can-amend:" + repository.id + ":sha:" + sha,
    async (): Promise<{canAmend: boolean}> => {
      try {
        if (!repository.id) {
          return {canAmend: false};
        }
        if (!sha) {
          return {canAmend: false};
        }
        const result = await axios.get(
          `http://localhost:63403/repo/${repository.id}/sha/${sha}/canamend`
        );
        return result?.data ?? null;
      } catch (e) {
        return {canAmend: false};
      }
    }, {
      cacheTime: 0
    }
  );
};
export const useCanRevert = (repository: Repository, sha?: string|null) => {
  return useQuery(
    "repo-can-revert:" + repository.id + ":sha:" + sha,
    async (): Promise<{canRevert: boolean}> => {
      try {
        if (!repository.id) {
          return {canRevert: false};
        }
        if (!sha) {
          return {canRevert: false};
        }
        const result = await axios.get(
          `http://localhost:63403/repo/${repository.id}/sha/${sha}/canrevert`
        );
        return result?.data ?? null;
      } catch (e) {
        return {canRevert: false};
      }
    }, {
      cacheTime: 0
    }
  );
};

export const useCanAutoFix = (repository: Repository, sha?: string|null) => {
  return useQuery(
    "repo-can-autofix:" + repository.id + ":sha:" + sha,
    async (): Promise<{canAutoFix: boolean}> => {
      try {
        if (!repository.id) {
          return {canAutoFix: false};
        }
        if (!sha) {
          return {canAutoFix: false};
        }
        const result = await axios.get(
          `http://localhost:63403/repo/${repository.id}/sha/${sha}/canautofix`
        );
        return result?.data ?? null;
      } catch (e) {
        return {canAutoFix: false};
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
      return axios.post<ApiResponse>(
        `http://localhost:63403/repo/${repository.id}/command`,
        {
          commandMode,
        }
      );
    },
    onSuccess: (result: { data?: ApiResponse }) => {
      queryClient.setQueryData(["repo-current:" + repository.id], result?.data);
    },
  });
};

export const useUpdateDescription = (repository: Repository) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (description: string) => {
      return axios.post<ApiResponse>(
        `http://localhost:63403/repo/${repository.id}/description`,
        {
          description,
        }
      );
    },
    onSuccess: (result: { data?: ApiResponse }) => {
      queryClient.setQueryData(["repo-current:" + repository.id], result?.data);
    },
  });
};

export const useUpdateLicenses = (repository: Repository) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (licenses: Array<{ key: string; value: string }>) => {
      return axios.post<ApiResponse>(
        `http://localhost:63403/repo/${repository.id}/licenses`,
        {
          licenses,
        }
      );
    },
    onSuccess: (result: { data?: ApiResponse }) => {
      queryClient.setQueryData(["repo-current:" + repository.id], result?.data);
    },
  });
};

export const useUpdatePlugins = (repository: Repository) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (plugins: Array<{ key: string; value: string }>) => {
      return axios.post<ApiResponse>(
        `http://localhost:63403/repo/${repository.id}/plugins`,
        {
          plugins,
        }
      );
    },
    onSuccess: (result: { data?: ApiResponse }) => {
      queryClient.setQueryData(["repo-current:" + repository.id], result?.data);
      queryClient.invalidateQueries(["manifest-list:" + repository.id]);
    },
  });
};

export const useUpdatePluginState = (pluginName: string, repository: Repository, refCount: React.MutableRefObject<number>) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ state, id, pluginName: pluginNameToUpdate}: {state: unknown, id: number, pluginName: string}): Promise<{id: number, result: ApiResponse}> => {
      const result = await axios.post<ApiResponse>(
        `http://localhost:63403/repo/${repository.id}/plugin/${pluginName}/state`,
        {
          state,
          pluginName: pluginNameToUpdate
        }
      );
      //await (new Promise(resolve => {
      //  setTimeout(() => resolve(true), 500);
      //}))
      return {
        id,
        result: result?.data
      }
    },
    onSuccess: ({result, id}) => {
      if (refCount?.current && refCount?.current > id) {
        return;
      }
      queryClient.setQueryData(["repo-current:" + repository.id], result);
    }
  });
};

export const useClearPluginStorage = (pluginName: string, repository: Repository, refCount?: React.MutableRefObject<number>) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({id}: {id?: number}): Promise<{id?: number, result: ApiResponse}> => {
      const result = await axios.post<ApiResponse>(
        `http://localhost:63403/repo/${repository.id}/plugin/${pluginName}/storage/clear`,
        {}
      );
      return {
        id,
        result: result?.data
      }
    },
    onSuccess: ({id, result}) => {
      if (refCount?.current && id && refCount?.current > id) {
        return;
      }
      queryClient.setQueryData(["repo-current:" + repository.id], result);
    }
  });
};

export const useUpdatePluginStorage = (pluginName: string, repository: Repository, refCount: React.MutableRefObject<number>) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ storage, id}: {storage: object, id: number}): Promise<{id: number, result: ApiResponse}> => {
      const result = await axios.post<ApiResponse>(
        `http://localhost:63403/repo/${repository.id}/plugin/${pluginName}/storage`,
        {
          storage,
        }
      );
      return {
        id,
        result: result?.data
      }
    },
    onSuccess: ({result, id}) => {
      if (refCount?.current && refCount?.current > id) {
        return;
      }
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
    }): Promise<{ apiResponse: ApiResponse; sourceGraphResponse: ClientSourceGraph }> => {
      const result = await axios.post<{ apiResponse: ApiResponse; sourceGraphResponse: SourceGraphResponse }>(
        `http://localhost:63403/repo/${repository.id}/branch`,
        {
        branchName,
        branchHead,
        baseBranchId,
        switchBranchOnCreate
        }
      );
      const sourcegraph = new SourceGraph(
        result?.data?.sourceGraphResponse?.commits ?? [] as Array<SourceCommitNode>,
        result?.data?.sourceGraphResponse?.branchesMetaState ?? [],
        result?.data?.sourceGraphResponse?.repoState,
      )
      return {
        apiResponse: result?.data?.apiResponse,
        sourceGraphResponse: {
          pointers: sourcegraph.getPointers(),
          rootNodes: sourcegraph.getGraph(),
          branches: result?.data?.sourceGraphResponse?.branches,
          branchesMetaState: result?.data?.sourceGraphResponse?.branchesMetaState,
        }
      }
    },
    onSuccess: ({ apiResponse, sourceGraphResponse }) => {
      queryClient.setQueryData(["repo-current:" + repository.id], apiResponse);
      queryClient.setQueryData(["repo-sourcegraph:" + repository.id], sourceGraphResponse);
    },
  });
};

export const useUpdateBranch = (repository: Repository) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      branchName,
      branchHead,
      baseBranchId,
    }: {
      branchName: string;
      branchHead: string|null;
      baseBranchId?: string|null;
    }): Promise<{ apiResponse: ApiResponse; sourceGraphResponse: ClientSourceGraph }> => {
      const result = await axios.post<{ apiResponse: ApiResponse; sourceGraphResponse: SourceGraphResponse }>(
        `http://localhost:63403/repo/${repository.id}/branch/update`,
        {
        branchName,
        branchHead,
        baseBranchId,
        }
      );
      const sourcegraph = new SourceGraph(
        result?.data?.sourceGraphResponse?.commits ?? [] as Array<SourceCommitNode>,
        result?.data?.sourceGraphResponse?.branchesMetaState ?? [],
        result?.data?.sourceGraphResponse?.repoState,
      )
      return {
        apiResponse: result?.data?.apiResponse,
        sourceGraphResponse: {
          pointers: sourcegraph.getPointers(),
          rootNodes: sourcegraph.getGraph(),
          branches: result?.data?.sourceGraphResponse?.branches,
          branchesMetaState: result?.data?.sourceGraphResponse?.branchesMetaState,
        }
      }
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
    }): Promise<{ apiResponse: ApiResponse; sourceGraphResponse: ClientSourceGraph }> => {
      const result = await axios.post<{ apiResponse: ApiResponse; sourceGraphResponse: SourceGraphResponse }>(
        `http://localhost:63403/repo/${repository.id}/branch/switch`,
        {
        branchId,
        }
      );
      const sourcegraph = new SourceGraph(
        result?.data?.sourceGraphResponse?.commits ?? [] as Array<SourceCommitNode>,
        result?.data?.sourceGraphResponse?.branchesMetaState ?? [],
        result?.data?.sourceGraphResponse?.repoState,
      )
      return {
        apiResponse: result?.data?.apiResponse,
        sourceGraphResponse: {
          pointers: sourcegraph.getPointers(),
          rootNodes: sourcegraph.getGraph(),
          branches: result?.data?.sourceGraphResponse?.branches,
          branchesMetaState: result?.data?.sourceGraphResponse?.branchesMetaState,
        }
      }
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
    }): Promise<{ apiResponse: ApiResponse; sourceGraphResponse: ClientSourceGraph }> => {
      if (!branchId) {
        throw new Error("branchId cannot be null");
      }
      const result = await axios.post<{ apiResponse: ApiResponse; sourceGraphResponse: SourceGraphResponse }>(
        `http://localhost:63403/repo/${repository.id}/branch/${branchId}/delete`,
        {
        branchId,
        }
      );
      const sourcegraph = new SourceGraph(
        result?.data?.sourceGraphResponse?.commits ?? [] as Array<SourceCommitNode>,
        result?.data?.sourceGraphResponse?.branchesMetaState ?? [],
        result?.data?.sourceGraphResponse?.repoState,
      )
      return {
        apiResponse: result?.data?.apiResponse,
        sourceGraphResponse: {
          pointers: sourcegraph.getPointers(),
          rootNodes: sourcegraph.getGraph(),
          branches: result?.data?.sourceGraphResponse?.branches,
          branchesMetaState: result?.data?.sourceGraphResponse?.branchesMetaState,
        }
      }
    },
    onSuccess: ({ apiResponse, sourceGraphResponse }) => {
      queryClient.setQueryData(["repo-current:" + repository.id], apiResponse);
      queryClient.setQueryData(["repo-sourcegraph:" + repository.id], sourceGraphResponse);
    },
  });
};

export const useMergeSha = (repository: Repository) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      sha,
    }: {
      sha: string|null;
    }): Promise<{ apiResponse: ApiResponse; sourceGraphResponse: ClientSourceGraph }> => {
      const result = await axios.post<{ apiResponse: ApiResponse; sourceGraphResponse: SourceGraphResponse }>(
          `http://localhost:63403/repo/${repository.id}/sha/${sha}/merge`
      );
      const sourcegraph = new SourceGraph(
        result?.data?.sourceGraphResponse?.commits ?? [] as Array<SourceCommitNode>,
        result?.data?.sourceGraphResponse?.branchesMetaState ?? [],
        result?.data?.sourceGraphResponse?.repoState,
      )
      return {
        apiResponse: result?.data?.apiResponse,
        sourceGraphResponse: {
          pointers: sourcegraph.getPointers(),
          rootNodes: sourcegraph.getGraph(),
          branches: result?.data?.sourceGraphResponse?.branches,
          branchesMetaState: result?.data?.sourceGraphResponse?.branchesMetaState,
        }
      }
    },
    onSuccess: ({ apiResponse, sourceGraphResponse }) => {
      queryClient.setQueryData(["repo-current:" + repository.id], apiResponse);
      queryClient.setQueryData(["repo-sourcegraph:" + repository.id], sourceGraphResponse);
    },
  });
};

export const useResolveMerge = (repository: Repository) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (): Promise<{ apiResponse: ApiResponse; sourceGraphResponse: ClientSourceGraph }> => {
      const result = await axios.post<{ apiResponse: ApiResponse; sourceGraphResponse: SourceGraphResponse }>(
          `http://localhost:63403/repo/${repository.id}/merge/resolve`
      );
      const sourcegraph = new SourceGraph(
        result?.data?.sourceGraphResponse?.commits ?? [] as Array<SourceCommitNode>,
        result?.data?.sourceGraphResponse?.branchesMetaState ?? [],
        result?.data?.sourceGraphResponse?.repoState,
      )
      return {
        apiResponse: result?.data?.apiResponse,
        sourceGraphResponse: {
          pointers: sourcegraph.getPointers(),
          rootNodes: sourcegraph.getGraph(),
          branches: result?.data?.sourceGraphResponse?.branches,
          branchesMetaState: result?.data?.sourceGraphResponse?.branchesMetaState,
        }
      }
    },
    onSuccess: ({ apiResponse, sourceGraphResponse }) => {
      queryClient.setQueryData(["repo-current:" + repository.id], apiResponse);
      queryClient.setQueryData(["repo-sourcegraph:" + repository.id], sourceGraphResponse);
    },
  });
};

export const useAbortMerge = (repository: Repository) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (): Promise<ApiResponse> => {
      const result = await axios.post<ApiResponse>(
        `http://localhost:63403/repo/${repository.id}/merge/abort`
      );
      return result?.data;
    },
    onSuccess: (apiResponse) => {
      queryClient.setQueryData(["repo-current:" + repository.id], apiResponse);
    },
  });
};

export const useCherryPick = (repository: Repository) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      sha,
    }: {
      sha: string;
    }): Promise<{ apiResponse: ApiResponse; sourceGraphResponse: ClientSourceGraph }> => {
      const result = await axios.post<{ apiResponse: ApiResponse; sourceGraphResponse: SourceGraphResponse }>(
        `http://localhost:63403/repo/${repository.id}/sha/${sha}/cherrypick`,
      );
      const sourcegraph = new SourceGraph(
        result?.data?.sourceGraphResponse?.commits ?? [] as Array<SourceCommitNode>,
        result?.data?.sourceGraphResponse?.branchesMetaState ?? [],
        result?.data?.sourceGraphResponse?.repoState,
      )
      return {
        apiResponse: result?.data?.apiResponse,
        sourceGraphResponse: {
          pointers: sourcegraph.getPointers(),
          rootNodes: sourcegraph.getGraph(),
          branches: result?.data?.sourceGraphResponse?.branches,
          branchesMetaState: result?.data?.sourceGraphResponse?.branchesMetaState,
        }
      }
    },
    onSuccess: ({ apiResponse, sourceGraphResponse }) => {
      queryClient.setQueryData(["repo-current:" + repository.id], apiResponse);
      queryClient.setQueryData(["repo-sourcegraph:" + repository.id], sourceGraphResponse);
    },
  });
};

export const useRevert = (repository: Repository) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      sha,
    }: {
      sha: string;
    }): Promise<{ apiResponse: ApiResponse; sourceGraphResponse: ClientSourceGraph }> => {
      const result = await axios.post<{ apiResponse: ApiResponse; sourceGraphResponse: SourceGraphResponse }>(
        `http://localhost:63403/repo/${repository.id}/sha/${sha}/revert`,
      );
      const sourcegraph = new SourceGraph(
        result?.data?.sourceGraphResponse?.commits ?? [] as Array<SourceCommitNode>,
        result?.data?.sourceGraphResponse?.branchesMetaState ?? [],
        result?.data?.sourceGraphResponse?.repoState,
      )
      return {
        apiResponse: result?.data?.apiResponse,
        sourceGraphResponse: {
          pointers: sourcegraph.getPointers(),
          rootNodes: sourcegraph.getGraph(),
          branches: result?.data?.sourceGraphResponse?.branches,
          branchesMetaState: result?.data?.sourceGraphResponse?.branchesMetaState,
        }
      }
    },
    onSuccess: ({ apiResponse, sourceGraphResponse }) => {
      queryClient.setQueryData(["repo-current:" + repository.id], apiResponse);
      queryClient.setQueryData(["repo-sourcegraph:" + repository.id], sourceGraphResponse);
    },
  });
};

export const useAmend = (repository: Repository) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      sha,
      message,
    }: {
      sha: string;
      message: string;
    }): Promise<{ apiResponse: ApiResponse; sourceGraphResponse: ClientSourceGraph }> => {
      const result = await axios.post<{ apiResponse: ApiResponse; sourceGraphResponse: SourceGraphResponse }>(
        `http://localhost:63403/repo/${repository.id}/sha/${sha}/amend`,
        {
          message
        }
      );
      const sourcegraph = new SourceGraph(
        result?.data?.sourceGraphResponse?.commits ?? [] as Array<SourceCommitNode>,
        result?.data?.sourceGraphResponse?.branchesMetaState ?? [],
        result?.data?.sourceGraphResponse?.repoState,
      )
      return {
        apiResponse: result?.data?.apiResponse,
        sourceGraphResponse: {
          pointers: sourcegraph.getPointers(),
          rootNodes: sourcegraph.getGraph(),
          branches: result?.data?.sourceGraphResponse?.branches,
          branchesMetaState: result?.data?.sourceGraphResponse?.branchesMetaState,
        }
      }
    },
    onSuccess: ({ apiResponse, sourceGraphResponse }) => {
      queryClient.setQueryData(["repo-current:" + repository.id], apiResponse);
      queryClient.setQueryData(["repo-sourcegraph:" + repository.id], sourceGraphResponse);
    },
  });
};

export const useAutoFix = (repository: Repository) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      sha,
    }: {
      sha: string;
    }): Promise<{ apiResponse: ApiResponse; sourceGraphResponse: ClientSourceGraph }> => {
      const result = await axios.post<{ apiResponse: ApiResponse; sourceGraphResponse: SourceGraphResponse }>(
        `http://localhost:63403/repo/${repository.id}/sha/${sha}/autofix`,
      );
      const sourcegraph = new SourceGraph(
        result?.data?.sourceGraphResponse?.commits ?? [] as Array<SourceCommitNode>,
        result?.data?.sourceGraphResponse?.branchesMetaState ?? [],
        result?.data?.sourceGraphResponse?.repoState,
      )
      return {
        apiResponse: result?.data?.apiResponse,
        sourceGraphResponse: {
          pointers: sourcegraph.getPointers(),
          rootNodes: sourcegraph.getGraph(),
          branches: result?.data?.sourceGraphResponse?.branches,
          branchesMetaState: result?.data?.sourceGraphResponse?.branchesMetaState,
        }
      }
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
  repository: Repository|RepoInfo,
  apiResult?: ApiResponse|undefined|null
) => {
  const query =  useQuery(
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
  useEffect(() => {
    query.refetch();
  }, [apiResult])
  return query;
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
    // may want to consider this one day
    ///const allOrgPublicPlugins = currentUser?.organizations?.flatMap(
    ///  (o) => o?.publicPlugins
    ///) ?? [];
    if (repository.repoType == "user_repo") {
      return [
        ...(currentUser?.privatePlugins ?? []),
        ...(currentUser?.publicPlugins ?? []),
      ].map((p) => p?.name as string);
    }
    if (!repository?.organization?.id) {
      return [];
    }
    const organization = repository?.organization;
    if (!organization) {
      return [];
    }
    return [
      ...(organization?.privatePlugins ?? []),
      ...(organization?.publicPlugins ?? []),
      ...(currentUser?.publicPlugins ?? []),
    ].map((p) => p?.name as string);
  }, [repository, currentUser]);
};

export const useRepoDevPlugins = (
  repository: Repository|RepoInfo
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

export const useStashChanges = (repository: Repository) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (): Promise<ApiResponse> => {
      const result = await axios.post<ApiResponse>(
        `http://localhost:63403/repo/${repository.id}/stash`
      );
      return result?.data;
    },
    onSuccess: (apiResponse) => {
      queryClient.setQueryData(["repo-current:" + repository.id], apiResponse);
    },
  });
};

export const usePopStashedChanges = (repository: Repository) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (): Promise<ApiResponse> => {
      const result = await axios.post<ApiResponse>(
        `http://localhost:63403/repo/${repository.id}/popstash`
      );
      return result?.data;
    },
    onSuccess: (apiResponse) => {
      queryClient.setQueryData(["repo-current:" + repository.id], apiResponse);
    },
  });
};

export const useDiscardChanges = (repository: Repository) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (): Promise<ApiResponse> => {
      const result = await axios.post<ApiResponse>(
        `http://localhost:63403/repo/${repository.id}/discard`
      );
      return result?.data;
    },
    onSuccess: (apiResponse) => {
      queryClient.setQueryData(["repo-current:" + repository.id], apiResponse);
    },
  });
};

export const useUpdateComparison = (repository: Repository) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      against,
      branch,
      sha
    }: {
      against: "wip"|"branch"|"sha",
      branch?: string|null,
      sha?: string|null,
    }): Promise<ApiResponse> => {
      const result = await axios.post<ApiResponse>(
        `http://localhost:63403/repo/${repository.id}/comparison`,
        {
          against,
          branch,
          sha
        }
      );
      return result?.data;
    },
    onSuccess: (apiResponse) => {
      queryClient.setQueryData(["repo-current:" + repository.id], apiResponse);
    },
  });
};

export const useCommitChanges = (repository: Repository) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      message,
    }: {
      message: string
    }): Promise<ApiResponse> => {
      const result = await axios.post<ApiResponse>(
        `http://localhost:63403/repo/${repository.id}/commit`,
        {
          message,
        }
      );
      return result?.data;
    },
    onSuccess: (apiResponse) => {
      queryClient.setQueryData(["repo-current:" + repository.id], apiResponse);
    },
  });
};

export const useChangeMergeDirection = (repository: Repository) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      direction,
    }: {
      direction: "yours"|"theirs"
    }): Promise<ApiResponse> => {
      const result = await axios.post<ApiResponse>(
        `http://localhost:63403/repo/${repository.id}/merge/direction/${direction}`,
      );
      return result?.data;
    },
    onSuccess: (apiResponse) => {
      queryClient.setQueryData(["repo-current:" + repository.id], apiResponse);
    },
  });
};

export const useCheckoutCommitSha = (repository: Repository) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      sha,
    }: {
      sha: string
    }): Promise<{ apiResponse: ApiResponse; sourceGraphResponse: ClientSourceGraph }> => {
      const result = await axios.post<{ apiResponse: ApiResponse; sourceGraphResponse: SourceGraphResponse }>(
        `http://localhost:63403/repo/${repository.id}/checkout/commit/${sha}`,
      );
      const sourcegraph = new SourceGraph(
        result?.data?.sourceGraphResponse?.commits ?? [] as Array<SourceCommitNode>,
        result?.data?.sourceGraphResponse?.branchesMetaState ?? [],
        result?.data?.sourceGraphResponse?.repoState,
      )
      return {
        apiResponse: result?.data?.apiResponse,
        sourceGraphResponse: {
          pointers: sourcegraph.getPointers(),
          rootNodes: sourcegraph.getGraph(),
          branches: result?.data?.sourceGraphResponse?.branches,
          branchesMetaState: result?.data?.sourceGraphResponse?.branchesMetaState,
        }
      }
    },
    onSuccess: ({ apiResponse, sourceGraphResponse }) => {
      queryClient.setQueryData(["repo-current:" + repository.id], apiResponse);
      queryClient.setQueryData(["repo-sourcegraph:" + repository.id], sourceGraphResponse);
    },
  });
};

export const useFetchInfo = (repository: Repository) => {
  return useQuery(
    "repo-fetch-info:" + repository.id,
    async (): Promise< FetchInfo | null> => {
      try {
        if (!repository.id) {
          return null;
        }
        const result = await axios.get<FetchInfo>(
          `http://localhost:63403/repo/${repository.id}/fetchinfo`
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

export const useRepoRemoteSettings = (repository: Repository) => {
  return useQuery(
    "repo-remote-settings:" + repository.id,
    async (): Promise< RemoteSettings | null> => {
      try {
        if (!repository.id) {
          return null;
        }
        const result = await axios.get<RemoteSettings>(
          `http://localhost:63403/repo/${repository.id}/settings`
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

export const usePushBranch = (repository: Repository) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (): Promise<FetchInfo> => {
      const result = await axios.post<FetchInfo>(
        `http://localhost:63403/repo/${repository.id}/push`,
      );
      return result?.data ?? null;
    },
    onSuccess: (fetchInfo: FetchInfo) => {
      if (fetchInfo) {
        queryClient.setQueryData(["repo-fetch-info:" + repository.id], fetchInfo);
      }
    }
  });
};

export const usePullBranch = (repository: Repository) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (): Promise<{fetchInfo: FetchInfo, apiResponse: ApiResponse}> => {
      const result = await axios.post<{fetchInfo: FetchInfo, apiResponse: ApiResponse}>(
        `http://localhost:63403/repo/${repository.id}/pull`,
      );
      return result?.data ?? null;
    },
    onSuccess: ({fetchInfo, apiResponse}: {fetchInfo: FetchInfo, apiResponse: ApiResponse}) => {
      if (fetchInfo) {
        queryClient.setQueryData(["repo-fetch-info:" + repository.id], fetchInfo);
      }
      if (apiResponse) {
        queryClient.setQueryData(["repo-current:" + repository.id], apiResponse);
      }
    }
  });
};

export const useRepoExistsLocally = (repository: Repository) => {
    return useQuery("repo-exists:" + repository.id, async () => {
        try {
            if (!repository.id) {
                return false;
            }
            const result = await axios.get(`http://localhost:63403/repo/${repository.id}/exists`)
            return result?.data?.exists ?? false;
        } catch(e) {
            return false;
        }
    }, {
      cacheTime: 0
    });
}

export const useIsBranchProtected = (repository: Repository, branchId?: string) => {
    return useQuery("repo-branch:" + repository.id + ":protected:" + branchId, async () => {
        try {
            if (!repository.id) {
                return false;
            }
            if (!branchId) {
                return false;
            }
            const result = await axios.get(`http://localhost:63403/repo/${repository.id}/branch/${branchId}/is_protected`)
            return result?.data?.isProtected ?? false;
        } catch(e) {
            return false;
        }
    }, { cacheTime: 0});
}

export const useCloneRepo = (repository: Repository) => {
  return useMutation({
    mutationFn: () => {
        return axios.get(
          `http://localhost:63403/repo/${repository.id}/clone`
        );
    }
  });
};

export const usePauseCloneRepo = (repository: Repository) => {
  return useMutation({
    mutationFn: () => {
        return axios.post(
          `http://localhost:63403/repo/${repository.id}/clone/pause`
        );
    }
  });
};

export const useResumeCloneRepo = (repository: Repository) => {
  return useMutation({
    mutationFn: () => {
        return axios.post(
          `http://localhost:63403/repo/${repository.id}/clone/resume`
        );
    }
  });
};



export const useCloneState = (repository: Repository) => {
  const queryClient = useQueryClient();
  useSocketEvent(
    "clone-progress:" + repository.id,
    () => {
      queryClient.refetchQueries("clone-state:" + repository.id);
    },
    [repository.id]
  );

  useSocketEvent(
    "clone-done:" + repository.id,
    () => {
      queryClient.refetchQueries("local-repos-info");
      queryClient.refetchQueries("local-repos");
      queryClient.refetchQueries("repo-exists:" + repository.id);
    },
    [repository.id]
  );

  return useQuery(
    "clone-state:" + repository.id,
    async (): Promise<{
    state: "in_progress" | "done" | "paused" | "none";
    downloadedCommits: number;
    totalCommits: number;
  }> => {
      try {
        if (!repository.id) {
          return {
            state: "none",
            downloadedCommits: 0,
            totalCommits: 1,
          };
        }
        const result = await axios.get<{
          state: "in_progress" | "done" | "paused" | "none";
          downloadedCommits: number;
          totalCommits: number;
        }>(`http://localhost:63403/repo/${repository.id}/clone/state`);
        return (
          result?.data ?? {
            state: "none",
            downloadedCommits: 0,
            totalCommits: 1,
          }
        );
      } catch (e) {
        return {
          state: "none",
          downloadedCommits: 0,
          totalCommits: 1,
        };
      }
    }
  );
};

export const usePaste = (fromRepo: Repository, intoRepoInfo: RepoInfo) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn:
    async ({
      fromSchemaMap,
      fromStateMap,
      pluginsToAdd,
      copyInstructions
    }: {
      fromSchemaMap: { [pluginName: string]: Manifest },
      fromStateMap: { [pluginName: string]: object },
      pluginsToAdd: Array<PluginElement>,
      copyInstructions: CopyInstructions
    }
    ): Promise<ApiResponse> => {
      const result = await axios.post<ApiResponse>(
        `http://localhost:63403/repo/${intoRepoInfo.id}/paste`,
        {
          fromRepoId: fromRepo.id,
          fromSchemaMap,
          fromStateMap,
          pluginsToAdd,
          copyInstructions
        }
      );
      return result?.data as ApiResponse;
    },
    onSuccess: (apiResponse) => {
      queryClient.setQueryData(
        ["repo-current:" + intoRepoInfo.id],
        apiResponse
      );
    },
  });

};