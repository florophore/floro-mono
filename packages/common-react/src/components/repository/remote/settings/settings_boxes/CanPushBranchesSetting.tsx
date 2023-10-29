import React, {
  useMemo,
  useCallback,
  useState,
  useEffect,
  useRef,
} from "react";
import styled from "@emotion/styled";
import { useTheme } from "@emotion/react";
import {
  useUpdateAnyoneCanChangeSettingsMutation,
  RepoBranch,
  Repository,
  User,
  OrganizationRole,
  useUpdateAnyoneCanReadMutation,
  useUpdateAnyoneCanPushBranchesMutation,
  useUpdateAllowExternalUsersToPushMutation,
} from "@floro/graphql-schemas/src/generated/main-client-graphql";
import { Manifest } from "floro/dist/src/plugins";
import TimeAgo from "javascript-time-ago";
import { useSearchParams } from "react-router-dom";
import { Link } from "react-router-dom";

import en from "javascript-time-ago/locale/en";
import PaginationToggle from "@floro/storybook/stories/repo-components/PaginationToggle";
import { useNavigate } from "react-router";
import { ColorPalette } from "@floro/styles/ColorPalette";
import { Branch } from "floro/dist/src/repo";
import BranchSelector from "@floro/storybook/stories/repo-components/BranchSelector";
import Button from "@floro/storybook/stories/design-system/Button";
import { useRepoLinkBase } from "../../hooks/remote-hooks";
import Checkbox from "@floro/storybook/stories/design-system/Checkbox";
import DotsLoader from "@floro/storybook/stories/design-system/DotsLoader";
import EnabledUserDisplay from "../components/EnabledUserDisplay";
import AddSettingsUsersModal from "../setting_modals/AddSettingsUsersModal";
import EnabledRoleDisplay from "../components/EnabledRoleDisplay";
import AddSettingsRolesModal from "../setting_modals/AddSettingsRolesModal";
import AddReadAccessUsersModal from "../setting_modals/AddReadAccessUsersModal";
import AddReadAccessRolesModal from "../setting_modals/AddReadAccessRolesModal";
import AddPushBranchesAccessUsersModal from "../setting_modals/AddPushBranchesAccessUsersModal";
import AddPushBranchesAccessRolesModal from "../setting_modals/AddPushBranchesAccessRolesModal";

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

