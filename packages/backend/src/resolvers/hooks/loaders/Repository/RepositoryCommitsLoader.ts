import { User } from "@floro/database/src/entities/User";
import { inject, injectable } from "inversify";
import { LoaderResolverHook, runWithHooks } from "../../ResolverHook";
import RequestCache from "../../../../request/RequestCache";
import { Repository } from "@floro/graphql-schemas/src/generated/main-graphql";
import RepositoryService from "../../../../services/repositories/RepositoryService";
import { BranchState, CommitInfo, CommitState, MergeRequest, ProtectedBranchRule } from "@floro/graphql-schemas/build/generated/main-graphql";
import RepoDataService from "../../../../services/repositories/RepoDataService";

@injectable()
export default class RepositoryCommitsLoader extends LoaderResolverHook<
  Repository|BranchState|CommitState|CommitInfo|MergeRequest|ProtectedBranchRule,
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
    Repository|BranchState|CommitState|CommitInfo|MergeRequest|ProtectedBranchRule,
    unknown,
    { currentUser: User | null; cacheKey: string },
    void
  >(
    () => [],
    async (object: Repository|BranchState|CommitState|CommitInfo|MergeRequest|ProtectedBranchRule, _, { currentUser, cacheKey }): Promise<void> => {
      const id = object?.['repositoryId'] ?? object?.['id'];
      if (!id) {
        return;
      }
      const cachedCommits = this.requestCache.getRepoCommits(cacheKey, id as string);
      if (cachedCommits) {
        return;
      }
      const commits = await this.repoDataService.getCommits(id as string) ?? [];
      if (commits) {
        this.requestCache.setRepoCommits(cacheKey, id as string, commits);
      }
    }
  );
}
