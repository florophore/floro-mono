import { Repository } from "@floro/graphql-schemas/src/generated/main-client-graphql";
import { useMemo } from "react";
import { useSession } from "../session/session-context";

export const useCurrentUserRepos = () => {
  const { currentUser } = useSession();
  const privateRepositories = useMemo(() => {
    return currentUser?.privateRepositories ?? [];
  }, [currentUser?.privateRepositories]);
  const publicRepositories = useMemo(() => {
    return currentUser?.publicRepositories ?? [];
  }, [currentUser?.publicRepositories]);
  const repositories = useMemo(() => {
    return [...privateRepositories, ...publicRepositories].sort(
      (repoA, repoB) => {
        if (!repoA?.lastRepoUpdateAt && !repoB?.lastRepoUpdateAt) {
          return 0;
        }
        if (!repoA?.lastRepoUpdateAt) {
          return 1;
        }
        if (!repoB?.lastRepoUpdateAt) {
          return -1;
        }
        if (repoA.lastRepoUpdateAt == repoB.lastRepoUpdateAt) {
          return 0;
        }
        if (repoA.lastRepoUpdateAt > repoB.lastRepoUpdateAt) {
          return -1;
        }
        return 1;
      }
    );
  }, [privateRepositories, publicRepositories]);
  return useMemo(
    () => ({
      privateRepositories,
      publicRepositories,
      repositories,
    }),
    [privateRepositories, publicRepositories, repositories]
  );
};
