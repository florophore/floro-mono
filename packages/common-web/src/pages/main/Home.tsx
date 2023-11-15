import { useMemo, useState } from "react";
import styled from "@emotion/styled";
import {  useIcon } from '../../floro_listener/FloroIconsProvider';
import { useTheme} from "@emotion/react";
import { usePlainText, useRichText } from "../../floro_listener/hooks/locales";
import {Helmet} from "react-helmet";
import Button from "@floro/storybook/stories/design-system/Button";
import ScreenShotLight from "@floro/main/public/pngs/light.no_edge.png";
import ScreenShotDark from "@floro/main/public/pngs/dark.no_edge.png";
import CLICopy from "../../components/home/CLICopy";

const HomeWrapper = styled.div`
  height: 100%;
  display: flex;
  flex-direction: column;
  flex: 1;
  width: 100%;
  height: 100vh;
  background: ${props => props.theme.background};
`;

const InnerContainer = styled.div`
  box-shadow: inset 0px -1px 3px
    ${(props) => props.theme.colors.tooltipInnerShadowColor};
  height: 100%;
  width: 100%;
  justify-content: center;
  display: flex;
`;

const HomeNav = styled.nav`
  display: flex;
  flex-direction: row;
  background: ${props => props.theme.background};
  box-shadow: 0px 2px 6px 2px ${props => props.theme.colors.tooltipOuterShadowColor};
  position: relative;
  z-index: 1;
  @media screen and (min-width: 1024px) {
    height: 101px;
  }
  @media screen and (min-width: 768px) and (max-width: 1023px) {
    height: 72px;
  }
  @media screen and (max-width: 767px){
    height: 56px;
  }
`;

const NavContent = styled.div`
  width: 100%;
  height: calc(100% - 6px);
  background: ${props => props.theme.background};
  display: flex;
  flex-direction: row;
  align-items: center;
  padding: 19px 16px 16px 16px;
  @media screen and (min-width: 1024px) {
    max-width: 1440px;
    padding: 19px 16px 16px 16px;
  }
  @media screen and (min-width: 768px) and (max-width: 1023px) {
    max-width: 100%;
    padding: 10px 8px 8px 8px;
  }
  @media screen and (max-width: 767px){
    max-width: 100%;
    padding: 7px 4px 4px 4px;
  }
`;

const NavData = styled.div`
  display: flex;
  flex-direction: row;
  height: 100%;
  flex-grow: 1;
`;

const NavIcon = styled.img`
  @media screen and (min-width: 1024px) {
    height: 72px;
  }
  @media screen and (min-width: 768px) and (max-width: 1023px) {
    height: 56px;
  }
  @media screen and (max-width: 767px){
    height: 40px;
  }
`;

const LargeNavInfo = styled.div`
  flex-direction: row;
  height: 100%;
  width: 100%;
  padding-left: 48px;
  align-items: center;
  justify-content: space-between;
  @media screen and (min-width: 1024px) {
    display: flex;
  }
  @media screen and (min-width: 768px) and (max-width: 1023px) {
    display: flex;
  }
  @media screen and (max-width: 767px){
    display: none;
  }
`;

const LargeNavMainContainer = styled.div`
  display: flex;
  flex-direction: row;
  height: 100%;
  align-items: center;
`;

const MobileNavInfo = styled.div`
  flex-direction: row;
  height: 100%;
  width: 100%;
  @media screen and (min-width: 1024px) {
    display: none;
  }
  @media screen and (min-width: 768px) and (max-width: 1023px) {
    display: none;
  }
  @media screen and (max-width: 767px){
    display: flex;
  }
`;

const HeaderLinkText = styled.p`
  padding: 0;
  margin: 0;
  font-family: "MavenPro";
  font-weight: 600;
  font-size: 1.44rem;
  @media screen and (min-width: 768px) and (max-width: 1023px) {
  font-size: 1.2rem;
  }
  color: ${props => props.theme.colors.contrastText};
  &:hover {
    color: ${props => props.theme.colors.linkColor};
    cursor: pointer;
  }
`;

