import React, { useMemo, useState, useCallback, useEffect } from "react";

import styled from "@emotion/styled";
import { useTheme } from "@emotion/react";
// eslint-disable-next-line import/no-named-as-default
import ColorPalette from "@floro/styles/ColorPalette";
import Button from "@floro/storybook/stories/design-system/Button";
import RedHexagonWarningLight from "@floro/common-assets/assets/images/icons/red_hexagon_warning.light.svg";
import RedHexagonWarningDark from "@floro/common-assets/assets/images/icons/red_hexagon_warning.dark.svg";
import { Repository } from "@floro/graphql-schemas/build/generated/main-client-graphql";
import { ApiResponse } from "floro/dist/src/repo";
import {
  Organization,
  OrganizationInvitation,
  useCancelOrganizationInvitationMutation,
  useRejectOrganizationInvitationMutation,
  useUpdateAnyoneCanChangeSettingRolesMutation,
  useUpdateOrganizationInvitationMutation,
} from "@floro/graphql-schemas/src/generated/main-client-graphql";
import RootLongModal from "../../../../RootLongModal";
import UserProfilePhoto from "@floro/storybook/stories/common-components/UserProfilePhoto";
import Checkbox from "@floro/storybook/stories/design-system/Checkbox";
import { useSession } from "../../../../../session/session-context";
import WarningLabel from "@floro/storybook/stories/design-system/WarningLabel";

const HeaderWrapper = styled.div`
  height: 100%;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
`;

const FloroHeaderTitle = styled.h1`
  font-family: "MavenPro";
  color: ${(props) => props?.theme.colors.modalHeaderTitleColor};
  font-weight: 700;
  font-size: 2rem;
`;

const ButtonRow = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
  width: 100%;
`;

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
  height: 100%;
  flex-direction: column;
  align-items: center;
  justify-content: flex-end;
  padding-bottom: 16px;
`;

const upcaseFirst = (str: string) => {
  const rest = str.substring(1);
  return (str?.[0]?.toUpperCase() ?? "") + rest;
};

export interface Props {
  onDismissModal: () => void;
  show?: boolean;
  repository: Repository;
}

const AddSettingsRolesModal = (props: Props) => {
  const [assignedRoles, setAssignedRoles] = useState<Set<string>>(new Set([]));
  const { currentUser } = useSession();

  const adminRole = useMemo(() => {
    return props?.repository?.organization?.roles?.find(
      (role) => !role?.isMutable
    );
  }, [props?.repository?.organization?.roles]);

  const memberRoleIds = useMemo(() => {
    return props?.repository?.organization?.membership?.roles?.map(
      (role) => role?.id as string
    ) as Array<string>;
  }, [props?.repository?.organization?.membership?.roles]);

  const enabledUserIds = useMemo((): Set<string> => {
    return new Set(
      props?.repository?.canChangeSettingsRoles?.map((v) => v?.id as string) ??
      []
    );
  }, [props?.repository?.canChangeSettingsUsers]);

  const isAdmin = useMemo(() => {
    if (!adminRole?.id) {
      return false;
    }
    return memberRoleIds.includes(adminRole.id);
  }, [adminRole, memberRoleIds]);

  const disableUpdate = useMemo(() => {
    if (!currentUser?.id) {
      return true;
    }
    if (isAdmin) {
      return false;
    }
    if (enabledUserIds.has(currentUser?.id)) {
      return false;
    }
    const memberRoles = new Set(memberRoleIds);
    for (const roleId of assignedRoles) {
      if (memberRoles.has(roleId)) {
        return false;
      }
    }
    return true;
  }, [memberRoleIds, currentUser?.id, isAdmin, enabledUserIds, assignedRoles])

  useEffect(() => {
    if (props.show) {
      setAssignedRoles(
        new Set(props?.repository?.canChangeSettingsRoles?.map((v) => v?.id as string) ?? [])
      );
    }
  }, [props?.repository?.canChangeSettingsRoles, props.show]);
  const [updateRoles, updateRolesResult] =
    useUpdateAnyoneCanChangeSettingRolesMutation();
  const onUpdate = useCallback(() => {
    if (!props?.repository?.id) {
      return;
    }
    if (disableUpdate) {
      return;
    }
    updateRoles({
      variables: {
        repositoryId: props.repository.id,
        roleIds: Array.from(assignedRoles)
      }
    });
    //if (!props.organization?.id || !props?.invitation?.id) {
    //  return;
    //}
    //updateInvite({
    //  variables: {
    //    organizationId: props.organization.id,
    //    invitationId: props.invitation.id,
    //    currentInvitationId: props.currentInvitationId,
    //    currentInvitationQuery: props.currentInvitationQuery,
    //    roleIds: Array.from(assignedRoles),
    //  },
    //});
  }, [
    //props.organization?.id,
    //props?.invitation?.id,
    //props.currentInvitationId,
    //props.currentInvitationQuery,
    props?.repository?.id,
    assignedRoles,
    disableUpdate
  ]);

  useEffect(() => {
    if (
      updateRolesResult?.data?.updateAnyoneCanChangeSettingsRoles?.__typename ==
      "RepoSettingChangeSuccess"
    ) {
      props.onDismissModal();
    }
  }, [
    updateRolesResult?.data?.updateAnyoneCanChangeSettingsRoles?.__typename,
    props.onDismissModal,
  ]);

  return (
    <RootLongModal
      headerSize="small"
      show={props.show}
      onDismiss={props.onDismissModal}
      headerChildren={
        <HeaderWrapper>
          <FloroHeaderTitle>{"edit repo setting roles"}</FloroHeaderTitle>
        </HeaderWrapper>
      }
    >
      <ContentContainer>
        <TopContentContainer>
          <div
            style={{
              display: "flex",
              alignItems: "flex-start",
              width: 468,
              flexDirection: "column",
            }}
          >
            <LabelText>{"Assign Roles"}</LabelText>
            <div style={{ marginTop: 20 }}>
              {props?.repository.organization?.roles?.map((role, index) => {
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
          <div style={{ height: 40, marginBottom: 24, display: 'flex', flexDirection: 'row', justifyContent: 'flex-start', alignItems: 'center' }}>
            {disableUpdate && (
              <WarningLabel
                label={"Configuration would remove access to you"}
                size={"small"}
              />
            )}
          </div>
          <ButtonRow>
          <Button
            onClick={props.onDismissModal}
            label={"cancel"}
            bg={"gray"}
            size={"medium"}
          />
          <Button
            isDisabled={disableUpdate}
            onClick={onUpdate}
            label={"update roles"}
            bg={"orange"}
            size={"medium"}
            isLoading={updateRolesResult.loading}
          />

          </ButtonRow>
        </BottomContentContainer>
      </ContentContainer>
    </RootLongModal>
  );
};

export default React.memo(AddSettingsRolesModal);
