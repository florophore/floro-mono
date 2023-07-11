import React, { useCallback, useState, useEffect, useMemo } from "react";
import styled from "@emotion/styled";
import MembersController from "@floro/storybook/stories/common-components/MembersController";
import { useSearchParams } from "react-router-dom";
import { useTheme } from "@emotion/react";
import { Organization } from "@floro/graphql-schemas/src/generated/main-client-graphql";
import SearchInput from "@floro/storybook/stories/design-system/SearchInput";
import InviteModal from "./invitations/InviteModal";

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
  const search = searchParams.get("query") ?? "";
  const setSearch = useCallback((query: string) => {
    setSearchParams({
      query,
    });
  }, []);
  return (
    <>
      <InviteModal
        show={showInviteModal}
        onDismissModal={onHideInviteModal}
        organization={props.organization as Organization}
      />
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
        </Container>
      </MembersController>
    </>
  );
};

export default React.memo(MembersHome);
