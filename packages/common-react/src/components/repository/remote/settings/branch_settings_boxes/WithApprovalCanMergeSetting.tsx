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

const WithApprovalCanMergeSetting = (props: Props) => {
  const [anyoneWithApprovalCanMerge, setAnyoneWithApprovalCanMerge] =
    useState<boolean>(false);

  const [showAddUsers, setShowAddUsers] = useState<boolean>(false);
  const [showAddRoles, setShowAddRoles] = useState<boolean>(false);
  const theme = useTheme();
  const [updateAnyoneWithApprovalCanMergeMergeRequests, updateAnyoneWithApprovalCanMergeMergeRequestsRequest] = useUpdateAnyoneWithApprovalCanMergeMutation();
  const loaderColor = useMemo((): keyof ColorPalette => {
    if (theme.name == "light") {
      return "mediumGray";
    }
    return "white";
  }, [theme.name]);

  useEffect(() => {
    setAnyoneWithApprovalCanMerge(
      props.repository?.protectedBranchRule?.anyoneWithApprovalCanMerge ?? false
    );
  }, [props.repository?.protectedBranchRule?.anyoneWithApprovalCanMerge]);

  const onChange = useCallback(() => {
    if (props.repository?.id && props?.repository?.protectedBranchRule?.id) {
      setAnyoneWithApprovalCanMerge(!anyoneWithApprovalCanMerge);
      updateAnyoneWithApprovalCanMergeMergeRequests({
        variables: {
          repositoryId: props.repository?.id,
          protectedBranchRuleId: props?.repository?.protectedBranchRule?.id,
          anyoneWithApprovalCanMerge: !anyoneWithApprovalCanMerge
        },
      });
    }
  }, [anyoneWithApprovalCanMerge, props?.repository?.protectedBranchRule?.id, props.repository]);

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
      <WithApprovalCanMergeUsersModal
        show={showAddUsers}
        onDismissModal={onHideAddUsers}
        repository={props.repository}
      />
      <WithApprovalCanMergeRolesModal
        show={showAddRoles}
        onDismissModal={onHideAddRoles}
        repository={props.repository}
      />
      <MainContainer>
        <LeftContainer>
          <Checkbox
            isChecked={anyoneWithApprovalCanMerge}
            onChange={onChange}
          />
        </LeftContainer>
        <RightContainer>
          <TitleSpan>
            <Title>{"Anyone with Push Access Can Merge Approved Merge Requests"}</Title>
            {updateAnyoneWithApprovalCanMergeMergeRequestsRequest.loading && (
              <div style={{ marginLeft: 12 }}>
                <DotsLoader color={loaderColor} size={"small"} />
              </div>
            )}
          </TitleSpan>
          <SubTitle>
            {
              "Allow all members with push access to merge approved merge requests into this branch."
            }
          </SubTitle>
          {!props?.repository?.protectedBranchRule?.anyoneWithApprovalCanMerge && (
            <BottomContainer>
              {props?.repository?.repoType == "org_repo" && (
                <div style={{ marginTop: 24 }}>
                  <EnabledRoleDisplay
                    repository={props.repository}
                    enabledRoles={
                      (props?.repository?.protectedBranchRule?.withApprovalCanMergeRoles ??
                        []) as OrganizationRole[]
                    }
                    onClickShow={onShowAddRoles}
                    label="roles who can merge approved merge requests"
                  />
                </div>
              )}
              <div style={{ marginTop: 24 }}>
                <EnabledUserDisplay
                  repository={props.repository}
                  enabledUsers={
                    (props?.repository?.protectedBranchRule?.withApprovalCanMergeUsers ?? []) as User[]
                  }
                  onClickShow={onShowAddUsers}
                  label="users who can merge approved merge requests"
                />
              </div>
            </BottomContainer>
          )}
        </RightContainer>
      </MainContainer>
    </Container>
  );
};

export default React.memo(WithApprovalCanMergeSetting);
