
import React, { useState, useEffect, useCallback, useContext } from "react";

const OfflineIconsContext = React.createContext<{
  icons: { [key: string]: string };
  saveIcon: (url: string) => void;
}>({
  icons: {},
  saveIcon: (_: string) => null,
});
export interface Props {
  children: React.ReactElement;
}
export const OfflinePhotoProvider = (props: Props) => {
  const [icons, setIcons] = useState({});

  useEffect(() => {
    const iconsString = localStorage.getItem("offline-icons") ?? "{}";
    const icons = JSON.parse(iconsString);
    setIcons(icons);
  }, []);

  const saveIcon = useCallback((url: string) => {
    if (url && !icons[url]) {
      const image = new Image();
      image.crossOrigin = "Anonymous";
      image.onload = function () {
        const canvas = document.createElement("canvas");
        const context = canvas.getContext("2d");
        canvas.height = 128;
        canvas.width = 128;
        context?.drawImage?.(image, 0, 0);
        const dataURL = canvas.toDataURL("image/svg+xml");
        const icons = JSON.parse(localStorage.getItem('offline-icons') ?? "{}")
        const nextIcons = {
          ...icons,
          [url as string]: dataURL,
        };
        localStorage.setItem("offline-icons", JSON.stringify(nextIcons));
        setIcons(nextIcons);
      };
      image.src = url;
    }
  }, []);

  return (
    <OfflineIconsContext.Provider value={{ icons, saveIcon }}>
      {props.children}
    </OfflineIconsContext.Provider>
  );
};

export const useOfflineIcon = (url?: string) => {
  const offlineIconsContext = useContext(OfflineIconsContext);
  if (!url) {
    return null;
  }
  return (offlineIconsContext?.icons ?? {})?.[url] ?? null;
};

export const useOfflinePhotoMap = () => {
  const offlineIconsContext = useContext(OfflineIconsContext);
  return offlineIconsContext?.icons ?? {};
};

export const useSaveOfflineIcon = () => {
  const offlineIconsContext = useContext(OfflineIconsContext);
  return offlineIconsContext.saveIcon;
};