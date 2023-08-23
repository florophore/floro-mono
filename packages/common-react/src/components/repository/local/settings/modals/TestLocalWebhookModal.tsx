import React, { useMemo, useCallback, useEffect, useState } from "react";
import styled from "@emotion/styled";
import RootLongModal from "@floro/common-react/src/components/RootLongModal";
import Button from "@floro/storybook/stories/design-system/Button";
import { RepoEnabledWebhookKey, WebhookKey } from "floro/dist/src/apikeys";
import { Repository } from "@floro/graphql-schemas/src/generated/main-client-graphql";
import { useTheme } from "@emotion/react";

import VerifiedWarningLight from "@floro/common-assets/assets/images/icons/teal_check_mark_circle.light.svg";
import VerifiedWarningDark from "@floro/common-assets/assets/images/icons/teal_check_mark_circle.dark.svg";

import RedHexagonWarningLight from "@floro/common-assets/assets/images/icons/red_hexagon_warning.light.svg";
import RedHexagonWarningDark from "@floro/common-assets/assets/images/icons/red_hexagon_warning.dark.svg";
import { useDeleteEnabledWebhookKey, useTestEnabledWebhookKey } from "../enabled-key-hooks";
import { useCanAmend } from "../../hooks/local-hooks";
import ColorPalette from "@floro/styles/ColorPalette";
import JSONPretty from "react-json-pretty";
import createHmac from "create-hmac"
import SecretDisplay from "../SecretDisplay";
import { IP_REGEX } from "@floro/common-web/src/utils/validators";

const HeaderWrapper = styled.div`
  height: 100%;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
`;

const FloroHeaderTitle = styled.h1`
  font-family: "MavenPro";
  color: ${(props) => props?.theme.colors.modalHeaderTitleColor};
  font-weight: 700;
  font-size: 2rem;
`;

const ContentWrapper = styled.div`
  padding: 16px;
  display: flex;
  height: 100%;
  flex-direction: column;
  justify-content: space-around;
`;

const TopWrapper = styled.div`
  display: flex;
  height: 100%;
  flex-direction: column;
  align-items: center;
`;

const BottomWrapper = styled.div`
  display: flex;
  height: 100%;
  flex-direction: column;
  align-items: center;
  justify-content: flex-end;
  padding-bottom: 16px;
`;

const ButtonRow = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
  width: 470px;
`;

const Icon = styled.img`
  height: 24px;
  width: 24px;
`;

const PromptText = styled.p`
  padding: 0;
  margin: 24px 0 0 0;
  font-size: 1.4rem;
  font-family: "MavenPro";
  font-weight: 500;
  color: ${(props) => props.theme.colors.promptText};
`;

const UrlText = styled.div`
  font-family: "MavenPro";
  font-weight: 600;
  font-size: 1.2rem;
  color: ${(props) => props.theme.colors.titleText};
  margin-left: 16px;
  word-wrap: break-word;
`;
const HeaderSectionText = styled.span`
  font-family: "MavenPro";
  font-weight: 600;
  font-size: 1.2rem;
  color: ${(props) => props.theme.colors.contrastText};
  margin-left: 16px;
  width: 540px;
