import React, { useState, useMemo, useEffect, useCallback } from "react";
import styled from "@emotion/styled";
import RootLongModal from "@floro/common-react/src/components/RootLongModal";
import Button from "@floro/storybook/stories/design-system/Button";
import Input from "@floro/storybook/stories/design-system/Input";
import { WebhookKey } from "floro/dist/src/apikeys";
//import {  useAddWebhookKey } from "../local-api-hooks";
import {
  IP_REGEX,
  LOCALHOST,
  SUBDOMAIN,
  TLD_DOMAIN,
  URI_PATH,
  validateLocalDomain,
} from "@floro/common-web/src/utils/validators";
import ProtocolToggle from "../ProtocolToggle";
import InputSelector, { Option } from "@floro/storybook/stories/design-system/InputSelector";
import { useAddEnabledWebhookKey } from "../enabled-key-hooks";
import { Repository } from "@floro/graphql-schemas/src/generated/main-client-graphql";

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
  repository: Repository;
}

const CreateLocalWebhookDomainModal = (props: Props) => {
  const [domainKeyOption, setDomainKeyOption] = useState<Option<string>|null>(null);
  const [uri, setUri] = useState("");
  const [protocol, setProtocol] =
    useState<"http" | "https">("http");
  const [port, setPort] = useState<string>("");
  const [subdomain, setSubdomain] = useState<string>("");
  const createMutation = useAddEnabledWebhookKey(props?.repository?.id as string);

  useEffect(() => {
    if (!props.show) {
      setDomainKeyOption(null);
      setUri("");
      setPort("");
      setSubdomain("");
      setProtocol("http");
    }
  }, [props.show]);

  const isUriValid = useMemo(() => {
    if (subdomain == "") {
      return true;
    }
    if (uri.trim() == "") {
      return false;
    }
    return URI_PATH.test(uri);
  }, [uri])

  const isPortValid = useMemo(() => {
    if (port == "") {
      return true;
    }
    if (port.trim() == "") {
      return true;
    }
    if (!/^\d{1,5}$/.test(port)) {
      return false;
    }
    return parseInt(port) <= 0xffff;
  }, [port]);

  const isSubdomainValid = useMemo(() => {
    if (subdomain == "") {
      return true;
    }
    if (subdomain.trim() == "") {
      return true;
    }
    return SUBDOMAIN.test(subdomain);
  }, [subdomain]);

  const isValid = useMemo(() => {
    return !!domainKeyOption && isPortValid && isSubdomainValid && isUriValid;
  }, [isPortValid, isSubdomainValid, isUriValid, domainKeyOption]);

  const webhookDomainOptions = useMemo(() => {
    return props?.webhookKeys.map(webhookKey => {
      return {
        value: webhookKey.id,
        label: webhookKey.domain
      }
    })

  }, [props.webhookKeys])

  const onSetOption = useCallback((option: Option<unknown>|null) => {
    if (option) {
      setDomainKeyOption(option as Option<string>);
    }
  }, []);

  const webhookKey = useMemo(() => {
    if (!domainKeyOption?.value) {
      return null;
    }
    return props.webhookKeys.find(wk => wk.id == domainKeyOption.value)

  }, [domainKeyOption, props.webhookKeys]);

  const onChangeUri = useCallback((text: string) => {
    if ((text?.length ?? 0) > 0 && text?.[0] != "/") {
      setUri("/" + text?.trim());
    } else {
      setUri(text.trim());
    }
  }, []);

  useEffect(() => {
    if (webhookKey) {
      setPort(webhookKey?.defaultPort?.toString() ?? "")
      setSubdomain(webhookKey?.defaultSubdomain ?? "");
      setProtocol(webhookKey?.defaultProtocol ?? "http");
    }

  }, [webhookKey])

  const onAddKey = useCallback(() => {
    if (!isValid || !webhookKey?.id) {
      return;
    }
    createMutation.mutate({
      webhookKeyId: webhookKey?.id,
      port: port?.trim() == "" ? undefined : parseInt(port),
      protocol: protocol ?? "http",
      subdomain: subdomain?.trim() == "" ? undefined : subdomain,
      uri: uri.trim() == "" ? undefined : uri
    });
  }, [isValid, uri, protocol, port, subdomain, webhookKey?.id]);

  useEffect(() => {
    if (createMutation?.isSuccess) {
      createMutation.reset();
      props.onDismissModal();
    }
  }, [createMutation?.isSuccess])

  const showSubdomain = useMemo(() => {
    if (!webhookKey?.domain) {
      return false;
    }
    if (IP_REGEX.test(webhookKey?.domain)) {
      return false;
    }
    return true;
  }, [webhookKey?.domain])

  return (
    <RootLongModal
      show={props.show}
      onDismiss={props.onDismissModal}
      disableBackgroundDismiss
      headerSize={"small"}
      headerChildren={
        <HeaderWrapper>
          <FloroHeaderTitle>{"register local webhook"}</FloroHeaderTitle>
        </HeaderWrapper>
      }
    >
      <ContentWrapper>
        <TopWrapper>
          <div>
            <InputSelector
              placeholder={"select domain"}
              label={"webhook domain"}
              options={webhookDomainOptions}
              size={"wide"}
              onChange={onSetOption}
              value={domainKeyOption?.value ?? null}
            />
          </div>
          {!!webhookKey && (
            <>
              <div style={{ marginTop: 24 }}>
                <Input
                  label={"uri"}
                  placeholder={`e.g. /webhook/${props.repository.name}`}
                  widthSize="wide"
                  value={uri}
                  onTextChanged={onChangeUri}
                  isValid={isUriValid}
                />
              </div>
              <div style={{ marginTop: 24 }}>
                <Input
                  label={"port (optional)"}
                  placeholder={"e.g. 8888"}
                  widthSize="wide"
                  value={port}
                  onTextChanged={setPort}
                  isValid={isPortValid}
                />
              </div>
              {showSubdomain && (
                <div style={{ marginTop: 24 }}>
                  <Input
                    label={"subdomain (optional)"}
                    placeholder={`e.g. put "test" for test.${webhookKey.domain}`}
                    widthSize="wide"
                    value={subdomain}
                    onTextChanged={setSubdomain}
                    isValid={isSubdomainValid}
                  />
                </div>
              )}
              <div style={{ marginTop: 24 }}>
                <ProtocolToggle
                  protocol={protocol}
                  onChange={setProtocol}
                  label={" protocol"}
                />
              </div>
            </>
          )}
        </TopWrapper>
        <BottomWrapper>
          <ButtonRow>
            <Button
              label={"register local webhook"}
              bg={"orange"}
              size={"extra-big"}
              isDisabled={!isValid}
              onClick={onAddKey}
            />
          </ButtonRow>
        </BottomWrapper>
      </ContentWrapper>
    </RootLongModal>
  );
};

export default  React.memo(CreateLocalWebhookDomainModal);
