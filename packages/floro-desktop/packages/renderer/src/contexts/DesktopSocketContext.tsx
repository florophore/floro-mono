import { createContext, useContext } from 'react';
import { useSystemAPI } from './SystemAPIContext';
import { useFloroSocket, useSocketEvent } from '@floro/common-react/src/pubsub/socket';


const DesktopSocketContext = createContext<{}>(null);

interface Props {
    children: React.ReactElement;
}

export const DesktopSocketProvider = ({ children}: Props) => {
    const systemApi = useSystemAPI();
    useSocketEvent('bring-to-front', () => {
        systemApi.bringToFront();

    }, [systemApi], false);

    return (
        <DesktopSocketContext.Provider value={{}}>
            {children}
        </DesktopSocketContext.Provider>
    );
};