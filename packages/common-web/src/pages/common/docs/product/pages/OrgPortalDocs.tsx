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

import OrgPortalLight from "@floro/main/public/doc_images/product/org_portal/org_portal.light.png"
import OrgPortalDark from "@floro/main/public/doc_images/product/org_portal/org_portal.dark.png"

import OrgMembersLight from "@floro/main/public/doc_images/product/org_portal/org_members.light.png"
import OrgMembersDark from "@floro/main/public/doc_images/product/org_portal/org_members.dark.png"

import RolesLight from "@floro/main/public/doc_images/product/org_portal/roles.light.png"
import RolesDark from "@floro/main/public/doc_images/product/org_portal/roles.dark.png"

import CreateOrgRepoLight from "@floro/main/public/doc_images/product/org_portal/org_create_repo.light.png"
import CreateOrgRepoDark from "@floro/main/public/doc_images/product/org_portal/org_create_repo.dark.png"

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


function OrgPortalDocs() {
  const theme = useTheme();
  // change this
  const docsMetaTitle = usePlainText("meta_tags.product_docs");

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
  const orgPortalDocsTitle = usePlainText("doc_titles.org_portal_docs_page_title");

  const orgPortalImg = useMemo(() => {
    if (theme.name == "light") {
      return OrgPortalLight;
    }
    return OrgPortalDark;
  }, [theme.name]);

  const orgMembersImg = useMemo(() => {
    if (theme.name == "light") {
      return OrgMembersLight;
    }
    return OrgMembersDark;
  }, [theme.name]);

  const rolesImg = useMemo(() => {
    if (theme.name == "light") {
      return RolesLight;
    }
    return RolesDark;
  }, [theme.name]);

  const createOrgRepoImg = useMemo(() => {
    if (theme.name == "light") {
      return CreateOrgRepoLight;
    }
    return CreateOrgRepoDark;
  }, [theme.name]);

  const titleChain = useMemo((): LinkChain => {
    return {
      label: docsTitle,
      value: '/docs',
      next: {
        prefix: '/',
        label: pageDocsTitle,
        value: '/docs/product',
        next: {
          label: orgPortalDocsTitle,
          prefix: '/',
          value: '/docs/product/org-portal',
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



  const article = useRichText(
    "product_docs.org_portal_docs",
    {
      docSearch: <DocSearch docs="product" linkChain={titleChain} />,
      orgPortalImg: (
        <div>
          <ScreenshotImg src={orgPortalImg}/>
        </div>
      ),
      orgMembersImg: (
        <div>
          <ScreenshotImg src={orgMembersImg}/>
        </div>
      ),
      rolesImg: (
        <div>
          <ScreenshotImg src={rolesImg}/>
        </div>
      ),
      createOrgRepo: (
        <div>
          <ScreenshotImg src={createOrgRepoImg}/>
        </div>
      ),
      mainTitle: function (
        content: ReactElement<any, string | JSXElementConstructor<any>>
      ): ReactElement<any, string | JSXElementConstructor<any>> {
        return <SectionTitle>{content}</SectionTitle>;
      }
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

export default OrgPortalDocs;