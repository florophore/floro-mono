import React, { useMemo, useCallback, useState } from "react";
import {
  PointerTypes,
  SchemaTypes,
  makeQueryRef,
  useExtractQueryArgs,
  useFloroContext,
  useFloroState,
  useQueryRef,
  useReferencedObject,
} from "../../floro-schema-api";
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
import TextNode from "@floro/storybook/stories/design-system/ContentEditor/editor/nodes/TextNode";

import TermList from "../termdisplay/TermList";
import MLModal from "../mlmodal/MLModal";

import deepLSourceLocales from "../../deep_l_source_locales.json";
import deepLTargetLocales from "../../deep_l_target_locales.json";
import TestCaseList from "../testcases/TestCaseList";
import { useTranslationMemory } from "../../memory/TranslationMemoryContext";
import TranslationMemoryList from "../tranlsationmemory/TranslationMemoryList";
import { useDiffColor } from "../../diff";

const Container = styled.div``;

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
  background: ${(props) => props.theme.colors.warningTextColor};
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

const TermContainer = styled.div`
  display: flex;
  flex-direction: row;
  flex-wrap: wrap;
  width: 100%;
  margin-bottom: 12px;
`;

const TermWrapper = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;
  padding-top: 12px;
  margin-right: 12px;
`;

const TermSpan = styled.span`
  font-family: "MavenPro";
  font-weight: 700;
  font-size: 1.4rem;
  color: ${(props) => props.theme.colors.linkColor};
  text-decoration: underline;
  margin-right: 8px;
  margin-top: -2px;
  cursor: pointer;
`;

const TermIcon = styled.img`
  height: 24px;
  width: 24px;
