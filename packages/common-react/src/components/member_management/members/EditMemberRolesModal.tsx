
import React, { useMemo, useState, useCallback, useEffect } from "react";

import RootModal from "../../RootModal";
import styled from "@emotion/styled";
import { useTheme } from "@emotion/react";
// eslint-disable-next-line import/no-named-as-default
import ColorPalette from "@floro/styles/ColorPalette";
import Button from "@floro/storybook/stories/design-system/Button";
import RedHexagonWarningLight from "@floro/common-assets/assets/images/icons/red_hexagon_warning.light.svg";
import RedHexagonWarningDark from "@floro/common-assets/assets/images/icons/red_hexagon_warning.dark.svg";
import { Repository } from "@floro/graphql-schemas/build/generated/main-client-graphql";
import { ApiResponse } from "floro/dist/src/repo";
import { Organization, OrganizationInvitation, OrganizationMember, useCancelOrganizationInvitationMutation, useRejectOrganizationInvitationMutation, useUpdateOrganizationInvitationMutation, useUpdateOrganizationMemberMutation } from "@floro/graphql-schemas/src/generated/main-client-graphql";
import RootLongModal from "../../RootLongModal";
import UserProfilePhoto from "@floro/storybook/stories/common-components/UserProfilePhoto";
import Checkbox from "@floro/storybook/stories/design-system/Checkbox";
import { useSession } from "../../../session/session-context";

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
  color: ${props => props.theme.colors.titleText};
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
  member: OrganizationMember|null;
  organization: Organization;
  currentMemberId: string|null;
  currentMemeberQuery: string|null;
  currentFilterDeactivatedMembers: boolean|null;
}

const EditMemberRolesModal = (props: Props) => {
  const { session } = useSession();
  const theme = useTheme();
  const title = useMemo(() => {
    return (
      <HeaderContainer>
        <HeaderTitle>{"edit member roles"}</HeaderTitle>
      </HeaderContainer>
    );
  }, []);
  const firstName = useMemo(
    () => upcaseFirst(props.member?.user?.firstName ?? ""),
    [props.member?.user?.firstName]
  );
  const lastName = useMemo(
    () => upcaseFirst(props.member?.user?.lastName ?? ""),
    [props?.member?.user?.lastName]
  );

  const userFullname = useMemo(() => {
    return `${firstName} ${lastName}`?.trim();
  }, [firstName, lastName]);

  const usernameDisplay = useMemo(() => {
    return "@" + props.member?.user?.username;
  }, [props.member?.user?.username]);

  const [assignedRoles, setAssignedRoles] = useState<Set<string>>(new Set([]));

  useEffect(() => {
    if (props.show) {
      setAssignedRoles(
        new Set(props?.member?.roles?.map((v) => v?.id as string) ?? [])
      );
    }

  }, [props?.member?.roles, props.show])
  const [updateMember, updateMemberResult] = useUpdateOrganizationMemberMutation();
  const onUpdate = useCallback(() => {
    if (!props.organization?.id || !props?.member?.id) {
      return;
    }
    updateMember({
      variables: {
        organizationId: props.organization.id,
        memberId: props.member.id,
        currentMemberId: props.currentMemberId,
        currentMemberQuery: props.currentMemeberQuery,
        filterOutDeactivated: props.currentFilterDeactivatedMembers,
        roleIds: Array.from(assignedRoles),
      },
    });
  }, [
    props.organization?.id,
    props?.member?.id,
    props.currentMemberId,
    props.currentMemeberQuery,
    props.currentFilterDeactivatedMembers,
    assignedRoles,
  ]);

  useEffect(() => {
    if (
      updateMemberResult?.data?.updateOrganizationMembership?.__typename ==
      "UpdateOrganizationMemberSuccess"
    ) {
      props.onDismiss();
    }
  }, [
    updateMemberResult?.data?.updateOrganizationMembership?.__typename,
    props.onDismiss,
  ]);

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
              user={props?.member?.user ?? null}
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

                if ((isFinalAdmin || props.member?.user?.id == session?.user?.id) && !role?.isMutable && role?.name == "Admin") {
                  return (
                    <RoleRow key={index}>
                      <Checkbox
                        disabled
                        isChecked={assignedRoles.has(role?.id as string)}
                        onChange={() => {
                        }}
                      />
                      <RoleText style={{color: theme.name == 'light' ? ColorPalette.lightGray : ColorPalette.gray}}>{role?.name}</RoleText>
                    </RoleRow>
                  );
                }
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
            label={"update roles"}
            bg={"orange"}
            size={"medium"}
            isLoading={updateMemberResult.loading}
          />
        </BottomContentContainer>
      </ContentContainer>
    </RootLongModal>
  );
};

export default React.memo(EditMemberRolesModal);