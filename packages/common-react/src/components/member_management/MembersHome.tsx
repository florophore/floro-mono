import React, { useCallback, useState, useEffect, useMemo } from "react";
import styled from "@emotion/styled";
import MembersController from "@floro/storybook/stories/common-components/MembersController";
import { useSearchParams } from "react-router-dom";
import { useTheme } from "@emotion/react";
import { Organization, OrganizationMember } from "@floro/graphql-schemas/src/generated/main-client-graphql";
import SearchInput from "@floro/storybook/stories/design-system/SearchInput";
import InviteModal from "./invitations/InviteModal";
import PaginationToggle from "@floro/storybook/stories/repo-components/PaginationToggle";
import MemberRow from "./members/MemberRow";
import ConfirmDeactivateMembershipModal from "./members/ConfirmDeactivateMembershipModal";
import ConfirmReactivateMembershipModal from "./members/ConfirmReactivateMembershipModal";
import Checkbox from "@floro/storybook/stories/design-system/Checkbox";
import EditMemberRolesModal from "./members/EditMemberRolesModal";

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

const FilterText = styled.h1`
  font-family: "MavenPro";
  font-weight: 500;
  font-size: 1.4rem;
  color: ${(props) => props.theme.colors.contrastText};
  margin-left: 12px;
`;

