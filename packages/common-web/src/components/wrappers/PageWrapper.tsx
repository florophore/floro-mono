import React, { useState } from "react";
import styled from "@emotion/styled";
import { useIcon } from "../../floro_listener/FloroIconsProvider";
import { useRichText } from "../../floro_listener/hooks/locales";
import Button from "@floro/storybook/stories/design-system/Button";
import { Link } from "react-router-dom";
import ColorPalette from "@floro/styles/ColorPalette";
import HamburgerToggle from "./HamburgerToggle";
import LanguageSelect from "./LanguageSelect";
import ThemeSwitcher from "./ThemeSwitcher";
import MobileLanguageSelectList from "./MobileLanguageSelectList";

const PageWrapper = styled.div`
  height: 100%;
  display: flex;
  flex-direction: column;
  flex: 1;
  width: 100%;
  height: 100vh;
  @supports (-webkit-touch-callout none) {
    height: 100dvh;
  }
  background: ${(props) => props.theme.background};
`;

const InnerContainer = styled.div`
  box-shadow: inset 0px -1px 3px ${(props) => props.theme.colors.tooltipInnerShadowColor};
  height: 100%;
  width: 100%;
  justify-content: center;
  display: flex;
`;

const PageNav = styled.nav`
  display: flex;
  flex-direction: row;
  background: ${(props) => props.theme.background};
  box-shadow: 0px 2px 6px 2px
    ${(props) => props.theme.colors.tooltipOuterShadowColor};
  position: relative;
  z-index: 2;
  @media screen and (min-width: 1024px) {
    height: 101px;
  }
  @media screen and (min-width: 768px) and (max-width: 1023px) {
    height: 72px;
  }
  @media screen and (max-width: 767px) {
    position: fixed;
    height: 56px;
    width: 100%;
  }
`;

const NavContent = styled.div`
  width: 100%;
  height: calc(100% - 6px);
  background: ${(props) => props.theme.background};
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
  @media screen and (max-width: 767px) {
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
  @media screen and (max-width: 767px) {
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
    padding-left: 24px;
  }
  @media screen and (max-width: 767px) {
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
  @media screen and (max-width: 767px) {
    display: flex;
  }
`;

const HeaderLinkText = styled.p`
  padding: 0;
  margin: 0;
  font-family: "MavenPro";
  font-weight: 600;
  font-size: 1.44rem;
  margin-right: 24px;
  color: ${(props) => props.theme.colors.contrastText};
  @media screen and (min-width: 768px) and (max-width: 1023px) {
    font-size: 1.2rem;
    margin-right: 18px;
  }
  @media screen and (max-width: 767px) {
    font-size: 1.7rem;
    margin: 12px 0;
    display: inline-block;
  }
  &:hover {
    color: ${(props) => props.theme.colors.linkColor};
    cursor: pointer;
  }
`;

const MainScrollWrapper = styled.div`
  position: relative;
  width: 100%;
  background: ${(props) => props.theme.background};
  display: flex;
  flex-grow: 1;
  flex-direction: column;
  align-self: center;
  overflow-y: scroll;
  @media screen and (max-width: 767px) {
    padding-top: 56px;
  }
`;

const MainContentLeftOffset = styled.main`
  position: relative;
  width: 100%;
  z-index: 0;
  display: flex;
  align-self: center;
  flex-direction: column;
  @media screen and (min-width: 1024px) {
    max-width: 1440px;
    padding-left: 120px;
  }
  @media screen and (min-width: 768px) and (max-width: 1023px) {
    max-width: 100%;
    padding-left: 72px;
  }
  @media screen and (max-width: 767px) {
    max-width: 100%;
  }
`;

const MainContent = styled.main`
  position: relative;
  width: 100%;
  z-index: 0;
  display: flex;
  align-self: center;
  flex-direction: column;
  @media screen and (min-width: 1024px) {
    max-width: 1440px;
  }
  @media screen and (min-width: 768px) and (max-width: 1023px) {
    max-width: 100%;
  }
  @media screen and (max-width: 767px) {
    max-width: 100%;
  }
`;

