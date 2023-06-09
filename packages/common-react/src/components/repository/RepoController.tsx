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

  const s = useLocation();

  const params = useParams();
  const ownerHandle = params?.["ownerHandle"] ?? "";
  const repoName = params?.["repoName"] ?? "";
  const repoValue = useMemo(() => {
    if (!props.repository?.name) {
      return `/repo/@/${ownerHandle}/${repoName}`;
    }
    if (props.repository.repoType == "user_repo") {
      return `/repo/@/${props.repository?.user?.username}/${props.repository?.name}`;
    }
    return `/repo/@/${props.repository?.organization?.handle}/${props.repository?.name}`;
  }, [props.repository, ownerHandle]);

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
          repository={props.repository}
          plugin={props.plugin ?? "home"}
          isExpanded={isExpanded}
          onSetIsExpanded={setIsExpanded}
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
            {props.from == "remote" && props.page == "home" && (
              <RemoteRepoController
                repository={props.repository}
                plugin={props.plugin ?? "home"}
                isExpanded={isExpanded}
                onSetIsExpanded={setIsExpanded}
              />
            )}
          </>
        </RepoNavigator>
      </LocalVCSNavProvider>
    </SourceGraphUIProvider>
  );
};

export default React.memo(RepoController);
