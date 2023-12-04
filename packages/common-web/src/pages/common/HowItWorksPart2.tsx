import {
  useMemo,
  useState,
  useCallback,
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
  min-height: 100vh;
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


  const renderLinkNode = useCallback(
    (
      node: StaticLinkNode<React.ReactElement>,
      renderers
    ): React.ReactElement => {
      let children = renderers.renderStaticNodes(node.children, renderers);
      if (node.linkName == "back to part 1") {
        return (
          <Link
            style={{ fontWeight: 600, color: theme.colors.linkColor, display: 'inline-block' }}
            to={`/technical-overview-part-1`}
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

  const stateChangeIcon = useIcon("about.state-change");
  const spreadsheetKeys = useIcon("about.spreadsheet-keys");
  const diffKeys = useIcon("about.diff-keys");
  const visualDiff = useIcon("about.visual-diff");
  const checkMark = useIcon("about.check-mark");
  const redX = useIcon("about.red-x");
  const threeWayAutoMergeImage = useIcon("merging.three-way-automerge");
  const leftReconciledAutoMergeImage = useIcon("merging.left-reconciled-auto-merge");
  const rightReconciledAutoMergeImage = useIcon("merging.right-reconciled-auto-merge");
  const autoMergeImage = useIcon("merging.auto-merge");
  const threeWayConflictMergeImage = useIcon("merging.three-way-conflictmerge");
  const leftReconciledConflictMergeImage = useIcon("merging.left-reconciled-conflict-merge");
  const rightReconciledConflictMergeImage = useIcon("merging.right-reconciled-conflict-merge");
  const conflictMergeImage = useIcon("merging.conflict-merge");
  const diamonColorImage = useIcon("merging.diamond-color");
  const rgbList = useIcon("merging.rgb-list");
  const orderMatters = useIcon("merging.order-matters");
  const cascadedMerge = useIcon("merging.cascaded-merge");

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

  const [origin, setOrigin] = useState("Hello world!");
  const [left, setLeft] = useState("Left side first, Hi there world!");
  const [right, setRight] = useState("Hello there world! End on the right.");

  const leftMergeChar = useMemo(() => {
    return getMergeSequence(
      origin.split(""),
      left.split(""),
      right.split(""),
      "yours"
    ).join("");
  }, [origin, left, right]);

  const rightMergeChar = useMemo(() => {
    return getMergeSequence(
      origin.split(""),
      left.split(""),
      right.split(""),
      "theirs"
    ).join("");
  }, [origin, left, right]);

  const leftMergeSpace = useMemo(() => {
    return getMergeSequence(
      origin.split(" "),
      left.split(" "),
      right.split(" "),
      "yours"
    ).join(" ");
  }, [origin, left, right]);

  const rightMergeSpace = useMemo(() => {
    return getMergeSequence(
      origin.split(" "),
      left.split(" "),
      right.split(" "),
      "theirs"
    ).join(" ");
  }, [origin, left, right]);


  const blogPart2 = useRichText("how_it_works.how_it_works_blog_part_2", {
      lcsCalculator: (
        <div>
          <div style={{marginBottom: 24}}>
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
        </div>
      ),
      diffCalculator: (
        <>
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
            <p style={{ display: "flex" }}>
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
        </>
      ),
      diffImageBlackAndWhite: (
        <div>
          <img
            src={stateChangeIcon}
            style={{
              width: "100%",
              maxWidth: 800,
            }}
          />
        </div>
      ),
      spreadsheetKeys: (
        <div>
          <img
            src={spreadsheetKeys}
            style={{
              width: "100%",
              maxWidth: 800,
            }}
          />
        </div>
      ),
      diffKeys: (
        <div>
          <img
            src={diffKeys}
            style={{
              width: "100%",
              maxWidth: 800,
            }}
          />
        </div>
      ),
      visualDiff: (
        <div>
          <img
            src={visualDiff}
            style={{
              width: "100%",
              maxWidth: 800,
            }}
          />
        </div>
      ),
      mergeCalculator: (
        <section>
        <div style={{ marginTop: 36 }}>
          <Input
            value={origin}
            label={"origin string"}
            placeholder={"origin string"}
            onTextChanged={(text: string) => {
              setOrigin(text);
            }}
            style={{ marginBottom: 12 }}
          />
          <Input
            value={left}
            label={"left string"}
            placeholder={"left string"}
            onTextChanged={(text: string) => {
              setLeft(text);
            }}
            style={{ marginBottom: 12 }}
          />
          <Input
            value={right}
            label={"right string"}
            placeholder={"right string"}
            onTextChanged={(text: string) => {
              setRight(text);
            }}
          />
        </div>
        <SectionParagraph style={{ marginTop: 36 }}>
          <p style={{ display: "flex" }}>
            <span style={{ width: 350, display: "inline-block", fontWeight: 600 }}>
              {"Left Merge (char delimited): "}
            </span>
            <i style={{paddingLeft: 12}}>{leftMergeChar}</i>
          </p>
          <p
            style={{
              marginTop: 8,
              display: "flex",
            }}
          >
            <span style={{ width: 350, display: "inline-block", fontWeight: 600 }}>
              {"Right Merge (char delimited): "}
            </span>
            <i style={{paddingLeft: 12}}>{rightMergeChar}</i>
          </p>
          <p
            style={{
              marginTop: 8,
              display: "flex",
              flexDirection: "row",
              alignItems: "center",
            }}
          >
            <span style={{ width: 360, display: "inline-block", fontWeight: 600 }}>
              {"Auto-Merges? (char delimited): "}
            </span>
            {rightMergeChar == leftMergeChar ? (
              <img style={{ height: 20 }} src={checkMark} />
            ) : (
              <img style={{ height: 20 }} src={redX} />
            )}
          </p>

          <p style={{ display: "flex", marginTop: 24 }}>
            <span style={{ width: 350, display: "inline-block", fontWeight: 600 }}>
              {"Left Merge (space delimited): "}
            </span>
            <i style={{paddingLeft: 12}}>{leftMergeSpace}</i>
          </p>
          <p
            style={{
              marginTop: 8,
              display: "flex",
            }}
          >
            <span style={{ width: 350, display: "inline-block", fontWeight: 600 }}>
              {"Right Merge (space delimited): "}
            </span>
            <i style={{paddingLeft: 12}}>{rightMergeSpace}</i>
          </p>
          <p
            style={{
              marginTop: 8,
              display: "flex",
              flexDirection: "row",
              alignItems: "center",
            }}
          >
            <span style={{ width: 360, display: "inline-block", fontWeight: 600 }}>
              {"Auto-Merges? (space delimited): "}
            </span>
            {rightMergeSpace == leftMergeSpace ? (
              <img style={{ height: 20 }} src={checkMark} />
            ) : (
              <img style={{ height: 20 }} src={redX} />
            )}
          </p>
        </SectionParagraph>
        </section>
      ),
      threeWayAutoMerge: (
        <div>
          <img
            src={threeWayAutoMergeImage}
            style={{
              width: "100%",
              maxWidth: 400,
            }}
          />
        </div>
      ),
      rightReconciledAutoMerge: (
        <div>
          <img
            src={rightReconciledAutoMergeImage}
            style={{
              width: "100%",
              maxWidth: 400,
            }}
          />
        </div>
      ),
      leftReconciledAutoMerge: (
        <div>
          <img
            src={leftReconciledAutoMergeImage}
            style={{
              width: "100%",
              maxWidth: 400,
            }}
          />
        </div>
      ),
      autoMerge: (
        <div>
          <img
            src={autoMergeImage}
            style={{
              width: "100%",
              maxWidth: 400,
            }}
          />
        </div>
      ),
      threeWayConflictMerge: (
        <div>
          <img
            src={threeWayConflictMergeImage}
            style={{
              width: "100%",
              maxWidth: 400,
            }}
          />
        </div>
      ),
      leftReconciledConflictMerge: (
        <div>
          <img
            src={leftReconciledConflictMergeImage}
            style={{
              width: "100%",
              maxWidth: 400,
            }}
          />
        </div>
      ),
      rightReconciledConflictMerge: (
        <div>
          <img
            src={rightReconciledConflictMergeImage}
            style={{
              width: "100%",
              maxWidth: 400,
            }}
          />
        </div>
      ),
      conflictMerge: (
        <div>
          <img
            src={conflictMergeImage}
            style={{
              width: "100%",
              maxWidth: 400,
            }}
          />
        </div>
      ),
      rgbList: (
        <div>
          <img
            src={rgbList}
            style={{
              width: "100%",
            }}
          />
        </div>
      ),
      diamondColor: (
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center'
        }}>
          <img
            src={diamonColorImage}
            style={{
              width: "100%",
              maxWidth: 400,
            }}
          />
        </div>
      ),
      orderMatters: (
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center'
        }}>
          <img
            src={orderMatters}
            style={{
              width: "100%",
            }}
          />
        </div>
      ),
      cascadedMerging: (
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center'
        }}>
          <img
            src={cascadedMerge}
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
  }, rtRenderers)

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
          <SectionParagraph><section>{blogPart2}</section></SectionParagraph>
        </div>
      </AboutWrapper>
    </PageWrapper>
  );
}

export default AboutPage;
