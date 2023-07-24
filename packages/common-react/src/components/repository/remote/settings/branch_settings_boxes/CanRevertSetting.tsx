import React, {
  useMemo,
  useCallback,
  useState,
  useEffect,
} from "react";
import styled from "@emotion/styled";
import { useTheme } from "@emotion/react";
import {
  Repository,
  User,
  OrganizationRole,
  useUpdateAnyoneWithApprovalCanMergeMutation,
  useUpdateAnyoneCanRevertMutation,
} from "@floro/graphql-schemas/src/generated/main-client-graphql";
import { ColorPalette } from "@floro/styles/ColorPalette";
import Checkbox from "@floro/storybook/stories/design-system/Checkbox";
import DotsLoader from "@floro/storybook/stories/design-system/DotsLoader";
import EnabledUserDisplay from "../components/EnabledUserDisplay";
import EnabledRoleDisplay from "../components/EnabledRoleDisplay";
import CanApproveMergeRequestsUsersModal from "../branch_settings_modals/CanApproveMergeRequestsUsersModal";
import CanApproveMergeRequestsRolesModal from "../branch_settings_modals/CanApproveMergeRequestsRolesModal";
import WithApprovalCanMergeUsersModal from "../branch_settings_modals/WithApprovalCanMergeUsersModal";
import WithApprovalCanMergeRolesModal from "../branch_settings_modals/WithApprovalCanMergeRolesModal";
import CanRevertUsersModal from "../branch_settings_modals/CanRevertUsersModal";
import CanRevertRolesModal from "../branch_settings_modals/CanRevertRolesModal";

const Container = styled.div`
  margin-top: 24px;
  width: 100%;
  max-width: 960px;
  padding: 16px;
  border: 2px solid ${(props) => props.theme.colors.contrastText};
  border-radius: 8px;
`;

const Title = styled.span`
  font-family: "MavenPro";
  font-weight: 600;
  font-size: 1.4rem;
  color: ${(props) => props.theme.colors.contrastText};
`;

const TitleSpan = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;
  position: relative;
`;

const MainContainer = styled.div`
  width: 100%;
  display: flex;
  flex-direction: row;
`;

const LeftContainer = styled.div`
  margin-right: 12px;
`;

const RightContainer = styled.div`
  display: flex;
  flex-direction: column;
  flex-grow: 1;
`;

const TitleContainer = styled.div`
  width: 100%;
  max-width: 960px;
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  align-items: flex-end;
`;

const SubTitle = styled.p`
  margin-top: 8px;
  padding: 0;
  font-family: "MavenPro";
  font-weight: 500;
  font-size: 1rem;
  color: ${(props) => props.theme.colors.standardTextLight};
`;

const BottomContainer = styled.div`
  display: flex;
  height: 100%;
  width: 100%;
  flex-direction: column;
`;

interface Props {
  repository: Repository;
}

const CanRevertSetting = (props: Props) => {
  const [anyoneCanRevert, setAnyoneCanRevert] =
    useState<boolean>(false);

  const [showAddUsers, setShowAddUsers] = useState<boolean>(false);
  const [showAddRoles, setShowAddRoles] = useState<boolean>(false);
  const theme = useTheme();
  const [updateAnyoneCanRevert, updateAnyoneCanRevertRequest] = useUpdateAnyoneCanRevertMutation();
  const loaderColor = useMemo((): keyof ColorPalette => {
    if (theme.name == "light") {
      return "mediumGray";
    }
    return "white";
  }, [theme.name]);

  useEffect(() => {
    setAnyoneCanRevert(
      props.repository?.protectedBranchRule?.anyoneCanRevert ?? false
    );
  }, [props.repository?.protectedBranchRule?.anyoneCanRevert]);

  const onChange = useCallback(() => {
    if (props.repository?.id && props?.repository?.protectedBranchRule?.id) {
      setAnyoneCanRevert(!anyoneCanRevert);
      updateAnyoneCanRevert({
        variables: {
          repositoryId: props.repository?.id,
          protectedBranchRuleId: props?.repository?.protectedBranchRule?.id,
          anyoneCanRevert: !anyoneCanRevert
        },
      });
    }
  }, [anyoneCanRevert, props?.repository?.protectedBranchRule?.id, props.repository]);

  const onShowAddUsers = useCallback(() => {
    setShowAddUsers(true);
  }, []);

  const onHideAddUsers = useCallback(() => {
    setShowAddUsers(false);
  }, []);

  const onShowAddRoles = useCallback(() => {
    setShowAddRoles(true);
  }, []);

  const onHideAddRoles = useCallback(() => {
    setShowAddRoles(false);
  }, []);

  return (
    <Container>
      <CanRevertUsersModal
        show={showAddUsers}
        onDismissModal={onHideAddUsers}
        repository={props.repository}
      />
      <CanRevertRolesModal
        show={showAddRoles}
        onDismissModal={onHideAddRoles}
        repository={props.repository}
      />
      <MainContainer>
        <LeftContainer>
          <Checkbox
            isChecked={anyoneCanRevert}
            onChange={onChange}
          />
        </LeftContainer>
        <RightContainer>
          <TitleSpan>
            <Title>{"Anyone with Push Access Can Revert Changes"}</Title>
            {updateAnyoneCanRevertRequest.loading && (
              <div style={{ marginLeft: 12 }}>
                <DotsLoader color={loaderColor} size={"small"} />
              </div>
            )}
          </TitleSpan>
          <SubTitle>
            {
              "Allow all members with push access to revert changes on this branch."
            }
          </SubTitle>
          {!props?.repository?.protectedBranchRule?.anyoneCanRevert && (
            <BottomContainer>
              {props?.repository?.repoType == "org_repo" && (
                <div style={{ marginTop: 24 }}>
                  <EnabledRoleDisplay
                    repository={props.repository}
                    enabledRoles={
                      (props?.repository?.protectedBranchRule?.canRevertRoles ??
                        []) as OrganizationRole[]
                    }
                    onClickShow={onShowAddRoles}
                    label="roles who can revert changes"
                  />
                </div>
              )}
              <div style={{ marginTop: 24 }}>
                <EnabledUserDisplay
                  repository={props.repository}
                  enabledUsers={
                    (props?.repository?.protectedBranchRule?.canRevertUsers ?? []) as User[]
                  }
                  onClickShow={onShowAddUsers}
                  label="users who can revert changes"
                />
              </div>
            </BottomContainer>
          )}
        </RightContainer>
      </MainContainer>
    </Container>
  );
};

export default React.memo(CanRevertSetting);
