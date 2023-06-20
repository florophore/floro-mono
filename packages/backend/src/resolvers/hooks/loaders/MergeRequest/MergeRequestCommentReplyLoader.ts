import { inject, injectable } from "inversify";
import { LoaderResolverHook, runWithHooks } from "../../ResolverHook";
import RequestCache from "../../../../request/RequestCache";
import ContextFactory from "@floro/database/src/contexts/ContextFactory";
import MergeRequestCommentsContext from "@floro/database/src/contexts/merge_requests/MergeRequestCommentsContext";
import MergeRequestCommentRepliesContext from "@floro/database/src/contexts/merge_requests/MergeRequestCommentRepliesContext";

@injectable()
export default class MergeRequestCommentReplyLoader extends LoaderResolverHook<
  { mergeRequestCommentReplyId: string },
  unknown,
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
    { mergeRequestCommentReplyId: string },
    unknown,
    { cacheKey: string },
    void
  >(
    () => [],
    async ({ mergeRequestCommentReplyId }, _, { cacheKey }): Promise<void> => {
      if (!mergeRequestCommentReplyId) {
        return;
      }
      const cachedMergeRequestCommentReply = this.requestCache.getMergeRequestComment(cacheKey, mergeRequestCommentReplyId);
      if (cachedMergeRequestCommentReply) {
        return;
      }
      const mergeRequestCommentRepliesContext = await this.contextFactory.createContext(MergeRequestCommentRepliesContext);
      const mergeRequestCommentReply = await mergeRequestCommentRepliesContext.getById(mergeRequestCommentReplyId);
      if (mergeRequestCommentReply) {
        this.requestCache.setMergeRequestCommentReply(cacheKey, mergeRequestCommentReply);
      }
    }
  );
}

