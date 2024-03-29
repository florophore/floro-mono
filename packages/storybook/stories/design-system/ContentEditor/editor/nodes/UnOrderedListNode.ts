import Node from "../Node"
import Observer from "../Observer";
import RootNode from "./RootNode";
import TextNode, { TextNodeJSON } from "./TextNode";

export default class UnOrderedListNode extends TextNode {

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
    isSubscript: false
  };

  public lang: string;
  public children: TextNode[];

  constructor(parent: TextNode|RootNode, observer: Observer, content: string, lang: string, children: TextNode[], initMarks?: {
    isBold: boolean,
    isItalic: boolean,
    isUnderlined: boolean,
    isStrikethrough: boolean,
    isSuperscript: boolean,
    isSubscript: boolean
  }) {
    super(parent, observer, content, lang, children);
    this.type = 'ul-tag';
    this.lang = lang;
    this.children = children;

    if (initMarks) {
      this.marks.isBold = !!initMarks.isBold;
      this.marks.isItalic = !!initMarks.isItalic;
      this.marks.isUnderlined = !!initMarks.isUnderlined;
      this.marks.isStrikethrough = !!initMarks.isStrikethrough;
      this.marks.isSuperscript = !!initMarks.isSuperscript;
      this.marks.isSubscript = !!initMarks.isSubscript;
    }
  }

  public static fromJSON(parent: Node, json: TextNodeJSON, observer: Observer, lang: string): UnOrderedListNode {
    const children: Array<TextNode> = [];
    const ulNode = new UnOrderedListNode(parent as TextNode, observer, json.content, lang, children, json.marks);
    const childs: Array<TextNode> = RootNode.fromTextChildren(
      ulNode as TextNode,
      json.children as Array<TextNodeJSON> ?? ([] as Array<TextNodeJSON>),
      observer,
      lang
    ) as Array<TextNode>;
    for (const child of childs) {
      children.push(child);
    }
    return ulNode;
  }

  public toUnescapedString(): string {
    const children = this.children?.map(child => child.toUnescapedString()).join("");
    // removes last \n from list
    return children.substring(0, children.length -1);
 }

  public shouldExpand() {
    return false;
  }

 public shouldCoalesce(nextSibling: Node) {
    return false;
 }

  public toHTMLString(): string {
    const content = this.children.map(child => child.toHTMLString()).join("");
    return `<ul>${content}</ul>`
  }
}