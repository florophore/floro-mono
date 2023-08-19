import React, { useCallback, useState } from "react";
import styled from "@emotion/styled";
import UserApiController from "@floro/storybook/stories/common-components/UserApiController";
import { useDaemonIsConnected } from "../../pubsub/socket";
import { useSession } from "../../session/session-context";
import { WebhookKey } from "@floro/graphql-schemas/src/generated/main-client-graphql";
import CreateRemoteUserWebhookDomainModal from "./modals/CreateRemoteUserWebhookDomainModal";
import RemoteUserWebhookKeyCard from "./cards/RemoteUserWebhookKeyCard";

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

const UserRemoteWebhook = () => {
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
      <CreateRemoteUserWebhookDomainModal
        show={showCreate}
        onDismissModal={onHideCreate}
        webhookKeys={(currentUser?.webhookKeys ?? []) as WebhookKey[]}
      />
      <UserApiController
        onClickCreateWebhookDomain={onShowCreate}
        isDaemonConnected={!!isDaemonConnected}
        page={"remote-webhook"}
      >
        <Container>
          <Title>{"Remote Webhook Domains"}</Title>
          {(currentUser?.webhookKeys?.length ?? 0) == 0 && (
            <div style={{ marginTop: 24, marginBottom: 24 }}>
              <NoKeysTitle>{"No Remote Webhook Domains Added Yet"}</NoKeysTitle>
            </div>
          )}
          {(currentUser?.webhookKeys?.length ?? 0) > 0 && (
            <div style={{ marginTop: 24, marginBottom: 24 }}>
              {currentUser?.webhookKeys?.map((webhookKey, index) => {
                return (
                  <RemoteUserWebhookKeyCard
                    key={index}
                    webhookKey={webhookKey as WebhookKey}
                  />
                );
              })}
            </div>
          )}
        </Container>
      </UserApiController>
    </>
  );
};
export default React.memo(UserRemoteWebhook);
