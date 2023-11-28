import React, { createContext, useContext } from "react";
import { useClientStorageApi } from "../floro-schema-api";

export interface IChatGPTContext {
  apiKey: string|null;
  setApiKey: (key: string) => void
}
const ChatGPTContext = createContext({
  apiKey: null,
  setApiKey: (_key: string) => {}
} as IChatGPTContext);

interface Props {
  children: React.ReactElement;
}

const ChatGPTProvider = (props: Props) => {
  const [apiKey, setApiKey] = useClientStorageApi<string>("openai-api-key");
  return (
    <ChatGPTContext.Provider
      value={{
        apiKey,
        setApiKey,
      }}
    >
      {props.children}
    </ChatGPTContext.Provider>
  );
};


export default ChatGPTProvider;

export const useChatGPTContext = () => {
  const ctx = useContext(ChatGPTContext);
  return ctx;
};