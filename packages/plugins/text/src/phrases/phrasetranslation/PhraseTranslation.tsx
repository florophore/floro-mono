import React, { useMemo, useCallback, useState, useEffect, useRef } from "react";
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
import TranslationMemoryList from "../translationmemory/TranslationMemoryList";
import { useDiffColor } from "../../diff";
import ContentVariablesList from "../contentvariables/ContentVariablesList";
import StyledClassList from "../styledclasses/StyledClassList";
import StyledContentList from "../styledcontents/StyledContentList";
import FeatureEnabler from "./FeatureEnabler";
import PromptModal from "../promptmodal/PromptModal";
import TermModal from "../termmodal/TermModal";
import PhraseSectionList from "../phrasesections/PhraseSectionList";

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

const AddPhraseFeatures = styled.h3`
  font-family: "MavenPro";
  font-weight: 600;
  font-size: 1.4rem;
  color: ${ColorPalette.linkBlue};
  cursor: pointer;
  padding: 0;
  margin-top: 24px;
`;

interface Props {
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
  setShowEnabledFeatures: (showEnabledFeatures: boolean) => void;
  showEnabledFeatures: boolean;
  isVisible: boolean;
  isSearching: boolean;
  searchText: string;
  onFocusSearch: () => void;
  scrollContainer?: HTMLDivElement;
  isFocusingPhraseSelector: boolean;
  isFocused: boolean;
}

