import React, { useMemo, useState, useEffect, useCallback } from "react";
import OuterNavigator from "@floro/common-react/src/components/outer-navigator/OuterNavigator";
import { useNavigationAnimator } from "@floro/common-react/src/navigation/navigation-animator";
import { useLinkTitle } from "@floro/common-react/src/components/header_links/HeaderLink";
import {
  useLocation,
  useParams,
  useSearchParams,
  Link,
} from "react-router-dom";
import {
  Repository,
  useFetchRepositoryByNameQuery,
} from "@floro/graphql-schemas/src/generated/main-client-graphql";
import { useSession } from "@floro/common-react/src/session/session-context";
import { useUserOrganizations } from "@floro/common-react/src/hooks/offline";
//import LocalPluginLoader from '@floro/common-react/src/plugin-loader/LocalPluginLoader';
import LocalRepoController from "@floro/common-react/src/components/repository/local/LocalRepoController";
import RepoNavigator from "@floro/common-react/src/components/repository/RepoNavigator";
import { LocalVCSNavProvider } from "./local/vcsnav/LocalVCSContext";
import { SourceGraphUIProvider } from "./sourcegraph/SourceGraphUIContext";
import RemoteRepoController from "./remote/RemoteRepoController";
import { useRemoteCommitState } from "./remote/hooks/remote-state";

interface Props {
  from: "local" | "remote";
  repository: Repository;
  plugin?: string;
  page:
    | "history"
    | "home"
    | "settings"
    | "branch-rules"
    | "merge-requests"
    | "merge-request"
    | "merge-request-review";
}

const RepoController = (props: Props) => {
  const [isExpanded, setIsExpanded] = useState(true);
  const remoteCommitState = useRemoteCommitState(props.repository);

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
    <SourceGraphUIProvider isExpanded={isExpanded}>
      <LocalVCSNavProvider>
        <RepoNavigator
          from={props.from}
          repository={props.repository}
          plugin={props.plugin ?? "home"}
          isExpanded={isExpanded}
          onSetIsExpanded={setIsExpanded}
          remoteCommitState={remoteCommitState}
          page={props.page}
        >
          <>
            {props.from == "local" && (
              <LocalRepoController
                repository={props.repository}
                plugin={props.plugin ?? "home"}
                isExpanded={isExpanded}
                onSetIsExpanded={setIsExpanded}
              />
            )}
            {props.from == "remote" && (
              <RemoteRepoController
                repository={props.repository}
                plugin={props.plugin ?? "home"}
                isExpanded={isExpanded}
                onSetIsExpanded={setIsExpanded}
                remoteCommitState={remoteCommitState}
                page={props.page}
              />
            )}
          </>
        </RepoNavigator>
      </LocalVCSNavProvider>
    </SourceGraphUIProvider>
  );
};

export default React.memo(RepoController);
