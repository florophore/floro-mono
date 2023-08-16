import React, { useCallback, useState, useEffect, useMemo } from "react";
import styled from "@emotion/styled";
import UserApiController from "@floro/storybook/stories/common-components/UserApiController";
import { useTheme } from "@emotion/react";
import { useDaemonIsConnected } from "../../pubsub/socket";
import { useNavigate } from "react-router-dom";
import { useApiKeys } from "./local-api-hooks";
import CreateLocalApiKeyModal from "./modals/CreateLocalApiKeyModal";
import LocalApiKeyCard from "./cards/LocalApiKeyCard";

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

const UserLocalApi = () => {
  const isDaemonConnected = useDaemonIsConnected();
  const navigate = useNavigate();
  const [showCreate, setShowCreate] = useState(false);

  const onShowCreate = useCallback(() => {
    setShowCreate(true);
  }, []);
  const onHideCreate = useCallback(() => {
    setShowCreate(false);
  }, []);
  useEffect(() => {
    if (!isDaemonConnected) {
      navigate("/home/remote/api");
    }
  }, [isDaemonConnected]);

  const { data: apiKeys } = useApiKeys();

  return (
    <>
      <CreateLocalApiKeyModal
        onDismissModal={onHideCreate}
        show={showCreate}
        localApiKeys={apiKeys ?? []}
      />
      <UserApiController
        isDaemonConnected={!!isDaemonConnected}
        page={"local-api"}
        onClickCreateApiKey={onShowCreate}
      >
        <Container>
          <Title>{"Local API Keys"}</Title>
          {apiKeys?.length == 0 && (
            <div style={{ marginTop: 24, marginBottom: 24 }}>
              <NoKeysTitle>{"No Local Api Keys Added Yet"}</NoKeysTitle>
            </div>
          )}
          <div style={{ marginTop: 24, marginBottom: 24 }}>
            {apiKeys?.map((apiKey, index) => {
              return <LocalApiKeyCard key={index} localApiKey={apiKey} />;
            })}
          </div>
        </Container>
      </UserApiController>
    </>
  );
};
export default React.memo(UserLocalApi);