const PhraseTranslation = React.forwardRef((props: Props, ref: React.ForwardedRef<HTMLDivElement>) => {
  const [phrase, setPhrase] = useFloroState(props.phraseRef);
  const theme = useTheme();
  const [phraseGroupId, phraseId] = useExtractQueryArgs(props.phraseRef);
  const { commandMode, applicationState } =
    useFloroContext();

  const localeRef = makeQueryRef(
    "$(text).localeSettings.locales.localeCode<?>",
    props.selectedLocale.localeCode
  );
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
    const children: Array<TextNode> =
      (json?.children ?? [])?.flatMap?.((child: TextNode) => {
        if (child.type == "ol-tag" || child.type == "ul-tag") {
          return (
            child?.children?.flatMap((li) => {
              return li?.children ?? [];
            }) ?? []
          );
        }
        return [child];
      }) ?? [];
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
    if (!props.isVisible) {
      return new Observer();
    }
    const variables = phrase?.variables?.map((v) => v.name) ?? [];
    const linkVariables =
      phrase?.linkVariables?.map?.((v) => v.linkName) ?? [];
    const interpolationVariants =
      phrase?.interpolationVariants?.map?.((v) => v.name) ?? [];
    const contentVariables =
      phrase?.contentVariables?.map?.((v) => v.name) ?? [];
    const styledContents =
      phrase?.styledContents?.map?.((v) => v.name) ?? [];

    const observer = new Observer(
      variables,
      linkVariables,
      interpolationVariants,
      enabledMentionedValues ?? [],
      contentVariables ?? [],
      styledContents ?? []
    );
    observer.setSearchString(props.searchText);
    return observer;
  }, [
    props.isVisible,
    props.searchText,
    phrase?.variables,
    phrase?.linkVariables,
    phrase?.interpolationVariants,
    phrase?.contentVariables,
    phrase?.styledContents,
    enabledMentionedValues,
  ]);


  const editorDoc = useMemo(() => {
    if (!props.isVisible) {
      return new EditorDocument(new Observer())
    }
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
  }, [props.selectedLocale.localeCode, editorObserver, props.isVisible]);

  const targetEditorObserver = useMemo(() => {
    const variables = phrase?.variables?.map((v) => v.name) ?? [];
    const linkVariables =
      phrase?.linkVariables?.map?.((v) => v.linkName) ?? [];
    const interpolationVariants =
      phrase?.interpolationVariants?.map?.((v) => v.name) ?? [];
    const contentVariables =
      phrase?.contentVariables?.map?.((v) => v.name) ?? [];
    const styledContents =
      phrase?.styledContents?.map?.((v) => v.name) ?? [];
    return new Observer(
      variables,
      linkVariables,
      interpolationVariants,
      enabledMentionedValues ?? [],
      contentVariables ?? [],
      styledContents ?? []
    );
  }, [
    phrase?.variables,
    phrase?.linkVariables,
    phrase?.interpolationVariants,
    phrase?.contentVariables,
    phrase?.styledContents,
    enabledMentionedValues,
  ]);

  const targetEditorDoc = useMemo(() => {
    if (!props.isVisible) {
      return new EditorDocument(new Observer());
    }
    if (phraseTranslation) {
      const doc = new EditorDocument(
        targetEditorObserver,
        props.selectedLocale.localeCode?.toLowerCase() ?? "en"
      );
      doc.tree.updateRootFromHTML(phraseTranslation?.richTextHtml ?? "");
      return doc;
    }
    return new EditorDocument(
      targetEditorObserver,
      props.selectedLocale.localeCode?.toLowerCase() ?? "en"
    );
  }, [props.selectedLocale.localeCode, targetEditorObserver, props.isVisible]);

  const contentIsEmpty = useMemo(() => {
    return (phraseTranslation?.plainText ?? "") == "";
  }, [phraseTranslation?.plainText]);

  const sourceIsEmpty = useMemo(() => {
    return (sourcePhraseTranslation?.plainText ?? "") == "";
  }, [sourcePhraseTranslation?.plainText]);


  const timeout = useRef<NodeJS.Timeout>();
  const onSetContent = useCallback(
    (richTextHtml: string) => {
      if (!props.isVisible) {
        return;
      }
      editorDoc.tree.updateRootFromHTML(richTextHtml ?? "");
      const plainText = editorDoc.toPlainText();
      const json = editorDoc.toJSON();
      if (!phraseTranslation) {
        return;
      }
      if (sourcePhraseTranslation) {
        const shouldUpdateFromSource =
          (sourcePhraseTranslation?.plainText ?? "") != "" &&
          (phraseTranslation?.sourceAtRevision?.plainText ?? "") == "";
        const updateFn = setPhraseTranslation({
          ...phraseTranslation,
          richTextHtml,
          plainText,
          json: JSON.stringify(json),
          sourceAtRevision: shouldUpdateFromSource ? {
            richTextHtml: sourcePhraseTranslation.richTextHtml,
            plainText: sourcePhraseTranslation.plainText,
            json: sourcePhraseTranslation.json,
            sourceLocaleRef: phraseTranslation.sourceAtRevision.sourceLocaleRef
          } : phraseTranslation.sourceAtRevision
        }, false);
        if (updateFn) {
          clearTimeout(timeout.current);
          timeout.current = setTimeout(updateFn, 100);
        }
      } else {
        const updateFn = setPhraseTranslation({
          ...phraseTranslation,
          richTextHtml,
          plainText,
          json: JSON.stringify(json),
        }, false);
        if (updateFn) {
          clearTimeout(timeout.current);
          timeout.current = setTimeout(updateFn, 100);
        }
      }
      if (contentIsEmpty && props.globalFilterUntranslated && !props.isPinned) {
        props.setPinnedPhrases([
          ...(props?.pinnedPhrases ?? []),
          props.phraseRef,
        ]);
      }
    },
    [
      props.isVisible,
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

  const highlightableVariables = useMemo(() => {
    const variables = phrase?.variables?.map((v) => v.name) ?? [];
    const linkVariables =
      phrase?.linkVariables?.map?.((v) => v.linkName) ?? [];
    const interpolationVariants =
      phrase?.interpolationVariants?.map?.((v) => v.name) ?? [];
    const contentVariables =
      phrase?.contentVariables?.map?.((v) => v.name) ?? [];
    const styledContents =
      phrase?.styledContents?.map?.((v) => v.name) ?? [];
    return [
      ...variables,
      ...linkVariables,
      ...interpolationVariants,
      ...enabledMentionedValues ?? [],
      ...contentVariables ?? [],
      ...styledContents ?? []
    ].join(":");
  }, [
    phrase?.variables,
    phrase?.linkVariables,
    phrase?.interpolationVariants,
    phrase?.contentVariables,
    phrase?.styledContents,
    enabledMentionedValues,
  ]);

  const onSaveContent = useCallback(() => {
      if (!props.isVisible) {
        return;
      }
      if (!phraseTranslation) {
        return;
      }
      const jsonString = JSON.stringify(editorDoc.toJSON());
      if (phraseTranslation?.json != jsonString) {
        setPhraseTranslation({
          ...phraseTranslation,
          json: jsonString,
        }, true);
      }

  }, [props.isVisible, highlightableVariables, phraseTranslation?.json])

  useEffect(() => {
      if (!props.isVisible) {
        return;
      }
      if (commandMode != "edit") {
        return;
      }
      const json = JSON.stringify(editorDoc.toJSON());
      if (json != phraseTranslation?.json) {
        const timeout = setTimeout(onSaveContent, 300)
        return () => {
          clearTimeout(timeout)
        }
      }
  }, [props.isVisible, onSaveContent, highlightableVariables, phraseTranslation?.json, commandMode])

  const onMarkResolved = useCallback(() => {
    if (!phraseTranslation) {
      return;
    }
    if (sourcePhraseTranslation) {
      setPhraseTranslation({
        ...phraseTranslation,
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
    if ((phraseTranslation?.plainText ?? "") == "") {
      return true;
    }
    if (!sourcePhraseTranslation) {
      return false;
    }
    return (
      (sourcePhraseTranslation?.json ?? "{}") !=
      (phraseTranslation?.sourceAtRevision?.json ?? "{}")
    );
  }, [
    phraseTranslation?.plainText,
    phraseTranslation?.sourceAtRevision?.json,
    sourcePhraseTranslation?.json,
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
    const variables = phrase?.variables?.map((v) => v.name) ?? [];
    const linkVariables =
      phrase?.linkVariables?.map?.((v) => v.linkName) ?? [];
    const interpolationVariants =
      phrase?.interpolationVariants?.map?.((v) => v.name) ?? [];
    const contentVariables =
      phrase?.contentVariables?.map?.((v) => v.name) ?? [];
    const styledContents =
      phrase?.styledContents?.map?.((v) => v.name) ?? [];
    return new Observer(
      variables,
      linkVariables,
      interpolationVariants,
      sourceEnabledMentionedValues ?? [],
      contentVariables,
      styledContents ?? []
    );
  }, [
    phrase?.variables,
    phrase?.linkVariables,
    phrase?.interpolationVariants,
    phrase?.contentVariables,
    phrase?.styledContents,
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

  const targetMockHtml = useMemo(() => {
    return editorDoc.tree.getHtml();
  }, [editorDoc]);

  const [showMLTranslate, setShowMLTranslate] = useState(false);

  const onShowMLTranslate = useCallback(() => {
    setShowMLTranslate(true);
  }, []);

  const onHideMLTranslate = useCallback(() => {
    setShowMLTranslate(false);
  }, []);

  const [showPrompt, setShowPrompt] = useState(false);

  const onShowPrompt = useCallback(() => {
    setShowPrompt(true);
  }, []);

  const onHidePrompt = useCallback(() => {
    setShowPrompt(false);
  }, []);

  const [showFindTerms, setShowFindTerms] = useState(false);

  const onShowFindTerms = useCallback(() => {
    setShowFindTerms(true);
  }, []);

  const onHideFindTerms = useCallback(() => {
    setShowFindTerms(false);
  }, []);

  const translationMemory = useTranslationMemory();

  const translationMemories = useMemo(() => {
    if (!sourcePhraseTranslation) {
      return [];
    }
    if (!props.selectedLocale?.localeCode) {
      return [];
    }

    if ((phraseTranslation?.plainText?.trim() ?? "") == "") {
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
  }, [
    translationMemory,
    sourcePhraseTranslation,
    props.selectedLocale,
    phraseTranslation?.plainText,
  ]);

  const showMiddleBox = useMemo(() => {
    if (
      phrase?.phraseVariablesEnabled ||
      (phrase?.variables?.length ?? 0) > 0
    ) {
      return true;
    }
    if (
      phrase?.contentVariablesEnabled ||
      (phrase?.contentVariables?.length ?? 0) > 0
    ) {
      return true;
    }
    if (
      phrase?.interpolationsEnabled ||
      (phrase?.interpolationVariants?.length ?? 0) > 0
    ) {
      return true;
    }
    if (
      phrase?.linkVariablesEnabled ||
      (phrase?.linkVariables?.length ?? 0) > 0
    ) {
      return true;
    }
    if (
      phrase?.styledContentEnabled ||
      (phrase?.styleClasses?.length ?? 0) > 0 ||
      (phrase?.styledContents?.length ?? 0)
    ) {
      return true;
    }
    return false;
  }, [
    phrase?.phraseVariablesEnabled,
    phrase?.variables,
    phrase?.contentVariablesEnabled,
    phrase?.contentVariables,
    phrase?.interpolationsEnabled,
    phrase?.interpolationVariants,
    phrase?.linkVariablesEnabled,
    phrase?.linkVariables,
    phrase?.styledContentEnabled,
    phrase?.styleClasses,
    phrase?.styledContents,
    phrase?.testCases,
  ]);

  const [showContent, setShowContent] = useState(false);

  useEffect(() => {
    const timeout = setTimeout(() => {
      setShowContent(true);
    }, 100);
    return () => {
      clearTimeout(timeout);
    }
  }, []);

  const showResult = useMemo(() => {
    if (!props.isSearching) {
      return true;
    }
    return phraseTranslation?.plainText
      ?.toLowerCase()
      .indexOf(props.searchText.toLowerCase()) != -1;
  }, [props.isSearching, props.searchText])

  if (!showContent) {
    return null;
  }

  return (
    <div ref={ref}>
      <TermModal
        show={showFindTerms && commandMode == "edit"}
        onDismiss={onHideFindTerms}
        targetPlainText={phraseTranslation?.plainText ?? ""}
        targetEditorDoc={targetEditorDoc}
      />
      <PromptModal
        show={showPrompt && commandMode == "edit"}
        selectedLocale={props.selectedLocale}
        systemSourceLocale={props.systemSourceLocale}
        targetRichText={phraseTranslation?.richTextHtml ?? ""}
        sourceRichText={sourcePhraseTranslation?.richTextHtml}
        sourceMockText={sourceMockHtml}
        targetMockText={targetMockHtml}
        targetEditorDoc={targetEditorDoc}
        sourceEditorDoc={sourceEditorDoc}
        onDismiss={onHidePrompt}
        enabledTermIds={sourcePhraseTranslation?.enabledTerms ?? []}
        onApplyTranslation={onSetContent}
      />
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
      {phrase?.usePhraseSections && (
        <PhraseSectionList
          phrase={phrase}
          phraseRef={props.phraseRef}
          selectedLocale={props.selectedLocale}
          systemSourceLocale={props.systemSourceLocale}
          globalFilterUntranslated={props.globalFilterUntranslated}
          pinnedPhrases={props.pinnedPhrases}
          setPinnedPhrases={props.setPinnedPhrases}
          isPinned={props.isPinned}
          isSearching={props.isSearching}
          searchText={props.searchText}
          onFocusSearch={props.onFocusSearch}
          scrollContainer={props?.scrollContainer}
          isFocusingPhraseSelector={props.isFocusingPhraseSelector}
          isFocused={props.isFocused}
        />
      )}
      {!phrase?.usePhraseSections && (
        <>
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
                    {commandMode == "edit" &&
                      (phraseTranslation?.plainText ?? "") != "" &&
                      (phraseTranslation?.sourceAtRevision?.plainText ?? "") !=
                        "" && (
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
            {commandMode == "edit" && showResult && (
              <ContentEditor
                lang={props.selectedLocale.localeCode?.toLowerCase() ?? "en"}
                editorDoc={editorDoc}
                content={phraseTranslation?.richTextHtml ?? ""}
                onSetContent={onSetContent}
                placeholder={`write the (${props.selectedLocale.localeCode}) value for ${phrase?.phraseKey}...`}
                onOpenGPT={onShowPrompt}
                showGPTIcon={
                  (!!sourcePhraseTranslation &&
                    (sourcePhraseTranslation?.richTextHtml?.trim() ?? "") !=
                      "" &&
                    (phraseTranslation?.richTextHtml?.trim() ?? "") != "") ||
                  (!sourcePhraseTranslation &&
                    (phraseTranslation?.richTextHtml?.trim() ?? "") != "")
                }
                onSearch={props.onFocusSearch}
              />
            )}
            {commandMode != "edit" && showResult && (
              <PlainTextDocument
                lang={props.selectedLocale.localeCode?.toLowerCase() ?? "en"}
                editorDoc={editorDoc}
                content={phraseTranslation?.richTextHtml ?? ""}
              />
            )}
            {phraseTranslation && (
              <TermList
                terms={mentionedTerms ?? []}
                selectedLocale={props.selectedLocale}
                systemSourceLocale={props.systemSourceLocale}
                onChange={onChangeTerm}
                enabledTerms={phraseTranslation?.enabledTerms ?? []}
                showFindTerms={!props.systemSourceLocale && !props.isSearching}
                onShowFindTerms={onShowFindTerms}
                isEmpty={(phraseTranslation?.plainText?.trim?.() ?? "") == ""}
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
          {phrase && props.systemSourceLocale && phraseTranslation && (
            <SourcePhraseTranslation
              phrase={phrase}
              systemSourceLocale={props.systemSourceLocale}
              phraseRef={props.phraseRef}
              targetPhraseTranslation={phraseTranslation}
              selectedLocale={props.selectedLocale}
              isFocusingPhraseSelector={props.isFocusingPhraseSelector}
              isVisible={props.isVisible}
            />
          )}
        </>
      )}
      {commandMode == "edit" && !props.isSearching && (
        <>
          {!props.showEnabledFeatures && (
            <div
              style={{
                display: "flex",
                flexDirection: "row",
                justifyContent: "flex-end",
              }}
            >
              <AddPhraseFeatures
                onClick={() => {
                  props.setShowEnabledFeatures(true);
                }}
              >
                {"+ edit enabled features & settings"}
              </AddPhraseFeatures>
            </div>
          )}
          {phrase && props.showEnabledFeatures && !props.isSearching && (
            <div
              style={{
                borderTop: `1px solid ${theme.colors.contrastTextLight}`,
                marginTop: 36,
              }}
            >
              <FeatureEnabler
                onHide={() => {
                  props.setShowEnabledFeatures(false);
                }}
                phrase={phrase}
                setPhrase={setPhrase}
                phraseRef={props.phraseRef}
                mockRichText={
                  props.systemSourceLocale ? sourceMockHtml : targetMockHtml
                }
                isEmpty={
                  !!props.systemSourceLocale
                    ? (sourcePhraseTranslation?.plainText?.trim?.() ?? "") == ""
                    : (phraseTranslation?.plainText?.trim?.() ?? "") == ""
                }
              />
            </div>
          )}
        </>
      )}
      {showMiddleBox && (
        <div
          style={{
            borderTop:
              commandMode != "edit"
                ? `0px solid transparent`
                : `1px solid ${theme.colors.contrastTextLight}`,
            marginTop: 24,
          }}
        >
          {(phrase?.phraseVariablesEnabled ||
            (phrase?.variables?.length ?? 0) > 0) &&
            !props.isSearching && <VariablesList phraseRef={props.phraseRef} />}
          {(phrase?.contentVariablesEnabled ||
            (phrase?.contentVariables?.length ?? 0) > 0) &&
            !props.isSearching && (
              <ContentVariablesList phraseRef={props.phraseRef} />
            )}
          {(phrase?.styledContentEnabled ||
            (phrase?.styleClasses?.length ?? 0) > 0) &&
            !props.isSearching && (
              <StyledClassList phraseRef={props.phraseRef} />
            )}
          {phrase && (phrase?.styleClasses?.length ?? 0) > 0 && (
            <StyledContentList
              phrase={phrase}
              phraseRef={props.phraseRef}
              selectedLocale={props.selectedLocale}
              systemSourceLocale={props.systemSourceLocale}
              globalFilterUntranslated={props.globalFilterUntranslated}
              pinnedPhrases={props.pinnedPhrases}
              setPinnedPhrases={props.setPinnedPhrases}
              isPinned={props.isPinned}
              isSearching={props.isSearching}
              searchText={props.searchText}
              onFocusSearch={props.onFocusSearch}
            />
          )}
          {phrase &&
            (phrase?.linkVariablesEnabled ||
              (phrase.linkVariables?.length ?? 0) > 0) && (
              <LinkVariablesList
                phrase={phrase}
                phraseRef={props.phraseRef}
                selectedLocale={props.selectedLocale}
                systemSourceLocale={props.systemSourceLocale}
                globalFilterUntranslated={props.globalFilterUntranslated}
                fallbackLocale={props.fallbackLocale}
                pinnedPhrases={props.pinnedPhrases}
                setPinnedPhrases={props.setPinnedPhrases}
                isPinned={props.isPinned}
                isSearching={props.isSearching}
                searchText={props.searchText}
                onFocusSearch={props.onFocusSearch}
              />
            )}
          {phrase &&
            (phrase?.interpolationsEnabled ||
              (phrase?.interpolationVariants?.length ?? 0) > 0) &&
            (phrase?.variables?.length ?? 0) > 0 && (
              <InterpolationVariantList
                phrase={phrase}
                phraseRef={props.phraseRef}
                selectedLocale={props.selectedLocale}
                systemSourceLocale={props.systemSourceLocale}
                globalFilterUntranslated={props.globalFilterUntranslated}
                pinnedPhrases={props.pinnedPhrases}
                setPinnedPhrases={props.setPinnedPhrases}
                isPinned={props.isPinned}
                isSearching={props.isSearching}
                searchText={props.searchText}
                onFocusSearch={props.onFocusSearch}
              />
            )}
          {phrase &&
            (phrase?.variables?.length ?? 0) > 0 &&
            !props.isSearching && (
              <TestCaseList
                phrase={phrase}
                phraseRef={props.phraseRef}
                selectedLocale={props.selectedLocale}
                fallbackLocale={props.fallbackLocale}
                globalFallbackLocale={props.globalFallbackLocale}
              />
            )}
        </div>
      )}
    </div>
  );
});

export default React.memo(PhraseTranslation);
