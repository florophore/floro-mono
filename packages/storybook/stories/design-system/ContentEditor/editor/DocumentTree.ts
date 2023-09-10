import Cursor from "./Cursor";
import RootNodeLexer from "./lexers/RootNodeLexer";
import TextNodeLexer from "./lexers/TextNodeLexer";
import RootNode from "./nodes/RootNode";

export default class DocumentTree {

    public textNodeLexer: TextNodeLexer;
    public rootNodeLexer: RootNodeLexer;
    private cursor: Cursor;

    public rootNode: RootNode;
    constructor(
        cursor: Cursor,
        textNodeLexer: TextNodeLexer,
        rootNodeLexer: RootNodeLexer,
    ) {
        this.cursor = cursor;
        this.rootNode = new RootNode('', []);
        this.rootNodeLexer = rootNodeLexer;
        this.textNodeLexer = textNodeLexer;
    }

    public updateRootFromHTML(htmlString: string) {
        const nextRootNode = this.rootNodeLexer.lex(htmlString);
        nextRootNode.flatten(null);
        nextRootNode.expand(null);
        this.rootNode = nextRootNode;
    }

    public getHtml() {
        return this.rootNode.toHTMLString();
    }
}