import Cursor from "./Cursor";
import Node, { NodeJSON } from "./Node";
import Observer from "./Observer";
import RootNodeLexer from "./lexers/RootNodeLexer";
import TextNodeLexer from "./lexers/TextNodeLexer";
import RootNode from "./nodes/RootNode";

export default class DocumentTree {

    public textNodeLexer: TextNodeLexer;
    public rootNodeLexer: RootNodeLexer;
    public cursor: Cursor;
    public observer: Observer;
    public lang: string;

    public rootNode: RootNode;
    constructor(
        lang: string,
        observer: Observer,
        cursor: Cursor,
        textNodeLexer: TextNodeLexer,
        rootNodeLexer: RootNodeLexer,
    ) {
        this.cursor = cursor;
        this.observer = observer;
        this.lang = lang;
        this.rootNode = new RootNode(observer, '', lang, []);
        this.rootNodeLexer = rootNodeLexer;
        this.textNodeLexer = textNodeLexer;
    }

    public updateRootFromHTML(htmlString: string) {
        const nextRootNode = this.rootNodeLexer.lex(htmlString);
        nextRootNode.flatten(null);
        nextRootNode.expand(null);
        this.rootNode = nextRootNode;
    }

    public updateRootFromNode(rootNodeJson: NodeJSON) {
        const nextRootNode: RootNode = RootNode.fromJSON(
          rootNodeJson,
          this.observer,
          this.lang
        );
        nextRootNode.flatten(null);
        nextRootNode.expand(null);
        this.rootNode = nextRootNode;
    }

    public getHtml() {
        return this.rootNode.toHTMLString();
    }
}