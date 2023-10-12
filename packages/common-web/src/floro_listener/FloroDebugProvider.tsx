import React, { useContext} from "react";
import metaFile from "@floro/common-generators/meta.floro.json";
import { useWatchDebugMode } from "./FloroListener";


const FloroDebugContext = React.createContext<boolean>(false);
export interface Props {
  children: React.ReactElement;
}

export const FloroDebugProvider = (props: Props) => {
  const isDebugMode = useWatchDebugMode();

  return (
    <FloroDebugContext.Provider value={isDebugMode}>
      {props.children}
    </FloroDebugContext.Provider>
  );
};

export const useIsDebugMode = () => {
    return useContext(FloroDebugContext);
}