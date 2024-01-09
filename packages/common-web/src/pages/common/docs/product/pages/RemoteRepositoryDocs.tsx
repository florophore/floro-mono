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

import ApproveLight from "@floro/main/public/doc_images/product/remote_repositories/approve.light.png"
import ApproveDark from "@floro/main/public/doc_images/product/remote_repositories/approve.dark.png"

import CreateMRLight from "@floro/main/public/doc_images/product/remote_repositories/create_mr.light.png"
import CreateMRDark from "@floro/main/public/doc_images/product/remote_repositories/create_mr.dark.png"

import DoneMRLight from "@floro/main/public/doc_images/product/remote_repositories/done_mr.light.png"
import DoneMRDark from "@floro/main/public/doc_images/product/remote_repositories/done_mr.dark.png"

import FinalHomeMergeTextLight from "@floro/main/public/doc_images/product/remote_repositories/final_home_merge_text.light.png"
import FinalHomeMergeTextDark from "@floro/main/public/doc_images/product/remote_repositories/final_home_merge_text.dark.png"

import FinalLocalMergeHomeLight from "@floro/main/public/doc_images/product/remote_repositories/final_local_merge_home.light.png"
import FinalLocalMergeHomeDark from "@floro/main/public/doc_images/product/remote_repositories/final_local_merge_home.dark.png"

import HistoryLight from "@floro/main/public/doc_images/product/remote_repositories/history.light.png"
import HistoryDark from "@floro/main/public/doc_images/product/remote_repositories/history.dark.png"

import PullLight from "@floro/main/public/doc_images/product/remote_repositories/pull.light.png"
import PullDark from "@floro/main/public/doc_images/product/remote_repositories/pull.dark.png"

import RequestReviewLight from "@floro/main/public/doc_images/product/remote_repositories/request_review.light.png"
import RequestReviewDark from "@floro/main/public/doc_images/product/remote_repositories/request_review.dark.png"

import SwitchBranchLight from "@floro/main/public/doc_images/product/remote_repositories/switch_branch.light.png"
import SwitchBranchDark from "@floro/main/public/doc_images/product/remote_repositories/switch_branch.dark.png"

import RepositorySettingsLight from "@floro/main/public/doc_images/product/remote_repositories/repo_settings.light.png"
import RepositorySettingsDark from "@floro/main/public/doc_images/product/remote_repositories/repo_settings.dark.png"

import BranchSettingsLight from "@floro/main/public/doc_images/product/remote_repositories/branch_settings.light.png"
import BranchSettingsDark from "@floro/main/public/doc_images/product/remote_repositories/branch_settings.dark.png"


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


function RemoteRepositoryDocs() {
  const theme = useTheme();
  // change this
  const docsMetaTitle = usePlainText("meta_tags.remote_repository_docs");

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
  const localRepositoriesDocsTitle = usePlainText("doc_titles.local_repositories_docs_page_title");
  const remoteRepositoriesDocsTitle = usePlainText("doc_titles.remote_repositories_docs_page_title");

  const approveImg = useMemo(() => {
    if (theme.name == 'light') {
      return ApproveLight;
    }
    return ApproveDark;
  }, [theme.name]);

  const createMRImg = useMemo(() => {
    if (theme.name == 'light') {
      return CreateMRLight;
    }
    return CreateMRDark;
  }, [theme.name]);

  const requestReviewerImg = useMemo(() => {
    if (theme.name == 'light') {
      return RequestReviewLight;
    }
    return RequestReviewDark;
  }, [theme.name]);

  const repoSettingsImg = useMemo(() => {
    if (theme.name == 'light') {
      return RepositorySettingsLight;
    }
    return RepositorySettingsDark;
  }, [theme.name]);

  const branchSettingsImg = useMemo(() => {
    if (theme.name == 'light') {
      return BranchSettingsLight;
    }
    return BranchSettingsDark;
  }, [theme.name]);

  const historyImg = useMemo(() => {
    if (theme.name == 'light') {
      return HistoryLight;
    }
    return HistoryDark;
  }, [theme.name]);

  const doneMRImg = useMemo(() => {
    if (theme.name == 'light') {
      return DoneMRLight;
    }
    return DoneMRDark;
  }, [theme.name]);

  const switchBranchesImg = useMemo(() => {
    if (theme.name == 'light') {
      return SwitchBranchLight;
    }
    return SwitchBranchDark;
  }, [theme.name]);

  const pullBranchImg = useMemo(() => {
    if (theme.name == 'light') {
      return PullLight;
    }
    return PullDark;
  }, [theme.name]);

  const finalLocalMergeHomeImg = useMemo(() => {
    if (theme.name == "light") {
      return FinalLocalMergeHomeLight;
    }
    return FinalLocalMergeHomeDark;
  }, [theme.name])

  const lastSectionTitleChain = useMemo((): LinkChain => {
    return {
      label: localRepositoriesDocsTitle,
      value: '/docs/product/local-repositories',
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
          label: remoteRepositoriesDocsTitle,
          prefix: '/',
          value: '/docs/product/remote-repositories',
        }
      }
    }
  }, [docsTitle, pageDocsTitle, remoteRepositoriesDocsTitle]);

  const rtRenderers = useMemo(() => {
    return {
      ...richTextRenderers,
      renderLinkNode,
    };
  }, [renderLinkNode]);



  const article = useRichText(
    "product_docs.remote_repository_docs",
    {
      docSearch: (
        <DocSearch
          docs="product"
          linkChain={titleChain}
          lastSectionTitleChain={lastSectionTitleChain}
        />
      ),
      createMRImg: (
        <div>
          <ScreenshotImg src={createMRImg}/>
        </div>
      ),
      approveImg: (
        <div>
          <ScreenshotImg src={approveImg}/>
        </div>
      ),
      requestReviewerImg: (
        <div>
          <ScreenshotImg src={requestReviewerImg}/>
        </div>
      ),
      repoSettingsImg: (
        <div>
          <ScreenshotImg src={repoSettingsImg}/>
        </div>
      ),
      branchSettingsImg: (
        <div>
          <ScreenshotImg src={branchSettingsImg}/>
        </div>
      ),
      doneMRImg: (
        <div>
          <ScreenshotImg src={doneMRImg}/>
        </div>
      ),
      historyImg: (
        <div>
          <ScreenshotImg src={historyImg}/>
        </div>
      ),
      switchBranchesImg: (
        <div>
          <ScreenshotImg src={switchBranchesImg}/>
        </div>
      ),
      pullBranchImg: (
        <div>
          <ScreenshotImg src={pullBranchImg}/>
        </div>
      ),
      finalLocalMergeHomeImg: (
        <div>
          <ScreenshotImg src={finalLocalMergeHomeImg}/>
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

export default RemoteRepositoryDocs;