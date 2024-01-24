import { createContext, useCallback, useContext, useState } from 'react';
import { useSocketEvent } from '@floro/common-react/src/pubsub/socket';
import { useNavigate } from 'react-router-dom';
import { RepoInfo } from 'floro/dist/src/repo';


const PluginMessageContext = createContext<{
    lastPluginMessage: {plugin: string, repositoryId: string, eventName: string, message: unknown}|null;
    setLastPluginMessage: (_: {plugin: string, repositoryId: string, eventName: string, message: unknown}|null) => void;
    clearLastPluginMessage: () => void;
}>({
    lastPluginMessage: null,
    setLastPluginMessage: () => {},
    clearLastPluginMessage: () => {},
});

interface Props {
    children: React.ReactElement;
}

export const PluginMessageProvider = ({ children}: Props) => {
    const navigate = useNavigate();
    const [lastPluginMessage, setLastPluginMessage] = useState<{plugin: string, repositoryId: string, eventName: string, message: unknown}|null>(null);
    const clearLastPluginMessage = useCallback(() => {
      setLastPluginMessage(null);
    }, []);

    useSocketEvent<{repositoryId: string, plugin: string, repoInfo: RepoInfo, eventName: string, message: unknown}>(
      "plugin:message",
      ({repositoryId, plugin, repoInfo, eventName, message}) => {
        const uri =`/repo/@/${repoInfo.ownerHandle}/${repoInfo.name}?from=local&plugin=text`
        setLastPluginMessage({
          repositoryId,
          plugin,
          eventName,
          message
        })
        navigate(uri);
      },
      [],
      false,
    );

    return (
        <PluginMessageContext.Provider value={{lastPluginMessage, setLastPluginMessage, clearLastPluginMessage}}>
            {children}
        </PluginMessageContext.Provider>
    );
};

export const usePluginMessage = () => {
  return useContext(PluginMessageContext);
}