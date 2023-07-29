import { inject, injectable } from "inversify";
import { LoaderResolverHook, runWithHooks } from "../../ResolverHook";
import RequestCache from "../../../../request/RequestCache";
import ContextFactory from "@floro/database/src/contexts/ContextFactory";
import MergeRequestCommentsContext from "@floro/database/src/contexts/merge_requests/MergeRequestCommentsContext";
import { MergeRequest } from "@floro/graphql-schemas/src/generated/main-graphql";

@injectable()
export default class MergeRequestCommentsLoader extends LoaderResolverHook<
  MergeRequest,
  unknown,
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
    MergeRequest,
    unknown,
    { cacheKey: string },
    void
  >(
    () => [],
    async (mergeRequest, _, { cacheKey }): Promise<void> => {
      if (!mergeRequest?.id) {
        return;
      }
      const cachedMergeRequestComments = this.requestCache.getMergeRequestComments(cacheKey, mergeRequest.id);
      if (cachedMergeRequestComments) {
        return;
      }
      const mergeRequestCommentsContext = await this.contextFactory.createContext(MergeRequestCommentsContext);
      const mergeRequestComments = await mergeRequestCommentsContext.getMergeRequestComments(mergeRequest.id);
      if (mergeRequestComments) {
        this.requestCache.setMergeRequestComments(cacheKey, mergeRequest.id, mergeRequestComments);
      }
    }
  );
}