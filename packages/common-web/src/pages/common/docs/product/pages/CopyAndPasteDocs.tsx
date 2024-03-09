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

import ManualCopyLight from "@floro/main/public/doc_images/product/copyandpaste/manual_copy.light.png"
import ManualCopyDark from "@floro/main/public/doc_images/product/copyandpaste/manual_copy.dark.png"

import SelectLight from "@floro/main/public/doc_images/product/copyandpaste/select.light.png"
import SelectDark from "@floro/main/public/doc_images/product/copyandpaste/select.dark.png"

import NonManualCopyLight from "@floro/main/public/doc_images/product/copyandpaste/non_manual.light.png"
import NonManualCopyDark from "@floro/main/public/doc_images/product/copyandpaste/non_manual.dark.png"

import { useIcon } from "../../../../../floro_listener/FloroIconsProvider";


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


function CopyAndPasteDocs() {
  const theme = useTheme();
  // change this
  const docsMetaTitle = usePlainText("meta_tags.copy_and_paste_docs");

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
  const chromeExtensionDocsTitle = usePlainText("doc_titles.chrome_extension_docs_page_title");
  const copyAndPasteTitle = usePlainText("doc_titles.copy_and_paste");

  const manualCopy = useMemo(() => {
    if (theme.name == 'light') {
      return ManualCopyLight;
    }
    return ManualCopyDark;
  }, [theme.name])

  const select = useMemo(() => {
    if (theme.name == 'light') {
      return SelectLight;
    }
    return SelectDark;
  }, [theme.name])

  const nonManual = useMemo(() => {
    if (theme.name == 'light') {
      return NonManualCopyLight;
    }
    return NonManualCopyDark;
  }, [theme.name])

  const lastSectionTitleChain = useMemo((): LinkChain => {
    return {
      label: chromeExtensionDocsTitle,
      value: '/docs/product/floro-chrome-extension',
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
          value: '/docs/product/copy-and-paste',
        }
      }
    }
  }, [docsTitle, pageDocsTitle, copyAndPasteTitle, chromeExtensionDocsTitle]);

  const rtRenderers = useMemo(() => {
    return {
      ...richTextRenderers,
      renderLinkNode,
    };
  }, [renderLinkNode]);



  const article = useRichText(
    "product_docs.copy_and_paste",
    {
      docSearch: (
        <DocSearch
          docs="product"
          linkChain={titleChain}
          lastSectionTitleChain={lastSectionTitleChain}
        />
      ),
      mainTitle: function (
        content: ReactElement<any, string | JSXElementConstructor<any>>
      ): ReactElement<any, string | JSXElementConstructor<any>> {
        return <SectionTitle>{content}</SectionTitle>;
      },
      manualCopy: (
        <div>
          <ScreenshotImg src={manualCopy}/>
        </div>
      ),
      selectAssets: (
        <div>
          <ScreenshotImg src={select}/>
        </div>
      ),
      pasteAssets: (
        <div>
          <ScreenshotImg src={nonManual}/>
        </div>
      )
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

export default CopyAndPasteDocs;