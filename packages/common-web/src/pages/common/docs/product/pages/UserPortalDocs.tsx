import {
  useMemo,
  useState,
  useCallback,
  useEffect,
  JSXElementConstructor,
  ReactElement,
} from "react";
import styled from "@emotion/styled";
import { useTheme } from "@emotion/react";
import { Helmet } from "react-helmet";
import { richTextRenderers } from "@floro/common-web/src/floro_listener/FloroTextRenderer";
import { StaticLinkNode } from "@floro/common-generators/floro_modules/text-generator";
import { Link } from "react-router-dom";
import PageWrapper from "../../../../../components/wrappers/PageWrapper";
import { usePlainText, useRichText } from "../../../../../floro_listener/hooks/locales";
import DocSearch from "../../DocSearch";
import { LinkChain } from "../../DocsLink";

import UserPortalLight from "@floro/main/public/doc_images/product/user_portal/user_portal.light.png"
import UserPortalDark from "@floro/main/public/doc_images/product/user_portal/user_portal.dark.png"

import LeftPanelLight from "@floro/main/public/doc_images/product/user_portal/left_panel.light.png"
import LeftPanelDark from "@floro/main/public/doc_images/product/user_portal/left_panel.dark.png"

import PrivacySettingsLight from "@floro/main/public/doc_images/product/user_portal/privacy_settings.light.png"
import PrivacySettingsDark from "@floro/main/public/doc_images/product/user_portal/privacy_settings.dark.png"

import NotificationsSettingsLight from "@floro/main/public/doc_images/product/user_portal/notifications_settings.light.png"
import NotificationsSettingsDark from "@floro/main/public/doc_images/product/user_portal/notifications_setting.dark.png"

import DeveloperSettingsLight from "@floro/main/public/doc_images/product/user_portal/developer_settings.light.png"
import DeveloperSettingsDark from "@floro/main/public/doc_images/product/user_portal/developer_settings.dark.png"

import CreateRepoLight from "@floro/main/public/doc_images/product/user_portal/create_repo.light.png"
import CreateRepoDark from "@floro/main/public/doc_images/product/user_portal/create_repo.dark.png"

import CreateOrgLight from "@floro/main/public/doc_images/product/user_portal/create_org.light.png"
import CreateOrgDark from "@floro/main/public/doc_images/product/user_portal/create_org.dark.png"

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
  @media screen and (max-width: 767px) {
    font-size: 2rem;
  }
`;

const SubSectionTitle = styled.h2`
  font-size: 2rem;
  font-weight: 500;
  padding: 0;
  margin: 0;
  font-family: "MavenPro";
  color: ${(props) => props.theme.colors.contrastText};
  @media screen and (max-width: 767px) {
    font-size: 1.7rem;
  }
`;

const SectionParagraph = styled.div`
  font-size: 1.44rem;
  font-weight: 400;
  padding: 0;
  margin: 0;
  font-family: "MavenPro";
  color: ${(props) => props.theme.colors.contrastText};
  @media screen and (max-width: 767px) {
    font-size: 1.2rem;
  }
`;


const ScreenshotImg = styled.img`
  border-radius: 8px;
  box-shadow: 0px 4px 16px 12px
    ${(props) => props.theme.colors.tooltipOuterShadowColor};
  width: 100%;
  max-width: 600px;
`;

const TitleSpan = styled.span`
  font-size: 1.4rem;
  font-family: "MavenPro";
  font-weight: 600;
  color: ${(props) => props.theme.colors.linkColor};
  white-space: nowrap;
`;


function UserPortalDocs() {
  const theme = useTheme();
  // change this
  const docsMetaTitle = usePlainText("meta_tags.user_portal_docs");

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

  const docsTitle = usePlainText("doc_titles.docs_page_title");
  const pageDocsTitle = usePlainText("doc_titles.product_docs_page_title");
  const userPortalDocsTitle = usePlainText("doc_titles.user_portal_docs_page_title");
  const pageProductAndTermsDocsTitle = usePlainText("doc_titles.product_and_terminology_docs_page_title");

  const lastSectionTitleChain = useMemo((): LinkChain => {
    return {
      label: pageProductAndTermsDocsTitle,
      value: '/docs/product/product-and-terms',
    }
  }, []);

  const titleChain = useMemo((): LinkChain => {
    return {
      label: docsTitle,
      value: '/docs',
      next: {
        prefix: '/',
        label: pageDocsTitle,
        value: '/docs/product',
        next: {
          label: userPortalDocsTitle,
          prefix: '/',
          value: '/docs/product/user-portal',
        }
      }
    }
  }, []);

  const rtRenderers = useMemo(() => {
    return {
      ...richTextRenderers,
      renderLinkNode,
    };
  }, [renderLinkNode]);


  const userPortalImg = useMemo(() => {
    if (theme.name == "light") {
      return UserPortalLight;
    }
    return UserPortalDark;
  }, [theme.name])

  const leftPanelImg = useMemo(() => {
    if (theme.name == "light") {
      return LeftPanelLight;
    }
    return LeftPanelDark;
  }, [theme.name]);

  const privacySettingsImg = useMemo(() => {
    if (theme.name == "light") {
      return PrivacySettingsLight;
    }
    return PrivacySettingsDark;
  }, [theme.name]);

  const notificationsSettingsImg = useMemo(() => {
    if (theme.name == "light") {
      return NotificationsSettingsLight;
    }
    return NotificationsSettingsDark;
  }, [theme.name]);

  const developerSettingsImg = useMemo(() => {
    if (theme.name == "light") {
      return DeveloperSettingsLight;
    }
    return DeveloperSettingsDark;
  }, [theme.name]);

  const createRepoImg = useMemo(() => {
    if (theme.name == "light") {
      return CreateRepoLight;
    }
    return CreateRepoDark;
  }, [theme.name]);

  const createOrgImg = useMemo(() => {
    if (theme.name == "light") {
      return CreateOrgLight;
    }
    return CreateOrgDark;
  }, [theme.name]);

  const article = useRichText(
    "product_docs.user_portal_docs",
    {
      docSearch: (
        <DocSearch
          docs="product"
          linkChain={titleChain}
          lastSectionTitleChain={lastSectionTitleChain}
        />
      ),
      userPortalImg: (
        <div>
          <ScreenshotImg src={userPortalImg} />
        </div>
      ),
      leftPanelImg: (
        <div
          style={{ display: "flex", justifyContent: "center", width: "100%" }}
        >
          <ScreenshotImg style={{ maxWidth: 200 }} src={leftPanelImg} />
        </div>
      ),
      privacySettingsImg: (
        <div>
          <ScreenshotImg src={privacySettingsImg} />
        </div>
      ),
      notificationSettingsImg: (
        <div>
          <ScreenshotImg src={notificationsSettingsImg} />
        </div>
      ),
      developerSettingsImg: (
        <div>
          <ScreenshotImg src={developerSettingsImg} />
        </div>
      ),
      createRepo: (
        <div>
          <ScreenshotImg src={createRepoImg} />
        </div>
      ),
      createOrg: (
        <div>
          <ScreenshotImg src={createOrgImg} />
        </div>
      ),
      mainTitle: function (
        content: ReactElement<any, string | JSXElementConstructor<any>>
      ): ReactElement<any, string | JSXElementConstructor<any>> {
        return <SectionTitle>{content}</SectionTitle>;
      },
    },
    rtRenderers
  );

  return (
    <PageWrapper>
      <Helmet>
        <title>{docsMetaTitle}</title>
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
  );
}

export default UserPortalDocs;