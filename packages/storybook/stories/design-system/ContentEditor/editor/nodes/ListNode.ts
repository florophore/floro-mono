import Node from "../Node"
import Observer from "../Observer";
import RootNode from "./RootNode";
import TextNode, { TextNodeJSON } from "./TextNode";

export default class ListNode extends TextNode {

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

  constructor(observer: Observer, content: string, lang: string, children: TextNode[], initMarks?: {
    isBold: boolean,
    isItalic: boolean,
    isUnderlined: boolean,
    isStrikethrough: boolean,
    isSuperscript: boolean,
    isSubscript: boolean
  }) {
    super(observer, content, lang, children);
    this.type = 'li-tag';
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

    this.flatten(null);
    this.expand(null);
  }

  public static fromJSON(json: TextNodeJSON, observer: Observer, lang: string): ListNode {
    const children: Array<TextNode> = RootNode.fromTextChildren(
      json.children as Array<TextNodeJSON> ?? ([] as Array<TextNodeJSON>),
      observer,
      lang
    );
    return new ListNode(observer, json.content, lang, children, json.marks);
  }

  public shouldFlatten() {
    return false;
  }

  public shouldExpand() {
    return false;
  }

 public shouldCoalesce(nextSibling: Node) {
    return false;
 }

  public toHTMLString(): string {
    const content = this.children.map(child => child.toHTMLString()).join("");
    return `<li>${content}</li>`
  }
}