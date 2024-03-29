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
import { useDaemonIsConnected } from "../../pubsub/socket";
import { useQueryClient } from "react-query";

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

  const isDaemonConnected = useDaemonIsConnected();
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!isDaemonConnected) {
      queryClient.invalidateQueries(["repo-current:" + props.repository.id]);
    }

  }, [isDaemonConnected, props.repository.id])

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
                isLoading={props.isLoading}
              >
                <>
                    <>
                      {props.from == "local"  && (
                        <LocalRepoController
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
