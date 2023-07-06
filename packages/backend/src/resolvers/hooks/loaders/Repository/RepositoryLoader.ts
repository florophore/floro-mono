import { User } from "@floro/database/src/entities/User";
import { inject, injectable } from "inversify";
import { LoaderResolverHook, runWithHooks } from "../../ResolverHook";
import RequestCache from "../../../../request/RequestCache";
import { Repository } from "@floro/graphql-schemas/src/generated/main-graphql";
import RepositoryService from "../../../../services/repositories/RepositoryService";

@injectable()
export default class RepositoryLoader extends LoaderResolverHook<
  any,
  { repositoryId: string },
  { cacheKey: string }
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
    any,
    { repositoryId: string },
    { cacheKey: string },
    void
  >(
    () => [],
    async (object, args, { cacheKey }): Promise<void> => {
      const repoId = object?.['repositoryId'] ?? args.repositoryId;
      if (!repoId) {
        return;
      }
      const cachedRepo = this.requestCache.getRepo(cacheKey, repoId);
      if (cachedRepo) {
        return;
      }
      const repo = await this.repositoryService.getRepository(repoId);
      if (repo) {
        this.requestCache.setRepo(cacheKey, repo);
      }
    }
  );
}
