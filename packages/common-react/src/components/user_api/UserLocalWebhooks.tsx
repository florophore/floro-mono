import React, { useCallback, useState, useEffect, useMemo } from "react";
import styled from "@emotion/styled";
import UserApiController from "@floro/storybook/stories/common-components/UserApiController";
import { useTheme } from "@emotion/react";
import { useDaemonIsConnected } from "../../pubsub/socket";
import { useNavigate } from "react-router-dom";
import { useApiKeys, useWebhookKeys } from "./local-api-hooks";
import CreateLocalApiKeyModal from "./modals/CreateLocalApiKeyModal";
import LocalApiKeyCard from "./cards/LocalApiKeyCard";
import CreateLocalWebhookDomainModal from "./modals/CreateLocalWebhookDomainModal";
import LocalWebhookKeyCard from "./cards/LocalWebhookKeyCard";

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

const UserLocalWebhooks = () => {
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
      navigate("/home/remote/webhooks");
    }
  }, [isDaemonConnected]);

  const { data: webhookKeys } = useWebhookKeys();

  return (
    <>
      <CreateLocalWebhookDomainModal
        onDismissModal={onHideCreate}
        show={showCreate}
        webhookKeys={webhookKeys ?? []}
      />
      <UserApiController
        isDaemonConnected={!!isDaemonConnected}
        page={"local-webhook"}
        onClickCreateWebhookDomain={onShowCreate}
      >
        <Container>
          <Title>{"Local Webhook Domains"}</Title>
          {webhookKeys?.length == 0 && (
            <div style={{ marginTop: 24, marginBottom: 24 }}>
              <NoKeysTitle>{"No Local Webhook Domains Added Yet"}</NoKeysTitle>
            </div>
          )}
          <div style={{ marginTop: 24, marginBottom: 24 }}>
            {webhookKeys?.map((webhookKey, index) => {
              return <LocalWebhookKeyCard key={index} localWebhookKey={webhookKey} />;
            })}
          </div>
        </Container>
      </UserApiController>
    </>
  );
};
export default React.memo(UserLocalWebhooks);
