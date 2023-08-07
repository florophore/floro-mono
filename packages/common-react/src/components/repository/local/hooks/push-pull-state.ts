import { FetchInfo, RepoState } from "floro/dist/src/repo";
import { useMemo } from "react";
import { useIsOnline } from "../../../../hooks/offline";

export const usePushButtonEnabled = (
  fetchInfo: FetchInfo | null | undefined,
  isPushLoading: boolean
) => {
  const isOnline = useIsOnline();
  return useMemo(() => {
    if (isPushLoading) {
      return false;
    }
    if (!isOnline) {
      return false;
    }
    if (fetchInfo?.fetchFailed) {
      return false;
    }
    return fetchInfo?.canPushBranch ?? false;
  }, [
    isOnline,
    isPushLoading,
    fetchInfo?.canPushBranch,
    fetchInfo?.fetchFailed,
  ]);
};

export const usePushButtonSubTitle = (
  fetchInfo: FetchInfo | null | undefined,
  isFetchLoading: boolean,
  repoState: RepoState
) => {
  const isOnline = useIsOnline();
  return useMemo((): string | null => {
    if (!repoState?.branch) {
      return ("(not on branch)")
    }

    if (!fetchInfo) {
      return null;
    }

    if (!isOnline && fetchInfo.canPushBranch) {
      return "(offline)";
    }

    if (fetchInfo?.fetchFailed) {
      return "(fetch failed)";
    }

    if (fetchInfo.hasOpenMergeRequestConflict) {
      return "(merge request conflict)";
    }

    if (fetchInfo.branchPushDisabled) {
      return "(branch push disabled)";
    }

    if (fetchInfo.containsDevPlugins) {
      return "(cannot push dev plugins)";
    }

    if (!fetchInfo.userHasPermissionToPush) {
      return "(no push permission)";
    }

    if (fetchInfo.baseBranchRequiresPush) {
      return "(push base branch first)";
    }

    if (fetchInfo.hasConflict) {
      return "(remote conflict. force push required)";
    }

    if (fetchInfo.remoteAhead) {
      return "(remote ahead. force push required)";
    }

    if (fetchInfo.nothingToPush) {
      return "(nothing to push)";
    }

    if (fetchInfo?.hasRemoteBranchCycle) {
      return "(remote branch cycle found!)";
    }

    if (fetchInfo?.hasUnreleasedPlugins) {
      return "(cannot push un-released plugins)";
    }

    if (fetchInfo?.hasInvalidPlugins) {
      return "(cannot push invalid plugins)";
    }

    return null;
  }, [
    isOnline,
    isFetchLoading,
    repoState?.branch,
    fetchInfo?.fetchFailed,
    fetchInfo?.canPushBranch,
    fetchInfo?.branchPushDisabled,
    fetchInfo?.containsDevPlugins,
    fetchInfo?.baseBranchRequiresPush,
    fetchInfo?.userHasPermissionToPush,
    fetchInfo?.nothingToPush,
    fetchInfo?.hasConflict,
    fetchInfo?.hasInvalidPlugins,
    fetchInfo?.hasUnreleasedPlugins,
    fetchInfo?.hasRemoteBranchCycle,
  ]);
};

export const usePullButtonSubTitle = (
  fetchInfo: FetchInfo | null | undefined,
  isWIP: boolean,
  isFetchLoading: boolean,
  repoState: RepoState
) => {
  const isOnline = useIsOnline();
  return useMemo((): string | null => {
    if (!repoState?.branch) {
      return ("(not on branch)")
    }

    if (!fetchInfo) {
      return null;
    }

    if (!isOnline && fetchInfo.canPull) {
      return "(offline)";
    }

    if (fetchInfo?.hasLocalBranchCycle) {
      return "(local branch cycle found!)";
    }

    if (fetchInfo?.fetchFailed) {
      return "(fetch failed)";
    }

    if (fetchInfo?.nothingToPull) {
      return "(nothing to pull)";
    }

    if (fetchInfo.pullCanMergeWip && fetchInfo?.canPull) {
      if (isWIP) {
        return "(will merge wip)";
      }
      return "(safe to pull)";
    }

    if (fetchInfo.hasConflict) {
      if (isWIP) {
        return "(stash wip to resolve)";
      }
      return "(pull conflict detected)";
    }

    if (isWIP && !fetchInfo?.pullCanMergeWip) {
      return "(wip can't merge)";
    }

    return null;
  }, [
    isOnline,
    repoState?.branch,
    isWIP,
    isFetchLoading,
    fetchInfo?.fetchFailed,
    fetchInfo?.canPull,
    fetchInfo?.nothingToPull,
    fetchInfo?.hasConflict,
    fetchInfo?.pullCanMergeWip,
    fetchInfo?.hasLocalBranchCycle
  ]);
};

export const usePullButtonEnabled = (
  fetchInfo: FetchInfo | null | undefined,
  isFetchLoading?: boolean
) => {
  const isOnline = useIsOnline();
  return useMemo((): boolean => {
    if (!fetchInfo) {
      return false;
    }

    if (!isOnline && fetchInfo.canPull) {
      return false;
    }
    if (fetchInfo?.fetchFailed) {
      return false;
    }

    return fetchInfo?.canPull;
  }, [isOnline, isFetchLoading, fetchInfo?.fetchFailed, fetchInfo?.canPull]);
};
