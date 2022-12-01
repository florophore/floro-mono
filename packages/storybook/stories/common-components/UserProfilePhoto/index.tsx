import React, { useMemo } from "react";
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
  border: 2px solid ${ColorPalette.white};
  background-color: ${ColorPalette.white};
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
  const hasProfilePhoto = useMemo(() => props.user.profilePhoto, [props?.user]);
  const pictureUrl = useMemo(() => {
    if (!hasProfilePhoto) return "";
    if (props.offlinePhoto) {
      return props.offlinePhoto;
    }
    if (props.size <= 100) {
      return (
        props.user.profilePhoto?.thumbnailUrl ??
        props.user?.profilePhoto?.url ??
        ""
      );
    }

    return props.user?.profilePhoto?.url ?? "";
  }, [
    props.user,
    props.size,
    props.user?.profilePhoto?.url,
    props.user?.profilePhoto?.thumbnailUrl,
    props.offlinePhoto,
    hasProfilePhoto,
  ]);
  if (!hasProfilePhoto) {
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
      <Image src={pictureUrl} />
    </ImageWrapper>
  );
};

export default React.memo(UserProfilePhoto);
