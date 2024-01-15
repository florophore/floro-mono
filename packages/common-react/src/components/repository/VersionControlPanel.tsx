import React, { useMemo, useCallback, useEffect } from "react";
import { Repository } from "@floro/graphql-schemas/src/generated/main-client-graphql";
import { useSearchParams } from "react-router-dom";
import styled from "@emotion/styled";
import { useTheme } from "@emotion/react";
import ColorPalette from "@floro/styles/ColorPalette";
import AdjustExtend from "@floro/common-assets/assets/images/icons/adjust.extend.svg";
import AdjustShrink from "@floro/common-assets/assets/images/icons/adjust.shrink.svg";
import LaptopWhite from "@floro/common-assets/assets/images/icons/laptop.white.svg";
import GlobeWhite from "@floro/common-assets/assets/images/icons/globe.white.svg";
import LocalRemoteToggle from "@floro/storybook/stories/common-components/LocalRemoteToggle";
import { useDaemonIsConnected } from "../../pubsub/socket";
import LocalVCSNavController from "./local/vcsnav/LocalVCSNavController";
import { useSourceGraphIsShown } from "./ui-state-hook";
import { useCloneState, useRepoExistsLocally } from "./local/hooks/local-hooks";
import {
  ComparisonState,
  RemoteCommitState,
} from "./remote/hooks/remote-state";
import RemoteVCSNavController from "./remote/vcsnav/RemoteVCSNavController";
import { RepoPage } from "./types";
import { useLocalVCSNavContext } from "./local/vcsnav/LocalVCSContext";
import { ApiResponse } from "floro/dist/src/repo";

const Container = styled.nav`
  display: flex;
  flex-direction: column;
  height: 100%;
  transition: border 400ms;
  position: relative;
`;

const InnerContainer = styled.div`
  display: flex;
  height: 100%;
  width: 502px;
  overflow: hidden;
  transition: width 400ms;
`;

const InnerContainerContent = styled.div`
  height: 100%;
  width: 502px;
  display: flex;
  flex-direction: column;
`;
const NavigationWrapper = styled.div`
  flex: 1;
`;

const AdjustIconWrapper = styled.div`
  position: absolute;
  bottom: 24px;
  height: 40px;
  width: 40px;
  background: ${ColorPalette.lightPurple};
  border-top-left-radius: 10px;
  border-bottom-left-radius: 10px;
  cursor: pointer;
  display: flex;
  justify-content: center;
  align-items: center;
  transition: left 400ms;
`;

const AdjustIcon = styled.img`
  height: 24px;
`;

const RemoteToggleIconWrapper = styled.div`
  position: absolute;
  width: 40px;
  height: 40px;
  left: -40px;
  top: 140px;
  border-top-left-radius: 10px;
  border-bottom-left-radius: 10px;
  cursor: pointer;
  display: flex;
  justify-content: center;
  align-items: center;
  transition: transform 400ms;
`;

const LocalToggleIconWrapper = styled.div`
  position: absolute;
  width: 40px;
  height: 40px;
  left: -40px;
  top: 88px;
  border-top-left-radius: 10px;
  border-bottom-left-radius: 10px;
  cursor: pointer;
  display: flex;
  justify-content: center;
  align-items: center;
  transition: transform 400ms;
`;

const ToggleIcon = styled.img`
  height: 28px;
  margin-left: 4px;
`;

const OuterShadow = styled.div`
  height: 100px;
  width: 0px;
  left: -2px;
  position: absolute;
  box-shadow: -2px 4px 3px 4px
    ${(props) => props.theme.shadows.versionControlSideBarShadow};
  transform: opacity 400ms;
`;

interface Props {
  repository: Repository;
  storage?: object|null;
  apiResponse?: ApiResponse|null;
  remoteCommitState: RemoteCommitState;
  comparisonState: ComparisonState;
  isExpanded: boolean;
  onSetIsExpanded: (isExpanded: boolean) => void;
  plugin: string;
  page: RepoPage;
  isLoading: boolean;
}

