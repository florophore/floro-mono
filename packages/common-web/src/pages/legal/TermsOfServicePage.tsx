import { useCallback, useMemo } from "react";
import styled from "@emotion/styled";
import { usePlainText, useRichText } from "../../floro_listener/hooks/locales";
import { Helmet } from "react-helmet";
import PageWrapper from "../../components/wrappers/PageWrapper";
import { Link } from "react-router-dom";
import { useTheme } from "@emotion/react";
import { StaticLinkNode } from "@floro/common-generators/floro_modules/text-generator";
import { TextRenderers, richTextRenderers } from "../../floro_listener/FloroTextRenderer";

const AboutWrapper = styled.div`
  width: 100%;
  min-height: 100dvh;
  background: ${(props) => props.theme.background};
  padding-top: 48px;
`;

const SectionParagraph = styled.div`
  font-size: 1.44rem;
  font-weight: 400;
  padding: 0;
  margin: 0;
  font-family: "MavenPro";
  color: ${(props) => props.theme.colors.contrastText};
`;

function TermsOfServicePage() {
  const termsOfServiceMetaTag = usePlainText("meta_tags.terms_of_service");

  const theme = useTheme();

  const renderLinkNode = useCallback(
    (
      node: StaticLinkNode<React.ReactElement>,
      renderers
    ): React.ReactElement => {
      let children = renderers.renderStaticNodes(node.children, renderers);
      return (
        <Link
          style={{
            fontWeight: 600,
            color: theme.colors.linkColor,
            display: "inline-block",
          }}
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

  const tos = useRichText(
    "legal.terms_of_service",
    {},
    rtRenderers
  );
  return (
    <PageWrapper isCentered>
      <Helmet>
        <title>{termsOfServiceMetaTag}</title>
      </Helmet>
      <AboutWrapper>
        <div
          style={{
            paddingTop: 16,
            paddingLeft: 16,
            paddingRight: 16,
            paddingBottom: 32,
          }}
        >
          <SectionParagraph>{tos}</SectionParagraph>
        </div>
      </AboutWrapper>
    </PageWrapper>
  );
}

export default TermsOfServicePage;