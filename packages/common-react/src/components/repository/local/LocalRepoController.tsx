import React, { useRef, useEffect, useCallback, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "react-query";
import axios from "axios";
import styled from "@emotion/styled";
import { useTheme } from "@emotion/react";
import { Repository } from "@floro/graphql-schemas/src/generated/main-client-graphql";
import { useCurrentRepoState, useUpdateCurrentCommand } from "./hooks/local-hooks";
import DotsLoader from "@floro/storybook/stories/design-system/DotsLoader";
import LocalRepoSubHeader from "./LocalRepoSubHeader";
import HomeRead from "../home/HomeRead";
import HomeWrite from "../home/HomeWrite";
import LocalPluginController from "../plugin/LocalPluginController";

const LoadingContainer = styled.div`
  display: flex;
  flex-stretch: 1;
  flex: 1;
  justify-content: center;
  align-items: center;
  height: 100%;
  height: 100%;
`;

interface Props {
  repository: Repository;
  plugin?: string;
  isExpanded: boolean;
  onSetIsExpanded: (isExpanded: boolean) => void;
}

const LocalRepoController = (props: Props) => {
  const theme = useTheme();
  const loaderColor = useMemo(
    () => (theme.name == "light" ? "purple" : "lightPurple"),
    [theme.name]
  );
  const { data } = useCurrentRepoState(props.repository);

  const updateCommandState = useUpdateCurrentCommand(props.repository);

  const onToggleCommandMode = useCallback(() => {
    if (data?.repoState?.commandMode == "edit") {
      updateCommandState.mutate("view")
    } else if (data?.repoState?.commandMode == "view") {
      updateCommandState.mutate("edit")
    } else if (data?.repoState?.commandMode == "compare") {
      updateCommandState.mutate("view")
    }
  }, [data?.repoState?.commandMode, updateCommandState]);

  useEffect(() => {
    const commandToggleListeners = (event: KeyboardEvent) => {
      if (event.metaKey && event.shiftKey  && event.key == "e") {
        onToggleCommandMode();
      }
    };
    window.addEventListener("keydown", commandToggleListeners);
    return () => {
      window.removeEventListener("keydown", commandToggleListeners);
    };
  }, [onToggleCommandMode]);

  return (
    <>
      {!data && (
        <LoadingContainer>
          <DotsLoader color={loaderColor} size={"large"} />
        </LoadingContainer>
      )}
      {data && (
        <>
          <LocalRepoSubHeader repository={props.repository}  plugin={props.plugin}/>
          {props.plugin == "home" && data?.repoState?.commandMode == "view" && (
            <HomeRead
             repository={props.repository} apiResponse={data} />
          )}
          {props.plugin == "home" && data?.repoState?.commandMode == "edit" && (
            <HomeWrite
             repository={props.repository} apiResponse={data} />
          )}
          {props.plugin != "home" &&
            props.plugin != "settings" &&
            typeof props.plugin == "string" && (
              <LocalPluginController
                pluginName={props.plugin}
                repository={props.repository}
                apiResponse={data}
                isExpanded={props.isExpanded}
                onSetIsExpanded={props.onSetIsExpanded}
                onToggleCommandMode={onToggleCommandMode}
              />
            )}
        </>
      )}
    </>
  );
};

export default React.memo(LocalRepoController);
