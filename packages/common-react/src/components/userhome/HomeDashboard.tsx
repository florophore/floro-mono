import React, { useCallback, useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import styled from "@emotion/styled";
import RepoBriefInfoRow from "@floro/storybook/stories/common-components/RepoBriefInfoRow";
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
  Repository,
  OrganizationInvitation,
} from "@floro/graphql-schemas/src/generated/main-client-graphql";
import ChangeNameModal from "./ChangeNameModal";
import {
  useOfflinePhoto,
  useSaveOfflinePhoto,
} from "../../offline/OfflinePhotoContext";
import StorageTab from "@floro/storybook/stories/common-components/StorageTab";
import { useCurrentUserRepos, useLocalRepos } from "../../hooks/repos";
import ColorPalette from "@floro/styles/ColorPalette";
import UserInvite from "./invitations/UserInvite";
import ConfirmRejectInviteModal from "./invitations/ConfirmRejectInviteModal";

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
  max-width: 263px;
  height: 100%;
  display: flex;
  flex-direction: column;
`;
const SideBarTitleWrapper = styled.div`
  display: flex;
  padding: 16px;
  margin: 0;
  align-items: center;
  border-bottom: 1px solid
    ${(props) => props?.theme.colors.sidebarTitleBorderColor};
`;

const SideBarTitle = styled.h5`
  font-family: "MavenPro";
  color: ${(props) => props?.theme.colors.sidebarTitleTextColor};
  font-weight: 600;
  font-size: 1.44rem;
  position: relative;
`;

const RepoContainer = styled.div`
  width: 100%;
  display: flex;
  flex: 5;
  flex-direction: column;
  border-bottom: 1px solid ${(props) => props.theme.colors.commonBorder};
  overflow: hidden;
  max-width: 263px;
  position: relative;
`;

const RepoInnerContainer = styled.div`
  width: 100%;
  flex-direction: column;
  padding: 16px;
  box-sizing: border-box;
  position: relative;
  height: 100%;
  overflow-y: scroll;
  &::-webkit-scrollbar {
    width: 9px;
  }
  &::-webkit-scrollbar-track {
    background: transparent;
  }
  &::-webkit-scrollbar-thumb {
    background-color: rgba(155, 155, 155, 0.5);
    border-radius: 20px;
    border: transparent;
  }
`;

const InvitationContainer = styled.div`
  width: 100%;
  display: flex;
  flex: 4;
  flex-direction: column;
  position: relative;
  max-height: 44.44%;
`;

const TopGradient = styled.div`
  width: 263px;
  position: absolute;
  top: 60.2px;
  height: 16px;
  background: linear-gradient(
    ${(props) => props.theme.gradients.backgroundFullOpacity},
    ${(props) =>props.theme.gradients.backgroundNoOpacity}
  );
`;

const BottomGradiuent = styled.div`
  width: 263px;
  position: absolute;
  bottom: 0px;
  height: 16px;
  background: linear-gradient(
    ${(props) => props.theme.gradients.backgroundNoOpacity},
    ${(props) => props.theme.gradients.backgroundFullOpacity}
  );
`;

const NoReposText = styled.span`
  font-family: "MavenPro";
  color: ${ColorPalette.gray};
  font-weight: 500;
  font-size: 1.4rem;
`

const InvitationsInnerContainer = styled.div`
  width: 100%;
  flex-direction: column;
  padding: 8px 0px 4px 8px;
  box-sizing: border-box;
  position: relative;
  overflow-y: scroll;
  &::-webkit-scrollbar {
    width: 9px;
  }
  &::-webkit-scrollbar-track {
    background: transparent;
  }
  &::-webkit-scrollbar-thumb {
    background-color: rgba(155, 155, 155, 0.5);
    border-radius: 20px;
    border: transparent;
  }
`;


const HomeDashboard = () => {
  const { repositories } = useCurrentUserRepos();
  const [invititationToReject, setInvitationToReject] =
    useState<OrganizationInvitation | null>(null);
  const [showRejectModal, setShowRejectModal] =
    useState<boolean>(false);

  const onShowRejectModal = useCallback((invitation: OrganizationInvitation) => {
    setInvitationToReject(invitation);
    setShowRejectModal(true);
  }, []);
  const onDismissRejectModal = useCallback(() => {
    setInvitationToReject(null);
    setShowRejectModal(false);
  }, []);

  const localRepos = useLocalRepos();
  const localRepoIds = useMemo(() => {
    if (!localRepos) {
      return new Set();
    }
    return new Set(localRepos ?? []);
  }, [localRepos]);

  const { currentUser } = useSession();
  const invitationCount = useMemo(() => {
    return currentUser?.organizationInvitations?.length ?? 0;
  }, [currentUser?.organizationInvitations])

  return (
    <Container>
      <ConfirmRejectInviteModal
        invitation={invititationToReject}
        show={showRejectModal}
        onDismiss={onDismissRejectModal}
      />
      <MainContainer>
      </MainContainer>
      <SideBar>
        <RepoContainer>
          <SideBarTitleWrapper>
            <SideBarTitle>{`Repositories (${repositories.length})`}</SideBarTitle>
          </SideBarTitleWrapper>
          <RepoInnerContainer>
            {repositories.length == 0 && (
              <NoReposText>{"No personal repos created yet"}</NoReposText>
            )}
            {repositories?.map((repo, index) => {
              return (
                <RepoBriefInfoRow
                  repo={repo as Repository}
                  key={index}
                  isLocal={localRepoIds.has(repo?.id)}
                />
              );
            })}
          </RepoInnerContainer>
          <TopGradient />
          <BottomGradiuent />
        </RepoContainer>
        <InvitationContainer>
          <SideBarTitleWrapper>
            <SideBarTitle>{`Invitations (${invitationCount})`}</SideBarTitle>
          </SideBarTitleWrapper>
          <InvitationsInnerContainer>
            {invitationCount == 0 && (
              <NoReposText>{"No invitations to display"}</NoReposText>
            )}
            {currentUser?.organizationInvitations?.map((invitation, index) => {
              return (
                <UserInvite
                  invitation={invitation as OrganizationInvitation}
                  key={index}
                  onRejectInvite={onShowRejectModal}
                />
              );
            })}
          </InvitationsInnerContainer>
          <TopGradient />
          <BottomGradiuent />
        </InvitationContainer>
      </SideBar>
    </Container>
  );
};

export default React.memo(HomeDashboard);
