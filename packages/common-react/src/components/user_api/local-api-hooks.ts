import { useQuery, useMutation, useQueryClient } from "react-query";
import axios from "axios";
import { ApiKey, WebhookKey } from "floro/dist/src/apikeys";

export const useApiKeys = () => {
  return useQuery("api-keys", async (): Promise<Array<ApiKey>> => {
    try {
      const result = await axios.get(`http://localhost:63403/api_keys`);
      return result?.data?.apiKeys ?? [];
    } catch (e) {
      return [] as Array<ApiKey>;
    }
  });
};

export const useAddApiKey = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ name }: { name: string }) => {
      return axios.post<{ apiKeys: Array<ApiKey> }>(
        `http://localhost:63403/api_keys`,
        {
          name,
        }
      );
    },
    onSuccess: (result: { data?: { apiKeys: Array<ApiKey> } }) => {
      queryClient.setQueryData(["api-keys"], result?.data?.apiKeys);
    },
  });
};

export const useRegenerateApiKey = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id }: { id: string }) => {
      return axios.post<{ apiKeys: Array<ApiKey> }>(
        `http://localhost:63403/api_keys/${id}/regenerate`
      );
    },
    onSuccess: (result: { data?: { apiKeys: Array<ApiKey> } }) => {
      queryClient.setQueryData(["api-keys"], result?.data?.apiKeys);
    },
  });
};

export const useDeleteApiKey = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id }: { id: string }) => {
      return axios.post<{ apiKeys: Array<ApiKey> }>(
        `http://localhost:63403/api_keys/${id}/delete`
      );
    },
    onSuccess: (result: { data?: { apiKeys: Array<ApiKey> } }) => {
      queryClient.setQueryData(["api-keys"], result?.data?.apiKeys);
    },
  });
};

export const useWebhookKeys = () => {
  return useQuery("webhook-keys", async (): Promise<Array<WebhookKey>> => {
    try {
      const result = await axios.get(`http://localhost:63403/webhook_keys`);
      return result?.data?.webhookKeys ?? [];
    } catch (e) {
      return [] as Array<WebhookKey>;
    }
  });
};

export const useAddWebhookKey = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      domain,
      defaultProtocol,
      defaultPort,
      defaultSubdomain,
    }: {
      domain: string;
      defaultPort?: number;
      defaultSubdomain?: string;
      defaultProtocol: "http" | "https";
    }) => {
      return axios.post<{ webhookKeys: Array<WebhookKey> }>(
        `http://localhost:63403/webhook_keys`,
        {
          domain,
          defaultProtocol,
          defaultPort,
          defaultSubdomain,
        }
      );
    },
    onSuccess: (result: { data?: { webhookKeys: Array<WebhookKey> } }) => {
      queryClient.setQueryData(["webhook-keys"], result?.data?.webhookKeys);
    },
  });
};

export const useRegenerateWebhookKey = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id }: { id: string }) => {
      return axios.post<{ webhookKeys: Array<WebhookKey> }>(
        `http://localhost:63403/webhook_keys/${id}/regenerate`
      );
    },
    onSuccess: (result: { data?: { webhookKeys: Array<WebhookKey> } }) => {
      queryClient.setQueryData(["webhook-keys"], result?.data?.webhookKeys);
    },
  });
};

export const useUpdateWebhookKey = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      defaultProtocol,
      defaultPort,
      defaultSubdomain,
    }: {
      id: string;
      defaultPort?: number;
      defaultSubdomain?: string;
      defaultProtocol: "http" | "https";
    }) => {
      return axios.post<{ webhookKeys: Array<WebhookKey> }>(
        `http://localhost:63403/webhook_keys/${id}/update`,
        {
          defaultProtocol,
          defaultPort,
          defaultSubdomain,
        }
      );
    },
    onSuccess: (result: { data?: { webhookKeys: Array<WebhookKey> } }) => {
      queryClient.setQueryData(["webhook-keys"], result?.data?.webhookKeys);
    },
  });
};

export const useDeleteWebhookKey = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id }: { id: string }) => {
      return axios.post<{ webhookKeys: Array<WebhookKey> }>(
        `http://localhost:63403/webhook_keys/${id}/delete`
      );
    },
    onSuccess: (result: { data?: { webhookKeys: Array<WebhookKey> } }) => {
      queryClient.setQueryData(["webhook-keys"], result?.data?.webhookKeys);
    },
  });
};
