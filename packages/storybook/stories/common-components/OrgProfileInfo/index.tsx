import React, { useState, useMemo, useCallback, useEffect } from "react";
import styled from "@emotion/styled";
import ColorPalette, { Opacity } from "@floro/styles/ColorPalette";
import { Organization, User } from "@floro/graphql-schemas/build/generated/main-graphql";
import UserProfilePhoto from "../UserProfilePhoto";
import RedXCircleXLight from "@floro/common-assets/assets/images/icons/red_x_circle.light.svg";
import RedXCircleXDark from "@floro/common-assets/assets/images/icons/red_x_circle.dark.svg";
import EditLight from "@floro/common-assets/assets/images/icons/edit.light.svg";
import EditDark from "@floro/common-assets/assets/images/icons/edit.dark.svg";
import { useTheme } from "@emotion/react";
import DotsLoader from "../../design-system/DotsLoader";
import OrgProfilePhoto from "../OrgProfilePhoto";

const Container = styled.div`
  width: 263px;
  padding: 16px;
  display: flex;
  flex-direction: column;
  align-items: center;
`;

const PictureContainer = styled.div`
  height: 168px;
  width: 168px;
  background: ${ColorPalette.white};
  position: relative;
  border-radius: 50%;
`;

const OverlayContainer = styled.div`
  top: 0;
  left: 0;
  position: absolute;
  height: 168px;
  width: 168px;
  background-color: ${(props) => props.theme.colors.profileHoverOpacity};
  display: flex;
  flex-direction: column;
  justify-content: flex-end;
  cursor: pointer;
  overflow: hidden;
  border-radius: 15%;
`;

const LoaderOverlayContainer = styled.div`
  top: 0;
  left: 0;
  position: absolute;
  height: 168px;
  width: 168px;
  background-color: ${(props) => props.theme.colors.profileHoverOpacity};
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  cursor: progress;
  overflow: hidden;
  border-radius: 15%;
`;

const EditPhotoTextContainer = styled.div`
  height: 36px;
  width: 100%;
  background-color: ${(props) => props.theme.colors.profileHoverDeepOpacity};
  display: flex;
  justify-content: center;
  align-items: center;
`;

const EditTextLabel = styled.span`
  font-family: "MavenPro";
  font-size: 1.1rem;
  font-weight: 400;
  color: ${ColorPalette.white};
`;

const UploadInput = styled.input`
    top: 0;
    left: 0;
    position: absolute;
    height: 168px;
    width: 168px;
    opacity: 0;
    cursor: pointer;
`;

const RemoveUpload = styled.div`
    top: 3px;
    right: 3px;
    position: absolute;
    height: 36px;
    width: 36px;
    border-radius: 50%;
    cursor: pointer;
    transition: opacity 500ms;
`;

const RemoveIcon = styled.img`
  height: 100%;
  width: 100%;
`;
const FullnameContainer = styled.div`
  text-align: center;
  color: ${(props) => props.theme.colors.profileInfoNameTextColor};
  margin-top: 12px;
  position: relative;
`;

const EditNameIconContainer = styled.div`
    top: 12px;
    right: -9px;
    position: absolute;
    height: 24px;
    width: 24px;
    cursor: pointer;
    transition: opacity 500ms;
`;

const EditNameIcon = styled.img`
  height: 100%;
  width: 100%;
`;

const Fullname = styled.p`
  font-family: "MavenPro";
  font-size: 1.44rem;
  font-weight: 600;
  text-align: center;
  margin: 12px 18px;
  color: ${(props) => props.theme.colors.profileInfoNameTextColor};
  padding: 0;
`;

const Username = styled.p`
  font-family: "MavenPro";
  font-size: 1.2rem;
  font-weight: 600;
  text-align: center;
  color: ${(props) => props.theme.colors.profileInfoUsernameTextColor};
  padding: 0;
  margin: 0 0 24px 0;
`;

const upcaseFirst = (str: string) => {
  const rest = str.substring(1);
  return (str?.[0]?.toUpperCase() ?? "") + rest;
};

export interface Props {
  organization: Organization|null;
  isEdittable: boolean;
  onSelectFile?: (file: File, base64: string) => void;
  onRemoveProfilePhoto?: () => void;
  onOpenNameChange?: () => void;
  isLoading?: boolean;
  offlinePhoto?: string|null;
}

