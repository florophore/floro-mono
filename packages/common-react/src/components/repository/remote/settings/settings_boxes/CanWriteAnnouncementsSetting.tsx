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
  Repository,
  User,
  OrganizationRole,
  useUpdateAnyoneCanReadMutation,
  useUpdateAnyoneCanWriteAnnouncementsMutation,
} from "@floro/graphql-schemas/src/generated/main-client-graphql";
import { ColorPalette } from "@floro/styles/ColorPalette";
import Checkbox from "@floro/storybook/stories/design-system/Checkbox";
import DotsLoader from "@floro/storybook/stories/design-system/DotsLoader";
import EnabledUserDisplay from "../components/EnabledUserDisplay";
import EnabledRoleDisplay from "../components/EnabledRoleDisplay";
import AddReadAccessUsersModal from "../setting_modals/AddReadAccessUsersModal";
import AddReadAccessRolesModal from "../setting_modals/AddReadAccessRolesModal";
import AddWriteAnnouncementsAccessUsersModal from "../setting_modals/AddWriteAnnouncementsAccessUsersModal";
import AddWriteAnnouncementsAccessRolesModal from "../setting_modals/AddWriteAnnouncementsAccessRolesModal";

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

const CanWriteAnnouncementsSetting = (props: Props) => {
  const [anyoneCanWriteAnnouncements, setAnyoneCanWriteAnnouncements] =
    useState<boolean>(false);

  const [showAddUsers, setShowAddUsers] = useState<boolean>(false);
  const [showAddRoles, setShowAddRoles] = useState<boolean>(false);
  const theme = useTheme();
  const [updateAnyoneCanRead, updateAnyoneCanReadRequest] = useUpdateAnyoneCanWriteAnnouncementsMutation();
  const loaderColor = useMemo((): keyof ColorPalette => {
    if (theme.name == "light") {
      return "mediumGray";
    }
    return "white";
  }, [theme.name]);

  useEffect(() => {
    setAnyoneCanWriteAnnouncements(
      props.repository?.anyoneCanWriteAnnouncements ?? false
    );
  }, [props.repository?.anyoneCanWriteAnnouncements]);

  const onChange = useCallback(() => {
    if (props.repository?.id) {
      setAnyoneCanWriteAnnouncements(!anyoneCanWriteAnnouncements);
      updateAnyoneCanRead({
        variables: {
          repositoryId: props.repository?.id,
          anyoneCanWriteAnnouncements: !anyoneCanWriteAnnouncements,
        },
      });
    }
  }, [anyoneCanWriteAnnouncements, props.repository]);

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

      <AddWriteAnnouncementsAccessUsersModal
        show={showAddUsers}
        onDismissModal={onHideAddUsers}
        repository={props.repository}
      />
      <AddWriteAnnouncementsAccessRolesModal
        show={showAddRoles}
        onDismissModal={onHideAddRoles}
        repository={props.repository}
      />
      <MainContainer>
        <LeftContainer>
          <Checkbox
            disabled={!props?.repository?.repoPermissions?.canChangeSettings}
            isChecked={anyoneCanWriteAnnouncements}
            onChange={onChange}
          />
        </LeftContainer>
        <RightContainer>
          <TitleSpan>
            <Title>{"Anyone In Organization Can Publish Announcements"}</Title>
            {updateAnyoneCanReadRequest.loading && (
              <div style={{ marginLeft: 12 }}>
                <DotsLoader color={loaderColor} size={"small"} />
              </div>
            )}
          </TitleSpan>
          <SubTitle>
            {
              "Allow allow active member in your organization to write announcements for this repository."
            }
          </SubTitle>
          {!props?.repository?.anyoneCanWriteAnnouncements && (
            <BottomContainer>
              <div style={{ marginTop: 24 }}>
                <EnabledRoleDisplay
                  repository={props.repository}
                  enabledRoles={
                    (props?.repository?.canWriteAnnouncementsRoles ??
                      []) as OrganizationRole[]
                  }
                  onClickShow={onShowAddRoles}
                  label="roles who can write announcements"
                />
              </div>
              <div style={{ marginTop: 24 }}>
                <EnabledUserDisplay
                  repository={props.repository}
                  enabledUsers={
                    (props?.repository?.canWriteAnnouncementsUsers ?? []) as User[]
                  }
                  onClickShow={onShowAddUsers}
                  label="users who can write announcements"
                />
              </div>
            </BottomContainer>
          )}
        </RightContainer>
      </MainContainer>
    </Container>
  );
};

export default React.memo(CanWriteAnnouncementsSetting);
