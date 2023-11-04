import React, { useMemo, useCallback } from "react";
import styled from "@emotion/styled";
import { useTheme } from "@emotion/react";
import InitialProfileDefault from "@floro/storybook/stories/common-components/InitialProfileDefault";
import UserProfilePhoto from "@floro/storybook/stories/common-components/UserProfilePhoto";
import {
  Organization,
  User,
} from "@floro/graphql-schemas/build/generated/main-graphql";
import OrgProfilePhoto from "@floro/storybook/stories/common-components/OrgProfilePhoto";
import { OrganizationInvitation, useAcceptOrganizationInvitationMutation } from "@floro/graphql-schemas/src/generated/main-client-graphql";
import { useOfflinePhoto } from "../../../offline/OfflinePhotoContext";
import Button from "@floro/storybook/stories/design-system/Button";
import { Link } from "react-router-dom";

const Container = styled.div`
  background: ${(props) => props.theme.background};
  border-radius: 8px;
  transition: 500ms border-color;
  width: 100%;
  box-shadow: 0px 2px 2px 2px ${props => props.theme.colors.tooltipOuterShadowColor};
  margin-bottom: 16px;
`;

const InnerContainer = styled.div`
  box-shadow: inset 0 0 3px
    ${(props) => props.theme.colors.tooltipInnerShadowColor};
  padding: 8px;
  border-radius: 8px;
`;

const InfoContainer = styled.div`
  width: 100%;
  box-sizing: border-box;
  display: flex;
  flex-direction: row;
  align-items: center;
`;

const NameText = styled.span`
  font-family: "MavenPro";
  font-weight: 600;
  font-size: 1.2rem;
  transition: 500ms color;
  color: ${(props) => props.theme.colors.ownerDescriptorUsernameColor};
  display: block;
`;

const HandleText = styled.span`
  font-family: "MavenPro";
  font-weight: 500;
  font-size: 0.85rem;
  transition: 500ms color;
  color: ${(props) => props.theme.colors.repoBriefRowUpdateColor};
  display: block;
`;

const InviteText = styled.span`
  font-family: "MavenPro";
  font-weight: 500;
  font-size: 1.2rem;
  transition: 500ms color;
  color: ${(props) => props.theme.colors.contrastTextLight};
  font-style: italic;
  display: block;
`;

const ButtonRow = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
  width: 100%;
`;

const upcaseFirst = (str: string) => {
  const rest = str.substring(1);
  return (str?.[0]?.toUpperCase() ?? "") + rest;
};

export interface Props {
  invitation: OrganizationInvitation;
  onRejectInvite: (invitation: OrganizationInvitation) => void;
}
const UserInvite = (props: Props): React.ReactElement => {
  const invitingUsernameFormatted = useMemo(
    () => "@" + props.invitation?.invitedByUser?.username,
    [props.invitation?.invitedByUser?.username]
  );
  const orgHandleFormatted = useMemo(
    () => "@" + props.invitation?.organization?.handle,
    [props.invitation?.organization?.handle]
  );
  const offlinePhoto = useOfflinePhoto(
    props.invitation?.organization?.profilePhoto ?? null
  );

  const userProfilePhoto = useOfflinePhoto(
    props.invitation?.invitedByUser?.profilePhoto ?? null
  );
  const firstName = useMemo(
    () => upcaseFirst(props.invitation.invitedByUser?.firstName ?? ""),
    [props.invitation.invitedByUser?.firstName]
  );
  const lastChar = useMemo(
    () => props.invitation.invitedByUser?.lastName?.[0]?.toUpperCase(),
    [props.invitation.invitedByUser?.lastName]
  );

  const onReject = useCallback(() => {
    props.onRejectInvite(props.invitation);
  }, [props.invitation, props.onRejectInvite])

  const [acceptInvitation, acceptInvitationResult] = useAcceptOrganizationInvitationMutation();

  const onAccept = useCallback(() => {
    if (!props?.invitation?.id) {
      return;
    }
    acceptInvitation({
      variables: {
        invitationId: props.invitation.id,
      },
    });
  }, []);

  const userFullname = useMemo(() => {
    return `${firstName} ${lastChar}.`;
  }, [firstName, lastChar]);
  return (
    <Container>
      <InnerContainer>
        <InfoContainer>
          <UserProfilePhoto
            user={props?.invitation?.invitedByUser ?? null}
            size={40}
            offlinePhoto={userProfilePhoto}
          />
          <Link to={`/user/@/${props.invitation?.invitedByUser?.username}`}>
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                justifyContent: "flex-start",
                marginLeft: 8,
              }}
            >
              <NameText>{userFullname}</NameText>
              <HandleText>{invitingUsernameFormatted}</HandleText>
            </div>
          </Link>
        </InfoContainer>
        <div style={{ marginTop: 12 }}>
          <InviteText>{"has invited you to join"}</InviteText>
        </div>
        <InfoContainer style={{ marginTop: 12 }}>
          <OrgProfilePhoto
            organization={props?.invitation?.organization ?? null}
            size={40}
            offlinePhoto={offlinePhoto}
          />
          <Link to={`/org/@/${props.invitation?.organization?.handle}`}>
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                justifyContent: "flex-start",
                marginLeft: 8,
              }}
            >
              <NameText>{props.invitation?.organization?.name}</NameText>
              <HandleText>{orgHandleFormatted}</HandleText>
            </div>
          </Link>
        </InfoContainer>
        <ButtonRow style={{ marginTop: 16 }}>
          <Button
            onClick={onAccept}
            isLoading={acceptInvitationResult.loading}
            style={{ width: "100%" }}
            label={"accept"}
            bg={"teal"}
            size={"small"}
          />
          <div style={{ width: 32 }} />
          <Button
            isDisabled={acceptInvitationResult.loading}
            onClick={onReject}
            style={{ width: "100%" }}
            label={"decline"}
            bg={"red"}
            size={"small"}
          />
        </ButtonRow>
      </InnerContainer>
    </Container>
  );
};

export default React.memo(UserInvite);
