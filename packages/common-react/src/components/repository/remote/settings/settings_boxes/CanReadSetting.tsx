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
} from "@floro/graphql-schemas/src/generated/main-client-graphql";
import { ColorPalette } from "@floro/styles/ColorPalette";
import Checkbox from "@floro/storybook/stories/design-system/Checkbox";
import DotsLoader from "@floro/storybook/stories/design-system/DotsLoader";
import EnabledUserDisplay from "../components/EnabledUserDisplay";
import EnabledRoleDisplay from "../components/EnabledRoleDisplay";
import AddReadAccessUsersModal from "../setting_modals/AddReadAccessUsersModal";
import AddReadAccessRolesModal from "../setting_modals/AddReadAccessRolesModal";

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

const CanReadSetting = (props: Props) => {
  const [anyoneCanRead, setAnyoneCanRead] =
    useState<boolean>(false);

  const [showAddUsers, setShowAddUsers] = useState<boolean>(false);
  const [showAddRoles, setShowAddRoles] = useState<boolean>(false);
  const theme = useTheme();
  const [updateAnyoneCanRead, updateAnyoneCanReadRequest] = useUpdateAnyoneCanReadMutation();
  const loaderColor = useMemo((): keyof ColorPalette => {
    if (theme.name == "light") {
      return "mediumGray";
    }
    return "white";
  }, [theme.name]);

  useEffect(() => {
    setAnyoneCanRead(
      props.repository?.anyoneCanRead ?? false
    );
  }, [props.repository?.anyoneCanRead]);

  const onChange = useCallback(() => {
    if (props.repository?.id) {
      setAnyoneCanRead(!anyoneCanRead);
      updateAnyoneCanRead({
        variables: {
          repositoryId: props.repository?.id,
          anyoneCanRead: !anyoneCanRead,
        },
      });
    }
  }, [anyoneCanRead, props.repository]);

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

      <AddReadAccessUsersModal
        show={showAddUsers}
        onDismissModal={onHideAddUsers}
        repository={props.repository}
      />
      <AddReadAccessRolesModal
        show={showAddRoles}
        onDismissModal={onHideAddRoles}
        repository={props.repository}
      />
      <MainContainer>
        <LeftContainer>
          <Checkbox
            disabled={!props?.repository?.canTurnOffAnyoneCanRead}
            isChecked={anyoneCanRead}
            onChange={onChange}
          />
        </LeftContainer>
        <RightContainer>
          <TitleSpan>
            <Title>{"Anyone In Organization Can Read"}</Title>
            {updateAnyoneCanReadRequest.loading && (
              <div style={{ marginLeft: 12 }}>
                <DotsLoader color={loaderColor} size={"small"} />
              </div>
            )}
          </TitleSpan>
          <SubTitle>
            {
              "Allow allow active member in your organization to read and clone this repository."
            }
          </SubTitle>
          {!props?.repository?.anyoneCanRead && (
            <BottomContainer>
              <div style={{ marginTop: 24 }}>
                <EnabledRoleDisplay
                  repository={props.repository}
                  enabledRoles={
                    (props?.repository?.canReadRoles ??
                      []) as OrganizationRole[]
                  }
                  onClickShow={onShowAddRoles}
                  label="roles who can read repo"
                />
              </div>
              <div style={{ marginTop: 24 }}>
                <EnabledUserDisplay
                  repository={props.repository}
                  enabledUsers={
                    (props?.repository?.canReadUsers ?? []) as User[]
                  }
                  onClickShow={onShowAddUsers}
                  label="users who can read repo"
                />
              </div>
            </BottomContainer>
          )}
        </RightContainer>
      </MainContainer>
    </Container>
  );
};

export default React.memo(CanReadSetting);
