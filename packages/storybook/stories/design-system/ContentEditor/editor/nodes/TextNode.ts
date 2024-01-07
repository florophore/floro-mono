import Node, { NodeJSON } from "../Node"
import Observer from "../Observer";
import escape from 'escape-html';
import RootNode from "./RootNode";

import VariantTagNode from "./VariantTagNode";
import MentionedTagNode from "./MentionedTagNode";
import LinkVariableTagNode from "./LinkVariableTagNode";
import VariableTagNode from "./VariableTagNode";
import ContentVariableTagNode from "./ContentVariableTagNode";import StyledContentTagNode from "./StyledContentTagNode";
import SearchResultTagNode from "./SearchResultTagNode";

export interface TextNodeJSON extends NodeJSON {
  children: NodeJSON[];
  marks: {
    isBold: boolean;
    isItalic: boolean;
    isUnderlined: boolean;
    isStrikethrough: boolean;
    isSuperscript: boolean;
    isSubscript: boolean;
  }
}

export default class TextNode extends Node {
  public children: TextNode[];
  public observer: Observer;

  public marks: {
    isBold: boolean;
    isItalic: boolean;
    isUnderlined: boolean;
    isStrikethrough: boolean;
    isSuperscript: boolean;
    isSubscript: boolean;
  } = {
    isBold: false,
    isItalic: false,
    isUnderlined: false,
    isStrikethrough: false,
    isSuperscript: false,
    isSubscript: false,
  };

  public lang: string;
  private _idx: null | number = null;
  private _wholeString: null | string = null;

  constructor(
    parent: TextNode | RootNode,
    observer: Observer,
    content: string,
    lang: string,
    children?: TextNode[],
    initMarks?: {
      isBold: boolean;
      isItalic: boolean;
      isUnderlined: boolean;
      isStrikethrough: boolean;
      isSuperscript: boolean;
      isSubscript: boolean;
    }
  ) {
    super(parent, observer, content, lang, children);
    this.observer = observer;
    this.content = content;
    this.children = children ?? [];
    this.type = "text";
    this.isActive = false;
    if (initMarks) {
      this.marks.isBold = !!initMarks.isBold;
      this.marks.isItalic = !!initMarks.isItalic;
      this.marks.isUnderlined = !!initMarks.isUnderlined;
      this.marks.isStrikethrough = !!initMarks.isStrikethrough;
      this.marks.isSuperscript = !!initMarks.isSuperscript;
      this.marks.isSubscript = !!initMarks.isSubscript;
    }
    this.lang = lang;
  }

  public toJSON(): TextNodeJSON {
    return {
      content: this.content,
      type: this.type,
      marks: this.marks,
      children: this.children.map((child) => child.toJSON()),
    };
  }

  public static fromJSON(
    parent: TextNode,
    json: TextNode,
    observer: Observer,
    lang: string
  ): TextNode {
    const jsonChildren = (json.children ?? [])?.map((child) => {
      if (child.type == "mentioned-tag") {
        return {
          ...child,
          type: "text",
        };
      }
      if (child.type == "search-result-tag") {
        return {
          ...child,
          type: "text",
        };
      }
      return child;
    });
    const children: Array<TextNode> = [];
    const node = new TextNode(
      parent,
      observer,
      json.content,
      lang,
      children as TextNode[],
      json.marks
    );
    const childs = RootNode.fromTextChildren(
      node,
      jsonChildren,
      observer,
      lang
    );
    for (const child of childs) {
      children.push(child as TextNode);
    }
    return node;
  }

