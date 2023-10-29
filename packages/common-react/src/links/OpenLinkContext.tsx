import { createContext, useContext } from 'react';


const OpenLinkContext = createContext<{
    openUrl: (url: string) => void;
}>({
    openUrl: (_url: string) => {}
});

interface Props {
    children: React.ReactElement;
    openUrl: (url: string) => void;
}

export const OpenLinkProvider = (props: Props) => {
    return (
        <OpenLinkContext.Provider value={{
            openUrl: props.openUrl
        }}>
            {props.children}
        </OpenLinkContext.Provider>
    );
};

export const useOpenLink = () => {
    return useContext(OpenLinkContext).openUrl;
};