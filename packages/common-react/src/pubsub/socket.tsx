import React, { useMemo, useContext, useEffect, useCallback } from 'react';
import { Manager, Socket } from "socket.io-client";

export const createSocket = (client: 'web'|'desktop'|'cli') => {
    const manager = new Manager('ws://localhost:63403', {
      reconnectionDelayMax: 10000,
      query: {
        client
      }
    });
    return manager.socket("/"); // main namespace
};

export const useDefineFloroSocket = (client: 'web'|'desktop') => {
  return useMemo(() => createSocket(client), []);
}

const FloroSocketContext = React.createContext<{socket: null|Socket}>({
    socket: null
});

export interface Props {
  children: React.ReactElement;
  client: 'web'|'desktop';
}

export const FloroSocketProvider = (props: Props) => {
    const socket = useDefineFloroSocket(props.client);
    return (
      <FloroSocketContext.Provider value={{socket}}>
        {props?.children}
      </FloroSocketContext.Provider>
    ); 
}

export const useFloroSocket = () => {
  return useContext(FloroSocketContext);
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