import EditorLexer from "../EditorLexer";
import Observer from "../Observer";
import ListNode from "../nodes/ListNode";
import OrderedListNode from "../nodes/OrderedListNode";
import RootNode from "../nodes/RootNode";
import TextNode from "../nodes/TextNode";
import UnOrderedListNode from "../nodes/UnOrderedListNode";

export default class TextNodeLexer extends EditorLexer<ChildNode, TextNode> {

    public lang: string;
    public observer: Observer;

    constructor(observer: Observer, lang: string) {
        super();
        this.observer = observer;
        this.lang = lang;
    }

    public lex(node: ChildNode, parentNode: RootNode|TextNode): TextNode {
        if (node['tagName'] == "BR") {
            return new TextNode(parentNode, this.observer, '\n', this.lang, []);
        }
        if (node.nodeType == 3) {
            return new TextNode(parentNode, this.observer, node?.textContent ?? '', this.lang, []);
        }
        if (node.childNodes.length == 0) {

            if (node.nodeType == 1 && node['tagName'] == "OL") {
                return new OrderedListNode(parentNode as TextNode, this.observer, '', this.lang, [])
            }
            if (node.nodeType == 1 && node['tagName'] == "UL") {
                return new UnOrderedListNode(parentNode, this.observer, '', this.lang, [])
            }
            if (node.nodeType == 1 && node['tagName'] == "LI") {
                return new ListNode(parentNode as TextNode, this.observer, '', this.lang, [])
            }
            return new TextNode(parentNode, this.observer, '', this.lang, []);
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

        if (node.nodeType == 1 && node['tagName'] == "OL") {
            const olNode = new OrderedListNode(parentNode as TextNode, this.observer, '', this.lang, children, marks);
            for (const child of node.childNodes) {
                children.push(this.lex(child, olNode));
            }
            return olNode;
        }
        if (node.nodeType == 1 && node['tagName'] == "UL") {
            const ulNode = new UnOrderedListNode(parentNode, this.observer, '', this.lang, children, marks)
            for (const child of node.childNodes) {
                children.push(this.lex(child, ulNode));
            }
            return ulNode;
        }
        if (node.nodeType == 1 && node['tagName'] == "LI") {
            const liNode = new ListNode(parentNode as TextNode, this.observer, '', this.lang, children, marks)
            for (const child of node.childNodes) {
                children.push(this.lex(child, liNode));
            }
            return liNode;
        }
        const textNode = new TextNode(parentNode, this.observer, '', this.lang, children, marks)
        for (const child of node.childNodes) {
            children.push(this.lex(child, textNode));
        }
        return textNode
    }
}