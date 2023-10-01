import React, { createContext, useContext } from "react";
import { useClientStorageApi } from "../floro-schema-api";

export interface IDeepLContext {
  apiKey: string|null;
  isFreePlan: boolean;
  setApiKey: (key: string) => void
  setIsFreePlan: (_: boolean) => void
}
const DeepLContext = createContext({
  apiKey: null,
  isFreePlan: true,
  setApiKey: (_key: string) => {}
} as IDeepLContext);

interface Props {
  children: React.ReactElement;
}

const DeepLProvider = (props: Props) => {

  const [apiKey, setApiKey] = useClientStorageApi<string>("deep-l-api-key");
  const [isFreePlan, setIsFreePlan] = useClientStorageApi<boolean>("deep-l-is-free-plan");
  return (
    <DeepLContext.Provider
      value={{
        apiKey,
        isFreePlan: isFreePlan ?? true,
        setIsFreePlan,
        setApiKey,
      }}
    >
      {props.children}
    </DeepLContext.Provider>
  );
};


export default DeepLProvider;

export const useDeepLContext = () => {
  const ctx = useContext(DeepLContext);
  return ctx;
};