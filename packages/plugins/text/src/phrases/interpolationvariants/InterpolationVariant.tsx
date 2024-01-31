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

import TrashLight from "@floro/common-assets/assets/images/icons/trash.light.darker.svg";
import TrashDark from "@floro/common-assets/assets/images/icons/trash.dark.svg";

import ContentEditor from "@floro/storybook/stories/design-system/ContentEditor";
import EditorDocument from "@floro/storybook/stories/design-system/ContentEditor/editor/EditorDocument";
import Button from "@floro/storybook/stories/design-system/Button";
import PlainTextDocument from "@floro/storybook/stories/design-system/ContentEditor/PlainTextDocument";
import Observer from "@floro/storybook/stories/design-system/ContentEditor/editor/Observer";
import ColorPalette from "@floro/styles/ColorPalette";
import ConditionalList from "./conditionals/ConditionalList";
import SourceDefaultValueInterpolationVariant from "./SourceDefaultValueInterpolationVariant";
import TextNode from "@floro/storybook/stories/design-system/ContentEditor/editor/nodes/TextNode";
import TermList from "../termdisplay/TermList";

import deepLSourceLocales from "../../deep_l_source_locales.json";
import deepLTargetLocales from "../../deep_l_target_locales.json";
import MLModal from "../mlmodal/MLModal";
import { useTranslationMemory } from "../../memory/TranslationMemoryContext";
import TranslationMemoryList from "../translationmemory/TranslationMemoryList";
import { useDiffColor } from "../../diff";
import TermModal from "../termmodal/TermModal";
import PromptModal from "../promptmodal/PromptModal";
import PluralizeModal from "../pluralizationmodal/PluralizeModal";
import GenderizeModal from "../genderizemodal/GenderizeModal";


const Container = styled.div`
`;

const SubContainer = styled.div`
  padding: 0;
  margin-bottom: 8px;
  border: 2px solid ${(props) => props.theme.colors.contrastText};
  padding: 16px;
  border-radius: 8px;
  position: relative;
  display: flex;
  flex-direction: column;
  width: 100%;
  margin-top: 24px;
  background: ${props => props.theme.name == 'light' ? ColorPalette.extraLightGray : ColorPalette.darkerGray};
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

const DeleteVarContainer = styled.div`
  cursor: pointer;
  margin-left: 16px;
  padding-top: 14px;
  display: flex;
  justify-content: center;
  align-items: center;
`;

const DeleteVar = styled.img`
  height: 32px;
  width: 32px;
  pointer-events: none;
  user-select: none;
