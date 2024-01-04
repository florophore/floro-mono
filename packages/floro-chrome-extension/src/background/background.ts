import { Manager, Socket } from "socket.io-client";
import { Actions, ExtensionState, State, state } from "../state/extensionState";

let socket: Socket | undefined;
let globalState = state;

interface MessageWithoutPayload {
  type: Actions.GET_STATE;
  payload?: never;
}

interface MessageWithTabState {
  type: Actions.GET_TAB_STATE;
  payload?: never;
}

interface MessageWithPayload {
  type: Actions.SET_STATE;
  payload: Partial<ExtensionState>;
}

interface MessageWithPayload {
  type: Actions.SET_STATE;
  payload: Partial<ExtensionState>;
}

interface MessageWithMetaFile {
  type: Actions.REGISTER_MODULE;
  metaFile: {
    repositoryId: string
  }
}

interface MessageWithEditMode {
  type: Actions.SET_EDIT_MODE;
  isEditMode: boolean;
}

interface MessageWithDebugMode {
  type: Actions.SET_DEBUG_MODE;
  isDebugMode: boolean;
}

type Message = MessageWithoutPayload | MessageWithPayload | MessageWithMetaFile | MessageWithEditMode | MessageWithDebugMode | MessageWithTabState;
export const createSocket = (authorizationKey: string) => {
  try {
    const manager = new Manager("ws://localhost:63403", {
      transports: ["websocket"],
      reconnectionDelayMax: 10000,
      query: {
        client: "extension",
        authorization: authorizationKey,
      },
    });
    return manager.socket("/");
  } catch (e) {
    return undefined;
  }
};

let socketEvents: Array<{ name: string; callback: (...args: any[]) => void }> =
  [];

const detachSocketLiseners = (socket: Socket) => {
  for (const { name, callback } of socketEvents) {
    socket.off(name, callback);
  }
  socketEvents = [];
};
const attachSocketLiseners = async (socket: Socket) => {
  const onConnected = async () => {
    Object.assign(globalState, { isDaemonConnected: true });
    chrome.storage.local.set(globalState);

    try {
      const repoIdsRequest = await fetch('http://localhost:63403/repos', {
        headers: {
          authorization: globalState.authToken,
        }
      });
      const reposJson = await repoIdsRequest?.json();
      const localeRepoIds = reposJson.repos;
      Object.assign(globalState, { localeRepoIds });
      chrome.storage.local.set(globalState);
    } catch(e) {
      Object.assign(globalState, { localeRepoIds: [] });
      chrome.storage.local.set(globalState);
    }
  };
  const onDisconnected = () => {
    Object.assign(globalState, { isDaemonConnected: false });
    chrome.storage.local.set(globalState);
  };

  const onStateChanged = (args) => {
    for (const tabId in globalState.tabMetaFiles) {
      const intTabId = parseInt(tabId);
      if (globalState.tabMetaFiles[tabId] && globalState.tabMetaFiles[tabId].includes(args.repoId)) {
        chrome.tabs.sendMessage(intTabId, {type: 'update:state', update: args});
      }
    }
  };
  const onReposChanges = (args) => {
    const localeRepoIds = args.repos;
    Object.assign(globalState, { localeRepoIds });
    chrome.storage.local.set(globalState);
  }

  const events: Array<{ name: string; callback: (...args: any[]) => void }> = [
    { name: "connect", callback: onConnected },
    { name: "disconnect", callback: onDisconnected },
    { name: "state:changed", callback: onStateChanged },
    { name: "update:repos", callback: onReposChanges },
  ];
  for (const { name, callback } of events) {
    socket.on(name, callback);
  }
  socketEvents = events;
};

