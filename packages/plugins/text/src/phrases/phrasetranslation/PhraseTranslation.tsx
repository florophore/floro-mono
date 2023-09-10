import React, { useMemo, useCallback, useState, useEffect } from "react";
import { PointerTypes, SchemaTypes, makeQueryRef, useExtractQueryArgs, useFloroContext, useFloroState, useQueryRef, useReferencedObject } from "../../floro-schema-api";
import { useTheme } from "@emotion/react";
import styled from "@emotion/styled";

import ContentEditor from "@floro/storybook/stories/design-system/ContentEditor";
import EditorDocument from "@floro/storybook/stories/design-system/ContentEditor/editor/EditorDocument";
import Button from "@floro/storybook/stories/design-system/Button";
import SourcePhraseTranslation from "./SourcePhraseTranslation";
import PlainTextDocument from "@floro/storybook/stories/design-system/ContentEditor/PlainTextDocument";
import VariablesList from "../variables/VariablesList";
import Observer from "@floro/storybook/stories/design-system/ContentEditor/editor/Observer";
import LinkVariablesList from "../linkvariables/LinkVariablesList";
import InterpolationVariantList from "../interpolationvariants/InterpolationVariantList";
import ColorPalette from "@floro/styles/ColorPalette";


const Container = styled.div`
`;

const RowTitle = styled.h1`
  font-family: "MavenPro";
  font-weight: 400;
  font-size: 1.4rem;
  color: ${(props) => props.theme.colors.contrastText};
  padding: 0;
  margin: 0;
`;

const RequiresRevision = styled.h1`
  font-family: "MavenPro";
  font-weight: 500;
  font-size: 1.2rem;
  color: ${(props) => props.theme.colors.warningTextColor};
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

const MissingTranslationsPill = styled.div`
  height: 24px;
  border-radius: 12px;
  display: flex;
  justify-content: center;
  align-items: center;
  background: ${props => props.theme.colors.warningTextColor};
  padding-left: 12px;
  padding-right: 12px;
  margin-left: 12px;
`;

const MissingTranslationsTitle = styled.div`
  font-family: "MavenPro";
  font-weight: 600;
  font-size: 1rem;
  color: ${ColorPalette.white};
