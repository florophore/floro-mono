import { useMemo, useState } from "react";
import styled from "@emotion/styled";
import { useIcon } from "../../floro_listener/FloroIconsProvider";
import { useTheme } from "@emotion/react";
import { useRichText } from "../../floro_listener/hooks/locales";
import { Helmet } from "react-helmet";
import ScreenShotLight from "@floro/main/public/pngs/light.no_edge.png";
import ScreenShotDark from "@floro/main/public/pngs/dark.no_edge.png";
import CLICopy from "../../components/home/CLICopy";
import PageWrapper from "../../components/wrappers/PageWrapper";
import { Link } from "react-router-dom";
import ColorPalette from "@floro/styles/ColorPalette";

const LargeTopSection = styled.section`
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  z-index: 0;
  @media screen and (max-width: 767px) {
    display: none;
  }
`;

const MobileTopSection = styled.section`
  display: flex;
  flex-direction: column;
  z-index: 0;
  @media screen and (min-width: 768px) {
    display: none;
  }
`;

const LeftColumn = styled.div`
  padding: 16px;
  flex-grow: 1;
  box-sizing: border-box;
  padding-right: 8px;
  max-width: 40%;
`;

const RightColumn = styled.div`
  width: 60%;
  position: relative;
  display: flex;
  flex-direction: column;
  @media screen and (min-width: 768px) and (max-width: 1439px) {
    width: 50%;
  }
`;
//const RightColumn = styled.div`
//  height: 552px;
//  width: 60%;
//  position: relative;
//  display: flex;
//  flex-direction: column;
//  justify-content: center;
//  align-items: center;
//  @media screen and (min-width: 1440px) {
//    height: 540px;
//  }
//  @media screen and (min-width: 768px) and (max-width: 1439px) {
//    width: 50%;
//    height: 32vw;
//    min-height: 300px;
//  }
//`;

const RightColumnContent = styled.div`
  height: 552px;
  width: 100%;
  position: relative;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  @media screen and (min-width: 1440px) {
    height: 540px;
  }
  @media screen and (min-width: 768px) and (max-width: 1439px) {
    height: 32vw;
    min-height: 300px;
  }
`;

const MobileScreenShotBox = styled.div`
  width: 100%;
  height: 80vw;
  position: relative;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  margin-top: 24px;
`;

const ScreenShotWrapper = styled.div`
  width: 70%;
  align-self: center;
  @media screen and (min-width: 768px) and (max-width: 1023px) {
    width: 80%;
  }
`;

const ScreenShot = styled.img`
  width: 100%;
  border-radius: 4px;
  box-shadow: 0px 4px 16px 12px
    ${(props) => props.theme.colors.tooltipOuterShadowColor};
`;

const FloroText = styled.img`
  width: 100%;
`;

const TagLine = styled.h1`
  padding: 0;
  margin: 0;
  font-family: "MavenPro";
  font-weight: 600;
  font-size: 2.4rem;
  margin-top: 15%;
  @media screen and (min-width: 768px) and (max-width: 1023px) {
    font-size: 1.9rem;
  }
  color: ${(props) => props.theme.colors.contrastText};
  @media screen and (max-width: 767px) {
    margin-top: 24px;
  }
`;

const SubTextTagLine = styled.h4`
  padding: 0;
  margin: 0;
  font-family: "MavenPro";
  font-weight: 400;
  font-size: 1.2rem;
  margin-top: 24px;
  @media screen and (min-width: 768px) and (max-width: 1023px) {
    font-size: 1rem;
  }
  color: ${(props) => props.theme.colors.contrastText};
`;


const DemoLink = styled.h4`
  padding: 0;
  margin: 0;
  font-family: "MavenPro";
  font-weight: 600;
  font-size: 1.44rem;
  margin-top: 24px;
  @media screen and (min-width: 768px) and (max-width: 1023px) {
    font-size: 1.2rem;
  }
  @media screen and (max-width: 767px) {
    text-align: center;
    font-size: 1.2rem;
  }
  color: ${(props) => props.theme.colors.linkColor};
  cursor: pointer;
  text-decoration: underline;
`;

const TechnicalOverviewLink = styled.h4`
  padding: 0;
  margin: 0;
  font-family: "MavenPro";
  font-weight: 600;
  font-size: 1.44rem;
  margin-top: 24px;
  @media screen and (min-width: 768px) and (max-width: 1023px) {
    font-size: 1.2rem;
  }
  @media screen and (max-width: 767px) {
    text-align: center;
    font-size: 1.2rem;
  }
  color: ${(props) => props.theme.colors.linkColor};
  cursor: pointer;
  text-decoration: underline;
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

const InstallCLISection = styled.div`
  width: 100%;
