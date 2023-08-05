import { inject, injectable } from "inversify";
import { LoaderResolverHook, runWithHooks } from "../../ResolverHook";
import RequestCache from "../../../../request/RequestCache";
import ContextFactory from "@floro/database/src/contexts/ContextFactory";
import { Repository } from "@floro/graphql-schemas/build/generated/main-graphql";
import MergeRequestsContext from "@floro/database/src/contexts/merge_requests/MergeRequestsContext";
import { User } from "@floro/database/src/entities/User";

@injectable()
export default class UserClosedMergeRequestsLoader extends LoaderResolverHook<
  Repository,
  unknown,
  { cacheKey: string, currentUser?: User|null|undefined }
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
    { cacheKey: string, currentUser?: User|null|undefined },
    void
  >(
    () => [],
    async (repository, _, { cacheKey, currentUser }): Promise<void> => {
      if (!currentUser?.id) {
        return;
      }
      if (!repository?.id) {
        return;
      }
      const cachedMergeRequests = this.requestCache.getUserClosedRepoMergeRequests(cacheKey, repository.id);
      if (cachedMergeRequests) {
        return;
      }
      const mergeRequestsContext = await this.contextFactory.createContext(MergeRequestsContext);
      const openMergeRequests = await mergeRequestsContext.getAllClosedMergeRequestsForUser(repository.id, currentUser?.id);
      if (openMergeRequests) {
        this.requestCache.setUserClosedRepoMergeRequests(cacheKey, repository.id, openMergeRequests);
      }
    }
  );
}