import Node from "./Node";
export default abstract class EditorLexer<T, U extends Node> {

    public abstract lex(htmlStr: T, node: Node): U;
}