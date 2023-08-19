
import React, { useCallback, useState, useEffect, useMemo } from "react";
import styled from "@emotion/styled";
import OrganizationApiController from "@floro/storybook/stories/common-components/OrganizationApiController";
import { useSession } from "../../session/session-context";
import RemoteOrganizationApiKeyCard from "./cards/RemoteOrganizationApiKeyCard";
import { ApiKey, Organization } from "@floro/graphql-schemas/src/generated/main-client-graphql";
import CreateRemoteOrganizationApiKeyModal from "./modals/CreateRemoteOrganizationApiKeyModal";

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

const OrganizationRemoteApi = (props: Props) => {
  const [showCreate, setShowCreate] = useState(false);

  const onShowCreate = useCallback(() => {
    setShowCreate(true);
  }, []);
  const onHideCreate = useCallback(() => {
    setShowCreate(false);
  }, []);

    return (
      <>
        <CreateRemoteOrganizationApiKeyModal organization={props.organization} show={showCreate} onDismissModal={onHideCreate} apiKeys={(props?.organization?.apiKeys ?? []) as Array<ApiKey>}/>
        <OrganizationApiController orgLink={props.orgLink} onClickCreateApiKey={onShowCreate} page={"remote-api"}>
          <Container>
            <Title>{"Remote API Keys"}</Title>
            {(props?.organization?.apiKeys?.length ?? 0) == 0 && (
              <div style={{ marginTop: 24, marginBottom: 24 }}>
                <NoKeysTitle>{'No Remote Api Keys Added Yet'}</NoKeysTitle>
              </div>
            )}
            {(props?.organization?.apiKeys?.length ?? 0) > 0 && (
              <div style={{ marginTop: 24, marginBottom: 24 }}>
                {props?.organization?.apiKeys?.map((apiKey, index) => {
                  return (
                    <RemoteOrganizationApiKeyCard key={index} apiKey={apiKey as ApiKey} organization={props.organization}/>
                  );
                })}
              </div>
            )}
          </Container>
        </OrganizationApiController>
      </>
    );
}
export default React.memo(OrganizationRemoteApi);