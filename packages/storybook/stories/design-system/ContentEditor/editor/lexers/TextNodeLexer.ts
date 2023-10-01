import EditorLexer from "../EditorLexer";
import Observer from "../Observer";
import TextNode from "../nodes/TextNode";

export default class TextNodeLexer extends EditorLexer<ChildNode, TextNode> {

    public lang: string;
    public observer: Observer;

    constructor(observer: Observer, lang: string) {
        super();
        this.observer = observer;
        this.lang = lang;
    }

    public lex(node: ChildNode): TextNode {
        if (node['tagName'] == "BR") {
            return new TextNode(this.observer, '\n', this.lang, []);
        }
        if (node.nodeType == 3) {
            return new TextNode(this.observer, node?.textContent ?? '', this.lang, []);
        }
        if (node.childNodes.length == 0) {
            return new TextNode(this.observer, '', this.lang, []);
        }
        const marks: {
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
        if (node.nodeType == 1) {
            if (node['tagName'] == "SPAN") {
                const spanNode = node as HTMLSpanElement;
                marks.isBold = spanNode.getAttribute("data-is-bold") == "true";
                marks.isItalic = spanNode.getAttribute("data-is-italic") == "true";
                marks.isUnderlined = spanNode.getAttribute("data-is-underlined") == "true";
                marks.isStrikethrough = spanNode.getAttribute("data-is-strikethrough") == "true";
                marks.isSuperscript = spanNode.getAttribute("data-is-superscript") == "true";
                marks.isSubscript = spanNode.getAttribute("data-is-subscript") == "true";
            }

            if (node['tagName'] == "B") {
                marks.isBold = true;
            }
            if (node['tagName'] == "I") {
                marks.isItalic = true;
            }
            if (node['tagName'] == "U") {
                marks.isUnderlined = true;
            }
            if (node['tagName'] == "S" || node['tagName'] == "STRIKE") {
                marks.isStrikethrough = true;
            }
            if (node['tagName'] == "SUP") {
                marks.isSuperscript = true;
            }
            if (node['tagName'] == "SUB") {
                marks.isSubscript = true;
            }
        }
        const children: Array<TextNode> = [];

        for (const child of node.childNodes) {
            children.push(this.lex(child));
        }
        return new TextNode(this.observer, '', this.lang, children, marks)
    }
}