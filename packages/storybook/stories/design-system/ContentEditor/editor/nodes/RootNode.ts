import Node, { NodeJSON } from "../Node"
import Observer from "../Observer";
import OrderedListNode from "./OrderedListNode";
import TextNode, { TextNodeJSON } from "./TextNode";
import UnOrderedListNode from "./UnOrderedListNode";

export default class RootNode extends Node {

  public children: TextNode[];

  constructor(observer: Observer, content: string, lang: string, children?: TextNode[]) {
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
    const children: Array<TextNode> = this.fromTextChildren(
      json.children as Array<TextNodeJSON> ?? ([] as Array<TextNodeJSON>),
      observer,
      lang
    );
    return new RootNode(observer, json.content, lang, children);
  }

  public static fromTextChildren(children: Array<TextNodeJSON>, observer: Observer, lang: string): Array<TextNode> {
    return (
      children?.map((c) => {
        if (c.type == "ol-tag") {
          return OrderedListNode.fromJSON(c as TextNode, observer, lang);
        }
        if (c.type == "ul-tag") {
          return UnOrderedListNode.fromJSON(c as TextNode, observer, lang);
        }
        if (c.type == "li-tag") {
          return UnOrderedListNode.fromJSON(c as TextNode, observer, lang);
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