import { User } from "@floro/database/src/entities/User";
import { inject, injectable } from "inversify";
import { LoaderResolverHook, runWithHooks } from "../../../ResolverHook";
import { Repository } from "@floro/graphql-schemas/src/generated/main-graphql";
import { BranchState, CommitState, MergeRequest } from "@floro/graphql-schemas/build/generated/main-graphql";
import RepoRBACService from "../../../../../services/repositories/RepoRBACService";
import RepositoryService from "../../../../../services/repositories/RepositoryService";
import RequestCache from "../../../../../request/RequestCache";

@injectable()
export default class RootRepositoryRemoteSettingsLoader extends LoaderResolverHook<
  unknown,
  {repositoryId: string},
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
    unknown,
    {repositoryId: string},
    { currentUser: User | null; cacheKey: string },
    void
  >(
    () => [
    ],
    async (_, {repositoryId}, { currentUser, cacheKey }): Promise<void> => {
      if (!repositoryId) {
        return;
      }
      const cachedRemoteSettings = this.requestCache.getRepoRemoteSettings(cacheKey, repositoryId);
      if (cachedRemoteSettings) {
        return;
      }
      const remoteSettings = await this.repositoryService.fetchRepoSettingsForUser(repositoryId, currentUser);
      if (remoteSettings) {
        this.requestCache.setRepoRemoteSettings(cacheKey, repositoryId, remoteSettings);
      }
    }
  );
}
