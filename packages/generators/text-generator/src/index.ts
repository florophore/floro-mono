import {
  PointerTypes,
  QueryTypes,
  SchemaRoot,
  SchemaTypes,
  getReferencedObject,
  makeQueryRef,
} from "./floro-generator-schema-api";
import floroGeneratorFile from '../floro/floro.generator.json';
import path from "path";
import fs from "fs";
import { quicktype, InputData, JSONSchemaInput, TypeScriptTargetLanguage } from "quicktype-core";

type Languages = 'typescript';

export function filename() {
  return __filename;
}

export function getFloroGenerator() {
  return floroGeneratorFile;
}

const CODE = `
const isStatementTrue = <T>(
  value: T,
  comparisonValue: T,
  operator: "eq" | "neq" | "gt" | "gte" | "lt" | "lte" | "is_fractional"
): boolean => {
  if (operator == "eq") {
    return value == comparisonValue;
  }
  if (operator == "neq") {
    return value != comparisonValue;
  }
  const numberValue: number = value as number ?? 0;
  const comparisonNumberValue: number = comparisonValue as number ?? 0;
  if (operator == "gt") {
    return numberValue > comparisonNumberValue;
  }
  if (operator == "gte") {
    return numberValue >= comparisonNumberValue;
  }
  if (operator == "lt") {
    return numberValue < comparisonNumberValue;
  }
  if (operator == "lte") {
    return numberValue <= comparisonNumberValue;
  }
  if (operator == "is_fractional" && typeof numberValue == "number") {
    return numberValue % 1 != 0;
  }
  return false;
};

export const getPhraseValue = <
T extends keyof Locales,
K extends keyof PhraseKeys,
A extends PhraseKeys[K]["variables"]
> (
  localizedPhrases: LocalizedPhrases,
  localeKey: T,
  phraseKey: K,
  args: A
): StaticNode[] => {
  const locale = localizedPhrases.locales[localeKey];
  const phrase =
    localizedPhrases.localizedPhraseKeys[locale?.localeCode as string][phraseKey];

  const interpolationMap = {} as {
    [k: string]: StaticNode[];
  };
  for (const interpolationKey in phrase.interpolations) {
    const interpolation: Interpolation = phrase.interpolations[interpolationKey];
    interpolationMap[interpolationKey] = getInterpolationValue(
      interpolation,
      args
    ) as StaticNode[];
  }
  const hrefMap = {} as {
    [k: string]: string;
  };
  for (const linkKey in phrase.links) {
    const link: {
      linkName: string;
      href: PlainTextNode[];
      displayValue: TextNode[];
    } = phrase.links[linkKey];
    hrefMap[linkKey] = getStaticText(link.href, args);
  }
  const linkMap = {} as {
    [k: string]: StaticNode[];
  };
  for (const linkKey in phrase.links) {
    const link: {
      linkName: string;
      href: PlainTextNode[];
      displayValue: TextNode[];
    } = phrase.links[linkKey];
    linkMap[linkKey] = getStaticNodes(
      link.displayValue,
      args,
      hrefMap,
      {},
      interpolationMap
    ) as StaticNode[];
  }
  return getStaticNodes(
    phrase.phrase,
    args,
    hrefMap,
    linkMap,
    interpolationMap
  ) as StaticNode[];
}

export interface StaticTextNode {
  type: "text";
  content: string;
  styles: {
    isBold: boolean;
    isItalic: boolean;
    isUnderlined: boolean;
    isStrikethrough: boolean;
    isSuperscript: boolean;
    isSubscript: boolean;
  }
  children: StaticNode[]
}

export interface StaticLinkNode {
  type: "link";
  linkName: string;
  href: string;
  styles: {
    isBold: boolean;
    isItalic: boolean;
    isUnderlined: boolean;
    isStrikethrough: boolean;
    isSuperscript: boolean;
    isSubscript: boolean;
  }
  children: StaticNode[]
}

export interface StaticUnOrderedListNode {
  type: "ul";
  children: StaticListNode[]
}

export interface StaticOrderedListNode {
  type: "ol";
  children: StaticListNode[]
}

export interface StaticListNode {
  type: "li";
  children: StaticNode[]
}

export type StaticNode = StaticTextNode | StaticLinkNode | StaticUnOrderedListNode | StaticOrderedListNode;

const getStaticNodes = <
  K extends keyof PhraseKeys,
  A extends PhraseKeys[K]["variables"]
>(
  textNodes: TextNode[],
  variableMap: A,
  hrefMap: { [key in PhraseKeys[K]["links"] as string]: string } = {} as {
    [key in PhraseKeys[K]["links"] as string]: string;
  },
  linkMap: { [key in PhraseKeys[K]["links"] as string]: StaticNode[] } = {} as {
    [key in PhraseKeys[K]["links"] as string]: StaticNode[];
  },
  interpolationsMap: {
    [key in PhraseKeys[K]["interpolations"] as string]: StaticNode[];
  } = {} as { [key in PhraseKeys[K]["interpolations"] as string]: StaticNode[] }
): (StaticNode | StaticListNode)[] => {
  return textNodes.map((textNode) => {
    const children = getStaticNodes(
      textNode.children,
      variableMap,
      hrefMap,
      linkMap,
      interpolationsMap
    );
    if (textNode.type == "variable") {
      const variableName = textNode.content.substring(
        1,
        textNode.content.length - 1
      ) as keyof PhraseKeys[K]["variables"]&string;
      const variableValue = variableMap?.[variableName] ?? "" as string;
      return {
        type: "text",
        content: variableValue?.toString?.() ?? "",
        styles: textNode.styles,
        children: [],
      } as StaticTextNode;
    }
    if (textNode.type == "interpolation") {
      const interpolationName = textNode.content.substring(
        1,
        textNode.content.length - 1
      ) as keyof PhraseKeys[K]["interpolations"]&string;
      const interpolationChildren = interpolationsMap[interpolationName] as StaticNode[];
      return {
        type: "text",
        content: '',
        styles: textNode.styles,
        children: interpolationChildren,
      } as StaticTextNode;
    }
    if (textNode.type == "link") {
      const linkName = textNode.content.substring(
        1,
        textNode.content.length - 1
      ) as keyof PhraseKeys[K]["links"]&string;
      const linkChildren = linkMap[linkName] as StaticNode[];
      return {
        type: "link",
        linkName,
        href: hrefMap[linkName],
        styles: textNode.styles,
        children: linkChildren,
      } as StaticLinkNode;
    }
    if (textNode.type == "li") {
      return {
        type: "li",
        children,
      } as StaticListNode;
    }
    if (textNode.type == "ol") {
      const listChildren = children as unknown as StaticListNode[];
      return {
        type: "ol",
        children: listChildren,
      } as StaticOrderedListNode;
    }
    if (textNode.type == "ul") {
      const listChildren = children as unknown as StaticListNode[];
      return {
        type: "ul",
        children: listChildren,
      } as StaticUnOrderedListNode;
    }
    return {
      type: "text",
      content: textNode.content,
      styles: textNode.styles,
      children,
    } as StaticTextNode;
  });
};

const getInterpolationValue = <
K extends keyof PhraseKeys,
A extends PhraseKeys[K]["variables"],
V extends keyof A,
> (interpolation: Interpolation, args: A) => {
  for (const caseStatement of interpolation.cases) {
    const argValue: A[V]|string|number|boolean = args[caseStatement.variable];
    const comparatorValue = caseStatement.value as A[V];
    const operator = caseStatement.operator as "eq" | "neq" | "gt" | "gte" | "lt" | "lte" | "is_fractional";
    if (!isStatementTrue(argValue, comparatorValue, operator)) {
      continue;
    }
    let allSubcasesAreTrue = true;
    for (const subcase of caseStatement.subcases) {
      const comparatorValue = subcase.value as A[V];
      if (!isStatementTrue(argValue, comparatorValue, operator)) {
        allSubcasesAreTrue = false;
        break;
      }
    }
    if (!allSubcasesAreTrue) {
      break;
    }
    return getStaticNodes(caseStatement.resultant, args);
  }
  return getStaticNodes(interpolation.default, args);
}

const getStaticText = <
  K extends keyof PhraseKeys,
  A extends PhraseKeys[K]["variables"]
>(
  plainTextNodes: PlainTextNode[],
  variableMap: A,
): string => {
  return plainTextNodes.map((textNode) => {
    if (textNode.type == "variable") {
      const variableName = textNode.content.substring(
        1,
        textNode.content.length - 1
      ) as keyof PhraseKeys[K]["variables"]&string;
      const variableValue = variableMap?.[variableName] ?? "" as string;
      return variableValue;
    }
    return textNode.content;
  }).join("");
};

export const getDebugInfo = <
  K extends keyof PhraseKeyDebugInfo,
>(
  phraseKeyDebugInfo: PhraseKeyDebugInfo,
  key: K,
): DebugInfo => {
  return phraseKeyDebugInfo[key];
};
`.trim();

