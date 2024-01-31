import {
  PointerTypes,
  SchemaRoot,
  SchemaTypes,
  updateObjectInStateMap,
  getReferencedObject,
  makeQueryRef,
  extractQueryArgs,
} from "../floro-schema-api";
import { sendTranslationRequest } from "../deepl/deepLHelpers";
import Observer from "@floro/storybook/stories/design-system/ContentEditor/editor/Observer";
import EditorDocument from "@floro/storybook/stories/design-system/ContentEditor/editor/EditorDocument";
import { sendGenderizationRequest, sendPluralizationRequest } from "../chatgpt/chatGPTHelpers";

const getShouldProcess = (
  ref: string,
  visitedRefs: string[],
  target: {
    richTextHtml?: string;
    json?: string;
    plainText?: string;
    sourceAtRevision?: {
      richTextHtml?: string;
      json?: string;
      plainText?: string;
    };
  },
  source: { richTextHtml?: string; json?: string; plainText?: string },
  filterPlan: "all" | "untranslated" | "requires_update"
): boolean => {
  if (
    (source.plainText?.trim() ?? "") == "" &&
    (target?.sourceAtRevision?.plainText?.trim() ?? "") == ""
  ) {
    return false;
  }
  if (visitedRefs.includes(ref)) {
    return false;
  }
  if (filterPlan == "all") {
    return true;
  }
  if (filterPlan == "untranslated") {
    return (
      (target.plainText?.trim() ?? "") == "" &&
      (source?.plainText?.trim() ?? "") != ""
    );
  }
  if ((target?.sourceAtRevision?.plainText?.trim() ?? "") == "") {
    return false;
  }
  return (target?.sourceAtRevision?.json ?? "{}") != (source?.json ?? "{}");
};

const getTsvEntries = (
  applicationState: SchemaRoot,
  enabledTermIdsArray: string[],
  targetLocaleRef: PointerTypes["$(text).localeSettings.locales.localeCode<?>"],
  sourceLocaleRef: PointerTypes["$(text).localeSettings.locales.localeCode<?>"]
) => {
  const terms = getReferencedObject(applicationState, "$(text).terms");

  const enabledTermIds = new Set(enabledTermIdsArray);
  const seenSource = new Set<string>([]);
  return (
    terms
      ?.filter((t) => enabledTermIds.has(t.id))
      .flatMap((term) => {
        const sourceValue =
          term.localizedTerms.find((localizedTerm) => {
            return localizedTerm.id == sourceLocaleRef;
          })?.termValue ?? term?.name;

        const targetValue =
          term.localizedTerms.find((localizedTerm) => {
            return localizedTerm.id == targetLocaleRef;
          })?.termValue ?? term?.name;

        return {
          source: (sourceValue == "" ? term.name : sourceValue)
            .replaceAll("\n", " ")
            .replaceAll("\t", " "),
          target: (targetValue == "" ? term.name : targetValue)
            .replaceAll("\n", " ")
            .replaceAll("\t", " "),
        };
      })
      ?.filter(({ source }) => {
        if (!seenSource.has(source)) {
          seenSource.add(source);
          return true;
        }
        return false;
      })
      ?.map(({ source, target }) => {
        return `${source}\t${target}`;
      }) ?? []
  );
};

