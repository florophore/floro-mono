import React, { useMemo, useCallback, useState, useEffect } from "react";
import { PointerTypes, SchemaTypes, getDiff, makeQueryRef, useExtractQueryArgs, useFloroContext, useFloroState, useQueryRef, useReferencedObject } from "../../floro-schema-api";
import { useTheme } from "@emotion/react";
import styled from "@emotion/styled";

import PlainTextDocument from "@floro/storybook/stories/design-system/ContentEditor/PlainTextDocument";
import LinkDiffTextDocument from "@floro/storybook/stories/design-system/ContentEditor/LinkDiffTextDocument";
import EditorDocument from "@floro/storybook/stories/design-system/ContentEditor/editor/EditorDocument";
import Button from "@floro/storybook/stories/design-system/Button";
import { getArrayStringDiff, splitTextForDiff, splitTextForUriDiff } from "../phrasetranslation/diffing";
import ColorPalette from "@floro/styles/ColorPalette";
import Observer from "@floro/storybook/stories/design-system/ContentEditor/editor/Observer";
import LinkPlainTextDocument from "@floro/storybook/stories/design-system/ContentEditor/LinkPlainTextDocument";

const Container = styled.div`
    margin-top: 24px;
`;

const RowTitle = styled.h1`
  font-family: "MavenPro";
  font-weight: 400;
  font-size: 1.4rem;
  color: ${(props) => props.theme.colors.contrastText};
  padding: 0;
  margin: 0;
`;

const NothingToDiff = styled.p`
  font-family: "MavenPro";
  font-weight: 500;
  font-size: 1.2rem;
  color: ${ColorPalette.gray};
  font-style: italic;
  padding: 0;
  margin: 0;
`;

const TitleRow = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
  width: 100%;
