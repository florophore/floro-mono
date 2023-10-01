export default class Observer {
    public variables: string[];
    public linkVariables: string[];
    public interpolationVariants: string[];
    public mentionedTerms: string[];

    constructor(
        variables?: string[],
        linkVariables?: string[],
        interpolationVariants?: string[],
        mentionedTerms?: string[],
    ) {
        this.variables = variables ?? [];
        this.linkVariables = linkVariables ?? [];
        this.interpolationVariants = interpolationVariants ?? [];
        this.mentionedTerms = mentionedTerms ?? [];
    }

    public getAllTags() {
        return [...this.variables, ...this.linkVariables, ...this.interpolationVariants];
    }

    public getVariableRemapSet() {
        return new Set(this.variables.map(tag => `{${tag}}`))
    }

    public getInterpolationVariantRemapSet() {
        return new Set(this.interpolationVariants.map(tag => `{${tag}}`))
    }

    public getLinkVairablesRemapSet() {
        return new Set(this.linkVariables.map(tag => `{${tag}}`))
    }

    public getMentionedTerms() {
        return this.mentionedTerms.sort((a, b) => b.length - a.length)?.map(t => t?.toLowerCase());
    }
}