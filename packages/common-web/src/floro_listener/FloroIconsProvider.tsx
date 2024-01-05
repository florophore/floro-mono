import React, { useContext, useMemo} from "react";
import metaFile from "@floro/common-generators/meta.floro.json";
import initIcons from '@floro/common-generators/floro_modules/icon-generator/index';
import {getJSON} from "@floro/icon-generator";
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


export const useIcon = <
  T extends keyof Icons,
  K extends Icons[T],
  V extends K["variants"]
>(
  key: T,
  variant?: string & keyof V
): string => {
  const theme = useTheme();
  const icons = useFloroIcons();
  return useMemo(() => {
    const icon = icons[key] as Icons[T];
    if (variant && icon?.variants && icon.variants[variant as string]) {
      const variantValues = icon.variants[variant as string];
      return variantValues[theme.name];
    }
    return icons[key].default?.[theme.name];
  }, [icons, theme.name, variant]);
};