`;

interface Props {
  phrase: SchemaTypes["$(text).phraseGroups.id<?>.phrases.id<?>"];
  linkVariable: SchemaTypes["$(text).phraseGroups.id<?>.phrases.id<?>.linkVariables.linkName<?>"];
  systemSourceLocale: SchemaTypes["$(text).localeSettings.locales.localeCode<?>"];
  linkVariableRef: PointerTypes["$(text).phraseGroups.id<?>.phrases.id<?>.linkVariables.linkName<?>"];
  targetLinkHrefTranslation: SchemaTypes['$(text).phraseGroups.id<?>.phrases.id<?>.linkVariables.linkName<?>.translations.id<?>.linkHrefValue']
}

const SourceLinkHrefTranslation = (props: Props) => {
  const theme = useTheme();
  const [phraseGroupId, phraseId, linkName] = useExtractQueryArgs(props.linkVariableRef);
  const sourceLocaleRef = props?.systemSourceLocale?.localeCode ? makeQueryRef(
    "$(text).localeSettings.locales.localeCode<?>",
    props.systemSourceLocale.localeCode
  ) : null as unknown as PointerTypes['$(text).localeSettings.locales.localeCode<?>'];

  const sourceRef = sourceLocaleRef ? makeQueryRef(
    "$(text).phraseGroups.id<?>.phrases.id<?>.linkVariables.linkName<?>.translations.id<?>",
    phraseGroupId,
    phraseId,
    linkName,
    sourceLocaleRef
  ) : null as unknown as PointerTypes["$(text).phraseGroups.id<?>.phrases.id<?>.linkVariables.linkName<?>.translations.id<?>"];

  const sourceLinkHrefTranslation = useReferencedObject(`${sourceRef}.linkHrefValue`);

  const richText = useMemo(() => {
    return sourceLinkHrefTranslation?.richTextHtml ?? "";
  }, [sourceLinkHrefTranslation?.richTextHtml])


  const editorObserver = useMemo(() => {
    const variables = props.phrase.variables.map(v => v.name);
    return new Observer(variables);
  }, [props.phrase.variables]);

  const editorDoc = useMemo(() => {
    if (sourceLinkHrefTranslation) {
        const doc = new EditorDocument(editorObserver, props.systemSourceLocale.localeCode?.toLowerCase() ?? "en");
        doc.tree.updateRootFromHTML(sourceLinkHrefTranslation?.richTextHtml ?? "")
        return doc;
    }
    return new EditorDocument(editorObserver, props.systemSourceLocale.localeCode?.toLowerCase() ?? "en");
  }, [sourceLinkHrefTranslation, props.systemSourceLocale.localeCode, editorObserver]);

  const requireRevision = useMemo(() => {
    if (!sourceLinkHrefTranslation) {
        return false;
    }
    return (sourceLinkHrefTranslation?.revisionCount ?? 0) > (props.targetLinkHrefTranslation?.revisionCount ?? 0);
  }, [props.targetLinkHrefTranslation?.revisionCount, sourceLinkHrefTranslation?.revisionCount])

  const beforeText = useMemo(() => {
    return splitTextForUriDiff(props.targetLinkHrefTranslation?.sourceAtRevision?.plainText ?? "");
  }, [props.targetLinkHrefTranslation?.sourceAtRevision?.plainText]);

  const afterText = useMemo(() => {
    return splitTextForUriDiff(sourceLinkHrefTranslation?.plainText ?? "");
  }, [sourceLinkHrefTranslation?.plainText]);

  const diff = useMemo(() => {
    const diff = getArrayStringDiff(beforeText, afterText);
    return diff;
  }, [beforeText, afterText])

  const diffIsEmpty = useMemo(() => {
    return Object.keys(diff.add).length == 0 && Object.keys(diff.remove).length == 0;
  }, [Object.keys(diff.add).length == 0 && Object.keys(diff.remove).length == 0]);

  const [showDiff, setShowDiff] = useState(!diffIsEmpty);
  useEffect(() => {
    if (diffIsEmpty) {
      setShowDiff(false);
    }
  }, [diffIsEmpty])

  return (
    <>
      <Container>
        <TitleRow style={{ marginTop: 12, marginBottom: 12, height: 40 }}>
          <RowTitle style={{ fontWeight: 600 }}>
            <span style={{ color: theme.colors.contrastText }}>
              {`Source Display Value`}
            </span>
            <span
              style={{
                fontSize: "1.4rem",
                background: ColorPalette.variableBlue,
                boxShadow: `inset 0px 0px 2px 2px ${ColorPalette.variableBlueInset}`,
                borderRadius: 8,
                padding: 4,
                fontWeight: 500,
                color: ColorPalette.white,
                marginLeft: 8,
                marginRight: 8,
              }}
            >
              {props.linkVariable.linkName}
            </span>
            <span style={{ color: theme.colors.contrastText }}>
              {`(${props.systemSourceLocale.localeCode}):`}
            </span>
          </RowTitle>
          <div>
            {requireRevision && (
              <div
                style={{
                  fontWeight: 600,
                  display: "flex",
                  flexDirection: "row",
                  alignItems: "center",
                }}
              >
                {diffIsEmpty && (
                  <NothingToDiff>{"Nothing to diff"}</NothingToDiff>
                )}
                {!diffIsEmpty && !showDiff && (
                  <Button
                    style={{ width: 120 }}
                    label={"show diff"}
                    bg={"purple"}
                    size={"small"}
                    textSize="small"
                    onClick={() => {
                      setShowDiff(true);
                    }}
                  />
                )}
                {showDiff && !diffIsEmpty && (
                  <Button
                    style={{ width: 120 }}
                    label={"hide diff"}
                    bg={"purple"}
                    size={"small"}
                    textSize="small"
                    onClick={() => {
                      setShowDiff(false);
                    }}
                  />
                )}
              </div>
            )}
          </div>
        </TitleRow>
        {(!showDiff || diffIsEmpty) && (
          <LinkPlainTextDocument
            lang={props.systemSourceLocale.localeCode?.toLowerCase() ?? "en"}
            editorDoc={editorDoc}
            content={richText}
            isSource
          />
        )}
        {showDiff && !diffIsEmpty && (
          <LinkDiffTextDocument
            lang={props.systemSourceLocale.localeCode?.toLowerCase() ?? "en"}
            beforeStrings={beforeText}
            afterStrings={afterText}
            diff={diff}
            delimiter={"/"}
            showLastDelimitedAfterValue={
              sourceLinkHrefTranslation?.plainText?.[
                (sourceLinkHrefTranslation?.plainText?.length ?? 0) - 1
              ] == "/"
            }
            showLastDelimitedBeforeValue={
              props.targetLinkHrefTranslation?.sourceAtRevision?.plainText?.[
                (props.targetLinkHrefTranslation?.sourceAtRevision?.plainText
                  ?.length ?? 0) - 1
              ] == "/"
            }
          />
        )}
      </Container>
    </>
  );
};

export default React.memo(SourceLinkHrefTranslation);
