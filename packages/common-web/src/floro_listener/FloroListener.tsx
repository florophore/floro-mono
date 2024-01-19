import { useEffect, useState } from "react";
import metaFile from "@floro/common-generators/meta.floro.json";

export const useWatchDebugMode = (): boolean => {
  const [isEditMode, setIsEditMode] = useState<boolean>(false);
  const [isDebugMode, setIsDebugMode] = useState<boolean>(false);
  useEffect(() => {
    const onToggleEditMode = ({ detail: isEditMode }: CustomEvent<boolean>) => {
      setIsEditMode(isEditMode);
    };
    window.addEventListener(
      "floro:toggle-edit-mode",
      onToggleEditMode as EventListenerOrEventListenerObject
    );
    const onToggleDebugMode = ({
      detail: isDebugMode,
    }: CustomEvent<boolean>) => {
      setIsDebugMode(isDebugMode);
    };
    window.addEventListener(
      "floro:toggle-debug-mode",
      onToggleDebugMode as EventListenerOrEventListenerObject
    );
    window.dispatchEvent(new CustomEvent("floro:ready"));
    return () => {
      window.removeEventListener(
        "floro:toggle-edit-mode",
        onToggleEditMode as EventListenerOrEventListenerObject
      );
      window.removeEventListener(
        "floro:toggle-debug-mode",
        onToggleDebugMode as EventListenerOrEventListenerObject
      );
    };
  }, []);
  return isEditMode && isDebugMode;
};

export const useWatchFloroState = <T, U, K>(
  repositoryId: string,
  initState: T,
  getJSON?: <T>(
    s: K,
    _?: U,
    m?: "build" | "hot" | "live-update",
    f?: (ref: string) => Promise<string>
  ) => Promise<T>
): T => {
  const [state, setState] = useState<T>(initState);
  const [isEditMode, setIsEditMode] = useState<boolean>(false);

  useEffect(() => {
    const onLaunchContentScript = () => {
      const registerEvent = new CustomEvent("floro:module:register", {
        detail: metaFile,
      });
      window.dispatchEvent(registerEvent);
    };
    window.addEventListener(
      "floro:content-script:launched",
      onLaunchContentScript
    );
    let debounce: NodeJS.Timeout;
    const onUpdate = ({
      detail,
    }: CustomEvent<{
      repoId: string;
      binaries: Array<{ fileName: string; url: string; store: K }>;
      store: K;
    }>) => {
      if (detail.repoId != repositoryId) {
        return;
      }
      const assetAcessor = async (binaryRef: string): Promise<string> => {
        try {
          const url = detail.binaries.find(
            (b: { fileName: string }) => b.fileName == binaryRef
          )?.url as string;
          const xhr = new XMLHttpRequest();
          return await new Promise((resolve, reject) => {
            xhr.open("GET", url);
            xhr.onerror = function (e) {
              reject(e);
            };
            xhr.onreadystatechange = function (e) {
              if (xhr.readyState === XMLHttpRequest.DONE) {
                const status = xhr.status;
                if (status === 0 || (status >= 200 && status < 400)) {
                  resolve(xhr.response);
                } else {
                  reject(e);
                }
              }
            };
            xhr.send();
          });
        } catch (e) {
          return "";
        }
      };
      clearTimeout(debounce);
      debounce = setTimeout(async () => {
        if (getJSON) {
          const nextState = (await getJSON(
            detail.store,
            undefined as U,
            "hot",
            assetAcessor
          )) as T;
          setState(nextState);
        }
      }, 100);
    };
    window.addEventListener(
      "floro:update-state",
      onUpdate as EventListenerOrEventListenerObject
    );
    const onToggleEditMode = ({ detail: isEditMode }: CustomEvent<boolean>) => {
      setIsEditMode(isEditMode);
    };
    window.addEventListener(
      "floro:toggle-edit-mode",
      onToggleEditMode as EventListenerOrEventListenerObject
    );
    return () => {
      clearTimeout(debounce);
      window.removeEventListener(
        "floro:content-script:launched",
        onLaunchContentScript
      );
      window.removeEventListener(
        "floro:update-state",
        onUpdate as EventListenerOrEventListenerObject
      );
      window.removeEventListener(
        "floro:toggle-edit-mode",
        onToggleEditMode as EventListenerOrEventListenerObject
      );
    };
  }, [repositoryId, getJSON]);
  return isEditMode ? state : initState;
};
