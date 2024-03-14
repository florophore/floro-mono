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
import ColorPalette from "@floro/styles/ColorPalette";
import { richTextRenderers } from "@floro/common-web/src/floro_listener/FloroTextRenderer";
import { StaticLinkNode } from "@floro/common-generators/floro_modules/text-generator";
import { Link } from "react-router-dom";
import PageWrapper from "../../../../components/wrappers/PageWrapper";
import { usePlainText, useRichText } from "../../../../floro_listener/hooks/locales";
import { useIcon } from "../../../../floro_listener/FloroIconsProvider";
import DocSearch from "../DocSearch";
import { LinkChain } from "../DocsLink";

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

const PluginRow = styled.div`
  display: flex;
  flex-direction: row;

`;

const PluginIcon = styled.img`
  height: 64px;
  width: 64px;
  @media screen and (max-width: 767px) {
    height: 48px;
    width: 48px;
  }
`;

const PluginTitle = styled.h3`
  font-size: 1.2rem;
  font-weight: 600;
  padding: 0;
  margin: 0;
  font-family: "MavenPro";
  @media screen and (max-width: 767px) {
    font-size: 1rem;
  }
`;

const PluginDescription = styled.p`
  font-size: 1rem;
  font-weight: 500;
  padding: 0;
  margin: 0;
  font-family: "MavenPro";
  font-style: italic;
  margin-top: 4px;
  @media screen and (max-width: 767px) {
    font-size: 0.8rem;
  }
`;


function DevDocsLanding() {
  const theme = useTheme();
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
  const pageDocsTitle = usePlainText("doc_titles.dev_docs_page_title");

  const titleChain = useMemo((): LinkChain => {
    return {
      label: docsTitle,
      value: '/docs',
      next: {
        prefix: '/',
        label: pageDocsTitle,
        value: '/docs/dev'
      }
    }
  }, []);

  const rtRenderers = useMemo(() => {
    return {
      ...richTextRenderers,
      renderLinkNode,
    };
  }, [renderLinkNode]);

  const developmentDocsIndex = useRichText("dev_docs.dev_docs_index", {}, rtRenderers);
  const article = useRichText(
    "dev_docs.dev_docs_general",
    {
      developmentDocsIndex,
      docSearch: <DocSearch docs="development" linkChain={titleChain} />,
      mainTitle: function (
        content: ReactElement<any, string | JSXElementConstructor<any>>
      ): ReactElement<any, string | JSXElementConstructor<any>> {
        return <SectionTitle>{content}</SectionTitle>;
      },
      sectionTitle: function (
        content: ReactElement<any, string | JSXElementConstructor<any>>,
      ): ReactElement<any, string | JSXElementConstructor<any>> {
        return (
          <SubSectionTitle
            style={{
              marginTop: 24,
            }}
          >
            {content}
          </SubSectionTitle>
        );
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

export default DevDocsLanding;