const Footer = styled.footer`
  padding: 32px;
  border-top: 1px solid
    ${(props) =>
      props.theme.name == "light"
        ? ColorPalette.lightGray
        : ColorPalette.darkerGray};
`;

const FooterText = styled.p`
  padding: 0;
  margin: 0;
  font-family: "MavenPro";
  font-weight: 400;
  font-size: 1rem;
  color: ${(props) => props.theme.colors.contrastTextLight};
`;

const FooterExtra = styled.div`
  @media screen and (min-width: 1024px) {
    height: 101px;
  }
  @media screen and (min-width: 768px) and (max-width: 1023px) {
    height: 72px;
  }
  @media screen and (max-width: 767px) {
    height: 56px;
  }
`;

const FooterPolicyText = styled.span`
  padding: 0;
  margin: 0;
  font-family: "MavenPro";
  font-weight: 400;
  font-size: 1rem;
  color: ${(props) => props.theme.colors.contrastTextLight};
  &:hover {
    color: ${(props) => props.theme.colors.linkColor};
    cursor: pointer;
  }
`;

const MobileDropDown = styled.div`
  width: 100%;
  position: absolute;
  left: 0;
  transition: opacity 300ms;
  background: ${(props) => props.theme.background};
  padding: 8px 48px;
  overflow-y: scroll;
  height: 100%;
  @media screen and (min-width: 1024px) {
    display: none;
    top: 100px;
    max-height: calc(100dvh - 100px);
  }

  @media screen and (min-width: 768px) and (max-width: 1023px) {
    display: none;
    top: 71px;
    max-height: calc(100dvh - 71px);
  }
  @media screen and (max-width: 767px) {
    display: flex;
    flex-direction: column;
    top: 55px;
    max-height: calc(100dvh - 55px);
    z-index: 1;
  }
`;

const BottomContainer =styled.div`
  margin-top: 96px;
  display: flex;
  flex-grow: 1;
  flex-direction: column;
`;


const AppearanceText = styled.span`
  padding: 0;
  margin: 0;
  font-family: "MavenPro";
  font-weight: 500;
  font-size: 1.2rem;
  color: ${(props) => props.theme.colors.titleText};
`;

