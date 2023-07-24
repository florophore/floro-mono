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
  useUpdateAnyoneCanApproveMergeRequestsMutation,
} from "@floro/graphql-schemas/src/generated/main-client-graphql";
import { ColorPalette } from "@floro/styles/ColorPalette";
import Checkbox from "@floro/storybook/stories/design-system/Checkbox";
import DotsLoader from "@floro/storybook/stories/design-system/DotsLoader";
import EnabledUserDisplay from "../components/EnabledUserDisplay";
import EnabledRoleDisplay from "../components/EnabledRoleDisplay";
import CanCreateMergeRequestsUsersModal from "../branch_settings_modals/CanCreateMergeRequestsUsersModal";
import CanCreateMergeRequestsRolesModal from "../branch_settings_modals/CanCreateMergeRequestsRolesModal";
import CanApproveMergeRequestsUsersModal from "../branch_settings_modals/CanApproveMergeRequestsUsersModal";
import CanApproveMergeRequestsRolesModal from "../branch_settings_modals/CanApproveMergeRequestsRolesModal";

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

const CanApproveMergeRequestsSetting = (props: Props) => {
  const [anyoneCanApproveMergeRequests, setAnyoneCanApproveMergeRequests] =
    useState<boolean>(false);

  const [showAddUsers, setShowAddUsers] = useState<boolean>(false);
  const [showAddRoles, setShowAddRoles] = useState<boolean>(false);
  const theme = useTheme();
  const [updateAnyoneCanApproveMergeRequests, updateAnyoneCanApproveMergeRequestsRequest] = useUpdateAnyoneCanApproveMergeRequestsMutation();
  const loaderColor = useMemo((): keyof ColorPalette => {
    if (theme.name == "light") {
      return "mediumGray";
    }
    return "white";
  }, [theme.name]);

  useEffect(() => {
    setAnyoneCanApproveMergeRequests(
      props.repository?.protectedBranchRule?.anyoneCanApproveMergeRequests ?? false
    );
  }, [props.repository?.protectedBranchRule?.anyoneCanCreateMergeRequests]);

  const onChange = useCallback(() => {
    if (props.repository?.id && props?.repository?.protectedBranchRule?.id) {
      setAnyoneCanApproveMergeRequests(!anyoneCanApproveMergeRequests);
      updateAnyoneCanApproveMergeRequests({
        variables: {
          repositoryId: props.repository?.id,
          protectedBranchRuleId: props?.repository?.protectedBranchRule?.id,
          anyoneCanApproveMergeRequests: !anyoneCanApproveMergeRequests,
        },
      });
    }
  }, [anyoneCanApproveMergeRequests, props?.repository?.protectedBranchRule?.id, props.repository]);

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
      <CanApproveMergeRequestsUsersModal
        show={showAddUsers}
        onDismissModal={onHideAddUsers}
        repository={props.repository}
      />
      <CanApproveMergeRequestsRolesModal
        show={showAddRoles}
        onDismissModal={onHideAddRoles}
        repository={props.repository}
      />
      <MainContainer>
        <LeftContainer>
          <Checkbox
            isChecked={anyoneCanApproveMergeRequests}
            onChange={onChange}
          />
        </LeftContainer>
        <RightContainer>
          <TitleSpan>
            <Title>{"Anyone with Push Access Can Approve Merge Requests"}</Title>
            {updateAnyoneCanApproveMergeRequestsRequest.loading && (
              <div style={{ marginLeft: 12 }}>
                <DotsLoader color={loaderColor} size={"small"} />
              </div>
            )}
          </TitleSpan>
          <SubTitle>
            {
              "Allow all members with repository push access to approve merge requests against this branch."
            }
          </SubTitle>
          {!props?.repository?.protectedBranchRule?.anyoneCanApproveMergeRequests && (
            <BottomContainer>
              {props?.repository?.repoType == "org_repo" && (
                <div style={{ marginTop: 24 }}>
                  <EnabledRoleDisplay
                    repository={props.repository}
                    enabledRoles={
                      (props?.repository?.protectedBranchRule?.canApproveMergeRequestsRoles ??
                        []) as OrganizationRole[]
                    }
                    onClickShow={onShowAddRoles}
                    label="roles who can approve merge requests"
                  />
                </div>
              )}
              <div style={{ marginTop: 24 }}>
                <EnabledUserDisplay
                  repository={props.repository}
                  enabledUsers={
                    (props?.repository?.protectedBranchRule?.canApproveMergeRequestsUsers ?? []) as User[]
                  }
                  onClickShow={onShowAddUsers}
                  label="users who can approve merge requests"
                />
              </div>
            </BottomContainer>
          )}
        </RightContainer>
      </MainContainer>
    </Container>
  );
};

export default React.memo(CanApproveMergeRequestsSetting);
