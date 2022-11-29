import React, { useState, useMemo, useCallback, useEffect } from "react";
import styled from "@emotion/styled";
import InitialProfileDefault from "../InitialProfileDefault";
import ColorPalette, { Opacity } from "@floro/styles/ColorPalette";
import { read } from "fs";
import { User } from "@floro/graphql-schemas/build/generated/main-graphql";
import UserProfilePhoto from "../UserProfilePhoto";

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
  overflow: hidden;
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
`;

const EditPhotoTextContainer = styled.div`
  height: 36px;
  width: 100%;
  background-color: ${(props) => props.theme.colors.profileHoverOpacity};
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

const Fullname = styled.p`
  font-family: "MavenPro";
  font-size: 1.44rem;
  font-weight: 600;
  text-align: center;
  color: ${(props) => props.theme.colors.profileInfoNameTextColor};
  padding: 0;
  margin: 24px 0 12px 0;
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
    user: User|null;
  isEdittable: boolean;
  onSelectFile?: (file: File, base64: string) => void;
}

const ProfileInfo = (props: Props): React.ReactElement => {
  const firstName = useMemo(
    () => upcaseFirst(props?.user?.firstName ?? ""),
    [props.user?.firstName]
  );
  const [isHoveringPhoto, setIsHoveringPhoto] = useState(false);
  const [file, setFile] = useState<null|File>(null);
  const lastName = useMemo(() => upcaseFirst(props?.user?.lastName ?? ""), [props?.user?.lastName]);
  const fullname = useMemo(
    () => firstName + " " + lastName,
    [firstName, lastName]
  );
  const username = useMemo(() => "@" + props?.user?.username ?? "", [props?.user?.username]);

  const onMouseOverProfilePicture = useCallback(() => {
    setIsHoveringPhoto(true);
  }, []);

  const onMouseExitProfilePicture = useCallback(() => {
    setIsHoveringPhoto(false);
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

  useEffect(() => {
    reader.onload = onReaderLoad; 
  }, [reader, onReaderLoad]);

  return (
    <Container>
      <PictureContainer
        onMouseEnter={onMouseOverProfilePicture}
        onMouseLeave={onMouseExitProfilePicture}
      >
        {props.user && <UserProfilePhoto user={props.user} size={168} />}
        {isHoveringPhoto && props.isEdittable && (
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
      </PictureContainer>
      <Fullname>{fullname}</Fullname>
      <Username>{username}</Username>
    </Container>
  );
};

export default React.memo(ProfileInfo);
