import React, { useContext} from "react";
import metaFile from "@floro/common-generators/meta.floro.json";
import initIcons from '@floro/common-generators/floro_modules/icon-generator/index';
import {getJSON} from "@floro/generators/icon-generator/src/index";
import { useWatchFloroState } from "./FloroListener";


const FloroIconsContext = React.createContext(initIcons);
export interface Props {
  children: React.ReactElement;
}

export const FloroIconsProvider = (props: Props) => {
  const icons = useWatchFloroState(metaFile.repositoryId, initIcons, getJSON);

  return (
    <FloroIconsContext.Provider value={icons}>
      {props.children}
    </FloroIconsContext.Provider>
  );
};

export const useFloroIcons = () => {
    return useContext(FloroIconsContext);
}