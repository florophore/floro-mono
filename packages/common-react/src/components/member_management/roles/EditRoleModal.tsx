import React, { useState, useMemo, useEffect, useCallback } from "react";
import styled from "@emotion/styled";
import RootLongModal from "@floro/common-react/src/components/RootLongModal";
import Button from "@floro/storybook/stories/design-system/Button";
import Input from "@floro/storybook/stories/design-system/Input";
import { useTheme } from "@emotion/react";
import {
  Organization,
  OrganizationRole,
  useRemoveOrganizationRoleMutation,
  useUpdateOrganizationRoleMutation,
} from "@floro/graphql-schemas/src/generated/main-client-graphql";
import Checkbox from "@floro/storybook/stories/design-system/Checkbox";
import RedHexagonWarningLight from "@floro/common-assets/assets/images/icons/red_hexagon_warning.light.svg";
import RedHexagonWarningDark from "@floro/common-assets/assets/images/icons/red_hexagon_warning.dark.svg";

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

const ContentWrapper = styled.div`
  padding: 16px;
  display: flex;
  height: 100%;
  flex-direction: column;
  justify-content: space-around;
`;

const TopWrapper = styled.div`
  display: flex;
  height: 100%;
  flex-direction: column;
  align-items: center;
`;

const BottomWrapper = styled.div`
  display: flex;
  height: 100%;
  flex-direction: column;
  align-items: center;
  justify-content: flex-end;
  padding-bottom: 16px;
`;

const PermissionsWrapper = styled.div`
  margin-top: 18px;
`;

const TextAreaBlurbBox = styled.div`
  font-family: "MavenPro";
  font-weight: 600;
  font-size: 1.4rem;
  border: 2px solid ${(props) => props.theme.colors.contrastTextLight};
  padding: 16px 16px 8px 16px;
  border-radius: 8px;
  position: relative;
  margin: 0;
  width: 470px;
`;

const LabelContainer = styled.div`
  position: absolute;
  top: -16px;
  left: 32px;
  background: ${(props) => props.theme.background};
  color: ${(props) => props.theme.colors.inputLabelTextColor};
  padding: 4px;
  display: inline-flex;
  justify-content: center;
  align-items: center;
`;

const LabelText = styled.span`
  font-family: "MavenPro";
  font-weight: 400;
  font-size: 1rem;
  transition: 500ms color;
  user-select: none;
`;

const LabelBorderEnd = styled.div`
  position: absolute;
  height: 2px;
  width: 2px;
  border-radius: 50%;
  top: 14px;
  transition: 500ms background-color;
`;

const PermissionBox = styled.div`
  width: 100%;
  padding-top: 8px;
  padding-bottom: 8px;
`;

const PermissionRow = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: flex-start
  padding-top: 8px;
  padding-bottom: 8px;
`;

const PermissionText = styled.div`
  margin-left: 8px;
  font-family: "MavenPro";
  font-weight: 500;
  font-size: 1.3rem;
  color: ${(props) => props.theme.colors.contrastText};
`;

const DefaultRow = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: flex-start
  align-items: center;
  padding-top: 24px;
  padding-bottom: 8px;
  width: 470px;
`;

const DefaultText = styled.div`
  margin-left: 8px;
  font-family: "MavenPro";
  font-weight: 500;
  font-size: 1.3rem;
  color: ${(props) => props.theme.colors.contrastText};
`;

const ButtonRow = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
  width: 470px;
`;

const WarningIcon = styled.img`
  height: 96px;
  width: 96px;
`;

const PromptText = styled.p`
  padding: 0;
  margin: 24px 0 0 0;
  font-size: 1.4rem;
  font-family: "MavenPro";
  font-weight: 500;
  text-align: center;
  color: ${(props) => props.theme.colors.promptText};
