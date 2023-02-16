
import React, { useState, useEffect, useCallback, useContext } from "react";
import axios from 'axios';

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
export const OfflineIconProvider = (props: Props) => {
  const [icons, setIcons] = useState({});

  useEffect(() => {
    const iconsString = localStorage.getItem("offline-icons") ?? "{}";
    const icons = JSON.parse(iconsString);
    setIcons(icons);
  }, []);

  const saveIcon = useCallback((url: string) => {
    if (url && !icons[url]) {
      axios.get(url).then((response) => {
        if (response.status == 200) {
          const decoded = unescape(encodeURIComponent(response.data));
          const base64 = btoa(decoded);
          const icons = JSON.parse(localStorage.getItem('offline-icons') ?? "{}")
          const nextIcons = {
            ...icons,
            [url as string]: `data:image/svg+xml;base64,${base64}`,
          };
          localStorage.setItem("offline-icons", JSON.stringify(nextIcons));
          setIcons(nextIcons);
        }
      })
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

export const useOfflineIconMap = () => {
  const offlineIconsContext = useContext(OfflineIconsContext);
  return offlineIconsContext?.icons ?? {};
};

export const useSaveOfflineIcon = () => {
  const offlineIconsContext = useContext(OfflineIconsContext);
  return offlineIconsContext.saveIcon;
};