const Row =styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;
`;

interface Props {
  children: React.ReactElement | React.ReactElement[];
  isCentered?: boolean;
}

const PageWrapperComponent = (props: Props) => {
  const floroRound = useIcon("front-page.floro-round");
  const aboutText = useRichText("front_page.nav_about");
  const docsText = useRichText("front_page.nav_docs");
  const pricingText = useRichText("front_page.nav_pricing");
  const fossText = useRichText("front_page.nav_foss");
  const consultingText = useRichText("front_page.nav_consulting");
  const downloadText = useRichText("front_page.nav_download");
  const copyrightText = useRichText("components.copyright");
  const releasedUnderMITText = useRichText("components.released_under_mit");
  const privacyPolicy = useRichText("components.privacy_policy");
  const termsOfService = useRichText("components.terms_of_service");
  const appearanceText = useRichText("front_page.appearance");

  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <PageWrapper>
      <PageNav>
        <InnerContainer>
          <NavContent>
            <Link to={"/"}>
              <NavIcon src={floroRound} />
            </Link>
            <NavData>
              <MobileNavInfo
                style={{
                  justifyContent: "flex-end",
                  alignItems: "center",
                  paddingRight: 8,
                }}
              >
                <MobileLanguageSelectList />
                <HamburgerToggle
                  isOpen={isExpanded}
                  setIsOpen={setIsExpanded}
                />
              </MobileNavInfo>
              <LargeNavInfo>
                <LargeNavMainContainer>
                  <Link to={"/about"}>
                    <HeaderLinkText>{aboutText}</HeaderLinkText>
                  </Link>
                  <Link to={"/docs"}>
                    <HeaderLinkText>{docsText}</HeaderLinkText>
                  </Link>
                  <Link to={"/pricing"}>
                    <HeaderLinkText>{pricingText}</HeaderLinkText>
                  </Link>
                  <HeaderLinkText>{fossText}</HeaderLinkText>
                  <HeaderLinkText>{consultingText}</HeaderLinkText>
                </LargeNavMainContainer>
                <div
                  style={{
                    display: "flex",
                    flexDirection: "row",
                    alignItems: "center",
                  }}
                >
                  <ThemeSwitcher />
                  <LanguageSelect />
                  <div style={{ width: 120 }}>
                    <Button size="small" label={downloadText} bg={"orange"} />
                  </div>
                </div>
              </LargeNavInfo>
            </NavData>
          </NavContent>
        </InnerContainer>
      </PageNav>
      <MobileDropDown
        style={{
          pointerEvents: isExpanded ? "all" : "none",
          opacity: isExpanded ? 1 : 0,
        }}
      >
        <div style={{ marginTop: 24 }}>
          <div>
            <Link to={"/about"}>
              <HeaderLinkText>{aboutText}</HeaderLinkText>
            </Link>
          </div>
          <div>
            <Link to={"/docs"}>
              <HeaderLinkText>{docsText}</HeaderLinkText>
            </Link>
          </div>
          <div>
            <HeaderLinkText>{pricingText}</HeaderLinkText>
          </div>
          <div>
            <HeaderLinkText>{fossText}</HeaderLinkText>
          </div>
          <div>
            <HeaderLinkText>{consultingText}</HeaderLinkText>
          </div>
        </div>
        <Row style={{ marginTop: 36 }}>
          <AppearanceText style={{ marginTop: -4, marginRight: 12 }}>
            {appearanceText}
          </AppearanceText>
          <ThemeSwitcher />
        </Row>
        <BottomContainer>
          <Button
            style={{ alignSelf: "center" }}
            size="big"
            label={downloadText}
            bg={"orange"}
          />
        </BottomContainer>
        <BottomContainer style={{ justifyContent: "flex-end" }}>
          <Footer>
            <div style={{ textAlign: "center" }}>
              <FooterText style={{ marginTop: 0 }}>
                <Link to={"/privacy"}>
                  <FooterPolicyText>{privacyPolicy}</FooterPolicyText>
                </Link>
                <span
                  style={{
                    marginLeft: 12,
                    marginRight: 12,
                  }}
                >
                  {"|"}
                </span>
                <Link to={"/tos"}>
                  <FooterPolicyText>{termsOfService}</FooterPolicyText>
                </Link>
              </FooterText>
              <FooterText style={{ marginTop: 12 }}>
                {releasedUnderMITText}
              </FooterText>
              <FooterText style={{ marginTop: 12 }}>{copyrightText}</FooterText>
            </div>
            <FooterExtra />
          </Footer>
        </BottomContainer>
      </MobileDropDown>
      <MainScrollWrapper>
        {props.isCentered && <MainContent>{props.children}</MainContent>}
        {!props.isCentered && (
          <MainContentLeftOffset>{props.children}</MainContentLeftOffset>
        )}
        <Footer>
          <div style={{ textAlign: "center" }}>
            <FooterText style={{ marginTop: 0 }}>
              <Link to={"/privacy"}>
                <FooterPolicyText>{privacyPolicy}</FooterPolicyText>
              </Link>
              <span
                style={{
                  marginLeft: 12,
                  marginRight: 12,
                }}
              >
                {"|"}
              </span>
              <Link to={"/tos"}>
                <FooterPolicyText>{termsOfService}</FooterPolicyText>
              </Link>
            </FooterText>
            <FooterText style={{ marginTop: 12 }}>
              {releasedUnderMITText}
            </FooterText>
            <FooterText style={{ marginTop: 12 }}>{copyrightText}</FooterText>
          </div>
          <FooterExtra />
        </Footer>
      </MainScrollWrapper>
    </PageWrapper>
  );
};

export default React.memo(PageWrapperComponent);
