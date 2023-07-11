import React, { useMemo } from "react";
import styled from "@emotion/styled";
import ColorPalette from "@floro/styles/ColorPalette";
import { Organization, User } from "@floro/graphql-schemas/build/generated/main-graphql";
import InitialProfileDefault from "../InitialProfileDefault";
import InitialOrgProfileDefault from "../InitialOrgProfileDefault";
import { ThemeContext } from "@emotion/react";

const ImageWrapper = styled.div`
  border-radius: 15%;
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
  organization: Organization|null;
  offlinePhoto: string|null;
}

const OrgProfilePhoto = (props: Props): React.ReactElement => {
  const hasProfilePhoto = useMemo(() => props.organization?.profilePhoto, [props?.organization]);
  const pictureUrl = useMemo(() => {
    if (!hasProfilePhoto) return "";
    if (props.offlinePhoto) {
      return props.offlinePhoto;
    }
    if (props.size <= 100) {
      return (
        props.organization?.profilePhoto?.thumbnailUrl ??
        props.organization?.profilePhoto?.url ??
        ""
      );
    }

    return props.organization?.profilePhoto?.url ?? "";
  }, [
    props.organization,
    props.size,
    props.organization?.profilePhoto?.url,
    props.organization?.profilePhoto?.thumbnailUrl,
    props.offlinePhoto,
    hasProfilePhoto,
  ]);
  if (!hasProfilePhoto) {
    return (
      <InitialOrgProfileDefault
        name={props?.organization?.name ?? ""}
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

export default React.memo(OrgProfilePhoto);