`;

interface Props {
  phrase: SchemaTypes["$(text).phraseGroups.id<?>.phrases.id<?>"];
  phraseRef: PointerTypes["$(text).phraseGroups.id<?>.phrases.id<?>"];
  interpolationVariant: SchemaTypes["$(text).phraseGroups.id<?>.phrases.id<?>.interpolationVariants.name<?>"];
  selectedLocale: SchemaTypes["$(text).localeSettings.locales.localeCode<?>"];
  systemSourceLocale:
    | SchemaTypes["$(text).localeSettings.locales.localeCode<?>"]
    | null;
  interpolationVariantRef: PointerTypes["$(text).phraseGroups.id<?>.phrases.id<?>.interpolationVariants.name<?>"];
  setPinnedPhrases: (phraseRegs: Array<string>) => void;
  globalFilterUntranslated: boolean;
  isPinned: boolean;
  pinnedPhrases: Array<string>|null;
  onRemove: (variable: SchemaTypes["$(text).phraseGroups.id<?>.phrases.id<?>.interpolationVariants.name<?>"]) => void;
  searchText: string;
  isSearching: boolean;
  onFocusSearch: () => void;
}

const InterpolationVariant = (props: Props) => {
  const theme = useTheme();
  const [phraseGroupId, phraseId, name] = useExtractQueryArgs(
    props.interpolationVariantRef
  );
  const { commandMode, applicationState } = useFloroContext();

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
        "$(text).phraseGroups.id<?>.phrases.id<?>.interpolationVariants.name<?>.localeRules.id<?>",
        phraseGroupId,
        phraseId,
        name,
        sourceLocaleRef
      )
    : (null as unknown as PointerTypes["$(text).phraseGroups.id<?>.phrases.id<?>.interpolationVariants.name<?>.localeRules.id<?>"]);

  const sourceDefaultValue = useReferencedObject(`${sourceRef}.defaultValue`);

  const localRuleTranslationRef = useQueryRef(
    "$(text).phraseGroups.id<?>.phrases.id<?>.interpolationVariants.name<?>.localeRules.id<?>",
    phraseGroupId,
    phraseId,
    name,
    localeRef
  );
  const diffColor = useDiffColor(localRuleTranslationRef);

  const localeRule = useReferencedObject(localRuleTranslationRef);

  const variable = useReferencedObject(props.interpolationVariant.variableRef);

  const [defaultValue, setDefaultValue] = useFloroState(
    `${localRuleTranslationRef}.defaultValue`
  );

  const isGenderVar = useMemo(() => {
    return variable.name == "gender" && variable?.varType == "string";
  }, [variable])

  const hasGenderVar = useMemo(() => {
    for (const variable of props?.phrase?.variables ?? []) {
      if (variable.name == "gender" && variable?.varType == "string") {
        return true;
      }
    }
    return false;
  }, [props?.phrase?.variables])

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
    const json = JSON.parse(defaultValue?.json ?? "{}");
    const children: Array<TextNode> =
      (json?.children ?? [])?.flatMap?.((child: TextNode) => {
        if (child?.type == "ol-tag" || child?.type == "ul-tag") {
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
  }, [defaultValue?.plainText, defaultValue?.json, localeTerms]);

  const enabledMentionedValues = useMemo(() => {
    return mentionedTerms
      ?.filter((mentionedTerm) => {
        return defaultValue?.enabledTerms?.includes(mentionedTerm?.id);
      })
      ?.map((mentionedTerm) => mentionedTerm.value);
  }, [mentionedTerms, defaultValue?.enabledTerms]);

  const editorObserver = useMemo(() => {
    const variables = props.phrase.variables.map((v) => v.name);
    const contentVariables =
      props.phrase?.contentVariables?.map?.((v) => v.name) ?? [];
    const observer = new Observer(
      variables,
      [],
      [],
      enabledMentionedValues ?? [],
      contentVariables
    );
    observer.setSearchString(props.searchText);
    return observer
  }, [
    props.searchText,
    props.phrase?.variables,
    props.phrase?.contentVariables,
    props.interpolationVariant,
    enabledMentionedValues,
  ]);

  const localeRuleEditorDoc = useMemo(() => {
    if (defaultValue) {
      const doc = new EditorDocument(
        editorObserver,
        props.selectedLocale.localeCode?.toLowerCase() ?? "en"
      );
      doc.tree.updateRootFromHTML(defaultValue?.richTextHtml ?? "");
      return doc;
    }
    return new EditorDocument(
      editorObserver,
      props.selectedLocale.localeCode?.toLowerCase() ?? "en"
    );
  }, [props.selectedLocale.localeCode, editorObserver]);

  const targetEditorObserver = useMemo(() => {
    const variables = props.phrase.variables.map((v) => v.name);
    const contentVariables =
      props.phrase?.contentVariables?.map?.((v) => v.name) ?? [];
    return new Observer(
      variables,
      [],
      [],
      enabledMentionedValues ?? [],
      contentVariables
    );
  }, [
    props.phrase.variables,
    props.interpolationVariant,
    props.phrase?.contentVariables,
    enabledMentionedValues,
  ]);

  const targetEditorDoc = useMemo(() => {
    if (defaultValue) {
      const doc = new EditorDocument(
        targetEditorObserver,
        props.selectedLocale.localeCode?.toLowerCase() ?? "en"
      );
      doc.tree.updateRootFromHTML(defaultValue?.richTextHtml ?? "");
      return doc;
    }
    return new EditorDocument(
      targetEditorObserver,
      props.selectedLocale.localeCode?.toLowerCase() ?? "en"
    );
  }, [props.selectedLocale.localeCode, targetEditorObserver]);

  const defaultValueIsEmpty = useMemo(() => {
    return (defaultValue?.plainText ?? "") == "";
  }, [defaultValue?.plainText]);

  const sourceDefaultValueIsEmpty = useMemo(() => {
    return (sourceDefaultValue?.plainText ?? "") == "";
  }, [sourceDefaultValue?.plainText]);

  const timeout = useRef<NodeJS.Timeout>();
  const onSetDefaultValueContent = useCallback(
    (richTextHtml: string) => {
      localeRuleEditorDoc.tree.updateRootFromHTML(richTextHtml ?? "");
      const plainText = localeRuleEditorDoc.toPlainText();
      const json = localeRuleEditorDoc.toJSON();
      if (!defaultValue) {
        return;
      }
      if (
        defaultValueIsEmpty &&
        props.globalFilterUntranslated &&
        !props.isPinned
      ) {
        props.setPinnedPhrases([
          ...(props?.pinnedPhrases ?? []),
          props.phraseRef,
        ]);
      }
      if (sourceDefaultValue) {
        const shouldUpdateFromSource =
          sourceDefaultValue?.plainText != "" &&
          (defaultValue?.sourceAtRevision?.plainText ?? "") == "";
        const updateFn = setDefaultValue(
          {
            ...defaultValue,
            richTextHtml,
            plainText,
            json: JSON.stringify(json),
            sourceAtRevision: shouldUpdateFromSource ? {
              richTextHtml: sourceDefaultValue.richTextHtml,
              plainText: sourceDefaultValue.plainText,
              json: sourceDefaultValue.json,
              sourceLocaleRef: defaultValue.sourceAtRevision.sourceLocaleRef
            } : defaultValue.sourceAtRevision
          },
          false
        );
        if (updateFn) {
          clearTimeout(timeout.current);
          timeout.current = setTimeout(updateFn, 300);
        }
      } else {
        const updateFn = setDefaultValue(
          {
            ...defaultValue,
            richTextHtml,
            plainText,
            json: JSON.stringify(json),
          },
          false
        );
        if (updateFn) {
          clearTimeout(timeout.current);
          timeout.current = setTimeout(updateFn, 300);
        }
      }
    },
    [
      localeRuleEditorDoc?.tree,
      defaultValue,
      setDefaultValue,
      sourceDefaultValue,
      sourceRef,
      defaultValueIsEmpty,
      props.isPinned,
      props.setPinnedPhrases,
      props.pinnedPhrases,
      props.phraseRef,
      props.globalFilterUntranslated,
    ]
  );

  const highlightableVariables = useMemo(() => {
    const variables = props.phrase.variables?.map((v) => v.name) ?? [];
    const contentVariables =
      props.phrase?.contentVariables?.map?.((v) => v.name) ?? [];
    return [
      ...variables,
      ...(enabledMentionedValues ?? []),
      ...(contentVariables ?? []),
    ].join(":");
  }, [
    props.phrase.variables,
    props.phrase.contentVariables,
    enabledMentionedValues,
  ]);

  const onSaveContent = useCallback(() => {
    const json = JSON.stringify(localeRuleEditorDoc.toJSON());
    if (!defaultValue) {
      return;
    }
    if (json != defaultValue.json) {
      setDefaultValue({
        ...defaultValue,
        json
      }, true);
    }
  }, [highlightableVariables, defaultValue?.json])

  useEffect(() => {
    if (commandMode != "edit") {
      return;
    }
    const json = JSON.stringify(localeRuleEditorDoc.toJSON());
    if (json != defaultValue?.json) {
      const timeout = setTimeout(onSaveContent, 300)
      return () => {
        clearTimeout(timeout)
      }
    }
  }, [onSaveContent, highlightableVariables, defaultValue?.json, commandMode])


  const onMarkDisplayResolved = useCallback(() => {
    if (!defaultValue) {
      return;
    }
    if (sourceDefaultValue) {
      setDefaultValue({
        ...defaultValue,
        sourceAtRevision: {
          sourceLocaleRef: sourceLocaleRef,
          richTextHtml: sourceDefaultValue.richTextHtml,
          json: sourceDefaultValue.json,
          plainText: sourceDefaultValue.plainText,
        },
      });
    }
  }, [
    localeRuleEditorDoc?.tree,
    sourceDefaultValue,
    setDefaultValue,
    sourceDefaultValue?.richTextHtml,
    sourceDefaultValue?.json,
    sourceDefaultValue?.plainText,
    sourceRef,
  ]);

  const displayRequireRevision = useMemo(() => {
    if ((defaultValue?.plainText ?? "") == "") {
      return true;
    }

    if (!sourceDefaultValue) {
      return false;
    }
    return (
      (sourceDefaultValue?.json ?? "{}") !=
      (defaultValue?.sourceAtRevision?.json ?? "{}")
    );
  }, [
    defaultValue?.plainText,
    defaultValue?.sourceAtRevision?.json,
    sourceDefaultValue?.json,
    defaultValue?.plainText,
  ]);

  const xIcon = useMemo(() => {
    if (theme.name == "light") {
      return TrashLight;
    }
    return TrashDark;
  }, [theme.name]);

  const onRemove = useCallback(() => {
    if (props.interpolationVariant) {
      props.onRemove(props.interpolationVariant);
    }
  }, [props.interpolationVariant, props.onRemove]);

  const [hasMounted, setHasMounted] = useState(false);
  useEffect(() => {
    setHasMounted(false);
    const timeout = setTimeout(() => {
      setHasMounted(true);
    }, 0);
    return () => {
      clearTimeout(timeout);
    };
  }, [props.selectedLocale]);

  const onChangeTerm = useCallback(
    (termId: string) => {
      if (defaultValue?.enabledTerms?.includes(termId)) {
        const enabledTerms =
          defaultValue?.enabledTerms?.filter((t) => t != termId) ?? [];
        if (defaultValue) {
          setDefaultValue?.({
            ...defaultValue,
            enabledTerms,
          });
        }
      } else {
        const enabledTerms = [
          ...(defaultValue?.enabledTerms?.filter((t) => t != termId) ?? []),
          termId,
        ];
        if (defaultValue) {
          setDefaultValue?.({
            ...defaultValue,
            enabledTerms,
          });
        }
      }
    },
    [defaultValue?.enabledTerms, defaultValue, setDefaultValue]
  );

  const sourceEnabledMentionedValues = useMemo(() => {
    return mentionedTerms
      ?.filter((mentionedTerm) => {
        return sourceDefaultValue?.enabledTerms?.includes(mentionedTerm?.id);
      })
      ?.map((mentionedTerm) => mentionedTerm.value);
  }, [mentionedTerms, sourceDefaultValue?.enabledTerms]);

  const sourceEditorObserver = useMemo(() => {
    const variables = props.phrase.variables?.map((v) => v.name) ?? [];
    const contentVariables =
      props.phrase?.contentVariables?.map?.((v) => v.name) ?? [];
    return new Observer(
      variables,
      [],
      [],
      sourceEnabledMentionedValues ?? [],
      contentVariables
    );
  }, [
    props.phrase.variables,
    props.phrase.linkVariables,
    props.phrase.contentVariables,
    sourceEnabledMentionedValues,
  ]);

  const sourceEditorDoc = useMemo(() => {
    if (sourceDefaultValue && props?.systemSourceLocale?.localeCode) {
      const doc = new EditorDocument(
        sourceEditorObserver,
        props.systemSourceLocale.localeCode?.toLowerCase() ?? "en"
      );
      doc.tree.updateRootFromHTML(sourceDefaultValue?.richTextHtml ?? "");
      return doc;
    }
    return new EditorDocument(
      sourceEditorObserver,
      props?.systemSourceLocale?.localeCode?.toLowerCase() ?? "en"
    );
  }, [
    props?.systemSourceLocale?.localeCode,
    sourceEditorObserver,
    sourceDefaultValue,
  ]);

  const sourceMockHtml = useMemo(() => {
    return sourceEditorDoc.tree.getHtml();
  }, [sourceEditorDoc]);

  const targetMockHtml = useMemo(() => {
    return targetEditorDoc.tree.getHtml();
  }, [targetEditorDoc]);

  const [showMLTranslate, setShowMLTranslate] = useState(false);

  const onShowMLTranslate = useCallback(() => {
    setShowMLTranslate(true);
  }, []);

  const onHideMLTranslate = useCallback(() => {
    setShowMLTranslate(false);
  }, []);

  const [showPluralize, setShowPluralize] = useState(false);

  const onShowPluralize = useCallback(() => {
    setShowPluralize(true);
  }, []);

  const onHidePluralize = useCallback(() => {
    setShowPluralize(false);
  }, []);

  const [showGenderize, setShowGenderize] = useState(false);

  const onShowGenderize = useCallback(() => {
    setShowGenderize(true);
  }, []);

  const onHideGenderize = useCallback(() => {
    setShowGenderize(false);
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
    if (!sourceDefaultValue) {
      return [];
    }
    if ((defaultValue?.plainText?.trim() ?? "") == "") {
      return [];
    }
    if (!props.selectedLocale?.localeCode) {
      return [];
    }

    if ((sourceDefaultValue?.plainText?.trim() ?? "") == "") {
      return [];
    }

    const memory = translationMemory[props.selectedLocale.localeCode];
    if (!memory) {
      return [];
    }
    if (
      !memory?.[sourceDefaultValue?.plainText?.trim().toLowerCase() as string]
    ) {
      return [];
    }
    const termSet =
      memory?.[sourceDefaultValue?.plainText?.trim().toLowerCase() as string];
    if (!termSet) {
      return [];
    }
    return Array.from(termSet);
  }, [
    translationMemory,
    sourceDefaultValue,
    props.selectedLocale,
    defaultValue?.plainText,
  ]);

  const [showContent, setShowContent] = useState(false);

  useEffect(() => {
    const timeout = setTimeout(() => {
      setShowContent(true);
    }, 100);
    return () => {
      clearTimeout(timeout);
    };
  }, []);

  const showDefaultResult = useMemo(() => {
    if (!props.isSearching) {
      return true;
    }
    return (
      defaultValue?.plainText
        ?.toLowerCase()
        .indexOf(props.searchText.toLowerCase()) != -1
    );
  }, [props.isSearching, props.searchText]);

  const showAnyResult = useMemo(() => {
    if (!props.isSearching) {
      return true;
    }
    const defaultHasValue =
      defaultValue?.plainText
        ?.toLowerCase()
        .indexOf(props.searchText.toLowerCase()) != -1;
    if (defaultHasValue) {
      return true;
    }
    for (const conditional of localeRule.conditionals) {
      const conditionalHasValue =
        conditional.resultant?.plainText
          ?.toLowerCase()
          .indexOf(props.searchText.toLowerCase()) != -1;
      if (conditionalHasValue) {
        return true;
      }
    }
    return false;
  }, [props.isSearching, props.searchText]);

  if (!showContent) {
    return null;
  }

  if (!showAnyResult) {
    return null;
  }

  return (
    <div style={{ marginBottom: 24 }}>
      <TermModal
        show={showFindTerms && commandMode == "edit"}
        onDismiss={onHideFindTerms}
        targetPlainText={defaultValue?.plainText ?? ""}
        targetEditorDoc={targetEditorDoc}
      />
        <PluralizeModal
          show={showPluralize && commandMode == "edit"}
          onDismiss={onHidePluralize}
          targetRichText={defaultValue?.richTextHtml ?? ""}
          targetEditorDoc={targetEditorDoc}
          targetEditorObserver={targetEditorObserver}
          varName={variable.name}
          varType={variable.varType}
          locale={props.selectedLocale}
          localRuleTranslationRef={localRuleTranslationRef}
          varRef={props.interpolationVariant.variableRef}
          hasGender={hasGenderVar}
        />
        {isGenderVar && (
          <GenderizeModal
            show={showGenderize && commandMode == "edit"}
            onDismiss={onHideGenderize}
            targetRichText={defaultValue?.richTextHtml ?? ""}
            targetEditorDoc={targetEditorDoc}
            targetEditorObserver={targetEditorObserver}
            locale={props.selectedLocale}
            localRuleTranslationRef={localRuleTranslationRef}
            varRef={props.interpolationVariant.variableRef}
          />

        )}
      <PromptModal
        show={showPrompt && commandMode == "edit"}
        selectedLocale={props.selectedLocale}
        systemSourceLocale={props.systemSourceLocale}
        targetRichText={defaultValue?.richTextHtml ?? ""}
        sourceRichText={sourceDefaultValue?.richTextHtml}
        sourceMockText={sourceMockHtml}
        targetMockText={targetMockHtml}
        targetEditorDoc={targetEditorDoc}
        sourceEditorDoc={sourceEditorDoc}
        onDismiss={onHidePrompt}
        enabledTermIds={sourceDefaultValue?.enabledTerms ?? []}
        onApplyTranslation={onSetDefaultValueContent}
      />
      {sourceDefaultValue?.richTextHtml && commandMode == "edit" && (
        <MLModal
          show={showMLTranslate && commandMode == "edit"}
          selectedLocale={props.selectedLocale}
          systemSourceLocale={props.systemSourceLocale}
          sourceRichText={sourceDefaultValue?.richTextHtml}
          sourceMockText={sourceMockHtml}
          sourceEditorDoc={sourceEditorDoc}
          onDismiss={onHideMLTranslate}
          enabledTermIds={sourceDefaultValue.enabledTerms}
          onApplyTranslation={onSetDefaultValueContent}
        />
      )}
      <TitleRow>
        <RowTitle
          style={{
            marginTop: 15,
            display: "flex",
            flexDirection: "row",
            alignItems: "center",
          }}
        >
          <span
            style={{
              fontSize: "1.4rem",
              background: ColorPalette.variableYellow,
              boxShadow: `inset 0px 0px 2px 2px ${ColorPalette.variableYellowInset}`,
              borderRadius: 8,
              padding: 4,
              fontWeight: 500,
              color: ColorPalette.darkGray,
            }}
          >
            {name}
          </span>
          <span
            style={{
              marginLeft: 8,
              color: diffColor,
              fontWeight: 600,
            }}
          >
            {` (${props.selectedLocale.localeCode}):`}
          </span>
        </RowTitle>
        {commandMode == "edit" && !props.isSearching && (
          <DeleteVarContainer onClick={onRemove}>
            <DeleteVar src={xIcon} />
          </DeleteVarContainer>
        )}
      </TitleRow>
      <SubContainer style={{ borderColor: diffColor }}>
        {localeRule && hasMounted && (
          <ConditionalList
            phrase={props.phrase}
            phraseRef={props.phraseRef}
            selectedLocale={props.selectedLocale}
            systemSourceLocale={props.systemSourceLocale}
            globalFilterUntranslated={props.globalFilterUntranslated}
            pinnedPhrases={props.pinnedPhrases}
            setPinnedPhrases={props.setPinnedPhrases}
            isPinned={props.isPinned}
            localeRule={localeRule}
            localeRuleRef={localRuleTranslationRef}
            variable={variable}
            interpolationVariant={props.interpolationVariant}
            searchText={props.searchText}
            isSearching={props.isSearching}
            onFocusSearch={props.onFocusSearch}
          />
        )}
        {showDefaultResult && (
          <>
            <Container>
              <TitleRow style={{ marginBottom: 24 }}>
                <RowTitle
                  style={{
                    fontWeight: 600,
                    display: "flex",
                    flexDirection: "row",
                    alignItems: "center",
                    maxWidth: displayRequireRevision ? "65%" : "100%",
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      flexDirection: "row",
                      flexWrap: "wrap",
                      alignItems: "center",
                    }}
                  >
                    <span style={{ color: theme.colors.contrastText }}>
                      {`Default Conditional Value of `}
                    </span>
                    <span
                      style={{
                        fontSize: "1.4rem",
                        background: ColorPalette.variableYellow,
                        boxShadow: `inset 0px 0px 2px 2px ${ColorPalette.variableYellowInset}`,
                        borderRadius: 8,
                        padding: 4,
                        fontWeight: 500,
                        color: ColorPalette.darkGray,
                        marginLeft: 8,
                        marginRight: 8,
                      }}
                    >
                      {name}
                    </span>
                    <span style={{ color: theme.colors.contrastText }}>
                      {`(${props.selectedLocale.localeCode}):`}
                    </span>
                  </div>
                  {(variable.varType == "float" ||
                    variable.varType == "integer") &&
                    (defaultValue?.plainText?.trim?.() ?? "") != "" &&
                    commandMode == "edit" && (
                      <div style={{ width: 120, marginLeft: 12 }}>
                        <Button
                          label={"pluralize"}
                          bg={"purple"}
                          size={"small"}
                          textSize="small"
                          onClick={onShowPluralize}
                        />
                      </div>
                    )}
                  {isGenderVar &&
                    (defaultValue?.plainText?.trim?.() ?? "") != "" &&
                    commandMode == "edit" && (
                      <div style={{ width: 120, marginLeft: 12 }}>
                        <Button
                          label={"genderize"}
                          bg={"purple"}
                          size={"small"}
                          textSize="small"
                          onClick={onShowGenderize}
                        />
                      </div>
                    )}
                  {props.systemSourceLocale && commandMode == "edit" && (
                    <div style={{ width: 120, marginLeft: 12 }}>
                      <Button
                        label={"ML translate"}
                        bg={"teal"}
                        size={"small"}
                        textSize="small"
                        onClick={onShowMLTranslate}
                        isDisabled={
                          sourceDefaultValueIsEmpty ||
                          !deepLSourceLocales[
                            props.systemSourceLocale?.localeCode?.toUpperCase()
                          ] ||
                          !deepLTargetLocales?.[
                            props?.selectedLocale?.localeCode?.toUpperCase()
                          ]
                        }
                      />
                    </div>
                  )}
                </RowTitle>
                <div style={{ maxWidth: "50%" }}>
                  {displayRequireRevision && (
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
                        (defaultValue?.plainText ?? "") != "" &&
                        (defaultValue?.sourceAtRevision?.plainText ?? "") !=
                          "" && (
                          <Button
                            onClick={onMarkDisplayResolved}
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
                  editorDoc={localeRuleEditorDoc}
                  content={defaultValue?.richTextHtml ?? ""}
                  onSetContent={onSetDefaultValueContent}
                  placeholder={`write the (${props.selectedLocale.localeCode}) value for ${name}...`}
                  onOpenGPT={onShowPrompt}
                  showGPTIcon={
                    (!!sourceDefaultValue &&
                      (sourceDefaultValue?.richTextHtml?.trim() ?? "") != "" &&
                      (defaultValue?.plainText?.trim() ?? "") != "") ||
                    (!sourceDefaultValue &&
                      (defaultValue?.plainText?.trim() ?? "") != "")
                  }
                  onSearch={props.onFocusSearch}
                />
              )}
              {commandMode != "edit" && (
                <PlainTextDocument
                  lang={props.selectedLocale.localeCode?.toLowerCase() ?? "en"}
                  editorDoc={localeRuleEditorDoc}
                  content={defaultValue?.richTextHtml ?? ""}
                />
              )}
              {defaultValue && (
                <TermList
                  terms={mentionedTerms ?? []}
                  selectedLocale={props.selectedLocale}
                  systemSourceLocale={props.systemSourceLocale}
                  onChange={onChangeTerm}
                  enabledTerms={defaultValue?.enabledTerms ?? []}
                  showFindTerms={
                    !props.systemSourceLocale && !props.isSearching
                  }
                  onShowFindTerms={onShowFindTerms}
                  isEmpty={(defaultValue?.plainText?.trim?.() ?? "") == ""}
                  title={
                    <>
                      <span style={{ color: theme.colors.contrastText }}>
                        {`Recognized Terms in Default Conditional Value of `}
                      </span>
                      <span
                        style={{
                          fontSize: "1.4rem",
                          background: ColorPalette.variableYellow,
                          boxShadow: `inset 0px 0px 2px 2px ${ColorPalette.variableYellowInset}`,
                          borderRadius: 8,
                          padding: 4,
                          fontWeight: 500,
                          color: ColorPalette.darkGray,
                          marginLeft: 8,
                          marginRight: 8,
                        }}
                      >
                        {name}
                      </span>
                      <span style={{ color: theme.colors.contrastText }}>
                        {`(${props.selectedLocale.localeCode}):`}
                      </span>
                    </>
                  }
                />
              )}
              {translationMemories.length > 0 &&
                (defaultValue?.plainText ?? "").trim() == "" &&
                commandMode == "edit" && (
                  <TranslationMemoryList
                    memories={translationMemories}
                    observer={editorObserver}
                    onApply={onSetDefaultValueContent}
                    lang={props.selectedLocale?.localeCode}
                  />
                )}
            </Container>
            {props.systemSourceLocale &&
              props.interpolationVariant &&
              localeRule && (
                <SourceDefaultValueInterpolationVariant
                  phrase={props.phrase}
                  phraseRef={props.phraseRef}
                  selectedLocale={props.selectedLocale}
                  systemSourceLocale={props.systemSourceLocale}
                  interpolationVariant={props.interpolationVariant}
                  interpolationVariantRef={props.interpolationVariantRef}
                  targetInterpolationVariantLocaleRule={localeRule}
                />
              )}
          </>
        )}
      </SubContainer>
    </div>
  );
};

export default React.memo(InterpolationVariant);
