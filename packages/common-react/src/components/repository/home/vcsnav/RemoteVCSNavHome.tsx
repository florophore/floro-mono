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
import { useCloneRepo, useCloneState, useRepoExistsLocally } from "../../local/hooks/local-hooks";

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
interface Props {
  repository: Repository;
}

const RemoteVCSNavHome = (props: Props) => {
  const { data: repoExistsLocally, isLoading } = useRepoExistsLocally(
    props.repository
  );
  const cloneRepoMutation = useCloneRepo(props.repository);
  const isDaemonConnected = useDaemonIsConnected();
  const cloneRepo = useCallback(() => {
    cloneRepoMutation.mutate();
  }, [props.repository?.id]);

  const { data: cloneState, isLoading: cloneStateLoading} = useCloneState(props.repository);

  return (
    <InnerContent>
      <TopContainer></TopContainer>
      <BottomContainer>
        {(cloneState?.state != "none" || !repoExistsLocally) && !isLoading && !cloneStateLoading &&  (
          <Button
            label="clone repo"
            bg={"orange"}
            size={"extra-big"}
            onClick={cloneRepo}
            isLoading={cloneRepoMutation.isLoading}
            isDisabled={!isDaemonConnected}
          />
        )}
      </BottomContainer>
    </InnerContent>
  );
};

export default React.memo(RemoteVCSNavHome);