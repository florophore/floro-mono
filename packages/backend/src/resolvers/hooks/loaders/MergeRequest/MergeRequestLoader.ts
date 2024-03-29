import { inject, injectable } from "inversify";
import { LoaderResolverHook, runWithHooks } from "../../ResolverHook";
import RequestCache from "../../../../request/RequestCache";
import ContextFactory from "@floro/database/src/contexts/ContextFactory";
import MergeRequestsContext from "@floro/database/src/contexts/merge_requests/MergeRequestsContext";

@injectable()
export default class MergeRequestLoader extends LoaderResolverHook<
  unknown,
  { mergeRequestId: string },
  { cacheKey: string }
> {
  protected requestCache!: RequestCache;
  protected contextFactory!: ContextFactory;

  constructor(
    @inject(RequestCache) requestCache: RequestCache,
    @inject(ContextFactory) contextFactory: ContextFactory
  ) {
    super();
    this.requestCache = requestCache;
    this.contextFactory = contextFactory;
  }

  public run = runWithHooks<
    unknown,
    { mergeRequestId: string },
    { cacheKey: string },
    void
  >(
    () => [],
    async (_, args, { cacheKey }): Promise<void> => {
      const  mergeRequestId = args?.mergeRequestId;
      if (!mergeRequestId) {
        return;
      }
      const cachedMergeRequest = this.requestCache.getMergeRequest(cacheKey, mergeRequestId);
      if (cachedMergeRequest) {
        return;
      }
      const mergeRequestContext = await this.contextFactory.createContext(MergeRequestsContext);
      const mergeRequest = await mergeRequestContext.getById(mergeRequestId);
      if (mergeRequest) {
        this.requestCache.setMergeRequest(cacheKey, mergeRequest);
      }
    }
  );
}

