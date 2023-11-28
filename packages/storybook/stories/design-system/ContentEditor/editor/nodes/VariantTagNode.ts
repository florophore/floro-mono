import ColorPalette from "@floro/styles/ColorPalette";
import Node from "../Node"
import Observer from "../Observer";
import escape from 'escape-html';
import { TextNodeJSON } from "./TextNode";

export interface VariantTagJSON extends TextNodeJSON {
  type: string;
  content: string;
  marks: {
    isBold: boolean;
    isItalic: boolean;
    isUnderlined: boolean;
    isStrikethrough: boolean;
    isSuperscript: boolean;
    isSubscript: boolean;
  }
}

export default class VariantTagNode extends Node implements TextNodeJSON {

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

  constructor(observer: Observer, content: string, lang: string, initMarks?: {
    isBold: boolean,
    isItalic: boolean,
    isUnderlined: boolean,
    isStrikethrough: boolean,
    isSuperscript: boolean,
    isSubscript: boolean
  }) {
    super(observer, content, lang, []);
    this.type = 'variant-tag';
    this.lang = lang;

    if (initMarks) {
      this.marks.isBold = !!initMarks.isBold;
      this.marks.isItalic = !!initMarks.isItalic;
      this.marks.isUnderlined = !!initMarks.isUnderlined;
      this.marks.isStrikethrough = !!initMarks.isStrikethrough;
      this.marks.isSuperscript = !!initMarks.isSuperscript;
      this.marks.isSubscript = !!initMarks.isSubscript;
    }
  }

  public toJSON(): VariantTagJSON {
    return {
      content: this.content,
      type: 'variant-tag',
      marks: this.marks,
      children: []
    };
  }

  public static fromJSON(json: VariantTagJSON, observer: Observer, lang: string): VariantTagNode {
    return new VariantTagNode(observer, json.content, lang, json.marks);
  }

  public toHTMLString(): string {
    const unescaped = this.content.substring(1, this.content.length -1);

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
    let bottomLineHeight = 1.2;

    return `<span
     spellcheck="false"
     class="${this.marks.isSuperscript ? "sup" : this.marks.isSubscript ? "sub" : ""}"
     style="
        background-color: ${ColorPalette.variableYellow};
        color: ${ColorPalette.darkGray};
        border-radius:4px;
        position: relative;
        text-decoration: ${textDecoration};
        font-weight: ${fontWeight};
        font-style: ${fontStyle};
     "
    >${escape(this.content)}</span>`;
  }
}