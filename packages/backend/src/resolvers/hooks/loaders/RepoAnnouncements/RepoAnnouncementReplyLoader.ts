import { inject, injectable } from "inversify";
import { LoaderResolverHook, runWithHooks } from "../../ResolverHook";
import RequestCache from "../../../../request/RequestCache";
import ContextFactory from "@floro/database/src/contexts/ContextFactory";
import RepoAnnouncementRepliesContext from "@floro/database/src/contexts/announcements/RepoAnnouncementRepliesContext";

@injectable()
export default class RepoAnnouncementReplyLoader extends LoaderResolverHook<
  unknown,
  { repoAnnouncementReplyId: string },
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
    { repoAnnouncementReplyId: string },
    { cacheKey: string },
    void
  >(
    () => [],
    async (_, { repoAnnouncementReplyId }, { cacheKey }): Promise<void> => {
      if (!repoAnnouncementReplyId) {
        return;
      }
      const cachedRepoAnnouncementReply = this.requestCache.getRepoAnnouncementReply(cacheKey, repoAnnouncementReplyId);
      if (cachedRepoAnnouncementReply) {
        return;
      }
      const repoAnnouncementRepliesContext = await this.contextFactory.createContext(RepoAnnouncementRepliesContext);
      const repoAnnouncementReply = await repoAnnouncementRepliesContext.getById(repoAnnouncementReplyId);
      if (repoAnnouncementReply) {
        this.requestCache.setRepoAnnouncementReply(cacheKey, repoAnnouncementReplyId, repoAnnouncementReply);
      }
    }
  );
}