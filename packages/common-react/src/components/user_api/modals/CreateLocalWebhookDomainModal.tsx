import React, { useState, useMemo, useEffect, useCallback } from "react";
import styled from "@emotion/styled";
import RootLongModal from "@floro/common-react/src/components/RootLongModal";
import Button from "@floro/storybook/stories/design-system/Button";
import Input from "@floro/storybook/stories/design-system/Input";
import {  WebhookKey } from "floro/dist/src/apikeys";
import {  useAddWebhookKey } from "../local-api-hooks";
import {
  LOCALHOST,
  SUBDOMAIN,
  TLD_DOMAIN,
  validateLocalDomain,
} from "@floro/common-web/src/utils/validators";
import ProtocolToggle from "../ProtocolToggle";

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

export interface Props {
  show: boolean;
  onDismissModal: () => void;
  webhookKeys: Array<WebhookKey>;
}

const CreateLocalWebhookDomainModal = (props: Props) => {
  const [domain, setDomain] = useState("");
  const [defaultProtocol, setDefaultProtocol] =
    useState<"http" | "https">("http");
  const [defaultPort, setDefaultPort] = useState<string>("");
  const [defaultSubdomain, setDefaultSubdomain] = useState<string>("");
  const createKeyMutation = useAddWebhookKey();

  useEffect(() => {
    if (!props.show) {
      setDomain("");
      setDefaultPort("");
      setDefaultSubdomain("");
      setDefaultProtocol("http");
    }
  }, [props.show]);

  const isDomainValid = useMemo(() => {
    if (domain == "") {
      return undefined;
    }
    if (domain.trim() == "") {
      return false;
    }
    const exitingKeyWithName = props.webhookKeys.find(
      (k) => k.domain == domain
    );
    if (exitingKeyWithName) {
      return false;
    }
    return validateLocalDomain(domain);
  }, [domain, props.webhookKeys]);

  const showDefaultSubDomain = useMemo(() => {
    return TLD_DOMAIN.test(domain) || LOCALHOST.test(domain);
  }, [domain]);

  const isDefaultPortValid = useMemo(() => {
    if (defaultPort == "") {
      return true;
    }
    if (defaultPort.trim() == "") {
      return true;
    }
    if (!/^\d{1,5}$/.test(defaultPort)) {
      return false;
    }
    return parseInt(defaultPort) <= 0xffff;
  }, [defaultPort]);

  const isDefaultSubdomainValid = useMemo(() => {
    if (defaultSubdomain == "") {
      return true;
    }
    if (defaultSubdomain.trim() == "") {
      return true;
    }
    return SUBDOMAIN.test(defaultSubdomain);
  }, [defaultSubdomain]);

  const isValid = useMemo(() => {
    if (showDefaultSubDomain) {
      return isDomainValid && isDefaultPortValid && isDefaultSubdomainValid;
    }
    return isDomainValid && isDefaultPortValid;
  }, [
    isDomainValid,
    isDefaultPortValid,
    showDefaultSubDomain,
    isDefaultSubdomainValid,
  ]);

  const onAddKey = useCallback(() => {
    if (!isValid) {
      return;
    }
    createKeyMutation.mutate({
      domain,
      defaultProtocol,
      defaultPort:
        defaultPort?.trim?.() != "" ? parseInt(defaultPort) : undefined,
      defaultSubdomain:
        showDefaultSubDomain && defaultSubdomain?.trim?.() != ""
          ? defaultSubdomain?.trim?.()
          : undefined,
    });
  }, [
    isValid,
    domain,
    defaultProtocol,
    defaultPort,
    defaultSubdomain,
    showDefaultSubDomain,
  ]);

  useEffect(() => {
    if (createKeyMutation.isSuccess) {
      props.onDismissModal();
    }
  }, [createKeyMutation.isSuccess]);

  return (
    <RootLongModal
      show={props.show}
      onDismiss={props.onDismissModal}
      disableBackgroundDismiss
      headerSize={"small"}
      headerChildren={
        <HeaderWrapper>
          <FloroHeaderTitle>{"register local webhook domain"}</FloroHeaderTitle>
        </HeaderWrapper>
      }
    >
      <ContentWrapper>
        <TopWrapper>
          <div>
            <Input
              label={"domain name"}
              placeholder={"e.g. localhost, 192.168.1.2, test.com"}
              widthSize="wide"
              value={domain}
              onTextChanged={setDomain}
              isValid={isDomainValid}
            />
          </div>
          <div style={{ marginTop: 24 }}>
            <Input
              label={"default port (optional)"}
              placeholder={"e.g. 8888"}
              widthSize="wide"
              value={defaultPort}
              onTextChanged={setDefaultPort}
              isValid={isDefaultPortValid}
            />
          </div>
          {showDefaultSubDomain && (
            <div style={{ marginTop: 24 }}>
              <Input
                label={"default subdomain (optional)"}
                placeholder={
                  `e.g. put "test" for test.${domain}`
                }
                widthSize="wide"
                value={defaultSubdomain}
                onTextChanged={setDefaultSubdomain}
                isValid={isDefaultSubdomainValid}
              />
            </div>
          )}
          <div style={{ marginTop: 24 }}>
            <ProtocolToggle protocol={defaultProtocol} onChange={setDefaultProtocol} label={"default protocol"}/>
          </div>
        </TopWrapper>
        <BottomWrapper>
          <ButtonRow>
            <Button
              label={"register local webhook domain"}
              bg={"purple"}
              size={"extra-big"}
              isDisabled={!isValid}
              onClick={onAddKey}
              isLoading={createKeyMutation.isLoading}
            />
          </ButtonRow>
        </BottomWrapper>
      </ContentWrapper>
    </RootLongModal>
  );
};

export default React.memo(CreateLocalWebhookDomainModal);
