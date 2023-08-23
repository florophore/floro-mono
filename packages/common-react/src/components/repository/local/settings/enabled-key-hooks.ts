import { useQuery, useMutation, useQueryClient } from "react-query";
import axios from "axios";
import { RepoEnabledApiKey, RepoEnabledWebhookKey } from "floro/dist/src/apikeys";

export const useEnabledApiKeys = (repoId: string) => {
  return useQuery("enabled-repo-api-keys:"+ repoId, async (): Promise<Array<RepoEnabledApiKey>> => {
    try {
      const result = await axios.get(`http://localhost:63403/repo/${repoId}/enabled_api_keys`);
      return result?.data?.enabledApiKeys ?? [];
    } catch (e) {
      return [] as Array<RepoEnabledApiKey>;
    }
  });
};

export const useAddEnabledApiKey = (repoId: string) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ apiKeyId }: { apiKeyId: string }) => {
      return axios.post<{ enabledApiKeys: Array<RepoEnabledApiKey> }>(
        `http://localhost:63403/repo/${repoId}/enabled_api_keys/create`,
        {
          apiKeyId,
        }
      );
    },
    onSuccess: (result: { data?: { enabledApiKeys: Array<RepoEnabledApiKey> } }) => {
      queryClient.setQueryData(["enabled-repo-api-keys:"+ repoId], result?.data?.enabledApiKeys);
    },
  });
};

export const useDeleteEnabledApiKey = (repoId: string) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ apiKeyId }: { apiKeyId: string }) => {
      return axios.post<{ enabledApiKeys: Array<RepoEnabledApiKey> }>(
        `http://localhost:63403/repo/${repoId}/enabled_api_keys/delete`,
        {
          apiKeyId,
        }
      );
    },
    onSuccess: (result: { data?: { enabledApiKeys: Array<RepoEnabledApiKey> } }) => {
      queryClient.setQueryData(["enabled-repo-api-keys:"+ repoId], result?.data?.enabledApiKeys);
    },
  });
};

export const useEnabledWebhookKeys = (repoId: string) => {
  return useQuery("enabled-repo-webhook-keys:"+ repoId, async (): Promise<Array<RepoEnabledWebhookKey>> => {
    try {
      const result = await axios.get(`http://localhost:63403/repo/${repoId}/enabled_webhook_keys`);
      return result?.data?.enabledWebhookKeys ?? [];
    } catch (e) {
      return [] as Array<RepoEnabledWebhookKey>;
    }
  });
};

export const useAddEnabledWebhookKey = (repoId: string) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      webhookKeyId,
      port,
      protocol,
      subdomain,
      uri,
    }: {
      webhookKeyId: string;
      port: number | undefined;
      protocol: "http" | "https" | undefined;
      subdomain: string | undefined;
      uri: string | undefined;
    }) => {
      return axios.post<{ enabledWebhookKeys: Array<RepoEnabledWebhookKey> }>(
        `http://localhost:63403/repo/${repoId}/enabled_webhook_keys/create`,
        {
          webhookKeyId,
          port,
          protocol,
          subdomain,
          uri,
        }
      );
    },
    onSuccess: (result: {
      data?: { enabledWebhookKeys: Array<RepoEnabledWebhookKey> };
    }) => {
      queryClient.setQueryData(
        ["enabled-repo-webhook-keys:" + repoId],
        result?.data?.enabledWebhookKeys
      );
    },
  });
};

export const useUpdateWebhookKey = (repoId: string) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      webhookKeyId,
      port,
      protocol,
      subdomain,
      uri,
    }: {
      id: string;
      webhookKeyId: string;
      port: number | undefined;
      protocol: "http" | "https" | undefined;
      subdomain: string | undefined;
      uri: string | undefined;
    }) => {
      return axios.post<{ enabledWebhookKeys: Array<RepoEnabledWebhookKey> }>(
        `http://localhost:63403/repo/${repoId}/enabled_webhook_keys/${id}/update`,
        {
          webhookKeyId,
          port,
          protocol,
          subdomain,
          uri,
        }
      );
    },
    onSuccess: (result: {
      data?: { enabledWebhookKeys: Array<RepoEnabledWebhookKey> };
    }) => {
      queryClient.setQueryData(
        ["enabled-repo-webhook-keys:" + repoId],
        result?.data?.enabledWebhookKeys
      );
    },
  });
};

export const useDeleteEnabledWebhookKey = (repoId: string) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => {
      return axios.post<{ enabledWebhookKeys: Array<RepoEnabledWebhookKey> }>(
        `http://localhost:63403/repo/${repoId}/enabled_webhook_keys/${id}/delete`,
      );
    },
    onSuccess: (result: {
      data?: { enabledWebhookKeys: Array<RepoEnabledWebhookKey> };
    }) => {
      queryClient.setQueryData(
        ["enabled-repo-webhook-keys:" + repoId],
        result?.data?.enabledWebhookKeys
      );
    },
  });
};

export const useTestEnabledWebhookKey = (repoId: string) => {
  return useMutation({
    mutationFn: (id: string) => {
      return axios.post<{ responseOkay: boolean }>(
        `http://localhost:63403/repo/${repoId}/enabled_webhook_keys/${id}/test`,
      );
    }
  });
};