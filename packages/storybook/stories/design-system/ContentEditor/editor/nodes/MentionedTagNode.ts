import ColorPalette from "@floro/styles/ColorPalette";
import Node from "../Node"
import Observer from "../Observer";
import escape from 'escape-html';

export default class MentionedTagNode extends Node {

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
    let fontSize = "inherit";
    if (this.marks.isSubscript || this.marks.isSuperscript) {
      fontSize = "smaller";
    }

    let lineHeight = 1;
    let verticalAlign = "inherit";
    if (this.marks.isSuperscript) {
      verticalAlign = "super";
      lineHeight = 0;
    }
    if (this.marks.isSubscript) {
      verticalAlign = "sub";
      lineHeight = 0;
    }
    return `<span
     spellcheck="false"
     style="
        color: ${ColorPalette.linkBlue};
        text-decoration: ${textDecoration};
        font-weight: ${fontWeight};
        font-style: ${fontStyle};
        font-size: ${fontSize};
        vertical-align: ${verticalAlign};
        line-height: ${lineHeight};
        border-radius:4px;
        position: relative;
        pointer-events: none;
        -webkit-user-select: none;
        -webkit-touch-callout: none;
        -moz-user-select: none;
        -ms-user-select: none;
        user-select: none;
     "
    >${escape(this.content)}</span>`;
  }
}