export const translatePhraseJob = async (
  currentPluginAppState: React.MutableRefObject<SchemaRoot | null>,
  applicationState: SchemaRoot,
  lastEditKey: React.MutableRefObject<string | null>,
  phraseRef: PointerTypes["$(text).phraseGroups.id<?>.phrases.id<?>"],
  selectedLocale: SchemaTypes["$(text).localeSettings.locales.localeCode<?>"],
  selectedSystemLocale: SchemaTypes["$(text).localeSettings.locales.localeCode<?>"],
  filterPlan: "all" | "untranslated" | "requires_update",
  deepLKey: string,
  isFreePlan: boolean,
  openAiKey: string | undefined | null,
  autoPluralize: boolean,
  autoGenderize: boolean,
  visitedRefs: string[]
): Promise<boolean> => {
  try {
    const phrase = getReferencedObject(applicationState, phraseRef);
    const targetRef = makeQueryRef(
      "$(text).localeSettings.locales.localeCode<?>",
      selectedLocale.localeCode
    );
    const sourceRef = makeQueryRef(
      "$(text).localeSettings.locales.localeCode<?>",
      selectedSystemLocale.localeCode
    );

    const variables = phrase?.variables?.map((v) => v.name) ?? [];
    const linkVariables = phrase?.linkVariables?.map?.((v) => v.linkName) ?? [];
    const interpolationVariants =
      phrase?.interpolationVariants?.map?.((v) => v.name) ?? [];
    const contentVariables =
      phrase?.contentVariables?.map?.((v) => v.name) ?? [];
    const styledContents = phrase?.styledContents?.map?.((v) => v.name) ?? [];

    // START PHRASE TRANSLATION/PHRASE SECTION
    if (!phrase.usePhraseSections) {
      /**
       * PHRASE TRANSLATION
       */
      const targetTranslationRef: PointerTypes["$(text).phraseGroups.id<?>.phrases.id<?>.phraseTranslations.id<?>"] = `${phraseRef}.phraseTranslations.id<${targetRef}>`;
      const sourceTranslationRef: PointerTypes["$(text).phraseGroups.id<?>.phrases.id<?>.phraseTranslations.id<?>"] = `${phraseRef}.phraseTranslations.id<${sourceRef}>`;
      const targetPhraseTranslation = getReferencedObject(
        applicationState,
        targetTranslationRef
      );
      const sourcePhraseTranslation = getReferencedObject(
        applicationState,
        sourceTranslationRef
      );
      const shouldProcess = getShouldProcess(
        targetTranslationRef,
        visitedRefs,
        targetPhraseTranslation,
        sourcePhraseTranslation,
        filterPlan
      );
      if (shouldProcess) {
        visitedRefs.push(targetTranslationRef);
        const sourceEnabledMentionedValues =
          sourcePhraseTranslation.enabledTerms ?? [];
        const observer = new Observer(
          variables,
          linkVariables,
          interpolationVariants,
          sourceEnabledMentionedValues,
          contentVariables,
          styledContents
        );
        const sourceDoc = new EditorDocument(
          observer,
          selectedLocale.localeCode?.toLowerCase() ?? "en"
        );
        const tags = observer.getAllTags();
        const escapedSourceRichText = tags.reduce((s: string, tag) => {
          const targetTag = `{${tag}}`
            .replaceAll("<", "&lt;")
            .replaceAll(">", "&gt;")
            .replaceAll('"', "&quot;")
            .replaceAll("'", "&#39;")
            .replaceAll("&", "&amp;");
          const escapedTag = `<x>{${tag}}</x>`;
          return s.replaceAll(targetTag, escapedTag);
        }, sourcePhraseTranslation.richTextHtml ?? "");
        const tsvEntries = getTsvEntries(
          applicationState,
          sourcePhraseTranslation.enabledTerms,
          targetRef,
          sourceRef
        );
        const { translation } = await sendTranslationRequest({
          tsvEntries: tsvEntries.join("\n"),
          deepLKey,
          sourceLang: selectedSystemLocale.localeCode,
          targetLang: selectedLocale.localeCode,
          text: escapedSourceRichText,
          isFreePlan,
        });

        const reEscapedString = tags.reduce((s: string, tag) => {
          const targetTag = `{${tag}}`;
          const escapedTag = `<x>{${tag}}</x>`;
          return s.replaceAll(escapedTag, targetTag);
        }, translation);

        sourceDoc.tree.updateRootFromHTML(reEscapedString);
        const richTextHtml = reEscapedString;
        const json = JSON.stringify(sourceDoc.toJSON());
        const plainText = sourceDoc.toPlainText();
        const nextTarget: SchemaTypes["$(text).phraseGroups.id<?>.phrases.id<?>.phraseTranslations.id<?>"] =
          {
            ...targetPhraseTranslation,
            richTextHtml,
            plainText,
            json,
            sourceAtRevision: {
              plainText: sourcePhraseTranslation.plainText,
              json: sourcePhraseTranslation.json,
              richTextHtml: sourcePhraseTranslation.richTextHtml,
            },
          };
        currentPluginAppState.current = updateObjectInStateMap(
          applicationState,
          `${phraseRef}.phraseTranslations.id<${targetRef}>`,
          nextTarget
        ) as SchemaRoot;
        lastEditKey.current = `${phraseRef}.phraseTranslations.id<${targetRef}>`;
      }
    } else {
      // loop phrase translations
      for (const phraseSection of phrase?.phraseSections ?? []) {
        /**
         * PHRASE SECTION
         */
        const targetTranslationRef: PointerTypes["$(text).phraseGroups.id<?>.phrases.id<?>.phraseSections.name<?>.localeRules.id<?>.displayValue"] = `${phraseRef}.phraseSections.name<${phraseSection.name}>.localeRules.id<${targetRef}>.displayValue`;
        const sourceTranslationRef: PointerTypes["$(text).phraseGroups.id<?>.phrases.id<?>.phraseSections.name<?>.localeRules.id<?>.displayValue"] = `${phraseRef}.phraseSections.name<${phraseSection.name}>.localeRules.id<${sourceRef}>.displayValue`;
        const targetPhraseSection = getReferencedObject(
          applicationState,
          targetTranslationRef
        );
        const sourcePhraseSectionTranslation = getReferencedObject(
          applicationState,
          sourceTranslationRef
        );
        const shouldProcess = getShouldProcess(
          targetTranslationRef,
          visitedRefs,
          targetPhraseSection,
          sourcePhraseSectionTranslation,
          filterPlan
        );
        if (shouldProcess) {
          visitedRefs.push(targetTranslationRef);
          const sourceEnabledMentionedValues =
            sourcePhraseSectionTranslation.enabledTerms ?? [];
          const observer = new Observer(
            variables,
            linkVariables,
            interpolationVariants,
            sourceEnabledMentionedValues,
            contentVariables,
            styledContents
          );
          const sourceDoc = new EditorDocument(
            observer,
            selectedLocale.localeCode?.toLowerCase() ?? "en"
          );
          const tags = observer.getAllTags();
          const escapedSourceRichText = tags.reduce((s: string, tag) => {
            const targetTag = `{${tag}}`
              .replaceAll("<", "&lt;")
              .replaceAll(">", "&gt;")
              .replaceAll('"', "&quot;")
              .replaceAll("'", "&#39;")
              .replaceAll("&", "&amp;");
            const escapedTag = `<x>{${tag}}</x>`;
            return s.replaceAll(targetTag, escapedTag);
          }, sourcePhraseSectionTranslation.richTextHtml ?? "");
          const tsvEntries = getTsvEntries(
            applicationState,
            sourcePhraseSectionTranslation.enabledTerms,
            targetRef,
            sourceRef
          );
          const { translation } = await sendTranslationRequest({
            tsvEntries: tsvEntries.join("\n"),
            deepLKey,
            sourceLang: selectedSystemLocale.localeCode,
            targetLang: selectedLocale.localeCode,
            text: escapedSourceRichText,
            isFreePlan,
          });

          const reEscapedString = tags.reduce((s: string, tag) => {
            const targetTag = `{${tag}}`;
            const escapedTag = `<x>{${tag}}</x>`;
            return s.replaceAll(escapedTag, targetTag);
          }, translation);

          sourceDoc.tree.updateRootFromHTML(reEscapedString);
          const richTextHtml = reEscapedString;
          const json = JSON.stringify(sourceDoc.toJSON());
          const plainText = sourceDoc.toPlainText();
          const nextTarget: SchemaTypes["$(text).phraseGroups.id<?>.phrases.id<?>.phraseSections.name<?>.localeRules.id<?>.displayValue"] =
            {
              ...targetPhraseSection,
              richTextHtml,
              plainText,
              json,
              sourceAtRevision: {
                plainText: sourcePhraseSectionTranslation.plainText,
                json: sourcePhraseSectionTranslation.json,
                richTextHtml: sourcePhraseSectionTranslation.richTextHtml,
              },
            };
          currentPluginAppState.current = updateObjectInStateMap(
            applicationState,
            targetTranslationRef,
            nextTarget
          ) as SchemaRoot;
          lastEditKey.current = targetTranslationRef;
        }
      }
    }
    // END PHRASE TRANSLATION/PHRASE SECTION
    for (const styledContent of phrase?.styledContents ?? []) {
      /**
       * STYLED CONTENT
       */
      const targetTranslationRef: PointerTypes["$(text).phraseGroups.id<?>.phrases.id<?>.styledContents.name<?>.localeRules.id<?>.displayValue"] = `${phraseRef}.styledContents.name<${styledContent.name}>.localeRules.id<${targetRef}>.displayValue`;
      const sourceTranslationRef: PointerTypes["$(text).phraseGroups.id<?>.phrases.id<?>.styledContents.name<?>.localeRules.id<?>.displayValue"] = `${phraseRef}.styledContents.name<${styledContent.name}>.localeRules.id<${sourceRef}>.displayValue`;
      const targetPhrase = getReferencedObject(
        applicationState,
        targetTranslationRef
      );
      const sourceTranslation = getReferencedObject(
        applicationState,
        sourceTranslationRef
      );
      const shouldProcess = getShouldProcess(
        targetTranslationRef,
        visitedRefs,
        targetPhrase,
        sourceTranslation,
        filterPlan
      );
      if (shouldProcess) {
        visitedRefs.push(targetTranslationRef);
        const sourceEnabledMentionedValues =
          sourceTranslation.enabledTerms ?? [];
        const observer = new Observer(
          variables,
          linkVariables,
          interpolationVariants,
          sourceEnabledMentionedValues,
          contentVariables,
          []
        );
        const sourceDoc = new EditorDocument(
          observer,
          selectedLocale.localeCode?.toLowerCase() ?? "en"
        );
        const tags = observer.getAllTags();
        const escapedSourceRichText = tags.reduce((s: string, tag) => {
          const targetTag = `{${tag}}`
            .replaceAll("<", "&lt;")
            .replaceAll(">", "&gt;")
            .replaceAll('"', "&quot;")
            .replaceAll("'", "&#39;")
            .replaceAll("&", "&amp;");
          const escapedTag = `<x>{${tag}}</x>`;
          return s.replaceAll(targetTag, escapedTag);
        }, sourceTranslation.richTextHtml ?? "");
        const tsvEntries = getTsvEntries(
          applicationState,
          sourceTranslation.enabledTerms,
          targetRef,
          sourceRef
        );
        const { translation } = await sendTranslationRequest({
          tsvEntries: tsvEntries.join("\n"),
          deepLKey,
          sourceLang: selectedSystemLocale.localeCode,
          targetLang: selectedLocale.localeCode,
          text: escapedSourceRichText,
          isFreePlan,
        });

        const reEscapedString = tags.reduce((s: string, tag) => {
          const targetTag = `{${tag}}`;
          const escapedTag = `<x>{${tag}}</x>`;
          return s.replaceAll(escapedTag, targetTag);
        }, translation);

        sourceDoc.tree.updateRootFromHTML(reEscapedString);
        const richTextHtml = reEscapedString;
        const json = JSON.stringify(sourceDoc.toJSON());
        const plainText = sourceDoc.toPlainText();
        const nextTarget: SchemaTypes["$(text).phraseGroups.id<?>.phrases.id<?>.styledContents.name<?>.localeRules.id<?>.displayValue"] =
          {
            ...targetPhrase,
            richTextHtml,
            plainText,
            json,
            sourceAtRevision: {
              plainText: sourceTranslation.plainText,
              json: sourceTranslation.json,
              richTextHtml: sourceTranslation.richTextHtml,
            },
          };
        currentPluginAppState.current = updateObjectInStateMap(
          applicationState,
          targetTranslationRef,
          nextTarget
        ) as SchemaRoot;
        lastEditKey.current = targetTranslationRef;
      }
    }

    for (const linkVariable of phrase?.linkVariables ?? []) {
      /**
       * LINK DISPLAY
       */
      const targetTranslationRef: PointerTypes["$(text).phraseGroups.id<?>.phrases.id<?>.linkVariables.linkName<?>.translations.id<?>.linkDisplayValue"] = `${phraseRef}.linkVariables.linkName<${linkVariable.linkName}>.translations.id<${targetRef}>.linkDisplayValue`;
      const sourceTranslationRef: PointerTypes["$(text).phraseGroups.id<?>.phrases.id<?>.linkVariables.linkName<?>.translations.id<?>.linkDisplayValue"] = `${phraseRef}.linkVariables.linkName<${linkVariable.linkName}>.translations.id<${sourceRef}>.linkDisplayValue`;
      const targetPhrase = getReferencedObject(
        applicationState,
        targetTranslationRef
      );
      const sourceTranslation = getReferencedObject(
        applicationState,
        sourceTranslationRef
      );
      const shouldProcess = getShouldProcess(
        targetTranslationRef,
        visitedRefs,
        targetPhrase,
        sourceTranslation,
        filterPlan
      );
      if (shouldProcess) {
        visitedRefs.push(targetTranslationRef);
        const sourceEnabledMentionedValues =
          sourceTranslation.enabledTerms ?? [];
        const observer = new Observer(
          variables,
          [],
          interpolationVariants,
          sourceEnabledMentionedValues,
          contentVariables,
          []
        );
        const sourceDoc = new EditorDocument(
          observer,
          selectedLocale.localeCode?.toLowerCase() ?? "en"
        );
        const tags = observer.getAllTags();
        const escapedSourceRichText = tags.reduce((s: string, tag) => {
          const targetTag = `{${tag}}`
            .replaceAll("<", "&lt;")
            .replaceAll(">", "&gt;")
            .replaceAll('"', "&quot;")
            .replaceAll("'", "&#39;")
            .replaceAll("&", "&amp;");
          const escapedTag = `<x>{${tag}}</x>`;
          return s.replaceAll(targetTag, escapedTag);
        }, sourceTranslation.richTextHtml ?? "");
        const tsvEntries = getTsvEntries(
          applicationState,
          sourceTranslation.enabledTerms,
          targetRef,
          sourceRef
        );
        const { translation } = await sendTranslationRequest({
          tsvEntries: tsvEntries.join("\n"),
          deepLKey,
          sourceLang: selectedSystemLocale.localeCode,
          targetLang: selectedLocale.localeCode,
          text: escapedSourceRichText,
          isFreePlan,
        });

        const reEscapedString = tags.reduce((s: string, tag) => {
          const targetTag = `{${tag}}`;
          const escapedTag = `<x>{${tag}}</x>`;
          return s.replaceAll(escapedTag, targetTag);
        }, translation);

        sourceDoc.tree.updateRootFromHTML(reEscapedString);
        const richTextHtml = reEscapedString;
        const json = JSON.stringify(sourceDoc.toJSON());
        const plainText = sourceDoc.toPlainText();
        const nextTarget: SchemaTypes["$(text).phraseGroups.id<?>.phrases.id<?>.linkVariables.linkName<?>.translations.id<?>.linkDisplayValue"] =
          {
            ...targetPhrase,
            richTextHtml,
            plainText,
            json,
            sourceAtRevision: {
              plainText: sourceTranslation.plainText,
              json: sourceTranslation.json,
              richTextHtml: sourceTranslation.richTextHtml,
            },
          };
        currentPluginAppState.current = updateObjectInStateMap(
          applicationState,
          targetTranslationRef,
          nextTarget
        ) as SchemaRoot;
        lastEditKey.current = targetTranslationRef;
      }
    }
    for (const interpolationVariant of phrase?.interpolationVariants ?? []) {
      /**
       * INTERPOLATIONS VARIANT
       */
      const targetTranslationRef: PointerTypes["$(text).phraseGroups.id<?>.phrases.id<?>.interpolationVariants.name<?>.localeRules.id<?>.defaultValue"] = `${phraseRef}.interpolationVariants.name<${interpolationVariant.name}>.localeRules.id<${targetRef}>.defaultValue`;
      const sourceTranslationRef: PointerTypes["$(text).phraseGroups.id<?>.phrases.id<?>.interpolationVariants.name<?>.localeRules.id<?>.defaultValue"] = `${phraseRef}.interpolationVariants.name<${interpolationVariant.name}>.localeRules.id<${sourceRef}>.defaultValue`;
      const targetPhrase = getReferencedObject(
        applicationState,
        targetTranslationRef
      );
      const sourceTranslation = getReferencedObject(
        applicationState,
        sourceTranslationRef
      );
      const shouldProcess = getShouldProcess(
        targetTranslationRef,
        visitedRefs,
        targetPhrase,
        sourceTranslation,
        filterPlan
      );
      if (shouldProcess) {
        visitedRefs.push(targetTranslationRef);
        const sourceEnabledMentionedValues =
          sourceTranslation.enabledTerms ?? [];
        const observer = new Observer(
          variables,
          [],
          [],
          sourceEnabledMentionedValues,
          contentVariables,
          []
        );
        const sourceDoc = new EditorDocument(
          observer,
          selectedLocale.localeCode?.toLowerCase() ?? "en"
        );
        const tags = observer.getAllTags();
        const escapedSourceRichText = tags.reduce((s: string, tag) => {
          const targetTag = `{${tag}}`
            .replaceAll("<", "&lt;")
            .replaceAll(">", "&gt;")
            .replaceAll('"', "&quot;")
            .replaceAll("'", "&#39;")
            .replaceAll("&", "&amp;");
          const escapedTag = `<x>{${tag}}</x>`;
          return s.replaceAll(targetTag, escapedTag);
        }, sourceTranslation.richTextHtml ?? "");
        const tsvEntries = getTsvEntries(
          applicationState,
          sourceTranslation.enabledTerms,
          targetRef,
          sourceRef
        );
        const { translation } = await sendTranslationRequest({
          tsvEntries: tsvEntries.join("\n"),
          deepLKey,
          sourceLang: selectedSystemLocale.localeCode,
          targetLang: selectedLocale.localeCode,
          text: escapedSourceRichText,
          isFreePlan,
        });

        const reEscapedString = tags.reduce((s: string, tag) => {
          const targetTag = `{${tag}}`;
          const escapedTag = `<x>{${tag}}</x>`;
          return s.replaceAll(escapedTag, targetTag);
        }, translation);

        sourceDoc.tree.updateRootFromHTML(reEscapedString);
        const richTextHtml = reEscapedString;
        const json = JSON.stringify(sourceDoc.toJSON());
        const plainText = sourceDoc.toPlainText();
        const nextTarget: SchemaTypes["$(text).phraseGroups.id<?>.phrases.id<?>.interpolationVariants.name<?>.localeRules.id<?>.defaultValue"] =
          {
            ...targetPhrase,
            richTextHtml,
            plainText,
            json,
            sourceAtRevision: {
              plainText: sourceTranslation.plainText,
              json: sourceTranslation.json,
              richTextHtml: sourceTranslation.richTextHtml,
            },
          };
        currentPluginAppState.current = updateObjectInStateMap(
          applicationState,
          targetTranslationRef,
          nextTarget
        ) as SchemaRoot;
        lastEditKey.current = targetTranslationRef;
        const variable = getReferencedObject(
          applicationState,
          interpolationVariant.variableRef
        );
        const [phraseGroupId, phraseId] = extractQueryArgs(
          interpolationVariant.variableRef
        );
        const genderVarRef = makeQueryRef(
          "$(text).phraseGroups.id<?>.phrases.id<?>.variables.id<?>",
          phraseGroupId,
          phraseId,
          "gender:string"
        );

        const isGenderVar = interpolationVariant.variableRef == genderVarRef;
        const hasGenderVar = !!phrase?.variables.find?.((v) => v.id == "gender:string");

        /**
         * CONDITIONALS
         */
        if (autoGenderize && isGenderVar && openAiKey) {
          const conditionsToAdd = await sendGenderizationRequest({
            localeCode: selectedLocale.localeCode,
            richText: reEscapedString,
            openAIKey: openAiKey,
          });
          const conditionals: SchemaTypes["$(text).phraseGroups.id<?>.phrases.id<?>.interpolationVariants.name<?>.localeRules.id<?>.conditionals"] =
            conditionsToAdd.map((condition) => {
              const doc = new EditorDocument(
                observer,
                selectedLocale.localeCode
              );
              doc.tree.updateRootFromHTML(condition.translation);
              const json = doc.toJSON();
              const plainText = doc.toPlainText();
              return {
                intComparatorValue: undefined,
                floatComparatorValue: undefined,
                booleanComparatorValue: undefined,
                stringComparatorValue: condition.condition,
                operator: "eq",
                resultant: {
                  json: JSON.stringify(json),
                  plainText,
                  richTextHtml: condition.translation,
                },
                subconditions: [],
              };
            });
            const conditionalsRef: PointerTypes["$(text).phraseGroups.id<?>.phrases.id<?>.interpolationVariants.name<?>.localeRules.id<?>.conditionals"] = `${phraseRef}.interpolationVariants.name<${interpolationVariant.name}>.localeRules.id<${targetRef}>.conditionals`;
            currentPluginAppState.current = updateObjectInStateMap(
              applicationState,
              conditionalsRef,
              conditionals
            ) as SchemaRoot;
            lastEditKey.current = conditionalsRef;
        }
        // PLURALIZE
        if (
          autoPluralize &&
          openAiKey &&
          (variable.varType == "integer" || variable.varType == "float")
        ) {
          const conditionsToAdd = await sendPluralizationRequest({
            localeCode: selectedLocale.localeCode,
            richText: reEscapedString,
            varName: variable.name as string,
            varType: variable.varType as string,
            openAIKey: openAiKey,
            isGenderized: autoGenderize && hasGenderVar,
          });

          const conditionals: SchemaTypes["$(text).phraseGroups.id<?>.phrases.id<?>.interpolationVariants.name<?>.localeRules.id<?>.conditionals"] =
            conditionsToAdd.map((condition) => {
              const doc = new EditorDocument(
                observer,
                selectedLocale.localeCode
              );
              doc.tree.updateRootFromHTML(condition.translation);
              const json = doc.toJSON();
              const plainText = doc.toPlainText();
              if (condition.operator == "is_fractional") {
                return {
                  booleanComparatorValue: undefined,
                  floatComparatorValue: undefined,
                  intComparatorValue: undefined,
                  stringComparatorValue: undefined,
                  operator: "is_fractional",
                  resultant: {
                    json: JSON.stringify(json),
                    plainText,
                    richTextHtml: condition.translation,
                  },
                  subconditions: condition.subconditions.map((subcondition) => {
                    if (subcondition.operator == "is_fractional") {
                      return {
                        conjunction: "AND",
                        variableRef: interpolationVariant.variableRef,
                        booleanComparatorValue: undefined,
                        floatComparatorValue: undefined,
                        intComparatorValue: undefined,
                        stringComparatorValue: undefined,
                        operator: "is_fractional",
                      };
                    } else if (subcondition.operator == "gender") {
                      return {
                        conjunction: "AND",
                        variableRef: genderVarRef,
                        booleanComparatorValue: undefined,
                        floatComparatorValue: undefined,
                        intComparatorValue: undefined,
                        stringComparatorValue: subcondition.condition as string,
                        operator: "eq",
                      };
                    } else {
                      return {
                        conjunction: "AND",
                        variableRef: interpolationVariant.variableRef,
                        intComparatorValue:
                          variable.varType == "integer"
                            ? (subcondition.condition as number)
                            : undefined,
                        floatComparatorValue:
                          variable.varType == "float"
                            ? (subcondition.condition as number)
                            : undefined,
                        booleanComparatorValue: undefined,
                        stringComparatorValue: undefined,
                        operator: subcondition.operator,
                      };
                    }
                  }),
                };
              } else {
                return {
                  intComparatorValue:
                    variable.varType == "integer"
                      ? condition.condition
                      : undefined,
                  floatComparatorValue:
                    variable.varType == "float"
                      ? condition.condition
                      : undefined,
                  booleanComparatorValue: undefined,
                  stringComparatorValue: undefined,
                  operator: condition.operator,
                  resultant: {
                    json: JSON.stringify(json),
                    plainText,
                    richTextHtml: condition.translation,
                  },
                  subconditions: condition.subconditions.map((subcondition) => {
                    if (subcondition.operator == "is_fractional") {
                      return {
                        conjunction: "AND",
                        variableRef: interpolationVariant.variableRef,
                        booleanComparatorValue: undefined,
                        floatComparatorValue: undefined,
                        intComparatorValue: undefined,
                        stringComparatorValue: undefined,
                        operator: "is_fractional",
                      };
                    } else if (subcondition.operator == "gender") {
                      return {
                        conjunction: "AND",
                        variableRef: genderVarRef,
                        booleanComparatorValue: undefined,
                        floatComparatorValue: undefined,
                        intComparatorValue: undefined,
                        stringComparatorValue: subcondition.condition as string,
                        operator: "eq",
                      };
                    } else {
                      return {
                        conjunction: "AND",
                        variableRef: interpolationVariant.variableRef,
                        intComparatorValue:
                          variable.varType == "integer"
                            ? (subcondition.condition as number)
                            : undefined,
                        floatComparatorValue:
                          variable.varType == "float"
                            ? (subcondition.condition as number)
                            : undefined,
                        booleanComparatorValue: undefined,
                        stringComparatorValue: undefined,
                        operator: subcondition.operator,
                      };
                    }
                  }),
                };
              }
            });
          const conditionalsRef: PointerTypes["$(text).phraseGroups.id<?>.phrases.id<?>.interpolationVariants.name<?>.localeRules.id<?>.conditionals"] = `${phraseRef}.interpolationVariants.name<${interpolationVariant.name}>.localeRules.id<${targetRef}>.conditionals`;
          currentPluginAppState.current = updateObjectInStateMap(
            applicationState,
            conditionalsRef,
            conditionals
          ) as SchemaRoot;
          lastEditKey.current = conditionalsRef;
        }
      }
    }
    return true;
  } catch (e) {
    console.log("E", e);
    return false;
  }
};
