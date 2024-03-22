import {
  useMemo,
  useState,
  useCallback,
  useEffect,
  JSXElementConstructor,
  ReactElement,
} from "react";
import styled from "@emotion/styled";
import { useIcon } from "../../floro_listener/FloroIconsProvider";
import { useTheme } from "@emotion/react";
import { usePlainText, useRichText } from "../../floro_listener/hooks/locales";
import { Helmet } from "react-helmet";
import ColorPalette from "@floro/styles/ColorPalette";
import PageWrapper from "../../components/wrappers/PageWrapper";
import { richTextRenderers } from "@floro/common-web/src/floro_listener/FloroTextRenderer";
import { StaticLinkNode } from "@floro/common-generators/floro_modules/text-generator";
import { Link } from "react-router-dom";
import Checkbox from "@floro/storybook/stories/design-system/Checkbox";
import { userInfo } from "os";
import Button from "@floro/storybook/stories/design-system/Button";

const AboutWrapper = styled.div`
  width: 100%;
  min-height: 100dvh;
  background: ${(props) => props.theme.background};
  padding-top: 48px;
`;

const SectionTitle = styled.h2`
  font-size: 2.4rem;
  font-weight: 600;
  padding: 0;
  margin: 0;
  font-family: "MavenPro";
  color: ${(props) => props.theme.colors.titleText};
`;

const SubSectionTitle = styled.h2`
  font-size: 1.7rem;
  font-weight: 500;
  padding: 0;
  margin: 0;
  font-family: "MavenPro";
  color: ${(props) => props.theme.colors.titleText};
  @media screen and (max-width: 767px) {
    font-size: 1.44rem;
  }
`;

const SectionParagraph = styled.div`
  font-size: 1.2rem;
  font-weight: 400;
  padding: 0;
  margin: 0;
  font-family: "MavenPro";
  color: #7C7C7CFF;
  margin-right: 12px;
  color: ${(props) => props.theme.colors.contrastText};
  @media screen and (max-width: 767px) {
    font-size: 1rem;
  }
`;

const PricingWrapper = styled.div`
  width: 100%;
  display: flex;
  align-items: center;
  flex-direction: row;
  @media screen and (max-width: 767px) {
    min-height: auto;
    flex-direction: column;
    align-items: center;
  }
`;

const PricingCard = styled.div`
  width: 100%;
  display: flex;
  align-items: center;
  flex-direction: column;
  align-items: center;
  margin: 24px 48px;
  height: 240px;
  width: 240px;
  border: 1px solid ${props => props.theme.colors.inputBorderColor};
  border-radius: 8px;
  margin-left: 0;
  box-shadow: 0px 2px 8px 6px
    ${(props) => props.theme.colors.tooltipOuterShadowColor};
  @media screen and (max-width: 767px) {
    margin-right: 0;
  }
`;

const PricingHeader = styled.div`
  width: 100%;
  height: 72px;
  background: ${ColorPalette.purple};
  display: flex;
  justify-content: center;
  align-items: center;
  flex-direction: column;
  border-top-left-radius: 8px;
  border-top-right-radius: 8px;
`;

const PricingBody = styled.div`
  display: flex;
  flex-grow: 1;
  width: 100%;
  border-bottom-left-radius: 8px;
  border-bottom-right-radius: 8px;
  justify-content: center;
  align-items: center;
  flex-direction: column;
`;

const PricingHeaderText = styled.p`
  margin: 0;
  padding: 0;
  color: ${ColorPalette.white};
  font-weight: 600;
  font-size: 1.44rem;
`;

const PricingHeaderSubText = styled.p`
  margin: 0;
  padding: 0;
  color: ${ColorPalette.white};
  font-weight: 500;
  font-size: 1rem;
  margin-top: 4px;
`;

const Price = styled.p`
  margin: 0;
  padding: 0;
  color: ${props => props.theme.colors.titleText};
  font-weight: 600;
  font-size: 3rem;
  margin-left: -4px;
  margin-bottom: 4px;
`;

const PriceDetail = styled.p`
  margin: 0;
  padding: 0;
  color: ${props => props.theme.colors.contrastText};
  font-weight: 500;
  font-size: 1.2rem;
`;

const FinePrint = styled.p`
  margin: 0;
  padding: 0;
  color: ${props => props.theme.colors.contrastTextLight};
  font-weight: 500;
  font-size: 0.75rem;
  text-align: center;
  padding-left: 12px;
  padding-right: 12px;
  margin-top: 8px;
  margin-bottom: 8px;
`;

