
import { createContext, useContext } from 'react';


const UAContext = createContext<{
    userAgent: string;
}>({
    userAgent: ""
});

interface Props {
    children: React.ReactElement;
    userAgent: string;
}

export const UserAgentProvider = (props: Props) => {
    return (
        <UAContext.Provider value={{
            userAgent: props.userAgent
        }}>
            {props.children}
        </UAContext.Provider>
    );
};

export const useUserAgent = () => {
    return useContext(UAContext);
};