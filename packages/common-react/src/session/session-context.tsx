import { PassedLoginAction, Session, useExchangeSessionMutation, User } from '@floro/graphql-schemas/src/generated/main-client-graphql';
import React, { useState, useMemo, useContext, useEffect, useCallback } from 'react';
import { useSocketEvent } from '../pubsub/socket';
import { useQueryClient } from 'react-query';
import { removeClientSession, setClientSession } from './client-session';
import { useApolloClient } from '@apollo/client';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const ONE_WEEK = 1000 * 60 * 60 * 24 * 7;

const SessionContext = React.createContext<{session: Session|null, currentUser: User|null, logout: () => void}>({
    session: null,
    currentUser: null,
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

    const logout = useCallback(() => {
        setCurrentUser(null);
        setSession(null);
        removeClientSession();
        apolloClient.resetStore();
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
        setCurrentUser(payload.user as User);
        setSession(payload.session as Session);
    }, [], false);

    useSocketEvent("session_updated", (payload: PassedLoginAction) => {
        setClientSession(payload);
        setCurrentUser(payload.user as User);
        setSession(payload.session as Session);
    }, [], false);

    useSocketEvent("logout", () => {
        setCurrentUser(null);
        setSession(null);
        removeClientSession();
        apolloClient.resetStore();
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

            if (session?.expiresAt ) {
                const expiresAt = new Date(session.expiresAt);
                const expiresAtMS = expiresAt.getTime();
                const nowMS = (new Date()).getTime();
                const delta = (expiresAtMS - nowMS);
                if (delta < ONE_WEEK) {
                    exchangeSession();
                }
            }
        } catch (e) {
            //dont log just fail
        }
    }, []);

    useEffect(() => {
        if (data?.exchangeSession?.user) {
            console.log("data", data?.exchangeSession?.user);
            setClientSession({session: data.exchangeSession, user: data.exchangeSession.user});
            setSession(data.exchangeSession);
            setCurrentUser(data.exchangeSession.user);
        }
    }, [data?.exchangeSession]);

    return (
      <SessionContext.Provider value={{session, currentUser, logout}}>
        {props?.children}
      </SessionContext.Provider>
    ); 
}

export const useSession = () => {
  return useContext(SessionContext);
}