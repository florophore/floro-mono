import React, { useState, useEffect, useCallback } from "react";
import { useSearchParams } from "react-router-dom";
import {
  Repository,
  useRepositoryUpdatesSubscription,
} from "@floro/graphql-schemas/src/generated/main-client-graphql";
import LocalRepoController from "@floro/common-react/src/components/repository/local/LocalRepoController";
import RepoNavigator from "@floro/common-react/src/components/repository/RepoNavigator";
import { LocalVCSNavProvider } from "./local/vcsnav/LocalVCSContext";
import { SourceGraphUIProvider } from "./sourcegraph/SourceGraphUIContext";
import RemoteRepoController from "./remote/RemoteRepoController";
import {
  useComparisonState,
  useMainRemoteState,
} from "./remote/hooks/remote-state";
import { RepoPage } from "./types";
import { MergeRequestNavProvider } from "./remote/mergerequest/MergeRequestContext";
import { CopyPasteProvider } from "./copypaste/CopyPasteContext";
import { CreateAnnouncementsProvider } from "./remote/announcements/CreateAnnouncementsContext";
import { useCurrentRepoState, usePluginStorageV2, useWatchRepoId } from "./local/hooks/local-hooks";

interface Props {
  from: "local" | "remote";
  repository: Repository;
  plugin?: string;
  page: RepoPage;
  isLoading: boolean;
}

const RepoController = (props: Props) => {
  const [isExpanded, setIsExpanded] = useState(true);
  const remoteCommitState = useMainRemoteState(props.page, props.repository);
  const comparisonState = useComparisonState(
    props.page,
    props.repository,
    remoteCommitState
  );
  const [searchParams] = useSearchParams();

  const branchId = searchParams.get("branch");
  const sha = searchParams.get("sha");
  useRepositoryUpdatesSubscription({
    variables: {
      repositoryId: props.repository.id,
      branchId,
      sha,
    },
  });

  const onTogglePanel = useCallback(() => {
    setIsExpanded(!isExpanded);
  }, [isExpanded]);

  useEffect(() => {
    const commandPToggleListener = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.shiftKey && event.key?.toLowerCase() == "p") {
        onTogglePanel?.();
      }
    };
    window.addEventListener("keydown", commandPToggleListener);
    return () => {
      window.removeEventListener("keydown", commandPToggleListener);
    };
  }, [onTogglePanel]);

  const { data: repoData } = useCurrentRepoState(props.repository, "RepoController");
  const { data: storage } = usePluginStorageV2(props.repository);
  useWatchRepoId(props?.repository?.id ?? "");

  return (
    <CreateAnnouncementsProvider>
      <CopyPasteProvider repository={props.repository}>
        <SourceGraphUIProvider isExpanded={isExpanded}>
          <MergeRequestNavProvider>
            <LocalVCSNavProvider>
              <RepoNavigator
                from={props.from}
                repository={props.repository}
                plugin={props.plugin ?? "home"}
                isExpanded={isExpanded}
                onSetIsExpanded={setIsExpanded}
                remoteCommitState={remoteCommitState}
                comparisonState={comparisonState}
                page={props.page}
                apiResponse={repoData}
                storage={storage}
                isLoading={props.isLoading}
              >
                <>
                    <>
                      {props.from == "local" && !!repoData && !!storage && (
                        <LocalRepoController
                          apiResponse={repoData}
                          storage={storage}
                          repository={props.repository}
                          plugin={props.plugin ?? "home"}
                          isExpanded={isExpanded}
                          onSetIsExpanded={setIsExpanded}
                        />
                      )}
                    </>
                    <>
                      {props.from == "remote" && (
                        <RemoteRepoController
                          repository={props.repository}
                          plugin={props.plugin ?? "home"}
                          isExpanded={isExpanded}
                          onSetIsExpanded={setIsExpanded}
                          remoteCommitState={remoteCommitState}
                          comparisonState={comparisonState}
                          page={props.page}
                          isLoading={props.isLoading}
                        />
                      )}
                    </>
                </>
              </RepoNavigator>
            </LocalVCSNavProvider>
          </MergeRequestNavProvider>
        </SourceGraphUIProvider>
      </CopyPasteProvider>
    </CreateAnnouncementsProvider>
  );
};

export default React.memo(RepoController);
