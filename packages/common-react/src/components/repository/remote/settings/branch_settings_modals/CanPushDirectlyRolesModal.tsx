import React, { useMemo, useState, useCallback, useEffect } from "react";

import styled from "@emotion/styled";
import { useTheme } from "@emotion/react";
// eslint-disable-next-line import/no-named-as-default
import ColorPalette from "@floro/styles/ColorPalette";
import Button from "@floro/storybook/stories/design-system/Button";
import { Repository } from "@floro/graphql-schemas/src/generated/main-client-graphql";
import {
  useUpdateAnyoneCanAutofixRolesMutation, useUpdateCanPushDirectlyRolesMutation,
} from "@floro/graphql-schemas/src/generated/main-client-graphql";
import RootLongModal from "../../../../RootLongModal";
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

const ButtonRow = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
  width: 100%;
`;

const HeaderContainer = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: center;
  align-items: center;
  height: 100%;
`;

const HeaderTitle = styled.div`
  font-size: 1.7rem;
  font-family: "MavenPro";
  font-weight: 600;
  text-align: center;
  color: ${ColorPalette.white};
`;

const ContentContainer = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  height: 100%;
  width: 100%;
  padding: 24px;
`;

const TopContentContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: flex-start;
`;

const RoleRow = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: flex-start
  padding-top: 8px;
  padding-bottom: 8px;
  margin-top: 2px;
`;

const RoleText = styled.div`
  margin-left: 8px;
  font-family: "MavenPro";
  font-weight: 500;
  font-size: 1.3rem;
  color: ${(props) => props.theme.colors.contrastText};
`;

const LabelText = styled.span`
  font-family: "MavenPro";
  font-weight: 600;
  font-size: 1.4rem;
  transition: 500ms color;
  user-select: none;
  color: ${(props) => props.theme.colors.titleText};
`;

const UserInfo = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;
`;

const UserNameContainers = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: center;
  margin-left: 16px;
`;

const UserTitle = styled.h4`
  margin: 0;
  padding: 0;
  font-family: "MavenPro";
  color: ${(props) => props?.theme.colors.titleText};
  font-weight: 600;
  font-size: 1.7rem;
`;

const HandleSubTitle = styled.p`
  margin: 0;
  padding: 0;
  font-family: "MavenPro";
  color: ${(props) => props?.theme.colors.contrastText};
  font-weight: 500;
  font-size: 1.2rem;
`;

const BottomContentContainer = styled.div`
  display: flex;
  height: 100%;
  flex-direction: column;
  align-items: center;
  justify-content: flex-end;
  padding-bottom: 16px;
`;

export interface Props {
  onDismissModal: () => void;
  show?: boolean;
  repository: Repository;
}

const CanPushDirectlyRolesModal = (props: Props) => {
  const [assignedRoles, setAssignedRoles] = useState<Set<string>>(new Set([]));

  useEffect(() => {
    if (props.show) {
      setAssignedRoles(
        new Set(props?.repository?.protectedBranchRule?.canPushDirectlyRoles?.map((v) => v?.id as string) ?? [])
      );
    }
  }, [props?.repository?.protectedBranchRule?.canPushDirectlyRoles, props.show]);
  const [updateRoles, updateRolesResult] =
    useUpdateCanPushDirectlyRolesMutation();
  const onUpdate = useCallback(() => {
    if (!props?.repository?.id || !props?.repository?.protectedBranchRule?.id) {
      return;
    }
    updateRoles({
      variables: {
        repositoryId: props.repository.id,
        protectedBranchRuleId: props?.repository?.protectedBranchRule?.id,
        roleIds: Array.from(assignedRoles)
      }
    });
  }, [
    props?.repository?.id,
    props?.repository?.protectedBranchRule?.id,
    assignedRoles
  ]);

  useEffect(() => {
    if (
      updateRolesResult?.data?.updateCanPushDirectlyRoles?.__typename ==
      "ProtectedBranchSettingChangeSuccess"
    ) {
      props.onDismissModal();
    }
  }, [
    updateRolesResult?.data?.updateCanPushDirectlyRoles?.__typename,
    props.onDismissModal,
  ]);

  return (
    <RootLongModal
      headerSize="small"
      show={props.show}
      onDismiss={props.onDismissModal}
      headerChildren={
        <HeaderWrapper>
          <FloroHeaderTitle>{"can push directly roles"}</FloroHeaderTitle>
        </HeaderWrapper>
      }
    >
      <ContentContainer>
        <TopContentContainer>
          <div
            style={{
              display: "flex",
              alignItems: "flex-start",
              width: 468,
              flexDirection: "column",
            }}
          >
            <LabelText>{"Assign Roles"}</LabelText>
            <div style={{ marginTop: 20 }}>
              {props?.repository.organization?.roles?.map((role, index) => {
                return (
                  <RoleRow key={index}>
                    <Checkbox
                      isChecked={assignedRoles.has(role?.id as string)}
                      onChange={() => {
                        if (assignedRoles.has(role?.id as string)) {
                          assignedRoles.delete(role?.id as string);
                          setAssignedRoles(new Set(Array.from(assignedRoles)));
                        } else {
                          assignedRoles.add(role?.id as string);
                          setAssignedRoles(new Set(Array.from(assignedRoles)));
                        }
                      }}
                    />
                    <RoleText>{role?.name}</RoleText>
                  </RoleRow>
                );
              })}
            </div>
          </div>
        </TopContentContainer>
        <BottomContentContainer>
          <div style={{ height: 40, marginBottom: 24, display: 'flex', flexDirection: 'row', justifyContent: 'flex-start', alignItems: 'center' }}>
          </div>
          <ButtonRow>
          <Button
            onClick={props.onDismissModal}
            label={"cancel"}
            bg={"gray"}
            size={"medium"}
          />
          <Button
            onClick={onUpdate}
            label={"update roles"}
            bg={"orange"}
            size={"medium"}
            isLoading={updateRolesResult.loading}
          />

          </ButtonRow>
        </BottomContentContainer>
      </ContentContainer>
    </RootLongModal>
  );
};

export default React.memo(CanPushDirectlyRolesModal);
