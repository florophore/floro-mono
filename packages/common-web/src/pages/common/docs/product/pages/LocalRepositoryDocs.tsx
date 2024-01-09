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

import CreateLocalRepositoryLight from "@floro/main/public/doc_images/product/local_repositories/create_local_repository.light.png"
import CreateLocalRepositoryDark from "@floro/main/public/doc_images/product/local_repositories/create_local_repository.dark.png"

import CloneRepoLight from "@floro/main/public/doc_images/product/local_repositories/clone_repo.light.png"
import CloneRepoDark from "@floro/main/public/doc_images/product/local_repositories/clone_repo.dark.png"

import EmptyRepoLight from "@floro/main/public/doc_images/product/local_repositories/empty_repo.light.png"
import EmptyRepoDark from "@floro/main/public/doc_images/product/local_repositories/empty_repo.dark.png"

import EditModeLight from "@floro/main/public/doc_images/product/local_repositories/edit_mode.light.png"
import EditModeDark from "@floro/main/public/doc_images/product/local_repositories/edit_mode.dark.png"

import CompareModeLight from "@floro/main/public/doc_images/product/local_repositories/compare_mode.light.png"
import CompareModeDark from "@floro/main/public/doc_images/product/local_repositories/compare_mode.dark.png"

import EmptyBranchesLight from "@floro/main/public/doc_images/product/local_repositories/empty_branches.light.png"
import EmptyBranchesDark from "@floro/main/public/doc_images/product/local_repositories/empty_branches.dark.png"

import FirstBranchLight from "@floro/main/public/doc_images/product/local_repositories/first_branch.light.png"
import FirstBranchDark from "@floro/main/public/doc_images/product/local_repositories/first_branch.dark.png"

import InstallPluginLight from "@floro/main/public/doc_images/product/local_repositories/install_plugin.light.png"
import InstallPluginDark from "@floro/main/public/doc_images/product/local_repositories/install_plugin.dark.png"

import FirstChangeLight from "@floro/main/public/doc_images/product/local_repositories/first_change.light.png"
import FirstChangeDark from "@floro/main/public/doc_images/product/local_repositories/first_change.dark.png"

import FirstDiffLight from "@floro/main/public/doc_images/product/local_repositories/first_diff.light.png"
import FirstDiffDark from "@floro/main/public/doc_images/product/local_repositories/first_diff.dark.png"

import FirstCommitLight from "@floro/main/public/doc_images/product/local_repositories/first_commit.light.png"
import FirstCommitDark from "@floro/main/public/doc_images/product/local_repositories/first_commit.dark.png"

import FirstPushLight from "@floro/main/public/doc_images/product/local_repositories/first_push.light.png"
import FirstPushDark from "@floro/main/public/doc_images/product/local_repositories/first_push.dark.png"

import BranchDropdownLight from "@floro/main/public/doc_images/product/local_repositories/branch_dropdown.light.png"
import BranchDropdownDark from "@floro/main/public/doc_images/product/local_repositories/branch_dropdown.dark.png"

import FirstBranchRemoteLight from "@floro/main/public/doc_images/product/local_repositories/first_branch_remote.light.png"
import FirstBranchRemoteDark from "@floro/main/public/doc_images/product/local_repositories/first_branch_remote.dark.png"

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


