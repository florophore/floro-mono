import React, { useMemo, useContext, useEffect, useCallback, useState } from 'react';
import { Manager, Socket } from "socket.io-client";
import { useEnv } from '../env/EnvContext';

export const createSocket = (client: 'web'|'desktop'|'cli', env: string) => {
    const manager = new Manager('ws://localhost:63403', {
      reconnectionDelayMax: 10000,
      query: {
        client,
        env
      }
    });
    return manager.socket("/"); // main namespace
};

export const useDefineFloroSocket = (client: 'web'|'desktop', env: string) => {
  return useMemo(() => createSocket(client, env), []);
}

const FloroSocketContext = React.createContext<{socket: null|Socket, client: 'web'|'desktop'|'cli'}>({
    socket: null,
    client: 'web'
});

export interface Props {
  children: React.ReactElement;
  client: 'web'|'desktop';
}

export const FloroSocketProvider = (props: Props) => {
    const { env} = useEnv();
    const socket = useDefineFloroSocket(props.client, env);
    return (
      <FloroSocketContext.Provider value={{socket, client: props.client}}>
        {props?.children}
      </FloroSocketContext.Provider>
    );
}

export const useFloroSocket = () => {
  return useContext(FloroSocketContext);
}

export const useDaemonIsConnected = () => {
  const { socket } = useFloroSocket();
  const [isConnected, setIsConnected] = useState(socket?.connected)
  useEffect(() => {
    const onConnected = () => setIsConnected(true);
    const onDisconnected = () => setIsConnected(false);
    socket?.on?.("connect", onConnected);
    socket?.on?.("disconnect", onDisconnected);
    return () => {
      socket?.off?.("connect", onConnected);
      socket?.off?.("disconnect", onDisconnected);
    }
  }, [socket]);

  return isConnected;
}

export const useSocketEvent = <T,> (eventName: string, callback: (args: T) => void, deps: unknown[], isOnce = true) => {
  const { socket } = useFloroSocket();
  const cb = useCallback((args: T) => {
    if (socket) {
      callback(args);
      if (isOnce) {
        socket.off(eventName, cb);
      }
    }
  }, [isOnce, callback, socket, eventName]);

  useEffect(() => {
    if (socket) {
      socket.on(eventName, cb);
      return () => {
        socket.off(eventName, cb);
      };
    }
  }, [cb, ...(deps ?? [])]);
}