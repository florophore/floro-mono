import React, {
  useState,
  createContext,
  useContext,
  useRef,
  useCallback,
  useEffect,
} from "react";
import FocusView from "./FocusView";
import {
  PointerTypes,
  containsDiffable,
  useFloroContext,
  useHasIndication,
} from "../floro-schema-api";
import styled from "@emotion/styled";

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
  overflow-y: scroll;
  padding-top: 100px;
  padding-bottom: 120px;
  box-sizing: border-box;
  padding-left: 24px;
  padding-right: 48px;
`;

export interface IFocusContext {
  showFocus: boolean;
  focusPhraseRef:
    | PointerTypes["$(text).phraseGroups.id<?>.phrases.id<?>"]
    | null;
  setShowFocus: (_: boolean) => void;
  setFocusPhraseRef: (
    _: PointerTypes["$(text).phraseGroups.id<?>.phrases.id<?>"] | null
  ) => void;
  focusPortal: React.RefObject<HTMLDivElement> | null;
  focusScroll: React.RefObject<HTMLDivElement> | null;
  onCloseFocus: () => void;
}

const FocusContext = createContext({
  showFocus: false,
  focusPhraseRef: null,
  setFocusPhraseRef: (
    _: PointerTypes["$(text).phraseGroups.id<?>.phrases.id<?>"] | null
  ) => {},
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
  const [focusPhraseRef, setFocusPhraseRef] =
    useState<PointerTypes["$(text).phraseGroups.id<?>.phrases.id<?>"] | null>(
      null
    );
  const focusPortal = useRef<HTMLDivElement>(null);
  const focusScroll = useRef<HTMLDivElement>(null);

  const onCloseFocus = useCallback(() => {
    setFocusPhraseRef(null);
    setShowFocus(false);
  }, []);

  useEffect(() => {
    if (showFocus && commandMode == "compare" && focusPhraseRef) {
      const hasConflict = containsDiffable(conflictSet, focusPhraseRef, true);
      const hasChange = containsDiffable(changeset, focusPhraseRef, true);
      if (!hasChange && !hasConflict) {
        onCloseFocus();
      }
    }
  }, [commandMode, focusPhraseRef, showFocus, changeset, conflictSet]);
  return (
    <FocusContext.Provider
      value={{
        showFocus,
        setShowFocus,
        focusPortal,
        focusScroll,
        focusPhraseRef,
        setFocusPhraseRef,
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
        <div ref={focusPortal}></div>
      </OuterContainer>
    </FocusContext.Provider>
  );
};

export default FocusContext;

export const useFocusContext = () => {
  const ctx = useContext(FocusContext);
  return ctx;
};
