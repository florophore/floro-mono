import React, {
  useMemo,
  useCallback
} from "react";
import styled from "@emotion/styled";
import { Link } from "react-router-dom";
import {
  ProtectedBranchRule,
  Repository,
} from "@floro/graphql-schemas/src/generated/main-client-graphql";
import { useNavigate} from "react-router-dom";

import { useSession } from "../../../../session/session-context";
import { useCanAmend } from "../../local/hooks/local-hooks";
import { Branch } from "floro/dist/src/repo";
import LocalEnabledApiKeys from "./LocalEnabledApiKeys";
import LocalEnabledWebhookKeys from "./LocalEnabledWebhookKeys";
import Button from "@floro/storybook/stories/design-system/Button";

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
}

const LocalSettingsHome = (props: Props) => {
  const navigate = useNavigate();
  const onGoToDeveloperSettings = useCallback(() => {
    navigate('/home/local/api')

  }, []);
  return (
    <Container>
      <InnerContainer>
        <TitleContainer>
          <Title>{"Local Repository Settings"}</Title>
        </TitleContainer>
        <LocalEnabledApiKeys repository={props.repository} />
        <LocalEnabledWebhookKeys repository={props.repository} />
        <div style={{marginTop: 24}}>
          <Button onClick={onGoToDeveloperSettings} label={"developer settings"} bg={"purple"} size={"medium"} textSize={"small"} />
        </div>
      </InnerContainer>
    </Container>
  );
};

export default React.memo(LocalSettingsHome);