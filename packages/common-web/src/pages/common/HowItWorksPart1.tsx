import {
  useMemo,
  useState,
  useCallback,
  useEffect,
  JSXElementConstructor,
  ReactElement,
} from "react";
import styled from "@emotion/styled";
import { useIcon } from "../../floro_listener/FloroIconsProvider";
import { useTheme } from "@emotion/react";
import { usePlainText, useRichText } from "../../floro_listener/hooks/locales";
import { Helmet } from "react-helmet";
import ColorPalette from "@floro/styles/ColorPalette";
import PageWrapper from "../../components/wrappers/PageWrapper";
import { richTextRenderers } from "@floro/common-web/src/floro_listener/FloroTextRenderer";
import { StaticLinkNode } from "@floro/common-generators/floro_modules/text-generator";
import Input from "@floro/storybook/stories/design-system/Input";
import {
  getArrayStringDiff,
  getLCS,
  getMergeSequence,
} from "floro/dist/src/sequenceoperations";
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
`;

const SubSectionTitle = styled.h2`
  font-size: 2rem;
  font-weight: 500;
  padding: 0;
  margin: 0;
  font-family: "MavenPro";
  color: ${(props) => props.theme.colors.contrastText};
`;

const SectionParagraph = styled.div`
  font-size: 1.44rem;
  font-weight: 400;
  padding: 0;
  margin: 0;
  font-family: "MavenPro";
  color: ${(props) => props.theme.colors.contrastText};
  word-wrap: break-word;
`;

const AnimationToggleIcon = styled.img`
  height: 64px;
  width: 64px;
  cursor: pointer;
  @media screen and (max-width: 767px) {
    height: 48px;
    width: 48px;
  }
`;

const AnimationDisabledOverlay = styled.div`
  background: ${(props) => props.theme.colors.disableOverlay};
  top: 0;
  left: 0;
  height: 64px;
  width: 64px;
  position: absolute;
  border-radius: 50%;
  opacity: 0.5;
  cursor: not-allowed;
  @media screen and (max-width: 767px) {
    height: 48px;
    width: 48px;
  }
`;

const AnimationPlayWrapper = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  max-width: 160px;
  width: 100%;
  @media screen and (max-width: 767px) {
    max-width: 120px;
  }
`;

