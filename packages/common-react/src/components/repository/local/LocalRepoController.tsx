import React, { useRef, useEffect, useCallback, useMemo } from "react";
import styled from "@emotion/styled";
import { useTheme } from "@emotion/react";
import { Repository } from "@floro/graphql-schemas/src/generated/main-client-graphql";
import { useUpdateCurrentCommand } from "./hooks/local-hooks";
import DotsLoader from "@floro/storybook/stories/design-system/DotsLoader";
import LocalRepoSubHeader from "./LocalRepoSubHeader";
import HomeRead from "../home/HomeRead";
import HomeWrite from "../home/HomeWrite";
import LocalPluginController from "../plugin/LocalPluginController";
import { useLocalVCSNavContext } from "./vcsnav/LocalVCSContext";
import { useSourceGraphIsShown } from "../ui-state-hook";
import SourceGraphMount from "../sourcegraph/SourceGraphMount";
import { useCopyPasteContext } from "../copypaste/CopyPasteContext";
import LocalSettingsHome from "./settings/LocalSettingsHome";
import { ApiResponse } from "floro/dist/src/repo";

const LoadingContainer = styled.div`
  display: flex;
  flex-stretch: 1;
  flex: 1;
  justify-content: center;
  align-items: center;
  height: 100%;
  height: 100%;
`;
const NoPluginContainer = styled.div`
  display: flex;
  height: 100%;
  width: 100%;
  flex-direction: center;
  justify-content: center;
  align-items: center;
`;

const NoPluginTextWrapper = styled.div`
  width: 50%;
  max-width: 450px;
  flex-direction: center;
  justify-content: center;
`;

const NoPluginText = styled.h3`
  font-weight: 600;
  font-size: 2.5rem;
  font-family: "MavenPro";
  text-align: center;
  color: ${props => props.theme.colors.contrastText};
`;

interface Props {
  repository: Repository;
  apiResponse: ApiResponse;
  storage: object;
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
  const { setCompareFrom, setSubAction, showLocalSettings } = useLocalVCSNavContext();
  const { isSelectMode } = useCopyPasteContext("local");

  const updateCommandState = useUpdateCurrentCommand(props.repository);
  const showSourceGraph = useSourceGraphIsShown();

  const onToggleCommandMode = useCallback(() => {
    if (showSourceGraph || isSelectMode) {
      return;
    }
    if (props.apiResponse?.repoState?.commandMode == "edit") {
      updateCommandState.mutate("view")
    } else if (props.apiResponse?.repoState?.commandMode == "view") {
      updateCommandState.mutate("edit")
    } else if (props.apiResponse?.repoState?.commandMode == "compare") {
      updateCommandState.mutate("view")
    }
  }, [props.apiResponse?.repoState?.commandMode, updateCommandState, showSourceGraph, isSelectMode]);

  const onToggleBranches = useCallback(() => {
    if (props.apiResponse?.repoState?.commandMode != "view") {
      return;
    }
    setSubAction("branches");
  }, [props.apiResponse?.repoState?.commandMode]);

  const onGoToBefore = useCallback(() => {

    if (showSourceGraph) {
      return;
    }
    if (props.apiResponse?.repoState?.commandMode == "compare") {
      setCompareFrom("before");
    }
  }, [props.apiResponse?.repoState?.commandMode, showSourceGraph]);

  const onGoToAfter = useCallback(() => {
    if (showSourceGraph) {
      return;
    }
    if (props.apiResponse?.repoState?.commandMode == "compare") {
      setCompareFrom("after");
    }
  }, [props.apiResponse?.repoState?.commandMode, showSourceGraph]);


  const onToggleCompare = useCallback(() => {
    if (showSourceGraph) {
      return;
    }
    updateCommandState.mutate("compare")
  }, [showSourceGraph]);

