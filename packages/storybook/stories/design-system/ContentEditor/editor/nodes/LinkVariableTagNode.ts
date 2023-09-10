import ColorPalette from "@floro/styles/ColorPalette";
import Node from "../Node"
import Observer from "../Observer";
import TextNode from "./TextNode";
import escape from 'escape-html';

export default class LinkVariantTagNode extends Node {

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

  constructor(observer: Observer, content: string, lang: string, initMarks?: {
    isBold: boolean,
    isItalic: boolean,
    isUnderlined: boolean,
  }) {
    super(observer, content, lang, []);
    this.type = 'link-variable-tag';
    this.lang = lang;

    if (initMarks) {
      this.marks.isBold = !!initMarks.isBold;
      this.marks.isItalic = !!initMarks.isItalic;
      this.marks.isUnderlined = !!initMarks.isUnderlined;
    }
  }

  public toHTMLString(): string {
    const unescaped = this.content.substring(1, this.content.length -1);

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
     spellcheck="false"
     style="
        background-color: ${ColorPalette.variableBlue};
        color: transparent;
        border-radius:4px;
        position: relative;
        text-decoration: ${textDecoration};
        font-weight: ${fontWeight};
        font-style: ${fontStyle};
        pointer-events: none;
        -webkit-user-select: none;
        -webkit-touch-callout: none;
        -moz-user-select: none;
        -ms-user-select: none;
        user-select: none;
     "
    >${escape(this.content)}<span
     spellcheck="false"
     style="
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        width: 100%;
        border-radius: 4px;
        display: block;
        height: 100%;
        color: white;
        box-shadow: inset 0px 0px 2px 2px ${ColorPalette.variableBlueInset};
        text-decoration: ${textDecoration};
        font-weight: ${fontWeight};
        font-style: ${fontStyle};
        pointer-events: none;
        -webkit-user-select: none;
        -webkit-touch-callout: none;
        -moz-user-select: none;
        -ms-user-select: none;
        user-select: none;
        text-align: center;
     "
    >${escape(unescaped)}</span></span>`;
  }
}