import Node, { NodeJSON } from "../Node"
import Observer from "../Observer";
import LinkVariantTagNode from "./LinkVariableTagNode";
import ListNode from "./ListNode";
import OrderedListNode from "./OrderedListNode";
import TextNode, { TextNodeJSON } from "./TextNode";
import UnOrderedListNode from "./UnOrderedListNode";
import VariableTagNode from "./VariableTagNode";
import VariantTagNode from "./VariantTagNode";

export default class RootNode extends Node {

  public children: TextNode[];

  constructor(observer: Observer, content: string, lang: string, children?: TextNode[]) {
    super(null, observer, content, lang, children);
    this.content = content;
    this.children = children ?? [];
    this.type = 'root';
    this.isActive = false;
  }

  public toHTMLString(): string {
    const children = this.children?.map(child => child.toHTMLString()).join("");
    return `${this.content}${children}`;
  }

  public static fromJSON(_: null, json: NodeJSON, observer: Observer, lang: string): RootNode {
    const children: Array<TextNode> = [];
    const rootNode = new RootNode(observer, json.content, lang, children as TextNode[]);
    const childs: Array<TextNodeJSON> = this.fromTextChildren(
      rootNode,
      json.children as Array<Node> ?? ([] as Array<NodeJSON>),
      observer,
      lang
    );
    for (const child of childs) {
      children.push(child as TextNode);
    }
    return rootNode;
    //return new RootNode(observer, json.content, lang, children as TextNode[]);
  }

  public static fromTextChildren(rootNode: Node, children: Array<NodeJSON>, observer: Observer, lang: string): Array<Node&TextNodeJSON> {
    return (
      children?.map((c) => {
        if (c.type == "ol-tag") {
          return OrderedListNode.fromJSON(rootNode, c as TextNode, observer, lang);
        }
        if (c.type == "ul-tag") {
          return UnOrderedListNode.fromJSON(rootNode, c as TextNode, observer, lang);
        }
        if (c.type == "li-tag") {
          return ListNode.fromJSON(rootNode, c as TextNode, observer, lang);
        }
        if (c.type == "variable-tag") {
          return VariableTagNode.fromJSON(rootNode as TextNode, c as VariableTagNode, observer, lang);
        }
        if (c.type == "variant-tag") {
          return VariantTagNode.fromJSON(rootNode as TextNode, c as VariantTagNode, observer, lang);
        }
        if (c.type == "link-variable-tag") {
          return LinkVariantTagNode.fromJSON(rootNode as TextNode, c as LinkVariantTagNode, observer, lang);
        }
        return TextNode.fromJSON(rootNode as TextNode, c as TextNode, observer, lang);
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