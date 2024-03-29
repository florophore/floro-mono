import { User } from "@floro/database/src/entities/User";
import { inject, injectable } from "inversify";
import { LoaderResolverHook, runWithHooks } from "../../ResolverHook";
import RequestCache from "../../../../request/RequestCache";
import { Repository } from "@floro/graphql-schemas/src/generated/main-graphql";
import RepositoryService from "../../../../services/repositories/RepositoryService";
import { MergeRequest } from "@floro/graphql-schemas/build/generated/main-graphql";
import RepoDataService from "../../../../services/repositories/RepoDataService";

@injectable()
export default class RepositoryBranchesLoader extends LoaderResolverHook<
  Repository|MergeRequest,
  unknown,
  { currentUser: User | null; cacheKey: string }
> {
  protected requestCache!: RequestCache;
  protected repoDataService!: RepoDataService;
  //protected branches: Array<FloroBranch>

  constructor(
    @inject(RequestCache) requestCache: RequestCache,
    @inject(RepoDataService) repoDataService: RepoDataService
  ) {
    super();
    this.requestCache = requestCache;
    this.repoDataService = repoDataService;
  }

  public run = runWithHooks<
    Repository|MergeRequest,
    unknown,
    { currentUser: User | null; cacheKey: string },
    void
  >(
    () => [],
    async (object: Repository|MergeRequest, _, { currentUser, cacheKey }): Promise<void> => {
      const repoId = object?.['repositoryId'] ?? object?.['id'];
      if (!repoId) {
        return;
      }
      const cachedBranches = this.requestCache.getRepoBranches(cacheKey, repoId as string);
      if (cachedBranches) {
        return;
      }
      const branches = await this.repoDataService.getBranches(repoId as string) ?? [];
      if (branches) {
        this.requestCache.setRepoBranches(cacheKey, repoId as string, branches);
      }
    }
  );
}