interface UnprocessedNode {
  type: string;
  content: string;
  marks?: {
    isBold: boolean;
    isItalic: boolean;
    isUnderlined: boolean;
    isStrikethrough: boolean;
    isSuperscript: boolean;
    isSubscript: boolean;
  };
  children: UnprocessedNode[];
}

interface TextNode {
  content: string;
  type: 'text'|'li'|'ul'|'ol'|'interpolation'|'link'|'variable';
  children: TextNode[]
  styles?: {
    isBold: boolean;
    isItalic: boolean;
    isUnderlined: boolean;
    isStrikethrough: boolean;
    isSuperscript: boolean;
    isSubscript: boolean;
  }
}

interface PlainTextNode {
  content: string;
  type: 'text'|'variable';
}

const getNodeType = (tagType: string): 'text'|'li'|'ul'|'ol'|'interpolation'|'link'|'variable' => {
  if (tagType == 'link-variable-tag') {
    return 'link';
  }
  if (tagType == 'li-tag') {
    return 'li';
  }
  if (tagType == 'ul-tag') {
    return 'ul';
  }
  if (tagType == 'ol-tag') {
    return 'ol';
  }
  if (tagType == 'variable-tag') {
    return 'variable';
  }
  if (tagType == 'variant-tag') {
    return 'interpolation';
  }
  if (tagType == 'link-variable-tag') {
    return 'link';
  }
  return 'text';
}

