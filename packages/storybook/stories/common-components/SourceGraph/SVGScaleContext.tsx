import React, { createContext, useContext, useCallback } from "react";
import ReactDOM from 'react-dom';

export interface ISVGScaleContext {
  scale: number;
}
const SVGScaleContext = createContext({
  scale: 2,
} as ISVGScaleContext);

interface Props {
  k: number;
  children: React.ReactElement;
}

const SVGScaleProvider = (props: Props) => {
  return (
    <SVGScaleContext.Provider value={{ scale: props.k }}>
      {props.children}
    </SVGScaleContext.Provider>
  );
};


export default SVGScaleProvider;

export const useSvgScale = (deps: Array<unknown> = []) => {
  const ctx = useContext(SVGScaleContext);
  return ctx.scale;
};