`;

export interface Props {
  show: boolean;
  onDismissModal: () => void;
  webhookKey: WebhookKey;
  enabledWebhook: RepoEnabledWebhookKey;
  repository: Repository;
}

const TestLocalWebhook = (props: Props) => {
  const theme = useTheme();
  const [testResult, setTestResult] = useState<'ok'|'error'|null>(null);
  const warningIcon = useMemo(() => {
    return theme.name == "light"
      ? RedHexagonWarningLight
      : RedHexagonWarningDark;
  }, [theme.name]);

  const verifiedIcon = useMemo(() => {
    return theme.name == "light"
      ? VerifiedWarningLight
      : VerifiedWarningDark;
  }, [theme.name]);

  const testMutation = useTestEnabledWebhookKey(props.repository?.id as string);

  const onTestKey = useCallback(() => {
    if (!props.enabledWebhook?.id) {
      return;
    }
    testMutation.mutate(props.enabledWebhook?.id);
  }, [props.enabledWebhook?.id])


  useEffect(() => {
    if (testMutation.isSuccess) {
      setTestResult(testMutation?.data?.data?.responseOkay ? 'ok' : 'error')
    } else {
      setTestResult(null);
    }
  }, [testMutation.isSuccess])

  useEffect(() => {
    if (props.show) {
      setTestResult(null);
      testMutation.reset();
    }
  }, [props.show])

  const webhookUrl = useMemo(() => {
    let str = `${props.enabledWebhook?.protocol ?? "http"}://`;
    if (props.enabledWebhook.subdomain && !IP_REGEX.test(props.webhookKey?.domain)) {
      str += props.enabledWebhook.subdomain + ".";
    }
    str += props.webhookKey?.domain;
    if (props.enabledWebhook?.port) {
      str += ":" + props.enabledWebhook?.port;
    }
    return str + (props?.enabledWebhook?.uri ?? "");
  }, [
    props.webhookKey?.domain,
    props.enabledWebhook.protocol,
    props?.enabledWebhook?.subdomain,
    props?.enabledWebhook?.uri,
    props?.enabledWebhook?.port,
  ]);

  const secret = useMemo(() => {
    return props.webhookKey.secret;
  }, [props.webhookKey]);

  const jsonTheme = useMemo(() => {
    if (theme.name == "dark") {
      return {
        main: `line-height:1.3;color:${ColorPalette.white};font-family:MavenPro;`,
        error: `line-height:1.3;color:${ColorPalette.white};font-family:MavenPro;`,
        key: `color:${ColorPalette.lightPurple};font-family:MavenPro;`,
        string: `color:${ColorPalette.orange};font-family:MavenPro;`,
        value: `color:${ColorPalette.orange};font-family:MavenPro;`,
        boolean: `color:${ColorPalette.teal};font-family:MavenPro;`,
      };
    }
    return {
      main: `line-height:1.3;color:${ColorPalette.lightPurple};font-family:MavenPro;`,
      error: `line-height:1.3;color:${ColorPalette.lightPurple};font-family:MavenPro;`,
      key: `color:${ColorPalette.purple};font-family:MavenPro;`,
      string: `color:${ColorPalette.orange};font-family:MavenPro;`,
      value: `color:${ColorPalette.orange};font-family:MavenPro;`,
      boolean: `color:${ColorPalette.teal};font-family:MavenPro;`,
    };
  }, [theme.name]);

  const jsonPayload = useMemo(() => {
    return JSON.stringify({
      event: "test",
      repositoryId: props.repository.id,
      payload: {}
    }, null, 2);

  },[props.repository.id]);

  const signature = useMemo(() => {
    const payload = JSON.stringify({
      event: "test",
      repositoryId: props.repository.id,
      payload: {}
    });
    const hmac = createHmac('sha256', secret);
    return 'sha256=' + hmac.update(payload).digest('hex');
  }, [secret, jsonPayload])

  return (
    <RootLongModal
      show={props.show}
      onDismiss={props.onDismissModal}
      disableBackgroundDismiss
      headerSize={"small"}
      headerChildren={
        <HeaderWrapper>
          <FloroHeaderTitle>{"test local webhook"}</FloroHeaderTitle>
        </HeaderWrapper>
      }
    >
      <ContentWrapper>
        <TopWrapper>
          <div style={{width: 540}}>
            <PromptText>
              {`Floro will send the following request`}
            </PromptText>
          </div>
          <div style={{width: 540, marginTop: 24}}>
            <UrlText>{"POST " + webhookUrl}</UrlText>
          </div>
          <div style={{width: 540, marginTop: 12, fontStyle: "italic"}}>
            <HeaderSectionText>{"Headers"}</HeaderSectionText>
          </div>
          <div style={{width: 540, marginTop: 12}}>
            <UrlText>{"content-type: "}<span style={{fontWeight: 500}}>{'application/json'}</span></UrlText>
          </div>
          <div style={{width: 540}}>
            <UrlText>{"floro-signature-256: "}<span style={{fontSize: '0.9rem', fontWeight: 500}}>{signature}</span></UrlText>
          </div>
          <div style={{width: 540, marginTop: 12, fontStyle: "italic"}}>
            <HeaderSectionText>{"Body"}</HeaderSectionText>
          </div>
          <div style={{fontSize: '1.1rem'}}>
            <JSONPretty
              space="4"
              data={jsonPayload}
              theme={jsonTheme}
            ></JSONPretty>
          </div>
          <div style={{width: 540}}>
            <PromptText>
              {`the hmac 256 wll be built using the secret`}
            </PromptText>
          </div>
          <div style={{marginTop: 24}}>
            <SecretDisplay secret={secret}/>
          </div>
          <div style={{width: 540}}>
            <PromptText>
              {`you should respond with a 200 range status code`}
            </PromptText>
          </div>
          {testResult == "ok" && (
            <div style={{width: 540, marginTop: 12, display: 'flex', justifyContent: 'center', alignItems: 'center', flexDirection: 'row'}}>
              <Icon src={verifiedIcon}/>
              <PromptText style={{marginTop: 0, marginLeft: 16, color: theme.name == "dark" ? ColorPalette.lightTeal : ColorPalette.teal}}>
                {` webhook test success!`}
              </PromptText>
            </div>
          )}
          {testResult == "error" && (
            <div style={{width: 540, marginTop: 12, display: 'flex', justifyContent: 'center', alignItems: 'center', flexDirection: 'row'}}>
              <Icon src={warningIcon}/>
              <PromptText style={{marginTop: 0, marginLeft: 16, color: theme.colors.warningTextColor}}>
                {` webhook test error!`}
              </PromptText>
            </div>
          )}
        </TopWrapper>
        <BottomWrapper>
          <ButtonRow>
            <Button
              onClick={onTestKey}
              isLoading={testMutation.isLoading}
              label={"send test request"}
              bg={"teal"}
              size={"extra-big"}
            />
          </ButtonRow>
        </BottomWrapper>
      </ContentWrapper>
    </RootLongModal>
  );
};

export default React.memo(TestLocalWebhook);