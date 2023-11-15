
import { createContext, useContext } from 'react';


const EnvContext = createContext<{
    env: string;
}>({
    env: 'development'
});

interface Props {
    children: React.ReactElement;
    env: string;
}

export const EnvProvider = (props: Props) => {
    return (
        <EnvContext.Provider value={{
            env: props.env
        }}>
            {props.children}
        </EnvContext.Provider>
    );
};

export const useEnv = () => {
    return useContext(EnvContext);
};