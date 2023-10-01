import Node, { NodeJSON } from "../Node"
import Observer from "../Observer";
import TextNode from "./TextNode";

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
    const children: Array<TextNode> = json.children?.map(c => TextNode.fromJSON(c as TextNode, observer, lang)) ?? [];
    return new RootNode(observer, json.content, lang, children);
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