function manageMessages() {
  try {

    chrome.runtime.onMessage.addListener((message: Message, sender, sendResponse) => {
      if (message.type == Actions.REGISTER_MODULE) {
        const tabId = sender.tab.id;
        if (tabId) {
          if (!globalState.tabPopupState[tabId]) {
            globalState.tabPopupState[tabId] = {
              isEditMode: false,
              isDebugMode: false
            }
            Object.assign(globalState, { tabPopupState: globalState.tabPopupState});
            chrome.storage.local.set(globalState);
          }
          if (!globalState.tabMetaFiles[tabId]) {
            globalState.tabMetaFiles[tabId] = [];
          }
          const listeningRepositoryIds = globalState.tabMetaFiles[tabId];
          if (!listeningRepositoryIds.includes(message.metaFile.repositoryId)) {
            globalState.tabMetaFiles[tabId].push(message.metaFile.repositoryId);
            Object.assign(globalState, { tabMetaFiles: globalState.tabMetaFiles});
            chrome.storage.local.set(globalState);
          }
        }
        return true;
      }
      if (message.type == Actions.SET_EDIT_MODE) {
        const tabId = globalState.activeTabId;
        if (tabId) {
          globalState.tabPopupState[tabId] = {
            isEditMode: message.isEditMode,
            isDebugMode: globalState.tabPopupState[tabId].isDebugMode,
          };
          chrome.storage.local.set({...globalState});
          chrome.tabs.sendMessage(parseInt(tabId), {type: 'toggle:edit_mode', isEditMode: message.isEditMode});
          if (message.isEditMode) {
            // send message to floro to send state
            for (const repositoryId of globalState.tabMetaFiles[tabId]) {
              // send message to trigger init state update
              (async () => {
                try {
                  await fetch(`http://localhost:63403/repo/${repositoryId}/watch/update`, {
                    method: 'POST',
                    headers: {
                      authorization: globalState.authToken,
                    }
                  });
                } catch(e) {}
              })();
            }
          }
        }
        return false;
      }

      if (message.type == Actions.SET_DEBUG_MODE) {
        const tabId = globalState.activeTabId;
        if (tabId) {
          globalState.tabPopupState[tabId] = {
            isEditMode: globalState.tabPopupState[tabId].isEditMode,
            isDebugMode: message.isDebugMode,
          };
          chrome.storage.local.set({...globalState});
          chrome.tabs.sendMessage(parseInt(tabId), {type: 'toggle:debug_mode', isDebugMode: message.isDebugMode});
        }
        return false;
      }

      if (message.type === Actions.GET_STATE) {
        sendResponse(globalState);
        return true;
      }
      if (message.type === Actions.GET_TAB_STATE) {
        const tabId = globalState.activeTabId;
        const tabState = globalState.tabPopupState[tabId] ?? { isEditMode: false, isDebugMode: false};
        if (tabState.isEditMode) {
            for (const repositoryId of globalState.tabMetaFiles[tabId]) {
              // send message to trigger init state update
              (async () => {
                try {
                  await fetch(`http://localhost:63403/repo/${repositoryId}/watch/update`, {
                    method: 'POST',
                    headers: {
                      authorization: globalState.authToken,
                    }
                  });
                } catch(e) {}
              })();
            }
        }
        sendResponse({type: "get-tab-state-response", tabState});
        return true;
      }

      if (message.type === Actions.SET_STATE) {
        Object.assign(globalState, message.payload);
        chrome.storage.local.set(globalState);
        return undefined;
      }
      return true;
    });

    chrome.storage.onChanged.addListener(async (message) => {
      if (!!message.authToken) {
        if (socket) {
          detachSocketLiseners(socket);
          socket.close();
          socket.disconnect();
          socket = undefined;
        }
        socket = createSocket(message?.authToken.newValue ?? "");
        if (socket) {
          attachSocketLiseners(socket);
        }
      }
    });

    chrome.tabs.onActivated.addListener(function(activeInfo) {
      Object.assign(globalState, { activeTabId: activeInfo.tabId });
      chrome.storage.local.set(globalState);
      return false;
    });
    function removeTab(tabId) {
      if (globalState.tabMetaFiles[tabId]) {
        const tabMetaFile = globalState.tabMetaFiles[tabId];
        delete globalState.tabMetaFiles[tabId];
        Object.assign(globalState, { tabMetaFile: tabMetaFile });
        chrome.storage.local.set(globalState);
        const tabPopupState = globalState.tabPopupState[tabId];
        delete globalState.tabPopupState[tabId];
        Object.assign(globalState, { tabPopupState });
        chrome.storage.local.set(globalState);
        const tabHostPages = globalState.tabHostPages[tabId];
        delete globalState.tabHostPages[tabId];
        Object.assign(globalState, { tabHostPages });
        chrome.storage.local.set(globalState);
      }

    }
    chrome.tabs.onRemoved.addListener(function(tabId) {
      removeTab(tabId);
      return false;
    });
    chrome.tabs.onUpdated.addListener(async function(tabId) {
      if (globalState.tabMetaFiles[tabId]) {
        const tab = await chrome.tabs.get(tabId)
        const url = new URL(tab.url);
        const host = url.host;
        const exitingHost = globalState.tabHostPages?.[tabId];
        if (!exitingHost) {
          if (typeof globalState.tabHostPages != "object") {
            globalState.tabHostPages = {};
          }
          globalState.tabHostPages[tabId] = host;
          chrome.storage.local.set(globalState);
          return true;
        }
        if (exitingHost != host) {
          removeTab(tabId);
          return false;
        }
      }
      return false;
    });
  } catch(e) {
    console.log("E", e)
  }
}

(async () => {
  try {
    globalState = (await chrome.storage.local.get()) as State;
    socket = createSocket(globalState?.authToken ?? "");
    if (socket) {
      attachSocketLiseners(socket);
    }
    chrome.tabs.query({ active: true, currentWindow: true}, (tabs) => {
      const activeTab = tabs[0];
      if (activeTab?.id) {
        Object.assign(globalState, { activeTabId: activeTab?.id });
        chrome.storage.local.set(globalState);
      }
    });
  } catch(e) {
    console.log("E", e);
  }
})();

/// global listeners
chrome.runtime.onInstalled.addListener(() => {
  chrome.storage.local.set(globalState);
});
manageMessages();
