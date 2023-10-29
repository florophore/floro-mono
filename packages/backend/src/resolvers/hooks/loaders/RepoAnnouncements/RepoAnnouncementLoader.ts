import { inject, injectable } from "inversify";
import { LoaderResolverHook, runWithHooks } from "../../ResolverHook";
import RequestCache from "../../../../request/RequestCache";
import ContextFactory from "@floro/database/src/contexts/ContextFactory";
import RepoAnnouncementsContext from "@floro/database/src/contexts/announcements/RepoAnnouncementsContext";

@injectable()
export default class RepoAnnouncementLoader extends LoaderResolverHook<
  unknown,
  { repoAnnouncementId: string },
  { cacheKey: string }
> {
  protected requestCache!: RequestCache;
  protected contextFactory!: ContextFactory;

  constructor(
    @inject(RequestCache) requestCache: RequestCache,
    @inject(ContextFactory) contextFactory: ContextFactory
  ) {
    super();
    this.requestCache = requestCache;
    this.contextFactory = contextFactory;
  }

  public run = runWithHooks<
    unknown,
    { repoAnnouncementId: string },
    { cacheKey: string },
    void
  >(
    () => [],
    async (_, { repoAnnouncementId }, { cacheKey }): Promise<void> => {
      if (!repoAnnouncementId) {
        return;
      }
      const cachedRepoAnnouncement = this.requestCache.getRepoAnnouncement(cacheKey, repoAnnouncementId);
      if (cachedRepoAnnouncement) {
        return;
      }
      const repoAnnouncementsContext = await this.contextFactory.createContext(RepoAnnouncementsContext);
      const repoAnnouncement = await repoAnnouncementsContext.getByIdWithRelations(repoAnnouncementId);
      if (repoAnnouncement) {
        this.requestCache.setRepoAnnouncement(cacheKey, repoAnnouncementId, repoAnnouncement);
      }
    }
  );
}