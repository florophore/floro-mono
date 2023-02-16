import {
  Organization,
  useCurrentUserHomeLazyQuery,
  useCurrentUserHomeQuery,
} from "@floro/graphql-schemas/src/generated/main-client-graphql";
import { useState, useEffect } from "react";
import { useSaveOfflineIcon } from "../offline/OfflineIconsContext";
import { useSaveOfflinePhoto } from "../offline/OfflinePhotoContext";
import { useSession } from "../session/session-context";

export const useIsOnline = () => {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  useEffect(() => {
    const onOnline = () => setIsOnline(true);
    const onOffline = () => setIsOnline(false);
    window.addEventListener("online", onOnline);
    window.addEventListener("offline", onOffline);
    return () => {
      window.removeEventListener("online", onOnline);
      window.removeEventListener("offline", onOffline);
    };
  }, []);
  return isOnline;
};

export const useUserOrganizations = () => {
  const savePhoto = useSaveOfflinePhoto();
  const saveIcon = useSaveOfflineIcon();
  const { currentUser, setCurrentUser } = useSession();
  const [fetchOrganizations, { data, loading, error }] =
    useCurrentUserHomeLazyQuery();
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const isOnline = useIsOnline();

  useEffect(() => {
    if (currentUser?.id && isOnline) {
      fetchOrganizations();
    }
  }, [currentUser?.id, isOnline]);

  useEffect(() => {
    if (data?.currentUser?.__typename == "User") {
      data?.currentUser?.organizations?.forEach((organization) => {
        if (organization?.profilePhoto) {
          savePhoto(organization?.profilePhoto);
        }
      });
      data?.currentUser?.organizations?.forEach((organization) => {
        [
          ...(organization?.privatePlugins ?? []),
          ...(organization?.publicPlugins ?? []),
        ].forEach((plugin) => {
          if (plugin?.lightIcon) {
            saveIcon(plugin?.lightIcon);
          }
          if (plugin?.darkIcon) {
            saveIcon(plugin?.darkIcon);
          }
          if (plugin?.selectedLightIcon) {
            saveIcon(plugin?.selectedLightIcon);
          }
          if (plugin?.selectedDarkIcon) {
            saveIcon(plugin?.selectedDarkIcon);
          }
          plugin?.versions?.forEach((version) => {
            if (version?.lightIcon) {
              saveIcon(version?.lightIcon);
            }
            if (version?.darkIcon) {
              saveIcon(version?.darkIcon);
            }
            if (version?.selectedLightIcon) {
              saveIcon(version?.selectedLightIcon);
            }
            if (version?.selectedDarkIcon) {
              saveIcon(version?.selectedDarkIcon);
            }
          });
        });
      });
      setCurrentUser(data?.currentUser ?? currentUser);
      setOrganizations(
        (data?.currentUser?.organizations ?? []) as Organization[]
      );
      const organizationsString = JSON.stringify(
        data?.currentUser?.organizations
      );
      localStorage.setItem("offline-organizations", organizationsString);
    }
  }, [data]);

  useEffect(() => {
    if (currentUser?.id) {
      const organizationsString = localStorage.getItem("offline-organizations");
      if (organizationsString) {
        try {
          const orgs = JSON.parse(organizationsString);
          setOrganizations(orgs);
        } catch (e) {
          // nothing
        }
      }
    }
  }, [currentUser?.id]);

  return organizations;
};
