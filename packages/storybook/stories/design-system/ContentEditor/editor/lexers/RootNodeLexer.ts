import EditorLexer from "../EditorLexer";
import Observer from "../Observer";
import RootNode from "../nodes/RootNode";
import TextNode from "../nodes/TextNode";
import TextNodeLexer from "./TextNodeLexer";

export default class RootNodeLexer extends EditorLexer<string, RootNode> {
    public textNodeLexer: TextNodeLexer;
    public observer: Observer;
    public lang: string;

    constructor(observer: Observer, lang: string, textNodeLexer: TextNodeLexer) {
        super();
        this.textNodeLexer = textNodeLexer;
        this.observer = observer;
        this.lang = lang;
    }

    public lex(rawHtml: string): RootNode {
        const div = document.createElement('div');
        div.innerHTML = rawHtml;
        const children: Array<TextNode> = [];
        for (const child of div.childNodes) {
            const nodeChild = this.textNodeLexer.lex(child);
            children.push(nodeChild);
        }
        const rootNode = new RootNode(this.observer, '', this.lang, children);
        return rootNode;
    }
}