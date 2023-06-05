import React, { useMemo, useState, useEffect, useCallback } from "react";
import OuterNavigator from "@floro/common-react/src/components/outer-navigator/OuterNavigator";
import { useNavigationAnimator } from "@floro/common-react/src/navigation/navigation-animator";
import { useLinkTitle } from "@floro/common-react/src/components/header_links/HeaderLink";
import { useParams, useSearchParams } from "react-router-dom";
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

interface Props {
  from: "local" | "remote";
  repository: Repository;
  plugin?: string;
}

const RepoController = (props: Props) => {
  const [isExpanded, setIsExpanded] = useState(true);

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
                {props.from == "remote" && <div>{"fill in later"}</div>}
              </>
            </RepoNavigator>
        </LocalVCSNavProvider>
      </SourceGraphUIProvider>
  );
};

export default React.memo(RepoController);