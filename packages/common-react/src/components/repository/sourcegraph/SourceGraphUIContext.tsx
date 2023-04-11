import React, {
  useState,
  useCallback,
  useMemo,
  useEffect,
  useRef,
  createContext,
  useContext,
} from "react";
import { createPortal } from "react-dom";

interface ISourceGraphUIContext {
  width: number;
  height: number;
  hasLoaded: boolean;
  setWidth: React.Dispatch<
    React.SetStateAction<ISourceGraphUIContext["width"]>
  >;
  setHeight: React.Dispatch<
    React.SetStateAction<ISourceGraphUIContext["height"]>
  >;
  setHasLoaded: React.Dispatch<
    React.SetStateAction<ISourceGraphUIContext["hasLoaded"]>
  >;
  containerRef: React.RefObject<HTMLDivElement>;
  onSourceGraphLoaded: () => void;
}

const SourceGraphUIContext = createContext({
  width: 0,
  height: 0,
  hasLoaded: false,
  setWidth: () => {
    /* null */
  },
  setHeight: () => {
    /* null */
  },
  setHasLoaded: () => {
    /* null */
  },
  onSourceGraphLoaded: () => {
    /* null */
  },
  containerRef: { current: null },
} as ISourceGraphUIContext);

interface Props {
  children: React.ReactElement;
  isExpanded: boolean;
}

export const SourceGraphUIProvider = (props: Props) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [hasLoaded, setHasLoaded] = useState(false);
  const [width, setWidth] = useState(0);
  const [height, setHeight] = useState(0);

  useEffect(() => {
    if (containerRef?.current) {
      const width = containerRef.current.clientWidth;
      const height = containerRef.current.clientHeight;
      setWidth(width);
      setHeight(height);
    }
  }, []);

  useEffect(() => {
    let timeout;
    const onResize = () => {
      if (timeout) {
        clearTimeout(timeout);
      }

      if (!containerRef?.current) {
        return;
      }
      timeout = setTimeout(() => {
        if (containerRef?.current) {
          const width = containerRef.current.clientWidth;
          const height = containerRef.current.clientHeight;
          setWidth(width);
          setHeight(height);
        }
      }, 100);
    };

    window.addEventListener("resize", onResize);
    return () => {
      clearTimeout(timeout);
      window.removeEventListener("resize", onResize);
    };
  }, []);

  const onSourceGraphLoaded = useCallback(() => {
    setHasLoaded(true);
  }, []);

  return (
    <SourceGraphUIContext.Provider
      value={{
        containerRef,
        width,
        height,
        setWidth,
        setHeight,
        hasLoaded,
        setHasLoaded,
        onSourceGraphLoaded,
      }}
    >
      {props.children}
    </SourceGraphUIContext.Provider>
  );
};

export const useSourceGraphUIState = () => {
  return useContext(SourceGraphUIContext);
};

export interface SourceGraphPortalInjectedDependencies {
  width: number;
  height: number;
  hasLoaded: boolean;
  onSourceGraphLoaded: () => void;
}

export const useSourceGraphPortal = (
  callback: (
    portalDeps: SourceGraphPortalInjectedDependencies
  ) => React.ReactElement,
  dependencies: Array<unknown> = []
) => {
  const {
    width,
    height,
    hasLoaded,
    onSourceGraphLoaded,
    containerRef,
    setWidth,
    setHeight,
  } = useSourceGraphUIState();
  const portalDeps = useMemo((): SourceGraphPortalInjectedDependencies => {
    return {
      width,
      height,
      hasLoaded,
      onSourceGraphLoaded,
    };
  }, [width, height, hasLoaded, onSourceGraphLoaded]);
  const reactComponent = useMemo(
    () => callback(portalDeps),
    [...dependencies, portalDeps]
  );

  useEffect(() => {
    if (containerRef?.current) {
        const width = containerRef.current.clientWidth;
        const height = containerRef.current.clientHeight;
        setWidth(width);
        setHeight(height);
    }
  }, []);

  return useMemo(() => {
    if (containerRef.current) {
      return createPortal(reactComponent, containerRef.current);
    }
    return null;
  }, [reactComponent, containerRef.current]);
};
