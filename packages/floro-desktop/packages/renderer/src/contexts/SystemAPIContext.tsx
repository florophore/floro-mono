import { createContext, useContext } from 'react';


const SystemAPIContext = createContext<SystemAPI|null>(null);

interface Props {
    children: React.ReactElement;
    systemAPI: SystemAPI;
}

export const SystemAPIProvider = ({systemAPI, children}: Props) => {
    return (
        <SystemAPIContext.Provider value={systemAPI}>
            {children}
        </SystemAPIContext.Provider>
    );
};

export const useSystemAPI = () => {
    return useContext(SystemAPIContext);
};