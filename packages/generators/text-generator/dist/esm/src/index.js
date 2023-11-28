import { getReferencedObject, makeQueryRef, } from "./floro-generator-schema-api";
import floroGeneratorFile from '../floro/floro.generator.json';
import path from "path";
import fs from "fs";
import { quicktype, InputData, JSONSchemaInput, TypeScriptTargetLanguage } from "quicktype-core";
export function filename() {
    return __filename;
}
export function getFloroGenerator() {
    return floroGeneratorFile;
}
const CODE = `
// START INLINE CODE

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

export const getPhraseValue = <C, T extends keyof Locales, K extends keyof PhraseKeys>(
  localizedPhrases: LocalizedPhrases,
  localeKey: T,
  phraseKey: K,
  args: {
    [KV in keyof PhraseKeys[K]["variables"]]: PhraseKeys[K]["variables"][KV];
  } &
    {
      [KCV in keyof PhraseKeys[K]["contentVariables"]]: C;
    } &
    {
      [KSC in keyof PhraseKeys[K]["styleClasses"]]: (
        content: C,
        styledContentName: keyof PhraseKeys[K]["styledContents"] & string
      ) => C;
    }
): StaticNode<C>[] => {
  const locale = localizedPhrases.locales[localeKey];
  const phrase =
    localizedPhrases.localizedPhraseKeys[locale?.localeCode as string][
      phraseKey
    ];

  const interpolationMap = {} as {
    [k: string]: StaticNode<C>[];
  };
  for (const interpolationKey in phrase.interpolations) {
    const interpolation: Interpolation =
      phrase.interpolations[interpolationKey];
    interpolationMap[interpolationKey] = getInterpolationValue(
      interpolation,
      args
    ) as StaticNode<C>[];
  }
  const hrefMap = {} as {
    [key in keyof PhraseKeys[K]["links"] & string]: string;
  };
  for (const k in phrase.links) {
    const linkKey = k as keyof PhraseKeys[K]["links"] & string;
    const link: {
      linkName: string;
      href: PlainTextNode[];
      displayValue: TextNode[];
    } = phrase.links[linkKey];
    hrefMap[linkKey] = getStaticText(link.href, args);
  }
  const linkMap = {} as {
    [k: string]: StaticNode<C>[];
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
    ) as StaticNode<C>[];
  }

  const styledContentMap = {} as {
    [k: string]: {
      styleClass: keyof PhraseKeys[K]["styleClasses"];
      nodes: StaticNode<C>[];
    };
  };
  for (const styledContentKey in phrase.styledContents) {
    const styledContent: StyledContent =
      phrase.styledContents[styledContentKey];
    styledContentMap[styledContentKey] = {
      styleClass:
        styledContent.styleClass as keyof PhraseKeys[K]["styleClasses"],
      nodes: getStaticNodes(
        styledContent.displayValue,
        args,
        hrefMap,
        {},
        interpolationMap
      ) as StaticNode<C>[],
    };
  }
  return getStaticNodes(
    phrase.phrase,
    args,
    hrefMap,
    linkMap,
    interpolationMap,
    styledContentMap
  ) as StaticNode<C>[];
};

export interface StaticTextNode<C> {
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
  children: StaticNode<C>[]
}

export interface StaticStyledTextNode<C, N extends string> {
  type: "styled-content";
  styleClass: string;
  styledContentName: N;
  styleClassFunction: (content: C, styledContentName: N) => C;
  content: string;
  styles: {
    isBold: boolean;
    isItalic: boolean;
    isUnderlined: boolean;
    isStrikethrough: boolean;
    isSuperscript: boolean;
    isSubscript: boolean;
  }
  children: StaticNode<C>[]
}

export interface StaticLinkNode<C> {
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
  children: StaticNode<C>[]
}

export interface StaticUnOrderedListNode<C> {
  type: "ul";
  children: StaticListNode<C>[]
}

export interface StaticOrderedListNode<C> {
  type: "ol";
  children: StaticListNode<C>[]
}

export interface StaticListNode<C> {
  type: "li";
  children: StaticNode<C>[]
}

export interface StaticContentVariable<C> {
  type: "content";
  data: C,
}

export type StaticNode<C> = StaticTextNode<C> | StaticLinkNode<C> | StaticUnOrderedListNode<C> | StaticOrderedListNode<C> | StaticContentVariable<C>;

const getStaticNodes = <C, K extends keyof PhraseKeys>(
  textNodes: TextNode[],
  argMap: {
    [KV in keyof PhraseKeys[K]["variables"]]: PhraseKeys[K]["variables"][KV];
  } &
    {
      [KCV in keyof PhraseKeys[K]["contentVariables"]]: C;
    } &
    {
      [KSC in keyof PhraseKeys[K]["styleClasses"]]: (
        content: C,
        styledContentName: keyof PhraseKeys[K]["styledContents"] & string
      ) => C;
    },
  hrefMap: { [key in keyof PhraseKeys[K]["links"] as string]: string } = {} as {
    [key in keyof PhraseKeys[K]["links"] as string]: string;
  },
  linkMap: {
    [key in keyof PhraseKeys[K]["links"] as string]: StaticNode<C>[];
  } = {} as {
    [key in keyof PhraseKeys[K]["links"] as string]: StaticNode<C>[];
  },
  interpolationsMap: {
    [key in keyof PhraseKeys[K]["interpolations"] as string]: StaticNode<C>[];
  } = {} as {
    [key in keyof PhraseKeys[K]["interpolations"] as string]: StaticNode<C>[];
  },
  styledContentsMap: {
    [key in keyof PhraseKeys[K]["styledContents"] as string]: {
        nodes: StaticNode<C>[],
        styleClass: keyof PhraseKeys[K]["styleClasses"]
    };
  } = {} as {
    [key in keyof PhraseKeys[K]["styledContents"] as string]: {
        nodes: StaticNode<C>[],
        styleClass: keyof PhraseKeys[K]["styleClasses"]
    };
  }
): (StaticNode<C> | StaticListNode<C>|StaticContentVariable<C>|StaticStyledTextNode<C, keyof PhraseKeys[K]["styledContents"]&string>)[] => {
  return textNodes.map((textNode) => {
    const children = getStaticNodes(
      textNode.children,
      argMap,
      hrefMap,
      linkMap,
      interpolationsMap,
      styledContentsMap
    );
    if (textNode.type == PhraseType.Variable) {
      const variableName = textNode.content.substring(
        1,
        textNode.content.length - 1
      ) as keyof PhraseKeys[K]["variables"] & string;
      const variableValue =
        argMap?.[variableName]?.toString?.() ?? ("" as string);
      return {
        type: "text",
        content: variableValue,
        styles: textNode.styles,
        children: [],
      } as StaticTextNode<C>;
    }
    if (textNode.type == PhraseType.ContentVariable) {
      const contentVariableName = textNode.content.substring(
        1,
        textNode.content.length - 1
      ) as keyof PhraseKeys[K]["contentVariables"] & string;
      const contentVariableValue: C = argMap?.[contentVariableName];
      return {
        type: "content",
        data: contentVariableValue,
      } as StaticContentVariable<C>;
    }
    if (textNode.type == PhraseType.StyledContent) {
      const styledContentName = textNode.content.substring(
        1,
        textNode.content.length - 1
      ) as keyof PhraseKeys[K]["styledContents"] & string;
      const styledContentChildren = styledContentsMap?.[styledContentName] as {
        nodes: StaticNode<C>[],
        styleClass: keyof PhraseKeys[K]["styleClasses"]&string
      };
      const styleClassFunction =
        argMap?.[
          styledContentChildren?.styleClass as keyof PhraseKeys[K]["styleClasses"] &
            string
        ];
      return {
        type: "styled-content",
        styleClass: styledContentChildren?.styleClass,
        styledContentName,
        styleClassFunction,
        content: "",
        styles: textNode.styles,
        children: styledContentChildren.nodes,
      } as StaticStyledTextNode<C, keyof PhraseKeys[K]["styledContents"] & string>;
    }

    if (textNode.type == PhraseType.Interpolation) {
      const interpolationName = textNode.content.substring(
        1,
        textNode.content.length - 1
      ) as keyof PhraseKeys[K]["interpolations"] & string;
      const interpolationChildren = interpolationsMap[
        interpolationName
      ] as StaticNode<C>[];
      return {
        type: "text",
        content: "",
        styles: textNode.styles,
        children: interpolationChildren,
      } as StaticTextNode<C>;
    }
    if (textNode.type == PhraseType.Link) {
      const linkName = textNode.content.substring(
        1,
        textNode.content.length - 1
      ) as keyof PhraseKeys[K]["links"] & string;
      const linkChildren = linkMap[linkName] as StaticNode<C>[];
      return {
        type: "link",
        linkName,
        href: hrefMap[linkName],
        styles: textNode.styles,
        children: linkChildren,
      } as StaticLinkNode<C>;
    }
    if (textNode.type == PhraseType.Li) {
      return {
        type: "li",
        children,
      } as StaticListNode<C>;
    }
    if (textNode.type == PhraseType.Ol) {
      const listChildren = children as unknown as StaticListNode<C>[];
      return {
        type: "ol",
        children: listChildren,
      } as StaticOrderedListNode<C>;
    }
    if (textNode.type == PhraseType.UL) {
      const listChildren = children as unknown as StaticListNode<C>[];
      return {
        type: "ul",
        children: listChildren,
      } as StaticUnOrderedListNode<C>;
    }
    return {
      type: "text",
      content: textNode.content,
      styles: textNode.styles,
      children,
    } as StaticTextNode<C>;
  });
};

const getInterpolationValue = <
C,
K extends keyof PhraseKeys,
> (
    interpolation: Interpolation,
    args: {
        [KV in keyof PhraseKeys[K]["variables"]]: PhraseKeys[K]["variables"][KV];
    }&{
        [KCV in keyof PhraseKeys[K]["contentVariables"]]: C;
    }&{
      [KSC in keyof PhraseKeys[K]["styleClasses"]]: (
        content: C,
        styledContentName: keyof PhraseKeys[K]["styledContents"] & string
      ) => C;
    }

     ) => {
  for (const caseStatement of interpolation.cases) {
    const argValue: PhraseKeys[K]["variables"][keyof PhraseKeys[K]["variables"]]|string|number|boolean = args[caseStatement.variable];
    const comparatorValue = caseStatement.value as PhraseKeys[K]["variables"][keyof PhraseKeys[K]["variables"]];
    const operator = caseStatement.operator as "eq" | "neq" | "gt" | "gte" | "lt" | "lte" | "is_fractional";
    if (!isStatementTrue(argValue, comparatorValue, operator)) {
      continue;
    }
    let allSubcasesAreTrue = true;
    for (const subcase of caseStatement.subcases) {
      const comparatorValue = subcase.value as PhraseKeys[K]["variables"][keyof PhraseKeys[K]["variables"]];
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
      const variableValue = variableMap?.[variableName]?.toString() ?? "" as string;
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
const getNodeType = (tagType) => {
    if (tagType == "li-tag") {
        return "li";
    }
    if (tagType == "ul-tag") {
        return "ul";
    }
    if (tagType == "ol-tag") {
        return "ol";
    }
    if (tagType == "variable-tag") {
        return "variable";
    }
    if (tagType == "variant-tag") {
        return "interpolation";
    }
    if (tagType == "link-variable-tag") {
        return "link";
    }
    if (tagType == "styled-content-tag") {
        return "styled-content";
    }
    if (tagType == "content-variable-tag") {
        return "content-variable";
    }
    return "text";
};
const getPlainNodeType = (tagType) => {
    if (tagType == 'variable-tag') {
        return 'variable';
    }
    if (tagType == "content-variable-tag") {
        return "content-variable";
    }
    return 'text';
};
const processNodes = (nodes) => {
    return nodes.map((node) => {
        const children = processNodes(node.children);
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
const getTextNodes = (jsonString) => {
    const root = JSON.parse(jsonString);
    return processNodes(root?.children ?? []);
};
const getPlainTextNodes = (jsonString) => {
    const root = JSON.parse(jsonString);
    return root?.children?.map((child) => {
        const type = getPlainNodeType(child.type);
        return {
            type,
            content: child.content
        };
    }) ?? [];
};
export async function getJSON(state) {
    const localizedPhrases = {
        locales: {},
        localizedPhraseKeys: {},
        phraseKeyDebugInfo: {}
    };
    const localeSettings = getReferencedObject(state, "$(text).localeSettings");
    const phraseGroups = getReferencedObject(state, "$(text).phraseGroups");
    const defaultLocale = getReferencedObject(state, localeSettings.defaultLocaleRef);
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
        };
        localizedPhrases.localizedPhraseKeys[locale.localeCode] = {};
        const fallbackRef = (defaultFallbackCode
            ? makeQueryRef("$(text).localeSettings.locales.localeCode<?>", defaultFallbackCode)
            : null);
        for (const phraseGroup of phraseGroups) {
            for (const phrase of phraseGroup.phrases) {
                const phraseKey = `${phraseGroup.id}.${phrase.id}`;
                localizedPhrases.phraseKeyDebugInfo[phraseKey] = {
                    groupName: phraseGroup.name,
                    phraseKey: phrase.phraseKey,
                };
                localizedPhrases.localizedPhraseKeys[locale.localeCode][phraseKey] = {
                    phraseKey,
                    variables: {},
                    contentVariables: {},
                    styleClasses: {},
                    args: {},
                    links: {},
                    interpolations: {},
                    styledContents: {},
                };
                // DO VARIABLES FIRST
                for (const variable of phrase?.variables ?? []) {
                    const varValue = variable.varType == "string"
                        ? ""
                        : variable.varType == "boolean"
                            ? false
                            : 0;
                    localizedPhrases.localizedPhraseKeys[locale.localeCode][phraseKey].variables[variable.name] = varValue;
                    localizedPhrases.localizedPhraseKeys[locale.localeCode][phraseKey].args[variable.name] = varValue;
                }
                for (const contentVariable of phrase?.contentVariables ?? []) {
                    localizedPhrases.localizedPhraseKeys[locale.localeCode][phraseKey].contentVariables[contentVariable.name] = "string";
                    localizedPhrases.localizedPhraseKeys[locale.localeCode][phraseKey].args[contentVariable.name] = "string";
                }
                for (const styleClass of phrase?.styleClasses ?? []) {
                    localizedPhrases.localizedPhraseKeys[locale.localeCode][phraseKey].styleClasses[styleClass.name] = "string";
                    localizedPhrases.localizedPhraseKeys[locale.localeCode][phraseKey].args[styleClass.name] = "string";
                }
                // DO INTERPOLATIONS SECOND
                for (const interpolation of phrase?.interpolationVariants ?? []) {
                    localizedPhrases.localizedPhraseKeys[locale.localeCode][phraseKey].interpolations[interpolation.name] = {
                        cases: []
                    };
                    const primaryVariable = getReferencedObject(state, interpolation.variableRef);
                    const interpolationTranslationRef = makeQueryRef("$(text).phraseGroups.id<?>.phrases.id<?>.interpolationVariants.name<?>.localeRules.id<?>", phraseGroup.id, phrase.id, interpolation.name, localeRef);
                    const interpolationTranslation = getReferencedObject(state, interpolationTranslationRef);
                    const fallbackInterpolationTranslationRef = makeQueryRef("$(text).phraseGroups.id<?>.phrases.id<?>.interpolationVariants.name<?>.localeRules.id<?>", phraseGroup.id, phrase.id, interpolation.name, fallbackRef);
                    const fallbackInterpolationTranslation = getReferencedObject(state, fallbackInterpolationTranslationRef);
                    const defaultFallbackInterpolationTranslationRef = makeQueryRef("$(text).phraseGroups.id<?>.phrases.id<?>.interpolationVariants.name<?>.localeRules.id<?>", phraseGroup.id, phrase.id, interpolation.name, localeSettings.defaultLocaleRef);
                    const defaultFallbackInterpolationTranslation = getReferencedObject(state, defaultFallbackInterpolationTranslationRef);
                    const conditionals = interpolationTranslation?.conditionals?.filter?.(c => c.resultant?.plainText?.trim() != "") ?? [];
                    if (conditionals.length == 0 && (interpolationTranslation?.defaultValue?.plainText ?? "").trim() == "") {
                        const fallbackConditionals = fallbackInterpolationTranslation.conditionals?.filter?.((c) => {
                            return c.resultant?.plainText?.trim() != "";
                        }) ?? [];
                        if (fallbackConditionals.length == 0 && (fallbackInterpolationTranslation?.defaultValue?.plainText ?? "").trim() == "") {
                            // use global default
                            const defaultConditionals = defaultFallbackInterpolationTranslation.conditionals?.filter?.((c) => c.resultant?.plainText?.trim() != "") ?? [];
                            const defaultJSON = defaultFallbackInterpolationTranslation?.defaultValue?.json ?? "{}";
                            localizedPhrases.localizedPhraseKeys[locale.localeCode][phraseKey].interpolations[interpolation.name].default = getTextNodes(defaultJSON);
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
                                    };
                                }) ?? [];
                                const resultantJSON = conditional?.resultant?.json ?? "{}";
                                const resultant = getTextNodes(resultantJSON);
                                const conditionalCase = {
                                    variable: primaryVariable.name,
                                    operator: conditional.operator,
                                    value,
                                    subcases,
                                    resultant
                                };
                                localizedPhrases.localizedPhraseKeys[locale.localeCode][phraseKey].interpolations[interpolation.name].cases.push(conditionalCase);
                            }
                        }
                        else {
                            // use fallback
                            const defaultJSON = fallbackInterpolationTranslation?.defaultValue?.json ?? "{}";
                            localizedPhrases.localizedPhraseKeys[locale.localeCode][phraseKey].interpolations[interpolation.name].default = getTextNodes(defaultJSON);
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
                                    };
                                }) ?? [];
                                const resultantJSON = conditional?.resultant?.json ?? "{}";
                                const resultant = getTextNodes(resultantJSON);
                                const conditionalCase = {
                                    variable: primaryVariable.name,
                                    operator: conditional.operator,
                                    value,
                                    subcases,
                                    resultant
                                };
                                localizedPhrases.localizedPhraseKeys[locale.localeCode][phraseKey].interpolations[interpolation.name].cases.push(conditionalCase);
                            }
                        }
                    }
                    else {
                        // use conditionals
                        const defaultJSON = interpolationTranslation?.defaultValue?.json ?? "{}";
                        localizedPhrases.localizedPhraseKeys[locale.localeCode][phraseKey].interpolations[interpolation.name].default = getTextNodes(defaultJSON);
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
                                };
                            }) ?? [];
                            const resultantJSON = conditional?.resultant?.json ?? "{}";
                            const resultant = getTextNodes(resultantJSON);
                            const conditionalCase = {
                                variable: primaryVariable.name,
                                operator: conditional.operator,
                                value,
                                subcases,
                                resultant
                            };
                            localizedPhrases.localizedPhraseKeys[locale.localeCode][phraseKey].interpolations[interpolation.name].cases.push(conditionalCase);
                        }
                    }
                }
                // DO LINKS THIRD
                for (const link of phrase?.linkVariables ?? []) {
                    localizedPhrases.localizedPhraseKeys[locale.localeCode][phraseKey].links[link.linkName] = {};
                    const linkRef = makeQueryRef("$(text).phraseGroups.id<?>.phrases.id<?>.linkVariables.linkName<?>.translations.id<?>", phraseGroup.id, phrase.id, link.linkName, localeRef);
                    const linkTranslation = getReferencedObject(state, linkRef);
                    const fallbackLinkRef = makeQueryRef("$(text).phraseGroups.id<?>.phrases.id<?>.linkVariables.linkName<?>.translations.id<?>", phraseGroup.id, phrase.id, link.linkName, fallbackRef);
                    const fallbackLinkTranslation = getReferencedObject(state, fallbackLinkRef);
                    const defaultLinkRef = makeQueryRef("$(text).phraseGroups.id<?>.phrases.id<?>.linkVariables.linkName<?>.translations.id<?>", phraseGroup.id, phrase.id, link.linkName, localeSettings.defaultLocaleRef);
                    const defaultLink = getReferencedObject(state, defaultLinkRef);
                    if ((linkTranslation?.linkDisplayValue?.plainText ?? "")?.trim() != "") {
                        const displayValueJSON = linkTranslation?.linkDisplayValue?.json ?? '{}';
                        const displayValue = getTextNodes(displayValueJSON);
                        localizedPhrases.localizedPhraseKeys[locale.localeCode][phraseKey].links[link.linkName] = {
                            displayValue,
                            linkName: link.linkName
                        };
                    }
                    else {
                        if ((fallbackLinkTranslation?.linkDisplayValue?.plainText ?? "").trim() != "") {
                            const displayValueJSON = fallbackLinkTranslation?.linkDisplayValue?.json ?? '{}';
                            const displayValue = getTextNodes(displayValueJSON);
                            localizedPhrases.localizedPhraseKeys[locale.localeCode][phraseKey].links[link.linkName] = {
                                displayValue,
                                linkName: link.linkName
                            };
                        }
                        else {
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
                        localizedPhrases.localizedPhraseKeys[locale.localeCode][phraseKey].links[link.linkName].href = hrefValue;
                    }
                    else {
                        if ((fallbackLinkTranslation?.linkHrefValue?.plainText ?? "").trim() != "") {
                            const hrefJSON = fallbackLinkTranslation?.linkHrefValue?.json ?? '{}';
                            const hrefValue = getPlainTextNodes(hrefJSON);
                            localizedPhrases.localizedPhraseKeys[locale.localeCode][phraseKey].links[link.linkName].href = hrefValue;
                        }
                        else {
                            const hrefJSON = defaultLink?.linkHrefValue?.json ?? '{}';
                            const hrefValue = getPlainTextNodes(hrefJSON);
                            localizedPhrases.localizedPhraseKeys[locale.localeCode][phraseKey].links[link.linkName].href = hrefValue;
                        }
                    }
                }
                // do styled content here
                for (const styledContent of phrase.styledContents) {
                    const styleClass = getReferencedObject(state, styledContent.styleClassRef);
                    localizedPhrases.localizedPhraseKeys[locale.localeCode][phraseKey].styledContents[styledContent.name] = {};
                    const styledContentLocaleRuleRef = makeQueryRef("$(text).phraseGroups.id<?>.phrases.id<?>.styledContents.name<?>.localeRules.id<?>", phraseGroup.id, phrase.id, styledContent.name, localeRef);
                    const styledContentLocaleRule = getReferencedObject(state, styledContentLocaleRuleRef);
                    const fallbackStyledContentLocaleRuleRef = makeQueryRef("$(text).phraseGroups.id<?>.phrases.id<?>.styledContents.name<?>.localeRules.id<?>", phraseGroup.id, phrase.id, styledContent.name, fallbackRef);
                    const fallbackStyledContentLocaleRule = getReferencedObject(state, fallbackStyledContentLocaleRuleRef);
                    const defaultStyledContentLocaleRuleRef = makeQueryRef("$(text).phraseGroups.id<?>.phrases.id<?>.styledContents.name<?>.localeRules.id<?>", phraseGroup.id, phrase.id, styledContent.name, localeSettings.defaultLocaleRef);
                    const defaultStyledContentLocaleRule = getReferencedObject(state, defaultStyledContentLocaleRuleRef);
                    if ((styledContentLocaleRule?.displayValue?.plainText ?? "")?.trim() != "") {
                        const displayValueJSON = styledContentLocaleRule?.displayValue?.json ?? "{}";
                        const displayValue = getTextNodes(displayValueJSON);
                        localizedPhrases.localizedPhraseKeys[locale.localeCode][phraseKey].styledContents[styledContent.name] = {
                            displayValue,
                            styleClass: styleClass.name,
                        };
                    }
                    else {
                        if ((fallbackStyledContentLocaleRule?.displayValue?.plainText ?? "").trim() != "") {
                            const displayValueJSON = fallbackStyledContentLocaleRule?.displayValue?.json ?? "{}";
                            const displayValue = getTextNodes(displayValueJSON);
                            localizedPhrases.localizedPhraseKeys[locale.localeCode][phraseKey].styledContents[styledContent.name] = {
                                displayValue,
                                styleClass: styleClass.name,
                            };
                        }
                        else {
                            const displayValueJSON = defaultStyledContentLocaleRule?.displayValue?.json ?? "{}";
                            const displayValue = getTextNodes(displayValueJSON);
                            localizedPhrases.localizedPhraseKeys[locale.localeCode][phraseKey].styledContents[styledContent.name] = {
                                displayValue,
                                styleClass: styleClass.name,
                            };
                        }
                    }
                }
                if (phrase.usePhraseSections) {
                    const newLine = {
                        content: "\n",
                        type: "text",
                        children: [],
                        styles: {
                            isBold: false,
                            isItalic: false,
                            isUnderlined: false,
                            isStrikethrough: false,
                            isSuperscript: false,
                            isSubscript: false,
                        },
                    };
                    const nodeLists = [];
                    for (const [index, phraseSection] of phrase.phraseSections.entries()) {
                        const isLast = index == phrase.phraseSections.length - 1;
                        const phraseSectionLocaleRuleRef = makeQueryRef("$(text).phraseGroups.id<?>.phrases.id<?>.phraseSections.name<?>.localeRules.id<?>", phraseGroup.id, phrase.id, phraseSection.name, localeRef);
                        const phraseSectionLocaleRule = getReferencedObject(state, phraseSectionLocaleRuleRef);
                        const fallbackPhraseSectionLocaleRuleRef = makeQueryRef("$(text).phraseGroups.id<?>.phrases.id<?>.phraseSections.name<?>.localeRules.id<?>", phraseGroup.id, phrase.id, phraseSection.name, fallbackRef);
                        const fallbackPhraseSectionLocaleRule = getReferencedObject(state, fallbackPhraseSectionLocaleRuleRef);
                        const defaultPhraseSectionLocaleRuleRef = makeQueryRef("$(text).phraseGroups.id<?>.phrases.id<?>.phraseSections.name<?>.localeRules.id<?>", phraseGroup.id, phrase.id, phraseSection.name, localeSettings.defaultLocaleRef);
                        const defaultPhraseSectionLocaleRule = getReferencedObject(state, defaultPhraseSectionLocaleRuleRef);
                        if ((phraseSectionLocaleRule?.displayValue?.plainText ?? "").trim() != "") {
                            const phraseJSON = phraseSectionLocaleRule?.displayValue?.json ?? '{}';
                            nodeLists.push(...getTextNodes(phraseJSON));
                        }
                        else {
                            if ((fallbackPhraseSectionLocaleRule?.displayValue?.plainText ?? "").trim() != "") {
                                const phraseJSON = fallbackPhraseSectionLocaleRule?.displayValue?.json ?? '{}';
                                nodeLists.push(...getTextNodes(phraseJSON));
                            }
                            else {
                                const phraseJSON = defaultPhraseSectionLocaleRule?.displayValue?.json ?? '{}';
                                nodeLists.push(...getTextNodes(phraseJSON));
                            }
                        }
                        if (!isLast) {
                            nodeLists.push(newLine);
                        }
                    }
                    localizedPhrases.localizedPhraseKeys[locale.localeCode][phraseKey].phrase = nodeLists;
                }
                else {
                    const phraseTranslationRef = makeQueryRef("$(text).phraseGroups.id<?>.phrases.id<?>.phraseTranslations.id<?>", phraseGroup.id, phrase.id, localeRef);
                    const phraseTranslation = getReferencedObject(state, phraseTranslationRef);
                    const fallbackPhraseTranslationRef = makeQueryRef("$(text).phraseGroups.id<?>.phrases.id<?>.phraseTranslations.id<?>", phraseGroup.id, phrase.id, fallbackRef);
                    const fallbackPhraseTranslation = getReferencedObject(state, fallbackPhraseTranslationRef);
                    const defaultPhraseTranslationRef = makeQueryRef("$(text).phraseGroups.id<?>.phrases.id<?>.phraseTranslations.id<?>", phraseGroup.id, phrase.id, localeSettings.defaultLocaleRef);
                    const defaultPhraseTranslation = getReferencedObject(state, defaultPhraseTranslationRef);
                    if ((phraseTranslation?.plainText ?? "").trim() != "") {
                        const phraseJSON = phraseTranslation?.json ?? '{}';
                        localizedPhrases.localizedPhraseKeys[locale.localeCode][phraseKey].phrase = getTextNodes(phraseJSON);
                    }
                    else {
                        if ((fallbackPhraseTranslation?.plainText ?? "").trim() != "") {
                            const phraseJSON = fallbackPhraseTranslation?.json ?? '{}';
                            localizedPhrases.localizedPhraseKeys[locale.localeCode][phraseKey].phrase = getTextNodes(phraseJSON);
                        }
                        else {
                            const phraseJSON = defaultPhraseTranslation?.json ?? '{}';
                            localizedPhrases.localizedPhraseKeys[locale.localeCode][phraseKey].phrase = getTextNodes(phraseJSON);
                        }
                    }
                }
            }
        }
    }
    return localizedPhrases;
}
export async function generate(state, outDir, args = { lang: "typescript" }) {
    let noLinks = true;
    let noInterpolations = true;
    let noStyledContents = true;
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
                            { const: "content-variable" },
                            { const: "styled-content" },
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
            StyledContent: {
                type: "object",
                properties: {
                    name: {
                        type: ["string"],
                    },
                    styleClass: {
                        type: ["string"],
                    },
                    displayValue: {
                        type: "array",
                        items: {
                            $ref: "#/definitions/TextNode",
                        },
                    },
                },
                required: ["name", "styleClass", "displayValue"],
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
                required: [],
                additionalProperties: false,
            },
            PhraseKeys: {
                type: "object",
                properties: {},
                required: [],
                additionalProperties: false,
            },
            PhraseKeyDebugInfo: {
                type: "object",
                properties: {},
                required: [],
                additionalProperties: false,
            },
            LocalizedPhraseKeys: {
                type: "object",
                properties: {},
                required: [],
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
    const localeSettings = getReferencedObject(state, "$(text).localeSettings");
    const phraseGroups = getReferencedObject(state, "$(text).phraseGroups");
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
        };
        SCHEMA.definitions.LocalizedPhraseKeys.required.push(locale.localeCode);
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
                required: [
                    "phraseKey",
                    "variables",
                    "links",
                    "interpolations",
                    "phrase",
                    "contentVariables",
                    "styleClasses",
                    "styledContents",
                    "args",
                ],
                properties: {
                    phraseKey: {
                        type: ["string"],
                    },
                    phrase: {
                        type: "array",
                        items: {
                            $ref: "#/definitions/TextNode",
                        },
                    },
                    args: {
                        type: "object",
                        properties: {},
                        required: [],
                        additionalProperties: false,
                    },
                    variables: {
                        type: "object",
                        properties: {},
                        required: [],
                        additionalProperties: false,
                    },
                    contentVariables: {
                        type: "object",
                        properties: {},
                        required: [],
                        additionalProperties: false,
                    },
                    styleClasses: {
                        type: "object",
                        properties: {},
                        required: [],
                        additionalProperties: false,
                    },
                    styledContents: {
                        type: "object",
                        properties: {},
                        required: [],
                        additionalProperties: false,
                    },
                    links: {
                        type: "object",
                        properties: {},
                        required: [],
                        additionalProperties: false,
                    },
                    interpolations: {
                        type: "object",
                        properties: {},
                        required: [],
                        additionalProperties: false,
                    },
                },
            };
            for (const variable of phrase?.variables ?? []) {
                const varType = variable.varType == "string"
                    ? "string"
                    : variable.varType == "boolean"
                        ? "boolean"
                        : "number";
                SCHEMA.definitions.PhraseKeys.properties[phraseKey].properties.variables.properties[variable.name] = {
                    type: [varType],
                };
                SCHEMA.definitions.PhraseKeys.properties[phraseKey].properties.variables.required.push(variable.name);
                SCHEMA.definitions.PhraseKeys.properties[phraseKey].properties.args.properties[variable.name] = {
                    type: [varType],
                };
                SCHEMA.definitions.PhraseKeys.properties[phraseKey].properties.args.required.push(variable.name);
            }
            for (const contentVariable of phrase?.contentVariables ?? []) {
                SCHEMA.definitions.PhraseKeys.properties[phraseKey].properties.contentVariables.properties[contentVariable.name] = {
                    type: ["string"],
                };
                SCHEMA.definitions.PhraseKeys.properties[phraseKey].properties.contentVariables.required.push(contentVariable.name);
                SCHEMA.definitions.PhraseKeys.properties[phraseKey].properties.args.properties[contentVariable.name] = {
                    type: ["string"],
                };
                SCHEMA.definitions.PhraseKeys.properties[phraseKey].properties.args.required.push(contentVariable.name);
            }
            for (const styleClass of phrase?.styleClasses ?? []) {
                SCHEMA.definitions.PhraseKeys.properties[phraseKey].properties.styleClasses.properties[styleClass.name] = {
                    type: ["string"],
                };
                SCHEMA.definitions.PhraseKeys.properties[phraseKey].properties.styleClasses.required.push(styleClass.name);
                SCHEMA.definitions.PhraseKeys.properties[phraseKey].properties.args.properties[styleClass.name] = {
                    type: ["string"],
                };
                SCHEMA.definitions.PhraseKeys.properties[phraseKey].properties.args.required.push(styleClass.name);
            }
            for (const interpolation of phrase?.interpolationVariants ?? []) {
                noInterpolations = false;
                SCHEMA.definitions.PhraseKeys.properties[phraseKey].properties.interpolations.properties[interpolation.name] = {
                    $ref: "#/definitions/Interpolation",
                };
                SCHEMA.definitions.PhraseKeys.properties[phraseKey].properties.interpolations.required.push(interpolation.name);
            }
            for (const styledContent of phrase?.styledContents ?? []) {
                noStyledContents = false;
                SCHEMA.definitions.PhraseKeys.properties[phraseKey].properties.styledContents.properties[styledContent.name] = {
                    $ref: "#/definitions/StyledContent",
                };
                SCHEMA.definitions.PhraseKeys.properties[phraseKey].properties.styledContents.required.push(styledContent.name);
            }
            for (const linkVariables of phrase?.linkVariables ?? []) {
                noLinks = false;
                SCHEMA.definitions.PhraseKeys.properties[phraseKey].properties.links.properties[linkVariables.linkName] = {
                    $ref: "#/definitions/Link",
                };
                SCHEMA.definitions.PhraseKeys.properties[phraseKey].properties.links.required.push(linkVariables.linkName);
            }
        }
    }
    const inputData = new InputData();
    const source = { name: "LocalizedPhrases", schema: JSON.stringify(SCHEMA) };
    await inputData.addSource("schema", source, () => new JSONSchemaInput(undefined));
    if (args.lang == 'typescript') {
        const lang = new TypeScriptTargetLanguage();
        const runtimeTypecheck = lang.optionDefinitions.find(option => option.name == 'runtime-typecheck');
        if (runtimeTypecheck) {
            runtimeTypecheck.defaultValue = false;
        }
        const { lines } = await quicktype({ lang, inputData });
        const code = lines.join("\n");
        const tsFile = path.join(outDir, 'index.ts');
        let tsCode = `import textJSON from './text.json';\n\n`;
        tsCode += code + '\n';
        tsCode += CODE + '\n\n';
        tsCode += `export default textJSON as unknown as LocalizedPhrases;`;
        if (noLinks) {
            tsCode += '\n\n' + `
interface PlainTextNode {
  content: string;
  type: "text" | "variable";
}
`.trim();
        }
        if (noStyledContents) {
            tsCode += '\n\n' + `
interface StyledContent {
  name: string;
  styleClass: string;
  displayValue: TextNode[];
}
`.trim();
        }
        if (noInterpolations) {
            tsCode += '\n\n' + `
interface Interpolation {
  cases: Array<{
    resultant: TextNode[];
    variable: string;
    value: string | number | boolean;
    operator: string;
    subcases: Array<{
      value: string | number | boolean;
    }>;
  }>;
  default: [];
}
`.trim();
        }
        await fs.promises.writeFile(tsFile, tsCode, 'utf-8');
        const textJson = await getJSON(state);
        const jsonFile = path.join(outDir, 'text.json');
        await fs.promises.writeFile(jsonFile, JSON.stringify(textJson, null, 2), 'utf-8');
    }
}
//# sourceMappingURL=index.js.map