import React, {
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
import { PhraseKeys, StaticLinkNode } from "@floro/common-generators/floro_modules/text-generator";
import { Link } from "react-router-dom";
import PageWrapper from "../../../../components/wrappers/PageWrapper";

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
import { usePlainText, useRichText } from "../../../../floro_listener/hooks/locales";


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

const TutorialTitle = styled.h2`
  font-size: 1.7rem;
  font-weight: 500;
  padding: 0;
  margin: 0;
  font-family: "MavenPro";
  color: ${(props) => props.theme.colors.contrastTextLight};
  max-width: 800px;
  @media screen and (max-width: 767px) {
    font-size: 1.44rem;
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

const YTIframe = styled.iframe`
  border-radius: 8px;
  width: 100%;
  max-width: 800px;
  height: 440px;
`;

const ThemePlugin = () => {

  const theme = useTheme();
  const title = usePlainText("meta_tags.theme_plugin");
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

  const rtRenderers = useMemo(() => {
    return {
      ...richTextRenderers,
      renderLinkNode,
    };
  }, [renderLinkNode]);

  const article = useRichText(
    "plugin_docs.theme_plugin",
    {
      mainTitle: function (
        content: ReactElement<any, string | JSXElementConstructor<any>>
      ): ReactElement<any, string | JSXElementConstructor<any>> {
        return <SectionTitle>{content}</SectionTitle>;
      },
      subTitle: function (
        content: ReactElement<any, string | JSXElementConstructor<any>>,
        phrase: keyof PhraseKeys["plugin_docs.icons_plugin"]["styledContents"]
      ): ReactElement<any, string | JSXElementConstructor<any>> {
        if (phrase == "features") {
          return <SubSectionTitle style={{marginTop: 48}}>{content}</SubSectionTitle>;
        }
        return <SubSectionTitle>{content}</SubSectionTitle>;
      },
      tutorialTitle: function (
        content: ReactElement<any, string | JSXElementConstructor<any>>
      ): ReactElement<any, string | JSXElementConstructor<any>> {
        return <TutorialTitle>{content}</TutorialTitle>;
      },
      demoVideo: (
        <YTIframe
          src="https://www.youtube.com/embed/jzYnr0VCmgM"
          style={{marginBottom: 48}}
          allowFullScreen
        />
      ),
    },
    rtRenderers
  );

  return (
    <PageWrapper>
      <Helmet>
        <title>{title}</title>
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

export default React.memo(ThemePlugin);