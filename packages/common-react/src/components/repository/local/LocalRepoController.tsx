import React, { useRef, useEffect, useCallback, useMemo } from "react";
import styled from "@emotion/styled";
import { useTheme } from "@emotion/react";
import { Repository } from "@floro/graphql-schemas/src/generated/main-client-graphql";
import { useCurrentRepoState, usePluginStorageV2, useUpdateCurrentCommand } from "./hooks/local-hooks";
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

  const { data: repoData } = useCurrentRepoState(props.repository);
  const { data: storage } = usePluginStorageV2(props.repository);
  const { setCompareFrom, setSubAction, showLocalSettings } = useLocalVCSNavContext();
  const { isSelectMode } = useCopyPasteContext("local");

  const updateCommandState = useUpdateCurrentCommand(props.repository);
  const showSourceGraph = useSourceGraphIsShown();

  const onToggleCommandMode = useCallback(() => {
    if (showSourceGraph || isSelectMode) {
      return;
    }
    if (repoData?.repoState?.commandMode == "edit") {
      updateCommandState.mutate("view")
    } else if (repoData?.repoState?.commandMode == "view") {
      updateCommandState.mutate("edit")
    } else if (repoData?.repoState?.commandMode == "compare") {
      updateCommandState.mutate("view")
    }
  }, [repoData?.repoState?.commandMode, updateCommandState, showSourceGraph, isSelectMode]);

  const onToggleBranches = useCallback(() => {
    if (repoData?.repoState?.commandMode != "view") {
      return;
    }
    setSubAction("branches");
  }, [repoData?.repoState?.commandMode]);

  const onGoToBefore = useCallback(() => {

    if (showSourceGraph) {
      return;
    }
    if (repoData?.repoState?.commandMode == "compare") {
      setCompareFrom("before");
    }
  }, [repoData?.repoState?.commandMode, showSourceGraph]);

  const onGoToAfter = useCallback(() => {
    if (showSourceGraph) {
      return;
    }
    if (repoData?.repoState?.commandMode == "compare") {
      setCompareFrom("after");
    }
  }, [repoData?.repoState?.commandMode, showSourceGraph]);


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
    if (!repoData || !repoData || !props.plugin) {
      return null;
    }
    if (props.plugin == "home") {
      return null;
    }
    if (repoData?.repoState?.commandMode == "compare" && compareFrom == "before") {
      const hasPlugin = !!repoData?.beforeState?.plugins?.find?.(
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

    const hasPlugin = !!repoData?.applicationState?.plugins?.find?.(
      (v) => props.plugin == v.key
    );
    if (repoData?.repoState?.commandMode == "compare" && compareFrom == "after") {
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

    if (!hasPlugin && repoData?.repoState?.commandMode != "compare") {
        return (
          <NoPluginContainer>
            <NoPluginTextWrapper>
              <NoPluginText>{`${props.plugin} not installed`}</NoPluginText>
            </NoPluginTextWrapper>
          </NoPluginContainer>
        );
    }

    if (repoData?.repoState?.commandMode == "compare" && compareFrom == "before" && storage) {
      return (
        <>
          {repoData?.beforeState?.plugins?.map((plugin) => {
            return (
              <React.Fragment key={plugin.key + ":" + plugin.value}>
                {plugin.key == props.plugin && (
                  <LocalPluginController
                    pluginName={props.plugin}
                    repository={props.repository}
                    apiResponse={repoData}
                    isExpanded={props.isExpanded}
                    onSetIsExpanded={props.onSetIsExpanded}
                    onToggleCommandMode={onToggleCommandMode}
                    onToggleCompareMode={onToggleCompare}
                    onToggleAfter={onGoToAfter}
                    onToggleBefore={onGoToBefore}
                    onToggleBranches={onToggleBranches}
                    storage={storage}
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
          {repoData?.applicationState?.plugins?.map((plugin) => {
            return (
              <React.Fragment key={plugin.key + ":" + plugin.value}>
                {plugin.key == props.plugin && !!storage && (
                  <LocalPluginController
                    pluginName={props.plugin ?? "home"}
                    repository={props.repository}
                    apiResponse={repoData}
                    isExpanded={props.isExpanded}
                    onSetIsExpanded={props.onSetIsExpanded}
                    onToggleCommandMode={onToggleCommandMode}
                    onToggleCompareMode={onToggleCompare}
                    onToggleAfter={onGoToAfter}
                    onToggleBefore={onGoToBefore}
                    onToggleBranches={onToggleBranches}
                    storage={storage}
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
    repoData,
    storage,
    props.plugin,
    props.repository,
    compareFrom,
    theme,
    repoData?.repoState?.commandMode,
    repoData?.applicationState?.plugins,
    repoData?.beforeState?.plugins,
  ]);

  return (
    <>
      {!repoData && (
        <LoadingContainer>
          <DotsLoader color={loaderColor} size={"large"} />
        </LoadingContainer>
      )}
      {showLocalSettings && (
        <LocalSettingsHome repository={props.repository}/>
      )}
      {!showLocalSettings && repoData && (
        <>
          {localRepoHeader}
          {showSourceGraph && <SourceGraphMount/>}
          {!showSourceGraph && (
            <>
              {props.plugin == "home" && repoData?.repoState?.commandMode != "edit" && (
                <HomeRead
                repository={props.repository} apiResponse={repoData} />
              )}
              {props.plugin == "home" && repoData?.repoState?.commandMode == "edit" && (
                <HomeWrite
                repository={props.repository} apiResponse={repoData} />
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
