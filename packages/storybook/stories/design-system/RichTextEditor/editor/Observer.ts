export default class Observer {
    public mentionedLinkTerms: string[];

    constructor(
        mentionedLinkTerms?: string[],
    ) {
        this.mentionedLinkTerms = mentionedLinkTerms ?? [];
    }

    public getMentionedLinkTerms() {
        return this.mentionedLinkTerms.sort((a, b) => b.length - a.length)?.map(t => t?.toLowerCase());
    }
}