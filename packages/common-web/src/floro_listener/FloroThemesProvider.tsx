import React, { useContext} from "react";
import metaFile from "@floro/common-generators/meta.floro.json";
import initThemes from "@floro/common-generators/floro_modules/theme-generator/index";
import {getJSON} from "@floro/generators/theme-generator/src/index";
import { useWatchFloroState } from "./FloroListener";


const FloroThemesContext = React.createContext(initThemes);
export interface Props {
  children: React.ReactElement;
}

export const FloroThemesProvider = (props: Props) => {
  const themes = useWatchFloroState(metaFile.repositoryId, initThemes, getJSON);

  return (
    <FloroThemesContext.Provider value={themes}>
      {props.children}
    </FloroThemesContext.Provider>
  );
};

export const useFloroThemes = () => {
    return useContext(FloroThemesContext);
}