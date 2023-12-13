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

import ConflictingBranchesLight from "@floro/main/public/doc_images/product/mergingandconflicts/conflicting_branches.light.png"
import ConflictingBranchesDark from "@floro/main/public/doc_images/product/mergingandconflicts/conflicting_branches.dark.png"

import ReadyToMergeLight from "@floro/main/public/doc_images/product/mergingandconflicts/ready_to_merge.light.png"
import ReadyToMergeDark from "@floro/main/public/doc_images/product/mergingandconflicts/ready_to_merge.dark.png"

import MCYoursLight from "@floro/main/public/doc_images/product/mergingandconflicts/mc_yours.light.png"
import MCYoursDark from "@floro/main/public/doc_images/product/mergingandconflicts/mc_yours.dark.png"

import MCTheirsLight from "@floro/main/public/doc_images/product/mergingandconflicts/mc_theirs.light.png"
import MCTheirsDark from "@floro/main/public/doc_images/product/mergingandconflicts/mc_theirs.dark.png"

import ManualResolutionLight from "@floro/main/public/doc_images/product/mergingandconflicts/manual_resolution.light.png"
import ManualResolutionDark from "@floro/main/public/doc_images/product/mergingandconflicts/manual_resolution.dark.png"

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


function MergingAndConflictsDocs() {
  const theme = useTheme();
  // change this
  const docsMetaTitle = usePlainText("meta_tags.merging_and_conflicts_docs");

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
  const remoteRepositoriesDocsTitle = usePlainText("doc_titles.remote_repositories_docs_page_title");

  const slide1 = useIcon("merge-tree-docs.slide-1");
  const merge2 = useIcon("merge-tree-docs.merge-2");
  const merge3 = useIcon("merge-tree-docs.merge-3");
  const merge4 = useIcon("merge-tree-docs.merge-4");
  const merge5 = useIcon("merge-tree-docs.merge-5");
  const merge6 = useIcon("merge-tree-docs.merge-6");
  const merge7 = useIcon("merge-tree-docs.merge-7");

  const conflictingBranchesImg = useMemo(() => {
    if (theme.name == 'light') {
      return ConflictingBranchesLight;
    }
    return ConflictingBranchesDark;
  }, [theme.name]);

  const readyToMergeImg = useMemo(() => {
    if (theme.name == 'light') {
      return ReadyToMergeLight;
    }
    return ReadyToMergeDark;
  }, [theme.name]);

  const mcYoursImg = useMemo(() => {
    if (theme.name == 'light') {
      return MCYoursLight;
    }
    return MCYoursDark;
  }, [theme.name]);

  const mcTheirsImg = useMemo(() => {
    if (theme.name == 'light') {
      return MCTheirsLight;
    }
    return MCTheirsDark;
  }, [theme.name]);

  const manualResolutionImg = useMemo(() => {
    if (theme.name == 'light') {
      return ManualResolutionLight;
    }
    return ManualResolutionDark;
  }, [theme.name]);

  const lastSectionTitleChain = useMemo((): LinkChain => {
    return {
      label: remoteRepositoriesDocsTitle,
      value: '/docs/product/remote-repositories',
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
          label: mergeAndConflictsDocsTitle,
          prefix: '/',
          value: '/docs/product/merging-and-conflicts',
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
    "product_docs.merging_and_conflicts_docs",
    {
      docSearch: (
        <DocSearch
          docs="product"
          linkChain={titleChain}
          lastSectionTitleChain={lastSectionTitleChain}
        />
      ),
      slide1: (
        <div>
          <SlideImg src={slide1}/>
        </div>
      ),
      merge2: (
        <div>
          <SlideImg src={merge2}/>
        </div>
      ),
      merge3: (
        <div>
          <SlideImg src={merge3}/>
        </div>
      ),
      merge4: (
        <div>
          <SlideImg src={merge4}/>
        </div>
      ),
      merge5: (
        <div>
          <SlideImg src={merge5}/>
        </div>
      ),
      merge6: (
        <div>
          <SlideImg src={merge6}/>
        </div>
      ),
      merge7: (
        <div>
          <SlideImg src={merge7}/>
        </div>
      ),
      conflictingBranches: (
        <div>
          <ScreenshotImg src={conflictingBranchesImg}/>
        </div>
      ),
      readyToMerge: (
        <div>
          <ScreenshotImg src={readyToMergeImg}/>
        </div>
      ),
      mcYours: (
        <div>
          <ScreenshotImg src={mcYoursImg}/>
        </div>
      ),
      mcTheirs: (
        <div>
          <ScreenshotImg src={mcTheirsImg}/>
        </div>
      ),
      manualResolution: (
        <div>
          <ScreenshotImg src={manualResolutionImg}/>
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

export default MergingAndConflictsDocs;