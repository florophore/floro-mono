import React, { useCallback, useState, useEffect, useMemo } from "react";
import styled from "@emotion/styled";
import { useTheme } from "@emotion/react";
import {
    Organization,
  OrganizationByHandleLazyQueryHookResult,
  OrganizationRole,
} from "@floro/graphql-schemas/src/generated/main-client-graphql";
import Button from "@floro/storybook/stories/design-system/Button";
import RedXCircleLight from "@floro/common-assets/assets/images/icons/red_x_circle.light.svg";
import RedXCircleDark from "@floro/common-assets/assets/images/icons/red_x_circle.dark.svg";
import VerifiedLight from "@floro/common-assets/assets/images/icons/verified.light.svg";
import VerifiedDark from "@floro/common-assets/assets/images/icons/verified.dark.svg";

const Container = styled.div`
  width: 100%;
  max-width: 400px;
  display: flex;
  flex-direction: column;
  margin-bottom: 48px;
`;

const TitleRow = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  align-items: flex-start;
  height: 48px;
`;

const Title = styled.h1`
  font-family: "MavenPro";
  font-weight: 500;
  font-size: 1.4rem;
  color: ${(props) => props.theme.colors.pluginDisplayTitle};
`;

const PermissionsWrapper = styled.div`
  margin-top: 18px;
`;

const TextAreaBlurbBox = styled.div`
  font-family: "MavenPro";
  font-weight: 600;
  font-size: 1.4rem;
  border: 1px solid ${(props) => props.theme.colors.blurbBorder};
  padding: 16px 16px 8px 16px;
  border-radius: 8px;
  min-height: 320px;
  position: relative;
  display: grid;
  width: 100%;
  margin: 0;

  &::after {
    content: attr(data-value) " ";
    visibility: hidden;
    white-space: pre-wrap;
    font-weight: 400;
    font-size: 1rem;
    display: block;
    margin-top: -38px;
  }
`;

const LabelContainer = styled.div`
  position: absolute;
  height: 32;
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

const DefaultText = styled.span`
  margin-top: 2px;
  margin-left: 2px;
  display: block;
  font-family: "MavenPro";
  font-weight: 400;
  font-size: 1rem;
  font-style: italic;
  transition: 500ms color;
  color: ${(props) => props.theme.colors.contrastText};
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

const Icon = styled.img`
  height: 24px;
  width: 24px;
`;

interface Props {
  role: OrganizationRole;
  organization: Organization;
  onEditRole: (role: OrganizationRole) => void;
}
const RoleDisplay = (props: Props) => {
  const theme = useTheme();
  const xIcon = useMemo(() => {
    if (theme.name == "light") {
      return RedXCircleLight;
    }
    return RedXCircleDark;
  }, [theme.name]);
  const verifiedIcon = useMemo(() => {
    if (theme.name == "light") {
      return VerifiedLight;
    }
    return VerifiedDark;
  }, [theme.name]);

  const onEdit = useCallback(() => {
    props.onEditRole(props.role);
  }, [props.onEditRole, props.role]);
  return (
    <Container>
      <TitleRow>
        <div>
          <Title>{props.role.name}</Title>
          {props.role.isDefault && (
            <DefaultText>{"(default role)"}</DefaultText>
          )}
        </div>
        {props.role.isMutable && props.organization?.membership?.permissions?.canCreateRepos && (
          <Button onClick={onEdit} label={"edit"} bg={"orange"} size={"small"} />
        )}
      </TitleRow>
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
                <Icon src={props.role.canCreateRepos ? verifiedIcon : xIcon}/>
                <PermissionText>{'Create Repos'}</PermissionText>
            </PermissionRow>
            <PermissionRow>
                <Icon src={props.role.canModifyOrganizationSettings ? verifiedIcon : xIcon}/>
                <PermissionText>{'Modify Organization Settings'}</PermissionText>
            </PermissionRow>
            <PermissionRow>
                <Icon src={props.role.canInviteMembers ? verifiedIcon : xIcon}/>
                <PermissionText>{'Invite Members'}</PermissionText>
            </PermissionRow>
            <PermissionRow>
                <Icon src={props.role.canModifyInvites ? verifiedIcon : xIcon}/>
                <PermissionText>{'Modify Invites'}</PermissionText>
            </PermissionRow>
            <PermissionRow>
                <Icon src={props.role.canModifyOrganizationMembers ? verifiedIcon : xIcon}/>
                <PermissionText>{'Modify Members'}</PermissionText>
            </PermissionRow>
            <PermissionRow>
                <Icon src={props.role.canModifyOrganizationRoles ? verifiedIcon : xIcon}/>
                <PermissionText>{'Modify Roles'}</PermissionText>
            </PermissionRow>
            <PermissionRow>
                <Icon src={props.role.canAssignRoles ? verifiedIcon : xIcon}/>
                <PermissionText>{'Assign Roles'}</PermissionText>
            </PermissionRow>
            <PermissionRow>
                <Icon src={props.role.canModifyBilling ? verifiedIcon : xIcon}/>
                <PermissionText>{'Modify Billing'}</PermissionText>
            </PermissionRow>
            <PermissionRow>
                <Icon src={props.role.canModifyOrganizationDeveloperSettings ? verifiedIcon : xIcon}/>
                <PermissionText>{'Modify Dev Settings'}</PermissionText>
            </PermissionRow>
            <PermissionRow>
                <Icon src={props.role.canRegisterPlugins ? verifiedIcon : xIcon}/>
                <PermissionText>{'Register Plugins'}</PermissionText>
            </PermissionRow>
            <PermissionRow>
                <Icon src={props.role.canUploadPlugins ? verifiedIcon : xIcon}/>
                <PermissionText>{'Upload Plugins'}</PermissionText>
            </PermissionRow>
            <PermissionRow>
                <Icon src={props.role.canReleasePlugins ? verifiedIcon : xIcon}/>
                <PermissionText>{'Release Plugins'}</PermissionText>
            </PermissionRow>
          </PermissionBox>
        </TextAreaBlurbBox>
      </PermissionsWrapper>
    </Container>
  );
};

export default React.memo(RoleDisplay);
