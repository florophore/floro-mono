import { RepoAnnouncement } from "@floro/graphql-schemas/src/generated/main-client-graphql";
import { createContext, useState, useCallback, useContext, useRef, useEffect } from "react";

interface ICreateAnnouncementsContext {
    onCreateRepoAnnouncement: (callback: (repoAnnouncement: RepoAnnouncement) => void) => void;
    triggerCreateRepoAnnouncement: (repoAnnouncement: RepoAnnouncement) => void;
    removeCallback: (callback: (repoAnnouncement: RepoAnnouncement) => void) => void;
}

const CreateAnnouncementsContext = createContext({
    onCreateRepoAnnouncement: (_) => {
        //void
    },
    triggerCreateRepoAnnouncement: (_) => {
        //void
    },
    removeCallback: (_) => {
        //void
    },
} as ICreateAnnouncementsContext);

interface Props {
    children: React.ReactElement;
}

export const CreateAnnouncementsProvider = (props: Props) => {
    const callbacks = useRef<Array<(repoAnnouncement: RepoAnnouncement) => void>>([]);
    const onCreateRepoAnnouncement = useCallback((callback: (repoAnnouncement: RepoAnnouncement) => void) => {
        callbacks.current.push(callback);
    }, [callbacks?.current]);

    const triggerCreateRepoAnnouncement = useCallback((repoAnnouncement: RepoAnnouncement) => {
        for (const callback of callbacks.current) {
            callback?.(repoAnnouncement);
        }
    }, [callbacks?.current]);

    const removeCallback = useCallback((callback: (repoAnnouncement: RepoAnnouncement) => void) => {
        callbacks.current = callbacks.current.filter(f => f != callback);
    }, [callbacks?.current]);

    const value: ICreateAnnouncementsContext = {
      onCreateRepoAnnouncement,
      triggerCreateRepoAnnouncement,
      removeCallback
    };
    return (
        <CreateAnnouncementsContext.Provider value={value}>
            {props.children}
        </CreateAnnouncementsContext.Provider>
    )
}

export const useCreateAnnouncementsContext = () => {
    return useContext(CreateAnnouncementsContext);
}

export const useSubscribeCreateRepoAnnouncement = (callback: (repoAnnouncement: RepoAnnouncement) => void) => {
    const context = useCreateAnnouncementsContext();

    useEffect(() => {
        context.onCreateRepoAnnouncement(callback);
        return () => {
            context.removeCallback(callback);
        }
    }, [context.onCreateRepoAnnouncement, context.removeCallback, callback])

}