  public toHTMLString(): string {
    const children = this.children
      ?.map((child) => child.toHTMLString())
      .join("");
    let textDecoration = "none";
    if (this.marks.isUnderlined == true) {
      textDecoration = "underline";
    }
    if (this.marks.isStrikethrough) {
      if (textDecoration == "underline") {
        textDecoration = "underline line-through";
      } else {
        textDecoration = "line-through";
      }
    }
    let fontWeight = "normal";
    if (this.marks.isBold == true) {
      fontWeight = "bold";
    }
    let fontStyle = "normal";
    if (this.marks.isItalic == true) {
      fontStyle = "italic";
    }

    let subcontent = escape(this.content).replaceAll("\n", "<br>") + children;
    if (this.marks.isBold) {
      subcontent = `<b>${subcontent}</b>`;
    }
    if (this.marks.isItalic) {
        subcontent = `<i>${subcontent}</i>`;
    }
    if (this.marks.isUnderlined) {
        subcontent = `<u>${subcontent}</u>`;
    }
    if (this.marks.isStrikethrough) {
        subcontent = `<s>${subcontent}</s>`;
    }
    if (this.marks.isSuperscript) {
        subcontent = `<sup>${subcontent}</sup>`;
    }
    if (this.marks.isSubscript) {
        subcontent = `<sub>${subcontent}</sub>`;
    }
    return `<span
      data-is-bold=${this.marks.isBold ? "true" : "false"}
      data-is-italic=${this.marks.isItalic ? "true" : "false"}
      data-is-underlined=${this.marks.isUnderlined ? "true" : "false"}
      data-is-strikethrough=${this.marks.isStrikethrough ? "true" : "false"}
      data-is-superscript=${this.marks.isSuperscript ? "true" : "false"}
      data-is-subscript=${this.marks.isSubscript ? "true" : "false"}
      lang="${this.lang}"
      spellcheck="true"
      style="
      "
     >${subcontent}</span>`;
  }

  public toTranslationString(): string {
    return this.toHTMLString();
  }

  public static unescapedStr(str: string): string {
    return str
      .replaceAll("&nbsp;", " ")
      .replaceAll(String.fromCharCode(160), " ")
      .replaceAll("&lt;", "<")
      .replaceAll("&gt;", ">")
      .replaceAll("&quot;", '"')
      .replaceAll("&#39;", "'")
      .replaceAll("&amp;", "&");
  }

  public static unescapedString(textNode: TextNode): string {
    const children = textNode?.children
      .map((child) => child.toUnescapedString())
      .join("");
    const unescaped = this.unescapedStr(textNode?.content ?? "");
    return unescaped + children;
  }

  public _unescapedStr: string | null = null;

  public toUnescapedString(): string {
    if (this._unescapedStr !== null) {
      return this._unescapedStr;
    }
    this._unescapedStr = TextNode.unescapedString(this);
    return this._unescapedStr;
  }

  public length(): number {
    return this.toUnescapedString().length;
  }

  public index(): number {
    if (!this.parent) {
      return 0;
    }
    if (this._idx !== null) {
      return this._idx;
    }
    let index =
      this.parent.type == "root" ? 0 : (this.parent as TextNode).index();
    for (const child of this.parent?.children ?? []) {
      if (child == this) {
        return index;
      }
      index += child.length();
    }
    this._idx = index;
    return index;
  }

  public wholeUnscapedText(): string {
    if (this._wholeString !== null) {
      return this._wholeString;
    }
    if (this.parent && this.parent.type == "root") {
      let str = "";
      for (const child of this?.parent?.children ?? []) {
        str += child.toUnescapedString();
      }
      this._wholeString = str;
      return str;
    }
    if (this.parent) {
      this._wholeString = (this.parent as TextNode).wholeUnscapedText();
      return this._wholeString;
    }
    this._wholeString = "";
    return "";
  }

  public markHash(): string {
    const markHash = `type:${this.type}:isBold:${this.marks.isBold}:isItalic:${this.marks.isItalic}:isUnderlined:${this.marks.isUnderlined}:isStrikethrough:${this.marks.isStrikethrough}:isSuperscript:${this.marks.isSuperscript}:isSubscript:${this.marks.isSubscript}`;
    return `markHash:${markHash}`;
  }

