import React, { createContext, useContext, useCallback } from "react";
import ReactDOM from 'react-dom';

export interface ISVGPortalContext {
  portal: SVGGElement | null;
}
const SVGPortalContext = createContext({
  portal: null,
} as ISVGPortalContext);

interface Props {
  portal: SVGGElement | null;
  children: React.ReactElement;
}

const SVGPortalProvider = (props: Props) => {
  return (
    <SVGPortalContext.Provider value={{ portal: props.portal }}>
      {props.children}
    </SVGPortalContext.Provider>
  );
};


export default SVGPortalProvider;

export const useSvgSourceGraphPortal = (deps: Array<unknown> = []) => {
  const ctx = useContext(SVGPortalContext);
  return useCallback(
    (children: React.ReactElement) => {
      if (!ctx.portal) {
        return null;
      }
      return ReactDOM.createPortal(children, ctx.portal);
    },
    [ctx.portal, ...deps]
  );
};