`;

export interface Props {
  show: boolean;
  onDismissModal: () => void;
  role: null | OrganizationRole;
  organization: Organization;
}

const EditRoleModal = (props: Props) => {
  const theme = useTheme();
  const [showConfirmDelete, setShowConfirmDelete] = useState(false);
  const icon = useMemo(() => {
    return theme.name == "light"
      ? RedHexagonWarningLight
      : RedHexagonWarningDark;
  }, [theme.name]);

  const [updateRole, updateRoleRequest] = useUpdateOrganizationRoleMutation();
  const [removeRole, removeRoleRequest] = useRemoveOrganizationRoleMutation();

  useEffect(() => {
    if (props.show) {
      setShowConfirmDelete(false);
    }
  }, [props.show]);

  const onShowConfirmDelete = useCallback(() => {
    setShowConfirmDelete(true);
  }, []);

  const onCancelConfirmDelete = useCallback(() => {
    setShowConfirmDelete(false);
  }, []);

  const [name, setName] = useState("");
  const [isDefault, setIsDefault] = useState(false);
  const [canCreateRepos, setCanCreateRepos] = useState(false);
  const [canModifyOrganizationSettings, setCanModifyOrganizationSettings] =
    useState(false);
  const [
    canModifyOrganizationDeveloperSettings,
    setCanModifyOrganizationDeveloperSettings,
  ] = useState(false);
  const [canModifyOrganizationMembers, setCanModifyOrganizationMembers] =
    useState(false);
  const [canInviteMembers, setCanInviteMembers] = useState(false);
  const [canModifyInvites, setCanModifyInvites] = useState(false);
  const [canModifyOwnInternalHandle, setCanModifyOwnInternalHandle] =
    useState(true);
  const [canModifyBilling, setCanModifyBilling] = useState(false);
  const [canRegisterPlugins, setCanRegisterPlugins] = useState(false);
  const [canUploadPlugins, setCanUploadPlugins] = useState(false);
  const [canReleasePlugins, setCanReleasePlugins] = useState(false);
  const [canModifyOrganizationRoles, setCanModifyOrganizationRoles] =
    useState(false);
  const [canAssignRoles, setCanAssignRoles] = useState(false);

  const onChangeName = useCallback((text: string) => {
    setName(text);
  }, []);

  const onRemove = useCallback(() => {
    if (!props.role?.id || !props.organization?.id) {
      return;
    }
    removeRole({
      variables: {
        roleId: props.role.id,
        organizationId: props.organization.id,
      },
    });
  }, [props.role?.id, props?.organization?.id]);

  const onUpdate = useCallback(() => {
    if (!props.role?.id || !props.organization?.id) {
      return;
    }
    updateRole({
      variables: {
        roleId: props.role.id,
        organizationId: props.organization.id,
        name,
        isDefault,
        canCreateRepos,
        canModifyOrganizationSettings,
        canModifyOrganizationDeveloperSettings,
        canModifyOrganizationMembers,
        canInviteMembers,
        canModifyInvites,
        canModifyOwnInternalHandle,
        canModifyBilling,
        canRegisterPlugins,
        canUploadPlugins,
        canReleasePlugins,
        canModifyOrganizationRoles,
        canAssignRoles,
      },
    });
  }, [
    props.role,
    props.organization,
    name,
    isDefault,
    canCreateRepos,
    canModifyOrganizationSettings,
    canModifyOrganizationDeveloperSettings,
    canModifyOrganizationMembers,
    canInviteMembers,
    canModifyInvites,
    canModifyOwnInternalHandle,
    canModifyBilling,
    canRegisterPlugins,
    canUploadPlugins,
    canReleasePlugins,
    canModifyOrganizationRoles,
    canAssignRoles,
  ]);

  useEffect(() => {
    if (props.role) {
      setName(props?.role?.name ?? "");
      setIsDefault(props?.role?.isDefault ?? false);
      //canCreateRepos: Boolean!,
      setCanCreateRepos(props?.role.canCreateRepos ?? false);
      //canModifyOrganizationSettings: Boolean!,
      setCanModifyOrganizationSettings(
        props?.role.canModifyOrganizationSettings ?? false
      );
      //canModifyOrganizationDeveloperSettings: Boolean!,
      setCanModifyOrganizationDeveloperSettings(
        props.role?.canModifyOrganizationDeveloperSettings ?? false
      );
      //canModifyOrganizationMembers: Boolean!,
      setCanModifyOrganizationMembers(
        props.role?.canModifyOrganizationMembers ?? false
      );
      //canInviteMembers: Boolean!,
      setCanInviteMembers(props.role?.canInviteMembers ?? false);
      //canModifyInvites: Boolean!,
      setCanModifyInvites(props.role?.canModifyInvites ?? false);
      //canModifyOwnInternalHandle: Boolean!,
      setCanModifyOwnInternalHandle(props.role?.canModifyInvites ?? true);
      //canModifyBilling: Boolean!,
      setCanModifyBilling(props.role?.canModifyBilling ?? false);
      //canRegisterPlugins: Boolean!,
      setCanRegisterPlugins(props.role?.canRegisterPlugins ?? false);
      //canUploadPlugins: Boolean!,
      setCanUploadPlugins(props.role?.canUploadPlugins ?? false);
      //canReleasePlugins: Boolean!,
      setCanReleasePlugins(props.role?.canReleasePlugins ?? false);
      //canModifyOrganizationRoles: Boolean!,
      setCanModifyOrganizationRoles(
        props.role?.canModifyOrganizationRoles ?? false
      );
      //canAssignRoles: Boolean!
      setCanAssignRoles(props.role?.canAssignRoles ?? false);
    }
  }, [props.role]);

  const isValid = useMemo(() => {
    if(name?.trim() == "") {
        return false;
    }
    if (!props.role?.id) {
        return false
    }
    const roleLowerCaseNames = props.organization?.roles
      ?.filter((r) => r?.id != props?.role?.id)
      ?.map((r) => r?.name?.toLowerCase() ?? "");
    if (roleLowerCaseNames?.includes(name?.trim()?.toLowerCase())) {
        return false;
    }
    return true;
  }, [name, props.organization?.roles, props.role]);

  useEffect(() => {
    if (
      updateRoleRequest?.data?.updateOrganizationRole?.__typename ==
      "UpdateOrganizationRoleSuccess"
    ) {
      props.onDismissModal();
    }
  }, [
    props.onDismissModal,
    updateRoleRequest?.data?.updateOrganizationRole?.__typename,
  ]);

  useEffect(() => {
    if (
      removeRoleRequest?.data?.removeOrganizationRole?.__typename ==
      "RemoveOrganizationRoleSuccess"
    ) {
      props.onDismissModal();
    }
  }, [
    props.onDismissModal,
    removeRoleRequest?.data?.removeOrganizationRole?.__typename,
  ]);

  return (
    <RootLongModal
      show={props.show}
      onDismiss={props.onDismissModal}
      disableBackgroundDismiss
      headerSize={"small"}
      headerChildren={
        <HeaderWrapper>
          <FloroHeaderTitle>{showConfirmDelete ? "delete role" : "edit role"}</FloroHeaderTitle>
        </HeaderWrapper>
      }
    >
      <ContentWrapper>
        {!showConfirmDelete && (
          <>
            <TopWrapper>
              <Input
                value={name}
                label={"role name"}
                isValid={isValid}
                placeholder={"role name"}
                onTextChanged={onChangeName}
                widthSize="wide"
              />
              <DefaultRow>
                <Checkbox isChecked={isDefault} onChange={setIsDefault} />
                <DefaultText>
                  {"Make Default on New Member Invitations"}
                </DefaultText>
              </DefaultRow>
              <PermissionsWrapper>
                <TextAreaBlurbBox
                  style={{
                    position: "relative",
                  }}
                >
                  <LabelContainer>
                    <LabelBorderEnd style={{ left: -1 }} />
                    <LabelText>{"permissions"}</LabelText>
                    <LabelBorderEnd style={{ right: -1 }} />
                  </LabelContainer>
                  <PermissionBox>
                    <PermissionRow>
                      <Checkbox
                        isChecked={canCreateRepos}
                        onChange={setCanCreateRepos}
                      />
                      <PermissionText>{"Create Repos"}</PermissionText>
                    </PermissionRow>
                    <PermissionRow>
                      <Checkbox
                        isChecked={canModifyOrganizationSettings}
                        onChange={setCanModifyOrganizationSettings}
                      />
                      <PermissionText>
                        {"Modify Organization Settings"}
                      </PermissionText>
                    </PermissionRow>
                    <PermissionRow>
                      <Checkbox
                        isChecked={canInviteMembers}
                        onChange={setCanInviteMembers}
                      />
                      <PermissionText>{"Invite Members"}</PermissionText>
                    </PermissionRow>
                    <PermissionRow>
                      <Checkbox
                        isChecked={canModifyInvites}
                        onChange={setCanModifyInvites}
                      />
                      <PermissionText>{"Modify Invites"}</PermissionText>
                    </PermissionRow>
                    <PermissionRow>
                      <Checkbox
                        isChecked={canModifyOrganizationMembers}
                        onChange={setCanModifyOrganizationMembers}
                      />
                      <PermissionText>{"Modify Members"}</PermissionText>
                    </PermissionRow>
                    <PermissionRow>
                      <Checkbox
                        isChecked={canModifyOrganizationRoles}
                        onChange={setCanModifyOrganizationRoles}
                      />
                      <PermissionText>{"Modify Roles"}</PermissionText>
                    </PermissionRow>
                    <PermissionRow>
                      <Checkbox
                        isChecked={canAssignRoles}
                        onChange={setCanAssignRoles}
                      />
                      <PermissionText>{"Assign Roles"}</PermissionText>
                    </PermissionRow>
                    <PermissionRow>
                      <Checkbox
                        isChecked={canModifyBilling}
                        onChange={setCanModifyBilling}
                      />
                      <PermissionText>{"Modify Billing"}</PermissionText>
                    </PermissionRow>
                    <PermissionRow>
                      <Checkbox
                        isChecked={canModifyOrganizationDeveloperSettings}
                        onChange={setCanModifyOrganizationDeveloperSettings}
                      />
                      <PermissionText>{"Modify Dev Settings"}</PermissionText>
                    </PermissionRow>
                    <PermissionRow>
                      <Checkbox
                        isChecked={canRegisterPlugins}
                        onChange={setCanRegisterPlugins}
                      />
                      <PermissionText>{"Register Plugins"}</PermissionText>
                    </PermissionRow>
                    <PermissionRow>
                      <Checkbox
                        isChecked={canUploadPlugins}
                        onChange={setCanUploadPlugins}
                      />
                      <PermissionText>{"Upload Plugins"}</PermissionText>
                    </PermissionRow>
                    <PermissionRow>
                      <Checkbox
                        isChecked={canReleasePlugins}
                        onChange={setCanReleasePlugins}
                      />
                      <PermissionText>{"Release Plugins"}</PermissionText>
                    </PermissionRow>
                  </PermissionBox>
                </TextAreaBlurbBox>
              </PermissionsWrapper>
            </TopWrapper>
            <BottomWrapper>
              <ButtonRow>
                <Button
                  onClick={onShowConfirmDelete}
                  label={"delete role"}
                  bg={"red"}
                  size={"medium"}
                  isDisabled={updateRoleRequest.loading}
                />
                <Button
                  onClick={onUpdate}
                  isDisabled={!isValid}
                  isLoading={updateRoleRequest.loading}
                  label={"update role"}
                  bg={"orange"}
                  size={"medium"}
                />
              </ButtonRow>
            </BottomWrapper>
          </>
        )}
        {showConfirmDelete && (
          <>
            <TopWrapper
              style={{
                justifyContent: "center",
                alignItems: "center",
              }}
            >
              <WarningIcon src={icon} />
              <PromptText>
                {`Are you sure you want to remove "${props?.role?.name ?? ""}" role?`}
              </PromptText>
              <PromptText>
                {
                  "It will affect the permissions of members with this role attributed."
                }
              </PromptText>
            </TopWrapper>
            <BottomWrapper>
              <ButtonRow>
                <Button
                  onClick={onCancelConfirmDelete}
                  isDisabled={removeRoleRequest.loading}
                  label={"cancel delete"}
                  bg={"gray"}
                  size={"medium"}
                />
                <Button
                  onClick={onRemove}
                  isLoading={removeRoleRequest.loading}
                  label={"confirm delete"}
                  bg={"red"}
                  size={"medium"}
                />
              </ButtonRow>
            </BottomWrapper>
          </>
        )}
      </ContentWrapper>
    </RootLongModal>
  );
};

export default React.memo(EditRoleModal);