  public childrenHash(): string {
    const childrenHash = this.children?.map((child) => child.hash()).join(":");
    return `childrenHash:${childrenHash}`;
  }

  public hash(): string {
    return `hash:${this.markHash()}:${this.childrenHash()}:content:${
      this.content
    }`;
  }

  public shouldCollapse(parent: Node) {
    if (parent.markHash() == this.markHash()) {
      return true;
    }
    if (
      this.type == parent.type &&
      (parent.content == "" || this.content == "")
    ) {
      return true;
    }
    return false;
  }
  public collapse(child: Node) {
    this.content = this.content + child.content;
    this.children = this.children.filter((c) => c != child);
    if (this.type == child.type) {
      for (const prop in this.marks) {
        this.marks[prop] = (child as TextNode).marks[prop] || this.marks[prop];
      }
    }
  }

  public getHoistedChildren(): Node[] {
    return this.children?.map((child) => {
      if (this.type == child.type) {
        for (const prop in this.marks) {
          child.marks[prop] = child.marks[prop] || this.marks[prop];
        }
      }
      return child;
    });
  }

  public getUnNestedNode(): TextNode {
    if (this.children?.[0].shouldUnNest()) {
      const unnesteddNode = this.children[0].getUnNestedNode();
      if (this.type == unnesteddNode.type) {
        for (const prop in this.marks) {
          unnesteddNode.marks[prop] =
            this.marks[prop] || unnesteddNode.marks[prop];
        }
      }
      return unnesteddNode;
    }
    if (this.type == this.children[0].type) {
      for (const prop in this.marks) {
        this.children[0].marks[prop] =
          this.children[0].marks[prop] || this.marks[prop];
      }
    }
    return this.children[0];
  }

  public shouldCoalesce(nextSibling: Node) {
    return this.type == nextSibling?.type && this.children.length == 0 && nextSibling.children.length == 0 && (
      nextSibling.markHash() == this.markHash() || nextSibling.content == ""
    );
  }

  public coalesce(nextSibling: Node) {
    this.content = this.content + nextSibling.content;
  }

  public shouldExpand() {
    const remappedTags = this.observer.getAllTags().map((tag) => `{${tag}}`);
    const mentionedTerms = this.observer.getMentionedTerms();
    for (const tag of remappedTags) {
      if (this.content.indexOf(tag) != -1) {
        return true;
      }
    }
    const searchText = TextNode.unescapedStr(
      this.observer?.searchString?.toLowerCase() ?? ""
    );
    const isSearchSubstring =
      searchText.length > 0 &&
      TextNode.unescapedStr(this.content?.toLowerCase()).indexOf(
        searchText.toLowerCase()
      ) != -1;
    if (isSearchSubstring) {
      return true;
    }
    const wholeText = TextNode.unescapedStr(
      this.wholeUnscapedText()
    ).toLowerCase();
    if (searchText.length > 0) {
      const allLocations = this.tagLocations(searchText, wholeText);
      const index = this.index();
      const endIndex = index + this.content.length;

      for (const start of allLocations) {
        const end = start + searchText.length;
        if (start > endIndex) {
          continue;
        }
        if (end < index) {
          continue;
        }
        return true;
      }
    }
    for (const termValue of mentionedTerms) {
      if (
        TextNode.unescapedStr(this.content?.toLowerCase()).indexOf(
          termValue?.toLowerCase()
        ) != -1
      ) {
        return true;
      }
    }
    return false;
  }

  public tagLocations(substring, string, ignoreSet?: Set<number>) {
    let a: Array<number> = [];
    let i = -1;
    if (substring == "" || string == "") {
      return [];
    }
    while ((i = string.indexOf(substring, i + 1)) >= 0) {
      if (ignoreSet && ignoreSet.has(i)) {
        continue;
      }
      a.push(i);
    }
    return a;
  }