const VersionControlPanel = (props: Props) => {
  const [searchParams, setSearchParams] = useSearchParams();
  const from: "remote" | "local" =
    (searchParams.get?.("from") as "remote" | "local") ?? "remote";
  const { data: repoExistsLocally, isLoading } = useRepoExistsLocally(
    props.repository
  );
  const sourceGraphIsShown = useSourceGraphIsShown();
  const { showLocalSettings } = useLocalVCSNavContext();

  const isFullShadow = useMemo(() => {
    if (from == "remote") {
      if (props.page == "announcements") {
        return true;
      }
      if (props.page == "announcement") {
        return true;
      }
      if (props.page == "api-settings") {
        return true;
      }
      if (props.page == "settings") {
        return true;
      }
      if (props.page == "branch-rule") {
        return true;
      }
    }
    //if (!repoExistsLocally) {
    //  return false;
    //}
    if (showLocalSettings && from == "local") {
      return true;
    }
    if (sourceGraphIsShown && from == "local") {
      return true;
    }
    return false;
  }, [
    sourceGraphIsShown,
    showLocalSettings,
    repoExistsLocally,
    props.page,
    from,
  ]);
  const { data: cloneState } = useCloneState(props.repository);

  const theme = useTheme();
  const isDaemonConnected = useDaemonIsConnected();
  const adjustIcon = useMemo(
    () => (props.isExpanded ? AdjustShrink : AdjustExtend),
    [props.isExpanded]
  );

  useEffect(() => {
    if (!isDaemonConnected && from == "local") {
      setSearchParams({
        from: "remote",
      });
    }
  }, [searchParams, isDaemonConnected, from]);

  const onTogglePanel = useCallback(() => {
    props.onSetIsExpanded(!props.isExpanded);
  }, [props.isExpanded]);

  const panelStyle = useMemo(() => {
    if (props.isExpanded) {
      return {
        borderLeft: `1px solid ${theme.colors.versionControllerBorderColor}`,
      };
    }
    return {
      borderLeft: `0px solid ${theme.colors.versionControllerBorderColor}`,
    };
  }, [props.isExpanded, theme]);

  const innerStyle = useMemo(() => {
    if (props.isExpanded) {
      return {
        width: 503,
      };
    }
    return {
      width: 0,
    };
  }, [props.isExpanded, theme]);

  const isSourceGraphShown = useSourceGraphIsShown();

  const iconOffset = useMemo(() => {
    if (props.isExpanded) {
      return {
        left: -41,
      };
    }
    return {
      left: -40,
    };
  }, [props.isExpanded, theme]);

  const remoteIconTop = useMemo(() => {
    if (isSourceGraphShown) {
      return 18;
    }
    return 140;
  }, [isSourceGraphShown]);

  const remoteIconsOffset = useMemo(() => {
    if (props.isExpanded) {
      return {
        transform: "translate(0px, -180px)",
      };
    }
    return {
      transform: "translate(0px, 0px)",
    };
  }, [props.isExpanded, isSourceGraphShown, theme]);

  const localIconTop = useMemo(() => {
    if (isSourceGraphShown) {
      return 70;
    }
    return 88;
  }, [isSourceGraphShown]);

  const localIconsOffset = useMemo(() => {
    if (props.isExpanded) {
      return {
        transform: "translate(0px, -128px)",
      };
    }
    return {
      transform: "translate(0px, 0px)",
    };
  }, [props.isExpanded, isSourceGraphShown, theme]);

  const shadowOpacity = useMemo(() => {
    if (props.isExpanded) {
      return 1;
    }
    return 0;
  }, [props.isExpanded]);

  const onToggleFrom = useCallback(
    (from: "local" | "remote") => {
      const params = {};
      for (const [k, v] of searchParams.entries()) {
        params[k] = v;
      }
      setSearchParams({
        ...params,
        from,
      });
    },
    [searchParams]
  );

  const onGoToLocal = useCallback(() => {
    const params = {};
    for (const [k, v] of searchParams.entries()) {
      params[k] = v;
    }
    setSearchParams({
      ...params,
      from: "local",
    });
  }, [searchParams]);

  const onGoToRemote = useCallback(() => {
    const params = {};
    for (const [k, v] of searchParams.entries()) {
      params[k] = v;
    }
    setSearchParams({
      ...params,
      from: "remote",
    });
  }, [searchParams]);

  return (
    <Container style={panelStyle}>
      <InnerContainer style={innerStyle}>
        <InnerContainerContent>
          {repoExistsLocally && isDaemonConnected && (
            <div style={{ height: 73 }}>
              <LocalRemoteToggle tab={from} onChange={onToggleFrom} />
            </div>
          )}
          <NavigationWrapper>
            {from == "remote" && (
              <RemoteVCSNavController
                isLoading={props.isLoading}
                plugin={props.plugin}
                page={props.page}
                repository={props.repository}
                remoteCommitState={props.remoteCommitState}
                comparisonState={props.comparisonState}
              />
            )}
            {from == "local" && (
              <LocalVCSNavController
                plugin={props.plugin}
                repository={props.repository}
                page={props.page}
                apiResponse={props.apiResponse}
                storage={props.storage}
              />
            )}
          </NavigationWrapper>
        </InnerContainerContent>
      </InnerContainer>
      <OuterShadow
        style={{
          opacity: shadowOpacity,
          height: isFullShadow ? "100%" : "calc(100% - 72px)",
          top: isFullShadow ? 0 : 72,
        }}
      />
      <AdjustIconWrapper onClick={onTogglePanel} style={iconOffset}>
        <AdjustIcon src={adjustIcon} />
      </AdjustIconWrapper>
      {isDaemonConnected && cloneState?.state == "done" && (
        <>
          <RemoteToggleIconWrapper
            style={{
              ...remoteIconsOffset,
              top: remoteIconTop,
              background:
                from == "remote" ? ColorPalette.teal : ColorPalette.gray,
            }}
            onClick={onGoToRemote}
          >
            <ToggleIcon src={GlobeWhite} />
          </RemoteToggleIconWrapper>
          <LocalToggleIconWrapper
            style={{
              ...localIconsOffset,
              top: localIconTop,
              background:
                from == "local" ? ColorPalette.teal : ColorPalette.gray,
            }}
            onClick={onGoToLocal}
          >
            <ToggleIcon src={LaptopWhite} />
          </LocalToggleIconWrapper>
        </>
      )}
    </Container>
  );
};

export default React.memo(VersionControlPanel);
