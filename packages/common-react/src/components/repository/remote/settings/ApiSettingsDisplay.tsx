import React, {
  useMemo,
  useCallback
} from "react";
import styled from "@emotion/styled";
import {
  ApiKey,
  Repository,
  WebhookKey,
} from "@floro/graphql-schemas/src/generated/main-client-graphql";
import { useNavigate} from "react-router-dom";

import { useRepoLinkBase } from "../hooks/remote-hooks";
import { useSession } from "../../../../session/session-context";
import RemoteEnabledApiKeys from "./api_settings/RemoteEnabledApiKeys";
import RemoteEnabledWebhookKeys from "./api_settings/RemoteEnabledWebhookKeys";
import Button from "@floro/storybook/stories/design-system/Button";
import DotsLoader from "@floro/storybook/stories/design-system/DotsLoader";

const Container = styled.div`
  height: 100%;
  max-width: 100%;
  user-select: text;
  ::-webkit-scrollbar {
    width: 4px;
    background: ${(props) => props.theme.background};
  }
  ::-webkit-scrollbar-thumb {
    background-color: rgba(155, 155, 155, 0.5);
    border-radius: 10px;
    border: ${(props) => props.theme.background};
  }
`;

const InnerContainer = styled.div`
  padding: 16px 40px 80px 24px;
  overflow-y: scroll;
  height: 100%;
`;

const TitleContainer = styled.div`
  width: 100%;
  max-width: 960px;
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  align-items: flex-end;
`;

const Title = styled.h1`
  font-family: "MavenPro";
  font-weight: 700;
  font-size: 2rem;
  color: ${(props) => props.theme.colors.pluginDisplayTitle};
`;

const ApiConfigText = styled.span`
  font-family: "MavenPro";
  font-weight: 600;
  font-size: 1.2rem;
  color: ${(props) => props.theme.colors.linkColor};
  text-decoration: underline;
`;

const InsufficientPermssionsContainer = styled.div`
  display: flex;
  height: 100%;
  width: 100%;
  flex-direction: center;
  justify-content: center;
  align-items: center;
`;

const InsufficientPermssionsTextWrapper = styled.div`
  width: 50%;
  max-width: 450px;
  flex-direction: center;
  justify-content: center;
`;

const InsufficientPermssionsText = styled.h3`
  font-weight: 600;
  font-size: 2.5rem;
  font-family: "MavenPro";
  text-align: center;
  color: ${(props) => props.theme.colors.contrastText};
`;

interface Props {
  repository: Repository;
  plugin: string;
  isLoading: boolean;
}

const ApiSettingsDisplay = (props: Props) => {

  const linkBase = useRepoLinkBase(props.repository);
  const navigate = useNavigate();
  const { currentUser } = useSession();
  const apiLink = useMemo(() => {
    return linkBase + "/settings/api?from=remote&plugin=" + (props?.plugin ?? "home");
  }, [linkBase, props.plugin]);

  const onGoToDeveloperSettings = useCallback(() => {
    if (props.repository?.repoType == "user_repo") {
      navigate('/home/local/api')
    } else {
      navigate(`/org/@/${props.repository?.organization?.handle}/remote/api`)
    }
  }, [props.repository, props.repository?.repoType, props.repository?.organization?.handle]);

  const canChangeApiSettings = useMemo(() => {
    if (props?.repository?.repoType == "user_repo") {
      return currentUser?.id == props?.repository?.user?.id;
    }
    return props?.repository?.organization?.membership?.permissions
      ?.canModifyOrganizationDeveloperSettings ?? false;
  }, [
    currentUser?.id,
    props?.repository?.user?.id,
    props?.repository?.repoType,
    props?.repository?.organization?.membership?.permissions
      ?.canModifyOrganizationDeveloperSettings,
  ]);

  const apiKeys = useMemo(() => {
    if (props?.repository?.repoType == "user_repo") {
      return props?.repository?.user?.apiKeys ?? ([] as Array<ApiKey>);
    }
    return props?.repository?.organization?.apiKeys ?? ([] as Array<ApiKey>);
  }, [
    props?.repository?.repoType,
    props?.repository?.organization?.apiKeys,
    props?.repository?.user?.apiKeys,
  ]);

  const webhookKeys = useMemo(() => {
    if (props?.repository?.repoType == "user_repo") {
      return props?.repository?.user?.webhookKeys ?? ([] as Array<WebhookKey>);
    }
    return (
      props?.repository?.organization?.webhookKeys ?? ([] as Array<WebhookKey>)
    );
  }, [
    props?.repository?.repoType,
    props?.repository?.organization?.webhookKeys,
    props?.repository?.user?.webhookKeys,
  ]);

  if (!canChangeApiSettings) {
    return (
      <InsufficientPermssionsContainer>
        <InsufficientPermssionsTextWrapper>
          <InsufficientPermssionsText>
            {props.isLoading && (
              <DotsLoader size={"medium"} color={"purple"}/>
            )}
            {!props.isLoading && (
              <>
                {"insufficient repo access to display api setting controls"}
              </>
            )}
          </InsufficientPermssionsText>
        </InsufficientPermssionsTextWrapper>
      </InsufficientPermssionsContainer>
    );
  }

  return (
    <Container>
      <InnerContainer>
        <TitleContainer>
          <Title>{"Remote Api Settings"}</Title>
        </TitleContainer>
        <RemoteEnabledApiKeys repository={props.repository} apiKeys={apiKeys as Array<ApiKey>}/>
        <RemoteEnabledWebhookKeys repository={props.repository} webhookKeys={webhookKeys as Array<WebhookKey>}/>
        <div style={{marginTop: 24}}>
          <Button onClick={onGoToDeveloperSettings} label={"developer settings"} bg={"purple"} size={"medium"} textSize={"small"} />
        </div>
      </InnerContainer>
    </Container>
  );
};

export default React.memo(ApiSettingsDisplay);
