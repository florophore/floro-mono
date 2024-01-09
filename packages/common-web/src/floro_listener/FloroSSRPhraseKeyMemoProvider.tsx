import React, { useContext} from "react";

const FloroSSRPhraseKeyMemoContext = React.createContext<Set<string>|null>(null);
export interface Props {
  children: React.ReactElement;
  ssrPhraseKeySet?: Set<string>
}

export const FloroSSRPhraseKeyMemoProvider = (props: Props) => {
  return (
    <FloroSSRPhraseKeyMemoContext.Provider value={props.ssrPhraseKeySet ?? null}>
      {props.children}
    </FloroSSRPhraseKeyMemoContext.Provider>
  );
};

export const useSSRPhraseKeyMemo = () => {
    return useContext(FloroSSRPhraseKeyMemoContext);
}