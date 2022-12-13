import React, {
  useMemo,
  useState,
  useCallback,
  useRef,
  useEffect,
} from "react";
import { Repository } from "@floro/graphql-schemas/src/generated/main-client-graphql";
import { Link } from "react-router-dom";
import styled from "@emotion/styled";
import { css } from "@emotion/css";
import { useTheme } from "@emotion/react";
import ColorPalette from "@floro/styles/ColorPalette";
import { useSession } from "../../session/session-context";
import BranchSelector from "@floro/storybook/stories/common-components/BranchSelector";
import CommitSelector from "@floro/storybook/stories/common-components/CommitSelector";
import {
  useOfflinePhoto,
  useOfflinePhotoMap,
} from "../../offline/OfflinePhotoContext";
import { useUserOrganizations } from "../../hooks/offline";
import AdjustExtend from "@floro/common-assets/assets/images/icons/adjust.extend.svg";
import AdjustShrink from "@floro/common-assets/assets/images/icons/adjust.shrink.svg";
import LaptopLight from "@floro/common-assets/assets/images/icons/laptop.light.svg";
import GlobeLight from "@floro/common-assets/assets/images/icons/globe.light.svg";
import Button from "@floro/storybook/stories/design-system/Button";
import { useQuery, useMutation } from "react-query";
import axios from 'axios';

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
  background: ${ColorPalette.teal};
  left: -40px;
  top: 12px;
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
  background: ${ColorPalette.gray};
  left: -40px;
  top: 64px;
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

interface Props {
  repository: Repository;
}

const useRepoExistsLocally = (repository: Repository) => {
    return useQuery("repo:" + repository.id, async () => {
        try {
            if (!repository.id) {
                return false;
            }
            const result = await axios.get('http://localhost:63403/repo/exists/' + repository.id)
            return result?.data?.exists ?? false;
        } catch(e) {
            return false;
        }
    }, { cacheTime: 0});
}

const useCloneRepo = (repository: Repository) => {
  return useMutation({
    mutationFn: () => {
        return axios.post(
          "http://localhost:63403/repo/clone/" + repository.id
        );
    },
  });
};

const VersionControlPanel = (props: Props) => {
  const { data: repoExistsLocally } = useRepoExistsLocally(props.repository);
  const cloneRepoMutation = useCloneRepo(props.repository);
  const cloneRepo = useCallback(() => {
    cloneRepoMutation.mutate();
  }, [props.repository?.id]);
  const theme = useTheme();
  const [isExpanded, setIsExpanded] = useState(true);
  const adjustIcon = useMemo(
    () => (isExpanded ? AdjustShrink : AdjustExtend),
    [isExpanded]
  );

  const onTogglePanel = useCallback(() => {
    setIsExpanded(!isExpanded);
  }, [isExpanded]);

  const panelStyle = useMemo(() => {
    if (isExpanded) {
      return {
        borderLeft: `1px solid ${theme.colors.versionControllerBorderColor}`,
      };
    }
    return {
      borderLeft: `0px solid ${theme.colors.versionControllerBorderColor}`,
    };
  }, [isExpanded, theme]);

  const innerStyle = useMemo(() => {
    if (isExpanded) {
      return {
        width: 503,
      };
    }
    return {
      width: 0,
    };
  }, [isExpanded, theme]);

  const iconOffset = useMemo(() => {
    if (isExpanded) {
      return {
        left: -41,
      };
    }
    return {
      left: -40,
    };
  }, [isExpanded, theme]);

  const remoteIconsOffset = useMemo(() => {
    if (isExpanded) {
      return {
        transform: "translate(0px, -52px)",
      };
    }
    return {
      transform: "translate(0px, 0px)",
    };
  }, [isExpanded, theme]);

  const localIconsOffset = useMemo(() => {
    if (isExpanded) {
      return {
        transform: "translate(0px, -104px)",
      };
    }
    return {
      transform: "translate(0px, 0px)",
    };
  }, [isExpanded, theme]);

  return (
    <Container style={panelStyle}>
      <InnerContainer style={innerStyle}>
        <InnerContainerContent>
          <TopContainer>
            <div style={{ marginTop: 24 }}>
              <BranchSelector />
            </div>
            <div style={{ marginTop: 12 }}>
              <CommitSelector />
            </div>
          </TopContainer>
          <BottomContainer>
            {!repoExistsLocally &&
                <Button label="clone repo" bg={"orange"} size={"big"} onClick={cloneRepo} />
            }
          </BottomContainer>
        </InnerContainerContent>
      </InnerContainer>
      <AdjustIconWrapper onClick={onTogglePanel} style={iconOffset}>
        <AdjustIcon src={adjustIcon} />
      </AdjustIconWrapper>
      {repoExistsLocally && (
        <>
          <RemoteToggleIconWrapper style={remoteIconsOffset}>
            <ToggleIcon src={GlobeLight} />
          </RemoteToggleIconWrapper>
          <LocalToggleIconWrapper style={localIconsOffset}>
            <ToggleIcon src={LaptopLight} />
          </LocalToggleIconWrapper>
        </>
      )}
    </Container>
  );
};

export default React.memo(VersionControlPanel);