interface Props {
  organization?: Organization;
}
const MembersHome = (props: Props) => {
  const theme = useTheme();
  const [showInviteModal, setShowInviteModal] = useState(false);
  const onShowInviteModal = useCallback(() => {
    setShowInviteModal(true);
  }, []);
  const onHideInviteModal = useCallback(() => {
    setShowInviteModal(false);
  }, []);
  const [searchParams, setSearchParams] = useSearchParams();
  const id = searchParams.get("id") ?? "";
  const search = searchParams.get("query") ?? "";
  const filterDeactivatedRaw = searchParams.get("filter_deactivated") ?? "";
  const filterDeactived = useMemo(() => {
    return filterDeactivatedRaw?.toLowerCase() == "true";
  }, [filterDeactivatedRaw]);
  const onFilterDeactivated = useCallback((filter: boolean) => {
    const params: {[key: string]: string} = search != "" ? {
      query: search
    } : {id};
    if (filter) {
      setSearchParams({ ...params, filter_deactivated: "true" });
    } else {
      setSearchParams({...params});
    }
  }, [id, search]);

  const onToggleFilter = useCallback(() => {
    onFilterDeactivated(!filterDeactived);
  }, [onFilterDeactivated, filterDeactived]);

  const setSearch = useCallback((query: string) => {
    if (filterDeactived) {
      setSearchParams({
        query,
        filter_deactivated: "true"
      });
      return;
    }
    setSearchParams({
      query,
    });
  }, [filterDeactived]);

  const [memberToDeactivate, setMemberToDeactivate] = useState<OrganizationMember|null>(null);
  const [showDeactivate, setShowDeactivate] = useState(false);

  const onShowDeactivate = useCallback((member: OrganizationMember) => {
    setMemberToDeactivate(member);
    setShowDeactivate(true);
  }, []);

  const onHideDeactivate = useCallback(() => {
    setMemberToDeactivate(null);
    setShowDeactivate(false);
  }, []);

  const [memberToReactivate, setMemberToReactivate] = useState<OrganizationMember|null>(null);
  const [showReactivate, setShowReactivate] = useState(false);

  const onShowReactivate = useCallback((member: OrganizationMember) => {
    setMemberToReactivate(member);
    setShowReactivate(true);
  }, []);

  const onHideReactivate = useCallback(() => {
    setMemberToReactivate(null);
    setShowReactivate(false);
  }, []);

  const [memberToEdit, setMemberToEdit] = useState<OrganizationMember|null>(null);
  const [showEdit, setShowEdit] = useState(false);
  const onShowEdit = useCallback((member: OrganizationMember) => {
    setMemberToEdit(member);
    setShowEdit(true);
  }, []);

  const onHideEdit = useCallback(() => {
    setMemberToEdit(null);
    setShowEdit(false);
  }, []);

  const showPaginator = useMemo(() => {
    if (props?.organization?.membersResult?.nextId || props?.organization?.membersResult?.lastId) {
      return true;
    }
    return false;
  }, [props?.organization?.membersResult?.lastId, props?.organization?.membersResult?.nextId]);

  const onNext = useCallback(() => {
    if (!props?.organization?.membersResult?.nextId) {
      return;
    }
    if (filterDeactived) {
      setSearchParams({
        id: props?.organization?.membersResult?.nextId,
        filter_deactivated: "true"
      });
      return;
    }
    setSearchParams({
      id: props?.organization?.membersResult?.nextId
    });
  }, [props?.organization?.membersResult?.nextId, filterDeactived]);

  const onLast = useCallback(() => {
    if (!props?.organization?.membersResult?.lastId) {
      return;
    }
    if (filterDeactived) {
      setSearchParams({
        id: props?.organization?.membersResult?.lastId,
        filter_deactivated: "true"
      });
      return;
    }
    setSearchParams({
      id: props?.organization?.membersResult?.lastId
    });

  }, [props?.organization?.membersResult?.lastId, filterDeactived]);

  const inactiveMemberCount = useMemo(() => {
    return (props.organization?.membersCount ?? 0) - (props?.organization?.membersActiveCount ?? 0);

  }, [props.organization?.membersCount, props?.organization?.membersActiveCount])

  return (
    <>
      <InviteModal
        show={showInviteModal}
        onDismissModal={onHideInviteModal}
        organization={props.organization as Organization}
      />
      {props.organization && (
        <ConfirmDeactivateMembershipModal
          show={showDeactivate}
          onDismiss={onHideDeactivate}
          member={memberToDeactivate}
          organization={props.organization}
          currentFilterDeactivatedMembers={filterDeactived}
          currentMemberId={id}
          currentMemeberQuery={search}
        />
      )}
      {props.organization && (
        <ConfirmReactivateMembershipModal
          show={showReactivate}
          onDismiss={onHideReactivate}
          member={memberToReactivate}
          organization={props.organization}
          currentFilterDeactivatedMembers={filterDeactived}
          currentMemberId={id}
          currentMemeberQuery={search}
        />
      )}

      {props.organization && (
        <EditMemberRolesModal
          show={showEdit}
          onDismiss={onHideEdit}
          member={memberToEdit}
          organization={props.organization}
          currentFilterDeactivatedMembers={filterDeactived}
          currentMemberId={id}
          currentMemeberQuery={search}
        />
      )}
      <MembersController
        onPressAddNewInvite={onShowInviteModal}
        page={"members"}
        organization={props.organization}
      >
        <Container>
          <Title>{"Members"}</Title>
          <div style={{ marginTop: 24, marginBottom: 24 }}>
            <SearchInput
              showClear
              borderColor={theme.name == "light" ? "gray" : "white"}
              value={search}
              placeholder={"search members"}
              onTextChanged={setSearch}
            />
          </div>
          <div
            style={{
              marginTop: 24,
              marginBottom: 24,
              display: "flex",
              flexDirection: "row",
              alignItems: "center",
            }}
          >
            <Checkbox isChecked={filterDeactived} onChange={onToggleFilter}/>
            <FilterText>{`Filter out inactive members (${inactiveMemberCount})`}</FilterText>
          </div>
          {props?.organization?.membersResult?.members?.map((member, index) => {
            return (
              <MemberRow
                key={index}
                member={member as OrganizationMember}
                organization={props.organization as Organization}
                onDeactivate={onShowDeactivate}
                onReactivate={onShowReactivate}
                onEdit={onShowEdit}
              />
            );
          })}
          {showPaginator && (
            <div
              style={{
                marginTop: 24,
                marginBottom: 48,
                maxWidth: 720,
                width: "100%",
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

export default React.memo(MembersHome);
