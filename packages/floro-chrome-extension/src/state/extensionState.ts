import { proxy } from "valtio";

export enum Actions {
  GET_STATE = "get-state",
  GET_TAB_STATE = "get-tab-state",
  SET_STATE = "set-state",
  REGISTER_MODULE = "register-module",
  SET_EDIT_MODE = "set-edit-mode",
  SET_DEBUG_MODE = "set-debug-mode",
}
export type Action = `${Actions}`;

export interface State {
  authToken: string | null;
  activeTabId: string | null;
  isDaemonConnected: boolean;
  localeRepoIds: string[],
  tabMetaFiles: {
    [tabId: number]: Array<string>;
  };
  tabPopupState: {
    [tabId: number]: {
      isEditMode: boolean,
      isDebugMode: boolean
    };
  }
  tabHostPages: {
    [tabId: number]: string;
  };
}

export const state = proxy<State>({
  authToken: null,
  activeTabId: null,
  isDaemonConnected: false,
  localeRepoIds: [],
  tabMetaFiles: {},
  tabPopupState: {},
  tabHostPages: {}
});

export type ExtensionState = typeof state;

export const updateState = (payload: Partial<typeof state>) => {
  chrome.runtime.sendMessage({ type: Actions.SET_STATE, payload });
};

export const updateEditMode = (isEditMode: boolean) => {
  chrome.runtime.sendMessage({ type: Actions.SET_EDIT_MODE, isEditMode });
};

export const updateDebugMode = (isDebugMode: boolean) => {
  chrome.runtime.sendMessage({ type: Actions.SET_DEBUG_MODE, isDebugMode });
};