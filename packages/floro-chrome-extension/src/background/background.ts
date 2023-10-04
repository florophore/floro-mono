import { Manager, Socket } from "socket.io-client";
import { Actions, ExtensionState, State, state } from "../state/extensionState";

let socket: Socket | undefined;
let globalState = state;

interface MessageWithoutPayload {
  type: Actions.GET_STATE; //| Actions.GET_BEARER;
  payload?: never;
}

interface MessageWithPayload {
  type: Actions.SET_STATE;
  payload: Partial<ExtensionState>;
}

type Message = MessageWithoutPayload | MessageWithPayload;
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
const attachSocketLiseners = (socket: Socket) => {
  const onConnected = () => {
    Object.assign(globalState, { isDaemonConnected: true });
    chrome.storage.local.set(globalState);
  };
  const onDisconnected = () => {
    Object.assign(globalState, { isDaemonConnected: false });
    chrome.storage.local.set(globalState);
  };

  const events: Array<{ name: string; callback: (...args: any[]) => void }> = [
    { name: "connect", callback: onConnected },
    { name: "disconnect", callback: onDisconnected },
  ];
  for (const { name, callback } of events) {
    socket.on(name, callback);
  }
  socketEvents = events;
};

function manageMessages() {
  chrome.runtime.onMessage.addListener((message: Message, _, sendResponse) => {
    if (message.type === Actions.GET_STATE) {
      sendResponse(globalState);
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
}

(async () => {
  globalState = (await chrome.storage.local.get()) as State;
  socket = createSocket(globalState?.authToken ?? "");
  if (socket) {
    attachSocketLiseners(socket);
  }
})();

/// global listeners
chrome.runtime.onInstalled.addListener(() => {
  chrome.storage.local.set(globalState);
});
manageMessages();
