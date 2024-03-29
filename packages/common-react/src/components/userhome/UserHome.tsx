import React, { useCallback, useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import styled from "@emotion/styled";
import ProfileInfo from "@floro/storybook/stories/common-components/ProfileInfo";
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
import {
  useRemoveUserProfilePhotoMutation,
  useUploadUserProfilePhotoMutation,
} from "@floro/graphql-schemas/src/generated/main-client-graphql";
import ChangeNameModal from "./ChangeNameModal";
import { useOfflinePhoto, useSaveOfflinePhoto } from "../../offline/OfflinePhotoContext";
import HomeDashboard from "./HomeDashboard";
import { useIsOnline } from "../../hooks/offline";
import CertModal from "../cert/CertModal";

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

interface Props {
  notFound?: boolean;
}

const UserHome = (props: Props) => {
  const { currentUser } = useSession();
  const isDaemonConnected = useDaemonIsConnected();
  const isOnline = useIsOnline();
  const navigate = useNavigate();
  const [uploadPhoto, uploadPhotoRequest] = useUploadUserProfilePhotoMutation();
  const [removePhoto, removePhotoRequest] = useRemoveUserProfilePhotoMutation();

  const onGoToCreateOrg = useCallback(() => {
    navigate("/home/create-org");
  }, [navigate]);

  const onGoToCreateUserRepo = useCallback(() => {
    navigate("/home/create-repo");
  }, [navigate]);

  const [profilePhotoFile, setProfilePhotoFile] = useState<null | File>(null);
  const [profilePhotoFileString, setProfilePhotoFileString] =
    useState<null | string>(null);
  const [showProfilePictureCropper, setShowProfilePictureCroppper] =
    useState(false);
  const [showChangeName, setShowChangeName] =
    useState(false);

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

  const onSaveProfilePhoto = useCallback(
    (cropArea: CropArea) => {
      uploadPhoto({
        variables: {
          file: profilePhotoFile,
          x: cropArea.x,
          y: cropArea.y,
          width: cropArea.width,
          height: cropArea.height,
        }
      })
    },
    [profilePhotoFile, uploadPhoto]
  );
  useEffect(() => {
    if (uploadPhotoRequest.data?.uploadUserProfilePhoto?.__typename === "UploadUserProfilePhotoSuccess") {
      setShowProfilePictureCroppper(false);
      if (uploadPhotoRequest.data?.uploadUserProfilePhoto?.user?.profilePhoto) {
        savePhoto(uploadPhotoRequest.data?.uploadUserProfilePhoto?.user?.profilePhoto);
      }
    }
  }, [uploadPhotoRequest.data, savePhoto])

  const offlinePhoto = useOfflinePhoto(currentUser?.profilePhoto ?? null);

  const [showCertsModal, setShowCertsModal] = useState(false);

  const onCloseCertsModal = useCallback(() => {
    setShowCertsModal(false);
  }, [])

  return (
    <>
      <CertModal show={showCertsModal && !!isDaemonConnected} onClose={onCloseCertsModal}/>
      <RootPhotoCropper
        title={"Upload Profile Picture"}
        src={profilePhotoFileString ?? ""}
        show={showProfilePictureCropper}
        isLoading={uploadPhotoRequest.loading}
        onCancel={onCancelPhotoUpload}
        onSave={onSaveProfilePhoto}
        isDisabled={!isOnline}
      />
      <ChangeNameModal
        show={showChangeName}
        onDismissModal={onHideChangeName}
      />
      <Background>
        <UserNav>
          <ProfileInfoWrapper>
            <ProfileInfo
              user={currentUser}
              isEdittable={isOnline}
              onSelectFile={onSelectUploadPhoto}
              isLoading={
                removePhotoRequest.loading || uploadPhotoRequest.loading
              }
              onRemoveProfilePhoto={removePhoto}
              onOpenNameChange={onShowChangeName}
              offlinePhoto={offlinePhoto}
            />
          </ProfileInfoWrapper>
          <BottomNavContainer>
            <TopInfo>
              <div style={{ marginTop: 0, display: "flex" }}>
                <Link to={"/home/settings"}>
                  <UserSettingsTab />
                </Link>
              </div>
              <div style={{ marginTop: 16, display: "flex" }}>
                <Link to={"/home/local/api"}>
                  <DevSettingsTab />
                </Link>
              </div>
              <div style={{ marginTop: 16, display: "flex" }}>
                <Link to={"/home/plugins"}>
                  <PluginsTab
                    pluginCount={currentUser?.pluginCount ?? 0}
                    isClickable={true}
                  />
                </Link>
              </div>
              <div style={{ marginTop: 16, display: "flex" }}>
                <ConnectionStatusTab
                  onClick={() => {
                    if (isDaemonConnected) {
                      setShowCertsModal(true);
                    }
                  }}
                  isConnected={isDaemonConnected ?? false}
                />
              </div>
            </TopInfo>
            <ButtonActionWrapper>
              <Button
                onClick={onGoToCreateUserRepo}
                style={{ marginBottom: 16, maxWidth: "100%" }}
                label={"create repo"}
                size={"medium"}
                bg={"purple"}
                isDisabled={!isOnline}
              />
              <Button
                onClick={onGoToCreateOrg}
                style={{ maxWidth: "100%" }}
                label={"create org"}
                size={"medium"}
                bg={"teal"}
                isDisabled={!isOnline}
              />
            </ButtonActionWrapper>
          </BottomNavContainer>
        </UserNav>
        <MainContent>
          {currentUser && <HomeDashboard notFound={props.notFound} />}
        </MainContent>
      </Background>
    </>
  );
};

export default React.memo(UserHome);
