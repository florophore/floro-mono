import React, { useMemo, useCallback, useState, useEffect } from "react";
import styled from "@emotion/styled";
import ColorPalette from "@floro/styles/ColorPalette";
import { User } from "@floro/graphql-schemas/build/generated/main-graphql";
import InitialProfileDefault from "../InitialProfileDefault";

const ImageWrapper = styled.div`
  border-radius: 50%;
  overflow: hidden;
  display: flex;
  justify-content: center;
  align-items: center;
  border: 2px solid ${props => props.theme.colors.profilePictureBorderColor};
  background-color: ${ColorPalette.white};
  user-select: none;
`;

const Image = styled.img`
  height: 100%;
  width: 100%;
  user-select: none;
`;

export interface Props {
  size: number;
  user: User;
  offlinePhoto: string|null;
}

const UserProfilePhoto = (props: Props): React.ReactElement => {
  const [hasError, setHasError] = useState(false);
  const onShowError = useCallback(() => {
    setHasError(true);
  }, []);

  const onHideError = useCallback(() => {
    setHasError(false);
  }, []);

  const hasProfilePhoto = useMemo(() => props.user.profilePhoto, [props?.user]);
  const [offlinePhoto, setOfflinePhoto] = useState<string|null>(null);
  const pictureUrl = useMemo(() => {
    if (hasProfilePhoto === undefined) return "";
    if (!hasProfilePhoto) return "";
    if (props.offlinePhoto) {
      return props.offlinePhoto;
    }
    if (props.size <= 100) {
      return (
        props.user.profilePhoto?.thumbnailUrl ??
        props.user?.profilePhoto?.url ??
        offlinePhoto ??
        ""
      );
    }

    return props.user?.profilePhoto?.url ?? "";
  }, [
    offlinePhoto,
    props.user,
    props.size,
    props.user?.profilePhoto?.url,
    props.user?.profilePhoto?.thumbnailUrl,
    props.offlinePhoto,
    hasProfilePhoto,
  ]);

  useEffect(() => {
    if (pictureUrl) {
      setOfflinePhoto(pictureUrl);
    }
  }, [pictureUrl])
  if (!props.user?.firstName && offlinePhoto) {
    return (
      <ImageWrapper style={{ height: props.size, width: props.size }}>
        <Image onLoad={onHideError} onError={onShowError} src={offlinePhoto} />
      </ImageWrapper>
    );
    }
  if (!hasProfilePhoto || hasError) {
    return (
      <InitialProfileDefault
        firstName={props?.user?.firstName ?? ""}
        lastName={props?.user?.lastName ?? ""}
        size={props.size}
      />
    );
  }

  return (
    <ImageWrapper style={{ height: props.size, width: props.size }}>
      <Image onLoad={onHideError} onError={onShowError} src={pictureUrl} />
    </ImageWrapper>
  );
};

export default React.memo(UserProfilePhoto);