const getPlainNodeType = (tagType: string): 'text'|'variable' => {
  if (tagType == 'variable-tag') {
    return 'variable';
  }
  return 'text';
}

const processNodes = (
  nodes: UnprocessedNode[]
): TextNode[] => {
  return nodes.map((node): TextNode => {
    const children = processNodes(
      node.children
    );
    return {
      children,
      content: node.content,
      type: getNodeType(node.type),
      styles: {
        isBold: node?.marks?.isBold ?? false,
        isItalic: node?.marks?.isItalic ?? false,
        isUnderlined: node?.marks?.isUnderlined ?? false,
        isStrikethrough: node?.marks?.isStrikethrough ?? false,
        isSuperscript: node?.marks?.isSuperscript ?? false,
        isSubscript: node?.marks?.isSubscript ?? false,
      },
    };
  });
};

const getTextNodes = (jsonString: string): TextNode[] => {
  const root: {children?: UnprocessedNode[]} = JSON.parse(jsonString);
  return processNodes(root?.children ?? []);
}

const getPlainTextNodes = (jsonString: string): PlainTextNode[] => {
  const root: {children?: UnprocessedNode[]} = JSON.parse(jsonString);
  return root?.children?.map((child: UnprocessedNode): PlainTextNode => {
    const type = getPlainNodeType(child.type);
    return {
      type,
      content: child.content
    } as PlainTextNode
  }) ?? [] as PlainTextNode[]
}

