import ColorPalette from "@floro/styles/ColorPalette";
import Node from "../Node"
import Observer from "../Observer";
import escape from 'escape-html';
import { TextNodeJSON } from "./TextNode";

export interface MentionedTagJSON extends TextNodeJSON {
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

export default class MentionedTagNode extends Node implements TextNodeJSON {

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
    this.type = 'mentioned-tag';
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

  public toJSON(): MentionedTagJSON {
    return {
      content: this.content,
      type: 'mentioned-tag',
      marks: this.marks,
      children: []
    };
  }

  public static fromJSON(json: MentionedTagJSON, observer: Observer, lang: string): MentionedTagNode {
    return new MentionedTagNode(observer, json.content, lang, json.marks);
  }

  public toHTMLString(): string {
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
    let subcontent = escape(this.content).replaceAll("\n", "<br>");
    return `<span
     class="${this.marks.isSuperscript ? "sup" : this.marks.isSubscript ? "sub" : ""}"
     spellcheck="false"
     style="
        color: ${ColorPalette.linkBlue};
        text-decoration: ${textDecoration};
        font-weight: ${fontWeight};
        font-style: ${fontStyle};
        border-radius:4px;
        position: relative;
     "
    >${subcontent}</span>`;
  }
}