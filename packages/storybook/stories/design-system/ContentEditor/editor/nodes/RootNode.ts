import Node, { NodeJSON } from "../Node"
import Observer from "../Observer";
import LinkVariantTagNode from "./LinkVariableTagNode";
import OrderedListNode from "./OrderedListNode";
import TextNode, { TextNodeJSON } from "./TextNode";
import UnOrderedListNode from "./UnOrderedListNode";
import VariableTagNode from "./VariableTagNode";
import VariantTagNode from "./VariantTagNode";

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

  public static fromTextChildren(children: Array<NodeJSON>, observer: Observer, lang: string): Array<TextNodeJSON> {
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
        if (c.type == "variable-tag") {
          return VariableTagNode.fromJSON(c as VariableTagNode, observer, lang);
        }
        if (c.type == "variant-tag") {
          return VariantTagNode.fromJSON(c as VariantTagNode, observer, lang);
        }
        if (c.type == "link-variable-tag") {
          return LinkVariantTagNode.fromJSON(c as LinkVariantTagNode, observer, lang);
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