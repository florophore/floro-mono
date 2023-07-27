import { User } from "@floro/database/src/entities/User";
import { inject, injectable } from "inversify";
import { LoaderResolverHook, runWithHooks } from "../../ResolverHook";
import RequestCache from "../../../../request/RequestCache";
import { Repository } from "@floro/graphql-schemas/src/generated/main-graphql";
import RepositoryService from "../../../../services/repositories/RepositoryService";
import RepoRBACService from "../../../../services/repositories/RepoRBACService";
import { BranchState, CommitState, MergeRequest, ProtectedBranchRule } from "@floro/graphql-schemas/build/generated/main-graphql";
import RepoDataService from "../../../../services/repositories/RepoDataService";

@injectable()
export default class RepositoryRemoteSettingsArgsLoader extends LoaderResolverHook<
  unknown,
  {repositoryId: string},
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
      const remoteSettings = await this.repoDataService.fetchRepoSettingsForUser(id, currentUser);
      if (remoteSettings) {
        this.requestCache.setRepoRemoteSettings(cacheKey, id, remoteSettings);
      }
    }
  );
}