`;

const InstallCLISectionHeader = styled.h3`
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

const FlatIcon = styled.img`
  height: 56px;
  cursor: pointer;
  transition: background-image 300ms;
`;


function Home() {
  const theme = useTheme();
  const floroText = useIcon("main.floro-text");
  const frontPageBackdrop = useIcon("front-page.front-page-backdrop");
  const tagLine = useRichText("front_page.tag_line");
  const subTextTagLine = useRichText("front_page.subtext_of_tag_line");
  const downloadDesktopText = useRichText("front_page.download_desktop_client");
  const installTheChromeExtension = useRichText("front_page.install_the_chrome_extension");
  const installCliText = useRichText("front_page.install_the_cli");
  const getHelpAndContributeText = useRichText(
    "front_page.get_help_and_contribute"
  );

  const seeADemo = useRichText(
    "front_page.see_a_demo"
  );

  const readTechnicalOverview = useRichText(
    "front_page.read_technical_overview"
  );

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

  const [isHoveringDiscord, setIsHoveringDiscord] = useState(false);
  const discordIcon = useIcon(
    "front-page.discord",
    isHoveringDiscord ? "hovered" : undefined
  );

  const [isHoveringGithub, setIsHoveringGithub] = useState(false);
  const githubIcon = useIcon(
    "front-page.github",
    isHoveringGithub ? "hovered" : undefined
  );

  const [isHoveringChrome, setIsHoveringChrome] = useState(false);
  const chromeIcon = useIcon(
    "front-page.chrome",
    isHoveringChrome ? "hovered" : undefined
  );

  const screenShot = useMemo(() => {
    if (theme.name == "dark") {
      return ScreenShotDark;
    }
    return ScreenShotLight;
  }, [theme.name]);

  return (
    <PageWrapper>
      <Helmet>
        <title>{"Floro"}</title>
      </Helmet>
      <MobileTopSection>
        <div
          style={{
            padding: 8,
          }}
        >
          <TagLine>{tagLine}</TagLine>
          <SubTextTagLine>{subTextTagLine}</SubTextTagLine>
          <DemoLink>{seeADemo}</DemoLink>
          <Link to={'/technical-overview-part-1'}>
            <TechnicalOverviewLink>{readTechnicalOverview}</TechnicalOverviewLink>
          </Link>
        </div>
        <MobileScreenShotBox
          style={{
            backgroundImage: `url( '${frontPageBackdrop}' )`,
            backgroundSize: "cover",
          }}
        >
          <ScreenShotWrapper>
            <ScreenShot src={screenShot} />
          </ScreenShotWrapper>
          <div
            style={{
              alignSelf: "center",
              width: "40%",
              position: "absolute",
              marginLeft: "6%",
              bottom: "-10%",
            }}
          >
            <FloroText src={floroText} />
          </div>
        </MobileScreenShotBox>
        <div
          style={{
            padding: 8,
            display: "flex",
            alignItems: "center",
            flexDirection: "column",
            width: "100%",
          }}
        >
          <DownloadSection style={{ textAlign: "center" }}>
            <DownloadSectionHeader>{downloadDesktopText}</DownloadSectionHeader>
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
        </div>
        <div
          style={{
            padding: 8,
            display: "flex",
            alignItems: "center",
            flexDirection: "column",
            width: "100%",
          }}
        >
          <InstallCLISection style={{ textAlign: "center" }}>
            <InstallCLISectionHeader>{installCliText}</InstallCLISectionHeader>
            <div
              style={{
                marginTop: 24,
                width: "100%",
                display: "flex",
                flexDirection: "row",
                justifyContent: "center",
              }}
            >
              <div style={{ maxWidth: 320, width: "100%" }}>
                <CLICopy />
              </div>
            </div>
          </InstallCLISection>
          <div
            style={{
              padding: 8,
              display: "flex",
              alignItems: "center",
              flexDirection: "column",
              width: "100%",
            }}
          >
            <DownloadSection style={{ textAlign: "center" }}>
              <InstallCLISectionHeader>
                {installTheChromeExtension}
              </InstallCLISectionHeader>
              <DownloadRow style={{ justifyContent: "center" }}>
              <a href="chrome://extensions" target="_blank">
                <FlatIcon
                  onMouseEnter={() => setIsHoveringChrome(true)}
                  onMouseLeave={() => setIsHoveringChrome(false)}
                  src={chromeIcon}
                />
              </a>
              </DownloadRow>
            </DownloadSection>
          </div>
          <div
            style={{
              padding: 8,
              display: "flex",
              alignItems: "center",
              flexDirection: "column",
              width: "100%",
            }}
          >
            <DownloadSection style={{ textAlign: "center", marginTop: 0 }}>
              <InstallCLISectionHeader style={{marginTop: 0}}>
                {getHelpAndContributeText}
              </InstallCLISectionHeader>
              <DownloadRow style={{ justifyContent: "center" }}>

              <a href="https://github.com/florophore/floro" target="_blank">
                <FlatIcon
                  onMouseEnter={() => setIsHoveringGithub(true)}
                  onMouseLeave={() => setIsHoveringGithub(false)}
                  src={githubIcon}
                  style={{ marginRight: 24 }}
                />
              </a>
              <a href={"https://discord.gg/VJ8Mhjd9Gw"} target="_blank">
                <FlatIcon
                  onMouseEnter={() => setIsHoveringDiscord(true)}
                  onMouseLeave={() => setIsHoveringDiscord(false)}
                  src={discordIcon}
                />
              </a>
              </DownloadRow>
            </DownloadSection>
          </div>
        </div>
      </MobileTopSection>
      <LargeTopSection>
        <LeftColumn>
          <TagLine>{tagLine}</TagLine>
          <SubTextTagLine>{subTextTagLine}</SubTextTagLine>
          <DownloadSection>
            <DownloadSectionHeader>{downloadDesktopText}</DownloadSectionHeader>
            <DownloadRow>
              <DownloadIcon
                onMouseEnter={() => setIsHoveringMac(true)}
                onMouseLeave={() => setIsHoveringMac(false)}
                src={macOSIcon}
                style={{ marginRight: 24 }}
              />
              <DownloadIcon
                onMouseEnter={() => setIsHoveringLinux(true)}
                onMouseLeave={() => setIsHoveringLinux(false)}
                style={{ marginRight: 24 }}
                src={linuxOSIcon}
              />
              <DownloadIcon
                onMouseEnter={() => setIsHoveringWindows(true)}
                onMouseLeave={() => setIsHoveringWindows(false)}
                src={windowsOSIcon}
              />
            </DownloadRow>
          </DownloadSection>
          <InstallCLISection>
            <InstallCLISectionHeader>{installCliText}</InstallCLISectionHeader>
            <div style={{ marginTop: 24, maxWidth: 320 }}>
              <CLICopy />
            </div>
          </InstallCLISection>
          <DownloadSection>
            <DownloadSectionHeader>{installTheChromeExtension}</DownloadSectionHeader>
            <DownloadRow>
              <a href="chrome://extensions" target="_blank">
                <FlatIcon
                  onMouseEnter={() => setIsHoveringChrome(true)}
                  onMouseLeave={() => setIsHoveringChrome(false)}
                  src={chromeIcon}
                  style={{
                    marginRight: 24,
                  }}
                />
              </a>
            </DownloadRow>
          </DownloadSection>
          <DownloadSection>
            <InstallCLISectionHeader style={{marginTop: 24}}>
              {getHelpAndContributeText}
            </InstallCLISectionHeader>
            <DownloadRow>
              <a href="https://github.com/florophore/floro" target="_blank">
                <FlatIcon
                  onMouseEnter={() => setIsHoveringGithub(true)}
                  onMouseLeave={() => setIsHoveringGithub(false)}
                  src={githubIcon}
                  style={{ marginRight: 24 }}
                />
              </a>
              <a href={"https://discord.gg/VJ8Mhjd9Gw"} target="_blank">
                <FlatIcon
                  onMouseEnter={() => setIsHoveringDiscord(true)}
                  onMouseLeave={() => setIsHoveringDiscord(false)}
                  src={discordIcon}
                />
              </a>
            </DownloadRow>
          </DownloadSection>
        </LeftColumn>
        <RightColumn>
          <RightColumnContent
            style={{
              backgroundImage: `url( '${frontPageBackdrop}' )`,
              backgroundSize: "cover",
            }}
          >
            <ScreenShotWrapper>
              <ScreenShot src={screenShot} />
            </ScreenShotWrapper>
            <div
              style={{
                alignSelf: "center",
                width: "40%",
                position: "absolute",
                marginLeft: "10%",
                bottom: "-10%",
              }}
            >
              <FloroText src={floroText} />
            </div>
          </RightColumnContent>
          <div style={{marginTop: 48, marginLeft: '5%', display: 'flex', alignItems: 'center', flexDirection: 'column'}}>
            <DemoLink>{seeADemo}</DemoLink>
            <Link to={'/technical-overview-part-1'}>
              <TechnicalOverviewLink>{readTechnicalOverview}</TechnicalOverviewLink>
            </Link>
          </div>
        </RightColumn>
      </LargeTopSection>
      <div style={{ height: 300 }}></div>
    </PageWrapper>
  );
}

export default Home;
