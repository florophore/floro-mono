import { User } from "@floro/database/src/entities/User";
import { inject, injectable } from "inversify";
import { LoaderResolverHook, runWithHooks } from "../../ResolverHook";
import RequestCache from "../../../../request/RequestCache";
import { Repository } from "@floro/graphql-schemas/src/generated/main-graphql";
import RepositoryService from "../../../../services/repositories/RepositoryService";
import { BranchState, CommitInfo, CommitState } from "@floro/graphql-schemas/build/generated/main-graphql";
import RepoDataService from "../../../../services/repositories/RepoDataService";

@injectable()
export default class CommitInfoRepositoryLoader extends LoaderResolverHook<
  CommitInfo,
  unknown,
  { currentUser: User | null; cacheKey: string }
> {
  protected requestCache!: RequestCache;
  protected repoDataService!: RepoDataService;

  constructor(
    @inject(RequestCache) requestCache: RequestCache,
    @inject(RepoDataService) repoDataService: RepoDataService
  ) {
    super();
    this.requestCache = requestCache;
    this.repoDataService = repoDataService;
  }

  public run = runWithHooks<
    CommitInfo,
    unknown,
    { currentUser: User | null; cacheKey: string },
    void
  >(
    () => [],
    async (commitInfo: CommitInfo, _, { currentUser, cacheKey }): Promise<void> => {
      const id = commitInfo?.repositoryId;
      if (!id) {
        return;
      }
      const cachedRepo = this.requestCache.getRepo(cacheKey, id as string);
      if (cachedRepo) {
        return;
      }
      const repo = await this.repoDataService.getRepository(id as string);
      if (repo) {
        this.requestCache.setRepo(cacheKey, repo);
      }
    }
  );
}

