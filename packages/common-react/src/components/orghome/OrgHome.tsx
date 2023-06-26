import React, { useCallback, useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import styled from "@emotion/styled";
import OrgProfileInfo from "@floro/storybook/stories/common-components/OrgProfileInfo";
import OrgSettingsTab from "@floro/storybook/stories/common-components/OrgSettingsTab";
import MemberSettingsTab from "@floro/storybook/stories/common-components/MemberSettingsTab";
import DevSettingsTab from "@floro/storybook/stories/common-components/DevSettingsTab";
import StorageTab from "@floro/storybook/stories/common-components/StorageTab";
import BillingTab from "@floro/storybook/stories/common-components/BillingTab";
import OrgFollowerTab from "@floro/storybook/stories/common-components/OrgFollowerTab";
import MembersInfoTab from "@floro/storybook/stories/common-components/MembersInfoTab";
import { CropArea } from "@floro/storybook/stories/common-components/PhotoCropper";
import Button from "@floro/storybook/stories/design-system/Button";
import { useDaemonIsConnected } from "../../pubsub/socket";
import RootPhotoCropper from "../RootPhotoCropper";
import {
  useRemoveOrganizationProfilePhotoMutation,
  useUploadOrganizationProfilePhotoMutation,
  Organization,
} from "@floro/graphql-schemas/src/generated/main-client-graphql";
import {
  useOfflinePhoto,
  useSaveOfflinePhoto,
} from "../../offline/OfflinePhotoContext";
import ChangeOrgNameModal from "./ChangeOrgNameModal";
import PluginsTab from "@floro/storybook/stories/common-components/PluginsTab";
import { useIsOnline } from "../../hooks/offline";
import OrgDashboard from "./OrgDashboard";
import ConnectionStatusTab from "@floro/storybook/stories/common-components/ConnectionStatusTab";

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

export interface Props {
  organization?: Organization;
}

const OrgHome = (props: Props) => {
  const navigate = useNavigate();
  const isOnline = useIsOnline();
  const isDaemonConnected = useDaemonIsConnected();
  const [uploadPhoto, uploadPhotoRequest] =
    useUploadOrganizationProfilePhotoMutation();
  const [removePhoto, removePhotoRequest] =
    useRemoveOrganizationProfilePhotoMutation();

  const onGoToCreateOrgRepo = useCallback(() => {
    if (props.organization) {
      navigate(`/org/@/${props.organization.handle}/create-repo`);
    }
  }, [navigate, props.organization]);

  const [profilePhotoFile, setProfilePhotoFile] = useState<null | File>(null);
  const [profilePhotoFileString, setProfilePhotoFileString] =
    useState<null | string>(null);
  const [showProfilePictureCropper, setShowProfilePictureCroppper] =
    useState(false);
  const [showChangeName, setShowChangeName] = useState(false);
  const offlinePhoto = useOfflinePhoto(
    props?.organization?.profilePhoto ?? null
  );

  const savePhoto = useSaveOfflinePhoto();

  const onSelectUploadPhoto = useCallback((file: File, base64: string) => {
    setProfilePhotoFile(file);
    setProfilePhotoFileString(base64);
    setShowProfilePictureCroppper(true);
  }, []);

  const onCancelPhotoUpload = useCallback(() => {
    setProfilePhotoFile(null);
    setProfilePhotoFileString(null);
    setShowProfilePictureCroppper(false);
  }, []);

  const onShowChangeName = useCallback(() => {
    setShowChangeName(true);
  }, []);

  const onHideChangeName = useCallback(() => {
    setShowChangeName(false);
  }, []);

  const onRemovePhoto = useCallback(() => {
    if (
      props?.organization?.membership?.permissions
        ?.canModifyOrganizationSettings &&
      props?.organization?.id
    ) {
      removePhoto({
        variables: {
          organizationId: props.organization.id,
        },
      });
    }
  }, [removePhoto, props.organization]);

  const onSaveProfilePhoto = useCallback(
    (cropArea: CropArea) => {
      uploadPhoto({
        variables: {
          organizationId: props?.organization?.id ?? "",
          file: profilePhotoFile,
          x: cropArea.x,
          y: cropArea.y,
          width: cropArea.width,
          height: cropArea.height,
        },
      });
    },
    [profilePhotoFile, uploadPhoto, props.organization]
  );

  useEffect(() => {
    if (
      uploadPhotoRequest.data?.uploadOrganizationProfilePhoto?.__typename ===
      "UploadOrganizationProfilePhotoSuccess"
    ) {
      setShowProfilePictureCroppper(false);
      if (
        uploadPhotoRequest.data?.uploadOrganizationProfilePhoto?.organization
          ?.profilePhoto?.id
      ) {
        savePhoto(
          uploadPhotoRequest.data?.uploadOrganizationProfilePhoto?.organization
            ?.profilePhoto
        );
      }
    }
  }, [uploadPhotoRequest.data, savePhoto]);

  console.log("ORG", props.organization)

  return (
    <>
      {props.organization && (
        <ChangeOrgNameModal
          show={showChangeName}
          organization={props.organization}
          onDismissModal={onHideChangeName}
        />
      )}
      <RootPhotoCropper
        title={"Upload Profile Picture"}
        src={profilePhotoFileString ?? ""}
        show={showProfilePictureCropper}
        isLoading={uploadPhotoRequest.loading}
        onCancel={onCancelPhotoUpload}
        onSave={onSaveProfilePhoto}
        isDisabled={!isOnline}
      />
      <Background>
        {props.organization && (
          <UserNav>
            <ProfileInfoWrapper>
              <OrgProfileInfo
                organization={props.organization}
                isEdittable={
                  (props?.organization?.membership?.permissions
                    ?.canModifyOrganizationSettings ?? false) && isOnline
                }
                onSelectFile={onSelectUploadPhoto}
                isLoading={
                  removePhotoRequest.loading || uploadPhotoRequest.loading
                }
                onRemoveProfilePhoto={onRemovePhoto}
                onOpenNameChange={onShowChangeName}
                offlinePhoto={offlinePhoto}
              />
            </ProfileInfoWrapper>
            <BottomNavContainer>
              <TopInfo>
                {false && (
                  <OrgFollowerTab followerCount={0} isFollowing={false} isLoading={false} isDisabled={!isOnline} />
                )}
                <div style={{ marginTop: 0, display: "flex" }}>
                  <MembersInfoTab
                    membersCount={props?.organization?.membersActiveCount ?? 0}
                    invitedCount={
                      props?.organization?.invitationsSentCount ?? 0
                    }
                  />
                </div>
                <div style={{ marginTop: 16, display: "flex" }}>
                  <MemberSettingsTab />
                </div>
                <div style={{ marginTop: 16, display: "flex" }}>
                  <OrgSettingsTab />
                </div>
                <div style={{ marginTop: 16, display: "flex" }}>
                  <DevSettingsTab />
                </div>
                <div style={{ marginTop: 16, display: "flex" }}>
                  <PluginsTab pluginCount={0} />
                </div>
                <div style={{ marginTop: 16, display: "flex" }}>
                  <StorageTab
                    utilizedDiskSpaceBytes={
                      props?.organization?.utilizedDiskSpaceBytes ?? 0
                    }
                    diskSpaceLimitBytes={
                      props?.organization?.diskSpaceLimitBytes ?? 0
                    }
                  />
                </div>
                <div style={{ marginTop: 16, display: "flex" }}>
                  <BillingTab />
                </div>
                <div style={{ marginTop: 16, display: "flex" }}>
                  <ConnectionStatusTab isConnected={isDaemonConnected ?? false} />
                </div>
              </TopInfo>
              <ButtonActionWrapper>
                {props?.organization?.membership?.permissions
                  ?.canCreateRepos && (
                  <Button
                    onClick={onGoToCreateOrgRepo}
                    style={{ maxWidth: "100%" }}
                    label={"create repo"}
                    size={"medium"}
                    bg={"purple"}
                    isDisabled={!isOnline}
                  />
                )}
              </ButtonActionWrapper>
            </BottomNavContainer>
          </UserNav>
        )}
        <MainContent>
          {!!props.organization && (
            <OrgDashboard organization={props.organization}/>
          )}
        </MainContent>
      </Background>
    </>
  );
};

export default React.memo(OrgHome);
