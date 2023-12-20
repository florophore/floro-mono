import Observer from "./Observer";

export interface NodeJSON {
  content: string;
  children?: NodeJSON[];
  type?: string;
}

export default class Node {
  public content!: string;
  public type!: string;
  public children!: Node[];
  public isActive: boolean;
  public lang: string;
  public observer: Observer;

  constructor(observer: Observer, content: string, lang: string, children?: Node[]) {
    this.observer = observer;
    this.content = content;
    this.children = children ?? [];
    this.type = "none";
    this.isActive = false;
    this.lang = lang;
  }

  public resetActive() {
    this.isActive = false;
    this.children.forEach((child) => child.resetActive());
  }

  public isEmpty(): boolean {
    if (this.content != "") {
      return false;
    }
    if (this.children.length != 0) {
      return false;
    }
    return true;
  }

  public toJSON(): NodeJSON {
    return {
      content: this.content,
      type: this.type,
      children: this.children.map((child) => child.toJSON()),
    };
  }

  public static fromJSON(json: NodeJSON, observer: Observer, lang: string): Node {
    const children = json.children?.map(c => Node.fromJSON(c, observer, lang));
    return new Node(observer, json.content, lang, children);
  }

  public toHTMLString(): string {
    const children = this.children?.map((child) => child.toHTMLString());
    return `<span>${this.content}${children}</span>`;
  }

  public toTranslationString(): string {
    return this.toHTMLString();
  }

  public toUnescapedString(): string {
    const children = this.children
      ?.map((child) => child.toUnescapedString())
      .join("");
    const unescaped = this.content
      .replaceAll("&nbsp;", " ")
      .replaceAll("&lt;", "<")
      .replaceAll("&gt;", ">")
      .replaceAll("&quot;", '"')
      .replaceAll("&#39;", "'")
      .replaceAll("&amp;", "&");
    return unescaped + children;
  }

  public toUnsafeString(): string {
    const children = this.children
      ?.map((child) => child.toUnsafeString())
      .join("");
    const unescaped = this.content;
    return unescaped + children;
  }

  public length(): number {
    return this.toUnescapedString().length;
  }

  public markHash(): string {
    const markHash = `type:${this.type}`;
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
    return false;
  }

  public collapse(child: Node) {
    this.content = this.content + child.content;
    this.children = this.children.filter((c) => c != child);
  }

  public shouldHoistChildren() {
    if (this.children.length == 0) {
      return false;
    }
    const childrenTypes = new Set(this.children.map(c => c.type));
    return childrenTypes.has(this.type);
  }

  public getHoistedChildren(): Node[] {
    return this.children;
  }

  public shouldUnNest() {
    if (this.content == '' && this.children.length == 1 && this.type == this.children[0].type) {
      return true;
    }
    return false;
  }

  public getUnNestedNode(): Node {
    if (this.shouldUnNest()) {
      const unnestedNode = this.getUnNestedNode();
      return unnestedNode;
    }
    return this;
  }

  public shouldCoalesce(nextSibling: Node) {
    return false;
  }

  public coalesce(nextSibling: Node) {
    this.content = this.content + nextSibling.content;
  }

  public shouldFlatten() {
    return true;
  }

  public shouldExpand() {
    return false;
  }

  public getExpansion(): Node[] {
    return [this];
  }

  public flatten(parent: Node|null) {

    for (const child of this.children) {
      child.flatten(this);
    }

    for (let i = 0; i < this.children.length; ++i) {
      const child = this.children[i];
      if (child.shouldUnNest()) {
        const nestedNode = child.getUnNestedNode();
        this?.children.splice(i, 1, nestedNode);
      }
    }

    for (let i = 0; i < this.children.length; ++i) {
      const child = this.children[i];
      if (child.isEmpty()) {
        this.children = this.children.filter((c) => c != child);
      }
    }

    if (parent && this.shouldHoistChildren()) {
      for (let i = 0; i < parent.children.length; ++i) {
        const parentChild = parent.children[i];
        if (parentChild == this) {
          const hoistedChildren = this.getHoistedChildren();
          parent.children.splice(i, 1);
          for (let j = 0; j < hoistedChildren.length; ++j) {
            parent.children.splice(j + i, 0, hoistedChildren[j]);
          }
        }
      }
    }
  }

  public expand(parent: Node|null) {
    for (const child of this.children) {
      child.expand(this);
    }

    for (let i = 0; i < this.children.length; ++i) {
      const child = this.children[i];
      if (child.shouldExpand()) {
        const expandedNodes = child.getExpansion();
        this.children.splice(i, expandedNodes.length, ...expandedNodes);
      }
    }

    if (parent && this.shouldExpand()) {
      for (let i = 0; i < parent.children.length; ++i) {
        const parentChild = parent.children[i];
        if (parentChild == this) {
          const expandedChildren = this.getExpansion();
          parent.children.splice(i, 1);
          for (let j = 0; j < expandedChildren.length; ++j) {
            parent.children.splice(j + i, 0, expandedChildren[j]);
          }
        }
      }
    }
  }
}