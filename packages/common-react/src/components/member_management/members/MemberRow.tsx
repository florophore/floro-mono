import React, { useMemo, useCallback } from "react";
import styled from "@emotion/styled";
import { useTheme } from "@emotion/react";
import UserProfilePhoto from "@floro/storybook/stories/common-components/UserProfilePhoto";
import {
  Organization,
  OrganizationMember,
} from "@floro/graphql-schemas/src/generated/main-client-graphql";
import ColorPalette from "@floro/styles/ColorPalette";
import TimeAgo from "javascript-time-ago";
import Button from "@floro/storybook/stories/design-system/Button";
import { Link } from "react-router-dom";

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
  &:hover {
    color: ${(props) => props?.theme.colors.linkColor};
  }
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
  color: ${(props) => props.theme.colors.contrastText};
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
  member: OrganizationMember;
  organization: Organization;
  onDeactivate: (member: OrganizationMember) => void;
  onReactivate: (member: OrganizationMember) => void;
  onEdit: (member: OrganizationMember) => void;
}

const MemberRow = (props: Props): React.ReactElement => {
  const theme = useTheme();

  const background = useMemo(() => {
    if (props.member.membershipState == "active") {
      return theme.background;
    }
    if (theme.name == "light") {
      return ColorPalette.lightGray;
    }
    return ColorPalette.mediumGray;

  }, [theme.name, theme.background, props.member]);

  const onDeactivate = useCallback(() => {
    props.onDeactivate(props.member);
  }, [props.member, props.onDeactivate]);

  const onReactivate = useCallback(() => {
    props.onReactivate(props.member);
  }, [props.member, props.onReactivate]);

  const onEdit = useCallback(() => {
    props.onEdit(props.member);
  }, [props.member, props.onEdit]);

  const usernameDisplay = useMemo(() => {
    return "@" + props.member.user?.username;
  }, [props.member?.user?.username]);

  const firstName = useMemo(
    () => upcaseFirst(props.member?.user?.firstName ?? ""),
    [props.member.user?.firstName]
  );
  const lastName = useMemo(
    () => upcaseFirst(props.member?.user?.lastName ?? ""),
    [props?.member?.user?.lastName]
  );

  const userFullname = useMemo(() => {
    return `${firstName} ${lastName}`;
  }, [firstName, lastName]);

  const timeAgo = useMemo(() => new TimeAgo("en-US"), []);

  const elapsedTime = useMemo(() => {
    if (!props.member?.createdAt) {
      return "";
    }
    return timeAgo.format(new Date(props.member?.createdAt as string));
  }, [timeAgo, props.member?.createdAt]);

  const memberSentence = useMemo(() => {
    return `Member since ${elapsedTime}`;
  }, [elapsedTime]);

  const isAdmin = useMemo(() => {
    if (!props?.member?.roles) {
      return true;
    }
    const adminRole = props?.organization?.roles?.find((r) => !r?.isMutable);
    if (!adminRole) {
      return false;
    }
    return props?.member?.roles?.map((r) => r?.id).includes(adminRole.id);
  }, [props?.organization?.roles, props?.member?.roles]);


  const isFinalAdmin = useMemo(() => {
    if (!props?.member?.roles) {
      return true;
    }
    const adminRole = props?.organization?.roles?.find((r) => !r?.isMutable);
    if (!adminRole) {
      return true;
    }
    if (props?.organization?.activeAdminCount == 1) {
      return props?.member?.roles?.map((r) => r?.id).includes(adminRole.id);
    }
    return false;
  }, [
    props?.organization?.roles,
    props?.organization?.activeAdminCount,
    props?.member?.roles,
  ]);

  return (
    <Container
      style={{
        border: `2px solid ${theme.colors.inputBorderColor}`,
        background
      }}
    >
      <TopRow>
        <UserInfo>
          <UserProfilePhoto
            user={props?.member?.user ?? null}
            size={72}
            offlinePhoto={null}
          />
          <UserNameContainers>
            <UserTitle>{userFullname}</UserTitle>
            <Link to={`/user/@/${props.member.user?.username}`}>
              {props?.member?.membershipState == "active" && (
                <HandleSubTitle>{usernameDisplay}</HandleSubTitle>
              )}
              {props?.member?.membershipState != "active" && (
                <HandleSubTitle style={{color: ColorPalette.gray}}>{usernameDisplay}</HandleSubTitle>
              )}
            </Link>
          </UserNameContainers>
        </UserInfo>
        {props?.member?.membershipState == "active" && (
          <StatusTitle>{"active"}</StatusTitle>
        )}
        {props?.member?.membershipState != "active" && (
          <StatusTitle style={{color: ColorPalette.gray}}>{"inactive"}</StatusTitle>
        )}
      </TopRow>
      {props.organization?.membership?.permissions?.canAssignRoles && (
        <RolesContainer>
          {props?.member?.roles?.map((role, index) => {
            if (props?.member?.membershipState != "active") {
              return (
                <RolePill key={index}>
                  <RoleTitle style={{color: ColorPalette.gray}}>{role?.name}</RoleTitle>
                </RolePill>
              );
            }
            return (
              <RolePill key={index}>
                <RoleTitle>{role?.name}</RoleTitle>
              </RolePill>
            );
          })}
        </RolesContainer>
      )}
      <InvitedRow>

        {props?.member?.membershipState == "active" && (
          <InvitedText>{memberSentence}</InvitedText>
        )}
        {props?.member?.membershipState != "active" && (
          <InvitedText style={{color: ColorPalette.gray}}>{memberSentence}</InvitedText>
        )}
      </InvitedRow>
      <ButtonRow>
        <Button
          label={"edit roles"}
          bg={"orange"}
          size={"small"}
          onClick={onEdit}
          isDisabled={
            props.member.membershipState != "active" ||
            props?.organization?.membership?.id == props.member?.id ||
            (isAdmin && isFinalAdmin) ||
            !props.organization?.membership?.permissions?.canAssignRoles ||
            !props?.organization?.membership?.permissions
              ?.canModifyOrganizationMembers
          }
        />
        {props?.member?.membershipState == "active" && (
          <Button
            onClick={onDeactivate}
            label={"deactivate"}
            bg={"red"}
            size={"small"}
            isDisabled={
              (isAdmin && isFinalAdmin) ||
              !props?.organization?.membership?.permissions
                ?.canModifyOrganizationMembers ||
              props?.organization?.membership?.id == props.member?.id
            }
          />
        )}
        {props?.member?.membershipState != "active" && (
          <Button
            onClick={onReactivate}
            label={"reactivate"}
            bg={"teal"}
            size={"small"}
            isDisabled={
              !props?.organization?.membership?.permissions
                ?.canModifyOrganizationMembers
            }
          />
        )}
      </ButtonRow>
    </Container>
  );
};

export default React.memo(MemberRow);
