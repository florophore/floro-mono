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

interface Props {
  from: "local" | "remote";
  repository: Repository;
  plugin?: string;
  page: RepoPage;
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
      if (event.metaKey && event.shiftKey && event.key == "p") {
        onTogglePanel?.();
      }
    };
    window.addEventListener("keydown", commandPToggleListener);
    return () => {
      window.removeEventListener("keydown", commandPToggleListener);
    };
  }, [onTogglePanel]);

  return (
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
            >
              <>
                  <>
                    {props.from == "local" && (
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
                      />
                    )}
                  </>
              </>
            </RepoNavigator>
          </LocalVCSNavProvider>
        </MergeRequestNavProvider>
      </SourceGraphUIProvider>

    </CopyPasteProvider>
  );
};

export default React.memo(RepoController);
