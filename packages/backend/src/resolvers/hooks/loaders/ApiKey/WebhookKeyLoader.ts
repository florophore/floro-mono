import { inject, injectable } from "inversify";
import { LoaderResolverHook } from "../../ResolverHook";
import RequestCache from "../../../../request/RequestCache";
import ContextFactory from "@floro/database/src/contexts/ContextFactory";
import ApiKeysContext from "@floro/database/src/contexts/api_keys/ApiKeysContext";
import WebhookKeysContext from "@floro/database/src/contexts/api_keys/WebhookKeysContext";


@injectable()
export default class WebhookKeyLoader extends LoaderResolverHook<unknown, { webhookKeyId: string}, {cacheKey: string}> {
    protected requestCache!: RequestCache;
    private contextFactory!: ContextFactory;

    constructor(
      @inject(ContextFactory) contextFactory: ContextFactory,
      @inject(RequestCache) requestCache: RequestCache
    ) {
        super();
        this.contextFactory = contextFactory;
        this.requestCache = requestCache;
    }

    public async run(_root, { webhookKeyId}, { cacheKey }) {
        const cachedApiKey = this.requestCache.getWebhookKey(cacheKey, webhookKeyId);
        if (cachedApiKey) {
            return;
        }
        const webhookKeysContext = await this.contextFactory.createContext(WebhookKeysContext);
        const webhookKey = await webhookKeysContext.getById(webhookKeyId);
        if (webhookKey) {
            this.requestCache.setWebhookKey(cacheKey, webhookKey);
        }
    }
}