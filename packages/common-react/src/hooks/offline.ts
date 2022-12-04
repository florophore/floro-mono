import {
  Organization,
  useCurrentUserHomeLazyQuery,
  useCurrentUserHomeQuery,
} from "@floro/graphql-schemas/src/generated/main-client-graphql";
import { useState, useEffect } from "react";
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