export async function getJSON<T>(
  state: SchemaRoot,
): Promise<T> {
  const localizedPhrases = {
    locales: {},
    localizedPhraseKeys: {},
    phraseKeyDebugInfo: {}
  };

  const localeSettings = getReferencedObject(state, "$(text).localeSettings")
  const phraseGroups = getReferencedObject(state, "$(text).phraseGroups")
  const defaultLocale = getReferencedObject(state, localeSettings.defaultLocaleRef)
  const defaultLocaleCode = defaultLocale?.localeCode;
  for (const locale of localeSettings.locales) {
    const localeRef = makeQueryRef("$(text).localeSettings.locales.localeCode<?>", locale.localeCode);
    const defaultFallbackCode = locale?.defaultFallbackLocaleRef
      ? locale?.defaultFallbackLocaleRef
      : localeSettings.defaultLocaleRef == localeRef
      ? null
      : defaultLocale.localeCode;
    localizedPhrases.locales[locale.localeCode] = {
      localeCode: locale.localeCode,
      name: locale.name,
      defaultFallbackCode,
      isGlobalDefault: defaultLocaleCode == locale.localeCode
    }
    localizedPhrases.localizedPhraseKeys[locale.localeCode] = {};
    const fallbackRef = (defaultFallbackCode
      ? makeQueryRef(
          "$(text).localeSettings.locales.localeCode<?>",
          defaultFallbackCode
        )
      : null) as QueryTypes['$(text).localeSettings.locales.localeCode<?>'];
    for (const phraseGroup of phraseGroups) {
      for (const phrase of phraseGroup.phrases) {
        const phraseKey = `${phraseGroup.id}.${phrase.id}`;
        localizedPhrases.phraseKeyDebugInfo[phraseKey] = {
          groupName: phraseGroup.name,
          phraseKey: phrase.phraseKey,
        }
        localizedPhrases.localizedPhraseKeys[locale.localeCode][phraseKey] = {
          phraseKey,
          variables: {},
          links: {},
          interpolations: {},
        };

        // DO VARIABLES FIRST
        for (const variable of phrase?.variables ?? []) {
          const varValue =
            variable.varType == "string"
              ? ""
              : variable.varType == "boolean"
              ? false
              : 0;
          localizedPhrases.localizedPhraseKeys[locale.localeCode][
            phraseKey
          ].variables[variable.name] = varValue;
        }
        // DO INTERPOLATIONS SECOND
        for (const interpolation of phrase?.interpolationVariants ?? []) {
          localizedPhrases.localizedPhraseKeys[locale.localeCode][
            phraseKey
          ].interpolations[interpolation.name] = {
            cases: []
          };
          const primaryVariable = getReferencedObject(state, interpolation.variableRef);
          const interpolationTranslationRef = makeQueryRef(
            "$(text).phraseGroups.id<?>.phrases.id<?>.interpolationVariants.name<?>.localeRules.id<?>",
            phraseGroup.id,
            phrase.id,
            interpolation.name,
            localeRef
          );
          const interpolationTranslation = getReferencedObject(
            state,
            interpolationTranslationRef
          );
          const fallbackInterpolationTranslationRef = makeQueryRef(
            "$(text).phraseGroups.id<?>.phrases.id<?>.interpolationVariants.name<?>.localeRules.id<?>",
            phraseGroup.id,
            phrase.id,
            interpolation.name,
            fallbackRef
          );

          const fallbackInterpolationTranslation = getReferencedObject(
            state,
            fallbackInterpolationTranslationRef
          );
          const defaultFallbackInterpolationTranslationRef = makeQueryRef(
            "$(text).phraseGroups.id<?>.phrases.id<?>.interpolationVariants.name<?>.localeRules.id<?>",
            phraseGroup.id,
            phrase.id,
            interpolation.name,
            localeSettings.defaultLocaleRef as QueryTypes['$(text).localeSettings.locales.localeCode<?>']
          );
          const defaultFallbackInterpolationTranslation = getReferencedObject(
            state,
            defaultFallbackInterpolationTranslationRef
          );
          const conditionals = interpolationTranslation?.conditionals?.filter?.(c => c.resultant?.plainText?.trim() != "") ?? [];
          if (conditionals.length == 0 && (interpolationTranslation?.defaultValue?.plainText ?? "").trim() == "") {
            const fallbackConditionals =
              fallbackInterpolationTranslation.conditionals?.filter?.(
                (c) => {
                  return c.resultant?.plainText?.trim() != ""
                }
              ) ?? [];
            if (fallbackConditionals.length == 0 && (fallbackInterpolationTranslation?.defaultValue?.plainText ?? "").trim() == "") {
              // use global default
              const defaultConditionals =
                defaultFallbackInterpolationTranslation.conditionals?.filter?.(
                  (c) => c.resultant?.plainText?.trim() != ""
                ) ?? [];
                const defaultJSON = defaultFallbackInterpolationTranslation?.defaultValue?.json ?? "{}";
                localizedPhrases.localizedPhraseKeys[locale.localeCode][
                  phraseKey
                ].interpolations[interpolation.name].default = getTextNodes(defaultJSON);

                for (const conditional of defaultConditionals) {
                  const value = primaryVariable?.varType == "string" ?
                    conditional?.stringComparatorValue :
                    primaryVariable?.varType == "boolean" ?
                    conditional?.booleanComparatorValue :
                    primaryVariable?.varType == "integer" ?
                    conditional?.intComparatorValue :
                    conditional?.operator == "is_fractional" ?
                    undefined :
                    conditional?.floatComparatorValue;

                  const subcases = conditional?.subconditions?.map?.(subcondition => {
                    const subVar = getReferencedObject(state, subcondition.variableRef);
                    const value = subVar?.varType == "string" ?
                      subcondition?.stringComparatorValue :
                      subVar?.varType == "boolean" ?
                      subcondition?.booleanComparatorValue :
                      subVar?.varType == "integer" ?
                      subcondition?.intComparatorValue :
                      subcondition?.operator == "is_fractional" ?
                      undefined :
                      subcondition?.floatComparatorValue;
                      return {
                        value,
                        variable: subVar.name,
                        operator: subcondition.operator,
                        conjunction: subcondition.conjunction
                      }
                  }) ?? []

                  const resultantJSON = conditional?.resultant?.json ?? "{}";
                  const resultant = getTextNodes(resultantJSON);
                  const conditionalCase = {
                    variable: primaryVariable.name,
                    operator: conditional.operator,
                    value,
                    subcases,
                    resultant
                  }
                  localizedPhrases.localizedPhraseKeys[locale.localeCode][
                    phraseKey
                  ].interpolations[interpolation.name].cases.push(conditionalCase);
                }

            } else {
              // use fallback
                const defaultJSON = fallbackInterpolationTranslation?.defaultValue?.json ?? "{}";
                localizedPhrases.localizedPhraseKeys[locale.localeCode][
                  phraseKey
                ].interpolations[interpolation.name].default = getTextNodes(defaultJSON);

                for (const conditional of fallbackConditionals) {
                  const value = primaryVariable?.varType == "string" ?
                    conditional?.stringComparatorValue :
                    primaryVariable?.varType == "boolean" ?
                    conditional?.booleanComparatorValue :
                    primaryVariable?.varType == "integer" ?
                    conditional?.intComparatorValue :
                    conditional?.operator == "is_fractional" ?
                    undefined :
                    conditional?.floatComparatorValue;

                  const subcases = conditional?.subconditions.map?.(subcondition => {
                    const subVar = getReferencedObject(state, subcondition.variableRef);
                    const value = subVar?.varType == "string" ?
                      subcondition?.stringComparatorValue :
                      subVar?.varType == "boolean" ?
                      subcondition?.booleanComparatorValue :
                      subVar?.varType == "integer" ?
                      subcondition?.intComparatorValue :
                      subcondition?.operator == "is_fractional" ?
                      undefined :
                      subcondition?.floatComparatorValue;
                      return {
                        value,
                        variable: subVar.name,
                        operator: subcondition.operator,
                        conjunction: subcondition.conjunction
                      }
                  }) ?? [];

                  const resultantJSON = conditional?.resultant?.json ?? "{}";
                  const resultant = getTextNodes(resultantJSON);
                  const conditionalCase = {
                    variable: primaryVariable.name,
                    operator: conditional.operator,
                    value,
                    subcases,
                    resultant
                  }
                  localizedPhrases.localizedPhraseKeys[locale.localeCode][
                    phraseKey
                  ].interpolations[interpolation.name].cases.push(conditionalCase);
              }
            }
          } else {
            // use conditionals
            const defaultJSON = interpolationTranslation?.defaultValue?.json ?? "{}";
            localizedPhrases.localizedPhraseKeys[locale.localeCode][
              phraseKey
            ].interpolations[interpolation.name].default = getTextNodes(defaultJSON);

            for (const conditional of conditionals) {
              const value = primaryVariable?.varType == "string" ?
                conditional?.stringComparatorValue :
                primaryVariable?.varType == "boolean" ?
                conditional?.booleanComparatorValue :
                primaryVariable?.varType == "integer" ?
                conditional?.intComparatorValue :
                conditional?.operator == "is_fractional" ?
                undefined :
                conditional?.floatComparatorValue;

              const subcases = conditional?.subconditions?.map?.(subcondition => {
                const subVar = getReferencedObject(state, subcondition.variableRef);
                const value = subVar?.varType == "string" ?
                  subcondition?.stringComparatorValue :
                  subVar?.varType == "boolean" ?
                  subcondition?.booleanComparatorValue :
                  subVar?.varType == "integer" ?
                  subcondition?.intComparatorValue :
                  subcondition?.operator == "is_fractional" ?
                  undefined :
                  subcondition?.floatComparatorValue;
                  return {
                    value,
                    variable: subVar.name,
                    operator: subcondition.operator,
                    conjunction: subcondition.conjunction
                  }
              }) ?? [];

              const resultantJSON = conditional?.resultant?.json ?? "{}";
              const resultant = getTextNodes(resultantJSON);
              const conditionalCase = {
                variable: primaryVariable.name,
                operator: conditional.operator,
                value,
                subcases,
                resultant
              }
              localizedPhrases.localizedPhraseKeys[locale.localeCode][
                phraseKey
              ].interpolations[interpolation.name].cases.push(conditionalCase);
            }
          }
        }

        // DO LINKS THIRD
        for (const link of phrase?.linkVariables ?? []) {
          localizedPhrases.localizedPhraseKeys[locale.localeCode][
            phraseKey
          ].links[link.linkName] = {};
          const linkRef = makeQueryRef(
            "$(text).phraseGroups.id<?>.phrases.id<?>.linkVariables.linkName<?>.translations.id<?>",
            phraseGroup.id,
            phrase.id,
            link.linkName,
            localeRef
          );
          const linkTranslation = getReferencedObject(state, linkRef);
          const fallbackLinkRef = makeQueryRef(
            "$(text).phraseGroups.id<?>.phrases.id<?>.linkVariables.linkName<?>.translations.id<?>",
            phraseGroup.id,
            phrase.id,
            link.linkName,
            fallbackRef
          );
          const fallbackLinkTranslation = getReferencedObject(state, fallbackLinkRef);

          const defaultLinkRef = makeQueryRef(
            "$(text).phraseGroups.id<?>.phrases.id<?>.linkVariables.linkName<?>.translations.id<?>",
            phraseGroup.id,
            phrase.id,
            link.linkName,
            localeSettings.defaultLocaleRef
          );
          const defaultLink = getReferencedObject(state, defaultLinkRef);

          if ((linkTranslation?.linkDisplayValue?.plainText ?? "")?.trim() != "") {
            const displayValueJSON = linkTranslation?.linkDisplayValue?.json ?? '{}';
            const displayValue = getTextNodes(displayValueJSON);
            localizedPhrases.localizedPhraseKeys[locale.localeCode][phraseKey].links[link.linkName] = {
              displayValue,
              linkName: link.linkName
            };
          } else {
            if ((fallbackLinkTranslation?.linkDisplayValue?.plainText ?? "").trim() != "") {
              const displayValueJSON = fallbackLinkTranslation?.linkDisplayValue?.json ?? '{}';
              const displayValue = getTextNodes(displayValueJSON);
              localizedPhrases.localizedPhraseKeys[locale.localeCode][phraseKey].links[link.linkName] = {
                displayValue,
                linkName: link.linkName
              };
            } else {
              const displayValueJSON = defaultLink?.linkDisplayValue?.json ?? '{}';
              const displayValue = getTextNodes(displayValueJSON);
              localizedPhrases.localizedPhraseKeys[locale.localeCode][phraseKey].links[link.linkName] = {
                displayValue,
                linkName: link.linkName
              };
            }
          }
          if ((linkTranslation?.linkHrefValue?.plainText ?? "")?.trim() != "") {
            const hrefJSON = linkTranslation?.linkHrefValue?.json ?? '{}';
            const hrefValue = getPlainTextNodes(hrefJSON);
            localizedPhrases.localizedPhraseKeys[locale.localeCode][
              phraseKey
            ].links[link.linkName].href = hrefValue;

          } else {
            if ((fallbackLinkTranslation?.linkHrefValue?.plainText ?? "").trim() != "") {
              const hrefJSON = fallbackLinkTranslation?.linkHrefValue?.json ?? '{}';
              const hrefValue = getPlainTextNodes(hrefJSON);
              localizedPhrases.localizedPhraseKeys[locale.localeCode][
                phraseKey
              ].links[link.linkName].href = hrefValue;
            } else {
              const hrefJSON = defaultLink?.linkHrefValue?.json ?? '{}';
              const hrefValue = getPlainTextNodes(hrefJSON);
              localizedPhrases.localizedPhraseKeys[locale.localeCode][
                phraseKey
              ].links[link.linkName].href = hrefValue;
            }
          }
        }

        const phraseTranslationRef = makeQueryRef(
          "$(text).phraseGroups.id<?>.phrases.id<?>.phraseTranslations.id<?>",
          phraseGroup.id,
          phrase.id,
          localeRef
        );
        const phraseTranslation = getReferencedObject(
          state,
          phraseTranslationRef
        );
        const fallbackPhraseTranslationRef = makeQueryRef(
          "$(text).phraseGroups.id<?>.phrases.id<?>.phraseTranslations.id<?>",
          phraseGroup.id,
          phrase.id,
          fallbackRef as QueryTypes['$(text).localeSettings.locales.localeCode<?>']
        );
        const fallbackPhraseTranslation = getReferencedObject(
          state,
          fallbackPhraseTranslationRef
        );
        const defaultPhraseTranslationRef = makeQueryRef(
          "$(text).phraseGroups.id<?>.phrases.id<?>.phraseTranslations.id<?>",
          phraseGroup.id,
          phrase.id,
          localeSettings.defaultLocaleRef
        );
        const defaultPhraseTranslation = getReferencedObject(
          state,
          defaultPhraseTranslationRef
        );

        if ((phraseTranslation?.plainText ?? "").trim() != "") {
          const phraseJSON = phraseTranslation?.json ?? '{}';
          localizedPhrases.localizedPhraseKeys[locale.localeCode][phraseKey].phrase = getTextNodes(phraseJSON);
        } else {
          if ((fallbackPhraseTranslation?.plainText ?? "").trim() != "") {
            const phraseJSON = fallbackPhraseTranslation?.json ?? '{}';
            localizedPhrases.localizedPhraseKeys[locale.localeCode][phraseKey].phrase = getTextNodes(phraseJSON);
          } else {
            const phraseJSON = defaultPhraseTranslation?.json ?? '{}';
            localizedPhrases.localizedPhraseKeys[locale.localeCode][phraseKey].phrase = getTextNodes(phraseJSON);
          }
        }
      }
    }
  }
  return localizedPhrases as T;
}

