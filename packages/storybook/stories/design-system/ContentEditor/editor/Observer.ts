export default class Observer {
    public variables: string[];
    public linkVariables: string[];
    public interpolationVariants: string[];

    constructor(
        variables?: string[],
        linkVariables?: string[],
        interpolationVariants?: string[],
    ) {
        this.variables = variables ?? [];
        this.linkVariables = linkVariables ?? [];
        this.interpolationVariants = interpolationVariants ?? [];
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
}