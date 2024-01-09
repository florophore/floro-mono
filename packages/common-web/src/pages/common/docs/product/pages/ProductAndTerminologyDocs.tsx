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
import PageWrapper from "../../../../../components/wrappers/PageWrapper";
import { usePlainText, useRichText } from "../../../../../floro_listener/hooks/locales";
import { useIcon } from "../../../../../floro_listener/FloroIconsProvider";
import DocSearch from "../../DocSearch";
import { LinkChain } from "../../DocsLink";
import WhatIsRepoLight from "@floro/main/public/doc_images/product/what_is_repo.light.png"
import WhatIsRepoDark from "@floro/main/public/doc_images/product/what_is_repo.dark.png"

import WhatArePluginsTextLight from "@floro/main/public/doc_images/product/what_are_plugins_text.light.png"
import WhatArePluginsTextDark from "@floro/main/public/doc_images/product/what_are_plugins_text.dark.png"

import WhatIsACommitLight from "@floro/main/public/doc_images/product/what_is_a_commit.light.png"
import WhatIsACommitDark from "@floro/main/public/doc_images/product/what_is_a_commit.dark.png"

import WhatIsABranchLight from "@floro/main/public/doc_images/product/what_is_a_branch.light.png"
import WhatIsABranchDark from "@floro/main/public/doc_images/product/what_is_a_branch.dark.png"

import DiffCommitLight from "@floro/main/public/doc_images/product/diff_commit.light.png"
import DiffCommitDark from "@floro/main/public/doc_images/product/diff_commit.dark.png"

import WhatIsPushingLight from "@floro/main/public/doc_images/product/what_is_pushing.light.png"
import WhatIsPushingDark from "@floro/main/public/doc_images/product/what_is_pushing.dark.png"

import CreateMRPromptLight from "@floro/main/public/doc_images/product/create_mr_prompt.light.png"
import CreateMRPromptDark from "@floro/main/public/doc_images/product/create_mr_prompt.dark.png"

import MergeRequestLight from "@floro/main/public/doc_images/product/merge_request.light.png"
import MergeRequestDark from "@floro/main/public/doc_images/product/merge_request.dark.png"

import ReviewCommentLight from "@floro/main/public/doc_images/product/review_comment.light.png"
import ReviewCommentDark from "@floro/main/public/doc_images/product/review_comment.dark.png"

import PullingLight from "@floro/main/public/doc_images/product/pulling.light.png"
import PullingDark from "@floro/main/public/doc_images/product/pulling.dark.png"

import DefaultBranchLight from "@floro/main/public/doc_images/product/default_branch.light.png"
import DefaultBranchDark from "@floro/main/public/doc_images/product/default_branch.dark.png"

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


function ProductAndTerminologyDocs() {
  const theme = useTheme();
  // change this
  const docsMetaTitle = usePlainText("meta_tags.product_docs_and_terminology");

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

  const whatIsRepoImg = useMemo(() => {
    if (theme.name == "light") {
      return WhatIsRepoLight;
    }
    return WhatIsRepoDark;
  }, [theme.name]);

  const whatArePluginsTextImg = useMemo(() => {
    if (theme.name == "light") {
      return WhatArePluginsTextLight;
    }
    return WhatArePluginsTextDark;
  }, [theme.name]);

  const whatIsACommitImg = useMemo(() => {
    if (theme.name == "light") {
      return WhatIsACommitLight;
    }
    return WhatIsACommitDark;
  }, [theme.name]);

  const whatIsABranchImg = useMemo(() => {
    if (theme.name == "light") {
      return WhatIsABranchLight;
    }
    return WhatIsABranchDark;
  }, [theme.name]);

  const diffCommitImg = useMemo(() => {
    if (theme.name == "light") {
      return DiffCommitLight;
    }
    return DiffCommitDark;
  }, [theme.name]);

  const whatIsPushingImg = useMemo(() => {
    if (theme.name == "light") {
      return WhatIsPushingLight;
    }
    return WhatIsPushingDark;
  }, [theme.name]);

  const createMRPromptImg = useMemo(() => {
    if (theme.name == "light") {
      return CreateMRPromptLight;
    }
    return CreateMRPromptDark;
  }, [theme.name]);

  const mergeRequestImg = useMemo(() => {
    if (theme.name == "light") {
      return MergeRequestLight;
    }
    return MergeRequestDark;
  }, [theme.name]);

  const reviewCommentImg = useMemo(() => {
    if (theme.name == "light") {
      return ReviewCommentLight;
    }
    return ReviewCommentDark;
  }, [theme.name]);

  const pullingImg = useMemo(() => {
    if (theme.name == "light") {
      return PullingLight;
    }
    return PullingDark;
  }, [theme.name]);

  const defaultBranch = useMemo(() => {
    if (theme.name == "light") {
      return DefaultBranchLight;
    }
    return DefaultBranchDark;
  }, [theme.name]);

  const docsTitle = usePlainText("doc_titles.docs_page_title");
  const pageDocsTitle = usePlainText("doc_titles.product_docs_page_title");
  const pageProductAndTermsDocsTitle = usePlainText("doc_titles.product_and_terminology_docs_page_title");

  const titleChain = useMemo((): LinkChain => {
    return {
      label: docsTitle,
      value: '/docs',
      next: {
        prefix: '/',
        label: pageDocsTitle,
        value: '/docs/product',
        next: {
          label: pageProductAndTermsDocsTitle,
          prefix: '/',
          value: '/docs/product/product-and-terms',
        }
      }
    }
  }, [docsTitle, pageDocsTitle, pageProductAndTermsDocsTitle]);

  const rtRenderers = useMemo(() => {
    return {
      ...richTextRenderers,
      renderLinkNode,
    };
  }, [renderLinkNode]);

  const article = useRichText(
    "product_docs.product_and_terminology_overview",
    {
      docSearch: <DocSearch docs="product" linkChain={titleChain} />,
      whatIsFloroImg: (
        <div>
          <ScreenshotImg src={whatIsRepoImg}/>
        </div>
      ),
      whatArePluginsTextImg: (
        <div>
          <ScreenshotImg src={whatArePluginsTextImg}/>
        </div>
      ),
      whatIsACommitImg: (
        <div>
          <ScreenshotImg src={whatIsACommitImg}/>
        </div>
      ),
      whatIsABranchImg: (
        <div>
          <ScreenshotImg src={whatIsABranchImg}/>
        </div>
      ),
      diffCommitImg: (
        <div>
          <ScreenshotImg src={diffCommitImg}/>
        </div>
      ),
      whatIsPushing: (
        <div>
          <ScreenshotImg src={whatIsPushingImg}/>
        </div>
      ),
      createMRPromptImg: (
        <div>
          <ScreenshotImg src={createMRPromptImg}/>
        </div>
      ),
      mergeRequestImg: (
        <div>
          <ScreenshotImg src={mergeRequestImg}/>
        </div>
      ),
      reviewCommentImg: (
        <div>
          <ScreenshotImg src={reviewCommentImg}/>
        </div>
      ),
      pullingImg: (
        <div>
          <ScreenshotImg src={pullingImg}/>
        </div>
      ),
      defaultBranchImg: (
        <div>
          <ScreenshotImg src={defaultBranch}/>
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

export default ProductAndTerminologyDocs;