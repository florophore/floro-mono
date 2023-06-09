import { User } from "@floro/database/src/entities/User";
import { inject, injectable } from "inversify";
import { LoaderResolverHook, runWithHooks } from "../../ResolverHook";
import RequestCache from "../../../../request/RequestCache";
import { Repository } from "@floro/graphql-schemas/src/generated/main-graphql";
import RepositoryService from "../../../../services/repositories/RepositoryService";

@injectable()
export default class RepositoryBranchesLoader extends LoaderResolverHook<
  Repository,
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
    Repository,
    unknown,
    { currentUser: User | null; cacheKey: string },
    void
  >(
    () => [],
    async (repository: Repository, _, { currentUser, cacheKey }): Promise<void> => {
      if (!repository?.id) {
        return;
      }
      const cachedBranches = this.requestCache.getRepoBranches(cacheKey, repository.id as string);
      if (cachedBranches) {
        return;
      }
      const branches = await this.repositoryService.getBranches(repository.id as string) ?? [];
      if (branches) {
        this.requestCache.setRepoBranches(cacheKey, repository.id as string, branches);
      }
    }
  );
}
