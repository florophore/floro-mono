import React, { useState, useContext, useEffect, useCallback } from "react";
import {
  ExchangeSessionMutation,
  PassedLoginAction,
  Session,
  useExchangeSessionMutation,
  User,
  SessionFragmentDoc,
  Repository,
  CurrentUserFragmentDoc
} from "@floro/graphql-schemas/src/generated/main-client-graphql";
import { useDaemonIsConnected, useFloroSocket, useSocketEvent } from "../pubsub/socket";
import { useQueryClient } from "react-query";
import { removeClientSession, setClientSession } from "./client-session";
import { useApolloClient, useFragment } from "@apollo/client";
import { useNavigate, useLocation } from "react-router-dom";
import axios from "axios";
import { useSaveOfflinePhoto } from "../offline/OfflinePhotoContext";
import { useSaveOfflineIcon } from "../offline/OfflineIconsContext";
import { useFloroServerSesionMutation, useFloroServerSessionQuery } from "./session-hooks";

const SessionContext = React.createContext<{
  session: Session | null;
  currentUser: User | null;
  logout: () => void;
  setCurrentUser: (user: User) => void;
}>({
  session: null,
  currentUser: null,
  setCurrentUser: () => null,
  logout: () => null,
});

export interface Props {
  children: React.ReactElement;
  clientType: 'web'|'app';
  env: string;
}

