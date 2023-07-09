import React, { useState, useMemo, useEffect, useCallback } from "react";
import styled from "@emotion/styled";
import RootLongModal from "@floro/common-react/src/components/RootLongModal";
import Button from "@floro/storybook/stories/design-system/Button";
import Input from "@floro/storybook/stories/design-system/Input";
import { useTheme } from "@emotion/react";
import {
  Organization,
  useCreateOrganizationRoleMutation,
} from "@floro/graphql-schemas/src/generated/main-client-graphql";
import Checkbox from "@floro/storybook/stories/design-system/Checkbox";

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


export interface Props {
  show: boolean;
  onDismissModal: () => void;
  organization: Organization;
}

const CreateRoleModal = (props: Props) => {
  const theme = useTheme();
  const [createRole, createRoleRequest] = useCreateOrganizationRoleMutation();

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

  const onCreate = useCallback(() => {
    if (!props.organization?.id) {
      return;
    }
    createRole({
      variables: {
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
    if (props.show) {
      setName("");
      setIsDefault(false);
      //canCreateRepos: Boolean!,
      setCanCreateRepos(false);
      //canModifyOrganizationSettings: Boolean!,
      setCanModifyOrganizationSettings(false);
      //canModifyOrganizationDeveloperSettings: Boolean!,
      setCanModifyOrganizationDeveloperSettings(false);
      //canModifyOrganizationMembers: Boolean!,
      setCanModifyOrganizationMembers(false);
      //canInviteMembers: Boolean!,
      setCanInviteMembers(false);
      //canModifyInvites: Boolean!,
      setCanModifyInvites(false);
      //canModifyOwnInternalHandle: Boolean!,
      setCanModifyOwnInternalHandle(true);
      //canModifyBilling: Boolean!,
      setCanModifyBilling(false);
      //canRegisterPlugins: Boolean!,
      setCanRegisterPlugins(false);
      //canUploadPlugins: Boolean!,
      setCanUploadPlugins(false);
      //canReleasePlugins: Boolean!,
      setCanReleasePlugins(false);
      //canModifyOrganizationRoles: Boolean!,
      setCanModifyOrganizationRoles(false);
      //canAssignRoles: Boolean!
      setCanAssignRoles(false);
    }
  }, [props.show]);

  const isValid = useMemo(() => {
    if(name?.trim() == "") {
        return false;
    }
    const roleLowerCaseNames = props.organization?.roles?.map(r => r?.name?.toLowerCase() ?? "");
    if (roleLowerCaseNames?.includes(name?.trim()?.toLowerCase())) {
        return false;
    }
    return true;
  }, [name, props.organization?.roles]);

  useEffect(() => {
    if (
      createRoleRequest?.data?.createOrganizationRole?.__typename ==
      "CreateOrganizationRoleSuccess"
    ) {
      props.onDismissModal();
    }
  }, [
    props.onDismissModal,
    createRoleRequest?.data?.createOrganizationRole?.__typename,
  ]);

  return (
    <RootLongModal
      show={props.show}
      onDismiss={props.onDismissModal}
      disableBackgroundDismiss
      headerSize={"small"}
      headerChildren={
        <HeaderWrapper>
          <FloroHeaderTitle>{"create new role"}</FloroHeaderTitle>
        </HeaderWrapper>
      }
    >
      <ContentWrapper>
        <TopWrapper>
          <Input
            value={name}
            label={"role name"}
            placeholder={"role name"}
            onTextChanged={onChangeName}
            widthSize="wide"
            isValid={isValid || name.length == 0}
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
              onClick={onCreate}
              isLoading={createRoleRequest.loading}
              isDisabled={!isValid}
              label={"create role"}
              bg={"purple"}
              size={"extra-big"}
            />
          </ButtonRow>
        </BottomWrapper>
      </ContentWrapper>
    </RootLongModal>
  );
};

export default React.memo(CreateRoleModal);
