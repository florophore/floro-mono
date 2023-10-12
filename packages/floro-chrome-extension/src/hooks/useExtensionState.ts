import { useEffect } from "react";
import { Actions, ExtensionState, state } from "../state/extensionState";
import { useSnapshot } from "valtio";

const useExtensionState = () => {
  const extensionState = useSnapshot(state);

  useEffect(() => {
    if (chrome && chrome.runtime) {
      chrome.runtime.sendMessage({ type: Actions.GET_STATE }, (response) => {
        Object.assign(state, response);
      });
      const listener = (changes: {
        [key: string]: chrome.storage.StorageChange;
      }) => {
        const response =
          Object.entries(changes).reduce((acc: any, [key, { newValue }]) => {
            acc[key as keyof ExtensionState] = newValue;
            return acc;
          }, {} as typeof state)

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

  return extensionState;
};

export default useExtensionState;
