import React, { useState, useMemo, useContext, useEffect, useCallback } from 'react';
import { PassedLoginAction, Session, useExchangeSessionMutation, User } from '@floro/graphql-schemas/src/generated/main-client-graphql';
import { useSocketEvent } from '../pubsub/socket';
import { useQueryClient } from 'react-query';
import { removeClientSession, setClientSession } from './client-session';
import { useApolloClient } from '@apollo/client';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useSaveOfflinePhoto } from '../offline/OfflinePhotoContext';

const SessionContext = React.createContext<{session: Session|null, currentUser: User|null, logout: () => void, setCurrentUser: (user: User) => void}>({
    session: null,
    currentUser: null,
    setCurrentUser: () => null,
    logout: () => null
});

export interface Props {
  children: React.ReactElement;
}

export const SessionProvider = (props: Props) => {
    const [currentUser, setCurrentUser] = useState<User|null>(null); 
    const [session, setSession] = useState<Session|null>(null); 
    const navigate = useNavigate();

    const [exchangeSession, {data}] = useExchangeSessionMutation();
    const apolloClient = useApolloClient();
    const queryClient = useQueryClient();
    const savePhoto = useSaveOfflinePhoto();

    const logout = useCallback(() => {
        setCurrentUser(null);
        setSession(null);
        removeClientSession();
        apolloClient.clearStore();
        queryClient.resetQueries();
        try {
            // fire and forget
            axios.post("http://localhost:63403/logout");
        } catch(e) {
            //dont log
        }
        navigate("/");
    }, [apolloClient, queryClient, navigate]);

    useSocketEvent("login", (payload: PassedLoginAction) => {
        setClientSession(payload);
        setSession(payload.session as Session);
        setCurrentUser({...payload.user} as User);
    }, [currentUser], false);

    useSocketEvent("session_updated", (payload: PassedLoginAction) => {
        setClientSession(payload);
        setSession(payload.session as Session);
        setCurrentUser(payload.user as User);
    }, [], false);

    useSocketEvent("logout", () => {
        setCurrentUser(null);
        setSession(null);
        removeClientSession();
        apolloClient.clearStore();
        queryClient.resetQueries();
        navigate("/");
    }, [navigate], false);

    useEffect(() => {
        try {
            const userString = localStorage.getItem('user');
            const sessionString = localStorage.getItem('session');
            if (!userString || !sessionString) {
                return;
            }
            const user = JSON.parse(userString);
            const session = JSON.parse(sessionString);
            setCurrentUser(user);
            setSession(session);
            exchangeSession();
        } catch (e) {
            //dont log just fail
        }
    }, []);

    const setCurrentUserInStorage = useCallback((user: User) => {
        // should query existing user and relations against cache here
        localStorage.setItem('user', JSON.stringify(user));
        setCurrentUser(user);
    }, []);

    useEffect(() => {
        if (data?.exchangeSession?.user) {
            setClientSession({session: data.exchangeSession, user: data.exchangeSession.user});
            setSession(data.exchangeSession);
            setCurrentUser(data.exchangeSession.user);
            if (data?.exchangeSession?.user?.profilePhoto) {
                savePhoto(data?.exchangeSession?.user?.profilePhoto);
            }
        }
    }, [data?.exchangeSession, savePhoto]);

    return (
      <SessionContext.Provider value={{session, currentUser, logout, setCurrentUser: setCurrentUserInStorage}}>
        {props?.children}
      </SessionContext.Provider>
    ); 
}

export const useSession = () => {
  return useContext(SessionContext);
}