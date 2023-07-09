
import React, { useCallback, useState, useEffect, useMemo } from "react";
import styled from "@emotion/styled";
import MembersController from "@floro/storybook/stories/common-components/MembersController";
import { useSearchParams } from "react-router-dom";
import { useTheme } from "@emotion/react";
import {
  Organization,
} from "@floro/graphql-schemas/src/generated/main-client-graphql";
import SearchInput from "@floro/storybook/stories/design-system/SearchInput";

const Container = styled.div`
  flex: 1;
  height: 100%;
  width: 100%;
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
  padding: 24px;
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
  const [searchParams, setSearchParams] = useSearchParams();
  const search = searchParams.get("query") ?? "";
  const setSearch = useCallback((query: string) => {
    setSearchParams({
        query
    });
  }, []);
  return (
    <MembersController page={"members"} organization={props.organization}>
      <Container>
        <Title>{"Members"}</Title>
        <div style={{marginTop: 24}}>
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
  );
};

export default React.memo(MembersHome);