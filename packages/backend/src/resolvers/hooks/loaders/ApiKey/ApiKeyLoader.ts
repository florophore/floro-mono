import { inject, injectable } from "inversify";
import { LoaderResolverHook } from "../../ResolverHook";
import RequestCache from "../../../../request/RequestCache";
import ContextFactory from "@floro/database/src/contexts/ContextFactory";
import ApiKeysContext from "@floro/database/src/contexts/api_keys/ApiKeysContext";


@injectable()
export default class ApiKeyLoader extends LoaderResolverHook<unknown, { apiKeyId: string}, {cacheKey: string}> {
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

    public async run(_root, { apiKeyId}, { cacheKey }) {
        const cachedApiKey = this.requestCache.getApiKey(cacheKey, apiKeyId);
        if (cachedApiKey) {
            return;
        }
        const apiKeysContext = await this.contextFactory.createContext(ApiKeysContext);
        const apiKey = await apiKeysContext.getById(apiKeyId);
        if (apiKey) {
            this.requestCache.setApiKey(cacheKey, apiKey);
        }
    }
}