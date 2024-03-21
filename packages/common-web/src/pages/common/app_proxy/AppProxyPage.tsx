import React, { useState, useMemo, useCallback, useEffect } from 'react'
import {Helmet} from "react-helmet";
import { useLocation } from "react-router-dom";
import Button from '@floro/storybook/stories/design-system/Button';
import { useDaemonIsConnected, useFloroSocket } from '@floro/common-react/src/pubsub/socket';
import PageWrapper from '../../../components/wrappers/PageWrapper';
import styled from "@emotion/styled";
import { useTheme } from "@emotion/react";
import { useRichText } from '../../../floro_listener/hooks/locales';
import { useIcon } from '../../../floro_listener/FloroIconsProvider';

const ContentWrapper = styled.div`
  width: 100%;
  min-height: 100dvh;
  background: ${(props) => props.theme.background};
  padding-top: 48px;
`;

const Container = styled.div`
  display: flex;
  flex-direction: column;
  border-radius: 8px;
  width: 100%;
  box-sizing: border-box;
`;

const TitleSpan = styled.span`
  font-size: 1.4rem;
  font-family: "MavenPro";
  font-weight: 600;
  color: ${(props) => props.theme.colors.titleText};
  white-space: nowrap;
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

function AppProxyPage(): React.ReactElement {

    const theme = useTheme();
    const location = useLocation();
    const redirectLink = useMemo(() => {
        const rawRoutePart = location.pathname.replace("/app-proxy", "");
        return (rawRoutePart == "" ? "/" : rawRoutePart) + location.search;
    }, [location.pathname, location.search]);

    const isDaemonConnected = useDaemonIsConnected();
    const { socket } = useFloroSocket();


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

    const onOpenPage = useCallback(() => {
        if (!isDaemonConnected) {
            return;
        }
        socket?.emit("open-event", {redirectLink})

    }, [isDaemonConnected, redirectLink]);

    const isSafari = useMemo(() => {
      return /^((?!chrome|android).)*safari/i.test(navigator.userAgent);
    }, [])

    useEffect(() => {
      onOpenPage();
    }, [onOpenPage])

  return (
    <PageWrapper isCentered>
      <Helmet>
        <title>{"Floro | Open " + redirectLink}</title>
      </Helmet>
      <ContentWrapper>
        <Row
          style={{ display: "flex", width: "100%", justifyContent: "center" }}
        >
          <div
            style={{
              alignSelf: "center",
              maxWidth: 300,
              width: "100%",
              marginLeft: '2.5%'
            }}
          >
            <FloroText src={floroText} />
          </div>
        </Row>
        <Row style={{ justifyContent: "center", marginTop: 24 }}>
          <span
            style={{
              display: "flex",
              alignItems: "center",
              padding: 16,
              wordBreak: "break-all"
            }}
          >
            <TitleSpan style={{ color: theme.colors.contrastTextLight }}>
              {"Redirect to page: " + " "}
            </TitleSpan>
            <TitleSpan
              style={{
                fontWeight: 500,
                wordWrap: "break-word",
                display: "block",
                whiteSpace: "normal",
                marginLeft: 8,
              }}
            >
              {redirectLink}
            </TitleSpan>
          </span>
        </Row>
        {isDaemonConnected && (
          <Row style={{ marginTop: 48, justifyContent: "center" }}>
            <Button
              onClick={onOpenPage}
              size="medium"
              label={"open in floro"}
              bg={"purple"}
            />
          </Row>
        )}
        {!isDaemonConnected && (
          <>
            <Row style={{ justifyContent: "center", marginTop: 36, padding: 16 }}>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  maxWidth: 600,
                  width: "100%",
                  textAlign: 'center'
                }}
              >
                {isSafari && (
                  <NotInstalledSpan style={{ color: theme.colors.contrastText }}>
                    {
                      "The Safari browser cannot connect to floro. Please open this link in a different browser to access it in floro. If you know someone at Apple who works on the Safari browser, please inform them that it makes no sense to enforce SSL restrictions on web requests to a local web server."
                    }
                  </NotInstalledSpan>
                )}
                {!isSafari && (
                  <NotInstalledSpan style={{ color: theme.colors.contrastText }}>
                    {
                      "It looks like floro isn't running or isn't installed yet. If you have the floro desktop app installed just open up the app. Otherwise, you can find a download link below."
                    }
                  </NotInstalledSpan>
                )}
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
}

export default AppProxyPage;