function AboutPage() {
  const theme = useTheme();
  const aboutMetaTitle = usePlainText("meta_tags.about");

  const [sequenceCount, setSequenceCount] = useState(4);
  const [direction, setDirection] = useState("descending");
  const [isPlaying, setIsPlaying] = useState(true);

  const togglePlaying = useCallback(() => {
    setIsPlaying(!isPlaying);
  }, [isPlaying]);

  const isForwardDisabled = useMemo(() => {
    if (isPlaying) {
      return true;
    }
    if (sequenceCount == 1) {
      return true;
    }
    return false;
  }, [isPlaying, sequenceCount]);

  const isBackwardDisabled = useMemo(() => {
    if (isPlaying) {
      return true;
    }
    if (sequenceCount == 4) {
      return true;
    }
    return false;
  }, [isPlaying, sequenceCount]);

  const onBackward = useCallback(() => {
    if (isBackwardDisabled) {
      return;
    }
    setSequenceCount(sequenceCount + 1);
  }, [isBackwardDisabled, sequenceCount]);

  const onForward = useCallback(() => {
    if (isForwardDisabled) {
      return;
    }
    setSequenceCount(sequenceCount - 1);
  }, [isForwardDisabled, sequenceCount]);

  useEffect(() => {
    if (!isPlaying) {
      return;
    }
    const timeout = setTimeout(() => {
      if (!isPlaying) {
        return;
      }
      if (sequenceCount == 4) {
        setDirection("descending");
        setSequenceCount(3);
        return;
      }
      if (sequenceCount == 1) {
        setDirection("ascending");
        setSequenceCount(2);
        return;
      }
      if (direction == "ascending") {
        setSequenceCount(sequenceCount + 1);
        return;
      }
      if (direction == "descending") {
        setSequenceCount(sequenceCount - 1);
        return;
      }
    }, 1200);
    return () => {
      clearTimeout(timeout);
    };
  }, [sequenceCount, direction, isPlaying]);

  const renderLinkNode = useCallback(
    (
      node: StaticLinkNode<React.ReactElement>,
      renderers
    ): React.ReactElement => {
      let children = renderers.renderStaticNodes(node.children, renderers);
      if (node.linkName == "skip to part 2" || node.linkName == "how diffing and merging work") {
        return (
          <Link
            style={{ fontWeight: 600, color: theme.colors.linkColor, display: 'inline-block' }}
            to={`/technical-overview-part-2`}
          >
            {children}
          </Link>
        );
      }
      return (
        <a
          style={{ color: theme.colors.linkColor, display: 'inline-block' }}
          href={node.href}
          target="_blank"
        >
          {children}
        </a>
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

  const overviewIcon = useIcon("about.overview-with-duck");
  const dependentTypes = useIcon("about.floro-pipeline");
  const listTransfrom = useIcon("about.list-transform");
  const keySyntax = useIcon("about.key-syntax");

  const treeListSequence1 = useIcon("about.treelist-sequence-1");
  const treeListSequence2 = useIcon("about.treelist-sequence-2");
  const treeListSequence3 = useIcon("about.treelist-sequence-3");
  const treeListSequence4 = useIcon("about.treelist-sequence-4");
  const versionUpdates = useIcon("about.version-updates");
  const setsUpdates = useIcon("about.set-updates");
  const relationsRefactorPart1 = useIcon("about.relations-refactor-part-1");
  const cascadingRelations = useIcon("about.cascading-relations");
  const spreadsheetIcon = useIcon("about.spreadsheet");
  const playIcon = useIcon("about.play");
  const pauseIcon = useIcon("about.pause");
  const forwardIcon = useIcon("about.forward");
  const backwardIcon = useIcon("about.backward");

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

  const blog = useRichText(
    "how_it_works.how_it_works_blog",
    {
      titleContentImage: (
        <div>
          <img
            src={overviewIcon}
            style={{
              width: "100%",
            }}
          />
        </div>
      ),
      dependentTypesSchematic: (
        <div>
          <img
            src={dependentTypes}
            style={{
              width: "100%",
            }}
          />
        </div>
      ),
      kvStateTreeStateStaticImage: (
        <div>
          <img
            src={listTransfrom}
            style={{
              width: "100%",
            }}
          />
        </div>
      ),
      keyPathImage: (
        <div>
          <img
            src={keySyntax}
            style={{
              width: "80%",
              minWidth: 320,
            }}
          />
        </div>
      ),
      kvAnimation: (
        <div>
          <section>
            <div style={{ marginTop: 24 }}>
              <img
                src={treeListSequenceIcon}
                style={{
                  width: "100%",
                }}
              />
            </div>
          </section>
          <div
            style={{
              marginTop: 24,
              marginBottom: 24,
              display: "flex",
              flexDirection: "row",
              justifyContent: "space-between",
              width: "100%",
            }}
          >
            {isPlaying && (
              <AnimationToggleIcon src={pauseIcon} onClick={togglePlaying} />
            )}
            {!isPlaying && (
              <AnimationToggleIcon src={playIcon} onClick={togglePlaying} />
            )}
            <AnimationPlayWrapper>
              <div
                style={{
                  position: "relative",
                }}
              >
                <AnimationToggleIcon src={backwardIcon} onClick={onBackward} />
                {isBackwardDisabled && <AnimationDisabledOverlay />}
              </div>
              <div
                style={{
                  position: "relative",
                }}
              >
                <AnimationToggleIcon src={forwardIcon} onClick={onForward} />
                {isForwardDisabled && <AnimationDisabledOverlay />}
              </div>
            </AnimationPlayWrapper>
          </div>
        </div>
      ),
      versionUpdateImages: (
        <div>
          <img
            src={versionUpdates}
            style={{
              width: "100%",
            }}
          />
        </div>
      ),
      setUpdateImages: (
        <div>
          <img
            src={setsUpdates}
            style={{
              width: "100%",
            }}
          />
        </div>
      ),
      relationsSchema: (
        <div>
          <img
            src={relationsRefactorPart1}
            style={{
              width: "100%",
            }}
          />
        </div>
      ),
      boundedCascading: (
        <div>
          <img
            src={cascadingRelations}
            style={{
              width: "100%",
            }}
          />
        </div>
      ),
      relationsSpreadsheet: (
        <div>
          <img
            src={spreadsheetIcon}
            style={{
              width: "100%",
            }}
          />
        </div>
      ),
      mainTitle: function (
        content: ReactElement<any, string | JSXElementConstructor<any>>
      ): ReactElement<any, string | JSXElementConstructor<any>> {
        return <SectionTitle>{content}</SectionTitle>;
      },
      sectionTitle: function (
        content: ReactElement<any, string | JSXElementConstructor<any>>
      ): ReactElement<any, string | JSXElementConstructor<any>> {
        return (
          <SubSectionTitle
            style={{
              marginTop: 24,
            }}
          >
            {content}
          </SubSectionTitle>
        );
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
          <SectionParagraph><section>{blog}</section></SectionParagraph>
        </div>
      </AboutWrapper>
    </PageWrapper>
  );
}

export default AboutPage;
