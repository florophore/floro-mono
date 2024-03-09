import React, { useEffect, useState, useMemo } from "react";
import styled from "@emotion/styled";
import RootCertModal from "../RootCertModal";
import QRCode from "react-qr-code";
import { useTheme } from "@emotion/react";
import { useConnectionInfoQuery } from "./cert-hooks";
import DotsLoader from "@floro/storybook/stories/design-system/DotsLoader";
import { useOpenLink } from "../../links/OpenLinkContext";
import { useApiKeys } from "../user_api/local-api-hooks";
import InputSelector, { Option} from "@floro/storybook/stories/design-system/InputSelector";

const Container = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100%;
  width: 100%;
  background: ${props => props.theme.background};
`;

const CertLinkWrapper =styled.div`
  display: flex;
  align-items: center;
  flex-direction: column;
  padding-top: 36px;
  text-align: center;
`;

const CertValue = styled.span`
  font-size: 1.2rem;
  font-family: "MavenPro";
  font-weight: 600;
  color: ${(props) => props.theme.colors.contrastText};
`;


const InstructionsWrapper =styled.div`
  display: flex;
  align-items: center;
  flex-direction: column;
  padding-top: 36px;
  text-align: center;
  width: 70%;
`;

const BlurbText = styled.p`
  font-family: "MavenPro";
  font-weight: 400;
  font-size: 1.4rem;
  white-space: pre-wrap;
  color: ${(props) => props.theme.colors.contrastText};
`;



const tlsCertText = () => ({
  __html: `
   Make sure your phone is connected to the same wifi-network as your computer. <b>Scan the QR with your phone's camera app</b>. Download, install, and trust the certificate.
`.trimStart(),
});

const connectText = () => ({
  __html: `
   Make sure your phone is connected to the same wifi-network as your computer. Select the appropriate API Key for your repository. <b>Scan the QR from the application you are trying to connect to.</b>
`.trimStart(),
});

interface Props {
  show: boolean;
  onClose: () => void;
}

const CertModal = (props: Props) => {
  const [page, setPage] = useState<"cert" | "api-keys">("cert");
  const theme = useTheme();

  const { data, isLoading } = useConnectionInfoQuery();

  const { data: apiKeys } = useApiKeys();

  const hasApiKey = useMemo(() => {
    return (apiKeys?.length ?? 0) > 0;
  }, [apiKeys])

  const certValue = useMemo(() => {
    if (!data?.ipAddr || !data?.certPort) {
      return null
    }
    return `http://${data?.ipAddr}:${data?.certPort}/cert`
  }, [data?.ipAddr, data?.certPort])

  const options = useMemo(() => {
    return apiKeys?.map((apiKey): Option<unknown> => {
      return {
        label: apiKey.name,
        value: apiKey.secret
      }
    }) ?? [] as Array<Option<unknown>>;
  }, [apiKeys])

  const [selectedApiKey, setSelectedApiKey] = useState(options?.[0] ?? null);

  const connectionInfo = useMemo(() => {
    if (!selectedApiKey?.value || !data?.ipAddr || !data?.tlsPort) {
      return null;
    }

    return JSON.stringify({
      apiKey: selectedApiKey.value,
      ipAddr: data.ipAddr,
      tlsPort: data.tlsPort
    });
  }, [selectedApiKey, data?.ipAddr, data?.tlsPort]);

  useEffect(() => {
    if (props.show) {
      setSelectedApiKey(options?.[0] ?? null);
    }
  }, [props.show, options])

  useEffect(() => {
    if (props.show) {
      setPage("cert");
    }
  }, [props.show]);

  return (
    <RootCertModal
      title={page == "cert" ? "Download TLS Cert" : "Connect API Key"}
      show={props.show}
      isApiKeysDisabled={!(hasApiKey && !!certValue)}
      page={page}
      onChangePage={setPage}
      onClose={props.onClose}
    >
      <>
        {page == "api-keys" && (
          <Container style={{ flexDirection: "column" }}>
            <div style={{ marginBottom: 48, marginTop: -48 }}>
              <InputSelector
                options={options}
                value={selectedApiKey.value as string}
                label={"api key"}
                placeholder={"select an api key"}
                onChange={(option) => {
                  if (option) {
                    setSelectedApiKey(option);
                  }
                }}
              />
            </div>
            {isLoading && (
              <DotsLoader
                color={theme.name == "light" ? "purple" : "lightPurple"}
                size={"large"}
              />
            )}
            {!isLoading && connectionInfo && (
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  flexDirection: "column",
                }}
              >
                <div
                  style={{
                    height: 192,
                    width: 192,
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                  }}
                >
                  <QRCode
                    size={192}
                    style={{ height: "auto", maxWidth: "100%", width: "100%" }}
                    value={connectionInfo}
                    viewBox={`0 0 192 192`}
                    bgColor={theme.background}
                    fgColor={theme.colors.contrastText}
                  />
                </div>
                <InstructionsWrapper>
                  <BlurbText>
                    <span dangerouslySetInnerHTML={connectText()}></span>
                    <span style={{ marginTop: 18, display: "block" }}>
                      <a
                        style={{
                          color: theme.colors.linkColor,
                          fontWeight: 600,
                        }}
                      >
                        Read the docs on mobile preview
                      </a>
                    </span>
                  </BlurbText>
                </InstructionsWrapper>
              </div>
            )}
          </Container>
        )}

        {page == "cert" && (
          <Container>
            {isLoading && (
              <DotsLoader
                color={theme.name == "light" ? "purple" : "lightPurple"}
                size={"large"}
              />
            )}
            {!isLoading && certValue && (
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  flexDirection: "column",
                }}
              >
                <div
                  style={{
                    height: 192,
                    width: 192,
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                  }}
                >
                  <QRCode
                    size={192}
                    style={{ height: "auto", maxWidth: "100%", width: "100%" }}
                    value={certValue}
                    viewBox={`0 0 192 192`}
                    bgColor={theme.background}
                    fgColor={theme.colors.contrastText}
                  />
                </div>
                <CertLinkWrapper>
                  <CertValue>{certValue}</CertValue>
                </CertLinkWrapper>
                <InstructionsWrapper>
                  <BlurbText>
                    <span dangerouslySetInnerHTML={tlsCertText()}></span>
                    <span style={{ marginTop: 18, display: "block" }}>
                      <a
                        style={{
                          color: theme.colors.linkColor,
                          fontWeight: 600,
                        }}
                      >
                        Read the docs on how to install TLS certs
                      </a>
                    </span>
                  </BlurbText>
                </InstructionsWrapper>
              </div>
            )}
          </Container>
        )}
      </>
    </RootCertModal>
  );
};

export default React.memo(CertModal);
