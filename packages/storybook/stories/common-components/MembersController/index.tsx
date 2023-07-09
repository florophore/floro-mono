import React, { useMemo } from "react";
import SideNavWrapper from "../navs/SideNavWrapper";
import {
  Organization,
} from "@floro/graphql-schemas/build/generated/main-graphql";
import styled from "@emotion/styled";
import Button from "../../design-system/Button";
import { useTheme } from "@emotion/react";
import { Link } from "react-router-dom";

const NoPluginsTextContainer = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100%;
  width: 100%;
  flex: 1;
  flex-grow: 1;
`;
const NoPluginsText = styled.h2`
  font-size: 1.7rem;
  font-family: "MavenPro";
  font-weight: 600;
  text-align: center;
  color: ${(props) => props.theme.colors.pageBannerInfo};
  max-width: 650px;
  padding-bottom: 72px;
`;

const RelativeWrapper = styled.div`
  height: 100%;
  position: relative;
  flex: 1;
  background: ${(props) => props.theme.background};
`;

const GradientOverlay = styled.div`
  position: absolute;
  bottom: 80px;
  width: 100%;
  height: 80px;
  background: ${(props) =>
    `linear-gradient(${props.theme.gradients.backgroundNoOpacity}, ${props.theme.gradients.backgroundFullOpacity});`}
  pointer-events: none;
`;

const Container = styled.div`
  flex: 1;
  height: 100%;
  width: 100%;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
`;

const TopWrapper = styled.div`
  flex: 1;
  background: ${(props) => props.theme.background};
  max-height: calc(100% - 80px);
  overflow: scroll;
  padding-bottom: 80px;
  padding-top: 12px;
`;

const BottomWrapper = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  padding-top: 16px;
  padding-bottom: 16px;
  height: 80px;
  box-sizing: border-box;
  background: ${(props) => props.theme.background};
`;

const RowContainer = styled.div`
  height: 64px;
  width: 100%;
  display: flex;
  flex-direction: row;
  align-items: center;
  padding: 16px;
  box-sizing: border-box;
  cursor: pointer;
  background: ${(props) => props.theme.background};
`;

const RowIcon = styled.img`
  height: 42px;
  width: 42px;
  display: inline-block;
`;

const DisplayName = styled.h6`
  display: inline-block;
  margin-left: 8px;
  font-size: 1.4rem;
  font-family: "MavenPro";
  font-weight: 600;
  text-overflow: ellipsis;
  white-space: nowrap;
  overflow-x: hidden;
  width: 100%;
`;

export interface Props {
  organization?: Organization;
  onPressAddNewInvite?: () => void;
  onPressAddNewRole?: () => void;
  page: "members" | "invitations" | "roles";
  children: React.ReactElement;
}

const MembersController = (props: Props) => {
  const theme = useTheme();

  const memberCount = useMemo(
    () => props?.organization?.membersActiveCount ?? 0,
    [props?.organization?.membersActiveCount]
  );
  const invitedCount = useMemo(
    () => props?.organization?.invitationsSentCount ?? 0,
    [props?.organization?.invitationsSentCount]
  );

  return (
    <SideNavWrapper
      nav={
        <RelativeWrapper>
          <Container>
            <TopWrapper>
              <RowContainer>
                <Link to={`/org/@/${props?.organization?.handle}/members`}>
                  <DisplayName
                    style={{
                      color:
                        props.page == "members"
                          ? theme.colors.selectedPluginRow
                          : theme.colors.unselectedPluginRow,
                    }}
                  >{`Members (${memberCount})`}</DisplayName>
                </Link>
              </RowContainer>
              <RowContainer>
                <Link to={`/org/@/${props?.organization?.handle}/invitations`}>
                  <DisplayName
                    style={{
                      color:
                        props.page == "invitations"
                          ? theme.colors.selectedPluginRow
                          : theme.colors.unselectedPluginRow,
                    }}
                  >{`Invitations (${invitedCount})`}</DisplayName>
                </Link>
              </RowContainer>
              {(props.organization?.membership?.permissions?.canModifyOrganizationRoles) && (
                <RowContainer>
                  <Link to={`/org/@/${props?.organization?.handle}/roles`}>
                    <DisplayName
                      style={{
                        color:
                          props.page == "roles"
                            ? theme.colors.selectedPluginRow
                            : theme.colors.unselectedPluginRow,
                      }}
                    >{`Roles (${props?.organization?.roles?.length ?? 0})`}</DisplayName>
                  </Link>
                </RowContainer>
              )}
            </TopWrapper>
            <BottomWrapper>
              {(props.page == "members" || props.page == "invitations") && props.organization?.membership?.permissions?.canInviteMembers && (
                <Button
                  onClick={props.onPressAddNewInvite}
                  label={"invite new member"}
                  bg={"teal"}
                  size={"medium"}
                  textSize={"small"}
                />
              )}
              {props.page == "roles" && props.organization?.membership?.permissions?.canModifyOrganizationRoles && (
                <Button
                  onClick={props.onPressAddNewRole}
                  label={"add new role"}
                  bg={"purple"}
                  size={"medium"}
                  textSize={"small"}
                />
              )}
            </BottomWrapper>
          </Container>
          <GradientOverlay />
        </RelativeWrapper>
      }
    >
      {props.children}
    </SideNavWrapper>
  );
};

export default React.memo(MembersController);
