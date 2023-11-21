import { useMemo, useState, useCallback, useEffect, ChangeEvent } from "react";
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
import {
  TextRenderers,
  renderers as richTextRenderers,
} from "@floro/common-web/src/floro_listener/FloroTextRenderer";
import { StaticLinkNode } from "@floro/common-generators/floro_modules/text-generator";
import { useEnv } from "@floro/common-react/src/env/EnvContext";
import Input from "@floro/storybook/stories/design-system/Input";
import {
  StringDiff,
  getArrayStringDiff,
  getDiff,
  getLCS,
  getTextDiff,
} from "floro/dist/src/sequenceoperations";
import { after } from "node:test";

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
  color: ${(props) => props.theme.colors.titleText};
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
  const floroText = useIcon("main.floro-text");
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
  }, [isBackwardDisabled, sequenceCount])

  const onForward = useCallback(() => {
    if (isForwardDisabled) {
      return;
    }
    setSequenceCount(sequenceCount - 1);
  }, [isForwardDisabled, sequenceCount])

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
    (node: StaticLinkNode, renderers: TextRenderers): React.ReactElement => {
      let children = renderers.renderStaticNodes(node.children, renderers);
      return (
        <a
          style={{ color: theme.colors.linkColor }}
          href={node.href}
          target="_blank"
        >
          {children}
        </a>
      );
    },
    [theme]
  );

  const overviewIcon = useIcon("about.overview");
  const dependentTypes = useIcon("about.floro-pipeline");
  const listTransfrom = useIcon("about.list-transform");
  const keySyntax = useIcon("about.key-syntax");

  const treeListSequence1 = useIcon("about.treelist-sequence-1");
  const treeListSequence2 = useIcon("about.treelist-sequence-2");
  const treeListSequence3 = useIcon("about.treelist-sequence-3");
  const treeListSequence4 = useIcon("about.treelist-sequence-4");
  //const versionUpdates = useIcon("about.version-updates");
  const versionUpdates = useIcon("about.version-updates");
  //const setsToTypesUpdates = useIcon("about.set-to-types");
  const setsUpdates = useIcon("about.set-updates");
  const relationsRefactorPart1 = useIcon("about.relations-refactor-part-1");
  const cascadingRelations = useIcon("about.cascading-relations");
  const spreadsheetIcon = useIcon("about.spreadsheet");
  const playIcon = useIcon("about.play");
  const pauseIcon = useIcon("about.pause");
  const forwardIcon = useIcon("about.forward");
  const backwardIcon = useIcon("about.backward");
  const stateChangeIcon = useIcon("about.state-change");
  const spreadsheetKeys = useIcon("about.spreadsheet-keys");
  const diffKeys = useIcon("about.diff-keys");
  const visualDiff = useIcon("about.visual-diff");

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
  const howItWorksTitle = useRichText(
    "about.how_floro_works_title",
    {},
    {
      ...richTextRenderers,
      renderLinkNode,
    }
  );
  const howItWorksBlurb = useRichText(
    "about.how_it_works_blurb",
    {},
    {
      ...richTextRenderers,
      renderLinkNode,
    }
  );

  const howItWorksBlurbPart2 = useRichText(
    "about.how_it_works_blurb_part_2",
    {},
    {
      ...richTextRenderers,
      renderLinkNode,
    }
  );

  const howItWorksBlurbPart3 = useRichText(
    "about.how_it_works_blurb_part_3",
    {},
    {
      ...richTextRenderers,
      renderLinkNode,
    }
  );

  const howItWorksBlurbPart4 = useRichText(
    "about.how_it_works_blurb_part_4",
    {},
    {
      ...richTextRenderers,
      renderLinkNode,
    }
  );

  const thingsChangeTitle = useRichText(
    "about.things_change_title",
    {},
    {
      ...richTextRenderers,
      renderLinkNode,
    }
  );

  const thingsChangeBlurb1 = useRichText(
    "about.things_change_blurb_1",
    {},
    {
      ...richTextRenderers,
      renderLinkNode,
    }
  );

  const thingsChangeBlurb2 = useRichText(
    "about.things_change_blurb_2",
    {},
    {
      ...richTextRenderers,
      renderLinkNode,
    }
  );

  const thingsChangeBlurb3 = useRichText(
    "about.things_change_blurb_3",
    {},
    {
      ...richTextRenderers,
      renderLinkNode,
    }
  );

  const itsAllRelatedTitle = useRichText(
    "about.how_it's_all_related",
    {},
    {
      ...richTextRenderers,
      renderLinkNode,
    }
  );

  const itsAllRelatedBlurb1 = useRichText(
    "about.how_it_is_all_related_blurb_1",
    {},
    {
      ...richTextRenderers,
      renderLinkNode,
    }
  );

  const itsAllRelatedBlurb2 = useRichText(
    "about.how_it_is_all_related_part_2",
    {},
    {
      ...richTextRenderers,
      renderLinkNode,
    }
  );

  const itsAllRelatedBlurb3 = useRichText(
    "about.how_its_all_related_part_3",
    {},
    {
      ...richTextRenderers,
      renderLinkNode,
    }
  );

  const whatsTheDifferenceTitle = useRichText(
    "about.whats_the_difference_title",
    {},
    {
      ...richTextRenderers,
      renderLinkNode,
    }
  );

  const whatsTheDifferenceBlurb1 = useRichText(
    "about.whats_the_difference_blurb_1",
    {},
    {
      ...richTextRenderers,
      renderLinkNode,
    }
  );

  const whatsTheDifferenceBlurb2 = useRichText(
    "about.whats_the_difference_blurb_2",
    {},
    {
      ...richTextRenderers,
      renderLinkNode,
    }
  );

  const whatsTheDifferenceBlurb3 = useRichText(
    "about.whats_the_different_part_3",
    {},
    {
      ...richTextRenderers,
      renderLinkNode,
    }
  );

  const whatsTheDifferenceBlurb4 = useRichText(
    "about.whats_the_difference_part_4",
    {},
    {
      ...richTextRenderers,
      renderLinkNode,
    }
  );


  const whatsTheDifferenceBlurb5 = useRichText(
    "about.whats_the_difference_part_5",
    {},
    {
      ...richTextRenderers,
      renderLinkNode,
    }
  );

  const whatsTheDifferenceBlurb6 = useRichText(
    "about.whats_the_difference_part_6",
    {},
    {
      ...richTextRenderers,
      renderLinkNode,
    }
  );

  const whatsTheDifferenceBlurb7 = useRichText(
    "about.whats_the_difference_part_7",
    {},
    {
      ...richTextRenderers,
      renderLinkNode,
    }
  );

  const [lcsString1, setLcsString1] = useState("ACBAACD");
  const [lcsString2, setLcsString2] = useState("ADBDADC");

  const lcsSequence = useMemo(() => {
    return getLCS(lcsString1.split(""), lcsString2.split(""));
  }, [lcsString1, lcsString2]);

  const lcsStringOut1 = useMemo(() => {
    const out: Array<React.ReactElement> = [];
    let lcsIndex = 0;
    let key = 0;
    for (const char of lcsString1) {
      if (lcsIndex < lcsSequence.length && lcsSequence[lcsIndex] == char) {
        out.push(
          <span
            key={key++}
            style={{
              color: ColorPalette.white,
              background: theme.colors.titleText,
              borderRadius: 4,
            }}
          >
            {char}
          </span>
        );
        lcsIndex++;
      } else {
        out.push(<span key={key++}>{char}</span>);
      }
    }
    return out;
  }, [lcsString1, lcsSequence, theme.colors]);

  const lcsStringOut2 = useMemo(() => {
    const out: Array<React.ReactElement> = [];
    let lcsIndex = 0;
    let key = 0;
    for (const char of lcsString2) {
      if (lcsIndex < lcsSequence.length && lcsSequence[lcsIndex] == char) {
        out.push(
          <span
            key={key++}
            style={{
              color: ColorPalette.white,
              background: theme.colors.titleText,
              borderRadius: 4,
            }}
          >
            {char}
          </span>
        );
        lcsIndex++;
      } else {
        out.push(<span key={key++}>{char}</span>);
      }
    }
    return out;
  }, [lcsString2, lcsSequence, theme.colors]);

  const [diffBeforeString, setDiffBeforeString] = useState(
    "This is the string before"
  );
  const [diffAfterString, setDiffAfterString] = useState(
    "And this is the string after"
  );

  const lcsDiffSequence = useMemo(() => {
    return getLCS(diffBeforeString.split(""), diffAfterString.split(""));
  }, [diffBeforeString, diffAfterString]);

  const beforeDiffOut = useMemo(() => {
    const out: Array<React.ReactElement> = [];
    let lcsIndex = 0;
    let key = 0;
    for (const char of diffBeforeString) {
      if (
        lcsIndex < lcsDiffSequence.length &&
        lcsDiffSequence[lcsIndex] == char
      ) {
        out.push(<span key={key++}>{char}</span>);
        lcsIndex++;
      } else {
        out.push(
          <span
            key={key++}
            style={{
              color: ColorPalette.white,
              background: ColorPalette.lightRed,
              borderRadius: 4,
            }}
          >
            {char}
          </span>
        );
      }
    }
    return out;
  }, [diffBeforeString, lcsDiffSequence, theme.colors]);

  const afterDiffOut = useMemo(() => {
    const out: Array<React.ReactElement> = [];
    let lcsIndex = 0;
    let key = 0;
    for (const char of diffAfterString) {
      if (
        lcsIndex < lcsDiffSequence.length &&
        lcsDiffSequence[lcsIndex] == char
      ) {
        out.push(<span key={key++}>{char}</span>);
        lcsIndex++;
      } else {
        out.push(
          <span
            key={key++}
            style={{
              color: ColorPalette.white,
              background: ColorPalette.teal,
              borderRadius: 4,
            }}
          >
            {char}
          </span>
        );
      }
    }
    return out;
  }, [diffAfterString, lcsDiffSequence, theme.colors]);

  const diff = useMemo(() => {
    return getArrayStringDiff(
      diffBeforeString.split(""),
      diffAfterString.split("")
    );
  }, [diffAfterString, diffBeforeString]);

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
          <section>
            <SectionTitle>{howItWorksTitle}</SectionTitle>
            <div style={{ marginTop: 24 }}>
              <img
                src={overviewIcon}
                style={{
                  width: "100%",
                }}
              />
            </div>
            <SectionParagraph style={{ marginTop: 24 }}>
              {howItWorksBlurb}
            </SectionParagraph>
            <div style={{ marginTop: 24 }}>
              <img
                src={dependentTypes}
                style={{
                  width: "100%",
                }}
              />
            </div>
            <SectionParagraph style={{ marginTop: 24 }}>
              {howItWorksBlurbPart2}
            </SectionParagraph>
            <div style={{ marginTop: 24 }}>
              <img
                src={listTransfrom}
                style={{
                  width: "100%",
                }}
              />
            </div>
            <SectionParagraph style={{ marginTop: 24 }}>
              {howItWorksBlurbPart3}
            </SectionParagraph>
            <div style={{ marginTop: 24 }}>
              <img
                src={keySyntax}
                style={{
                  width: "80%",
                  minWidth: 320,
                }}
              />
            </div>
            <SectionParagraph style={{ marginTop: 24 }}>
              {howItWorksBlurbPart4}
            </SectionParagraph>
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
            <AnimationPlayWrapper
            >
              <div
                style={{
                  position: "relative",
                }}
              >
                <AnimationToggleIcon src={backwardIcon} onClick={onBackward}/>
                {isBackwardDisabled && (
                  <AnimationDisabledOverlay/>
                )}
              </div>
              <div
                style={{
                  position: "relative",
                }}
              >
                <AnimationToggleIcon src={forwardIcon} onClick={onForward} />
                {isForwardDisabled && (
                  <AnimationDisabledOverlay/>
                )}
              </div>
            </AnimationPlayWrapper>
          </div>

          <SubSectionTitle
            style={{
              marginTop: 24,
            }}
          >
            {thingsChangeTitle}
          </SubSectionTitle>
          <SectionParagraph style={{ marginTop: 24 }}>
            {thingsChangeBlurb1}
          </SectionParagraph>
          <div style={{ marginTop: 24 }}>
            <img
              src={versionUpdates}
              style={{
                width: "100%",
              }}
            />
          </div>
          <SectionParagraph style={{ marginTop: 24 }}>
            {thingsChangeBlurb2}
          </SectionParagraph>
          <div style={{ marginTop: 24 }}>
            <img
              src={setsUpdates}
              style={{
                width: "100%",
              }}
            />
          </div>
          <SectionParagraph style={{ marginTop: 24 }}>
            {thingsChangeBlurb3}
          </SectionParagraph>
          <SubSectionTitle
            style={{
              marginTop: 24,
            }}
          >
            {itsAllRelatedTitle}
          </SubSectionTitle>
          <SectionParagraph style={{ marginTop: 24 }}>
            {itsAllRelatedBlurb1}
          </SectionParagraph>
          <div style={{ marginTop: 24 }}>
            <img
              src={relationsRefactorPart1}
              style={{
                width: "100%",
              }}
            />
          </div>
          <SectionParagraph style={{ marginTop: 24 }}>
            {itsAllRelatedBlurb2}
          </SectionParagraph>
          <div style={{ marginTop: 24 }}>
            <img
              src={cascadingRelations}
              style={{
                width: "100%",
              }}
            />
          </div>
          <SectionParagraph style={{ marginTop: 24 }}>
            {itsAllRelatedBlurb3}
          </SectionParagraph>
          <div style={{ marginTop: 24 }}>
            <img
              src={spreadsheetIcon}
              style={{
                width: "100%",
              }}
            />
          </div>
          <SubSectionTitle
            style={{
              marginTop: 24,
            }}
          >
            {whatsTheDifferenceTitle}
          </SubSectionTitle>
          <SectionParagraph style={{ marginTop: 24 }}>
            {whatsTheDifferenceBlurb1}
          </SectionParagraph>

          <div>
            <Input
              value={lcsString1}
              label={"string 1"}
              placeholder={"string 1"}
              onTextChanged={(text: string) => {
                setLcsString1(text);
              }}
              style={{ marginBottom: 12 }}
            />
            <Input
              value={lcsString2}
              label={"string 2"}
              placeholder={"string 2"}
              onTextChanged={(text: string) => {
                setLcsString2(text);
              }}
            />
          </div>
          <SectionParagraph style={{ marginTop: 24 }}>
            <p>
              <span style={{ width: 120, display: "inline-block" }}>
                {"String 1: "}
              </span>
              <span>{lcsStringOut1}</span>
            </p>
            <p
              style={{
                marginTop: 8,
                borderBottom: `2px solid ${theme.colors.contrastText}`,
                display: "inline-block",
                paddingRight: 12,
              }}
            >
              <span style={{ width: 120, display: "inline-block" }}>
                {"String 2: "}
              </span>
              <span>{lcsStringOut2}</span>
            </p>
            <p style={{ marginTop: 8 }}>
              <span style={{ width: 120, display: "inline-block" }}>
                {"LCS: "}
              </span>
              <span>
                {lcsSequence.map((char, index) => {
                  return (
                    <span
                      key={index}
                      style={{
                        color: ColorPalette.white,
                        background: theme.colors.titleText,
                        borderRadius: 4,
                      }}
                    >
                      {char}
                    </span>
                  );
                })}
              </span>
            </p>
          </SectionParagraph>
          <SectionParagraph style={{ marginTop: 64 }}>
            {whatsTheDifferenceBlurb2}
          </SectionParagraph>
          <div style={{ marginTop: 64 }}>
            <Input
              value={diffBeforeString}
              label={"before string"}
              placeholder={"before string"}
              onTextChanged={(text: string) => {
                setDiffBeforeString(text);
              }}
              style={{ marginBottom: 12 }}
            />
            <Input
              value={diffAfterString}
              label={"after string"}
              placeholder={"after string"}
              onTextChanged={(text: string) => {
                setDiffAfterString(text);
              }}
            />
          </div>
          <SectionParagraph style={{ marginTop: 24 }}>
            <p style={{display: 'flex'}}>
              <span style={{ width: 120, display: "inline-block" }}>
                {"Before: "}
              </span>
              <span>{beforeDiffOut}</span>
            </p>
            <p
              style={{
                marginTop: 8,
                display: "flex",
              }}
            >
              <span style={{ width: 120, display: "inline-block" }}>
                {"After: "}
              </span>
              <span>{afterDiffOut}</span>
            </p>
            <div
              style={{
                border: `2px solid ${theme.colors.inputBorderColor}`,
                borderRadius: 8,
                maxWidth: 430,
                marginTop: 24,
                marginBottom: 24,
              }}
            >
              <div
                style={{
                  display: "flex",
                  flexDirection: "row",
                  justifyContent: "space-between",
                  borderBottom: `2px solid ${theme.colors.inputBorderColor}`,
                }}
              >
                <div
                  style={{
                    display: "flex",
                    padding: 16,
                    justifyContent: "center",
                    flex: 1,
                    alignItems: "center",
                    color: ColorPalette.lightRed,
                    fontWeight: 600,
                  }}
                >
                  <p>{"removed"}</p>
                </div>
                <div
                  style={{
                    height: 60,
                    width: 2,
                    background: theme.colors.inputBorderColor,
                  }}
                ></div>
                <div
                  style={{
                    display: "flex",
                    padding: 16,
                    justifyContent: "center",
                    flex: 1,
                    alignItems: "center",
                    color: ColorPalette.teal,
                    fontWeight: 600,
                  }}
                >
                  <p>{"added"}</p>
                </div>
              </div>
              <div
                style={{
                  display: "flex",
                  flexDirection: "row",
                  justifyContent: "space-between",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    padding: 8,
                    flexDirection: "column",
                    justifyContent: "flex-start",
                    flex: 1,
                    color: ColorPalette.lightRed,
                    fontSize: "1.1rem",
                  }}
                >
                  {Object.keys(diff.remove).map((key, index) => {
                    return (
                      <p
                        key={index}
                        style={{
                          display: "flex",
                          flexDirection: "row",
                          justifyContent: "flex-start",
                          textAlign: "left",
                        }}
                      >
                        {diff.remove[key][0] == " " && (
                          <span style={{ textAlign: "left", width: 70 }}>
                            {"◼ ->"}
                          </span>
                        )}
                        {diff.remove[key][0] != " " && (
                          <span style={{ textAlign: "left", width: 70 }}>
                            {diff.remove[key][0] + " ->"}
                          </span>
                        )}
                        <span>{`@ idx: ${key}`}</span>
                      </p>
                    );
                  })}
                </div>
                <div
                  style={{
                    alignSelf: "stretch",
                    width: 2,
                    background: theme.colors.inputBorderColor,
                  }}
                ></div>
                <div
                  style={{
                    display: "flex",
                    padding: 8,
                    flexDirection: "column",
                    justifyContent: "flex-start",
                    flex: 1,
                    color: ColorPalette.teal,
                    fontSize: "1.1rem",
                  }}
                >
                  {Object.keys(diff.add).map((key, index) => {
                    return (
                      <p
                        key={index}
                        style={{
                          display: "flex",
                          flexDirection: "row",
                          justifyContent: "flex-start",
                          textAlign: "left",
                        }}
                      >
                        {diff.add[key][0] == " " && (
                          <span style={{ textAlign: "left", width: 70 }}>
                            {"◼ ->"}
                          </span>
                        )}
                        {diff.add[key][0] != " " && (
                          <span style={{ textAlign: "left", width: 70 }}>
                            {diff.add[key][0] + " ->"}
                          </span>
                        )}
                        <span>{`@ idx: ${key}`}</span>
                      </p>
                    );
                  })}
                </div>
              </div>
            </div>
          </SectionParagraph>
          <SectionParagraph style={{ marginTop: 24 }}>
            <ol>
              <li>{beforeDiffOut}</li>
              <li>{lcsDiffSequence}</li>
              <li>{afterDiffOut}</li>
            </ol>
          </SectionParagraph>
          <SectionParagraph style={{ marginTop: 64 }}>
            {whatsTheDifferenceBlurb3}
          </SectionParagraph>
          <div style={{ marginTop: 24 }}>
            <img
              src={stateChangeIcon}
              style={{
                width: "100%",
                maxWidth: 800
              }}
            />
          </div>
          <SectionParagraph style={{ marginTop: 64 }}>
            {whatsTheDifferenceBlurb4}
          </SectionParagraph>
          <div style={{ marginTop: 24 }}>
            <img
              src={spreadsheetKeys}
              style={{
                width: "100%",
                maxWidth: 800
              }}
            />
          </div>
          <SectionParagraph style={{ marginTop: 64 }}>
            {whatsTheDifferenceBlurb5}
          </SectionParagraph>
          <div style={{ marginTop: 24 }}>
            <img
              src={diffKeys}
              style={{
                width: "100%",
                maxWidth: 800
              }}
            />
          </div>
          <SectionParagraph style={{ marginTop: 64 }}>
            {whatsTheDifferenceBlurb6}
          </SectionParagraph>
          <div style={{ marginTop: 24 }}>
            <img
              src={visualDiff}
              style={{
                width: "100%",
                maxWidth: 800
              }}
            />
          </div>
          <SectionParagraph style={{ marginTop: 64 }}>
            {whatsTheDifferenceBlurb7}
          </SectionParagraph>
        </div>
      </AboutWrapper>
    </PageWrapper>
  );
}

export default AboutPage;
