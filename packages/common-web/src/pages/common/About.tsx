import { useMemo, useState, useCallback } from "react";
import styled from "@emotion/styled";
import { useIcon } from "../../floro_listener/FloroIconsProvider";
import { useTheme } from "@emotion/react";
import { usePlainText, useRichText } from "../../floro_listener/hooks/locales";
import { Helmet } from "react-helmet";
import Button from "@floro/storybook/stories/design-system/Button";
import ScreenShotLight from "@floro/main/public/pngs/light.no_edge.png";
import ScreenShotDark from "@floro/main/public/pngs/dark.no_edge.png";
import CLICopy from "../../components/home/CLICopy";
import { Link } from "react-router-dom";
import ColorPalette from "@floro/styles/ColorPalette";
import PageWrapper from "../../components/wrappers/PageWrapper";
import { TextRenderers, renderers as richTextRenderers } from  "@floro/common-web/src/floro_listener/FloroTextRenderer";
import { StaticLinkNode } from "@floro/common-generators/floro_modules/text-generator";

const AboutWrapper = styled.div`
  width: 100%;
  min-height: 100vh;
  background: ${(props) => props.theme.background};
  padding-top: 48px;
`;


const AboutHeaderTitle = styled.h1`
  font-size: 2rem;
  font-weight: 600;
  padding: 0;
  margin: 0;
  font-family: "MavenPro";
  color: ${props => props.theme.colors.titleText};
`;

const SectionTitle = styled.h2`
  font-size: 2rem;
  font-weight: 600;
  padding: 0;
  margin: 0;
  font-family: "MavenPro";
  color: ${props => props.theme.colors.titleText};
`;

const SectionParagraph = styled.p`
  font-size: 1.44rem;
  font-weight: 400;
  padding: 0;
  margin: 0;
  font-family: "MavenPro";
  color: ${props => props.theme.colors.contrastText};
`;

const LargeNavInfo = styled.div`
  flex-direction: row;
  height: 100%;
  width: 100%;
  padding-left: 48px;
  align-items: center;
  justify-content: space-between;
  @media screen and (min-width: 1024px) {
    display: flex;
  }
  @media screen and (min-width: 768px) and (max-width: 1023px) {
    display: flex;
  }
  @media screen and (max-width: 767px) {
    display: none;
  }
`;

function AboutPage() {
  const theme = useTheme();
  const floroText = useIcon("main.floro-text");
  const aboutMetaTitle = usePlainText("meta_tags.about");

  const renderLinkNode = useCallback(
    (node: StaticLinkNode, renderers: TextRenderers): React.ReactElement => {
      let children = renderers.renderStaticNodes(node.children, renderers);
      return <a style={{color: theme.colors.linkColor}} href={node.href} target="_blank">{children}</a>;
    },
    [theme]
  );

  const dependentTypes = useIcon("about.floro-pipeline");
  const listTransfrom = useIcon("about.list-transform");
  const keySyntax = useIcon("about.key-syntax");
  const howItWorksBlurb = useRichText("meta_tags.how_it_works_blurb", {}, {
    ...richTextRenderers,
    renderLinkNode
  });

  const howItWorksBlurbPart2 = useRichText("meta_tags.how_it_works_blurb_part_2", {}, {
    ...richTextRenderers,
    renderLinkNode
  });

  const howItWorksBlurbPart3 = useRichText("meta_tags.how_it_works_blurb_part_3", {}, {
    ...richTextRenderers,
    renderLinkNode
  });

  const howItWorksBlurbPart4 = useRichText("meta_tags.how_it_works_blurb_part_4", {}, {
    ...richTextRenderers,
    renderLinkNode
  });

  return (
    <PageWrapper>
      <Helmet>
        <title>{aboutMetaTitle}</title>
      </Helmet>
      <AboutWrapper>
        <div style={{
          padding: 16
        }}>
          <section>
            <SectionTitle>{'How floro works'}</SectionTitle>
            <SectionParagraph style={{marginTop: 24}}>
              {howItWorksBlurb}
            </SectionParagraph>
            <div style={{ marginTop: 24}}>
              <img src={dependentTypes} style={{
                width: '100%'
              }}/>
            </div>
            <SectionParagraph style={{marginTop: 24}}>
              {howItWorksBlurbPart2}
            </SectionParagraph>
            <div style={{ marginTop: 24}}>
              <img src={listTransfrom} style={{
                width: '100%'
              }}/>
            </div>
            <SectionParagraph style={{marginTop: 24}}>
              {howItWorksBlurbPart3}
            </SectionParagraph>
            <div style={{ marginTop: 24}}>
              <img src={keySyntax} style={{
                width: '80%',
                minWidth: 320
              }}/>
            </div>
            <SectionParagraph style={{marginTop: 24}}>
              {howItWorksBlurbPart4}
            </SectionParagraph>
          </section>
        </div>
      </AboutWrapper>
    </PageWrapper>
  );
}

export default AboutPage;