`;

interface Props {
  phrase: SchemaTypes["$(text).phraseGroups.id<?>.phrases.id<?>"];
  selectedLocale: SchemaTypes["$(text).localeSettings.locales.localeCode<?>"];
  fallbackLocale:
    | SchemaTypes["$(text).localeSettings.locales.localeCode<?>"]
    | null;
  globalFallbackLocale:
    | SchemaTypes["$(text).localeSettings.locales.localeCode<?>"]
    | null;
  systemSourceLocale:
    | SchemaTypes["$(text).localeSettings.locales.localeCode<?>"]
    | null;
  phraseRef: PointerTypes["$(text).phraseGroups.id<?>.phrases.id<?>"];
  pinnedPhrases: Array<string> | null;
  setPinnedPhrases: (phraseRegs: Array<string>) => void;
  globalFilterUntranslated: boolean;
  isPinned: boolean;
}

const PhraseTranslation = (props: Props) => {
  const theme = useTheme();
  const [phraseGroupId, phraseId] = useExtractQueryArgs(props.phraseRef);
  const { commandMode, applicationState, conflictSet, changeset } =
    useFloroContext();

  const localeRef = makeQueryRef(
    "$(text).localeSettings.locales.localeCode<?>",
    props.selectedLocale.localeCode
  );
  const locales = useReferencedObject("$(text).localeSettings.locales");

  const sourceLocaleRef = props?.systemSourceLocale?.localeCode
    ? makeQueryRef(
        "$(text).localeSettings.locales.localeCode<?>",
        props.systemSourceLocale.localeCode
      )
    : (null as unknown as PointerTypes["$(text).localeSettings.locales.localeCode<?>"]);

  const sourceRef = sourceLocaleRef
    ? makeQueryRef(
        "$(text).phraseGroups.id<?>.phrases.id<?>.phraseTranslations.id<?>",
        phraseGroupId,
        phraseId,
        sourceLocaleRef
      )
    : (null as unknown as PointerTypes["$(text).phraseGroups.id<?>.phrases.id<?>.phraseTranslations.id<?>"]);

  const sourcePhraseTranslation = useReferencedObject(sourceRef);

  const phraseTranslationRef = useQueryRef(
    "$(text).phraseGroups.id<?>.phrases.id<?>.phraseTranslations.id<?>",
    phraseGroupId,
    phraseId,
    localeRef
  );

  const diffColor = useDiffColor(`${phraseTranslationRef}`, true, "darker");

  const [phraseTranslation, setPhraseTranslation] =
    useFloroState(phraseTranslationRef);

  const terms = useReferencedObject("$(text).terms");
  const localeTerms = useMemo(() => {
    return (
      terms?.flatMap((term) => {
        const value =
          term.localizedTerms.find((localizedTerm) => {
            return localizedTerm.id == localeRef;
          })?.termValue ?? term?.name;
        return {
          id: term.id,
          value: value == "" ? term.name : value,
          name: term.name,
        };
      }) ?? []
    );
  }, [terms, localeRef, applicationState]);

  const mentionedTerms = useMemo(() => {
    const json = JSON.parse(phraseTranslation?.json ?? "{}");
    const children: Array<TextNode> = json?.children ?? [];
    const foundTerms: Array<{
      value: string;
      id: string;
      name: string;
    }> = [];

    const flattenedChildren: Array<TextNode> = [];
    for (let i = 0; i < children.length; ++i) {
      if (children[i]?.type == "text" || children[i]?.type == "mentioned-tag") {
        const combined = children[i];
        combined.type = "text";
        for (let j = i; j < children.length; ++j) {
          if (
            children[j]?.type != "text" &&
            children[j]?.type != "mentioned-tag"
          ) {
            flattenedChildren.push(combined);
            break;
          }
          combined.content += children[j].content;
          i = j;
          flattenedChildren.push(combined);
        }
      } else {
        flattenedChildren.push(children[i]);
      }
    }

    for (const localeTerm of localeTerms) {
      for (const child of flattenedChildren) {
        if (child?.type == "text") {
          if (
            (child.content ?? "")
              ?.toLowerCase()
              ?.indexOf(localeTerm.value?.toLowerCase()) != -1
          ) {
            foundTerms.push(localeTerm);
            break;
          }
        }
        if (child?.type == "mentioned-tag") {
          if (child.content == localeTerm.value) {
            foundTerms.push(localeTerm);
            break;
          }
        }
      }
    }
    return foundTerms;
  }, [phraseTranslation?.plainText, phraseTranslation?.json, localeTerms]);

  const enabledMentionedValues = useMemo(() => {
    return mentionedTerms
      ?.filter((mentionedTerm) => {
        return phraseTranslation?.enabledTerms?.includes(mentionedTerm?.id);
      })
      ?.map((mentionedTerm) => mentionedTerm.value);
  }, [mentionedTerms, phraseTranslation?.enabledTerms]);

  const editorObserver = useMemo(() => {
    const variables = props.phrase.variables?.map((v) => v.name) ?? [];
    const linkVariables =
      props?.phrase.linkVariables?.map?.((v) => v.linkName) ?? [];
    const interpolationVariants =
      props.phrase?.interpolationVariants?.map?.((v) => v.name) ?? [];
    return new Observer(
      variables,
      linkVariables,
      interpolationVariants,
      enabledMentionedValues ?? []
    );
  }, [
    props.phrase.variables,
    props.phrase.linkVariables,
    props.phrase.interpolationVariants,
    enabledMentionedValues,
  ]);

  const editorDoc = useMemo(() => {
    if (phraseTranslation) {
      const doc = new EditorDocument(
        editorObserver,
        props.selectedLocale.localeCode?.toLowerCase() ?? "en"
      );
      doc.tree.updateRootFromHTML(phraseTranslation?.richTextHtml ?? "");
      return doc;
    }
    return new EditorDocument(
      editorObserver,
      props.selectedLocale.localeCode?.toLowerCase() ?? "en"
    );
  }, [props.selectedLocale.localeCode, editorObserver]);

  const contentIsEmpty = useMemo(() => {
    return (phraseTranslation?.plainText ?? "") == "";
  }, [phraseTranslation?.plainText]);

  const sourceIsEmpty = useMemo(() => {
    return (sourcePhraseTranslation?.plainText ?? "") == "";
  }, [sourcePhraseTranslation?.plainText]);

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
        props.setPinnedPhrases([
          ...(props?.pinnedPhrases ?? []),
          props.phraseRef,
        ]);
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
      props.globalFilterUntranslated,
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
    return (
      (sourcePhraseTranslation?.revisionCount ?? 0) >
      (phraseTranslation?.revisionCount ?? 0)
    );
  }, [
    phraseTranslation?.revisionCount,
    sourcePhraseTranslation?.revisionCount,
  ]);

  const onChangeTerm = useCallback(
    (termId: string) => {
      if (phraseTranslation?.enabledTerms?.includes(termId)) {
        const enabledTerms =
          phraseTranslation?.enabledTerms?.filter((t) => t != termId) ?? [];
        if (phraseTranslation) {
          setPhraseTranslation?.({
            ...phraseTranslation,
            enabledTerms,
          });
        }
      } else {
        const enabledTerms = [
          ...(phraseTranslation?.enabledTerms?.filter((t) => t != termId) ??
            []),
          termId,
        ];
        if (phraseTranslation) {
          setPhraseTranslation?.({
            ...phraseTranslation,
            enabledTerms,
          });
        }
      }
    },
    [phraseTranslation?.enabledTerms, phraseTranslation, setPhraseTranslation]
  );

  const sourceEnabledMentionedValues = useMemo(() => {
    return mentionedTerms
      ?.filter((mentionedTerm) => {
        return sourcePhraseTranslation?.enabledTerms?.includes(
          mentionedTerm?.id
        );
      })
      ?.map((mentionedTerm) => mentionedTerm.value);
  }, [mentionedTerms, sourcePhraseTranslation?.enabledTerms]);

  const sourceEditorObserver = useMemo(() => {
    const variables = props.phrase.variables?.map((v) => v.name) ?? [];
    const linkVariables =
      props?.phrase.linkVariables?.map?.((v) => v.linkName) ?? [];
    const interpolationVariants =
      props.phrase?.interpolationVariants?.map?.((v) => v.name) ?? [];
    return new Observer(
      variables,
      linkVariables,
      interpolationVariants,
      sourceEnabledMentionedValues ?? []
    );
  }, [
    props.phrase.variables,
    props.phrase.linkVariables,
    props.phrase.interpolationVariants,
    sourceEnabledMentionedValues,
  ]);

  const sourceEditorDoc = useMemo(() => {
    if (sourcePhraseTranslation && props?.systemSourceLocale?.localeCode) {
      const doc = new EditorDocument(
        sourceEditorObserver,
        props.systemSourceLocale.localeCode?.toLowerCase() ?? "en"
      );
      doc.tree.updateRootFromHTML(sourcePhraseTranslation?.richTextHtml ?? "");
      return doc;
    }
    return new EditorDocument(
      sourceEditorObserver,
      props?.systemSourceLocale?.localeCode?.toLowerCase() ?? "en"
    );
  }, [
    props?.systemSourceLocale?.localeCode,
    sourceEditorObserver,
    sourcePhraseTranslation,
  ]);

  const sourceMockHtml = useMemo(() => {
    return sourceEditorDoc.tree.getHtml();
  }, [sourceEditorDoc]);

  const [showMLTranslate, setShowMLTranslate] = useState(false);

  const onShowMLTranslate = useCallback(() => {
    setShowMLTranslate(true);
  }, []);

  const onHideMLTranslate = useCallback(() => {
    setShowMLTranslate(false);
  }, []);

  const translationMemory = useTranslationMemory();

  const translationMemories = useMemo(() => {
    if (!sourcePhraseTranslation) {
      return [];
    }
    if (!props.selectedLocale?.localeCode) {
      return [];
    }

    if ((sourcePhraseTranslation?.plainText?.trim() ?? "") == "") {
      return [];
    }

    const memory = translationMemory[props.selectedLocale.localeCode];
    if (!memory) {
      return [];
    }
    if (
      !memory?.[
        sourcePhraseTranslation?.plainText?.trim().toLowerCase() as string
      ]
    ) {
      return [];
    }
    const termSet =
      memory?.[
        sourcePhraseTranslation?.plainText?.trim().toLowerCase() as string
      ];
    if (!termSet) {
      return [];
    }
    return Array.from(termSet);
  }, [translationMemory, sourcePhraseTranslation, props.selectedLocale]);

  return (
    <>
      {sourcePhraseTranslation?.richTextHtml && commandMode == "edit" && (
        <MLModal
          show={showMLTranslate && commandMode == "edit"}
          selectedLocale={props.selectedLocale}
          systemSourceLocale={props.systemSourceLocale}
          sourceRichText={sourcePhraseTranslation?.richTextHtml}
          sourceMockText={sourceMockHtml}
          sourceEditorDoc={sourceEditorDoc}
          onDismiss={onHideMLTranslate}
          enabledTermIds={sourcePhraseTranslation.enabledTerms}
          onApplyTranslation={onSetContent}
        />
      )}
      <Container>
        <TitleRow style={{ marginBottom: 12, height: 40 }}>
          <RowTitle
            style={{
              fontWeight: 600,
              display: "flex",
              flexDirection: "row",
              alignItems: "center",
            }}
          >
            <span style={{ color: diffColor }}>
              {`Phrase Value (${props.selectedLocale.localeCode}):`}
            </span>
            {props.systemSourceLocale && commandMode == "edit" && (
              <div style={{ width: 120, marginLeft: 12 }}>
                <Button
                  isDisabled={
                    sourceIsEmpty ||
                    !deepLSourceLocales[
                      props.systemSourceLocale?.localeCode?.toUpperCase()
                    ] ||
                    !deepLTargetLocales?.[
                      props?.selectedLocale?.localeCode?.toUpperCase()
                    ]
                  }
                  label={"ML translate"}
                  bg={"teal"}
                  size={"small"}
                  textSize="small"
                  onClick={onShowMLTranslate}
                />
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
        {mentionedTerms?.length > 0 && phraseTranslation && (
          <TermList
            terms={mentionedTerms ?? []}
            selectedLocale={props.selectedLocale}
            systemSourceLocale={props.systemSourceLocale}
            onChange={onChangeTerm}
            enabledTerms={phraseTranslation?.enabledTerms ?? []}
            title={
              <>
                {`Recognized Terms in Phrase Value (${props.selectedLocale.localeCode}):`}
              </>
            }
          />
        )}
        {translationMemories.length > 0 &&
          (phraseTranslation?.plainText ?? "").trim() == "" &&
          commandMode == "edit" && (
            <TranslationMemoryList
              memories={translationMemories}
              observer={editorObserver}
              onApply={onSetContent}
              lang={props.selectedLocale?.localeCode}
            />
          )}
      </Container>
      {props.systemSourceLocale && phraseTranslation && (
        <SourcePhraseTranslation
          phrase={props.phrase}
          systemSourceLocale={props.systemSourceLocale}
          phraseRef={props.phraseRef}
          targetPhraseTranslation={phraseTranslation}
          selectedLocale={props.selectedLocale}
        />
      )}
      <VariablesList phraseRef={props.phraseRef} />
      <LinkVariablesList
        phrase={props.phrase}
        phraseRef={props.phraseRef}
        selectedLocale={props.selectedLocale}
        systemSourceLocale={props.systemSourceLocale}
        globalFilterUntranslated={props.globalFilterUntranslated}
        fallbackLocale={props.fallbackLocale}
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
      {(props.phrase?.variables?.length ?? 0) > 0 && (
        <TestCaseList
          phrase={props.phrase}
          phraseRef={props.phraseRef}
          selectedLocale={props.selectedLocale}
          fallbackLocale={props.fallbackLocale}
          globalFallbackLocale={props.globalFallbackLocale}
        />
      )}
    </>
  );
};

export default React.memo(PhraseTranslation);