  public splitSearchStringResult(
    searchResult: string,
    index: number,
    tagIndices: { [key: number]: string }
  ): Array<{ str: string; index: number }> {
    const ranges: Array<{ start: number; end: number }> = [];
    for (const startIndex in tagIndices) {
      const startIndexInt = parseInt(startIndex);
      const endIndex = startIndexInt + tagIndices[startIndex].length - 1;
      ranges.push({
        start: startIndexInt,
        end: endIndex,
      });
    }
    let lastIndexAppended = -1;
    const out: Array<{ str: string; index: number }> = [];
    for (let i = 0; i < searchResult.length; ++i) {
      const position = i + index;
      let isInRange = false;
      for (const range of ranges) {
        if (position >= range.start && position <= range.end) {
          isInRange = true;
          break;
        }
      }
      if (!isInRange) {
        if (lastIndexAppended == i - 1 && lastIndexAppended != -1) {
          out[out.length - 1].str += searchResult[i];
          lastIndexAppended = i;
        } else {
          out.push({
            str: searchResult[i],
            index: position,
          });
          lastIndexAppended = i;
        }
      }
    }
    return out;
  }

  public getSearchStrings(tagIndices: {
    [key: number]: string;
  }): { str: string; index: number }[] {
    const searchStrings: Array<{ str: string; index: number }> = [];
    const searchText = TextNode.unescapedStr(
      this.observer?.searchString?.toLowerCase() ?? ""
    );
    const isSearchSubstring =
      searchText.length > 0 &&
      TextNode.unescapedStr(this.content?.toLowerCase()).indexOf(
        searchText.toLowerCase()
      ) != -1;
    if (isSearchSubstring) {
      this.tagLocations(
        searchText,
        TextNode.unescapedStr(this.content?.toLowerCase())
      ).forEach((index) => {
        const result = this.content.substring(index, index + searchText.length);
        const results = this.splitSearchStringResult(result, index, tagIndices);
        searchStrings.push(...results);
      });
    }
    const wholeText = TextNode.unescapedStr(
      this.wholeUnscapedText()
    ).toLowerCase();
    if (searchText.length > 0) {
      const unescapedContent = TextNode.unescapedStr(
        this.content
      ).toLowerCase();
      const index = this.index();
      const endIndex = index + this.content.length;

      const allLocations = this.tagLocations(searchText, wholeText);
      let isInSearch = false;
      let positionIndex = 0;
      for (const start of allLocations) {
        const end = start + searchText.length;
        if (start > endIndex) {
          continue;
        }
        if (end < index) {
          continue;
        }
        positionIndex = start;
        isInSearch = true;
        break;
      }
      if (isInSearch) {
        const graph: number[][] = [];
        for (let i = 0; i < searchText.length; ++i) {
          graph.push([]);
          for (let j = 0; j < unescapedContent.length; ++j) {
            if (searchText[i] == unescapedContent[j]) {
              graph[i].push(1);
            } else {
              graph[i].push(0);
            }
          }
        }
        let startStr = "";
        const index = this.index();
        const offset = index - positionIndex;
        let idx = 0;
        while (graph?.[idx + offset]?.[idx]) {
          startStr += this.content[idx];
          idx++;
        }

        if (startStr.length > 0) {
          const results = this.splitSearchStringResult(startStr, 0, tagIndices);
          searchStrings.push(...results);
        }
        let endStr = "";
        idx = unescapedContent.length - 1;
        while (graph?.[idx + offset]?.[idx]) {
          endStr = this.content[idx] + endStr;
          idx--;
        }
        if (endStr.length > 0) {
          const results = this.splitSearchStringResult(endStr, idx + 1, tagIndices);
          searchStrings.push(...results);
        }
      }
    }
    return searchStrings;
  }

