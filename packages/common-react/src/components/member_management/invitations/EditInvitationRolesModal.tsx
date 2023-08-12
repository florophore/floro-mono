import React, { useMemo, useState, useCallback, useEffect } from "react";

import styled from "@emotion/styled";
// eslint-disable-next-line import/no-named-as-default
import ColorPalette from "@floro/styles/ColorPalette";
import Button from "@floro/storybook/stories/design-system/Button";
import {
  Organization,
  OrganizationInvitation,
  useUpdateOrganizationInvitationMutation,
} from "@floro/graphql-schemas/src/generated/main-client-graphql";
import RootLongModal from "../../RootLongModal";
import UserProfilePhoto from "@floro/storybook/stories/common-components/UserProfilePhoto";
import Checkbox from "@floro/storybook/stories/design-system/Checkbox";

const HeaderContainer = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: center;
  align-items: center;
  height: 100%;
`;

const HeaderTitle = styled.div`
  font-size: 1.7rem;
  font-family: "MavenPro";
  font-weight: 600;
  text-align: center;
  color: ${ColorPalette.white};
`;

const ContentContainer = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  height: 100%;
  width: 100%;
  padding: 24px;
`;

const TopContentContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: flex-start;
`;

const RoleRow = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: flex-start
  padding-top: 8px;
  padding-bottom: 8px;
  margin-top: 2px;
`;

const RoleText = styled.div`
  margin-left: 8px;
  font-family: "MavenPro";
  font-weight: 500;
  font-size: 1.3rem;
  color: ${(props) => props.theme.colors.contrastText};
`;

const LabelText = styled.span`
  font-family: "MavenPro";
  font-weight: 600;
  font-size: 1.4rem;
  transition: 500ms color;
  user-select: none;
  color: ${(props) => props.theme.colors.titleText};
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

const BottomContentContainer = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  align-items: flex-end;
`;

const upcaseFirst = (str: string) => {
  const rest = str.substring(1);
  return (str?.[0]?.toUpperCase() ?? "") + rest;
};

export interface Props {
  onDismiss: () => void;
  show?: boolean;
  invitation: OrganizationInvitation | null;
  organization: Organization;
  currentInvitationId: string | null;
  currentInvitationQuery: string | null;
}

const EditInvitationRolesModal = (props: Props) => {
  const title = useMemo(() => {
    return (
      <HeaderContainer>
        <HeaderTitle>{"edit invitiation"}</HeaderTitle>
      </HeaderContainer>
    );
  }, []);
  const firstName = useMemo(
    () =>
      upcaseFirst(
        props.invitation?.user?.firstName ?? props?.invitation?.firstName ?? ""
      ),
    [props.invitation?.user?.firstName, props?.invitation?.firstName]
  );
  const lastName = useMemo(
    () =>
      upcaseFirst(
        props.invitation?.user?.lastName ?? props?.invitation?.lastName ?? ""
      ),
    [props?.invitation?.user?.lastName, props?.invitation?.lastName]
  );

  const userFullname = useMemo(() => {
    return `${firstName} ${lastName}`?.trim();
  }, [firstName, lastName]);

  const usernameDisplay = useMemo(() => {
    if (!props.invitation?.user) {
      {
        return props.invitation?.email ?? "";
      }
    }
    return "@" + props.invitation.user?.username;
  }, [props.invitation?.user?.username, props.invitation?.email]);
  const [assignedRoles, setAssignedRoles] = useState<Set<string>>(new Set([]));

  useEffect(() => {
    if (props.show) {
      setAssignedRoles(
        new Set(props?.invitation?.roles?.map((v) => v?.id as string) ?? [])
      );
    }
  }, [props?.invitation?.roles, props.show]);
  const [updateInvite, updateInviteResult] =
    useUpdateOrganizationInvitationMutation();
  const onUpdate = useCallback(() => {
    if (!props.organization?.id || !props?.invitation?.id) {
      return;
    }
    updateInvite({
      variables: {
        organizationId: props.organization.id,
        invitationId: props.invitation.id,
        currentInvitationId: props.currentInvitationId,
        currentInvitationQuery: props.currentInvitationQuery,
        roleIds: Array.from(assignedRoles),
      },
    });
  }, [
    props.organization?.id,
    props?.invitation?.id,
    props.currentInvitationId,
    props.currentInvitationQuery,
    assignedRoles,
  ]);

  useEffect(() => {
    if (
      updateInviteResult?.data?.updateOrganizationInvitation?.__typename ==
      "UpdateOrganizationInvitationSuccess"
    ) {
      props.onDismiss();
    }
  }, [
    updateInviteResult?.data?.updateOrganizationInvitation?.__typename,
    props.onDismiss,
  ]);

  return (
    <RootLongModal
      headerSize="small"
      headerChildren={title}
      show={props.show}
      onDismiss={props.onDismiss}
    >
      <ContentContainer>
        <TopContentContainer>
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

          <div
            style={{
              marginTop: 24,
              display: "flex",
              alignItems: "flex-start",
              width: 468,
              flexDirection: "column",
            }}
          >
            <LabelText>{"Assign Roles"}</LabelText>
            <div style={{ marginTop: 20 }}>
              {props?.organization?.roles?.map((role, index) => {
                return (
                  <RoleRow key={index}>
                    <Checkbox
                      isChecked={assignedRoles.has(role?.id as string)}
                      onChange={() => {
                        if (assignedRoles.has(role?.id as string)) {
                          assignedRoles.delete(role?.id as string);
                          setAssignedRoles(new Set(Array.from(assignedRoles)));
                        } else {
                          assignedRoles.add(role?.id as string);
                          setAssignedRoles(new Set(Array.from(assignedRoles)));
                        }
                      }}
                    />
                    <RoleText>{role?.name}</RoleText>
                  </RoleRow>
                );
              })}
            </div>
          </div>
        </TopContentContainer>
        <BottomContentContainer>
          <Button
            onClick={props.onDismiss}
            label={"back"}
            bg={"gray"}
            size={"medium"}
          />
          <Button
            onClick={onUpdate}
            label={"update invite"}
            bg={"orange"}
            size={"medium"}
            isLoading={updateInviteResult.loading}
          />
        </BottomContentContainer>
      </ContentContainer>
    </RootLongModal>
  );
};

export default React.memo(EditInvitationRolesModal);
