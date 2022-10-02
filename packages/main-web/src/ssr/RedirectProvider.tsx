import React, { useMemo, useCallback, useContext, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { matchRoute } from '../Routing';

const RedirectContext = React.createContext<{context: {url?: string, should404: boolean, isSSR: boolean}}>({
    context: {
        url: undefined,
        should404: false,
        isSSR: false
    }
});

interface Props {
    context: {
        url?: string| undefined;
        should404: boolean;
        isSSR: boolean;
    }
    children: React.ReactElement;
}

const RedirectProvider = (props: Props): React.ReactElement => {
    const location = useLocation();
    const initalUrl = useMemo(() => props.context.url, [])
    const should404 = useMemo(() => !matchRoute(location.pathname + location.search), [location.pathname, + location.search]);
    if (initalUrl != location.pathname + location.search) {
        props.context.url = location.pathname; 
    }
    props.context.should404 = should404;

    return (
        <RedirectContext.Provider value={{context: props?.context}}>
            {props.children}
        </RedirectContext.Provider>
    );
}

export const useSsrRedirectContext = () => {
    const ctx = useContext(RedirectContext);
    return ctx.context;
}

export const useRedirect = () => {
    const redirectContext = useSsrRedirectContext();
    const navigate = useNavigate();

    return (path: string) => {
        if (!redirectContext.isSSR) {
            useEffect(() => {
                navigate?.(path);
            }, [])
        } else {
            redirectContext.url = path;
        }
    }
}

export default RedirectProvider;