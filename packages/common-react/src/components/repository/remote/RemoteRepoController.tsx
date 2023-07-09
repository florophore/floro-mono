import React, { useRef, useEffect, useCallback, useMemo } from "react";
import styled from "@emotion/styled";
import { useTheme } from "@emotion/react";
import { Repository } from "@floro/graphql-schemas/src/generated/main-client-graphql";
import DotsLoader from "@floro/storybook/stories/design-system/DotsLoader";
import {
  ComparisonState,
  RemoteCommitState,
  useMergeRequestReviewPage,
  useRemoteCompareFrom,
  useViewMode,
} from "./hooks/remote-state";
import RemoteHeaderNav from "./header/RemoteHeaderNav";
import RemoteHomeRead from "./home/RemoteHomeRead";
import RemotePluginController from "../plugin/RemotePluginController";
import HistoryDisplay from "./history/HistoryDisplay";
import { RepoPage } from "../types";
import ProposedMRHistoryDisplay from "./history/ProposedMRHistoryDisplay";
import MergeRequestHistoryDisplay from "./mergerequesthistory/MergeRequestHistoryDisplay";
import MRHistoryDisplay from "./history/MRHistoryDisplay";
import MergeRequest from "./mergerequest/MergeRequest";

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
  color: ${(props) => props.theme.colors.contrastText};
`;

interface Props {
  repository: Repository;
  plugin?: string;
  isExpanded: boolean;
  onSetIsExpanded: (isExpanded: boolean) => void;
  remoteCommitState: RemoteCommitState;
  comparisonState: ComparisonState;
  page: RepoPage;
}

const RemoteRepoController = (props: Props) => {
  const theme = useTheme();
  const loaderColor = useMemo(
    () => (theme.name == "light" ? "purple" : "lightPurple"),
    [theme.name]
  );

  useEffect(() => {
    const commandToggleListeners = (event: KeyboardEvent) => {
      //if (event.metaKey && event.shiftKey  && event.key == "e") {
      //  onToggleCommandMode();
      //}
      //if (event.metaKey && event.shiftKey  && event.key == "c") {
      //  onToggleCompare();
      //}
      //if (event.metaKey && event.shiftKey  && event.key == "[") {
      //  onGoToBefore();
      //}
      //if (event.metaKey && event.shiftKey  && event.key == "]") {
      //  onGoToAfter();
      //}
    };
    window.addEventListener("keydown", commandToggleListeners);
    return () => {
      window.removeEventListener("keydown", commandToggleListeners);
    };
  }, []);

  const { reviewPage } = useMergeRequestReviewPage();
  const viewMode = useViewMode(props.page);
  const { compareFrom} = useRemoteCompareFrom();
  const mainBody = useMemo(() => {
    if (props.page == "history") {
      return (
        <HistoryDisplay
          repository={props.repository}
          remoteCommitState={props.remoteCommitState}
          plugin={props.plugin}
        />
      );
    }
    if (props.page == "merge-requests") {
      return (
        <MergeRequestHistoryDisplay
          repository={props.repository}
          plugin={props.plugin}
        />
      );
    }
    if (props.page == "merge-request-create" && reviewPage == "commits") {
      return (
        <ProposedMRHistoryDisplay
          repository={props.repository}
          remoteCommitState={props.remoteCommitState}
          plugin={props.plugin}
        />
      );
    }

    if (props.page == "merge-request" && reviewPage == "commits") {
      return (
        <MRHistoryDisplay
          repository={props.repository}
          remoteCommitState={props.remoteCommitState}
          plugin={props.plugin}
        />
      );
    }
    if (props.page == "merge-request" && reviewPage == "none") {
      return <MergeRequest repository={props.repository} page={props.page} />;
    }
    if (props.page == "home" || props.page == "merge-request-create" || props.page == "merge-request") {
      if (props.plugin != "home") {
        if (viewMode == "compare" && compareFrom == "before") {
          const hasPlugin =
            !!props.comparisonState?.beforeRemoteCommitState.renderedState?.plugins?.find?.(
              (v) => props.plugin == v.key
            );
          if (!hasPlugin) {
            return (
              <NoPluginContainer>
                <NoPluginTextWrapper>
                  <NoPluginText>{`${props.plugin} not installed before`}</NoPluginText>
                </NoPluginTextWrapper>
              </NoPluginContainer>
            );
          }
        } else {
          const hasPlugin =
            !!props.remoteCommitState?.renderedState?.plugins?.find?.(
              (v) => props.plugin == v.key
            );
          if (!hasPlugin) {
            return (
              <NoPluginContainer>
                <NoPluginTextWrapper>
                  <NoPluginText>{viewMode == "view" ? `${props.plugin} not installed` : `${props.plugin} not installed after`}</NoPluginText>
                </NoPluginTextWrapper>
              </NoPluginContainer>
            );
          }
        }

        if (viewMode == "compare" && compareFrom == "before") {
          return (
            <>
              {props.comparisonState?.beforeRemoteCommitState?.renderedState?.plugins?.map((plugin) => {
                return (
                  <React.Fragment key={plugin.key + ":" + plugin.value}>
                    {plugin.key == props.plugin && (
                      <RemotePluginController
                        pluginName={props.plugin}
                        repository={props.repository}
                        isExpanded={props.isExpanded}
                        onSetIsExpanded={props.onSetIsExpanded}
                        remoteCommitState={props.remoteCommitState}
                        comparisonState={props.comparisonState}
                        page={props.page}
                      />
                    )}
                  </React.Fragment>
                );
              })}
            </>
          );
        }

        return (
          <>
            {props.remoteCommitState?.renderedState?.plugins?.map((plugin) => {
              return (
                <React.Fragment key={plugin.key + ":" + plugin.value}>
                  {plugin.key == props.plugin && (
                    <RemotePluginController
                      pluginName={props.plugin}
                      repository={props.repository}
                      isExpanded={props.isExpanded}
                      onSetIsExpanded={props.onSetIsExpanded}
                      remoteCommitState={props.remoteCommitState}
                      comparisonState={props.comparisonState}
                      page={props.page}
                    />
                  )}
                </React.Fragment>
              );
            })}
          </>
        );
      }
      if (props.plugin == "home") {
        return (
          <RemoteHomeRead
            repository={props.repository}
            remoteCommitState={props.remoteCommitState}
            comparisonState={props.comparisonState}
            page={props.page}
          />
        );
      }
    }
    return null;
  }, [
    props.page,
    props.plugin,
    props.remoteCommitState,
    props.comparisonState,
    props.repository,
    props.onSetIsExpanded,
    props.isExpanded,
    reviewPage,
    viewMode,
    compareFrom
  ]);

  if (props.remoteCommitState.isLoading) {
    return (
      <>
        <LoadingContainer>
          <DotsLoader color={loaderColor} size={"large"} />
        </LoadingContainer>
      </>
    );
  }
  return (
    <>
      <RemoteHeaderNav
        remoteCommitState={props.remoteCommitState}
        comparisonState={props.comparisonState}
        repository={props.repository}
        plugin={props.plugin}
        page={props.page}
      />
      {mainBody}
    </>
  );
};

export default React.memo(RemoteRepoController);
