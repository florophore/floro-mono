import React, { useContext} from "react";
import metaFile from "@floro/common-generators/meta.floro.json";
import initPalette from "@floro/common-generators/floro_modules/palette-generator/index";
import { getJSON } from "@floro/generators/palette-generator/src/index";
import { useWatchFloroState } from "./FloroListener";


const FloroPaletteContext = React.createContext(initPalette);
export interface Props {
  children: React.ReactElement;
}

export const FloroPaletteProvider = (props: Props) => {
  const palette = useWatchFloroState(metaFile.repositoryId, initPalette, getJSON);

  return (
    <FloroPaletteContext.Provider value={palette}>
      {props.children}
    </FloroPaletteContext.Provider>
  );
};

export const useFloroPalette = () => {
    return useContext(FloroPaletteContext);
}