const CanPushBranchesSetting = (props: Props) => {
  const [anyoneCanPushBranches, setAnyoneCanPushBranches] = useState<boolean>(false);
  const [allowExternalUsersToPush, setAllowExternalUsersToPush] = useState<boolean>(false);

  const [showAddUsers, setShowAddUsers] = useState<boolean>(false);
  const [showAddRoles, setShowAddRoles] = useState<boolean>(false);
  const theme = useTheme();
  const loaderColor = useMemo((): keyof ColorPalette => {
    if (theme.name == "light") {
      return "mediumGray";
    }
    return "white";
  }, [theme.name]);

  const [updateAnyoneCanPushBranches, updateAnyoneCanPushBranchesRequest] =
    useUpdateAnyoneCanPushBranchesMutation();
  useEffect(() => {
    setAnyoneCanPushBranches(props.repository?.anyoneCanPushBranches ?? false);
  }, [props.repository?.anyoneCanRead]);

  useEffect(() => {
    setAllowExternalUsersToPush(props.repository?.allowExternalUsersToPush ?? false);
  }, [props.repository?.allowExternalUsersToPush]);

  const onChangeAnyoneCanPush = useCallback(() => {
    if (props.repository?.id) {
      setAnyoneCanPushBranches(!anyoneCanPushBranches);
      updateAnyoneCanPushBranches({
        variables: {
          repositoryId: props.repository?.id,
          anyoneCanPushBranches: !anyoneCanPushBranches,
        },
      });
    }
  }, [anyoneCanPushBranches, props.repository]);

  const [updateAllowExternalUsersToPushMutation, updateAllowExternalUsersToPushRequest] =
    useUpdateAllowExternalUsersToPushMutation();

  const onChangeAllowExternalUsersToPush = useCallback(() => {
    if (props.repository?.id) {
      setAllowExternalUsersToPush(!allowExternalUsersToPush);
      updateAllowExternalUsersToPushMutation({
        variables: {
          repositoryId: props.repository?.id,
          allowExternalUsersToPush: !allowExternalUsersToPush,
        },
      });
    }
  }, [allowExternalUsersToPush, props.repository]);

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

  const isUserRepo = useMemo(() => {
    return props.repository?.repoType == "user_repo";
  }, [props.repository?.repoType]);

  const isPrivateRepo = useMemo(() => {
    return props.repository?.isPrivate;
  }, [props.repository?.isPrivate]);

  const showUsersSelect = useMemo(() => {
    if (isUserRepo && props.repository.allowExternalUsersToPush) {
      return true;
    }
    if (!isUserRepo && !isPrivateRepo && (!props?.repository?.anyoneCanPushBranches || props?.repository?.allowExternalUsersToPush)) {
      return true;
    }
    if (!isUserRepo && isPrivateRepo && !props.repository?.anyoneCanPushBranches) {
      return true;
    }

  }, [isUserRepo, isPrivateRepo, props.repository.allowExternalUsersToPush, props?.repository?.anyoneCanPushBranches]);

  return (
    <Container>
      <AddPushBranchesAccessUsersModal
        show={showAddUsers}
        onDismissModal={onHideAddUsers}
        repository={props.repository}
      />
      <AddPushBranchesAccessRolesModal
        show={showAddRoles}
        onDismissModal={onHideAddRoles}
        repository={props.repository}
      />

      {!isUserRepo && (
        <MainContainer>
          <LeftContainer>
            <Checkbox
              disabled={!props?.repository?.repoPermissions?.canChangeSettings}
              isChecked={anyoneCanPushBranches}
              onChange={onChangeAnyoneCanPush}
            />
          </LeftContainer>
          <RightContainer>
            <TitleSpan>
              <Title>{"Anyone In Organization Can Push"}</Title>
              {updateAnyoneCanPushBranchesRequest.loading && (
                <div style={{ marginLeft: 12 }}>
                  <DotsLoader color={loaderColor} size={"small"} />
                </div>
              )}
            </TitleSpan>
            <SubTitle>
              {
                "Allow active member in your organization to push (write) to this repo and delete branches."
              }
            </SubTitle>
          </RightContainer>
        </MainContainer>
      )}
      <MainContainer
        style={{
          marginTop: isUserRepo || isPrivateRepo ? 0 : 24,
        }}
      >
        <LeftContainer>
          {!(isPrivateRepo && !isUserRepo) && (
            <Checkbox
              isChecked={allowExternalUsersToPush}
              onChange={onChangeAllowExternalUsersToPush}
            />
          )}
        </LeftContainer>
        <RightContainer>
          {!(isPrivateRepo && !isUserRepo) && (
            <>
              <TitleSpan>
                <Title>{"Allow External Members to Push"}</Title>
                {updateAllowExternalUsersToPushRequest.loading && (
                  <div style={{ marginLeft: 12 }}>
                    <DotsLoader color={loaderColor} size={"small"} />
                  </div>
                )}
              </TitleSpan>
              <SubTitle>
                {isUserRepo
                  ? "Allow other users to push (write) to the repository. You will have to manually select members."
                  : "Allow members external to organization to push (write) to the repository. You will have to manually select members."}
              </SubTitle>
            </>
          )}

          <BottomContainer>
            {!isUserRepo && !props.repository?.anyoneCanPushBranches && (
              <div style={{ marginTop: 24 }}>
                <EnabledRoleDisplay
                  repository={props.repository}
                  enabledRoles={
                    (props?.repository?.canPushBranchesRoles ??
                      []) as OrganizationRole[]
                  }
                  onClickShow={onShowAddRoles}
                  label="roles who can push to repo"
                />
              </div>
            )}
            {showUsersSelect && (
              <div style={{ marginTop: 24 }}>
                <EnabledUserDisplay
                  repository={props.repository}
                  enabledUsers={
                    (props?.repository?.canPushBranchesUsers ?? []) as User[]
                  }
                  onClickShow={onShowAddUsers}
                  label="users who can push to repo"
                />
              </div>
            )}
          </BottomContainer>
        </RightContainer>
      </MainContainer>
    </Container>
  );
};

export default React.memo(CanPushBranchesSetting);
