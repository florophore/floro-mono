"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.generate = exports.getJSON = exports.getFloroGenerator = exports.filename = void 0;
const floro_generator_schema_api_1 = require("./floro-generator-schema-api");
const floro_generator_json_1 = __importDefault(require("../floro/floro.generator.json"));
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs"));
const quicktype_core_1 = require("quicktype-core");
function filename() {
    return __filename;
}
exports.filename = filename;
function getFloroGenerator() {
    return floro_generator_json_1.default;
}
exports.getFloroGenerator = getFloroGenerator;
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
        var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k, _l, _m;
        const children = processNodes(node.children);
        return {
            children,
            content: node.content,
            type: getNodeType(node.type),
            styles: {
                isBold: (_b = (_a = node === null || node === void 0 ? void 0 : node.marks) === null || _a === void 0 ? void 0 : _a.isBold) !== null && _b !== void 0 ? _b : false,
                isItalic: (_d = (_c = node === null || node === void 0 ? void 0 : node.marks) === null || _c === void 0 ? void 0 : _c.isItalic) !== null && _d !== void 0 ? _d : false,
                isUnderlined: (_f = (_e = node === null || node === void 0 ? void 0 : node.marks) === null || _e === void 0 ? void 0 : _e.isUnderlined) !== null && _f !== void 0 ? _f : false,
                isStrikethrough: (_h = (_g = node === null || node === void 0 ? void 0 : node.marks) === null || _g === void 0 ? void 0 : _g.isStrikethrough) !== null && _h !== void 0 ? _h : false,
                isSuperscript: (_k = (_j = node === null || node === void 0 ? void 0 : node.marks) === null || _j === void 0 ? void 0 : _j.isSuperscript) !== null && _k !== void 0 ? _k : false,
                isSubscript: (_m = (_l = node === null || node === void 0 ? void 0 : node.marks) === null || _l === void 0 ? void 0 : _l.isSubscript) !== null && _m !== void 0 ? _m : false,
            },
        };
    });
};
const getTextNodes = (jsonString) => {
    var _a;
    const root = JSON.parse(jsonString);
    return processNodes((_a = root === null || root === void 0 ? void 0 : root.children) !== null && _a !== void 0 ? _a : []);
};
const getPlainTextNodes = (jsonString) => {
    var _a, _b;
    const root = JSON.parse(jsonString);
    return (_b = (_a = root === null || root === void 0 ? void 0 : root.children) === null || _a === void 0 ? void 0 : _a.map((child) => {
        const type = getPlainNodeType(child.type);
        return {
            type,
            content: child.content
        };
    })) !== null && _b !== void 0 ? _b : [];
};
function getJSON(state) {
    var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k, _l, _m, _o, _p, _q, _r, _s, _t, _u, _v, _w, _x, _y, _z, _0, _1, _2, _3, _4, _5, _6, _7, _8, _9, _10, _11, _12, _13, _14, _15, _16, _17, _18, _19, _20, _21, _22, _23, _24, _25, _26, _27, _28, _29, _30, _31, _32, _33, _34, _35, _36, _37, _38, _39, _40, _41, _42, _43, _44, _45, _46, _47, _48, _49, _50, _51, _52, _53, _54, _55, _56, _57, _58, _59, _60, _61, _62;
    return __awaiter(this, void 0, void 0, function* () {
        const localizedPhrases = {
            locales: {},
            localizedPhraseKeys: {},
            phraseKeyDebugInfo: {}
        };
        const localeSettings = (0, floro_generator_schema_api_1.getReferencedObject)(state, "$(text).localeSettings");
        const phraseGroups = (0, floro_generator_schema_api_1.getReferencedObject)(state, "$(text).phraseGroups");
        const defaultLocale = (0, floro_generator_schema_api_1.getReferencedObject)(state, localeSettings.defaultLocaleRef);
        const defaultLocaleCode = defaultLocale === null || defaultLocale === void 0 ? void 0 : defaultLocale.localeCode;
        for (const locale of localeSettings.locales) {
            const localeRef = (0, floro_generator_schema_api_1.makeQueryRef)("$(text).localeSettings.locales.localeCode<?>", locale.localeCode);
            const defaultFallbackCode = (locale === null || locale === void 0 ? void 0 : locale.defaultFallbackLocaleRef)
                ? locale === null || locale === void 0 ? void 0 : locale.defaultFallbackLocaleRef
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
                ? (0, floro_generator_schema_api_1.makeQueryRef)("$(text).localeSettings.locales.localeCode<?>", defaultFallbackCode)
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
                    for (const variable of (_a = phrase === null || phrase === void 0 ? void 0 : phrase.variables) !== null && _a !== void 0 ? _a : []) {
                        const varValue = variable.varType == "string"
                            ? ""
                            : variable.varType == "boolean"
                                ? false
                                : 0;
                        localizedPhrases.localizedPhraseKeys[locale.localeCode][phraseKey].variables[variable.name] = varValue;
                        localizedPhrases.localizedPhraseKeys[locale.localeCode][phraseKey].args[variable.name] = varValue;
                    }
                    for (const contentVariable of (_b = phrase === null || phrase === void 0 ? void 0 : phrase.contentVariables) !== null && _b !== void 0 ? _b : []) {
                        localizedPhrases.localizedPhraseKeys[locale.localeCode][phraseKey].contentVariables[contentVariable.name] = "string";
                        localizedPhrases.localizedPhraseKeys[locale.localeCode][phraseKey].args[contentVariable.name] = "string";
                    }
                    for (const styleClass of (_c = phrase === null || phrase === void 0 ? void 0 : phrase.styleClasses) !== null && _c !== void 0 ? _c : []) {
                        localizedPhrases.localizedPhraseKeys[locale.localeCode][phraseKey].styleClasses[styleClass.name] = "string";
                        localizedPhrases.localizedPhraseKeys[locale.localeCode][phraseKey].args[styleClass.name] = "string";
                    }
                    // DO INTERPOLATIONS SECOND
                    for (const interpolation of (_d = phrase === null || phrase === void 0 ? void 0 : phrase.interpolationVariants) !== null && _d !== void 0 ? _d : []) {
                        localizedPhrases.localizedPhraseKeys[locale.localeCode][phraseKey].interpolations[interpolation.name] = {
                            cases: []
                        };
                        const primaryVariable = (0, floro_generator_schema_api_1.getReferencedObject)(state, interpolation.variableRef);
                        const interpolationTranslationRef = (0, floro_generator_schema_api_1.makeQueryRef)("$(text).phraseGroups.id<?>.phrases.id<?>.interpolationVariants.name<?>.localeRules.id<?>", phraseGroup.id, phrase.id, interpolation.name, localeRef);
                        const interpolationTranslation = (0, floro_generator_schema_api_1.getReferencedObject)(state, interpolationTranslationRef);
                        const fallbackInterpolationTranslationRef = (0, floro_generator_schema_api_1.makeQueryRef)("$(text).phraseGroups.id<?>.phrases.id<?>.interpolationVariants.name<?>.localeRules.id<?>", phraseGroup.id, phrase.id, interpolation.name, fallbackRef);
                        const fallbackInterpolationTranslation = (0, floro_generator_schema_api_1.getReferencedObject)(state, fallbackInterpolationTranslationRef);
                        const defaultFallbackInterpolationTranslationRef = (0, floro_generator_schema_api_1.makeQueryRef)("$(text).phraseGroups.id<?>.phrases.id<?>.interpolationVariants.name<?>.localeRules.id<?>", phraseGroup.id, phrase.id, interpolation.name, localeSettings.defaultLocaleRef);
                        const defaultFallbackInterpolationTranslation = (0, floro_generator_schema_api_1.getReferencedObject)(state, defaultFallbackInterpolationTranslationRef);
                        const conditionals = (_g = (_f = (_e = interpolationTranslation === null || interpolationTranslation === void 0 ? void 0 : interpolationTranslation.conditionals) === null || _e === void 0 ? void 0 : _e.filter) === null || _f === void 0 ? void 0 : _f.call(_e, c => { var _a, _b; return ((_b = (_a = c.resultant) === null || _a === void 0 ? void 0 : _a.plainText) === null || _b === void 0 ? void 0 : _b.trim()) != ""; })) !== null && _g !== void 0 ? _g : [];
                        if (conditionals.length == 0 && ((_j = (_h = interpolationTranslation === null || interpolationTranslation === void 0 ? void 0 : interpolationTranslation.defaultValue) === null || _h === void 0 ? void 0 : _h.plainText) !== null && _j !== void 0 ? _j : "").trim() == "") {
                            const fallbackConditionals = (_m = (_l = (_k = fallbackInterpolationTranslation.conditionals) === null || _k === void 0 ? void 0 : _k.filter) === null || _l === void 0 ? void 0 : _l.call(_k, (c) => {
                                var _a, _b;
                                return ((_b = (_a = c.resultant) === null || _a === void 0 ? void 0 : _a.plainText) === null || _b === void 0 ? void 0 : _b.trim()) != "";
                            })) !== null && _m !== void 0 ? _m : [];
                            if (fallbackConditionals.length == 0 && ((_p = (_o = fallbackInterpolationTranslation === null || fallbackInterpolationTranslation === void 0 ? void 0 : fallbackInterpolationTranslation.defaultValue) === null || _o === void 0 ? void 0 : _o.plainText) !== null && _p !== void 0 ? _p : "").trim() == "") {
                                // use global default
                                const defaultConditionals = (_s = (_r = (_q = defaultFallbackInterpolationTranslation.conditionals) === null || _q === void 0 ? void 0 : _q.filter) === null || _r === void 0 ? void 0 : _r.call(_q, (c) => { var _a, _b; return ((_b = (_a = c.resultant) === null || _a === void 0 ? void 0 : _a.plainText) === null || _b === void 0 ? void 0 : _b.trim()) != ""; })) !== null && _s !== void 0 ? _s : [];
                                const defaultJSON = (_u = (_t = defaultFallbackInterpolationTranslation === null || defaultFallbackInterpolationTranslation === void 0 ? void 0 : defaultFallbackInterpolationTranslation.defaultValue) === null || _t === void 0 ? void 0 : _t.json) !== null && _u !== void 0 ? _u : "{}";
                                localizedPhrases.localizedPhraseKeys[locale.localeCode][phraseKey].interpolations[interpolation.name].default = getTextNodes(defaultJSON);
                                for (const conditional of defaultConditionals) {
                                    const value = (primaryVariable === null || primaryVariable === void 0 ? void 0 : primaryVariable.varType) == "string" ?
                                        conditional === null || conditional === void 0 ? void 0 : conditional.stringComparatorValue :
                                        (primaryVariable === null || primaryVariable === void 0 ? void 0 : primaryVariable.varType) == "boolean" ?
                                            conditional === null || conditional === void 0 ? void 0 : conditional.booleanComparatorValue :
                                            (primaryVariable === null || primaryVariable === void 0 ? void 0 : primaryVariable.varType) == "integer" ?
                                                conditional === null || conditional === void 0 ? void 0 : conditional.intComparatorValue :
                                                (conditional === null || conditional === void 0 ? void 0 : conditional.operator) == "is_fractional" ?
                                                    undefined :
                                                    conditional === null || conditional === void 0 ? void 0 : conditional.floatComparatorValue;
                                    const subcases = (_x = (_w = (_v = conditional === null || conditional === void 0 ? void 0 : conditional.subconditions) === null || _v === void 0 ? void 0 : _v.map) === null || _w === void 0 ? void 0 : _w.call(_v, subcondition => {
                                        const subVar = (0, floro_generator_schema_api_1.getReferencedObject)(state, subcondition.variableRef);
                                        const value = (subVar === null || subVar === void 0 ? void 0 : subVar.varType) == "string" ?
                                            subcondition === null || subcondition === void 0 ? void 0 : subcondition.stringComparatorValue :
                                            (subVar === null || subVar === void 0 ? void 0 : subVar.varType) == "boolean" ?
                                                subcondition === null || subcondition === void 0 ? void 0 : subcondition.booleanComparatorValue :
                                                (subVar === null || subVar === void 0 ? void 0 : subVar.varType) == "integer" ?
                                                    subcondition === null || subcondition === void 0 ? void 0 : subcondition.intComparatorValue :
                                                    (subcondition === null || subcondition === void 0 ? void 0 : subcondition.operator) == "is_fractional" ?
                                                        undefined :
                                                        subcondition === null || subcondition === void 0 ? void 0 : subcondition.floatComparatorValue;
                                        return {
                                            value,
                                            variable: subVar.name,
                                            operator: subcondition.operator,
                                            conjunction: subcondition.conjunction
                                        };
                                    })) !== null && _x !== void 0 ? _x : [];
                                    const resultantJSON = (_z = (_y = conditional === null || conditional === void 0 ? void 0 : conditional.resultant) === null || _y === void 0 ? void 0 : _y.json) !== null && _z !== void 0 ? _z : "{}";
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
                                const defaultJSON = (_1 = (_0 = fallbackInterpolationTranslation === null || fallbackInterpolationTranslation === void 0 ? void 0 : fallbackInterpolationTranslation.defaultValue) === null || _0 === void 0 ? void 0 : _0.json) !== null && _1 !== void 0 ? _1 : "{}";
                                localizedPhrases.localizedPhraseKeys[locale.localeCode][phraseKey].interpolations[interpolation.name].default = getTextNodes(defaultJSON);
                                for (const conditional of fallbackConditionals) {
                                    const value = (primaryVariable === null || primaryVariable === void 0 ? void 0 : primaryVariable.varType) == "string" ?
                                        conditional === null || conditional === void 0 ? void 0 : conditional.stringComparatorValue :
                                        (primaryVariable === null || primaryVariable === void 0 ? void 0 : primaryVariable.varType) == "boolean" ?
                                            conditional === null || conditional === void 0 ? void 0 : conditional.booleanComparatorValue :
                                            (primaryVariable === null || primaryVariable === void 0 ? void 0 : primaryVariable.varType) == "integer" ?
                                                conditional === null || conditional === void 0 ? void 0 : conditional.intComparatorValue :
                                                (conditional === null || conditional === void 0 ? void 0 : conditional.operator) == "is_fractional" ?
                                                    undefined :
                                                    conditional === null || conditional === void 0 ? void 0 : conditional.floatComparatorValue;
                                    const subcases = (_4 = (_3 = conditional === null || conditional === void 0 ? void 0 : (_2 = conditional.subconditions).map) === null || _3 === void 0 ? void 0 : _3.call(_2, subcondition => {
                                        const subVar = (0, floro_generator_schema_api_1.getReferencedObject)(state, subcondition.variableRef);
                                        const value = (subVar === null || subVar === void 0 ? void 0 : subVar.varType) == "string" ?
                                            subcondition === null || subcondition === void 0 ? void 0 : subcondition.stringComparatorValue :
                                            (subVar === null || subVar === void 0 ? void 0 : subVar.varType) == "boolean" ?
                                                subcondition === null || subcondition === void 0 ? void 0 : subcondition.booleanComparatorValue :
                                                (subVar === null || subVar === void 0 ? void 0 : subVar.varType) == "integer" ?
                                                    subcondition === null || subcondition === void 0 ? void 0 : subcondition.intComparatorValue :
                                                    (subcondition === null || subcondition === void 0 ? void 0 : subcondition.operator) == "is_fractional" ?
                                                        undefined :
                                                        subcondition === null || subcondition === void 0 ? void 0 : subcondition.floatComparatorValue;
                                        return {
                                            value,
                                            variable: subVar.name,
                                            operator: subcondition.operator,
                                            conjunction: subcondition.conjunction
                                        };
                                    })) !== null && _4 !== void 0 ? _4 : [];
                                    const resultantJSON = (_6 = (_5 = conditional === null || conditional === void 0 ? void 0 : conditional.resultant) === null || _5 === void 0 ? void 0 : _5.json) !== null && _6 !== void 0 ? _6 : "{}";
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
                            const defaultJSON = (_8 = (_7 = interpolationTranslation === null || interpolationTranslation === void 0 ? void 0 : interpolationTranslation.defaultValue) === null || _7 === void 0 ? void 0 : _7.json) !== null && _8 !== void 0 ? _8 : "{}";
                            localizedPhrases.localizedPhraseKeys[locale.localeCode][phraseKey].interpolations[interpolation.name].default = getTextNodes(defaultJSON);
                            for (const conditional of conditionals) {
                                const value = (primaryVariable === null || primaryVariable === void 0 ? void 0 : primaryVariable.varType) == "string" ?
                                    conditional === null || conditional === void 0 ? void 0 : conditional.stringComparatorValue :
                                    (primaryVariable === null || primaryVariable === void 0 ? void 0 : primaryVariable.varType) == "boolean" ?
                                        conditional === null || conditional === void 0 ? void 0 : conditional.booleanComparatorValue :
                                        (primaryVariable === null || primaryVariable === void 0 ? void 0 : primaryVariable.varType) == "integer" ?
                                            conditional === null || conditional === void 0 ? void 0 : conditional.intComparatorValue :
                                            (conditional === null || conditional === void 0 ? void 0 : conditional.operator) == "is_fractional" ?
                                                undefined :
                                                conditional === null || conditional === void 0 ? void 0 : conditional.floatComparatorValue;
                                const subcases = (_11 = (_10 = (_9 = conditional === null || conditional === void 0 ? void 0 : conditional.subconditions) === null || _9 === void 0 ? void 0 : _9.map) === null || _10 === void 0 ? void 0 : _10.call(_9, subcondition => {
                                    const subVar = (0, floro_generator_schema_api_1.getReferencedObject)(state, subcondition.variableRef);
                                    const value = (subVar === null || subVar === void 0 ? void 0 : subVar.varType) == "string" ?
                                        subcondition === null || subcondition === void 0 ? void 0 : subcondition.stringComparatorValue :
                                        (subVar === null || subVar === void 0 ? void 0 : subVar.varType) == "boolean" ?
                                            subcondition === null || subcondition === void 0 ? void 0 : subcondition.booleanComparatorValue :
                                            (subVar === null || subVar === void 0 ? void 0 : subVar.varType) == "integer" ?
                                                subcondition === null || subcondition === void 0 ? void 0 : subcondition.intComparatorValue :
                                                (subcondition === null || subcondition === void 0 ? void 0 : subcondition.operator) == "is_fractional" ?
                                                    undefined :
                                                    subcondition === null || subcondition === void 0 ? void 0 : subcondition.floatComparatorValue;
                                    return {
                                        value,
                                        variable: subVar.name,
                                        operator: subcondition.operator,
                                        conjunction: subcondition.conjunction
                                    };
                                })) !== null && _11 !== void 0 ? _11 : [];
                                const resultantJSON = (_13 = (_12 = conditional === null || conditional === void 0 ? void 0 : conditional.resultant) === null || _12 === void 0 ? void 0 : _12.json) !== null && _13 !== void 0 ? _13 : "{}";
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
                    for (const link of (_14 = phrase === null || phrase === void 0 ? void 0 : phrase.linkVariables) !== null && _14 !== void 0 ? _14 : []) {
                        localizedPhrases.localizedPhraseKeys[locale.localeCode][phraseKey].links[link.linkName] = {};
                        const linkRef = (0, floro_generator_schema_api_1.makeQueryRef)("$(text).phraseGroups.id<?>.phrases.id<?>.linkVariables.linkName<?>.translations.id<?>", phraseGroup.id, phrase.id, link.linkName, localeRef);
                        const linkTranslation = (0, floro_generator_schema_api_1.getReferencedObject)(state, linkRef);
                        const fallbackLinkRef = (0, floro_generator_schema_api_1.makeQueryRef)("$(text).phraseGroups.id<?>.phrases.id<?>.linkVariables.linkName<?>.translations.id<?>", phraseGroup.id, phrase.id, link.linkName, fallbackRef);
                        const fallbackLinkTranslation = (0, floro_generator_schema_api_1.getReferencedObject)(state, fallbackLinkRef);
                        const defaultLinkRef = (0, floro_generator_schema_api_1.makeQueryRef)("$(text).phraseGroups.id<?>.phrases.id<?>.linkVariables.linkName<?>.translations.id<?>", phraseGroup.id, phrase.id, link.linkName, localeSettings.defaultLocaleRef);
                        const defaultLink = (0, floro_generator_schema_api_1.getReferencedObject)(state, defaultLinkRef);
                        if (((_17 = ((_16 = (_15 = linkTranslation === null || linkTranslation === void 0 ? void 0 : linkTranslation.linkDisplayValue) === null || _15 === void 0 ? void 0 : _15.plainText) !== null && _16 !== void 0 ? _16 : "")) === null || _17 === void 0 ? void 0 : _17.trim()) != "") {
                            const displayValueJSON = (_19 = (_18 = linkTranslation === null || linkTranslation === void 0 ? void 0 : linkTranslation.linkDisplayValue) === null || _18 === void 0 ? void 0 : _18.json) !== null && _19 !== void 0 ? _19 : '{}';
                            const displayValue = getTextNodes(displayValueJSON);
                            localizedPhrases.localizedPhraseKeys[locale.localeCode][phraseKey].links[link.linkName] = {
                                displayValue,
                                linkName: link.linkName
                            };
                        }
                        else {
                            if (((_21 = (_20 = fallbackLinkTranslation === null || fallbackLinkTranslation === void 0 ? void 0 : fallbackLinkTranslation.linkDisplayValue) === null || _20 === void 0 ? void 0 : _20.plainText) !== null && _21 !== void 0 ? _21 : "").trim() != "") {
                                const displayValueJSON = (_23 = (_22 = fallbackLinkTranslation === null || fallbackLinkTranslation === void 0 ? void 0 : fallbackLinkTranslation.linkDisplayValue) === null || _22 === void 0 ? void 0 : _22.json) !== null && _23 !== void 0 ? _23 : '{}';
                                const displayValue = getTextNodes(displayValueJSON);
                                localizedPhrases.localizedPhraseKeys[locale.localeCode][phraseKey].links[link.linkName] = {
                                    displayValue,
                                    linkName: link.linkName
                                };
                            }
                            else {
                                const displayValueJSON = (_25 = (_24 = defaultLink === null || defaultLink === void 0 ? void 0 : defaultLink.linkDisplayValue) === null || _24 === void 0 ? void 0 : _24.json) !== null && _25 !== void 0 ? _25 : '{}';
                                const displayValue = getTextNodes(displayValueJSON);
                                localizedPhrases.localizedPhraseKeys[locale.localeCode][phraseKey].links[link.linkName] = {
                                    displayValue,
                                    linkName: link.linkName
                                };
                            }
                        }
                        if (((_28 = ((_27 = (_26 = linkTranslation === null || linkTranslation === void 0 ? void 0 : linkTranslation.linkHrefValue) === null || _26 === void 0 ? void 0 : _26.plainText) !== null && _27 !== void 0 ? _27 : "")) === null || _28 === void 0 ? void 0 : _28.trim()) != "") {
                            const hrefJSON = (_30 = (_29 = linkTranslation === null || linkTranslation === void 0 ? void 0 : linkTranslation.linkHrefValue) === null || _29 === void 0 ? void 0 : _29.json) !== null && _30 !== void 0 ? _30 : '{}';
                            const hrefValue = getPlainTextNodes(hrefJSON);
                            localizedPhrases.localizedPhraseKeys[locale.localeCode][phraseKey].links[link.linkName].href = hrefValue;
                        }
                        else {
                            if (((_32 = (_31 = fallbackLinkTranslation === null || fallbackLinkTranslation === void 0 ? void 0 : fallbackLinkTranslation.linkHrefValue) === null || _31 === void 0 ? void 0 : _31.plainText) !== null && _32 !== void 0 ? _32 : "").trim() != "") {
                                const hrefJSON = (_34 = (_33 = fallbackLinkTranslation === null || fallbackLinkTranslation === void 0 ? void 0 : fallbackLinkTranslation.linkHrefValue) === null || _33 === void 0 ? void 0 : _33.json) !== null && _34 !== void 0 ? _34 : '{}';
                                const hrefValue = getPlainTextNodes(hrefJSON);
                                localizedPhrases.localizedPhraseKeys[locale.localeCode][phraseKey].links[link.linkName].href = hrefValue;
                            }
                            else {
                                const hrefJSON = (_36 = (_35 = defaultLink === null || defaultLink === void 0 ? void 0 : defaultLink.linkHrefValue) === null || _35 === void 0 ? void 0 : _35.json) !== null && _36 !== void 0 ? _36 : '{}';
                                const hrefValue = getPlainTextNodes(hrefJSON);
                                localizedPhrases.localizedPhraseKeys[locale.localeCode][phraseKey].links[link.linkName].href = hrefValue;
                            }
                        }
                    }
                    // do styled content here
                    for (const styledContent of phrase.styledContents) {
                        const styleClass = (0, floro_generator_schema_api_1.getReferencedObject)(state, styledContent.styleClassRef);
                        localizedPhrases.localizedPhraseKeys[locale.localeCode][phraseKey].styledContents[styledContent.name] = {};
                        const styledContentLocaleRuleRef = (0, floro_generator_schema_api_1.makeQueryRef)("$(text).phraseGroups.id<?>.phrases.id<?>.styledContents.name<?>.localeRules.id<?>", phraseGroup.id, phrase.id, styledContent.name, localeRef);
                        const styledContentLocaleRule = (0, floro_generator_schema_api_1.getReferencedObject)(state, styledContentLocaleRuleRef);
                        const fallbackStyledContentLocaleRuleRef = (0, floro_generator_schema_api_1.makeQueryRef)("$(text).phraseGroups.id<?>.phrases.id<?>.styledContents.name<?>.localeRules.id<?>", phraseGroup.id, phrase.id, styledContent.name, fallbackRef);
                        const fallbackStyledContentLocaleRule = (0, floro_generator_schema_api_1.getReferencedObject)(state, fallbackStyledContentLocaleRuleRef);
                        const defaultStyledContentLocaleRuleRef = (0, floro_generator_schema_api_1.makeQueryRef)("$(text).phraseGroups.id<?>.phrases.id<?>.styledContents.name<?>.localeRules.id<?>", phraseGroup.id, phrase.id, styledContent.name, localeSettings.defaultLocaleRef);
                        const defaultStyledContentLocaleRule = (0, floro_generator_schema_api_1.getReferencedObject)(state, defaultStyledContentLocaleRuleRef);
                        if (((_39 = ((_38 = (_37 = styledContentLocaleRule === null || styledContentLocaleRule === void 0 ? void 0 : styledContentLocaleRule.displayValue) === null || _37 === void 0 ? void 0 : _37.plainText) !== null && _38 !== void 0 ? _38 : "")) === null || _39 === void 0 ? void 0 : _39.trim()) != "") {
                            const displayValueJSON = (_41 = (_40 = styledContentLocaleRule === null || styledContentLocaleRule === void 0 ? void 0 : styledContentLocaleRule.displayValue) === null || _40 === void 0 ? void 0 : _40.json) !== null && _41 !== void 0 ? _41 : "{}";
                            const displayValue = getTextNodes(displayValueJSON);
                            localizedPhrases.localizedPhraseKeys[locale.localeCode][phraseKey].styledContents[styledContent.name] = {
                                displayValue,
                                styleClass: styleClass.name,
                            };
                        }
                        else {
                            if (((_43 = (_42 = fallbackStyledContentLocaleRule === null || fallbackStyledContentLocaleRule === void 0 ? void 0 : fallbackStyledContentLocaleRule.displayValue) === null || _42 === void 0 ? void 0 : _42.plainText) !== null && _43 !== void 0 ? _43 : "").trim() != "") {
                                const displayValueJSON = (_45 = (_44 = fallbackStyledContentLocaleRule === null || fallbackStyledContentLocaleRule === void 0 ? void 0 : fallbackStyledContentLocaleRule.displayValue) === null || _44 === void 0 ? void 0 : _44.json) !== null && _45 !== void 0 ? _45 : "{}";
                                const displayValue = getTextNodes(displayValueJSON);
                                localizedPhrases.localizedPhraseKeys[locale.localeCode][phraseKey].styledContents[styledContent.name] = {
                                    displayValue,
                                    styleClass: styleClass.name,
                                };
                            }
                            else {
                                const displayValueJSON = (_47 = (_46 = defaultStyledContentLocaleRule === null || defaultStyledContentLocaleRule === void 0 ? void 0 : defaultStyledContentLocaleRule.displayValue) === null || _46 === void 0 ? void 0 : _46.json) !== null && _47 !== void 0 ? _47 : "{}";
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
                            const phraseSectionLocaleRuleRef = (0, floro_generator_schema_api_1.makeQueryRef)("$(text).phraseGroups.id<?>.phrases.id<?>.phraseSections.name<?>.localeRules.id<?>", phraseGroup.id, phrase.id, phraseSection.name, localeRef);
                            const phraseSectionLocaleRule = (0, floro_generator_schema_api_1.getReferencedObject)(state, phraseSectionLocaleRuleRef);
                            const fallbackPhraseSectionLocaleRuleRef = (0, floro_generator_schema_api_1.makeQueryRef)("$(text).phraseGroups.id<?>.phrases.id<?>.phraseSections.name<?>.localeRules.id<?>", phraseGroup.id, phrase.id, phraseSection.name, fallbackRef);
                            const fallbackPhraseSectionLocaleRule = (0, floro_generator_schema_api_1.getReferencedObject)(state, fallbackPhraseSectionLocaleRuleRef);
                            const defaultPhraseSectionLocaleRuleRef = (0, floro_generator_schema_api_1.makeQueryRef)("$(text).phraseGroups.id<?>.phrases.id<?>.phraseSections.name<?>.localeRules.id<?>", phraseGroup.id, phrase.id, phraseSection.name, localeSettings.defaultLocaleRef);
                            const defaultPhraseSectionLocaleRule = (0, floro_generator_schema_api_1.getReferencedObject)(state, defaultPhraseSectionLocaleRuleRef);
                            if (((_49 = (_48 = phraseSectionLocaleRule === null || phraseSectionLocaleRule === void 0 ? void 0 : phraseSectionLocaleRule.displayValue) === null || _48 === void 0 ? void 0 : _48.plainText) !== null && _49 !== void 0 ? _49 : "").trim() != "") {
                                const phraseJSON = (_51 = (_50 = phraseSectionLocaleRule === null || phraseSectionLocaleRule === void 0 ? void 0 : phraseSectionLocaleRule.displayValue) === null || _50 === void 0 ? void 0 : _50.json) !== null && _51 !== void 0 ? _51 : '{}';
                                nodeLists.push(...getTextNodes(phraseJSON));
                            }
                            else {
                                if (((_53 = (_52 = fallbackPhraseSectionLocaleRule === null || fallbackPhraseSectionLocaleRule === void 0 ? void 0 : fallbackPhraseSectionLocaleRule.displayValue) === null || _52 === void 0 ? void 0 : _52.plainText) !== null && _53 !== void 0 ? _53 : "").trim() != "") {
                                    const phraseJSON = (_55 = (_54 = fallbackPhraseSectionLocaleRule === null || fallbackPhraseSectionLocaleRule === void 0 ? void 0 : fallbackPhraseSectionLocaleRule.displayValue) === null || _54 === void 0 ? void 0 : _54.json) !== null && _55 !== void 0 ? _55 : '{}';
                                    nodeLists.push(...getTextNodes(phraseJSON));
                                }
                                else {
                                    const phraseJSON = (_57 = (_56 = defaultPhraseSectionLocaleRule === null || defaultPhraseSectionLocaleRule === void 0 ? void 0 : defaultPhraseSectionLocaleRule.displayValue) === null || _56 === void 0 ? void 0 : _56.json) !== null && _57 !== void 0 ? _57 : '{}';
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
                        const phraseTranslationRef = (0, floro_generator_schema_api_1.makeQueryRef)("$(text).phraseGroups.id<?>.phrases.id<?>.phraseTranslations.id<?>", phraseGroup.id, phrase.id, localeRef);
                        const phraseTranslation = (0, floro_generator_schema_api_1.getReferencedObject)(state, phraseTranslationRef);
                        const fallbackPhraseTranslationRef = (0, floro_generator_schema_api_1.makeQueryRef)("$(text).phraseGroups.id<?>.phrases.id<?>.phraseTranslations.id<?>", phraseGroup.id, phrase.id, fallbackRef);
                        const fallbackPhraseTranslation = (0, floro_generator_schema_api_1.getReferencedObject)(state, fallbackPhraseTranslationRef);
                        const defaultPhraseTranslationRef = (0, floro_generator_schema_api_1.makeQueryRef)("$(text).phraseGroups.id<?>.phrases.id<?>.phraseTranslations.id<?>", phraseGroup.id, phrase.id, localeSettings.defaultLocaleRef);
                        const defaultPhraseTranslation = (0, floro_generator_schema_api_1.getReferencedObject)(state, defaultPhraseTranslationRef);
                        if (((_58 = phraseTranslation === null || phraseTranslation === void 0 ? void 0 : phraseTranslation.plainText) !== null && _58 !== void 0 ? _58 : "").trim() != "") {
                            const phraseJSON = (_59 = phraseTranslation === null || phraseTranslation === void 0 ? void 0 : phraseTranslation.json) !== null && _59 !== void 0 ? _59 : '{}';
                            localizedPhrases.localizedPhraseKeys[locale.localeCode][phraseKey].phrase = getTextNodes(phraseJSON);
                        }
                        else {
                            if (((_60 = fallbackPhraseTranslation === null || fallbackPhraseTranslation === void 0 ? void 0 : fallbackPhraseTranslation.plainText) !== null && _60 !== void 0 ? _60 : "").trim() != "") {
                                const phraseJSON = (_61 = fallbackPhraseTranslation === null || fallbackPhraseTranslation === void 0 ? void 0 : fallbackPhraseTranslation.json) !== null && _61 !== void 0 ? _61 : '{}';
                                localizedPhrases.localizedPhraseKeys[locale.localeCode][phraseKey].phrase = getTextNodes(phraseJSON);
                            }
                            else {
                                const phraseJSON = (_62 = defaultPhraseTranslation === null || defaultPhraseTranslation === void 0 ? void 0 : defaultPhraseTranslation.json) !== null && _62 !== void 0 ? _62 : '{}';
                                localizedPhrases.localizedPhraseKeys[locale.localeCode][phraseKey].phrase = getTextNodes(phraseJSON);
                            }
                        }
                    }
                }
            }
        }
        return localizedPhrases;
    });
}
exports.getJSON = getJSON;
function generate(state, outDir, args = { lang: "typescript" }) {
    var _a, _b, _c, _d, _e, _f;
    return __awaiter(this, void 0, void 0, function* () {
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
        const localeSettings = (0, floro_generator_schema_api_1.getReferencedObject)(state, "$(text).localeSettings");
        const phraseGroups = (0, floro_generator_schema_api_1.getReferencedObject)(state, "$(text).phraseGroups");
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
                for (const variable of (_a = phrase === null || phrase === void 0 ? void 0 : phrase.variables) !== null && _a !== void 0 ? _a : []) {
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
                for (const contentVariable of (_b = phrase === null || phrase === void 0 ? void 0 : phrase.contentVariables) !== null && _b !== void 0 ? _b : []) {
                    SCHEMA.definitions.PhraseKeys.properties[phraseKey].properties.contentVariables.properties[contentVariable.name] = {
                        type: ["string"],
                    };
                    SCHEMA.definitions.PhraseKeys.properties[phraseKey].properties.contentVariables.required.push(contentVariable.name);
                    SCHEMA.definitions.PhraseKeys.properties[phraseKey].properties.args.properties[contentVariable.name] = {
                        type: ["string"],
                    };
                    SCHEMA.definitions.PhraseKeys.properties[phraseKey].properties.args.required.push(contentVariable.name);
                }
                for (const styleClass of (_c = phrase === null || phrase === void 0 ? void 0 : phrase.styleClasses) !== null && _c !== void 0 ? _c : []) {
                    SCHEMA.definitions.PhraseKeys.properties[phraseKey].properties.styleClasses.properties[styleClass.name] = {
                        type: ["string"],
                    };
                    SCHEMA.definitions.PhraseKeys.properties[phraseKey].properties.styleClasses.required.push(styleClass.name);
                    SCHEMA.definitions.PhraseKeys.properties[phraseKey].properties.args.properties[styleClass.name] = {
                        type: ["string"],
                    };
                    SCHEMA.definitions.PhraseKeys.properties[phraseKey].properties.args.required.push(styleClass.name);
                }
                for (const interpolation of (_d = phrase === null || phrase === void 0 ? void 0 : phrase.interpolationVariants) !== null && _d !== void 0 ? _d : []) {
                    noInterpolations = false;
                    SCHEMA.definitions.PhraseKeys.properties[phraseKey].properties.interpolations.properties[interpolation.name] = {
                        $ref: "#/definitions/Interpolation",
                    };
                    SCHEMA.definitions.PhraseKeys.properties[phraseKey].properties.interpolations.required.push(interpolation.name);
                }
                for (const styledContent of (_e = phrase === null || phrase === void 0 ? void 0 : phrase.styledContents) !== null && _e !== void 0 ? _e : []) {
                    noStyledContents = false;
                    SCHEMA.definitions.PhraseKeys.properties[phraseKey].properties.styledContents.properties[styledContent.name] = {
                        $ref: "#/definitions/StyledContent",
                    };
                    SCHEMA.definitions.PhraseKeys.properties[phraseKey].properties.styledContents.required.push(styledContent.name);
                }
                for (const linkVariables of (_f = phrase === null || phrase === void 0 ? void 0 : phrase.linkVariables) !== null && _f !== void 0 ? _f : []) {
                    noLinks = false;
                    SCHEMA.definitions.PhraseKeys.properties[phraseKey].properties.links.properties[linkVariables.linkName] = {
                        $ref: "#/definitions/Link",
                    };
                    SCHEMA.definitions.PhraseKeys.properties[phraseKey].properties.links.required.push(linkVariables.linkName);
                }
            }
        }
        const inputData = new quicktype_core_1.InputData();
        const source = { name: "LocalizedPhrases", schema: JSON.stringify(SCHEMA) };
        yield inputData.addSource("schema", source, () => new quicktype_core_1.JSONSchemaInput(undefined));
        if (args.lang == 'typescript') {
            const lang = new quicktype_core_1.TypeScriptTargetLanguage();
            const runtimeTypecheck = lang.optionDefinitions.find(option => option.name == 'runtime-typecheck');
            if (runtimeTypecheck) {
                runtimeTypecheck.defaultValue = false;
            }
            const { lines } = yield (0, quicktype_core_1.quicktype)({ lang, inputData });
            const code = lines.join("\n");
            const tsFile = path_1.default.join(outDir, 'index.ts');
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
            yield fs_1.default.promises.writeFile(tsFile, tsCode, 'utf-8');
            const textJson = yield getJSON(state);
            const jsonFile = path_1.default.join(outDir, 'text.json');
            yield fs_1.default.promises.writeFile(jsonFile, JSON.stringify(textJson, null, 2), 'utf-8');
        }
    });
}
exports.generate = generate;
//# sourceMappingURL=index.js.map