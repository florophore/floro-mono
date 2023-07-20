import { User } from "@floro/database/src/entities/User";
import { inject, injectable } from "inversify";
import { LoaderResolverHook, runWithHooks } from "../../ResolverHook";
import RequestCache from "../../../../request/RequestCache";
import { Repository } from "@floro/graphql-schemas/src/generated/main-graphql";
import RepositoryService from "../../../../services/repositories/RepositoryService";
import { BranchState, CommitInfo, CommitState, MergeRequest, ProtectedBranchRule } from "@floro/graphql-schemas/build/generated/main-graphql";

@injectable()
export default class RepositoryCommitsLoader extends LoaderResolverHook<
  Repository|BranchState|CommitState|CommitInfo|MergeRequest|ProtectedBranchRule,
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
      const commits = await this.repositoryService.getCommits(id as string) ?? [];
      if (commits) {
        this.requestCache.setRepoCommits(cacheKey, id as string, commits);
      }
    }
  );
}
