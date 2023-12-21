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
  useUpdateDisableDirectPushingMutation,
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
import CanPushDirectlyUsersModal from "../branch_settings_modals/CanPushDirectlyUsersModal";
import CanPushDirectlyRolesModal from "../branch_settings_modals/CanPushDirectlyRolesModal";

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

const DisableDirectPushingSetting = (props: Props) => {
  const [disableDirectPushing, setDisableDirectPusing] =
    useState<boolean>(false);
  const theme = useTheme();
  const [
    disableDirectPushingMutation,
    updateDisableDirectRequest,
  ] = useUpdateDisableDirectPushingMutation();

  const [showAddUsers, setShowAddUsers] = useState<boolean>(false);
  const [showAddRoles, setShowAddRoles] = useState<boolean>(false);
  const loaderColor = useMemo((): keyof ColorPalette => {
    if (theme.name == "light") {
      return "mediumGray";
    }
    return "white";
  }, [theme.name]);

  useEffect(() => {
    setDisableDirectPusing(
      props.repository?.protectedBranchRule?.disableDirectPushing ?? false
    );
  }, [props.repository?.protectedBranchRule?.disableDirectPushing]);

  const onChange = useCallback(() => {
    if (props.repository?.id && props?.repository?.protectedBranchRule?.id) {
      setDisableDirectPusing(!disableDirectPushing);
      disableDirectPushingMutation({
        variables: {
          repositoryId: props.repository?.id,
          protectedBranchRuleId: props?.repository?.protectedBranchRule?.id,
          disableDirectPushing: !disableDirectPushing,
        },
      });
    }
  }, [disableDirectPushing, props.repository]);

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

  const isUserPrivateRepo = useMemo(() => {
    if (props?.repository?.repoType == "user_repo") {
        return props?.repository?.isPrivate;
    }
    return false;
  }, [props?.repository])

  return (
    <Container>
      <CanPushDirectlyUsersModal
        show={showAddUsers}
        onDismissModal={onHideAddUsers}
        repository={props.repository}
      />
      <CanPushDirectlyRolesModal
        show={showAddRoles}
        onDismissModal={onHideAddRoles}
        repository={props.repository}
      />
      <MainContainer>
        <LeftContainer>
          <Checkbox isChecked={disableDirectPushing} onChange={onChange} />
        </LeftContainer>
        <RightContainer>
          <TitleSpan>
            <Title>{"Disable Direct Pushing"}</Title>
            {updateDisableDirectRequest.loading && (
              <div style={{ marginLeft: 12 }}>
                <DotsLoader color={loaderColor} size={"small"} />
              </div>
            )}
          </TitleSpan>
          <SubTitle>
            {props?.repository?.repoType == "user_repo"
              ? isUserPrivateRepo
                ? "Disable pushing local changes to this branch."
                : "Disable pushing local changes to this branch. Except for the users specified below."
              : "Do not allow members to push local changes to this branch directly. Except for the following roles and users."}
          </SubTitle>
          {!isUserPrivateRepo &&
            props?.repository?.protectedBranchRule?.disableDirectPushing && (
              <>
                {}
                <BottomContainer>
                  {props?.repository?.repoType == "org_repo" && (
                    <div style={{ marginTop: 24 }}>
                      <EnabledRoleDisplay
                        repository={props.repository}
                        enabledRoles={
                          (props?.repository?.protectedBranchRule
                            ?.canPushDirectlyRoles ?? []) as OrganizationRole[]
                        }
                        onClickShow={onShowAddRoles}
                        label="roles who can push directly"
                      />
                    </div>
                  )}
                  {!isUserPrivateRepo && (
                    <div style={{ marginTop: 24 }}>
                      <EnabledUserDisplay
                        repository={props.repository}
                        enabledUsers={
                          (props?.repository?.protectedBranchRule
                            ?.canPushDirectlyUsers ?? []) as User[]
                        }
                        onClickShow={onShowAddUsers}
                        label="users who can push directly"
                      />
                    </div>
                  )}
                </BottomContainer>
              </>
            )}
        </RightContainer>
      </MainContainer>
    </Container>
  );
};

export default React.memo(DisableDirectPushingSetting);