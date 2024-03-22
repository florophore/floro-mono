import {
  useMemo,
  useState,
  useCallback,
  JSXElementConstructor,
  ReactElement,
} from "react";
import styled from "@emotion/styled";
import { useTheme } from "@emotion/react";
import { usePlainText, useRichText } from "../../floro_listener/hooks/locales";
import { Helmet } from "react-helmet";
import PageWrapper from "../../components/wrappers/PageWrapper";
import { richTextRenderers } from "@floro/common-web/src/floro_listener/FloroTextRenderer";
import { StaticLinkNode } from "@floro/common-generators/floro_modules/text-generator";
import { Link } from "react-router-dom";
import Checkbox from "@floro/storybook/stories/design-system/Checkbox";

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
`;

const SubSectionTitle = styled.h2`
  font-size: 1.7rem;
  font-weight: 500;
  padding: 0;
  margin: 0;
  font-family: "MavenPro";
  color: ${(props) => props.theme.colors.titleText};
  @media screen and (max-width: 767px) {
    font-size: 1.44rem;
  }
`;

const SectionParagraph = styled.div`
  font-size: 1.2rem;
  font-weight: 400;
  padding: 0;
  margin: 0;
  font-family: "MavenPro";
  color: #7C7C7CFF;
  margin-right: 12px;
  color: ${(props) => props.theme.colors.contrastText};
  @media screen and (max-width: 767px) {
    font-size: 1rem;
  }
`;

const NotAnEngineer = styled.p`
  font-size: 1.44rem;
  font-weight: 400;
  padding: 0;
  margin: 0;
  font-family: "MavenPro";
  color: ${(props) => props.theme.colors.contrastTextLight};
  margin-top: -4px;
  margin-right: 12px;
`;

function AboutPage() {
  const aboutMetaTitle = usePlainText("meta_tags.about");
  const [showNonTechnical, setShowNonTechnical] = useState(false);

  const theme = useTheme();
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

  const notAnEngineer = useRichText("about.show_non-technical");

  const technicalAbout = useRichText(
    "about.about_technical",
    {
      sectionTitle: function (
        content: ReactElement<any, string | JSXElementConstructor<any>>
      ): ReactElement<any, string | JSXElementConstructor<any>> {
        return <SubSectionTitle>{content}</SubSectionTitle>;
      },
    },
    rtRenderers
  );

  const nonTechnicalAbout = useRichText(
    "about.about_non-technical",
    {
      sectionTitle: function (
        content: ReactElement<any, string | JSXElementConstructor<any>>
      ): ReactElement<any, string | JSXElementConstructor<any>> {
        return <SubSectionTitle>{content}</SubSectionTitle>;
      },
    },
    rtRenderers
  );

  const article = useRichText(
    "about.about_general",
    {
      technicalToggle: (
        <div
          style={{
            display: "flex",
            flexDirection: "row",
            alignItems: "center",
          }}
        >
          <NotAnEngineer>{notAnEngineer}</NotAnEngineer>
          <Checkbox
            isChecked={showNonTechnical}
            onChange={function (): void {
              setShowNonTechnical(!showNonTechnical);
            }}
          />
        </div>
      ),
      aboutContent: <div>
        {!showNonTechnical && technicalAbout}
        {showNonTechnical && nonTechnicalAbout}
      </div>,
      title: function (
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
        <title>{aboutMetaTitle}</title>
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
  )
}

export default AboutPage;
