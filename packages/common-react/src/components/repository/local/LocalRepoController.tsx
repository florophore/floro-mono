import React, { useRef, useEffect, useCallback, useMemo } from "react";
import styled from "@emotion/styled";
import { useTheme } from "@emotion/react";
import { Repository } from "@floro/graphql-schemas/src/generated/main-client-graphql";
import { useCurrentRepoState, useUpdateCurrentCommand } from "./hooks/local-hooks";
import DotsLoader from "@floro/storybook/stories/design-system/DotsLoader";
import LocalRepoSubHeader from "./LocalRepoSubHeader";
import HomeRead from "../home/HomeRead";
import HomeWrite from "../home/HomeWrite";
import LocalPluginController from "../plugin/LocalPluginController";
import { useLocalVCSNavContext } from "./vcsnav/LocalVCSContext";
import { useSourceGraphIsShown } from "../ui-state-hook";
import SourceGraphMount from "../sourcegraph/SourceGraphMount";

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
  const { data } = useCurrentRepoState(props.repository);
  const { setCompareFrom, setSubAction } = useLocalVCSNavContext();

  const updateCommandState = useUpdateCurrentCommand(props.repository);
  const showSourceGraph = useSourceGraphIsShown();

  const onToggleCommandMode = useCallback(() => {
    if (showSourceGraph) {
      return;
    }
    if (data?.repoState?.commandMode == "edit") {
      updateCommandState.mutate("view")
    } else if (data?.repoState?.commandMode == "view") {
      updateCommandState.mutate("edit")
    } else if (data?.repoState?.commandMode == "compare") {
      updateCommandState.mutate("view")
    }
  }, [data?.repoState?.commandMode, updateCommandState, showSourceGraph]);

  const onToggleBranches = useCallback(() => {
    if (data?.repoState?.commandMode != "view") {
      return;
    }
    setSubAction("branches");
  }, [data?.repoState?.commandMode]);

  const onGoToBefore = useCallback(() => {

    if (showSourceGraph) {
      return;
    }
    if (data?.repoState?.commandMode == "compare") {
      setCompareFrom("before");
    }
  }, [data?.repoState?.commandMode, showSourceGraph]);

  const onGoToAfter = useCallback(() => {
    if (showSourceGraph) {
      return;
    }
    if (data?.repoState?.commandMode == "compare") {
      setCompareFrom("after");
    }
  }, [data?.repoState?.commandMode, showSourceGraph]);


  const onToggleCompare = useCallback(() => {
    if (showSourceGraph) {
      return;
    }
    updateCommandState.mutate("compare")
  }, [showSourceGraph]);

  useEffect(() => {
    const commandToggleListeners = (event: KeyboardEvent) => {
      if (event.metaKey && event.shiftKey  && event.key == "e") {
        onToggleCommandMode();
      }

      if (event.metaKey && event.shiftKey  && event.key == "c") {
        onToggleCompare();
      }

      if (event.metaKey && event.shiftKey  && event.key == "[") {
        onGoToBefore();
      }

      if (event.metaKey && event.shiftKey  && event.key == "]") {
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
    if (!data || !props.plugin) {
      return null;
    }
    if (props.plugin == "home" || props.plugin == "settings") {
      return null;
    }
    if (data?.repoState?.commandMode == "compare" && compareFrom == "before") {
      const hasPlugin = !!data?.beforeState?.plugins?.find?.(
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

    const hasPlugin = !!data?.applicationState?.plugins?.find?.(
      (v) => props.plugin == v.key
    );
    if (data?.repoState?.commandMode == "compare" && compareFrom == "after") {
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

    if (!hasPlugin && data?.repoState?.commandMode != "compare") {
        return (
          <NoPluginContainer>
            <NoPluginTextWrapper>
              <NoPluginText>{`${props.plugin} not installed`}</NoPluginText>
            </NoPluginTextWrapper>
          </NoPluginContainer>
        );
    }

    if (data?.repoState?.commandMode == "compare" && compareFrom == "before") {

      return (
        <>
          {data?.beforeState?.plugins?.map((plugin) => {
            return (
              <React.Fragment key={plugin.key + ":" + plugin.value}>
                {plugin.key == props.plugin && (
                  <LocalPluginController
                    pluginName={props.plugin}
                    repository={props.repository}
                    apiResponse={data}
                    isExpanded={props.isExpanded}
                    onSetIsExpanded={props.onSetIsExpanded}
                    onToggleCommandMode={onToggleCommandMode}
                    onToggleCompareMode={onToggleCompare}
                    onToggleAfter={onGoToAfter}
                    onToggleBefore={onGoToBefore}
                    onToggleBranches={onToggleBranches}
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
          {data?.applicationState?.plugins?.map((plugin) => {
            return (
              <React.Fragment key={plugin.key + ":" + plugin.value}>
                {plugin.key == props.plugin && (
                  <LocalPluginController
                    pluginName={props.plugin}
                    repository={props.repository}
                    apiResponse={data}
                    isExpanded={props.isExpanded}
                    onSetIsExpanded={props.onSetIsExpanded}
                    onToggleCommandMode={onToggleCommandMode}
                    onToggleCompareMode={onToggleCompare}
                    onToggleAfter={onGoToAfter}
                    onToggleBefore={onGoToBefore}
                    onToggleBranches={onToggleBranches}
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
    data,
    props.plugin,
    props.repository,
    compareFrom,
    theme,
    data?.repoState?.commandMode,
    data?.applicationState?.plugins,
    data?.beforeState?.plugins,
  ]);

  return (
    <>
      {!data && (
        <LoadingContainer>
          <DotsLoader color={loaderColor} size={"large"} />
        </LoadingContainer>
      )}
      {data && (
        <>
          {localRepoHeader}
          {showSourceGraph && <SourceGraphMount/>}
          {!showSourceGraph && (
            <>
              {props.plugin == "home" && data?.repoState?.commandMode != "edit" && (
                <HomeRead
                repository={props.repository} apiResponse={data} />
              )}
              {props.plugin == "home" && data?.repoState?.commandMode == "edit" && (
                <HomeWrite
                repository={props.repository} apiResponse={data} />
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