const MainScrollWrapper = styled.div`
  position: relative;
  width: 100%;
  background: ${props => props.theme.background};
  display: flex;
  flex-grow: 1;
  flex-direction: column;
  align-self: center;
  overflow-y: scroll;
`;

const HomeContent = styled.main`
  position: relative;
  width: 100%;
  z-index: 0;
  display: flex;
  align-self: center;
  @media screen and (min-width: 1024px) {
    max-width: 1440px;
    padding-left: 120px;
  }
  @media screen and (min-width: 768px) and (max-width: 1023px) {
    max-width: 100%;
    padding-left: 72px;
  }
  @media screen and (max-width: 767px){
    max-width: 100%;
  }
`;

const LargeTopSection = styled.section`
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  z-index: 0;
  @media screen and (max-width: 767px){
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
  height: 300px;
  box-sizing: border-box;
  padding-right: 8px;
  max-width: 40%;
`;

const RightColumn = styled.div`
  height: 552px;
  width: 60%;
  position: relative;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  @media screen and (min-width: 1440px) {
    height: 540px;
  }
  @media screen and (min-width: 768px) and (max-width: 1439px) {
    width: 50%;
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
  box-shadow: 0px 4px 16px 12px ${props => props.theme.colors.tooltipOuterShadowColor};
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
  color: ${props => props.theme.colors.contrastText};
  @media screen and (max-width: 767px){
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
  color: ${props => props.theme.colors.contrastText};
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
  color: ${props => props.theme.colors.titleText};
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
  box-shadow: 0px 2px 8px 4px ${props => props.theme.colors.tooltipOuterShadowColor};
  transition: background-image 300ms, box-shadow 600ms;
  &:hover {
    box-shadow: 0px 0px 2px 2px ${props => props.theme.colors.tooltipOuterShadowColor};
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
  color: ${props => props.theme.colors.titleText};
`;