function LocalRepositoryDocs() {
  const theme = useTheme();
  // change this
  const docsMetaTitle = usePlainText("meta_tags.local_repository_docs");

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
  const localRepositoriesDocsTitle = usePlainText("doc_titles.local_repositories_docs_page_title");

  const createLocalRepositoryImg = useMemo(() => {
    if (theme.name == 'light') {
      return CreateLocalRepositoryLight;
    }
    return CreateLocalRepositoryDark;
  }, [theme.name]);

  const cloneLocalRepositoryImg = useMemo(() => {
    if (theme.name == 'light') {
      return CloneRepoLight;
    }
    return CloneRepoDark;
  }, [theme.name]);

  const emptyRepoImg = useMemo(() => {
    if (theme.name == 'light') {
      return EmptyRepoLight;
    }
    return EmptyRepoDark;
  }, [theme.name]);

  const editModeImg = useMemo(() => {
    if (theme.name == 'light') {
      return EditModeLight;
    }
    return EditModeDark;
  }, [theme.name]);

  const compareModeImg = useMemo(() => {
    if (theme.name == 'light') {
      return CompareModeLight;
    }
    return CompareModeDark;
  }, [theme.name]);

  const emptyBranchesImg = useMemo(() => {
    if (theme.name == 'light') {
      return EmptyBranchesLight;
    }
    return EmptyBranchesDark;
  }, [theme.name]);

  const firstBranchImg = useMemo(() => {
    if (theme.name == 'light') {
      return FirstBranchLight;
    }
    return FirstBranchDark;
  }, [theme.name]);

  const installPluginImg = useMemo(() => {
    if (theme.name == 'light') {
      return InstallPluginLight;
    }
    return InstallPluginDark;
  }, [theme.name]);

  const firstChangeImg = useMemo(() => {
    if (theme.name == 'light') {
      return FirstChangeLight;
    }
    return FirstChangeDark;
  }, [theme.name]);

  const firstDiffImg = useMemo(() => {
    if (theme.name == 'light') {
      return FirstDiffLight;
    }
    return FirstDiffDark;
  }, [theme.name]);

  const firstCommitImg = useMemo(() => {
    if (theme.name == 'light') {
      return FirstCommitLight;
    }
    return FirstCommitDark;
  }, [theme.name]);

  const firstPushImg = useMemo(() => {
    if (theme.name == 'light') {
      return FirstPushLight;
    }
    return FirstPushDark;
  }, [theme.name]);

  const branchDropdownImg = useMemo(() => {
    if (theme.name == 'light') {
      return BranchDropdownLight;
    }
    return BranchDropdownDark;
  }, [theme.name]);

  const firstBranchRemoteImg = useMemo(() => {
    if (theme.name == 'light') {
      return FirstBranchRemoteLight;
    }
    return FirstBranchRemoteDark;
  }, [theme.name]);

  const lastSectionTitleChain = useMemo((): LinkChain => {
    return {
      label: orgPortalDocsTitle,
      value: '/docs/product/org-portal',
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
          label: localRepositoriesDocsTitle,
          prefix: '/',
          value: '/docs/product/local-repositories',
        }
      }
    }
  }, [docsTitle, pageDocsTitle, localRepositoriesDocsTitle]);

  const rtRenderers = useMemo(() => {
    return {
      ...richTextRenderers,
      renderLinkNode,
    };
  }, [renderLinkNode]);



  const article = useRichText(
    "product_docs.local_repository_docs",
    {
      docSearch: (
        <DocSearch
          docs="product"
          linkChain={titleChain}
          lastSectionTitleChain={lastSectionTitleChain}
        />
      ),
      newRepositoryImg: (
        <div>
          <ScreenshotImg src={createLocalRepositoryImg}/>
        </div>
      ),
      cloneLocalRepositoryImg: (
        <div>
          <ScreenshotImg src={cloneLocalRepositoryImg}/>
        </div>
      ),
      emptyRepoImg: (
        <div>
          <ScreenshotImg src={emptyRepoImg}/>
        </div>
      ),
      editModeImg: (
        <div>
          <ScreenshotImg src={editModeImg}/>
        </div>
      ),
      compareModeImg: (
        <div>
          <ScreenshotImg src={compareModeImg}/>
        </div>
      ),
      emptyBranchesImg: (
        <div>
          <ScreenshotImg src={emptyBranchesImg}/>
        </div>
      ),
      firstBranchImg: (
        <div>
          <ScreenshotImg src={firstBranchImg}/>
        </div>
      ),
      installPluginImg: (
        <div>
          <ScreenshotImg src={installPluginImg}/>
        </div>
      ),
      firstChangeImg: (
        <div>
          <ScreenshotImg src={firstChangeImg}/>
        </div>
      ),
      firstCommitImg: (
        <div>
          <ScreenshotImg src={firstCommitImg}/>
        </div>
      ),
      firstPushImg: (
        <div>
          <ScreenshotImg src={firstPushImg}/>
        </div>
      ),
      firstDiffImg: (
        <div>
          <ScreenshotImg src={firstDiffImg}/>
        </div>
      ),
      branchDropdownImg: (
        <div>
          <ScreenshotImg src={branchDropdownImg}/>
        </div>
      ),
      remoteBranchImg: (
        <div>
          <ScreenshotImg src={firstBranchRemoteImg}/>
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

export default LocalRepositoryDocs;