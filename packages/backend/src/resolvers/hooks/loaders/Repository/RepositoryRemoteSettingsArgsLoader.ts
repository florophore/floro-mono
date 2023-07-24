import { User } from "@floro/database/src/entities/User";
import { inject, injectable } from "inversify";
import { LoaderResolverHook, runWithHooks } from "../../ResolverHook";
import RequestCache from "../../../../request/RequestCache";
import { Repository } from "@floro/graphql-schemas/src/generated/main-graphql";
import RepositoryService from "../../../../services/repositories/RepositoryService";
import RepoRBACService from "../../../../services/repositories/RepoRBACService";
import { BranchState, CommitState, MergeRequest, ProtectedBranchRule } from "@floro/graphql-schemas/build/generated/main-graphql";

@injectable()
export default class RepositoryRemoteSettingsArgsLoader extends LoaderResolverHook<
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
    { repositoryId: string},
    { currentUser: User | null; cacheKey: string },
    void
  >(
    () => [],
    async (_, args, { currentUser, cacheKey }): Promise<void> => {
      const id = args['repositoryId'];
      if (!id) {
        return;
      }
      const cachedRemoteSettings = this.requestCache.getRepoRemoteSettings(cacheKey, id);
      if (cachedRemoteSettings) {
        return;
      }
      const remoteSettings = await this.repositoryService.fetchRepoSettingsForUser(id, currentUser);
      if (remoteSettings) {
        this.requestCache.setRepoRemoteSettings(cacheKey, id, remoteSettings);
      }
    }
  );
}
