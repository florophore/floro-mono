import TextNode from "./nodes/TextNode";

export default class Observer {
    public variables: string[];
    public linkVariables: string[];
    public interpolationVariants: string[];
    public mentionedTerms: string[];
    public contentVariables: string[];
    public styledContents: string[];
    public searchString: string = "";

    constructor(
        variables?: string[],
        linkVariables?: string[],
        interpolationVariants?: string[],
        mentionedTerms?: string[],
        contentVariables?: string[],
        styledContents?: string[],
        searchString?: string
    ) {
        this.variables = variables ?? [];
        this.linkVariables = linkVariables ?? [];
        this.interpolationVariants = interpolationVariants ?? [];
        this.mentionedTerms = mentionedTerms ?? [];
        this.contentVariables = contentVariables ?? [];
        this.styledContents = styledContents ?? [];
        this.searchString = searchString ?? "";
    }

    public getAllTags() {
        return [
          ...this.variables,
          ...this.linkVariables,
          ...this.interpolationVariants,
          ...this.contentVariables,
          ...this.styledContents,
        ];
    }

    public setSearchString(searchString: string) {
        this.searchString = searchString;
    }

    public getVariableRemapSet() {
        return new Set(this.variables.map(tag => `{${tag}}`).map(TextNode.unescapedStr))
    }

    public getContentVariableRemapSet() {
        return new Set(this.contentVariables.map(tag => `{${tag}}`).map(TextNode.unescapedStr))
    }

    public getStyledContentsRemapSet() {
        return new Set(this.styledContents.map(tag => `{${tag}}`).map(TextNode.unescapedStr))
    }

    public getInterpolationVariantRemapSet() {
        return new Set(this.interpolationVariants.map(tag => `{${tag}}`).map(TextNode.unescapedStr))
    }

    public getLinkVariablesRemapSet() {
        return new Set(this.linkVariables.map(tag => `{${tag}}`).map(TextNode.unescapedStr))
    }

    public getMentionedTerms() {
        return this.mentionedTerms.sort((a, b) => b.length - a.length)?.map(t => t?.toLowerCase())?.map(TextNode.unescapedStr);
    }
}