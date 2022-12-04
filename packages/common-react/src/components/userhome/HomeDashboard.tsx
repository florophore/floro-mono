import React, { useCallback, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import styled from "@emotion/styled";
import ProfileInfo from "@floro/storybook/stories/common-components/ProfileInfo";
import FollowerInfo from "@floro/storybook/stories/common-components/FollowerInfo";
import UserSettingsTab from "@floro/storybook/stories/common-components/UserSettingsTab";
import DevSettingsTab from "@floro/storybook/stories/common-components/DevSettingsTab";
import PluginsTab from "@floro/storybook/stories/common-components/PluginsTab";
import ConnectionStatusTab from "@floro/storybook/stories/common-components/ConnectionStatusTab";
import { CropArea } from "@floro/storybook/stories/common-components/PhotoCropper";
import Button from "@floro/storybook/stories/design-system/Button";
import { useSession } from "../../session/session-context";
import { useDaemonIsConnected } from "../../pubsub/socket";
import RootPhotoCropper from "../RootPhotoCropper";
import {
  User,
  useRemoveUserProfilePhotoMutation,
  useUploadUserProfilePhotoMutation,
  useCurrentUserHomeQuery,
  Organization,
} from "@floro/graphql-schemas/src/generated/main-client-graphql";
import ChangeNameModal from "./ChangeNameModal";
import {
  useOfflinePhoto,
  useSaveOfflinePhoto,
} from "../../offline/OfflinePhotoContext";
import StorageTab from "@floro/storybook/stories/common-components/StorageTab";
import { useCurrentUserRepos } from "../../hooks/repos";

const Container = styled.div`
  flex: 1;
  height: 100%;
  width: 100%;
  display: flex;
  flex-direction: row;
  justify-content: flex-start;
  align-items: space-between;
  user-select: none;
`;

const MainContainer = styled.div`
  width: 263px;
  border-right: 1px solid ${(props) => props.theme.colors.commonBorder};
  height: 100%;
  display: flex;
  flex-grow: 1;
  flex-direction: column;
`;

const SideBar = styled.div`
  width: 263px;
  height: 100%;
  display: flex;
  flex-direction: column;
`;
const SideBarTitleWrapper = styled.div`
  display: flex;
  padding: 16px;
  margin: 0;
  justify-content: center;
  align-items: center;
  border-bottom: 1px solid ${(props) => props?.theme.colors.sidebarTitleBorderColor};
`

const SideBarTitle = styled.h5`
  font-family: "MavenPro";
  color: ${(props) => props?.theme.colors.sidebarTitleTextColor};
  font-weight: 600;
  font-size: 1.44rem;
  text-align-center;
`;

const RepoContainer = styled.div`
  width: 100%;
  display: flex;
  flex: 5;
  flex-direction: column;
  border-bottom: 1px solid ${(props) => props.theme.colors.commonBorder};
`;

const InvitationContainer = styled.div`
  width: 100%;
  display: flex;
  flex: 4;
  flex-direction: column;
`;

const HomeDashboard = () => {
  const { repositories } = useCurrentUserRepos();

  return (
    <Container>
      <MainContainer></MainContainer>
      <SideBar>
        <RepoContainer>
          <SideBarTitleWrapper>
            <SideBarTitle>{"Repositories"}</SideBarTitle>
          </SideBarTitleWrapper>
        </RepoContainer>
        <InvitationContainer>
          <SideBarTitleWrapper>
            <SideBarTitle>{"Invitations"}</SideBarTitle>
          </SideBarTitleWrapper>
        </InvitationContainer>
      </SideBar>
    </Container>
  );
};

export default React.memo(HomeDashboard);