`;

interface Props {
  phrase: SchemaTypes["$(text).phraseGroups.id<?>.phrases.id<?>"];
  selectedLocale: SchemaTypes["$(text).localeSettings.locales.localeCode<?>"];
  systemSourceLocale: SchemaTypes["$(text).localeSettings.locales.localeCode<?>"]|null;
  phraseRef: PointerTypes["$(text).phraseGroups.id<?>.phrases.id<?>"];
  pinnedPhrases: Array<string>|null;
  setPinnedPhrases: (phraseRegs: Array<string>) => void;
  globalFilterUntranslated: boolean;
  isPinned: boolean;
}

const PhraseTranslation = (props: Props) => {
  const theme = useTheme();
  const [phraseGroupId, phraseId] = useExtractQueryArgs(props.phraseRef);
  const { commandMode } = useFloroContext();

  const localeRef = makeQueryRef(
    "$(text).localeSettings.locales.localeCode<?>",
    props.selectedLocale.localeCode
  );

  const sourceLocaleRef = props?.systemSourceLocale?.localeCode ? makeQueryRef(
    "$(text).localeSettings.locales.localeCode<?>",
    props.systemSourceLocale.localeCode
  ) : null as unknown as PointerTypes['$(text).localeSettings.locales.localeCode<?>'];

  const sourceRef = sourceLocaleRef ? makeQueryRef(
    "$(text).phraseGroups.id<?>.phrases.id<?>.phraseTranslations.id<?>",
    phraseGroupId,
    phraseId,
    sourceLocaleRef
  ) : null as unknown as PointerTypes["$(text).phraseGroups.id<?>.phrases.id<?>.phraseTranslations.id<?>"];

  const sourcePhraseTranslation = useReferencedObject(sourceRef);

  const phraseTranslationRef = useQueryRef(
    "$(text).phraseGroups.id<?>.phrases.id<?>.phraseTranslations.id<?>",
    phraseGroupId,
    phraseId,
    localeRef
  );

  const [phraseTranslation, setPhraseTranslation] = useFloroState(phraseTranslationRef);

  const editorObserver = useMemo(() => {
    const variables = props.phrase.variables?.map(v => v.name) ?? [];
    const linkVariables = props?.phrase.linkVariables?.map?.(v => v.linkName) ?? [];
    const interpolationVariants = props.phrase?.interpolationVariants?.map?.(v => v.name) ?? [];
    return new Observer(variables, linkVariables, interpolationVariants);
  }, [props.phrase.variables, props.phrase.linkVariables, props.phrase.interpolationVariants]);

  const editorDoc = useMemo(() => {
    if (phraseTranslation) {
        const doc = new EditorDocument(editorObserver, props.selectedLocale.localeCode?.toLowerCase() ?? "en");
        doc.tree.updateRootFromHTML(phraseTranslation?.richTextHtml ?? "")
        return doc;
    }
    return new EditorDocument(editorObserver, props.selectedLocale.localeCode?.toLowerCase() ?? "en");
  }, [props.selectedLocale.localeCode, editorObserver]);

  const contentIsEmpty = useMemo(() => {
    return (phraseTranslation?.plainText ?? "") == "";
  }, [phraseTranslation?.plainText])

  const onSetContent = useCallback(
    (richTextHtml: string) => {
      editorDoc.tree.updateRootFromHTML(richTextHtml ?? "");
      const plainText = editorDoc.tree.rootNode.toUnescapedString();
      const json = editorDoc.tree.rootNode.toJSON();
      if (!phraseTranslation) {
        return;
      }
      if (sourcePhraseTranslation) {
        setPhraseTranslation({
          ...phraseTranslation,
          richTextHtml,
          plainText,
          json: JSON.stringify(json),
        });
      } else {
        setPhraseTranslation({
          ...phraseTranslation,
          revisionCount: phraseTranslation.revisionCount + 1,
          revisionTimestamp: new Date().toISOString(),
          richTextHtml,
          plainText,
          json: JSON.stringify(json),
        });
      }
      if (contentIsEmpty && props.globalFilterUntranslated && !props.isPinned) {
        props.setPinnedPhrases([...(props?.pinnedPhrases ?? []), props.phraseRef]);
      }
    },
    [
      editorDoc?.tree,
      phraseTranslation?.richTextHtml,
      setPhraseTranslation,
      sourcePhraseTranslation,
      sourceRef,
      contentIsEmpty,
      props.isPinned,
      props.setPinnedPhrases,
      props.pinnedPhrases,
      props.phraseRef,
      props.globalFilterUntranslated
    ]
  );

  const onMarkResolved = useCallback(() => {
    if (!phraseTranslation) {
      return;
    }
    if (sourcePhraseTranslation) {
      setPhraseTranslation({
        ...phraseTranslation,
        revisionCount: sourcePhraseTranslation.revisionCount,
        revisionTimestamp: new Date().toISOString(),
        sourceAtRevision: {
          sourceLocaleRef: sourceLocaleRef,
          richTextHtml: sourcePhraseTranslation.richTextHtml,
          json: sourcePhraseTranslation.json,
          plainText: sourcePhraseTranslation.plainText,
        },
      });
    }
  }, [
    editorDoc?.tree,
    phraseTranslation,
    setPhraseTranslation,
    sourcePhraseTranslation?.richTextHtml,
    sourcePhraseTranslation?.json,
    sourcePhraseTranslation?.plainText,
    sourceRef,
  ]);

  const requireRevision = useMemo(() => {
    if (!sourcePhraseTranslation) {
        return false;
    }
    return (sourcePhraseTranslation?.revisionCount ?? 0) > (phraseTranslation?.revisionCount ?? 0);
  }, [phraseTranslation?.revisionCount, sourcePhraseTranslation?.revisionCount])

  return (
    <>
      <Container>
        <TitleRow style={{ marginBottom: 12, height: 40 }}>
          <RowTitle style={{ fontWeight: 600, display: 'flex', flexDirection: 'row', alignItems: 'center' }}>
            <span style={{ color: theme.colors.contrastText }}>
              {`Phrase Value (${props.selectedLocale.localeCode}):`}
            </span>
            {props.systemSourceLocale && commandMode == "edit" && (
              <div style={{width: 120, marginLeft: 12}}>
                <Button label={"ML translate"} bg={"teal"} size={"small"} textSize="small"/>
              </div>
            )}
            <span>
              {contentIsEmpty && (
                <MissingTranslationsPill>
                  <MissingTranslationsTitle>{`missing ${props.selectedLocale.localeCode} phrase value`}</MissingTranslationsTitle>
                </MissingTranslationsPill>
              )}
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
                <RequiresRevision style={{ marginRight: 12 }}>
                  {"requires revision"}
                </RequiresRevision>
                {commandMode == "edit" && (
                  <Button
                    onClick={onMarkResolved}
                    style={{ width: 120 }}
                    label={"mark resolved"}
                    bg={"orange"}
                    size={"small"}
                    textSize="small"
                  />
                )}
              </div>
            )}
          </div>
        </TitleRow>
        {commandMode == "edit" && (
          <ContentEditor
            lang={props.selectedLocale.localeCode?.toLowerCase() ?? "en"}
            editorDoc={editorDoc}
            content={phraseTranslation?.richTextHtml ?? ""}
            onSetContent={onSetContent}
            placeholder={`write the (${props.selectedLocale.localeCode}) value for ${props.phrase.phraseKey}...`}
          />
        )}
        {commandMode != "edit" && (
          <PlainTextDocument
            lang={props.selectedLocale.localeCode?.toLowerCase() ?? "en"}
            editorDoc={editorDoc}
            content={phraseTranslation?.richTextHtml ?? ""}

          />
        )}

      </Container>
      {props.systemSourceLocale && phraseTranslation &&(
        <SourcePhraseTranslation
          phrase={props.phrase}
          systemSourceLocale={props.systemSourceLocale}
          phraseRef={props.phraseRef}
          targetPhraseTranslation={phraseTranslation}
        />
      )}
      <VariablesList
          phraseRef={props.phraseRef}
      />
      <LinkVariablesList
          phrase={props.phrase}
          phraseRef={props.phraseRef}
          selectedLocale={props.selectedLocale}
          systemSourceLocale={props.systemSourceLocale}
          globalFilterUntranslated={props.globalFilterUntranslated}
          pinnedPhrases={props.pinnedPhrases}
          setPinnedPhrases={props.setPinnedPhrases}
          isPinned={props.isPinned}
      />
      {(props.phrase?.variables?.length ?? 0) > 0 && (
        <InterpolationVariantList
            phrase={props.phrase}
            phraseRef={props.phraseRef}
            selectedLocale={props.selectedLocale}
            systemSourceLocale={props.systemSourceLocale}
            globalFilterUntranslated={props.globalFilterUntranslated}
            pinnedPhrases={props.pinnedPhrases}
            setPinnedPhrases={props.setPinnedPhrases}
            isPinned={props.isPinned}
        />
      )}
    </>
  );
};

export default React.memo(PhraseTranslation);
