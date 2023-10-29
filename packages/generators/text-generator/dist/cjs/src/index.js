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
        content: variableValue,
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
const getNodeType = (tagType) => {
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
};
const getPlainNodeType = (tagType) => {
    if (tagType == 'variable-tag') {
        return 'variable';
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
    var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k, _l, _m, _o, _p, _q, _r, _s, _t, _u, _v, _w, _x, _y, _z, _0, _1, _2, _3, _4, _5, _6, _7, _8, _9, _10, _11, _12, _13, _14, _15, _16, _17, _18, _19, _20, _21, _22, _23, _24, _25, _26, _27, _28, _29, _30, _31, _32, _33, _34, _35, _36, _37, _38, _39;
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
                        links: {},
                        interpolations: {},
                    };
                    // DO VARIABLES FIRST
                    for (const variable of (_a = phrase === null || phrase === void 0 ? void 0 : phrase.variables) !== null && _a !== void 0 ? _a : []) {
                        const varValue = variable.varType == "string"
                            ? ""
                            : variable.varType == "boolean"
                                ? false
                                : 0;
                        localizedPhrases.localizedPhraseKeys[locale.localeCode][phraseKey].variables[variable.name] = varValue;
                    }
                    // DO INTERPOLATIONS SECOND
                    for (const interpolation of (_b = phrase === null || phrase === void 0 ? void 0 : phrase.interpolationVariants) !== null && _b !== void 0 ? _b : []) {
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
                        const conditionals = (_e = (_d = (_c = interpolationTranslation === null || interpolationTranslation === void 0 ? void 0 : interpolationTranslation.conditionals) === null || _c === void 0 ? void 0 : _c.filter) === null || _d === void 0 ? void 0 : _d.call(_c, c => { var _a, _b; return ((_b = (_a = c.resultant) === null || _a === void 0 ? void 0 : _a.plainText) === null || _b === void 0 ? void 0 : _b.trim()) != ""; })) !== null && _e !== void 0 ? _e : [];
                        if (conditionals.length == 0 && ((_g = (_f = interpolationTranslation === null || interpolationTranslation === void 0 ? void 0 : interpolationTranslation.defaultValue) === null || _f === void 0 ? void 0 : _f.plainText) !== null && _g !== void 0 ? _g : "").trim() == "") {
                            const fallbackConditionals = (_k = (_j = (_h = fallbackInterpolationTranslation.conditionals) === null || _h === void 0 ? void 0 : _h.filter) === null || _j === void 0 ? void 0 : _j.call(_h, (c) => {
                                var _a, _b;
                                return ((_b = (_a = c.resultant) === null || _a === void 0 ? void 0 : _a.plainText) === null || _b === void 0 ? void 0 : _b.trim()) != "";
                            })) !== null && _k !== void 0 ? _k : [];
                            if (fallbackConditionals.length == 0 && ((_m = (_l = fallbackInterpolationTranslation === null || fallbackInterpolationTranslation === void 0 ? void 0 : fallbackInterpolationTranslation.defaultValue) === null || _l === void 0 ? void 0 : _l.plainText) !== null && _m !== void 0 ? _m : "").trim() == "") {
                                // use global default
                                const defaultConditionals = (_q = (_p = (_o = defaultFallbackInterpolationTranslation.conditionals) === null || _o === void 0 ? void 0 : _o.filter) === null || _p === void 0 ? void 0 : _p.call(_o, (c) => { var _a, _b; return ((_b = (_a = c.resultant) === null || _a === void 0 ? void 0 : _a.plainText) === null || _b === void 0 ? void 0 : _b.trim()) != ""; })) !== null && _q !== void 0 ? _q : [];
                                const defaultJSON = (_s = (_r = defaultFallbackInterpolationTranslation === null || defaultFallbackInterpolationTranslation === void 0 ? void 0 : defaultFallbackInterpolationTranslation.defaultValue) === null || _r === void 0 ? void 0 : _r.json) !== null && _s !== void 0 ? _s : "{}";
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
                                    const subcases = (_v = (_u = (_t = conditional === null || conditional === void 0 ? void 0 : conditional.subconditions) === null || _t === void 0 ? void 0 : _t.map) === null || _u === void 0 ? void 0 : _u.call(_t, subcondition => {
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
                                    })) !== null && _v !== void 0 ? _v : [];
                                    const resultantJSON = (_x = (_w = conditional === null || conditional === void 0 ? void 0 : conditional.resultant) === null || _w === void 0 ? void 0 : _w.json) !== null && _x !== void 0 ? _x : "{}";
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
                                const defaultJSON = (_z = (_y = fallbackInterpolationTranslation === null || fallbackInterpolationTranslation === void 0 ? void 0 : fallbackInterpolationTranslation.defaultValue) === null || _y === void 0 ? void 0 : _y.json) !== null && _z !== void 0 ? _z : "{}";
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
                                    const subcases = (_2 = (_1 = conditional === null || conditional === void 0 ? void 0 : (_0 = conditional.subconditions).map) === null || _1 === void 0 ? void 0 : _1.call(_0, subcondition => {
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
                                    })) !== null && _2 !== void 0 ? _2 : [];
                                    const resultantJSON = (_4 = (_3 = conditional === null || conditional === void 0 ? void 0 : conditional.resultant) === null || _3 === void 0 ? void 0 : _3.json) !== null && _4 !== void 0 ? _4 : "{}";
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
                            const defaultJSON = (_6 = (_5 = interpolationTranslation === null || interpolationTranslation === void 0 ? void 0 : interpolationTranslation.defaultValue) === null || _5 === void 0 ? void 0 : _5.json) !== null && _6 !== void 0 ? _6 : "{}";
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
                                const subcases = (_9 = (_8 = (_7 = conditional === null || conditional === void 0 ? void 0 : conditional.subconditions) === null || _7 === void 0 ? void 0 : _7.map) === null || _8 === void 0 ? void 0 : _8.call(_7, subcondition => {
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
                                })) !== null && _9 !== void 0 ? _9 : [];
                                const resultantJSON = (_11 = (_10 = conditional === null || conditional === void 0 ? void 0 : conditional.resultant) === null || _10 === void 0 ? void 0 : _10.json) !== null && _11 !== void 0 ? _11 : "{}";
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
                    for (const link of (_12 = phrase === null || phrase === void 0 ? void 0 : phrase.linkVariables) !== null && _12 !== void 0 ? _12 : []) {
                        localizedPhrases.localizedPhraseKeys[locale.localeCode][phraseKey].links[link.linkName] = {};
                        const linkRef = (0, floro_generator_schema_api_1.makeQueryRef)("$(text).phraseGroups.id<?>.phrases.id<?>.linkVariables.linkName<?>.translations.id<?>", phraseGroup.id, phrase.id, link.linkName, localeRef);
                        const linkTranslation = (0, floro_generator_schema_api_1.getReferencedObject)(state, linkRef);
                        const fallbackLinkRef = (0, floro_generator_schema_api_1.makeQueryRef)("$(text).phraseGroups.id<?>.phrases.id<?>.linkVariables.linkName<?>.translations.id<?>", phraseGroup.id, phrase.id, link.linkName, fallbackRef);
                        const fallbackLinkTranslation = (0, floro_generator_schema_api_1.getReferencedObject)(state, fallbackLinkRef);
                        const defaultLinkRef = (0, floro_generator_schema_api_1.makeQueryRef)("$(text).phraseGroups.id<?>.phrases.id<?>.linkVariables.linkName<?>.translations.id<?>", phraseGroup.id, phrase.id, link.linkName, localeSettings.defaultLocaleRef);
                        const defaultLink = (0, floro_generator_schema_api_1.getReferencedObject)(state, defaultLinkRef);
                        if (((_15 = ((_14 = (_13 = linkTranslation === null || linkTranslation === void 0 ? void 0 : linkTranslation.linkDisplayValue) === null || _13 === void 0 ? void 0 : _13.plainText) !== null && _14 !== void 0 ? _14 : "")) === null || _15 === void 0 ? void 0 : _15.trim()) != "") {
                            const displayValueJSON = (_17 = (_16 = linkTranslation === null || linkTranslation === void 0 ? void 0 : linkTranslation.linkDisplayValue) === null || _16 === void 0 ? void 0 : _16.json) !== null && _17 !== void 0 ? _17 : '{}';
                            const displayValue = getTextNodes(displayValueJSON);
                            localizedPhrases.localizedPhraseKeys[locale.localeCode][phraseKey].links[link.linkName] = {
                                displayValue,
                                linkName: link.linkName
                            };
                        }
                        else {
                            if (((_19 = (_18 = fallbackLinkTranslation === null || fallbackLinkTranslation === void 0 ? void 0 : fallbackLinkTranslation.linkDisplayValue) === null || _18 === void 0 ? void 0 : _18.plainText) !== null && _19 !== void 0 ? _19 : "").trim() != "") {
                                const displayValueJSON = (_21 = (_20 = fallbackLinkTranslation === null || fallbackLinkTranslation === void 0 ? void 0 : fallbackLinkTranslation.linkDisplayValue) === null || _20 === void 0 ? void 0 : _20.json) !== null && _21 !== void 0 ? _21 : '{}';
                                const displayValue = getTextNodes(displayValueJSON);
                                localizedPhrases.localizedPhraseKeys[locale.localeCode][phraseKey].links[link.linkName] = {
                                    displayValue,
                                    linkName: link.linkName
                                };
                            }
                            else {
                                const displayValueJSON = (_23 = (_22 = defaultLink === null || defaultLink === void 0 ? void 0 : defaultLink.linkDisplayValue) === null || _22 === void 0 ? void 0 : _22.json) !== null && _23 !== void 0 ? _23 : '{}';
                                const displayValue = getTextNodes(displayValueJSON);
                                localizedPhrases.localizedPhraseKeys[locale.localeCode][phraseKey].links[link.linkName] = {
                                    displayValue,
                                    linkName: link.linkName
                                };
                            }
                        }
                        if (((_26 = ((_25 = (_24 = linkTranslation === null || linkTranslation === void 0 ? void 0 : linkTranslation.linkHrefValue) === null || _24 === void 0 ? void 0 : _24.plainText) !== null && _25 !== void 0 ? _25 : "")) === null || _26 === void 0 ? void 0 : _26.trim()) != "") {
                            const hrefJSON = (_28 = (_27 = linkTranslation === null || linkTranslation === void 0 ? void 0 : linkTranslation.linkHrefValue) === null || _27 === void 0 ? void 0 : _27.json) !== null && _28 !== void 0 ? _28 : '{}';
                            const hrefValue = getPlainTextNodes(hrefJSON);
                            localizedPhrases.localizedPhraseKeys[locale.localeCode][phraseKey].links[link.linkName].href = hrefValue;
                        }
                        else {
                            if (((_30 = (_29 = fallbackLinkTranslation === null || fallbackLinkTranslation === void 0 ? void 0 : fallbackLinkTranslation.linkHrefValue) === null || _29 === void 0 ? void 0 : _29.plainText) !== null && _30 !== void 0 ? _30 : "").trim() != "") {
                                const hrefJSON = (_32 = (_31 = fallbackLinkTranslation === null || fallbackLinkTranslation === void 0 ? void 0 : fallbackLinkTranslation.linkHrefValue) === null || _31 === void 0 ? void 0 : _31.json) !== null && _32 !== void 0 ? _32 : '{}';
                                const hrefValue = getPlainTextNodes(hrefJSON);
                                localizedPhrases.localizedPhraseKeys[locale.localeCode][phraseKey].links[link.linkName].href = hrefValue;
                            }
                            else {
                                const hrefJSON = (_34 = (_33 = defaultLink === null || defaultLink === void 0 ? void 0 : defaultLink.linkHrefValue) === null || _33 === void 0 ? void 0 : _33.json) !== null && _34 !== void 0 ? _34 : '{}';
                                const hrefValue = getPlainTextNodes(hrefJSON);
                                localizedPhrases.localizedPhraseKeys[locale.localeCode][phraseKey].links[link.linkName].href = hrefValue;
                            }
                        }
                    }
                    const phraseTranslationRef = (0, floro_generator_schema_api_1.makeQueryRef)("$(text).phraseGroups.id<?>.phrases.id<?>.phraseTranslations.id<?>", phraseGroup.id, phrase.id, localeRef);
                    const phraseTranslation = (0, floro_generator_schema_api_1.getReferencedObject)(state, phraseTranslationRef);
                    const fallbackPhraseTranslationRef = (0, floro_generator_schema_api_1.makeQueryRef)("$(text).phraseGroups.id<?>.phrases.id<?>.phraseTranslations.id<?>", phraseGroup.id, phrase.id, fallbackRef);
                    const fallbackPhraseTranslation = (0, floro_generator_schema_api_1.getReferencedObject)(state, fallbackPhraseTranslationRef);
                    const defaultPhraseTranslationRef = (0, floro_generator_schema_api_1.makeQueryRef)("$(text).phraseGroups.id<?>.phrases.id<?>.phraseTranslations.id<?>", phraseGroup.id, phrase.id, localeSettings.defaultLocaleRef);
                    const defaultPhraseTranslation = (0, floro_generator_schema_api_1.getReferencedObject)(state, defaultPhraseTranslationRef);
                    if (((_35 = phraseTranslation === null || phraseTranslation === void 0 ? void 0 : phraseTranslation.plainText) !== null && _35 !== void 0 ? _35 : "").trim() != "") {
                        const phraseJSON = (_36 = phraseTranslation === null || phraseTranslation === void 0 ? void 0 : phraseTranslation.json) !== null && _36 !== void 0 ? _36 : '{}';
                        localizedPhrases.localizedPhraseKeys[locale.localeCode][phraseKey].phrase = getTextNodes(phraseJSON);
                    }
                    else {
                        if (((_37 = fallbackPhraseTranslation === null || fallbackPhraseTranslation === void 0 ? void 0 : fallbackPhraseTranslation.plainText) !== null && _37 !== void 0 ? _37 : "").trim() != "") {
                            const phraseJSON = (_38 = fallbackPhraseTranslation === null || fallbackPhraseTranslation === void 0 ? void 0 : fallbackPhraseTranslation.json) !== null && _38 !== void 0 ? _38 : '{}';
                            localizedPhrases.localizedPhraseKeys[locale.localeCode][phraseKey].phrase = getTextNodes(phraseJSON);
                        }
                        else {
                            const phraseJSON = (_39 = defaultPhraseTranslation === null || defaultPhraseTranslation === void 0 ? void 0 : defaultPhraseTranslation.json) !== null && _39 !== void 0 ? _39 : '{}';
                            localizedPhrases.localizedPhraseKeys[locale.localeCode][phraseKey].phrase = getTextNodes(phraseJSON);
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
    var _a, _b, _c;
    return __awaiter(this, void 0, void 0, function* () {
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
                }
                for (const interpolation of (_b = phrase === null || phrase === void 0 ? void 0 : phrase.interpolationVariants) !== null && _b !== void 0 ? _b : []) {
                    SCHEMA.definitions.PhraseKeys.properties[phraseKey].properties.interpolations.properties[interpolation.name] = {
                        $ref: "#/definitions/Interpolation",
                    };
                    SCHEMA.definitions.PhraseKeys.properties[phraseKey].properties.interpolations.required.push(interpolation.name);
                }
                for (const linkVariables of (_c = phrase === null || phrase === void 0 ? void 0 : phrase.linkVariables) !== null && _c !== void 0 ? _c : []) {
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
            yield fs_1.default.promises.writeFile(tsFile, tsCode, 'utf-8');
            const textJson = yield getJSON(state);
            const jsonFile = path_1.default.join(outDir, 'text.json');
            yield fs_1.default.promises.writeFile(jsonFile, JSON.stringify(textJson, null, 2), 'utf-8');
        }
    });
}
exports.generate = generate;
//# sourceMappingURL=index.js.map