const SectionDetails = styled.section`
  margin: 0;
  background: ${(props) => props.theme.name == 'light' ? ColorPalette.lightGray : ColorPalette.mediumGray};
  border-radius: 8px;
  padding: 6px 8px;
  font-family: "MavenPro";
  color: ${(props) => props?.theme.colors.contrastText};
  box-shadow: 0px 2px 8px 4px ${props => props.theme.colors.tooltipOuterShadowColor};
  border: 1px solid ${props => props.theme.colors.contrastText};

`;

function PricingPage() {
  const pricingMetaTitle = usePlainText("meta_tags.pricing");

  const floroHosted = useRichText("pricing.floro_io_hosted");
  const publicOrPersonal = useRichText("pricing.public_or_personal");
  const free = useRichText("pricing.free");
  const unlimitedUse = useRichText("pricing.unlimited_use");
  const freeDisclaimer = useRichText("pricing.free_disclaimer");
  const privateOrg = useRichText("pricing.private_organization");
  const privateOrgDisclaimer = useRichText("pricing.private_org_disclaimer");
  const onPremise = useRichText("pricing.on-premise")
  const enterprise = useRichText("pricing.enterprise")
  const seeConsulting = useRichText("pricing.see_consulting")
  const perOrgMember = useRichText("pricing.per_org_member")
  const perMonth = useRichText("pricing.per_month")
  const price = useRichText("pricing.price")
  const contactUs = usePlainText("pricing.contact_us")

  const theme = useTheme();
  const renderLinkNode = useCallback(
    (
      node: StaticLinkNode<React.ReactElement>,
      renderers
    ): React.ReactElement => {
      let children = renderers.renderStaticNodes(node.children, renderers);
      return (
          <Link
            style={{ fontWeight: 600, color: theme.colors.linkColor, display: 'inline-block' }}
            to={node.href}
          >
            {children}
          </Link>
      );
    },
    [theme]
  );

  const rtRenderers = useMemo(() => {
    return {
      ...richTextRenderers,
      renderLinkNode,
    };
  }, [renderLinkNode]);

  const article = useRichText(
    "pricing.pricing_general",
    {
      title: function (
        content: ReactElement<any, string | JSXElementConstructor<any>>
      ): ReactElement<any, string | JSXElementConstructor<any>> {
        return <SectionTitle>{content}</SectionTitle>;
      },
      details: function (
        content: ReactElement<any, string | JSXElementConstructor<any>>
      ): ReactElement<any, string | JSXElementConstructor<any>> {
        return <SectionDetails>{content}</SectionDetails>;
      },
      pricingContent: (
        <PricingWrapper>
          <PricingCard>
            <PricingHeader>
              <PricingHeaderText>{floroHosted}</PricingHeaderText>
              <PricingHeaderSubText>{publicOrPersonal}</PricingHeaderSubText>
            </PricingHeader>
            <PricingBody>
              <Price>{free}</Price>
              <PriceDetail>{unlimitedUse}</PriceDetail>
              <FinePrint>{freeDisclaimer}</FinePrint>
            </PricingBody>
          </PricingCard>
          <PricingCard>
            <PricingHeader>
              <PricingHeaderText>{floroHosted}</PricingHeaderText>
              <PricingHeaderSubText>{privateOrg}</PricingHeaderSubText>
            </PricingHeader>
            <PricingBody>
              <Price>{price}</Price>
              <PriceDetail>{perOrgMember}</PriceDetail>
              <PriceDetail>{perMonth}</PriceDetail>
              <FinePrint>{privateOrgDisclaimer}</FinePrint>
            </PricingBody>
          </PricingCard>
          <PricingCard>
            <PricingHeader>
              <PricingHeaderText>{onPremise}</PricingHeaderText>
              <PricingHeaderSubText>{enterprise}</PricingHeaderSubText>
            </PricingHeader>
            <PricingBody>
              <PriceDetail>{seeConsulting}</PriceDetail>
              <div style={{ width: 120, marginTop: 24 }}>
                <a href="mailto:consulting@floro.io">
                  <Button size="small" label={contactUs} bg={"teal"} />
                </a>
              </div>
            </PricingBody>
          </PricingCard>
        </PricingWrapper>
      )
    },
    rtRenderers
  );
  return (
    <PageWrapper>
      <Helmet>
        <title>{pricingMetaTitle}</title>
      </Helmet>
      <AboutWrapper>
        <div
          style={{
            padding: 16,
          }}
        >
          <SectionParagraph>
            <section>{article}</section>
          </SectionParagraph>
        </div>
      </AboutWrapper>
    </PageWrapper>
  )
}

export default PricingPage;
