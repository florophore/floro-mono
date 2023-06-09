import { User } from "@floro/database/src/entities/User";
import { inject, injectable } from "inversify";
import { LoaderResolverHook, runWithHooks } from "../../ResolverHook";
import RequestCache from "../../../../request/RequestCache";
import { Repository } from "@floro/graphql-schemas/src/generated/main-graphql";
import RepositoryService from "../../../../services/repositories/RepositoryService";

@injectable()
export default class RepositoryLoader extends LoaderResolverHook<
  { repositoryId: string },
  unknown,
  { currentUser: User | null; cacheKey: string }
> {
  protected requestCache!: RequestCache;
  protected repositoryService!: RepositoryService;
  //protected branches: Array<FloroBranch>

  constructor(
    @inject(RequestCache) requestCache: RequestCache,
    @inject(RepositoryService) repositoryService: RepositoryService
  ) {
    super();
    this.requestCache = requestCache;
    this.repositoryService = repositoryService;
  }

  public run = runWithHooks<
    { repositoryId: string },
    unknown,
    { currentUser: User | null; cacheKey: string },
    void
  >(
    () => [],
    async ({ repositoryId }, _, { currentUser, cacheKey }): Promise<void> => {
      if (!repositoryId) {
        return;
      }
      const cachedRepo = this.requestCache.getRepo(cacheKey, repositoryId);
      if (cachedRepo) {
        return;
      }
      const repo = await this.repositoryService.getRepository(repositoryId);
      if (repo) {
        this.requestCache.setRepo(cacheKey, repo);
      }
    }
  );
}