  public getExpansion(): Node[] {
    const tags = this.observer.getAllTags();
    const remappedTags = tags.map((tag) => `{${tag}}`);
    const mentionedTerms = this.observer.getMentionedTerms();
    const tagIndices = remappedTags.reduce((acc, tag) => {
      const indices = this.tagLocations(tag, this.content);
      for (const index of indices) {
        acc[index] = tag;
      }
      return acc;
    }, {});

    const searchStrings = this.getSearchStrings(tagIndices);
    const searchIndices = new Set<number>();
    const tagIndicesWithSearchTerm = searchStrings.reduce((acc, searchTerm) => {
      if (!acc[searchTerm.index]) {
        searchIndices.add(searchTerm.index);
        acc[searchTerm.index] = searchTerm.str;
      }
      return acc;
    }, tagIndices);

    const tagIndicesWithTerms = mentionedTerms.reduce((acc, term) => {
      const indices = this.tagLocations(
        TextNode.unescapedStr(term?.toLowerCase()),
        TextNode.unescapedStr(this.content?.toLowerCase())
      );
      for (const index of indices) {
        let skip = false;
        for (const startIndex in acc) {
          const startIndexInt = parseInt(startIndex);
          if (startIndexInt > index) {
            break;
          }
          const endIndex = startIndexInt + acc[startIndex].length - 1;
          if (index >= startIndexInt && index <= endIndex) {
            skip = true;
            break;
          }
        }
        if (!skip) {
          acc[index] = this.content.substring(index, index + term.length);
        }
      }
      return acc;
    }, tagIndicesWithSearchTerm);
    let nodes: Array<Node> = [];
    let startIndex = 0;
    for (let i = 0; i < this.content.length; ++i) {
      if (tagIndicesWithTerms[i]) {
        const subContent = this.content.substring(startIndex, i);
        if (subContent != "") {
          nodes.push(
            new TextNode(
              this.parent as TextNode,
              this.observer,
              subContent,
              this.lang,
              [],
              this.marks
            )
          );
        }
        const tagValue = tagIndicesWithTerms[i];
        startIndex = i + tagValue.length;
        if (this.observer.getVariableRemapSet().has(tagValue)) {
          nodes.push(
            new VariableTagNode(
              this.parent as TextNode,
              this.observer,
              tagValue,
              this.lang,
              this.marks
            )
          );
        } else if (this.observer.getLinkVariablesRemapSet().has(tagValue)) {
          nodes.push(
            new LinkVariableTagNode(
              this.parent as TextNode,
              this.observer,
              tagValue,
              this.lang,
              this.marks
            )
          );
        } else if (
          this.observer.getInterpolationVariantRemapSet().has(tagValue)
        ) {
          nodes.push(
            new VariantTagNode(
              this.parent as TextNode,
              this.observer,
              tagValue,
              this.lang,
              this.marks
            )
          );
        } else if (this.observer.getContentVariableRemapSet().has(tagValue)) {
          nodes.push(
            new ContentVariableTagNode(
              this.parent as TextNode,
              this.observer,
              tagValue,
              this.lang,
              this.marks
            )
          );
        } else if (this.observer.getStyledContentsRemapSet().has(tagValue)) {
          nodes.push(
            new StyledContentTagNode(
              this.parent as TextNode,
              this.observer,
              tagValue,
              this.lang,
              this.marks
            )
          );
        } else if (searchIndices.has(i)) {
          nodes.push(
            new SearchResultTagNode(
              this.parent as TextNode,
              this.observer,
              tagValue,
              this.lang,
              this.marks
            )
          );
        } else if (mentionedTerms.includes(tagValue?.toLowerCase())) {
          nodes.push(
            new MentionedTagNode(
              this.parent as TextNode,
              this.observer,
              tagValue,
              this.lang,
              this.marks
            )
          );
        }
      }
    }
    const finalContent = this.content.substring(
      startIndex,
      this.content.length
    );
    if (startIndex != this.content.length && finalContent != "") {
      nodes.push(
        new TextNode(
          this.parent as TextNode,
          this.observer,
          finalContent,
          this.lang,
          [],
          this.marks
        )
      );
    }
    return nodes;
  }
}