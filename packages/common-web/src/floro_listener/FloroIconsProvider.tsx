import React, { useContext, useMemo} from "react";
import metaFile from "@floro/common-generators/meta.floro.json";
import initIcons from '@floro/common-generators/floro_modules/icon-generator/index';
import {getJSON} from "@floro/generators/icon-generator/src/index";
import { useWatchFloroState } from "./FloroListener";
import { Icons } from "@floro/common-generators/floro_modules/icon-generator/types";
import { useTheme } from "@emotion/react";


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


export const useIcon = <T extends keyof Icons>  (key: T, variant?: string): string => {
    const theme = useTheme();
    const icons = useFloroIcons()
    return useMemo(() => {
      if (variant && icons[key].variants[variant]) {
        return icons[key].variants[variant][theme.name];
      }
      return icons[key].default?.[theme.name];
    }, [icons, theme.name, variant]);
}