  useEffect(() => {
    const commandToggleListeners = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.shiftKey  && event.key?.toLowerCase() == "e") {
        onToggleCommandMode();
      }

      if ((event.metaKey || event.ctrlKey) && event.shiftKey  && event.key?.toLowerCase() == "c") {
        onToggleCompare();
      }

      if ((event.metaKey || event.ctrlKey) && event.shiftKey  && event.key?.toLowerCase() == "[") {
        onGoToBefore();
      }

      if ((event.metaKey || event.ctrlKey) && event.shiftKey  && event.key?.toLowerCase() == "]") {
        onGoToAfter();
      }
    };
    window.addEventListener("keydown", commandToggleListeners);
    return () => {
      window.removeEventListener("keydown", commandToggleListeners);
    };
  }, [onToggleCommandMode, onToggleCompare, onGoToAfter, onGoToBefore]);

  const localRepoHeader = useMemo(() => {
    if (showSourceGraph) {
      return null;
    }
    return  <LocalRepoSubHeader repository={props.repository}  plugin={props.plugin}/>
  }, [props.repository, props.plugin, showSourceGraph]);

  const { compareFrom} = useLocalVCSNavContext();

  const pluginCode = useMemo(() => {
    if (!props.apiResponse || !props.storage || !props.plugin) {
      return null;
    }
    if (props.plugin == "home") {
      return null;
    }
    if (props.apiResponse?.repoState?.commandMode == "compare" && compareFrom == "before") {
      const hasPlugin = !!props.apiResponse?.beforeState?.plugins?.find?.(
        (v) => props.plugin == v.key
      );
      if (!hasPlugin) {
        return (
          <NoPluginContainer
          >
            <NoPluginTextWrapper>
              <NoPluginText>{`${props.plugin} not installed before`}</NoPluginText>
            </NoPluginTextWrapper>
          </NoPluginContainer>
        );
      }
    }

    const hasPlugin = !!props.apiResponse?.applicationState?.plugins?.find?.(
      (v) => props.plugin == v.key
    );
    if (props.apiResponse?.repoState?.commandMode == "compare" && compareFrom == "after") {
      if (!hasPlugin) {
        return (
          <NoPluginContainer>
            <NoPluginTextWrapper>
              <NoPluginText>{`${props.plugin} not installed after`}</NoPluginText>
            </NoPluginTextWrapper>
          </NoPluginContainer>
        );
      }
    }

    if (!hasPlugin && props.apiResponse?.repoState?.commandMode != "compare") {
        return (
          <NoPluginContainer>
            <NoPluginTextWrapper>
              <NoPluginText>{`${props.plugin} not installed`}</NoPluginText>
            </NoPluginTextWrapper>
          </NoPluginContainer>
        );
    }

    if (props.apiResponse?.repoState?.commandMode == "compare" && compareFrom == "before") {
      return (
        <>
          {props.apiResponse?.beforeState?.plugins?.map((plugin) => {
            return (
              <React.Fragment key={plugin.key + ":" + plugin.value}>
                {plugin.key == props.plugin && (
                  <LocalPluginController
                    pluginName={props.plugin}
                    repository={props.repository}
                    apiResponse={props.apiResponse}
                    isExpanded={props.isExpanded}
                    onSetIsExpanded={props.onSetIsExpanded}
                    onToggleCommandMode={onToggleCommandMode}
                    onToggleCompareMode={onToggleCompare}
                    onToggleAfter={onGoToAfter}
                    onToggleBefore={onGoToBefore}
                    onToggleBranches={onToggleBranches}
                    storage={props.storage}
                  />
                )}
              </React.Fragment>
            )
          })}
        </>
      )
    }
      return (
        <>
          {props?.apiResponse?.applicationState?.plugins?.map((plugin) => {
            return (
              <React.Fragment key={plugin.key + ":" + plugin.value}>
                {plugin.key == props.plugin && (
                  <LocalPluginController
                    pluginName={props.plugin ?? "home"}
                    repository={props.repository}
                    apiResponse={props?.apiResponse}
                    isExpanded={props.isExpanded}
                    onSetIsExpanded={props.onSetIsExpanded}
                    onToggleCommandMode={onToggleCommandMode}
                    onToggleCompareMode={onToggleCompare}
                    onToggleAfter={onGoToAfter}
                    onToggleBefore={onGoToBefore}
                    onToggleBranches={onToggleBranches}
                    storage={props.storage}
                  />
                )}
              </React.Fragment>
            )
          })}
        </>
      );
  }, [
    onToggleCommandMode,
    props.onSetIsExpanded,
    props.isExpanded,
    props.apiResponse,
    props?.storage,
    props.plugin,
    props.repository,
    compareFrom,
    theme,
    props.apiResponse?.repoState?.commandMode,
    props.apiResponse?.applicationState?.plugins,
    props.apiResponse?.beforeState?.plugins,
  ]);

  return (
    <>
      {!props?.apiResponse && (
        <LoadingContainer>
          <DotsLoader color={loaderColor} size={"large"} />
        </LoadingContainer>
      )}
      {showLocalSettings && (
        <LocalSettingsHome repository={props.repository}/>
      )}
      {!showLocalSettings && props?.apiResponse && (
        <>
          {localRepoHeader}
          {showSourceGraph && <SourceGraphMount/>}
          {!showSourceGraph && (
            <>
              {props.plugin == "home" && props?.apiResponse?.repoState?.commandMode != "edit" && (
                <HomeRead
                repository={props.repository} apiResponse={props?.apiResponse} />
              )}
              {props.plugin == "home" && props?.apiResponse?.repoState?.commandMode == "edit" && (
                <HomeWrite
                repository={props.repository} apiResponse={props?.apiResponse} />
              )}
            </>
          )}
          {pluginCode}
        </>
      )}
    </>
  );
};

export default React.memo(LocalRepoController);
