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
import { useSession } from "../../../../session/session-context";
import CurrentInfo from "@floro/storybook/stories/repo-components/CurrentInfo";
import RepoActionButton from "@floro/storybook/stories/repo-components/RepoActionButton";
import CommitSelector from "@floro/storybook/stories/repo-components/CommitSelector";
import {
  useOfflinePhoto,
  useOfflinePhotoMap,
} from "../../../../offline/OfflinePhotoContext";
import { useUserOrganizations } from "../../../../hooks/offline";
import AdjustExtend from "@floro/common-assets/assets/images/icons/adjust.extend.svg";
import AdjustShrink from "@floro/common-assets/assets/images/icons/adjust.shrink.svg";
import LaptopWhite from "@floro/common-assets/assets/images/icons/laptop.white.svg";
import GlobeWhite from "@floro/common-assets/assets/images/icons/globe.white.svg";
import Button from "@floro/storybook/stories/design-system/Button";
import LocalRemoteToggle from "@floro/storybook/stories/common-components/LocalRemoteToggle";
import { useQuery, useMutation, useQueryClient } from "react-query";
import axios from 'axios';
import { useDaemonIsConnected } from "../../../../pubsub/socket";
import { ApiReponse } from "@floro/floro-lib/src/repo";
import { useLocalVCSNavContext } from "./LocalVCSContext";

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
  padding: 16px;
`;

const BottomContainer = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: flex-end;
  height: 100%;
  position: relative;
  align-items: center;
  padding: 24px 16px;
`;

const ButtonRow = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;
  width: 100%;
  justify-content: space-between;
`;

const ButtonCol = styled.div`
  display: flex;
  flex-direction: column;
  width: 100%;
`;

interface Props {
  repository: Repository;
  apiResponse: ApiReponse;
}

const LocalVCSViewMode = (props: Props) => {
    const { setSubAction } = useLocalVCSNavContext();
    const onShowBranches = useCallback(() => {
        setSubAction("branches");
    }, []);

    const onShowEditBranch = useCallback(() => {
        setSubAction("edit_branch");
    }, []);

    useEffect(() => {
      const commandToggleListeners = (event: KeyboardEvent) => {
        if (event.metaKey && event.shiftKey && event.key == "b") {
          onShowBranches();
        }
      };
      window.addEventListener("keydown", commandToggleListeners);
      return () => {
        window.removeEventListener("keydown", commandToggleListeners);
      };
    }, []);
  return (
    <InnerContent>
      <TopContainer>
        <CurrentInfo
          respository={props.repository}
          showWIP
          showBranchButtons
          isWIP={props.apiResponse.isWIP}
          branch={props.apiResponse.branch}
          baseBranch={props.apiResponse.baseBranch}
          lastCommit={props.apiResponse.lastCommit}
          onShowBranches={onShowBranches}
          onShowEditBranch={onShowEditBranch}
        />
        <ButtonRow style={{marginTop: 24}}>
          <RepoActionButton
          label={"compare"} icon={"compare"} />
          <RepoActionButton
          label={"source graph"} icon={"source-graph"} />
        </ButtonRow>
      </TopContainer>
      <BottomContainer>
          <Button
            label={"pull remote"}
            bg={"purple"}
            size={"extra-big"}
          />
      </BottomContainer>
    </InnerContent>
  );
};

export default React.memo(LocalVCSViewMode);