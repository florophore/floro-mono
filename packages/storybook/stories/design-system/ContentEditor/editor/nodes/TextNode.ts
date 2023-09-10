import Node, { NodeJSON } from "../Node"
import Observer from "../Observer";
import LinkVariableTagNode from "./LinkVariableTagNode";
import VariableTagNode from "./VariableTagNode";
import escape from 'escape-html';
import VariantTagNode from "./VariantTagNode";

interface TextNodeJSON extends NodeJSON {
  children: TextNodeJSON[];
  marks: {
    isBold: boolean;
    isItalic: boolean;
    isUnderlined: boolean;
  }
}

//const tags = ['hello', 'world'];

export default class TextNode extends Node {

  public children: TextNode[];
  public observer: Observer;


  public marks: {
    isBold: boolean;
    isItalic: boolean;
    isUnderlined: boolean;
  } = {
    isBold: false,
    isItalic: false,
    isUnderlined: false
  };

  public lang: string;

  constructor(observer: Observer, content: string, lang: string, children?: TextNode[], initMarks?: {
    isBold: boolean,
    isItalic: boolean,
    isUnderlined: boolean,
  }) {
    super(observer, content, lang, children);
    this.observer = observer;
    this.content = content;
    this.children = children ?? [];
    this.type = 'text';
    this.isActive = false;
    if (initMarks) {
      this.marks.isBold = !!initMarks.isBold;
      this.marks.isItalic = !!initMarks.isItalic;
      this.marks.isUnderlined = !!initMarks.isUnderlined;
    }
    this.lang = lang;
  }

  public toJSON(): TextNodeJSON {
    return {
      content: this.content,
      marks: this.marks,
      children: this.children.map(child => child.toJSON())
    };
  }

  public static fromJSON(json: TextNodeJSON, observer: Observer, lang: string): TextNode {
    const children = json.children?.map(c => TextNode.fromJSON(c, observer, lang));
    return new TextNode(observer, json.content, lang, children, json.marks);
  }


  public toHTMLString(): string {
    const children = this.children?.map(child => child.toHTMLString()).join("");
    let textDecoration = "none";
    if (this.marks.isUnderlined == true) {
      textDecoration = "underline";
    }
    let fontWeight = "normal";
    if (this.marks.isBold == true) {
      fontWeight = "bold";
    }
    let fontStyle = "normal";
    if (this.marks.isItalic == true) {
      fontStyle = "italic";
    }
    return `<span
      data-is-bold=${this.marks.isBold ? "true" : "false"}
      data-is-italic=${this.marks.isItalic ? "true" : "false"}
      data-is-underlined=${this.marks.isUnderlined ? "true" : "false"}
      lang="${this.lang}"
      spellcheck="true"
      contenteditable="true"
      style="
        text-decoration: ${textDecoration};
        font-weight: ${fontWeight};
        font-style: ${fontStyle};
        -webkit-user-select: none;
        -webkit-touch-callout: none;
        -moz-user-select: none;
        -ms-user-select: none;
        user-select: none;
        pointer-events: none;
      "
     >${escape(this.content).replaceAll("\n", "<br>")}${children}</span>`;
  }

  public toTranslationString(): string {
    return this.toHTMLString();
  }

  public toUnescapedString(): string {
    const children = this.children?.map(child => child.toUnescapedString()).join("");
    const unescaped = this.content
      .replaceAll("&nbsp;", " ")
      .replaceAll("&lt;", "<")
      .replaceAll("&gt;", ">")
      .replaceAll("&quot;", '"')
      .replaceAll("&#39;", "'")
      .replaceAll("&amp;", "&");
    return unescaped + children;
 }

 public length(): number {
  return this.toUnescapedString().length;
 }

 public markHash(): string {
    const markHash = `type:${this.type}:isBold:${this.marks.isBold}:isItalic:${this.marks.isItalic}:isUnderlined:${this.marks.isUnderlined}`;
    return `markHash:${markHash}`;
 }

 public childrenHash(): string {
    const childrenHash = this.children?.map(child => child.hash()).join(":");
    return `childrenHash:${childrenHash}`;
 }

 public hash(): string {
    return `hash:${this.markHash()}:${this.childrenHash()}:content:${this.content}`;
 }

 public stateHash(): string {
    return `hash:${this.hash()}:isActive:${this.isActive}`;
 }

 public shouldCollapse(parent: Node) {
    if(parent.markHash() == this.markHash()) {
      return true;
    }
    if (this.type == parent.type && (parent.content == '' || this.content == '')) {
      return true;
    }
    return false;
 }
 public collapse(child: Node) {
    this.content = this.content + child.content;
    this.children = this.children.filter(c => c != child);
    if (this.type == child.type) {
      for (const prop in this.marks) {
        this.marks[prop] = (child as TextNode).marks[prop] || this.marks[prop];
      }
    }
 }

  public getHoistedChildren(): Node[] {
    return this.children?.map(child => {
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
        unnesteddNode.marks[prop] = this.marks[prop] || unnesteddNode.marks[prop];
      }
    }
    return unnesteddNode;
  }
  if (this.type == this.children[0].type) {
    for (const prop in this.marks) {
      this.children[0].marks[prop] = this.children[0].marks[prop] || this.marks[prop];
    }
  }
  return this.children[0];
 }

 public shouldCoalesce(nextSibling: Node) {
    return nextSibling.markHash() == this.markHash() || nextSibling.content == '';
 }

 public coalesce(nextSibling: Node) {
    this.content = this.content + nextSibling.content;
 }

 public shouldExpand() {
    const remappedTags = this.observer.getAllTags().map(tag => `{${tag}}`)
    for (const tag of remappedTags) {
      if (this.content.indexOf(tag) != -1) {
        return true;
      }
    }
    return false;
 }

 public tagLocations(substring,string){
  let a: Array<number> =[]
  let i=-1;
  while((i=string.indexOf(substring,i+1)) >= 0) {
    a.push(i)
  };
  return a;
}

 public getExpansion(): Node[] {
  const tags = this.observer.getAllTags();
  const remappedTags = tags.map(tag => `{${tag}}`)
  const tagIndices = remappedTags.reduce((acc, tag) => {
    const indices = this.tagLocations(tag, this.content)
    for (const index of indices) {
      acc[index] = tag;
    }
    return acc;
  }, {});
  let nodes: Array<Node> = [];
  let startIndex = 0;
  for (let i = 0; i < this.content.length; ++i) {
    if (tagIndices[i]) {
      const subContent = this.content.substring(startIndex, i);
      if (subContent != "") {
        nodes.push(new TextNode(this.observer, subContent, this.lang, [], this.marks));
      }
      const tagValue = tagIndices[i];
      startIndex = i + tagValue.length;
      if (this.observer.getVariableRemapSet().has(tagValue)) {
        nodes.push(new VariableTagNode(this.observer, tagValue, this.lang, this.marks))
      } else if (this.observer.getLinkVairablesRemapSet().has(tagValue)) {
        nodes.push(new LinkVariableTagNode(this.observer, tagValue, this.lang, this.marks))
      } else if (this.observer.getInterpolationVariantRemapSet().has(tagValue)) {
        nodes.push(new VariantTagNode(this.observer, tagValue, this.lang, this.marks))
      }
    }
  }
  const finalContent = this.content.substring(startIndex, this.content.length);
  if (startIndex != this.content.length && finalContent != "") {
      nodes.push(new TextNode(this.observer, finalContent, this.lang, [], this.marks));
  }
  return nodes;
 }
}