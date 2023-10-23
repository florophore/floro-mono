import React, { useCallback, useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import styled from "@emotion/styled";
import ProfileInfo from "@floro/storybook/stories/common-components/ProfileInfo";
import FollowerInfo from "@floro/storybook/stories/common-components/FollowerInfo";
import UserSettingsTab from "@floro/storybook/stories/common-components/UserSettingsTab";
import DevSettingsTab from "@floro/storybook/stories/common-components/DevSettingsTab";
import PluginsTab from "@floro/storybook/stories/common-components/PluginsTab";
import ConnectionStatusTab from "@floro/storybook/stories/common-components/ConnectionStatusTab";
import {
  CropArea,
} from "@floro/storybook/stories/common-components/PhotoCropper";
import Button from "@floro/storybook/stories/design-system/Button";
import { useSession } from "../../session/session-context";
import { useDaemonIsConnected } from "../../pubsub/socket";
import RootPhotoCropper from "../RootPhotoCropper";
import { User, useRemoveUserProfilePhotoMutation, useUploadUserProfilePhotoMutation, useCurrentUserHomeQuery, Organization, useUserPluginUpdatedSubscription } from "@floro/graphql-schemas/src/generated/main-client-graphql";
import ChangeNameModal from "./ChangeNameModal";
import { useOfflinePhoto, useSaveOfflinePhoto } from "../../offline/OfflinePhotoContext";
import StorageTab from "@floro/storybook/stories/common-components/StorageTab";
import HomeDashboard from "./HomeDashboard";
import { useIsOnline } from "../../hooks/offline";
import UserSubscriber from "../subscribers/UserSubscriber";
import ProfileDashboard from "./ProfileDashboard";
import ColorPalette from "@floro/styles/ColorPalette";
import OrganizationRow from "./OrganizationRow";

const Background = styled.div`
  background-color: ${(props) => props.theme.background};
  flex: 1;
  height: 100%;
  width: 100%;
  display: flex;
  flex-direction: row;
  justify-content: flex-start;
  align-items: space-between;
  user-select: none;
`;

const UserNav = styled.div`
  width: 263px;
  border-right: 1px solid ${(props) => props.theme.colors.commonBorder};
  height: 100%;
  display: flex;
  flex-direction: column;
  overflow: hidden;
`;

const BottomNavContainer = styled.div`
  flex: 1;
  padding: 24px 16px;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  align-items: center;
`;

const ButtonActionWrapper = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  width: 100%;
`;
const MainContent = styled.div`
  flex: 1;
  display: flex;
  justify-content: center;
  align-items: center;
`;

const ProfileInfoWrapper = styled.div`
  border-bottom: 1px solid ${(props) => props.theme.colors.commonBorder};
`;
const TopInfo = styled.div`
  width: 100%;
  display: flex;
  flex-direction: column;
`;

const OrgContainer = styled.div`
  width: 100%;
  display: flex;
  flex: 4;
  flex-direction: column;
  position: relative;
  max-height: 44.44%;
  border-top: 1px solid ${(props) => props.theme.colors.commonBorder};
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

const OrgInnerContainer = styled.div`
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

interface Props {
  user: User;
}

const UserProfile = (props: Props) => {
  const isDaemonConnected = useDaemonIsConnected();

  const offlinePhoto = useOfflinePhoto(props.user?.profilePhoto ?? null);

  return (
    <>
      <Background>
        <UserNav>
          <ProfileInfoWrapper>
            <ProfileInfo
              user={props.user}
              isEdittable={false}
              offlinePhoto={offlinePhoto}
            />
          </ProfileInfoWrapper>
          <BottomNavContainer>
            <TopInfo>
              <div style={{ marginTop: 16, display: "flex" }}>
                {(props.user?.pluginCount ?? 0) > 0 && (
                  <Link to={`/user/@/${props.user.username}/plugins`}>
                    <PluginsTab pluginCount={props.user?.pluginCount ?? 0} isClickable={true} />
                  </Link>
                )}
                {(props.user?.pluginCount ?? 0) == 0 && (
                  <PluginsTab pluginCount={props.user?.pluginCount ?? 0} isClickable={false} />
                )}
              </div>
              <div style={{ marginTop: 16, display: "flex" }}>
                <ConnectionStatusTab isConnected={isDaemonConnected ?? false} />
              </div>
            </TopInfo>
            <ButtonActionWrapper>
            </ButtonActionWrapper>
          </BottomNavContainer>
          <OrgContainer>
            <SideBarTitleWrapper>
              <SideBarTitle>{`Organizations`}</SideBarTitle>
            </SideBarTitleWrapper>
            <OrgInnerContainer>
              {props.user?.organizations?.length == 0 && (
                <NoReposText>{"No organizations to display"}</NoReposText>
              )}
              {props.user?.organizations?.map((organization, index) => {
                return (
                  <OrganizationRow
                    key={index}
                    organization={organization as Organization}
                  />
                );
              })}
            </OrgInnerContainer>
            <TopGradient />
            <BottomGradiuent />
          </OrgContainer>
        </UserNav>
        <MainContent>
          <ProfileDashboard user={props.user}/>
        </MainContent>
      </Background>
    </>
  );
};

export default React.memo(UserProfile);
