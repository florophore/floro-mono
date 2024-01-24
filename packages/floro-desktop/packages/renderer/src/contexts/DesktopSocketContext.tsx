import { createContext, useCallback, useContext, useState } from 'react';
import { useSystemAPI } from './SystemAPIContext';
import { useFloroSocket, useSocketEvent } from '@floro/common-react/src/pubsub/socket';
import { useSession } from '@floro/common-react/src/session/session-context';
import { useNavigate } from 'react-router-dom';
import { RepoInfo } from 'floro/dist/src/repo';


const DesktopSocketContext = createContext<{}>(null);

interface Props {
    children: React.ReactElement;
}

export const DesktopSocketProvider = ({ children}: Props) => {
    const systemApi = useSystemAPI();
    const { session } = useSession();
    const navigate = useNavigate();

    useSocketEvent('bring-to-front', () => {
        systemApi.bringToFront();

    }, [systemApi], false);

    useSocketEvent<{redirectLink: string}>(
      'open-link',
      ({redirectLink}) => {
        systemApi.bringToFront();
        if (!session) {
          return;
        }
        navigate(redirectLink);
      },
      [systemApi, session],
      false,
    );

    useSocketEvent<{}>(
      "plugin:message",
      () => {
        systemApi.bringToFront();
      },
      [systemApi, session],
      false,
    );

    return (
        <DesktopSocketContext.Provider value={{}}>
            {children}
        </DesktopSocketContext.Provider>
    );
};

export const useDesktopSocket = () => {
  return useContext(DesktopSocketContext);
}