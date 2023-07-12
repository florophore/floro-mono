import React, { useMemo, useCallback } from "react";
import styled from "@emotion/styled";
import { useTheme } from "@emotion/react";
import UserProfilePhoto from "@floro/storybook/stories/common-components/UserProfilePhoto";
import { User } from "@floro/graphql-schemas/build/generated/main-graphql";
import XLight from "@floro/common-assets/assets/images/icons/x_cross.red.svg";
import XDark from "@floro/common-assets/assets/images/icons/x_cross.light_red.svg";
import { Organization, OrganizationInvitation, useCancelOrganizationInvitationMutation, useResendOrganizationInvitationMutation } from "@floro/graphql-schemas/src/generated/main-client-graphql";
import ColorPalette from "@floro/styles/ColorPalette";
import TimeAgo from "javascript-time-ago";
import Button from "@floro/storybook/stories/design-system/Button";

const TWELVE_HOURS = 1000*3600*12;

const Container = styled.div`
  margin-top: 14px;
  position: relative;
  width: 720px;
  background: ${(props) => props.theme.background};
  border-radius: 8px;
  user-select: none;
  border: 2px solid ${(props) => props.theme.colors.inputBorderColor};
  padding: 16px 12px;
`;

const TopRow = styled.div`
    display: flex;
    flex-direction: row;
    justify-content: space-between;
`;

const UserInfo = styled.div`
    display: flex;
    flex-direction: row;
    align-items: center;
`;

const UserNameContainers = styled.div`
    display: flex;
    flex-direction: column;
    justify-content: center;
    margin-left: 16px;
`;

const StatusTitle = styled.h3`
  margin: 0;
  padding: 0;
  font-family: "MavenPro";
  color: ${(props) => props?.theme.colors.contrastTextLight};
  font-weight: 500;
  font-size: 1.7rem;
`;

const UserTitle = styled.h4`
  margin: 0;
  padding: 0;
  font-family: "MavenPro";
  color: ${(props) => props?.theme.colors.titleText};
  font-weight: 600;
  font-size: 1.7rem;
`;

const HandleSubTitle = styled.p`
  margin: 0;
  padding: 0;
  font-family: "MavenPro";
  color: ${(props) => props?.theme.colors.contrastText};
  font-weight: 500;
  font-size: 1.2rem;
`;

const RolesContainer = styled.div`
    display: flex;
    justify-content: flex-start;
    margin-top: 16px;
    flex-wrap: wrap;
`;

const RolePill = styled.div`
  height: 28px;
  min-width: 100px;
  border-radius: 16px;
  background: ${(props) => props.theme.colors.titleText};
  display: flex;
  justify-content: center;
  align-items: center;
  padding-left: 16px;
  padding-right: 16px;
  margin-right: 16px;
  margin-top: 8px;
`;
const RoleTitle = styled.div`
  font-family: "MavenPro";
  font-weight: 600;
  font-size: 1.2rem;
  color: ${ColorPalette.white};
`;

const InvitedRow = styled.div`
    display: flex;
    justify-content: flex-start;
    margin-top: 24px;
`;

const InvitedText = styled.p`
  margin: 0;
  padding: 0;
  font-family: "MavenPro";
  font-weight: 500;
  font-size: 1.4rem;
  color: ${props => props.theme.colors.contrastText};
`;

const ButtonRow = styled.div`
  display: flex;
  justify-content: space-between;
  margin-top: 24px;
`;

const upcaseFirst = (str: string) => {
  const rest = str.substring(1);
  return (str?.[0]?.toUpperCase() ?? "") + rest;
};

export interface Props {
  invitation: OrganizationInvitation;
  organization: Organization;
  onCancel: (invite: OrganizationInvitation) => void;
  onEdit: (invite: OrganizationInvitation) => void;
}