export async function generate(
  state: SchemaRoot,
  outDir: string,
  args: { lang: Languages } = { lang: "typescript" }
) {
  const SCHEMA = {
    $schema: "http://json-schema.org/draft-06/schema#",
    $ref: "#/definitions/LocalizedPhrases",
    definitions: {
      Styles: {
        type: "object",
        properties: {
          isBold: {
            type: ["boolean"],
          },
          isItalic: {
            type: ["boolean"],
          },
          isUnderlined: {
            type: ["boolean"],
          },
          isStrikethrough: {
            type: ["boolean"],
          },
          isSuperscript: {
            type: ["boolean"],
          },
          isSubscript: {
            type: ["boolean"],
          },
        },
        required: [
          "isBold",
          "isItalic",
          "isUnderlined",
          "isStrikethrough",
          "isSuperscript",
          "isSubscript",
        ],
        additionalProperties: false,
      },
      TextNode: {
        type: "object",
        properties: {
          content: {
            type: ["string"],
          },
          type: {
            type: "string",
            oneOf: [
              { const: "text" },
              { const: "li" },
              { const: "ul" },
              { const: "ol" },
              { const: "interpolation" },
              { const: "link" },
              { const: "variable" },
            ],
          },
          styles: {
            $ref: "#/definitions/Styles",
          },
          children: {
            type: "array",
            items: {
              $ref: "#/definitions/TextNode",
            },
          },
        },
        required: [
          "content",
          "styles",
          "type",
          "children"
        ],
        additionalProperties: false,
      },
      PlainTextNode: {
        type: "object",
        properties: {
          content: {
            type: ["string"],
          },
          type: {
            type: "string",
            oneOf: [
              { const: "text" },
              { const: "variable" },
            ],
          },
        },
        required: [
          "content",
          "type",
        ],
        additionalProperties: false,
      },
      SubCase: {
        type: "object",
        properties: {
          variable: {
            type: ["string"],
          },
          value: {
            type: ["string", "number", "boolean"],
          },
          conjunction: {
            type: "string",
            oneOf: [{ const: "AND" }],
          },
          operator: {
            type: "string",
            oneOf: [
              { const: "eq" },
              { const: "neq" },
              { const: "gt" },
              { const: "gte" },
              { const: "lt" },
              { const: "lte" },
              { const: "is_fractional" },
            ],
          },
        },
        required: ["variable", "operator", "conjunction"],
        additionalProperties: false,
      },
      Case: {
        type: "object",
        properties: {
          variable: {
            type: ["string"],
          },
          value: {
            type: ["string", "number", "boolean"],
          },
          operator: {
            type: "string",
            oneOf: [
              { const: "eq" },
              { const: "neq" },
              { const: "gt" },
              { const: "gte" },
              { const: "lt" },
              { const: "lte" },
              { const: "is_fractional" },
            ],
          },
          subcases: {
            type: "array",
            items: {
              $ref: "#/definitions/SubCase",
            },
          },
          resultant: {
            type: "array",
            items: {
              $ref: "#/definitions/TextNode",
            },
          },
        },
        required: ["variable", "operator", "subcases", "resultant"],
        additionalProperties: false,
      },
      Interpolation: {
        type: "object",
        properties: {
          cases: {
            type: "array",
            items: {
              $ref: "#/definitions/Case",
            },
          },
          default: {
            type: "array",
            items: {
              $ref: "#/definitions/TextNode",
            },
          },
        },
        required: ["cases", "default"],
        additionalProperties: false,
      },
      Link: {
        type: "object",
        properties: {
          linkName: {
            type: ["string"],
          },
          href: {
            type: "array",
            items: {
              $ref: "#/definitions/PlainTextNode",
            },
          },
          displayValue: {
            type: "array",
            items: {
              $ref: "#/definitions/TextNode",
            },
          },
        },
        required: ["linkName", "displayValue"],
        additionalProperties: false,
      },
      DebugInfo: {
        type: "object",
        properties: {
          groupName: {
            type: ["string"],
          },
          phraseKey: {
            type: ["string"],
          },
        },
        required: ["groupName", "phraseKey"],
        additionalProperties: false,
      },
      Locales: {
        type: "object",
        properties: {},
        required: [] as string[],
        additionalProperties: false,
      },
      PhraseKeys: {
        type: "object",
        properties: {},
        required: [] as string[],
        additionalProperties: false,
      },
      PhraseKeyDebugInfo: {
        type: "object",
        properties: {},
        required: [] as string[],
        additionalProperties: false,
      },
      LocalizedPhraseKeys: {
        type: "object",
        properties: {},
        required: [] as string[],
        additionalProperties: false,
      },
      LocalizedPhrases: {
        type: "object",
        properties: {
          locales: {
            $ref: "#/definitions/Locales",
          },
          localizedPhraseKeys: {
            $ref: "#/definitions/LocalizedPhraseKeys",
          },
          phraseKeyDebugInfo: {
            $ref: "#/definitions/PhraseKeyDebugInfo",
          },
        },
        required: ["locales", "localizedPhraseKeys", "phraseKeyDebugInfo"],
        additionalProperties: false,
      },
    },
  };
  const localeSettings = getReferencedObject(state, "$(text).localeSettings")
  const phraseGroups = getReferencedObject(state, "$(text).phraseGroups")
  for (const locale of localeSettings.locales) {
    SCHEMA.definitions.Locales.properties[locale.localeCode] = {
      type: "object",
      additionalProperties: false,
      required: ["localeCode", "name", "defaultFallbackCode", "isGlobalDefault"],
      properties: {
        localeCode: {
          type: ["string"],
        },
        name: {
          type: ["string"],
        },
        defaultFallbackCode: {
          type: ["string", "null"],
        },
        isGlobalDefault: {
          type: ["boolean"],
        },
      },
    };
    SCHEMA.definitions.LocalizedPhraseKeys.properties[locale.localeCode] = {
      $ref: "#/definitions/PhraseKeys",
    }
    SCHEMA.definitions.LocalizedPhraseKeys.required.push(
      locale.localeCode
    );
  }

  for (const phraseGroup of phraseGroups) {
    for (const phrase of phraseGroup.phrases) {
      const phraseKey = `${phraseGroup.id}.${phrase.id}`;
      SCHEMA.definitions.PhraseKeyDebugInfo.required.push(phraseKey);
      SCHEMA.definitions.PhraseKeyDebugInfo.properties[phraseKey] = {
          $ref: "#/definitions/DebugInfo",
      };
      SCHEMA.definitions.PhraseKeys.required.push(phraseKey);
      SCHEMA.definitions.PhraseKeys.properties[phraseKey] = {
        type: "object",
        additionalProperties: false,
        required: ["phraseKey", "variables", "links", "interpolations", "phrase"],
        properties: {
          phraseKey: {
            type: ["string"],
          },
          phrase: {
            type: "array",
            items: {
              $ref: "#/definitions/TextNode",
            }
          },
          variables: {
            type: "object",
            properties: {},
            required: [] as string[],
            additionalProperties: false,
          },
          links: {
            type: "object",
            properties: {},
            required: [] as string[],
            additionalProperties: false,
          },
          interpolations: {
            type: "object",
            properties: {},
            required: [] as string[],
            additionalProperties: false,
          },
        },
      };
      for (const variable of phrase?.variables ?? []) {
        const varType =
          variable.varType == "string"
            ? "string"
            : variable.varType == "boolean"
            ? "boolean"
            : "number";
        SCHEMA.definitions.PhraseKeys.properties[phraseKey].properties.variables.properties[
          variable.name
        ] = {
          type: [varType],
        };
        SCHEMA.definitions.PhraseKeys.properties[phraseKey].properties.variables.required.push(
          variable.name
        );
      }
      for (const interpolation of phrase?.interpolationVariants ?? []) {
        SCHEMA.definitions.PhraseKeys.properties[phraseKey].properties.interpolations.properties[
          interpolation.name
        ] = {
          $ref: "#/definitions/Interpolation",
        };
        SCHEMA.definitions.PhraseKeys.properties[phraseKey].properties.interpolations.required.push(
          interpolation.name
        );
      }
      for (const linkVariables of phrase?.linkVariables ?? []) {
        SCHEMA.definitions.PhraseKeys.properties[phraseKey].properties.links.properties[
          linkVariables.linkName
        ] = {
          $ref: "#/definitions/Link",
        };
        SCHEMA.definitions.PhraseKeys.properties[phraseKey].properties.links.required.push(
          linkVariables.linkName
        );
      }
    }
  }

  const inputData = new InputData();
  const source = { name: "LocalizedPhrases", schema: JSON.stringify(SCHEMA) };
  await inputData.addSource(
    "schema",
    source,
    () => new JSONSchemaInput(undefined)
  );

  if (args.lang == 'typescript') {
    const lang = new TypeScriptTargetLanguage();
    const runtimeTypecheck = lang.optionDefinitions.find(option => option.name == 'runtime-typecheck')
    if (runtimeTypecheck) {
      runtimeTypecheck.defaultValue = false;
    }
    const { lines } = await quicktype({ lang, inputData });
    const code = lines.join("\n");
    const tsFile = path.join(outDir, 'index.ts');
    let tsCode =`import textJSON from './text.json';\n\n`;
    tsCode += code + '\n';
    tsCode += CODE + '\n\n';
    tsCode += `export default textJSON as unknown as LocalizedPhrases;`;
    await fs.promises.writeFile(tsFile, tsCode, 'utf-8');

    const textJson = await getJSON(state);
    const jsonFile = path.join(outDir, 'text.json');
    await fs.promises.writeFile(jsonFile, JSON.stringify(textJson, null, 2), 'utf-8');
  }
}