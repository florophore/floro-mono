import Cursor from "./Cursor";
import DocumentTree from "./DocumentTree";
import Observer from "./Observer";
import RootNodeLexer from "./lexers/RootNodeLexer";
import TextNodeLexer from "./lexers/TextNodeLexer";

export default class EditorDocument {
  public cursor: Cursor;

  public textNodeLexer: TextNodeLexer;
  public rootNodeLexer: RootNodeLexer;
  public tree: DocumentTree;
  public observer: Observer;
  public lang: string;

  constructor(observer: Observer, lang?: string) {
    this.cursor = new Cursor();
    this.observer = observer;
    this.textNodeLexer = new TextNodeLexer(observer, lang ?? "en");
    this.rootNodeLexer = new RootNodeLexer(observer, lang ?? "en", this.textNodeLexer);
    this.tree = new DocumentTree(
      lang ?? "en",
      observer,
      this.cursor,
      this.textNodeLexer,
      this.rootNodeLexer
    );
    this.lang = lang ?? "en";
  }
}
