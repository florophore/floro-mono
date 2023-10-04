import { proxy } from "valtio";

export enum Actions {
  GET_STATE = "get-state",
  SET_STATE = "set-state",
}
export type Action = `${Actions}`;

export interface State {
    authToken: string|null,
    isDaemonConnected: boolean
}

export const state = proxy<State>({
  authToken: null,
  isDaemonConnected: false
});

export type ExtensionState = typeof state;

export const updateState = (payload: Partial<typeof state>) => {
  chrome.runtime.sendMessage({ type: Actions.SET_STATE, payload });
};