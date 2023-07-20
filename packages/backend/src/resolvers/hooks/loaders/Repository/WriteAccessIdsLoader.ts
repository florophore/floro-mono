
import { User } from "@floro/database/src/entities/User";
import { inject, injectable } from "inversify";
import { LoaderResolverHook, runWithHooks } from "../../ResolverHook";
import RequestCache from "../../../../request/RequestCache";
import { Repository } from "@floro/graphql-schemas/src/generated/main-graphql";
import RepositoryService from "../../../../services/repositories/RepositoryService";
import RepoSettingsService from "../../../../services/repositories/RepoSettingsService";
import RepoRBACService from "../../../../services/repositories/RepoRBACService";
import { BranchState, CommitState, MergeRequest, ProtectedBranchRule } from "@floro/graphql-schemas/build/generated/main-graphql";
import ContextFactory from "@floro/database/src/contexts/ContextFactory";
import RepositoriesContext from "@floro/database/src/contexts/repositories/RepositoriesContext";

@injectable()
export default class WriteAccessIdsLoader extends LoaderResolverHook<
  Repository|CommitState|BranchState|MergeRequest|ProtectedBranchRule,
  unknown,
  { currentUser: User | null; cacheKey: string }
> {
  protected requestCache!: RequestCache;
  protected contextFactory!: ContextFactory;
  protected repoSettingsService!: RepoSettingsService;

  constructor(
    @inject(RequestCache) requestCache: RequestCache,
    @inject(ContextFactory) contextFactory: ContextFactory,
    @inject(RepoSettingsService) repoSettingsService: RepoSettingsService
  ) {
    super();
    this.requestCache = requestCache;
    this.contextFactory = contextFactory;
    this.repoSettingsService = repoSettingsService;
  }

  public run = runWithHooks<
  Repository|CommitState|BranchState|MergeRequest|ProtectedBranchRule,
    unknown,
    { currentUser: User | null; cacheKey: string },
    void
  >(
    () => [],
    async (object: Repository|CommitState|BranchState|MergeRequest|ProtectedBranchRule, _, { cacheKey }): Promise<void> => {
      const id = object['repositoryId'] ?? object['id'];
      if (!id) {
        return;
      }
      const cachedWriteAccessIds = this.requestCache.getRepoWriteAccessIds(cacheKey, id);
      if (cachedWriteAccessIds) {
        return;
      }
      const repositoriesContext = await this.contextFactory.createContext(RepositoriesContext);
      const repo = await repositoriesContext.getById(id);
      if (repo) {
        const writeAccessIds = await this.repoSettingsService.getWriteAccessUserIds(repo);
        const writeSet = new Set(writeAccessIds);
        this.requestCache.setRepoWriteAccessIds(cacheKey, id, writeSet);
      }
    }
  );
}