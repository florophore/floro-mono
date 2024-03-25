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

import PinExtensionLight from "@floro/main/public/doc_images/product/chromeextension/pin_extension.light.png"
import PinExtensionDark from "@floro/main/public/doc_images/product/chromeextension/pin_extension.dark.png"

import CreateAPIKeyLight from "@floro/main/public/doc_images/product/chromeextension/create_api_key.light.png"
import CreateAPIKeyDark from "@floro/main/public/doc_images/product/chromeextension/create_api_key.dark.png"

import EnterAPIKeyLight from "@floro/main/public/doc_images/product/chromeextension/enter_key.light.png"
import EnterAPIKeyDark from "@floro/main/public/doc_images/product/chromeextension/enter_key.dark.png"

import EditModeLight from "@floro/main/public/doc_images/product/chromeextension/edit_mode.light.png"
import EditModeDark from "@floro/main/public/doc_images/product/chromeextension/edit_mode.dark.png"

import DebugModeLight from "@floro/main/public/doc_images/product/chromeextension/debug_mode.light.png"
import DebugModeDark from "@floro/main/public/doc_images/product/chromeextension/debug_mode.dark.png"


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
  max-width: 800px;
`;

const ScreenshotImgSmall = styled.img`
  border-radius: 8px;
  box-shadow: 0px 4px 16px 12px
    ${(props) => props.theme.colors.tooltipOuterShadowColor};
  width: 100%;
  max-width: 300px;
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


function ChromeExtensionDocs() {
  const theme = useTheme();
  // change this
  const docsMetaTitle = usePlainText("meta_tags.floro_chrome_extension_docs");

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
  const advancedCommandsDocsTitle = usePlainText("doc_titles.advanced_commands_docs_page_title");
  const chromeExtensionDocsTitle = usePlainText("doc_titles.chrome_extension_docs_page_title");

  const pinExtension = useMemo(() => {
    if (theme.name == 'light') {
      return PinExtensionLight;
    }
    return PinExtensionDark;
  }, [theme.name])

  const createApiKey = useMemo(() => {
    if (theme.name == 'light') {
      return CreateAPIKeyLight;
    }
    return CreateAPIKeyDark;
  }, [theme.name])

  const enterApiKey = useMemo(() => {
    if (theme.name == 'light') {
      return EnterAPIKeyLight;
    }
    return EnterAPIKeyDark;
  }, [theme.name])

  const editMode = useMemo(() => {
    if (theme.name == 'light') {
      return EditModeLight;
    }
    return EditModeDark;
  }, [theme.name])

  const debugMode = useMemo(() => {
    if (theme.name == 'light') {
      return DebugModeLight;
    }
    return DebugModeDark;
  }, [theme.name])

  const lastSectionTitleChain = useMemo((): LinkChain => {
    return {
      label: advancedCommandsDocsTitle,
      value: '/docs/product/advanced-commands',
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
          label: chromeExtensionDocsTitle,
          prefix: '/',
          value: '/docs/product/floro-chrome-extension',
        }
      }
    }
  }, [docsTitle, pageDocsTitle, advancedCommandsDocsTitle]);

  const rtRenderers = useMemo(() => {
    return {
      ...richTextRenderers,
      renderLinkNode,
    };
  }, [renderLinkNode]);



  const article = useRichText(
    "product_docs.floro_chrome_extension",
    {
      docSearch: (
        <DocSearch
          docs="product"
          linkChain={titleChain}
          lastSectionTitleChain={lastSectionTitleChain}
        />
      ),
      pinExtension: (
        <div>
          <ScreenshotImgSmall src={pinExtension}/>
        </div>
      ),
      localApiKey: (
        <div>
          <ScreenshotImg src={createApiKey}/>
        </div>
      ),
      enterApiKey: (
        <div>
          <ScreenshotImg src={enterApiKey}/>
        </div>
      ),
      editMode: (
        <div>
          <ScreenshotImg src={editMode}/>
        </div>
      ),
      debugMode: (
        <div>
          <ScreenshotImg src={debugMode}/>
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

export default ChromeExtensionDocs;