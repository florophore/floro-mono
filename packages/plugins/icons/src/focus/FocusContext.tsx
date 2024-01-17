import React, {
  useState,
  createContext,
  useContext,
  useRef,
  useCallback,
  useEffect,
  useMemo
} from "react";
import {
  PointerTypes,
  QueryTypes,
  containsDiffable,
  useFloroContext,
  useHasIndication,
} from "../floro-schema-api";
import styled from "@emotion/styled";
import { useTheme } from "@emotion/react";

import CrossLight from "@floro/common-assets/assets/images/icons/cross.light.svg";
import CrossDark from "@floro/common-assets/assets/images/icons/cross.dark.svg";

const OuterContainer = styled.div`
  top: 0;
  left: 0;
  width: 100%;
  position: absolute;
  padding: 24px;
  z-index: 4;
  transition: opacity 300ms;
  background: ${(props) => props.theme.background};
  height: calc(100% - 72px);
  padding-top: 100px;
  padding-bottom: 120px;
  box-sizing: border-box;
  padding-left: 24px;
  padding-right: 48px;
`;

const CrossIcon = styled.img`
  height: 40px;
  width: 40px;
  top: 24px;
  right: 48px;
  cursor: pointer;
  position: absolute;
`;

export interface IFocusContext {
  showFocus: boolean;
  setShowFocus: (_: boolean) => void;
  focusPortal: React.RefObject<HTMLDivElement> | null;
  focusScroll: React.RefObject<HTMLDivElement> | null;
  onCloseFocus: () => void;
}

const FocusContext = createContext({
  showFocus: false,
  setShowFocus: (_: boolean) => {},
  onCloseFocus: () => {},
  focusPortal: null,
  focusScroll: null,
} as IFocusContext);

interface Props {
  children: React.ReactElement;
}

export const FocusProvider = (props: Props) => {
  const { commandMode, changeset, conflictSet } = useFloroContext();
  const [showFocus, setShowFocus] = useState<boolean>(false);
  const focusPortal = useRef<HTMLDivElement>(null);
  const focusScroll = useRef<HTMLDivElement>(null);

  const theme = useTheme();

  const crossIcon = useMemo(() => {
    if (theme.name == "light") {
      return CrossLight;
    }
    return CrossDark;

  }, [theme.name])

  const onCloseFocus = useCallback(() => {
    setShowFocus(false);
  }, []);

  useEffect(() => {
    if (showFocus && commandMode == "compare") {
      onCloseFocus();
    }
  }, [commandMode, showFocus, changeset, conflictSet]);
  return (
    <FocusContext.Provider
      value={{
        showFocus,
        setShowFocus,
        focusPortal,
        focusScroll,
        onCloseFocus,
      }}
    >
      {props.children}
      <OuterContainer ref={focusScroll}
        style={{
          opacity: showFocus ? 1 : 0,
          pointerEvents: showFocus ? "all" : "none",
        }}
      >
        <div style={{
          display: 'flex',
          height: '100%',
          width: '100%',
          justifyContent: 'center',
          alignItems: 'center',

        }} ref={focusPortal}></div>
        <CrossIcon onClick={onCloseFocus} src={crossIcon}/>
      </OuterContainer>
    </FocusContext.Provider>
  );
};

export default FocusContext;

export const useFocusContext = () => {
  const ctx = useContext(FocusContext);
  return ctx;
};
