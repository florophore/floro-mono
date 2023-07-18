
import { inject, injectable } from "inversify";
import { LoaderResolverHook, runWithHooks } from "../../ResolverHook";
import RequestCache from "../../../../request/RequestCache";
import ContextFactory from "@floro/database/src/contexts/ContextFactory";
import MergeRequestCommentsContext from "@floro/database/src/contexts/merge_requests/MergeRequestCommentsContext";
import { MergeRequest, User } from "@floro/graphql-schemas/build/generated/main-graphql";
import { MergeRequest as DBMergeRequest } from "@floro/database/src/entities/MergeRequest";
import { User as DBUser } from "@floro/database/src/entities/User";
import MergeRequestService from "../../../../services/merge_requests/MergeRequestService";
import RootRepositoryLoader from "../Root/RepositoryID/RepositoryLoader";

@injectable()
export default class MergeRequestPermissionsLoader extends LoaderResolverHook<
  MergeRequest,
  unknown,
  { cacheKey: string, currentUser?: User|null }
> {
  protected requestCache!: RequestCache;
  protected contextFactory!: ContextFactory;
  protected mergeRequestService!: MergeRequestService;
  protected repositoryLoader!: RootRepositoryLoader;


  constructor(
    @inject(RequestCache) requestCache: RequestCache,
    @inject(MergeRequestService) mergeRequestService: MergeRequestService,
    @inject(RootRepositoryLoader) repositoryLoader: RootRepositoryLoader,
    @inject(ContextFactory) contextFactory: ContextFactory
  ) {
    super();
    this.requestCache = requestCache;
    this.contextFactory = contextFactory;
    this.repositoryLoader = repositoryLoader;
    this.mergeRequestService = mergeRequestService;
  }

  public run = runWithHooks<
    MergeRequest,
    unknown,
    { cacheKey: string, currentUser?: User|null },
    void
  >(
    () => [
        this.repositoryLoader
    ],
    async (mergeRequest, _, { cacheKey, currentUser }): Promise<void> => {
      if (!mergeRequest?.id || !currentUser?.id) {
        return;
      }
      const dbMergeRequest = mergeRequest as DBMergeRequest;
      const cachedRepository = this.requestCache.getRepo(cacheKey, dbMergeRequest.repositoryId);
      const cachedPermission = await this.requestCache.getMergeRequestPermissions(cacheKey, mergeRequest?.id);
      if (cachedPermission) {
        return;
      }
      const permissions =
        await this.mergeRequestService.getMergeRequestPermissions(
          dbMergeRequest,
          cachedRepository,
          currentUser as DBUser
        );
      if (permissions) {
        this.requestCache.setMergeRequestPermissions(cacheKey, mergeRequest?.id, permissions);
      }
    }
  );
}