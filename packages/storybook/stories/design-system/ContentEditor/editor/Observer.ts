export default class Observer {
    public variables: string[];
    public linkVariables: string[];
    public interpolationVariants: string[];
    public mentionedTerms: string[];
    public contentVariables: string[];
    public styledContents: string[];

    constructor(
        variables?: string[],
        linkVariables?: string[],
        interpolationVariants?: string[],
        mentionedTerms?: string[],
        contentVariables?: string[],
        styledContents?: string[],
    ) {
        this.variables = variables ?? [];
        this.linkVariables = linkVariables ?? [];
        this.interpolationVariants = interpolationVariants ?? [];
        this.mentionedTerms = mentionedTerms ?? [];
        this.contentVariables = contentVariables ?? [];
        this.styledContents = styledContents ?? [];
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

    public getVariableRemapSet() {
        return new Set(this.variables.map(tag => `{${tag}}`))
    }

    public getContentVariableRemapSet() {
        return new Set(this.contentVariables.map(tag => `{${tag}}`))
    }

    public getStyledContentsRemapSet() {
        return new Set(this.styledContents.map(tag => `{${tag}}`))
    }

    public getInterpolationVariantRemapSet() {
        return new Set(this.interpolationVariants.map(tag => `{${tag}}`))
    }

    public getLinkVariablesRemapSet() {
        return new Set(this.linkVariables.map(tag => `{${tag}}`))
    }

    public getMentionedTerms() {
        return this.mentionedTerms.sort((a, b) => b.length - a.length)?.map(t => t?.toLowerCase());
    }
}