function Home() {
  const theme = useTheme();
  const floroRound = useIcon("front-page.floro-round");
  const floroText = useIcon("main.floro-text");
  const frontPageBackdrop = useIcon("front-page.front-page-backdrop");
  const aboutText = useRichText("front_page.nav_about");
  const docsText = useRichText("front_page.nav_docs");
  const pricingText = useRichText("front_page.nav_pricing");
  const fossText = useRichText("front_page.nav_foss");
  const consultingText = useRichText("front_page.nav_consulting");
  const downloadText = useRichText("front_page.nav_download");
  const tagLine = useRichText("front_page.tag_line");
  const subTextTagLine = useRichText("front_page.subtext_of_tag_line");
  const downloadDesktopText = useRichText("front_page.download_desktop_client");
  const [isHoveringMac, setIsHoveringMac] = useState(false);
  const macOSIcon = useIcon("front-page.apple", isHoveringMac ? "hovered" : undefined);
  const [isHoveringWindows, setIsHoveringWindows] = useState(false);
  const windowsOSIcon = useIcon("front-page.windows", isHoveringWindows ? "hovered" : undefined);
  const [isHoveringLinux, setIsHoveringLinux] = useState(false);
  const linuxOSIcon = useIcon("front-page.linux", isHoveringLinux ? "hovered" : undefined);

  const screenShot = useMemo(() => {
    if (theme.name == 'dark') {
      return ScreenShotDark;
    }
    return ScreenShotLight;
  }, [theme.name])

  return (
    <HomeWrapper>
      <Helmet>
        <title>
          {'Floro'}
        </title>
      </Helmet>
      <HomeNav>
        <InnerContainer>
          <NavContent>
            <NavIcon src={floroRound} />
            <NavData>
              <MobileNavInfo></MobileNavInfo>
              <LargeNavInfo>
                <LargeNavMainContainer>
                  <HeaderLinkText>{aboutText}</HeaderLinkText>
                  <HeaderLinkText style={{ marginLeft: 24 }}>
                    {docsText}
                  </HeaderLinkText>
                  <HeaderLinkText style={{ marginLeft: 24 }}>
                    {pricingText}
                  </HeaderLinkText>
                  <HeaderLinkText style={{ marginLeft: 24 }}>
                    {fossText}
                  </HeaderLinkText>
                  <HeaderLinkText style={{ marginLeft: 24 }}>
                    {consultingText}
                  </HeaderLinkText>
                </LargeNavMainContainer>
                <Button size="small" label={downloadText} bg={"orange"} />
              </LargeNavInfo>
            </NavData>
          </NavContent>
        </InnerContainer>
      </HomeNav>
      <MainScrollWrapper>
        <HomeContent>
          <MobileTopSection
          >
            <div style={{
              padding: 8
            }}>
              <TagLine>{tagLine}</TagLine>
              <SubTextTagLine>{subTextTagLine}</SubTextTagLine>
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
            <div style={{ padding: 8, display: 'flex', alignItems: 'center', flexDirection: 'column', width: '100%'}}>
              <DownloadSection style={{textAlign: 'center'}}>
                <DownloadSectionHeader>
                  {downloadDesktopText}
                </DownloadSectionHeader>
                <DownloadRow style={{justifyContent: 'center'}}>
                  <DownloadIcon
                    onMouseEnter={() => setIsHoveringMac(true)}
                    onMouseLeave={() => setIsHoveringMac(false)}
                    src={macOSIcon}
                    style={{marginRight: 18, marginLeft: 18}}
                  />
                  <DownloadIcon
                    onMouseEnter={() => setIsHoveringLinux(true)}
                    onMouseLeave={() => setIsHoveringLinux(false)}
                    style={{marginRight: 18, marginLeft: 18}}
                    src={linuxOSIcon} />
                  <DownloadIcon
                    style={{marginRight: 18, marginLeft: 18}}
                    onMouseEnter={() => setIsHoveringWindows(true)}
                    onMouseLeave={() => setIsHoveringWindows(false)}
                    src={windowsOSIcon} />
                </DownloadRow>
              </DownloadSection>

            </div>
            <div style={{ padding: 8, display: 'flex', alignItems: 'center', flexDirection: 'column', width: '100%'}}>
              <InstallCLISection style={{textAlign: 'center'}}>
                <InstallCLISectionHeader>{'install the cli'}</InstallCLISectionHeader>
                <div style={{marginTop: 24, width: '100%', display: 'flex', flexDirection: 'row', justifyContent: 'center'}}>
                  <div style={{ maxWidth: 320, width: '100%'}}>
                    <CLICopy/>
                  </div>
                </div>
              </InstallCLISection>

            </div>


          </MobileTopSection>
          <LargeTopSection>
            <LeftColumn>
              <TagLine>{tagLine}</TagLine>
              <SubTextTagLine>{subTextTagLine}</SubTextTagLine>
              <DownloadSection>
                <DownloadSectionHeader>
                  {downloadDesktopText}
                </DownloadSectionHeader>
                <DownloadRow>
                  <DownloadIcon
                    onMouseEnter={() => setIsHoveringMac(true)}
                    onMouseLeave={() => setIsHoveringMac(false)}
                    src={macOSIcon}
                    style={{marginRight: 24}}
                  />
                  <DownloadIcon
                    onMouseEnter={() => setIsHoveringLinux(true)}
                    onMouseLeave={() => setIsHoveringLinux(false)}
                    style={{marginRight: 24}}
                  src={linuxOSIcon} />
                  <DownloadIcon
                    onMouseEnter={() => setIsHoveringWindows(true)}
                    onMouseLeave={() => setIsHoveringWindows(false)}
                  src={windowsOSIcon} />
                </DownloadRow>
              </DownloadSection>
              <InstallCLISection>
                <InstallCLISectionHeader>{'install the cli'}</InstallCLISectionHeader>
                <div style={{marginTop: 24, maxWidth: 320}}>
                  <CLICopy/>
                </div>
              </InstallCLISection>
            </LeftColumn>
            <RightColumn
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
            </RightColumn>
          </LargeTopSection>
        </HomeContent>
      </MainScrollWrapper>
    </HomeWrapper>
  );
}

export default Home;