import React, { useMemo } from "react";
import styled from "@emotion/styled";
import ColorPalette from "@floro/styles/ColorPalette";
import { User } from "@floro/graphql-schemas/build/generated/main-graphql";
import InitialProfileDefault from "../InitialProfileDefault";

const Image = styled.img`
  border-radius: 50%;
  user-select: none;
`;

export interface Props {
  size: number;
  user: User;
}

const UserProfilePhoto = (props: Props): React.ReactElement => {
  const hasProfilePhoto = useMemo(() => props.user.profilePhoto, [props?.user]);
  const pictureUrl = useMemo(() => {
    if (!hasProfilePhoto) return "";
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
    <Image style={{ height: props.size, width: props.size }} src={pictureUrl} />
  );
};

export default React.memo(UserProfilePhoto);
