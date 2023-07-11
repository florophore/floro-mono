import React, { useCallback, useState, useEffect, useMemo } from "react";
import styled from "@emotion/styled";
import MembersController from "@floro/storybook/stories/common-components/MembersController";
import { useTheme } from "@emotion/react";
import { useSearchParams } from "react-router-dom";
import { Organization, OrganizationInvitation } from "@floro/graphql-schemas/src/generated/main-client-graphql";
import SearchInput from "@floro/storybook/stories/design-system/SearchInput";
import InviteModal from "./invitations/InviteModal";
import InvitationRow from "./invitations/InvitationRow";
import ConfirmCancelInvitation from "./invitations/ConfirmCancelInvitation";
import PaginationToggle from "@floro/storybook/stories/repo-components/PaginationToggle";
import EditInvitationRolesModal from "./invitations/EditInvitationRolesModal";

const Container = styled.div`
  flex: 1;
  width: 100%;
  padding: 24px 24px 80px 24px;
`;

const Title = styled.h1`
  font-family: "MavenPro";
  font-weight: 700;
  font-size: 2rem;
  color: ${(props) => props.theme.colors.pluginDisplayTitle};
`;

const NoInvitesContainer = styled.div`
  margin-top: 48px;
`;

const NoInvitesText = styled.h1`
  font-family: "MavenPro";
  font-weight: 500;
  font-size: 2rem;
  color: ${(props) => props.theme.colors.contrastTextLight};
`;

interface Props {
  organization?: Organization;
}
const InvitationsHome = (props: Props) => {
  const theme = useTheme();
  const [showInviteModal, setShowInviteModal] = useState(false);
  const onShowInviteModal = useCallback(() => {
    setShowInviteModal(true);
  }, []);
  const onHideInviteModal = useCallback(() => {
    setShowInviteModal(false);
  }, []);
  const [searchParams, setSearchParams] = useSearchParams();
  const id = searchParams.get("id") ?? null;
  const search = searchParams.get("query") ?? "";
  const setSearch = useCallback((query: string) => {
    setSearchParams({
      query,
    });
  }, []);
  const [inviteToCancel, setInviteToCancel] = useState<OrganizationInvitation|null>(null);
  const [showCancel, setShowCancel] = useState(false);

  const onShowCancel = useCallback((invite: OrganizationInvitation) => {
    setInviteToCancel(invite);
    setShowCancel(true);
  }, []);
  const onHideCancel = useCallback(() => {
    setInviteToCancel(null);
    setShowCancel(false);
  }, []);

  const [inviteToEdit, setInviteToEdit] = useState<OrganizationInvitation|null>(null);
  const [showEdit, setShowEdit] = useState(false);
  const onShowEdit = useCallback((invite: OrganizationInvitation) => {
    setInviteToEdit(invite);
    setShowEdit(true);
  }, []);
  const onHideEdit = useCallback(() => {
    setInviteToEdit(null);
    setShowEdit(false);
  }, []);

  const showPaginator = useMemo(() => {
    if (props?.organization?.invitationsResult?.nextId || props?.organization?.invitationsResult?.lastId) {
      return true;
    }
    return false;
  }, [props?.organization?.invitationsResult?.lastId, props?.organization?.invitationsResult?.nextId]);

  const onNext = useCallback(() => {
    if (!props?.organization?.invitationsResult?.nextId) {
      return;
    }
    setSearchParams({
      id: props?.organization?.invitationsResult?.nextId
    });
  }, [props?.organization?.invitationsResult?.nextId]);

  const onLast = useCallback(() => {
    if (!props?.organization?.invitationsResult?.lastId) {
      return;
    }
    setSearchParams({
      id: props?.organization?.invitationsResult?.lastId
    });

  }, [props?.organization?.invitationsResult?.lastId]);

  return (
    <>
      <InviteModal
        show={showInviteModal}
        onDismissModal={onHideInviteModal}
        organization={props.organization as Organization}
        currentInvitationId={id}
        currentInvitationQuery={search}
      />
      {props.organization && (
        <ConfirmCancelInvitation
          show={showCancel}
          onDismiss={onHideCancel}
          invitation={inviteToCancel}
          organization={props.organization}
          currentInvitationId={id}
          currentInvitationQuery={search}
        />
      )}
      {props.organization && (
        <EditInvitationRolesModal
          show={showEdit}
          onDismiss={onHideEdit}
          invitation={inviteToEdit}
          organization={props.organization}
          currentInvitationId={id}
          currentInvitationQuery={search}
        />
      )}
      <MembersController
        onPressAddNewInvite={onShowInviteModal}
        page={"invitations"}
        organization={props.organization}
      >
        <Container>
          <Title>{"Invitations"}</Title>
          <div style={{ marginTop: 24, marginBottom: 24 }}>
            <SearchInput
              showClear
              borderColor={theme.name == "light" ? "gray" : "white"}
              value={search}
              placeholder={"search invitations"}
              onTextChanged={setSearch}
            />
          </div>
          {props?.organization?.invitationsResult?.invitations?.map(
            (invitation, index) => {
              return (
                <InvitationRow
                  key={index}
                  invitation={invitation as OrganizationInvitation}
                  organization={props.organization as Organization}
                  onCancel={onShowCancel}
                  onEdit={onShowEdit}
                />
              );
            }
          )}
          {(props?.organization?.invitationsResult?.invitations?.length ?? 0) == 0 && (
            <NoInvitesContainer>
              <NoInvitesText>{'No sent invitations to display'}</NoInvitesText>
            </NoInvitesContainer>
          )}

          {showPaginator && (
            <div
              style={{
                marginTop: 24,
                marginBottom: 48,
                maxWidth: 720,
                width: '100%',
                display: "flex",
                justifyContent: "center",
              }}
            >
              <PaginationToggle
                onNewer={onLast}
                onOlder={onNext}
                newerDisabled={!props?.organization?.invitationsResult?.lastId}
                olderDisabled={!props?.organization?.invitationsResult?.nextId}
                newerText="Last"
                olderText="Next"
              />
            </div>
          )}
        </Container>
      </MembersController>
    </>
  );
};

export default React.memo(InvitationsHome);
