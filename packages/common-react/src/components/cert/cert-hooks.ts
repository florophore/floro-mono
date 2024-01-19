
import { useEffect } from "react";
import { useQuery, useQueryClient } from "react-query";
import axios from "axios";
import { useDaemonIsConnected, useSocketEvent } from '../../pubsub/socket';
import { canUseLayoutEffect } from "@apollo/client/utilities";


export interface ConnectionInfo {
  ipAddr: string;
  tlsPort: string;
  certPort: string;
}

export const useConnectionInfoQuery = () => {
  const queryClient = useQueryClient();
  const isDaemonConnected = useDaemonIsConnected();
  const query = useQuery(
    "cert-connection-info",
    async (): Promise<ConnectionInfo | null> => {
      const result = await axios.get(
        `http://localhost:63403/connectioninfo`
      );
      return result?.data ?? null;
    },
    {cacheTime: 0}
  );

  useSocketEvent("ip-changed", () => {
    queryClient.invalidateQueries("cert-connection-info")
  }, [], false, );

  useEffect(() => {
    if (!isDaemonConnected) {
      queryClient.invalidateQueries("cert-connection-info")
    }
  }, [isDaemonConnected]);


  return query;
};
