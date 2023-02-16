import React from "react";
import styled from "@emotion/styled";

const Container = styled.div`
  background-color: ${(props) => props.theme.background};
  flex: 1;
  height: 100%;
  width: 100%;
  display: flex;
  flex-direction: row;
  justify-content: flex-start;
  align-items: space-between;
  user-select: none;
`;

const Nav = styled.div`
  width: 263px;
  height: calc(100vh - 72px);
  border-right: 1px solid ${(props) => props.theme.colors.commonBorder};
  display: flex;
  flex-direction: column;
`;

const Main = styled.div`
  height: 100%;
  width: calc(100vw - 335px);
  height: calc(100vh - 72px);
  overflow: scroll;
`;

interface Props {
  nav: React.ReactElement;
  children: React.ReactElement;
}

const SideNavWrapper = (props: Props) => {
  return (
    <Container>
      <Nav>{props.nav}</Nav>
      <Main>{props.children}</Main>
    </Container>
  );
};

export default React.memo(SideNavWrapper);