export const SessionProvider = (props: Props) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const navigate = useNavigate();

  const [exchangeSession, { data, loading, reset }] = useExchangeSessionMutation();
  const apolloClient = useApolloClient();
  const queryClient = useQueryClient();
  const savePhoto = useSaveOfflinePhoto();
  const saveIcon = useSaveOfflineIcon();

  const fragmentUser = useFragment({
    fragment: CurrentUserFragmentDoc,
    fragmentName: 'CurrentUser',
    from: {
      id: currentUser?.id,
      __typename: 'User'
    }
  });
  const floroSessionQuery = useFloroServerSessionQuery();
  const floroSessionMutation = useFloroServerSesionMutation();
  const isDaemonConnected = useDaemonIsConnected();
  useEffect(() => {
    if (isDaemonConnected) {
      floroSessionQuery.refetch();
    }
  }, [isDaemonConnected, session]);

  useEffect(() => {
    if (floroSessionQuery?.data) {
      if (!currentUser && floroSessionQuery?.data?.id) {
        setSession(floroSessionQuery?.data as Session);
        setCurrentUser({ ...floroSessionQuery?.data.user } as User);
        setClientSession(floroSessionQuery?.data as Session);
        apolloClient.writeFragment({
          id: 'Session:' + floroSessionQuery?.data?.id,
          fragmentName: 'Session',
          fragment: SessionFragmentDoc,
          data: {
            completed: true
          }
        });
        if (props.clientType == 'app') {
          navigate("/home");
        }
      }
    }
  }, [floroSessionQuery?.data, currentUser]);


  const location = useLocation();
  const logout = useCallback(() => {
    setCurrentUser(null);
    setSession(null);
    removeClientSession();
    apolloClient.clearStore();
    queryClient.resetQueries();
    queryClient.removeQueries(["user-session"])
    reset();
    try {
      // fire and forget
      axios.post("http://localhost:63403/logout", {
        env: props.env
      });
    } catch (e) {
      //dont log
    }
    navigate("/");
  }, [navigate, props.env]);

  useSocketEvent(
    "login",
    (payload: PassedLoginAction) => {
      apolloClient.clearStore();
      queryClient.resetQueries();
      setClientSession(payload.session as Session);
      setSession(payload.session as Session);
      setCurrentUser({ ...payload.user } as User);
      reset();
    },
    [currentUser],
    false
  );

  useSocketEvent(
    "session_updated",
    (payload: ExchangeSessionMutation) => {
      if (payload.exchangeSession) {
        setClientSession(payload.exchangeSession);
        setSession(payload.exchangeSession as Session);
        setCurrentUser(payload.exchangeSession.user as User);
        reset();
      }
    },
    [],
    false
  );

  useSocketEvent(
    "logout",
    () => {
      setCurrentUser(null);
      setSession(null);
      removeClientSession();
      localStorage.clear();
      apolloClient.clearStore();
      queryClient.resetQueries();
      reset();
      navigate("/");
    },
    [navigate, apolloClient, queryClient],
    false
  );

  useEffect(() => {
    try {
      const userString = localStorage.getItem("user");
      const sessionString = localStorage.getItem("session");
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

  useEffect(() => {
    if (session?.user?.id) {
      exchangeSession();
    }
  }, [session?.user?.id])

  const setCurrentUserInStorage = useCallback((user: User) => {
    // should query existing user and relations against cache here
    localStorage.setItem("user", JSON.stringify(user));
    setCurrentUser(user);
  }, []);

  useEffect(() => {
    if (fragmentUser?.data?.id) {
      setCurrentUser(fragmentUser?.data);
      if (fragmentUser?.data?.profilePhoto) {
        savePhoto(fragmentUser?.data?.profilePhoto);
      }
      [
        ...(fragmentUser?.data?.privatePlugins ?? []),
        ...(fragmentUser?.data.publicPlugins ?? []),
      ].forEach((plugin) => {
        if (plugin?.lightIcon) {
          saveIcon(plugin?.lightIcon);
        }
        if (plugin?.darkIcon) {
          saveIcon(plugin?.darkIcon);
        }
        if (plugin?.selectedLightIcon) {
          saveIcon(plugin?.selectedLightIcon);
        }
        if (plugin?.selectedDarkIcon) {
          saveIcon(plugin?.selectedDarkIcon);
        }
        plugin?.versions?.forEach((version) => {
          if (version?.lightIcon) {
            saveIcon(version?.lightIcon);
          }
          if (version?.darkIcon) {
            saveIcon(version?.darkIcon);
          }
          if (version?.selectedLightIcon) {
            saveIcon(version?.selectedLightIcon);
          }
          if (version?.selectedDarkIcon) {
            saveIcon(version?.selectedDarkIcon);
          }
        });
      });
      [
        ...(fragmentUser?.data?.bookmarkedRepositories ?? [])
      ].forEach((repository: Repository) => {
        if (repository.repoType == "user_repo") {
          if (repository?.user?.profilePhoto) {
            savePhoto(repository?.user?.profilePhoto);
          }
        }
        if (repository?.organization?.profilePhoto) {
          savePhoto(repository?.organization?.profilePhoto);
        }
      })

    }
  }, [fragmentUser?.data, savePhoto, saveIcon]);

  useEffect(() => {
    if (data?.exchangeSession?.user) {
      setClientSession(data.exchangeSession);
      setSession(data.exchangeSession);
      return;
    }
    const IGNORE_PATHS = new Set(["/credential/verify", "/credential/auth"]);
    if (IGNORE_PATHS.has(location.pathname) || location.pathname.startsWith('/oauth/')) {
      return;
    }
    if (session && data && !data?.exchangeSession && !loading) {
      // DEAD SESSION TOKEN
      logout();
    }
  }, [data?.exchangeSession, loading, location.pathname, session]);


  useEffect(() => {
    if (props.clientType == "web") {
      return;
    }
    if (session?.clientKey && data?.exchangeSession?.user?.id) {
      floroSessionMutation.mutate({
        session,
        env: props.env
      })
    }
  }, [props?.env, session?.clientKey, data?.exchangeSession?.user?.id, props.clientType])

  return (
    <SessionContext.Provider
      value={{
        session,
        currentUser,
        logout,
        setCurrentUser: setCurrentUserInStorage,
      }}
    >
      {props?.children}
    </SessionContext.Provider>
  );
};

export const useSession = () => {
  return useContext(SessionContext);
};
