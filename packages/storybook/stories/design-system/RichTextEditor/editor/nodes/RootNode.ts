import Node, { NodeJSON } from "../Node"
import Observer from "../Observer";
import ListNode from "./ListNode";
import MentionedLinkTagNode from "./MentionedLinkTagNode";
import OrderedListNode from "./OrderedListNode";
import TextNode, { TextNodeJSON } from "./TextNode";
import UnOrderedListNode from "./UnOrderedListNode";

export default class RootNode extends Node {

  public children: Node[];

  constructor(observer: Observer, content: string, lang: string, children?: Node[]) {
    super(observer, content, lang, children);
    this.content = content;
    this.children = children ?? [];
    this.type = 'root';
    this.isActive = false;
  }

  public toHTMLString(): string {
    const children = this.children?.map(child => child.toHTMLString()).join("");
    return `${this.content}${children}`;
  }

  public static fromJSON(json: NodeJSON, observer: Observer, lang: string): RootNode {
    const children: Array<TextNodeJSON> = this.fromTextChildren(
      json.children as Array<Node> ?? ([] as Array<NodeJSON>),
      observer,
      lang
    );
    return new RootNode(observer, json.content, lang, children as TextNode[]);
  }

  public static fromTextChildren(children: Array<NodeJSON>, observer: Observer, lang: string): Array<Node&TextNodeJSON> {
    return (
      children?.map((c) => {
        if (c.type == "ol-tag") {
          return OrderedListNode.fromJSON(c as TextNode, observer, lang);
        }
        if (c.type == "ul-tag") {
          return UnOrderedListNode.fromJSON(c as TextNode, observer, lang);
        }
        if (c.type == "li-tag") {
          return ListNode.fromJSON(c as TextNode, observer, lang);
        }
        if (c.type == "mentioned-link-tag") {
          return MentionedLinkTagNode.fromJSON(c as MentionedLinkTagNode, observer, lang);
        }
        return TextNode.fromJSON(c as TextNode, observer, lang);
      }) ?? []
    );
  }

  public getNodeIndexAtPosition(index: number): number {
    let lastPos = 0;
    for (let i = 0; i < this.children.length; ++i) {
      const child = this.children[i];
      const length = child.length();
      if (index >= lastPos && index < length) {
        return i;
      }
      lastPos += length;
    }
    return this.children.length - 1;
  }
}