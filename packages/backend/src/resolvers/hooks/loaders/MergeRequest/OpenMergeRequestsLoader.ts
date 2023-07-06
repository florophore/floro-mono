import { inject, injectable } from "inversify";
import { LoaderResolverHook, runWithHooks } from "../../ResolverHook";
import RequestCache from "../../../../request/RequestCache";
import ContextFactory from "@floro/database/src/contexts/ContextFactory";
import { Repository } from "@floro/graphql-schemas/build/generated/main-graphql";
import MergeRequestsContext from "@floro/database/src/contexts/merge_requests/MergeRequestsContext";

@injectable()
export default class OpenMergeRequestsLoader extends LoaderResolverHook<
  Repository,
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
    Repository,
    unknown,
    { cacheKey: string },
    void
  >(
    () => [],
    async (repository, _, { cacheKey }): Promise<void> => {
      if (!repository?.id) {
        return;
      }
      const cachedMergeRequests = this.requestCache.getOpenRepoMergeRequests(cacheKey, repository.id);
      if (cachedMergeRequests) {
        return;
      }
      const mergeRequestsContext = await this.contextFactory.createContext(MergeRequestsContext);
      const openMergeRequests = await mergeRequestsContext.getAllOpenMergeRequests(repository.id);
      if (openMergeRequests) {
        this.requestCache.setOpenRepoMergeRequests(cacheKey, repository.id, openMergeRequests);
      }
    }
  );
}