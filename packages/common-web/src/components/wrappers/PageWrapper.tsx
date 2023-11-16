import React from "react";
import styled from "@emotion/styled";
import {  useIcon } from '../../floro_listener/FloroIconsProvider';
import { useRichText } from "../../floro_listener/hooks/locales";
import Button from "@floro/storybook/stories/design-system/Button";
import { Link } from "react-router-dom";
import ColorPalette from "@floro/styles/ColorPalette";

const PageWrapper = styled.div`
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

const PageNav = styled.nav`
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

const MainContent = styled.main`
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
  @media screen and (max-width: 767px){
    max-width: 100%;
  }
`;


const Footer = styled.footer`
  padding: 32px;
  border-top: 1px solid ${props => props.theme.name == 'light' ? ColorPalette.lightGray : ColorPalette.darkerGray};
`;

const FooterText = styled.p`
  padding: 0;
  margin: 0;
  font-family: "MavenPro";
  font-weight: 400;
  font-size: 1rem;
  color: ${props => props.theme.colors.contrastTextLight};
`;

const FooterExtra = styled.div`
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

interface Props {
    children: React.ReactElement|React.ReactElement[];
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

  return (
    <PageWrapper>
      <PageNav>
        <InnerContainer>
          <NavContent>
            <Link to={"/"}>
              <NavIcon src={floroRound} />
            </Link>
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
      </PageNav>
      <MainScrollWrapper>
        <MainContent>
            {props.children}
        </MainContent>
        <Footer>
          <div style={{textAlign: 'center'}}>
            <FooterText>
              {releasedUnderMITText}
            </FooterText>
            <FooterText style={{marginTop: 12}}>
              {copyrightText}
            </FooterText>
          </div>
          <FooterExtra/>
        </Footer>
      </MainScrollWrapper>
    </PageWrapper>
  );
}

export default React.memo(PageWrapperComponent);