const InvitationRow = (props: Props): React.ReactElement => {
  const theme = useTheme();

  const [resendInvite, resendInviteResult] = useResendOrganizationInvitationMutation();
  const onResend = useCallback(() => {
    if (!props.organization?.id || !props?.invitation?.id) {
        return;
    }
    resendInvite({
        variables: {
            organizationId: props.organization.id,
            invitationId: props.invitation.id,
        }
    });
  }, [props.organization?.id, props?.invitation?.id]);

  const onCancel = useCallback(() => {
    props.onCancel(props.invitation);
  }, [props.invitation, props.onCancel]);

  const onEdit = useCallback(() => {
    props.onEdit(props.invitation);
  }, [props.invitation, props.onEdit]);


  const usernameDisplay = useMemo(() => {
    if (!props.invitation?.user) {{
        return props.invitation?.email ?? "";
    }}
    return "@" + props.invitation.user?.username;
  }, [props.invitation?.user?.username, props.invitation?.email]);

  const firstName = useMemo(
    () => upcaseFirst(props.invitation?.user?.firstName ?? props?.invitation.firstName ?? ""),
    [props.invitation.user?.firstName, props?.invitation.firstName]
  );
  const lastName = useMemo(
    () => upcaseFirst(props.invitation?.user?.lastName ?? props?.invitation.lastName ?? ""),
    [props?.invitation?.user?.lastName, props?.invitation.lastName]
  );

  const userFullname = useMemo(() => {
    return `${firstName} ${lastName}`;
  }, [firstName, lastName]);

  const invitedByFirstName = useMemo(
    () => upcaseFirst(props.invitation?.invitedByUser?.firstName ?? ""),
    [props.invitation.invitedByUser?.firstName]
  );
  const invitedByLastName = useMemo(
    () => upcaseFirst(props.invitation?.invitedByUser?.lastName ?? ""),
    [props?.invitation?.invitedByUser?.lastName]
  );

  const invitedByUserFullname = useMemo(() => {
    return `${invitedByFirstName} ${invitedByLastName}`;
  }, [invitedByFirstName, invitedByLastName]);

  const timeAgo = useMemo(() => new TimeAgo("en-US"), []);

  const timeSince = useMemo(() => {
    const createdAt = new Date(props.invitation?.updatedAt as string);
    const now = new Date();
    const delta = now.getTime() - createdAt.getTime();
    return delta;
  }, [props.invitation?.updatedAt])


  const elapsedTime = useMemo(() => {
    if (!props.invitation?.createdAt) {
      return "";
    }
    return timeAgo.format(new Date(props.invitation?.createdAt as string));
  }, [timeAgo, props.invitation?.createdAt]);

  const invitedSentence = useMemo(() => {
    return `Invited by ${invitedByUserFullname} ${elapsedTime}`;
  }, [elapsedTime, invitedByUserFullname]);

  return (
    <Container
      style={{
        border: `2px solid ${theme.colors.inputBorderColor}`,
      }}
    >
      <TopRow>
        <UserInfo>
          <UserProfilePhoto
            user={
              props?.invitation?.user ?? {
                firstName: props?.invitation?.firstName,
                lastName: props?.invitation?.lastName,
              } ??
              null
            }
            size={72}
            offlinePhoto={null}
          />
          <UserNameContainers>
            <UserTitle>{userFullname}</UserTitle>
            <HandleSubTitle>{usernameDisplay}</HandleSubTitle>
          </UserNameContainers>
        </UserInfo>
        <StatusTitle>{"sent"}</StatusTitle>
      </TopRow>
      {props.organization?.membership?.permissions?.canAssignRoles && (
        <RolesContainer>
          {props?.invitation?.roles?.map((role, index) => {
            return (
              <RolePill key={index}>
                <RoleTitle>{role?.name}</RoleTitle>
              </RolePill>
            );
          })}
        </RolesContainer>
      )}
      <InvitedRow>
        <InvitedText>{invitedSentence}</InvitedText>
      </InvitedRow>
      <ButtonRow>
        <Button
          label={"edit roles"}
          bg={"orange"}
          size={"small"}
          onClick={onEdit}
          isDisabled={
            !props.organization?.membership?.permissions?.canAssignRoles ||
            !props?.organization?.membership?.permissions?.canModifyInvites
          }
        />
        {timeSince > TWELVE_HOURS && (
          <Button
            onClick={onResend}
            isLoading={resendInviteResult.loading}
            label={"nudge"}
            bg={"teal"}
            size={"small"}
            isDisabled={
              !props?.organization?.membership?.permissions?.canInviteMembers
            }
          />
        )}
        <Button
          onClick={onCancel}
          label={"cancel"}
          bg={"gray"}
          size={"small"}
          isDisabled={
            !props?.organization?.membership?.permissions?.canModifyInvites
          }
        />
      </ButtonRow>
    </Container>
  );
};

export default React.memo(InvitationRow);
