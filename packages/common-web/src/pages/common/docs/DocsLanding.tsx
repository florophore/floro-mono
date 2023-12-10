import {
  useMemo,
  useState,
  useCallback,
  useEffect,
  JSXElementConstructor,
  ReactElement,
} from "react";
import styled from "@emotion/styled";
import { useIcon } from "../../../floro_listener/FloroIconsProvider";
import { useTheme } from "@emotion/react";
import { usePlainText, useRichText } from "../../../floro_listener/hooks/locales";
import { Helmet } from "react-helmet";
import ColorPalette from "@floro/styles/ColorPalette";
import PageWrapper from "../../../components/wrappers/PageWrapper";
import { richTextRenderers } from "@floro/common-web/src/floro_listener/FloroTextRenderer";
import { StaticLinkNode } from "@floro/common-generators/floro_modules/text-generator";
import { Link } from "react-router-dom";

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


function DocsLanding() {
  const theme = useTheme();
  const docsMetaTitle = usePlainText("meta_tags.docs");

  const textIcon = useIcon("docs.text-plugin");
  const paletteIcon = useIcon("docs.palette-plugin");
  const themeIcon = useIcon("docs.theme-plugin");
  const iconsIcon = useIcon("docs.icons-plugin");

  const textPluginDescription = useRichText("docs.text_plugin_description")
  const iconsPluginDescription = useRichText("docs.icons_plugin_description")
  const themePluginDescription = useRichText("docs.theme_plugin_description")
  const palettePluginDescription = useRichText("docs.palette_plugin_description")

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

  const productDocsIndex = useRichText(
    "product_docs.product_docs_index",
    {},
    rtRenderers
  );
  const article = useRichText(
    "docs.docs_general",
    {
      productDocsIndex,
      pluginsList: (
        <section style={{ marginTop: 0, marginBottom: 0 }}>
          <div>
            <PluginRow>
              <PluginIcon src={textIcon} />
              <div
                style={{
                  marginLeft: 24,
                  display: "flex",
                  flexDirection: "column",
                }}
              >
                <PluginTitle>
                  <Link
                    style={{
                      fontWeight: 600,
                      color: theme.colors.linkColor,
                      display: "inline-block",
                    }}
                    to={"/docs/plugins/text"}
                  >
                    {"Text"}
                  </Link>
                </PluginTitle>
                <PluginDescription>
                  {textPluginDescription}
                </PluginDescription>
              </div>
            </PluginRow>
          </div>
          <div style={{ marginTop: 24 }}>
            <PluginRow>
              <PluginIcon src={iconsIcon} />
              <div
                style={{
                  marginLeft: 24,
                  display: "flex",
                  flexDirection: "column",
                }}
              >
                <PluginTitle>
                  <Link
                    style={{
                      fontWeight: 600,
                      color: theme.colors.linkColor,
                      display: "inline-block",
                    }}
                    to={"/docs/plugins/icons"}
                  >
                    {"Icons"}
                  </Link>
                </PluginTitle>
                <PluginDescription>
                  {iconsPluginDescription}
                </PluginDescription>
              </div>
            </PluginRow>
          </div>
          <div style={{ marginTop: 24 }}>
            <PluginRow>
              <PluginIcon src={themeIcon} />
              <div
                style={{
                  marginLeft: 24,
                  display: "flex",
                  flexDirection: "column",
                }}
              >
                <PluginTitle>
                  <Link
                    style={{
                      fontWeight: 600,
                      color: theme.colors.linkColor,
                      display: "inline-block",
                    }}
                    to={"/docs/plugins/theme"}
                  >
                    {"Theme"}
                  </Link>
                </PluginTitle>
                <PluginDescription>
                  {themePluginDescription}
                </PluginDescription>
              </div>
            </PluginRow>
          </div>
          <div style={{ marginTop: 24 }}>
            <PluginRow>
              <PluginIcon src={paletteIcon} />
              <div
                style={{
                  marginLeft: 24,
                  display: "flex",
                  flexDirection: "column",
                }}
              >
                <PluginTitle>
                  <Link
                    style={{
                      fontWeight: 600,
                      color: theme.colors.linkColor,
                      display: "inline-block",
                    }}
                    to={"/docs/plugins/palette"}
                  >
                    {"Palette"}
                  </Link>
                </PluginTitle>
                <PluginDescription>
                  {palettePluginDescription}
                </PluginDescription>
              </div>
            </PluginRow>
          </div>
        </section>
      ),
      mainTitle: function (
        content: ReactElement<any, string | JSXElementConstructor<any>>
      ): ReactElement<any, string | JSXElementConstructor<any>> {
        return <SectionTitle>{content}</SectionTitle>;
      },
      sectionTitle: function (
        content: ReactElement<any, string | JSXElementConstructor<any>>,
        title
      ): ReactElement<any, string | JSXElementConstructor<any>> {
        return (
          <SubSectionTitle
            style={{
              marginTop: 24,
            }}
          >
            {title == "product documentation" && (
              <>
                <Link
                  style={{
                    fontWeight: 600,
                    color: theme.colors.linkColor,
                    display: "inline-block",
                  }}
                  to={"/docs/product"}
                >
                  {content}
                </Link>
              </>
            )}
            {title == "developer documentation" && (
              <>
                <Link
                  style={{
                    fontWeight: 600,
                    color: theme.colors.linkColor,
                    display: "inline-block",
                  }}
                  to={"/docs/development"}
                >
                  {content}
                </Link>
              </>
            )}
            {title == "plugin documentation" && <>
                <Link
                  style={{
                    fontWeight: 600,
                    color: theme.colors.linkColor,
                    display: "inline-block",
                  }}
                  to={"/docs/plugins"}
                >
                  {content}
                </Link>
            </>}
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

export default DocsLanding;