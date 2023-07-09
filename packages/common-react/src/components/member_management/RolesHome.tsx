import React, { useCallback, useState, useEffect, useMemo } from "react";
import styled from "@emotion/styled";
import MembersController from "@floro/storybook/stories/common-components/MembersController";
import { useTheme } from "@emotion/react";
import {
  Organization,
  OrganizationRole,
} from "@floro/graphql-schemas/src/generated/main-client-graphql";
import Input from "@floro/storybook/stories/design-system/Input";
import SearchInput from "@floro/storybook/stories/design-system/SearchInput";
import { userPath } from "floro/dist/src/filestructure";
import RoleDisplay from "./roles/RoleDisplay";
import EditRoleModal from "./roles/EditRoleModal";
import CreateRoleModal from "./roles/CreateRoleModal";

const Container = styled.div`
  flex: 1;
  height: 100%;
  width: 100%;
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
  padding: 24px 24px 0px 24px;
`;

const Title = styled.h1`
  font-family: "MavenPro";
  font-weight: 700;
  font-size: 2rem;
  color: ${(props) => props.theme.colors.pluginDisplayTitle};
`;

const MainContainer = styled.div`
  max-width: 870px;
  width: 100%;
  padding-top: 48px;
  padding-bottom: 24px;
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  flex-wrap: wrap;
  align-items: flex-start;
`;
interface Props {
  organization?: Organization;
}
const RolesHome = (props: Props) => {
  const theme = useTheme();
  const [search, setSearch] = useState("");
  const [showEdit, setShowEdit] = useState(false);
  const [showCreate, setShowCreate] = useState(false);
  const [edittingRole, setEdittingRole] =
    useState<OrganizationRole | null>(null);

  const onEditRole = useCallback((role: OrganizationRole) => {
    setEdittingRole(role);
    setShowEdit(true);
  }, []);

  const onHideEdit = useCallback(() => {
    setShowEdit(false);
  }, []);

  const onShowCreate = useCallback(() => {
    setShowCreate(true);
  }, []);

  const onHideCreate = useCallback(() => {
    setShowCreate(false);
  }, []);

  const roles = useMemo(() => {
    if (search.trim() == "") {
      return props.organization?.roles ?? [];
    }
    const query = search?.trim().toLowerCase();
    return props.organization?.roles?.filter((r) => {
      const nameLowerCase = r?.name?.toLowerCase() ?? "";
      return nameLowerCase.indexOf(query) != -1;
    });
  }, [props.organization?.roles, search]);
  return (
    <>
      <EditRoleModal
        organization={props.organization as Organization}
        role={edittingRole}
        show={showEdit}
        onDismissModal={onHideEdit}
      />
      <CreateRoleModal
        organization={props.organization as Organization}
        show={showCreate}
        onDismissModal={onHideCreate}
      />
      <MembersController
        page={"roles"}
        organization={props.organization}
        onPressAddNewRole={onShowCreate}
      >
        <Container>
          <Title>{"Roles"}</Title>
          <div style={{ marginTop: 24 }}>
            <SearchInput
              showClear
              borderColor={theme.name == "light" ? "gray" : "white"}
              value={search}
              placeholder={"search roles"}
              onTextChanged={setSearch}
            />
          </div>
          <MainContainer>
            {props.organization && (
              <>
                {roles?.map((role, index) => {
                  return (
                    <RoleDisplay
                      onEditRole={onEditRole}
                      key={index}
                      role={role as OrganizationRole}
                      organization={props.organization as Organization}
                    />
                  );
                })}
              </>
            )}
          </MainContainer>
        </Container>
      </MembersController>
    </>
  );
};

export default React.memo(RolesHome);
