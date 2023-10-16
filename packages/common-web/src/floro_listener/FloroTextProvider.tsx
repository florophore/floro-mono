import React, { useContext} from "react";
import metaFile from "@floro/common-generators/meta.floro.json";
import initText, { LocalizedPhrases } from "@floro/common-generators/floro_modules/text-generator";
import { getJSON } from "@floro/generators/text-generator/src/index";
import { useWatchFloroState } from "./FloroListener";


const FloroTextContext = React.createContext(initText);
export interface Props {
  children: React.ReactElement;
  text: LocalizedPhrases;
}

export const FloroTextProvider = (props: Props) => {
  const text = useWatchFloroState(metaFile.repositoryId, props.text ?? initText, getJSON);
  return (
    <FloroTextContext.Provider value={text}>
      {props.children}
    </FloroTextContext.Provider>
  );
};

export const useFloroText = () => {
    return useContext(FloroTextContext);
}