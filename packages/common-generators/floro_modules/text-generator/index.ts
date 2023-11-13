import textJSON from './text.json';

// To parse this data:
//
//   import { Convert, LocalizedPhrases } from "./file";
//
//   const localizedPhrases = Convert.toLocalizedPhrases(json);

export interface LocalizedPhrases {
    locales:             Locales;
    localizedPhraseKeys: LocalizedPhraseKeys;
    phraseKeyDebugInfo:  PhraseKeyDebugInfo;
}

export interface Locales {
    DE?: De;
    EN?: En;
    ES?: Es;
}

export interface De {
    defaultFallbackCode: null | string;
    isGlobalDefault:     boolean;
    localeCode:          string;
    name:                string;
}

export interface En {
    defaultFallbackCode: null | string;
    isGlobalDefault:     boolean;
    localeCode:          string;
    name:                string;
}

export interface Es {
    defaultFallbackCode: null | string;
    isGlobalDefault:     boolean;
    localeCode:          string;
    name:                string;
}

export interface LocalizedPhraseKeys {
    DE: PhraseKeys;
    EN: PhraseKeys;
    ES: PhraseKeys;
}

export interface PhraseKeys {
    "main.hello_world":         MainHelloWorld;
    "main.new_phrase":          MainNewPhrase;
    "main.say_hello_to_arthur": MainSayHelloToArthur;
    "main.welcome_banner":      MainWelcomeBanner;
    "main.welcome_page.cta":    MainWelcomePageCta;
}

export interface MainHelloWorld {
    interpolations: MainHelloWorldInterpolations;
    links:          MainHelloWorldLinks;
    phrase:         TextNode[];
    phraseKey:      string;
    variables:      MainHelloWorldVariables;
}

export interface MainHelloWorldInterpolations {
}

export interface MainHelloWorldLinks {
}

export interface TextNode {
    children: TextNode[];
    content:  string;
    styles:   Styles;
    type:     PhraseType;
}

export interface Styles {
    isBold:          boolean;
    isItalic:        boolean;
    isStrikethrough: boolean;
    isSubscript:     boolean;
    isSuperscript:   boolean;
    isUnderlined:    boolean;
}

export enum PhraseType {
    Interpolation = "interpolation",
    Li = "li",
    Link = "link",
    Ol = "ol",
    Text = "text",
    UL = "ul",
    Variable = "variable",
}

export interface MainHelloWorldVariables {
}

export interface MainNewPhrase {
    interpolations: MainNewPhraseInterpolations;
    links:          MainNewPhraseLinks;
    phrase:         TextNode[];
    phraseKey:      string;
    variables:      MainNewPhraseVariables;
}

export interface MainNewPhraseInterpolations {
    "some condition": Interpolation;
}

export interface Interpolation {
    cases:   Case[];
    default: TextNode[];
}

export interface Case {
    operator:  Operator;
    resultant: TextNode[];
    subcases:  SubCase[];
    value?:    boolean | number | string;
    variable:  string;
}

export enum Operator {
    Eq = "eq",
    Gt = "gt",
    Gte = "gte",
    IsFractional = "is_fractional",
    LTE = "lte",
    Lt = "lt",
    Neq = "neq",
}

export interface SubCase {
    conjunction: Conjunction;
    operator:    Operator;
    value?:      boolean | number | string;
    variable:    string;
}

export enum Conjunction {
    And = "AND",
}

export interface MainNewPhraseLinks {
    "my link": Link;
}

export interface Link {
    displayValue: TextNode[];
    href?:        PlainTextNode[];
    linkName:     string;
}

export interface PlainTextNode {
    content: string;
    type:    HrefType;
}

export enum HrefType {
    Text = "text",
    Variable = "variable",
}

export interface MainNewPhraseVariables {
    username: string;
}

export interface MainSayHelloToArthur {
    interpolations: MainSayHelloToArthurInterpolations;
    links:          MainSayHelloToArthurLinks;
    phrase:         TextNode[];
    phraseKey:      string;
    variables:      MainSayHelloToArthurVariables;
}

export interface MainSayHelloToArthurInterpolations {
}

export interface MainSayHelloToArthurLinks {
}

export interface MainSayHelloToArthurVariables {
}

export interface MainWelcomeBanner {
    interpolations: MainWelcomeBannerInterpolations;
    links:          MainWelcomeBannerLinks;
    phrase:         TextNode[];
    phraseKey:      string;
    variables:      MainWelcomeBannerVariables;
}

export interface MainWelcomeBannerInterpolations {
}

export interface MainWelcomeBannerLinks {
}

export interface MainWelcomeBannerVariables {
    name:          string;
    numberOfFiles: number;
}

export interface MainWelcomePageCta {
    interpolations: MainWelcomePageCtaInterpolations;
    links:          MainWelcomePageCtaLinks;
    phrase:         TextNode[];
    phraseKey:      string;
    variables:      MainWelcomePageCtaVariables;
}

export interface MainWelcomePageCtaInterpolations {
}

export interface MainWelcomePageCtaLinks {
}

export interface MainWelcomePageCtaVariables {
}

export interface PhraseKeyDebugInfo {
    "main.hello_world":         DebugInfo;
    "main.new_phrase":          DebugInfo;
    "main.say_hello_to_arthur": DebugInfo;
    "main.welcome_banner":      DebugInfo;
    "main.welcome_page.cta":    DebugInfo;
}

export interface DebugInfo {
    groupName: string;
    phraseKey: string;
}

// Converts JSON strings to/from your types
export class Convert {
    public static toLocalizedPhrases(json: string): LocalizedPhrases {
        return JSON.parse(json);
    }

    public static localizedPhrasesToJson(value: LocalizedPhrases): string {
        return JSON.stringify(value);
    }
}

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
      const variableValue = variableMap?.[variableName]?.toString?.() ?? "" as string;
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

export default textJSON as unknown as LocalizedPhrases;