import React, { useEffect, useCallback, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import {
  AccountCreationSuccessAction,
  CompleteSignupAction,
  PassedLoginAction,
  useFetchGithubVerificationQuery,
} from "@floro/graphql-schemas/src/generated/main-client-graphql";
import SubPageLoader from "@floro/storybook/stories/common-components/SubPageLoader";
import WarningLabel from "@floro/storybook/stories/design-system/WarningLabel";
import SignupContainer from "@floro/common-react/src/components/signup/SignupContainer";
import { useDaemonIsConnected, useSocketEvent } from "@floro/common-react/src/pubsub/socket";
import { setClientSession } from "@floro/common-react/src/session/client-session";
import { useMutation } from "react-query";
import axios from "axios";
import PageWrapper from "../../../components/wrappers/PageWrapper";
import styled from "@emotion/styled";
import { useTheme } from "@emotion/react";
import Button from "@floro/storybook/stories/design-system/Button";
import { useRichText } from "../../../floro_listener/hooks/locales";
import { useIcon } from "../../../floro_listener/FloroIconsProvider";

const ContentWrapper = styled.div`
  width: 100%;
  min-height: 100dvh;
  background: ${(props) => props.theme.background};
  padding-top: 48px;
`;

const Row = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
`;

const DownloadSection = styled.div`
  width: 100%;
`;

const DownloadSectionHeader = styled.h3`
  padding: 0;
  margin: 0;
  font-family: "MavenPro";
  font-weight: 600;
  font-size: 1.2rem;
  margin-top: 48px;
  @media screen and (min-width: 768px) and (max-width: 1023px) {
    font-size: 1rem;
  }
  color: ${(props) => props.theme.colors.titleText};
`;

const DownloadRow = styled.div`
  width: 100%;
  display: flex;
  flex-direction: row;
  margin-top: 24px;
`;

const DownloadIcon = styled.img`
  height: 56px;
  cursor: pointer;
  border-radius: 8px;
  box-shadow: 0px 2px 8px 4px
    ${(props) => props.theme.colors.tooltipOuterShadowColor};
  transition: background-image 300ms, box-shadow 600ms;
  &:hover {
    box-shadow: 0px 0px 2px 2px
      ${(props) => props.theme.colors.tooltipOuterShadowColor};
  }
`;

const FloroText = styled.img`
  width: 100%;
`;

const NotInstalledSpan = styled.span`
  font-size: 1.2rem;
  font-family: "MavenPro";
  font-weight: 400;
  color: ${(props) => props.theme.colors.contrastText};
`;


const CredentialVerifyCallback = (): React.ReactElement => {
  const [searchParams] = useSearchParams();
  const verificationCode: string | null = searchParams.get("verification_code");
  const theme = useTheme();
  const navigate = useNavigate();

  const { data, error } = useFetchGithubVerificationQuery({
    variables: {
      verificationCode,
    },
  });

  useSocketEvent<PassedLoginAction>(
    "login",
    (payload) => {
      if (payload.session) {
        setClientSession(payload.session);
        navigate("/");
      }
    },
    [navigate]
  );

  const completeSignupMutation = useMutation(
    async (completeSignupInfo: CompleteSignupAction) => {
      try {
        await axios.post(
          "http://localhost:63403/complete_signup",
          completeSignupInfo
        );
        return true;
      } catch (e) {
        return false;
      }
    }
  );

  const loginMutation = useMutation(
    async (loginInfo: PassedLoginAction | AccountCreationSuccessAction) => {
      try {
        if (loginInfo.session) {
          setClientSession(loginInfo.session);
          await axios.post("http://localhost:63403/login", loginInfo);
          navigate("/");
        }
        return true;
      } catch (e) {
        return false;
      }
    }
  );

  useEffect(() => {
    if (data?.fetchGithubVerification?.type == "COMPLETE_SIGNUP") {
      completeSignupMutation.mutate(
        data?.fetchGithubVerification?.action as CompleteSignupAction
      );
    }
    if (data?.fetchGithubVerification?.type == "LOGIN") {
      loginMutation.mutate(
        data?.fetchGithubVerification?.action as PassedLoginAction
      );
    }
  }, [data?.fetchGithubVerification]);

  const isDaemonConnected = useDaemonIsConnected();

  const downloadDesktopText = useRichText("front_page.download_desktop_client");
  const [isHoveringMac, setIsHoveringMac] = useState(false);
  const macOSIcon = useIcon(
    "front-page.apple",
    isHoveringMac ? "hovered" : undefined
  );
  const [isHoveringWindows, setIsHoveringWindows] = useState(false);
  const windowsOSIcon = useIcon(
    "front-page.windows",
    isHoveringWindows ? "hovered" : undefined
  );
  const [isHoveringLinux, setIsHoveringLinux] = useState(false);
  const linuxOSIcon = useIcon(
    "front-page.linux",
    isHoveringLinux ? "hovered" : undefined
  );

  const floroText = useIcon("main.floro-text");

  useEffect(() => {
    if (!isDaemonConnected) {
      return;
    }
    if (data?.fetchGithubVerification?.type == "COMPLETE_SIGNUP") {
      completeSignupMutation.mutate(
        data?.fetchGithubVerification?.action as CompleteSignupAction
      );
    }
    if (data?.fetchGithubVerification?.type == "LOGIN") {
      loginMutation.mutate(
        data?.fetchGithubVerification?.action as PassedLoginAction
      );
    }
  }, [data?.fetchGithubVerification, isDaemonConnected]);

  const onOpenPage = useCallback(() => {
    if (data?.fetchGithubVerification?.type == "COMPLETE_SIGNUP") {
      completeSignupMutation.mutate(
        data?.fetchGithubVerification?.action as CompleteSignupAction
      );
    }
    if (data?.fetchGithubVerification?.type == "LOGIN") {
      loginMutation.mutate(
        data?.fetchGithubVerification?.action as PassedLoginAction
      );
    }
  }, [data?.fetchGithubVerification]);

  useSocketEvent(
    "logout-did-load",
    () => {
      if (data?.fetchGithubVerification?.type == "COMPLETE_SIGNUP") {
        completeSignupMutation.mutate(
          data?.fetchGithubVerification?.action as CompleteSignupAction
        );
      }
      if (data?.fetchGithubVerification?.type == "LOGIN") {
        loginMutation.mutate(
          data?.fetchGithubVerification?.action as PassedLoginAction
        );
      }
    },
    [data?.fetchGithubVerification],
    true
  );

  if (error) {
    return (
      <PageWrapper isCentered>
        <SubPageLoader hideLoad isNested>
          <div style={{ marginTop: 24 }}>
            <WarningLabel label="Server error" size={"large"} />
          </div>
        </SubPageLoader>
      </PageWrapper>
    );
  }

  if (!verificationCode || data?.fetchGithubVerification?.type == "NOT_FOUND") {
    return (
      <PageWrapper isCentered>
        <SubPageLoader hideLoad isNested>
          <div style={{ marginTop: 24 }}>
            <WarningLabel label="Invalid authorization code" size={"large"} />
          </div>
        </SubPageLoader>
      </PageWrapper>
    );
  }
  return (
    <PageWrapper isCentered>
      <ContentWrapper>
        <Row
          style={{ display: "flex", width: "100%", justifyContent: "center" }}
        >
          <div
            style={{
              alignSelf: "center",
              maxWidth: 300,
              width: "100%",
              marginLeft: "2.5%",
            }}
          >
            <FloroText src={floroText} />
          </div>
        </Row>
        {isDaemonConnected && (
          <>
            <Row style={{ marginTop: 48, justifyContent: "center" }}>
              <Button
                size="medium"
                label={"sign up in floro"}
                bg={"purple"}
                onClick={onOpenPage}
              />
            </Row>
          </>
        )}
        {!isDaemonConnected && (
          <>
            <Row
              style={{ justifyContent: "center", marginTop: 36, padding: 16 }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  maxWidth: 600,
                  width: "100%",
                  textAlign: "center",
                }}
              >
                <NotInstalledSpan
                  style={{ color: theme.colors.contrastText }}
                >
                  {
                    "It looks like floro isn't running or isn't installed yet. If you have the floro desktop app installed just open up the app. Otherwise, you can find a download link below."
                  }
                </NotInstalledSpan>
              </div>
            </Row>
            <Row>
              <DownloadSection style={{ textAlign: "center" }}>
                <DownloadSectionHeader>
                  {downloadDesktopText}
                </DownloadSectionHeader>
                <DownloadRow style={{ justifyContent: "center" }}>
                  <DownloadIcon
                    onMouseEnter={() => setIsHoveringMac(true)}
                    onMouseLeave={() => setIsHoveringMac(false)}
                    onTouchStart={() => setIsHoveringMac(true)}
                    onTouchEnd={() => setIsHoveringMac(false)}
                    src={macOSIcon}
                    style={{ marginRight: 18, marginLeft: 18 }}
                  />
                  <DownloadIcon
                    onMouseEnter={() => setIsHoveringLinux(true)}
                    onMouseLeave={() => setIsHoveringLinux(false)}
                    onTouchStart={() => setIsHoveringLinux(true)}
                    onTouchEnd={() => setIsHoveringLinux(false)}
                    style={{ marginRight: 18, marginLeft: 18 }}
                    src={linuxOSIcon}
                  />
                  <DownloadIcon
                    style={{ marginRight: 18, marginLeft: 18 }}
                    onMouseEnter={() => setIsHoveringWindows(true)}
                    onMouseLeave={() => setIsHoveringWindows(false)}
                    onTouchStart={() => setIsHoveringWindows(true)}
                    onTouchEnd={() => setIsHoveringWindows(false)}
                    src={windowsOSIcon}
                  />
                </DownloadRow>
              </DownloadSection>
            </Row>
          </>
        )}
      </ContentWrapper>
    </PageWrapper>
  );
};

export default CredentialVerifyCallback;