const OrgProfileInfo = (props: Props): React.ReactElement => {
  const theme = useTheme();
  const name = useMemo(
    () => upcaseFirst(props?.organization?.name ?? ""),
    [props.organization?.name]
  );
  const [isHoveringPhoto, setIsHoveringPhoto] = useState(false);
  const [isHoveringEditName, setIsHoveringEditName] = useState(false);
  const [file, setFile] = useState<null|File>(null);
  const handle = useMemo(() => "@" + props?.organization?.handle ?? "", [props?.organization?.handle]);

  const redXIcon = useMemo(() => {
    if (theme.name == "light") {
      return RedXCircleXLight;
    }
    return RedXCircleXDark;
  }, [theme.name]);

  const editIcon = useMemo(() => {
    if (theme.name == "light") {
      return EditLight;
    }
    return EditDark;
  }, [theme.name]);

  const xCircleOpacity = useMemo(
    () => (isHoveringPhoto && !props.isLoading ? 1 : 0),
    [isHoveringPhoto, props.isLoading]
  );

  const editNameIconOpacity = useMemo(
    () => (isHoveringEditName ? 1 : 0),
    [isHoveringEditName]
  );

  const onMouseOverProfilePicture = useCallback(() => {
    setIsHoveringPhoto(true);
  }, []);

  const onMouseExitProfilePicture = useCallback(() => {
    setIsHoveringPhoto(false);
  }, []);

  const onMouseOverEditName = useCallback(() => {
    setIsHoveringEditName(true);
  }, []);

  const onMouseExitEditName = useCallback(() => {
    setIsHoveringEditName(false);
  }, []);

  const reader = useMemo(() => new FileReader(), []);

  const onReaderLoad = useCallback(() => {
    const b64Image = reader.result as string;
    if (file) {
      props?.onSelectFile?.(file, b64Image);
      setFile(null);
    }
  }, [reader, file, props.onSelectFile]);

  const onChooseFile = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0] ?? null;
    if (file) {
        reader.readAsDataURL(file);
        setFile(file);
    }
  }, [reader, props.onSelectFile]);

  const onInputHackResetClick = useCallback((event: any) => {
    event.target.value = null
  }, []);

  const onRemoveProfilePhoto = useCallback(() => {
    if (!props.isLoading) {
      props?.onRemoveProfilePhoto?.();
    }
  }, [props?.onRemoveProfilePhoto, props.isLoading]);

  const onOpenNameChange = useCallback(() => {
    if (props.isEdittable) {
      props.onOpenNameChange?.();
    }
  }, [props.isEdittable, props.onOpenNameChange]); 

  useEffect(() => {
    reader.onload = onReaderLoad; 
  }, [reader, onReaderLoad]);

  return (
    <Container>
      <PictureContainer
        onMouseEnter={onMouseOverProfilePicture}
        onMouseLeave={onMouseExitProfilePicture}
      >
        {props.organization && <OrgProfilePhoto organization={props.organization} size={168} offlinePhoto={props?.offlinePhoto ?? null} />}
        {isHoveringPhoto && props.isEdittable && !props.isLoading && (
          <OverlayContainer>
            <EditPhotoTextContainer>
              <EditTextLabel>{"edit"}</EditTextLabel>
            </EditPhotoTextContainer>
          </OverlayContainer>
        )}
        {props.isEdittable && (
          <UploadInput
            type={"file"}
            name={"avatar"}
            accept={"image/png, image/jpeg, image/svg+xml"}
            onChange={onChooseFile}
            onClick={onInputHackResetClick}
          />
        )}
        {props.isEdittable && !!props?.organization?.profilePhoto?.id && (
          <RemoveUpload
            style={{ opacity: xCircleOpacity }}
            onClick={onRemoveProfilePhoto}
          >
            <RemoveIcon src={redXIcon} />
          </RemoveUpload>
        )}
        {props.isLoading && (
          <LoaderOverlayContainer>
            <DotsLoader color={"white"} size={"small"} />
          </LoaderOverlayContainer>
        )}
      </PictureContainer>
      <FullnameContainer
        onClick={onOpenNameChange}
        onMouseEnter={onMouseOverEditName}
        onMouseLeave={onMouseExitEditName}
        style={{ cursor: props.isEdittable ? "pointer" : "default" }}
      >
        <Fullname>{name}</Fullname>
        {props.isEdittable &&
          <EditNameIconContainer style={{ opacity: editNameIconOpacity }}>
            <EditNameIcon src={editIcon} />
          </EditNameIconContainer>
        }
      </FullnameContainer>
      <Username>{handle}</Username>
    </Container>
  );
};

export default React.memo(OrgProfileInfo);
