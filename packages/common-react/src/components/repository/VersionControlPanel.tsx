import React, {
  useMemo,
  useState,
  useCallback,
  useRef,
  useEffect,
} from "react";
import { Repository } from "@floro/graphql-schemas/src/generated/main-client-graphql";
import { Link, useSearchParams } from "react-router-dom";
import styled from "@emotion/styled";
import { css } from "@emotion/css";
import { useTheme } from "@emotion/react";
import ColorPalette from "@floro/styles/ColorPalette";
import { useSession } from "../../session/session-context";
import CommitSelector from "@floro/storybook/stories/repo-components/CommitSelector";
import {
  useOfflinePhoto,
  useOfflinePhotoMap,
} from "../../offline/OfflinePhotoContext";
import { useUserOrganizations } from "../../hooks/offline";
import AdjustExtend from "@floro/common-assets/assets/images/icons/adjust.extend.svg";
import AdjustShrink from "@floro/common-assets/assets/images/icons/adjust.shrink.svg";
import LaptopWhite from "@floro/common-assets/assets/images/icons/laptop.white.svg";
import GlobeWhite from "@floro/common-assets/assets/images/icons/globe.white.svg";
import Button from "@floro/storybook/stories/design-system/Button";
import LocalRemoteToggle from "@floro/storybook/stories/common-components/LocalRemoteToggle";
import { useQuery, useMutation, useQueryClient } from "react-query";
import axios from 'axios';
import { useDaemonIsConnected } from "../../pubsub/socket";
import RemoteVCSNavHome from "./home/vcsnav/RemoteVCSNavHome";
import LocalVCSNavController from "./local/vcsnav/LocalVCSNavController";
import { LocalVCSNavProvider, useLocalVCSNavContext } from "./local/vcsnav/LocalVCSContext";
import { useSourceGraphIsShown } from "./ui-state-hook";

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
  display: flex;
  height: 100%;
  width: 502px;
  flex-direction: column;
  justify-content: space-between;
`;

const InnerContent = styled.div`
  display: flex;
  height: 100%;
  width: 100%;
  flex-direction: column;
  justify-content: space-between;
`;

const TopContainer = styled.div`
  display: flex;
  flex-direction: column;
  height: 100%;
  position: relative;
  align-items: center;
`;

const BottomContainer = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: flex-end;
  height: 100%;
  position: relative;
  align-items: center;
  padding: 24px;
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
  box-shadow: -2px 4px 3px 4px ${props => props.theme.shadows.versionControlSideBarShadow};
  transform: opacity 400ms;
`;

interface Props {
  repository: Repository;
  isExpanded: boolean;
  onSetIsExpanded: (isExpanded: boolean) => void;
}

const useRepoExistsLocally = (repository: Repository) => {
    return useQuery("repo-exists:" + repository.id, async () => {
        try {
            if (!repository.id) {
                return false;
            }
            const result = await axios.get(`http://localhost:63403/repo/${repository.id}/exists`)
            return result?.data?.exists ?? false;
        } catch(e) {
            return false;
        }
    }, { cacheTime: 0});
}

const useCloneRepo = (repository: Repository) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => {
        return axios.get(
          `http://localhost:63403/repo/${repository.id}/clone`
        );
    },
    onSuccess: (result) => {
      if (result?.data?.status == "success") {
        queryClient.invalidateQueries("repo-exists:" + repository.id);
        queryClient.invalidateQueries("local-repos");
      }
    }
  });
};

const VersionControlPanel = (props: Props) => {
  const [searchParams, setSearchParams] = useSearchParams();
  const from: "remote"|"local" = searchParams.get?.('from') as "remote"|"local" ?? "remote";
  const { data: repoExistsLocally, isLoading } = useRepoExistsLocally(props.repository);
  const cloneRepoMutation = useCloneRepo(props.repository);
  const sourceGraphIsShown = useSourceGraphIsShown();
  const isFullShadow = useMemo(() => {
    if (sourceGraphIsShown) {
      return true;
    }
    return false;
  }, [sourceGraphIsShown]);
  const cloneRepo = useCallback(() => {
    cloneRepoMutation.mutate();
  }, [props.repository?.id]);
  const theme = useTheme();
  const isDaemonConnected = useDaemonIsConnected();
  const adjustIcon = useMemo(
    () => (props.isExpanded ? AdjustShrink : AdjustExtend),
    [props.isExpanded]
  );

  useEffect(() => {
    // open expansion on load
    const timeout = setTimeout(() => {
      props.onSetIsExpanded(true);
    }, 150);
    return () => {
      clearTimeout(timeout);
    }
  }, []);

  useEffect(() => {
    if (!isDaemonConnected) {
      setSearchParams({
        from: "remote"
      });
    }

  }, [searchParams, isDaemonConnected]);

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

  const onToggleFrom = useCallback((from: "local"|"remote") => {
    const params = {};
    for (const [k,v] of searchParams.entries()) {
      params[k] = v;
    }
    setSearchParams({
      ...params,
      from
    });

  }, [searchParams]);

  const onGoToLocal = useCallback(() => {
    const params = {};
    for (const [k,v] of searchParams.entries()) {
      params[k] = v;
    }
    setSearchParams({
      ...params,
      from: "local"
    });

  }, [searchParams]);

  const onGoToRemote = useCallback(() => {
    const params = {};
    for (const [k,v] of searchParams.entries()) {
      params[k] = v;
    }
    setSearchParams({
      ...params,
      from: "remote"
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
          {from == "remote" && (
            <RemoteVCSNavHome repository={props.repository} />
          )}
          {from == "local" && (
            <LocalVCSNavController repository={props.repository} />
          )}
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
      {repoExistsLocally && isDaemonConnected && (
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
