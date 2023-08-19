import React, { useCallback, useState } from "react";
import styled from "@emotion/styled";
import UserApiController from "@floro/storybook/stories/common-components/UserApiController";
import { useDaemonIsConnected } from "../../pubsub/socket";
import { useSession } from "../../session/session-context";
import RemoteUserApiKeyCard from "./cards/RemoteUserApiKeyCard";
import { ApiKey } from "@floro/graphql-schemas/src/generated/main-client-graphql";
import CreateRemoteUserApiKeyModal from "./modals/CreateRemoteUserApiKeyModal";

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
  const isDaemonConnected = useDaemonIsConnected();
  const { currentUser } = useSession();
  const [showCreate, setShowCreate] = useState(false);

  const onShowCreate = useCallback(() => {
    setShowCreate(true);
  }, []);
  const onHideCreate = useCallback(() => {
    setShowCreate(false);
  }, []);

  return (
    <>
      <CreateRemoteUserApiKeyModal
        show={showCreate}
        onDismissModal={onHideCreate}
        apiKeys={(currentUser?.apiKeys ?? []) as Array<ApiKey>}
      />
      <UserApiController
        onClickCreateApiKey={onShowCreate}
        isDaemonConnected={!!isDaemonConnected}
        page={"remote-api"}
      >
        <Container>
          <Title>{"Remote API Keys"}</Title>
          {(currentUser?.apiKeys?.length ?? 0) == 0 && (
            <div style={{ marginTop: 24, marginBottom: 24 }}>
              <NoKeysTitle>{"No Remote Api Keys Added Yet"}</NoKeysTitle>
            </div>
          )}
          {(currentUser?.apiKeys?.length ?? 0) > 0 && (
            <div style={{ marginTop: 24, marginBottom: 24 }}>
              {currentUser?.apiKeys?.map((apiKey, index) => {
                return (
                  <RemoteUserApiKeyCard key={index} apiKey={apiKey as ApiKey} />
                );
              })}
            </div>
          )}
        </Container>
      </UserApiController>
    </>
  );
};
export default React.memo(UserRemoteApi);
