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

import ShaGraphLight from "@floro/main/public/doc_images/product/advancedcommands/sha_graph.light.png"
import ShaGraphDark from "@floro/main/public/doc_images/product/advancedcommands/sha_graph.dark.png"

import StashingLight from "@floro/main/public/doc_images/product/advancedcommands/stashing.light.png"
import StashingDark from "@floro/main/public/doc_images/product/advancedcommands/stashing.dark.png"

import PopStashLight from "@floro/main/public/doc_images/product/advancedcommands/pop_stash.light.png"
import PopStashDark from "@floro/main/public/doc_images/product/advancedcommands/pop_stash.dark.png"

import ChangeHeadLight from "@floro/main/public/doc_images/product/advancedcommands/change_head.light.png"
import ChangeHeadDark from "@floro/main/public/doc_images/product/advancedcommands/change_head.dark.png"

import RevertingLight from "@floro/main/public/doc_images/product/advancedcommands/reverting.light.png"
import RevertingDark from "@floro/main/public/doc_images/product/advancedcommands/reverting.dark.png"

import ClearPluginStorageLight from "@floro/main/public/doc_images/product/advancedcommands/clear_plugin_storage.light.png"
import ClearPluginStorageDark from "@floro/main/public/doc_images/product/advancedcommands/clear_plugin_storage.dark.png"


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

const SlideImg = styled.img`
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


function AdvancedCommandsDocs() {
  const theme = useTheme();
  // change this
  const docsMetaTitle = usePlainText("meta_tags.advanced_commands_docs");

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
  const mergeAndConflictsDocsTitle = usePlainText("doc_titles.merge_and_conflicts_docs_page_title");
  const advancedCommandsDocsTitle = usePlainText("doc_titles.advanced_commands_docs_page_title");

  const shaGraph = useMemo(() => {
    if (theme.name == 'light') {
      return ShaGraphLight;
    }
    return ShaGraphDark;
  }, [theme.name])

  const stashing = useMemo(() => {
    if (theme.name == 'light') {
      return StashingLight;
    }
    return StashingDark;
  }, [theme.name])

  const popStash = useMemo(() => {
    if (theme.name == 'light') {
      return PopStashLight;
    }
    return PopStashDark;
  }, [theme.name]);

  const changeHead = useMemo(() => {
    if (theme.name == 'light') {
      return ChangeHeadLight;
    }
    return ChangeHeadDark;
  }, [theme.name]);

  const reverting = useMemo(() => {
    if (theme.name == 'light') {
      return RevertingLight;
    }
    return RevertingDark;
  }, [theme.name]);

  const clearPluginStorage = useMemo(() => {
    if (theme.name == 'light') {
      return ClearPluginStorageLight;
    }
    return ClearPluginStorageDark;
  }, [theme.name]);

  const lastSectionTitleChain = useMemo((): LinkChain => {
    return {
      label: mergeAndConflictsDocsTitle,
      value: '/docs/product/merging-and-conflicts',
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
          label: advancedCommandsDocsTitle,
          prefix: '/',
          value: '/docs/product/advanced-commands',
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
    "product_docs.advanced_commands_docs",
    {
      docSearch: (
        <DocSearch
          docs="product"
          linkChain={titleChain}
          lastSectionTitleChain={lastSectionTitleChain}
        />
      ),
      shaGraph: (
        <div>
          <ScreenshotImg src={shaGraph}/>
        </div>
      ),
      stashing: (
        <div>
          <ScreenshotImg src={stashing}/>
        </div>
      ),
      popStash: (
        <div>
          <ScreenshotImg src={popStash}/>
        </div>
      ),
      clearPluginStorage: (
        <div>
          <ScreenshotImg src={clearPluginStorage}/>
        </div>
      ),
      changeHead: (
        <div>
          <ScreenshotImg src={changeHead}/>
        </div>
      ),
      reverting: (
        <div>
          <ScreenshotImg src={reverting}/>
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

export default AdvancedCommandsDocs;