import React, { useCallback, useState, useEffect, useMemo } from "react";
import styled from "@emotion/styled";
import OrganizationApiController from "@floro/storybook/stories/common-components/OrganizationApiController";
import { useSession } from "../../session/session-context";
import { Organization, WebhookKey } from "@floro/graphql-schemas/src/generated/main-client-graphql";
import CreateRemoteOrganizationWebhookDomainModal from "./modals/CreateRemoteOrganizationWebhookDomainModal";
import RemoteOrganizationWebhookKeyCard from "./cards/RemoteOrganizationWebhookKeyCard";

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

interface Props {
  organization: Organization;
  orgLink: string;
}

const OrganizationRemoteWebhook = (props: Props) => {
  const [showCreate, setShowCreate] = useState(false);

  const onShowCreate = useCallback(() => {
    setShowCreate(true);
  }, []);
  const onHideCreate = useCallback(() => {
    setShowCreate(false);
  }, []);

  return (
    <>
      <CreateRemoteOrganizationWebhookDomainModal
        show={showCreate}
        onDismissModal={onHideCreate}
        webhookKeys={(props?.organization?.webhookKeys ?? []) as WebhookKey[]}
        organization={props.organization}
      />
      <OrganizationApiController
        onClickCreateWebhookDomain={onShowCreate}
        page={"remote-webhook"}
        orgLink={props.orgLink}
      >
        <Container>
          <Title>{"Remote Webhook Domains"}</Title>
          {(props?.organization?.webhookKeys?.length ?? 0) == 0 && (
            <div style={{ marginTop: 24, marginBottom: 24 }}>
              <NoKeysTitle>{"No Remote Webhook Domains Added Yet"}</NoKeysTitle>
            </div>
          )}
          {(props?.organization?.webhookKeys?.length ?? 0) > 0 && (
            <div style={{ marginTop: 24, marginBottom: 24 }}>
                {props?.organization?.webhookKeys?.map((webhookKey, index) => {
                  return (
                    <RemoteOrganizationWebhookKeyCard key={index} webhookKey={webhookKey as WebhookKey} organization={props.organization}/>
                  );
                })}
            </div>
          )}
        </Container>
      </OrganizationApiController>
    </>
  );
};
export default React.memo(OrganizationRemoteWebhook);
