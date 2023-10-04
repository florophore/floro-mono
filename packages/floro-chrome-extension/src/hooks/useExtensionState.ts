import { useEffect, useState } from "react";
import { Actions, ExtensionState, state } from "../state/extensionState";
import { useSnapshot, proxy } from "valtio";
//const state = proxy(iState);

const useExtensionState = () => {
  const extensionState = useSnapshot(state);
  console.log("S UP", JSON.stringify(state))

  useEffect(() => {
    if (chrome && chrome.runtime) {
      console.log("S BEFORE", JSON.stringify(state))
      chrome.runtime.sendMessage({ type: Actions.GET_STATE }, (response) => {
        Object.assign(state, response);
        console.log("S ASSIGN", JSON.stringify(state))
      });
      console.log("S", JSON.stringify(state))
      const listener = (changes: {
        [key: string]: chrome.storage.StorageChange;
      }) => {
        const response =
          Object.entries(changes).reduce((acc: any, [key, { newValue }]) => {
            acc[key as keyof ExtensionState] = newValue;
            return acc;
          }, {} as typeof state)

        console.log("R", JSON.stringify(response))
        Object.assign(
          state,
          response
        );
      };

      chrome.storage.onChanged.addListener(listener);
      return () => {
        chrome.storage.onChanged.removeListener(listener);
      };
    }
  }, []);
  console.log("ES", extensionState);

  return extensionState;
};

export default useExtensionState;
