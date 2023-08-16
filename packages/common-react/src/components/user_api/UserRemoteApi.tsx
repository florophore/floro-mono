
import React, { useCallback, useState, useEffect, useMemo } from "react";
import styled from "@emotion/styled";
import UserApiController from "@floro/storybook/stories/common-components/UserApiController";
import { useTheme } from "@emotion/react";
import { useDaemonIsConnected } from "../../pubsub/socket";
import { useNavigate } from "react-router-dom";

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

const NoKeysTitle = styled.h1`
  font-family: "MavenPro";
  font-weight: 500;
  font-size: 1.4rem;
  color: ${(props) => props.theme.colors.contrastTextLight};
  margin-top: 30px;
`;

const UserRemoteApi = () => {
    const isDaemonConnected  = useDaemonIsConnected();

    return (
      <UserApiController isDaemonConnected={!!isDaemonConnected} page={"remote-api"}>
        <Container>
          <Title>{"Remote API Keys"}</Title>
          <div style={{ marginTop: 24, marginBottom: 24 }}>
            <NoKeysTitle>{'No Remote Api Keys Added Yet'}</NoKeysTitle>
          </div>
        </Container>
      </UserApiController>
    );
}
export default React.memo(UserRemoteApi);