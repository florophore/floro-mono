import { Photo } from "@floro/graphql-schemas/src/generated/main-client-graphql";
import React, { useState, useEffect, useCallback, useContext } from "react";

const OfflinePhotoContext = React.createContext<{
  photos: { [key: string]: string };
  savePhoto: (photo: Photo) => void;
}>({
  photos: {},
  savePhoto: (_: Photo) => null,
});
export interface Props {
  children: React.ReactElement;
}
export const OfflinePhotoProvider = (props: Props) => {
  const [photos, setPhotos] = useState({});

  useEffect(() => {
    const photosString = localStorage.getItem("offline-photos") ?? "{}";
    const photos = JSON.parse(photosString);
    setPhotos(photos);
  }, []);

  const savePhoto = useCallback((photo: Photo) => {
    if (photo?.id && photo?.url && !photos[photo.id]) {
      const image = new Image();
      image.crossOrigin = "Anonymous";
      image.onload = function () {
        const canvas = document.createElement("canvas");
        const context = canvas.getContext("2d");
        canvas.height = image.naturalHeight;
        canvas.width = image.naturalWidth;
        context?.drawImage?.(image, 0, 0);
        const dataURL = canvas.toDataURL(
          photo.mimeType === "jpeg" ? "image/jpeg" : "image/png"
        );
        const nextPhotos = {
          ...photos,
          [photo.id as string]: dataURL,
        };
        localStorage.setItem("offline-photos", JSON.stringify(nextPhotos));
        setPhotos(nextPhotos);
      };
      image.src = photo.url;
    }
  }, [photos]);

  return (
    <OfflinePhotoContext.Provider value={{ photos, savePhoto }}>
      {props.children}
    </OfflinePhotoContext.Provider>
  );
};

export const useOfflinePhoto = (photo?: Photo|null) => {
  const offlinePhotosContext = useContext(OfflinePhotoContext);
  if (!photo) {
    return null;
  }
  if (!photo?.id) {
    return null;
  }
  return (offlinePhotosContext?.photos ?? {})?.[photo?.id] ?? null;
};

export const useSaveOfflinePhoto = () => {
  const offlinePhotosContext = useContext(OfflinePhotoContext);
  return offlinePhotosContext.savePhoto;
};