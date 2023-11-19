import { useMemo, useState, useCallback, useEffect } from "react";
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
import { useEnv } from "@floro/common-react/src/env/EnvContext";

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
  font-size: 2.4rem;
  font-weight: 600;
  padding: 0;
  margin: 0;
  font-family: "MavenPro";
  color: ${props => props.theme.colors.titleText};
`;

const SubSectionTitle = styled.h2`
  font-size: 2rem;
  font-weight: 500;
  padding: 0;
  margin: 0;
  font-family: "MavenPro";
  color: ${props => props.theme.colors.contrastText};
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

  const [sequenceCount, setSequenceCount] = useState(4);
  const [direction, setDirection] = useState('descending');

  useEffect(() => {
    const timeout = setTimeout(() => {
      if ( sequenceCount == 4) {
        setDirection('descending');
        setSequenceCount(3);
        return;
      }
      if ( sequenceCount == 1) {
        setDirection('ascending');
        setSequenceCount(2);
        return;
      }
      if (direction == 'ascending') {
        setSequenceCount(sequenceCount + 1);
        return;
      }
      if (direction == 'descending') {
        setSequenceCount(sequenceCount - 1);
        return;
      }
    }, 800);
    return () => {
      clearTimeout(timeout);
    }
  }, [sequenceCount, direction]);

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

  const treeListSequence1 = useIcon("about.treelist-sequence-1");
  const treeListSequence2 = useIcon("about.treelist-sequence-2");
  const treeListSequence3 = useIcon("about.treelist-sequence-3");
  const treeListSequence4 = useIcon("about.treelist-sequence-4");
  const versionUpdates = useIcon("about.version-updates");
  const setsToTypesUpdates = useIcon("about.set-to-types");

  const treeListSequenceIcon = useMemo(() => {
    if (sequenceCount == 1) {
      return treeListSequence1;
    }
    if (sequenceCount == 2) {
      return treeListSequence2;
    }
    if (sequenceCount == 3) {
      return treeListSequence3;
    }
    return treeListSequence4;
  }, [
    sequenceCount,
    treeListSequence1,
    treeListSequence2,
    treeListSequence3,
    treeListSequence4,
  ]);
  const howItWorksTitle = useRichText("about.how_floro_works_title", {}, {
    ...richTextRenderers,
    renderLinkNode
  });
  const howItWorksBlurb = useRichText("about.how_it_works_blurb", {}, {
    ...richTextRenderers,
    renderLinkNode
  });

  const howItWorksBlurbPart2 = useRichText("about.how_it_works_blurb_part_2", {}, {
    ...richTextRenderers,
    renderLinkNode
  });

  const howItWorksBlurbPart3 = useRichText("about.how_it_works_blurb_part_3", {}, {
    ...richTextRenderers,
    renderLinkNode
  });

  const howItWorksBlurbPart4 = useRichText("about.how_it_works_blurb_part_4", {}, {
    ...richTextRenderers,
    renderLinkNode
  });

  const thingsChangeTitle = useRichText("about.things_change_title", {}, {
    ...richTextRenderers,
    renderLinkNode
  });

  const thingsChangeBlurb1 = useRichText("about.things_change_blurb_1", {}, {
    ...richTextRenderers,
    renderLinkNode
  });

  const thingsChangeBlurb2 = useRichText("about.things_change_blurb_2", {}, {
    ...richTextRenderers,
    renderLinkNode
  });

  const thingsChangeBlurb3 = useRichText("about.things_change_blurb_3", {}, {
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
            <SectionTitle>{howItWorksTitle}</SectionTitle>
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
            <div style={{ marginTop: 24}}>
              <img src={treeListSequenceIcon} style={{
                width: '100%'
              }}/>
            </div>
          </section>

          <SubSectionTitle style={{
            marginTop: 24
          }}>{thingsChangeTitle}</SubSectionTitle>
          <SectionParagraph style={{marginTop: 24}}>
            {thingsChangeBlurb1}
          </SectionParagraph>
            <div style={{ marginTop: 24}}>
              <img src={versionUpdates} style={{
                width: '100%'
              }}/>
            </div>
          <SectionParagraph style={{marginTop: 24}}>
            {thingsChangeBlurb2}
          </SectionParagraph>
            <div style={{ marginTop: 24}}>
              <img src={setsToTypesUpdates} style={{
                width: '100%'
              }}/>
            </div>
          <SectionParagraph style={{marginTop: 24}}>
            {thingsChangeBlurb3}
          </SectionParagraph>
        </div>
      </AboutWrapper>
    </PageWrapper>
  );
}

export default AboutPage;